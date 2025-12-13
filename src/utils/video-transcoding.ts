import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const execAsync = promisify(exec);

export type VideoQuality = "720p" | "480p";

export interface TranscodeOptions {
  inputPath: string;
  outputPath: string;
  quality: VideoQuality;
}

const FFMPEG_PRESET = "medium";
const FFMPEG_CRF = "23";

/**
 * Transcodes a video file to the specified quality using ffmpeg
 */
export async function transcodeVideo(options: TranscodeOptions): Promise<void> {
  const { inputPath, outputPath, quality } = options;

  // Determine target height based on quality
  const targetHeight = quality === "720p" ? "720" : "480";

  // Build ffmpeg command
  // -vf "scale=-2:HEIGHT" maintains aspect ratio, sets height
  // -c:v libx264 uses H.264 codec
  // -preset medium balances speed vs compression
  // -crf 23 provides good quality (lower = better quality, 18-28 is typical range)
  // -c:a aac uses AAC audio codec
  const command = `ffmpeg -i "${inputPath}" -vf "scale=-2:${targetHeight}" -c:v libx264 -preset ${FFMPEG_PRESET} -crf ${FFMPEG_CRF} -c:a aac -y "${outputPath}"`;

  try {
    await execAsync(command);
  } catch (error) {
    throw new Error(
      `Failed to transcode video to ${quality}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Creates a temporary file path for video processing
 */
export function createTempVideoPath(
  prefix: string,
  suffix: string = ".mp4"
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return join(tmpdir(), `${prefix}_${timestamp}_${random}${suffix}`);
}

/**
 * Cleans up temporary files
 */
export async function cleanupTempFiles(...paths: string[]): Promise<void> {
  await Promise.allSettled(
    paths.map(async (path) => {
      try {
        await unlink(path);
      } catch (error) {
        // Ignore errors if file doesn't exist
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error(`Failed to delete temp file ${path}:`, error);
        }
      }
    })
  );
}

/**
 * Writes a buffer to a temporary file
 */
export async function writeBufferToTempFile(
  buffer: Buffer,
  prefix: string,
  suffix: string = ".mp4"
): Promise<string> {
  const tempPath = createTempVideoPath(prefix, suffix);
  await writeFile(tempPath, buffer);
  return tempPath;
}
