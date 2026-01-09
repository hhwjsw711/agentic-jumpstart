import { createFileRoute, Link } from "@tanstack/react-router";
import { Page } from "./admin/-components/page";
import { PageHeader } from "./admin/-components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Store,
  Terminal,
  Copy,
  CheckCircle,
  Sparkles,
  Download,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
});

const INSTALL_COMMAND = "/plugin marketplace add agentic-jumpstart/marketplace";
const CLI_INSTALL_COMMAND =
  "/plugin install agentic-jumpstart-skills@agentic-jumpstart";
const ANALYZE_COMMAND = "/agentic-jumpstart-skills:analyze-and-generate-skills";

function MarketplacePage() {
  const [copied, setCopied] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedAnalyze, setCopiedAnalyze] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCliToClipboard = async () => {
    await navigator.clipboard.writeText(CLI_INSTALL_COMMAND);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const copyAnalyzeToClipboard = async () => {
    await navigator.clipboard.writeText(ANALYZE_COMMAND);
    setCopiedAnalyze(true);
    setTimeout(() => setCopiedAnalyze(false), 2000);
  };

  return (
    <Page>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Claude Code Marketplace"
          highlightedWord="Marketplace"
          description="Discover and install Claude Code extensions to supercharge your development workflow."
        />

        <div className="grid gap-8">
          {/* What is the Marketplace */}
          <Card className="module-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-theme-500/10 dark:bg-theme-400/20 flex items-center justify-center">
                  <Store className="h-6 w-6 text-theme-500 dark:text-theme-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    What is the Claude Code Marketplace?
                  </CardTitle>
                  <CardDescription>
                    Extend Claude Code with community-built extensions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Claude Code Marketplace is a collection of pre-built
                extensions that you can install and use in your own Claude Code
                instance. These extensions include skills, agents, slash
                commands, and more— adding new capabilities, automating common
                tasks, and helping you work more efficiently.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Sparkles className="h-5 w-5 text-theme-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">
                      Pre-built Extensions
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Ready-to-use extensions for common workflows
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Download className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Easy Installation</h4>
                    <p className="text-xs text-muted-foreground">
                      One command to install any extension
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Terminal className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Claude Code Native</h4>
                    <p className="text-xs text-muted-foreground">
                      Works directly in your CLI
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card className="module-card border-theme-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-400/20 flex items-center justify-center">
                  <Terminal className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Install the Marketplace Extension
                  </CardTitle>
                  <CardDescription>
                    Add this to your Claude Code instance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium">Step 1: Open Claude Code</h4>
                <p className="text-sm text-muted-foreground">
                  Launch Claude Code in your terminal by running{" "}
                  <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                    claude
                  </code>
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  Step 2: Install the marketplace extension
                </h4>
                <p className="text-sm text-muted-foreground">
                  Choose one of the following installation methods:
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Method 1: Via Marketplace Command
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Type this command inside Claude Code:
                    </p>
                    <div className="relative">
                      <div className="flex items-center gap-2 p-4 bg-zinc-900 dark:bg-zinc-950 rounded-lg font-mono text-sm text-zinc-100 overflow-x-auto">
                        <span className="text-green-400">$</span>
                        <span>{INSTALL_COMMAND}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 hover:bg-zinc-800"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-zinc-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Method 2: Via Install Command
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Type this command inside Claude Code:
                    </p>
                    <div className="relative">
                      <div className="flex items-center gap-2 p-4 bg-zinc-900 dark:bg-zinc-950 rounded-lg font-mono text-sm text-zinc-100 overflow-x-auto">
                        <span className="text-green-400">$</span>
                        <span>{CLI_INSTALL_COMMAND}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 hover:bg-zinc-800"
                        onClick={copyCliToClipboard}
                      >
                        {copiedCli ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-zinc-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  Step 3: Analyze and generate extensions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Run this command to analyze your codebase and generate
                  extensions:
                </p>
                <div className="relative">
                  <div className="flex items-center gap-2 p-4 bg-zinc-900 dark:bg-zinc-950 rounded-lg font-mono text-sm text-zinc-100 overflow-x-auto">
                    <span className="text-green-400">$</span>
                    <span>{ANALYZE_COMMAND}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 hover:bg-zinc-800"
                    onClick={copyAnalyzeToClipboard}
                  >
                    {copiedAnalyze ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-zinc-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-theme-500/5 border border-theme-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className="bg-theme-500/10 border-theme-500/30 text-theme-600 dark:text-theme-400"
                  >
                    Tip
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Extensions are stored in your{" "}
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                      ~/.claude/skills
                    </code>{" "}
                    directory and persist across sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Link */}
          <Card className="module-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-400/20 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">View on GitHub</CardTitle>
                  <CardDescription>
                    Explore the source code and contribute
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The marketplace extension is open source. You can view the
                available extensions, contribute your own, or suggest
                improvements.
              </p>
              <a
                href="https://github.com/agentic-jumpstart/marketplace"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Repository
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
