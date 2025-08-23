import { Hono } from "hono";
import chalk from "chalk";

const app = new Hono();

// Enable CORS for extension requests
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");

  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }

  await next();
});

// In-memory job storage
const jobs = new Map(); // jobId -> { id, prompt, status, progress, completeMessage, startedAt, finishedAt, color, process, outputHistory }
const outputStreams = new Map(); // jobId -> { chunks: [], lastUpdate: timestamp }

// Parse JSON output to extract human text content
function parseClaudeJsonOutput(jsonLine) {
  try {
    const parsed = JSON.parse(jsonLine);

    if (
      parsed.type === "assistant" &&
      parsed.message?.content?.[0]?.type === "text"
    ) {
      if (Array.isArray(parsed.message.content)) {
        return parsed.message.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("");
      } else if (parsed.message.content[0].text) {
        return parsed.message.content[0].text;
      }
    }

    return null; // No human text content found
  } catch (error) {
    // Not valid JSON, might be plain text - return as is
    return jsonLine;
  }
}

// Process job in background using async iteration
async function processJobInBackground(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    const { proc } = runClaudeProcess(job.prompt, job.options || {});
    const decoder = new TextDecoder();

    // Store process reference for potential termination
    job.process = proc;
    job.outputHistory = []; // Initialize output history
    jobs.set(jobId, job);

    // Initialize output stream for this job
    outputStreams.set(jobId, { chunks: [], lastUpdate: Date.now() });

    // Color functions for different stream types
    const colorize = chalk.hex(job.color);
    const errorColorize = chalk.hex(job.color).dim;
    const prefixColorize = chalk.hex(job.color).bold;

    // Helper function to store output chunk
    const storeOutputChunk = (text, type = "stdout") => {
      const timestamp = Date.now();
      const chunk = {
        text,
        type,
        timestamp,
        jobId,
      };

      // Add to job's output history
      job.outputHistory.push(chunk);

      // Add to output stream for live viewing
      const stream = outputStreams.get(jobId);
      if (stream) {
        stream.chunks.push(chunk);
        stream.lastUpdate = timestamp;

        // Keep only last 1000 chunks per job to prevent memory issues
        if (stream.chunks.length > 1000) {
          stream.chunks = stream.chunks.slice(-1000);
        }
      }

      jobs.set(jobId, job);
    };

    // Create promises for both stdout and stderr streaming
    const stdoutPromise = (async () => {
      try {
        let buffer = "";
        for await (const chunk of proc.stdout) {
          const rawText = decoder.decode(chunk, { stream: true });
          if (rawText) {
            buffer += rawText;

            // Process complete lines
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim()) {
                // Parse JSON to extract human text content
                const humanText = parseClaudeJsonOutput(line);

                if (humanText) {
                  job.progress += humanText;
                  job.status = "running";

                  // Store the parsed human text content
                  storeOutputChunk(humanText, "stdout");

                  // Log human text to server console with color and prefix
                  const prefixedText = humanText
                    .split("\n")
                    .map((line) =>
                      line ? `[${jobId.slice(-8)}] ${line}` : line
                    )
                    .join("\n");
                  process.stdout.write(colorize(prefixedText));
                }
              }
            }
          }
        }

        // Process any remaining buffer content
        if (buffer.trim()) {
          const humanText = parseClaudeJsonOutput(buffer);
          if (humanText) {
            job.progress += humanText;
            storeOutputChunk(humanText, "stdout");

            const prefixedText = humanText
              .split("\n")
              .map((line) => (line ? `[${jobId.slice(-8)}] ${line}` : line))
              .join("\n");
            process.stdout.write(colorize(prefixedText));
          }
        }
      } catch (error) {
        const errorMsg = `stdout stream error: ${error.message}`;
        storeOutputChunk(errorMsg, "error");
        console.error(
          prefixColorize(`[${jobId.slice(-8)}] ${errorMsg}`),
          error
        );
      }
    })();

    const stderrPromise = (async () => {
      try {
        for await (const chunk of proc.stderr) {
          const text = decoder.decode(chunk, { stream: true });
          if (text) {
            job.progress += text;
            job.status = "running";

            // Store the stderr output chunk
            storeOutputChunk(text, "stderr");

            // Log stderr to server console with different styling
            const prefixedText = text
              .split("\n")
              .map((line) =>
                line ? `[${jobId.slice(-8)}] ERROR: ${line}` : line
              )
              .join("\n");
            process.stderr.write(errorColorize(prefixedText));
          }
        }
      } catch (error) {
        const errorMsg = `stderr stream error: ${error.message}`;
        storeOutputChunk(errorMsg, "error");
        console.error(
          prefixColorize(`[${jobId.slice(-8)}] ${errorMsg}`),
          error
        );
      }
    })();

    // Wait for both streams to complete
    await Promise.all([stdoutPromise, stderrPromise]);

    // Wait for process to complete
    const exitCode = await proc.exited;

    // Clean up process reference
    job.process = null;

    if (exitCode === 0) {
      // Mark job as completed
      job.status = "completed";
      job.completeMessage = job.progress;
      job.finishedAt = Date.now();

      // Store completion message
      storeOutputChunk(`\n--- Process completed successfully ---`, "system");

      console.log(
        prefixColorize(`[${jobId.slice(-8)}] Process completed successfully`)
      );
    } else {
      // Mark job as failed due to non-zero exit
      job.status = "failed";
      job.completeMessage =
        job.progress + `\nProcess exited with code ${exitCode}`;
      job.finishedAt = Date.now();

      // Store failure message
      storeOutputChunk(
        `\n--- Process failed with exit code ${exitCode} ---`,
        "system"
      );

      console.error(
        prefixColorize(
          `[${jobId.slice(-8)}] Process failed with exit code ${exitCode}`
        )
      );
    }

    jobs.set(jobId, job);
  } catch (error) {
    const colorize = chalk.hex(job.color).bold;
    console.error(colorize(`[${jobId.slice(-8)}] Job failed:`), error);

    // Clean up process reference
    if (job.process) {
      job.process = null;
    }

    // Store error message
    storeOutputChunk(
      `\n--- Job failed: ${error?.message || error} ---`,
      "system"
    );

    // Mark job as failed
    job.status = "failed";
    job.completeMessage =
      job.progress + "\nError: " + (error?.message || error);
    job.finishedAt = Date.now();
    jobs.set(jobId, job);
  }
}

function runClaudeProcess(prompt, options = {}) {
  // Build Claude command with headless options
  const model = options.model || "claude-sonnet-4-20250514";
  const args = [
    "/Users/webdevcody/.claude/local/claude",
    "--dangerously-skip-permissions",
    "-p", // print mode for better programmatic usage
    prompt,
    "--output-format",
    "stream-json", // JSON output format
    "--model",
    model,
    "--verbose",
  ];

  // Add additional options if provided
  if (options.allowedTools && options.allowedTools.length > 0) {
    args.push("--allowedTools", options.allowedTools.join(","));
  }

  if (options.disallowedTools && options.disallowedTools.length > 0) {
    args.push("--disallowedTools", options.disallowedTools.join(","));
  }

  if (options.addDirs && options.addDirs.length > 0) {
    options.addDirs.forEach((dir) => {
      args.push("--add-dir", dir);
    });
  }

  const proc = Bun.spawn(args, {
    stdout: "pipe",
    stderr: "pipe",
    cwd: options.workingDirectory || process.cwd(),
    env: {
      ...process.env,
      // Ensure headless mode
      CLAUDE_HEADLESS: "1",
      ...options.env,
    },
  });

  return { proc };
}

app.post("/prompt", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, jobId, options = {} } = body;
    if (!prompt || typeof prompt !== "string") {
      return c.json({ error: "Missing or invalid prompt" }, 400);
    }

    // Generate job ID if not provided
    const id =
      jobId ||
      `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const color = generateHighContrastHex();

    // Create job entry
    const job = {
      id,
      prompt,
      options,
      status: "running",
      progress: "",
      completeMessage: "",
      startedAt: Date.now(),
      finishedAt: null,
      color,
      process: null,
    };

    jobs.set(id, job);

    // Log when a prompt is received with color
    const colorize = chalk.hex(color).bold;
    console.log(
      colorize(
        `[${new Date().toISOString()}] [${id.slice(-8)}] Received prompt:`
      ),
      prompt
    );
    console.log(
      colorize(`[${new Date().toISOString()}] [${id.slice(-8)}] Options:`),
      options
    );

    // Process job in background
    processJobInBackground(id).catch((error) => {
      console.error(
        colorize(`[${id.slice(-8)}] Background job processing failed:`),
        error
      );
    });

    // Return immediately with job ID
    return c.json({ jobId: id, status: "started" });
  } catch (e) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Batch process multiple prompts
app.post("/batch", async (c) => {
  try {
    const body = await c.req.json();
    const { prompts, options = {} } = body;

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return c.json({ error: "Missing or invalid prompts array" }, 400);
    }

    if (prompts.length > 10) {
      return c.json({ error: "Maximum 10 prompts allowed per batch" }, 400);
    }

    const jobIds = [];

    for (const prompt of prompts) {
      if (typeof prompt !== "string") {
        return c.json({ error: "All prompts must be strings" }, 400);
      }

      const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const color = generateHighContrastHex();

      const job = {
        id,
        prompt,
        options,
        status: "running",
        progress: "",
        completeMessage: "",
        startedAt: Date.now(),
        finishedAt: null,
        color,
        process: null,
      };

      jobs.set(id, job);
      jobIds.push(id);

      // Start processing in background
      processJobInBackground(id).catch((error) => {
        const colorize = chalk.hex(color).bold;
        console.error(
          colorize(`[${id.slice(-8)}] Background batch job processing failed:`),
          error
        );
      });
    }

    console.log(
      chalk.cyan(
        `[${new Date().toISOString()}] Started batch of ${prompts.length} jobs: ${jobIds.map((id) => id.slice(-8)).join(", ")}`
      )
    );

    return c.json({
      jobIds,
      status: "started",
      count: prompts.length,
    });
  } catch (e) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Get all jobs
app.get("/jobs", (c) => {
  const jobArray = Array.from(jobs.values()).map((job) => ({
    id: job.id,
    prompt:
      job.prompt.length > 100
        ? job.prompt.substring(0, 100) + "..."
        : job.prompt,
    status: job.status,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    color: job.color,
    hasCompleteMessage: Boolean(job.completeMessage),
  }));

  return c.json({ jobs: jobArray });
});

// Get specific job details
app.get("/jobs/:id", (c) => {
  const id = c.req.param("id");
  const job = jobs.get(id);

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({ job });
});

// Get job output (full history)
app.get("/jobs/:id/output", (c) => {
  const id = c.req.param("id");
  const job = jobs.get(id);

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    jobId: id,
    outputHistory: job.outputHistory || [],
    status: job.status,
    color: job.color,
  });
});

// Get job output stream (for live updates)
app.get("/jobs/:id/stream", (c) => {
  const id = c.req.param("id");
  const job = jobs.get(id);
  const stream = outputStreams.get(id);

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (!stream) {
    return c.json({
      jobId: id,
      chunks: [],
      status: job.status,
      color: job.color,
      lastUpdate: job.startedAt,
    });
  }

  // Get query parameter for since timestamp
  const since = parseInt(c.req.query("since") || "0");
  const filteredChunks =
    since > 0
      ? stream.chunks.filter((chunk) => chunk.timestamp > since)
      : stream.chunks;

  return c.json({
    jobId: id,
    chunks: filteredChunks,
    status: job.status,
    color: job.color,
    lastUpdate: stream.lastUpdate,
  });
});

// Terminate/kill running job
app.post("/jobs/:id/terminate", (c) => {
  const id = c.req.param("id");
  const job = jobs.get(id);

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (job.status !== "running") {
    return c.json({ error: "Job is not running" }, 400);
  }

  if (job.process) {
    try {
      job.process.kill("SIGTERM");
      job.status = "terminated";
      job.completeMessage = job.progress + "\nProcess terminated by user";
      job.finishedAt = Date.now();
      job.process = null;
      jobs.set(id, job);

      const colorize = chalk.hex(job.color).bold;
      console.log(colorize(`[${id.slice(-8)}] Process terminated by user`));

      return c.json({ success: true, status: "terminated" });
    } catch (error) {
      return c.json({ error: "Failed to terminate process" }, 500);
    }
  } else {
    return c.json({ error: "No active process to terminate" }, 400);
  }
});

// Dismiss/delete completed job
app.delete("/jobs/:id", (c) => {
  const id = c.req.param("id");
  const job = jobs.get(id);

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (job.status === "running") {
    return c.json({ error: "Cannot dismiss running job" }, 400);
  }

  jobs.delete(id);
  // Clean up output stream as well
  outputStreams.delete(id);
  return c.json({ success: true });
});

function generateHighContrastHex() {
  // High saturation and medium-high lightness for dark backgrounds
  const hue = Math.floor(Math.random() * 360);
  const saturation = 95; // 0-100
  const lightness = 70; // 0-100
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  const toHex = (x) => x.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Resolve the port from CLI flags or environment variables, defaulting to 1337
const cliPortArgIndex = Bun.argv.findIndex(
  (arg) => arg === "--port" || arg === "-p"
);
const cliPort =
  cliPortArgIndex !== -1 ? Number(Bun.argv[cliPortArgIndex + 1]) : undefined;
const envPort = Number(Bun.env.PORT ?? Bun.env.VIBERT_PORT ?? process.env.PORT);
const port =
  Number.isFinite(cliPort) && cliPort > 0
    ? cliPort
    : Number.isFinite(envPort) && envPort > 0
      ? envPort
      : 1337;

console.log("Server is running on port", port);

// Start the server
Bun.serve({
  port,
  fetch: app.fetch,
});
