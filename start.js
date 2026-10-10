/**
 * start-all.js
 * Starts OmniRoute, waits for it to be ready, then starts the Node app —
 * both with the correct Claude/Anthropic env vars set automatically.
 *
 * Usage:
 *   node start-all.js
 *
 * Before running, fill in OMNIROUTE_CMD below with however you actually
 * launch OmniRoute on your machine (an .exe path, a script, "omniroute", etc).
 */

const { spawn } = require("child_process");
const os = require("os");
const path = require("path");
const http = require("http");

// ---------- CONFIG — EDIT THESE ----------

// How you normally start OmniRoute. Examples:
//   command: "omniroute", args: []
//   command: "node", args: ["./omniroute/server.js"]
//   command: "C:\\Tools\\OmniRoute\\omniroute.exe", args: []
const OMNIROUTE_CMD = {
  command: "omniroute",
  args: [],
};

// How you start your Node app.
const APP_CMD = {
  command: "node",
  args: ["yotpo-proxy-server.js"],
};

// Port OmniRoute listens on, used to detect it's ready before starting the app.
const OMNIROUTE_PORT = 20128;

// Env vars every child process needs.
const SHARED_ENV = {
  ...process.env,
  CLAUDE_CONFIG_DIR: path.join(os.homedir(), ".claude-omniroute"),
  ANTHROPIC_BASE_URL: `http://localhost:${OMNIROUTE_PORT}`,
  ANTHROPIC_AUTH_TOKEN: "sk-b728f4de9f599cf5-7f6405-668a2b7a", // set OMNIROUTE_TOKEN in your shell, don't hardcode it here
  ANTHROPIC_API_KEY: "",
  ANTHROPIC_MODEL: "Allen-AI",
};

// ---------- END CONFIG ----------

const COLORS = {
  omni: "\x1b[36m",  // cyan
  app: "\x1b[32m",   // green
  sys: "\x1b[33m",   // yellow
  reset: "\x1b[0m",
};

function log(tag, color, line) {
  if (!line) return;
  process.stdout.write(`${color}[${tag}]${COLORS.reset} ${line}\n`);
}

function pipeOutput(child, tag, color) {
  child.stdout?.on("data", (buf) => {
    buf.toString().split(/\r?\n/).filter(Boolean).forEach((l) => log(tag, color, l));
  });
  child.stderr?.on("data", (buf) => {
    buf.toString().split(/\r?\n/).filter(Boolean).forEach((l) => log(tag, color, l));
  });
}

function waitForPort(port, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: "localhost", port, timeout: 1000 }, (res) => {
        res.destroy();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(tryOnce, 500);
        }
      });
      req.on("timeout", () => {
        req.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(tryOnce, 500);
        }
      });
    };
    tryOnce();
  });
}

async function main() {
  if (!SHARED_ENV.ANTHROPIC_AUTH_TOKEN) {
    log("sys", COLORS.sys, "WARNING: OMNIROUTE_TOKEN is not set in your environment.");
    log("sys", COLORS.sys, 'Set it first, e.g.:  $env:OMNIROUTE_TOKEN = "sk-..."  (PowerShell)');
  }

  log("sys", COLORS.sys, `Starting OmniRoute: ${OMNIROUTE_CMD.command} ${OMNIROUTE_CMD.args.join(" ")}`);
  const omni = spawn(OMNIROUTE_CMD.command, OMNIROUTE_CMD.args, {
    env: SHARED_ENV,
    shell: true,
  });
  pipeOutput(omni, "omni", COLORS.omni);

  omni.on("exit", (code) => {
    log("sys", COLORS.sys, `OmniRoute exited with code ${code}`);
    process.exit(code ?? 1);
  });

  try {
    log("sys", COLORS.sys, `Waiting for OmniRoute on port ${OMNIROUTE_PORT}...`);
    await waitForPort(OMNIROUTE_PORT);
    log("sys", COLORS.sys, "OmniRoute is up. Starting app...");
  } catch (err) {
    log("sys", COLORS.sys, `${err.message} — starting app anyway, it may fail to connect.`);
  }

  const app = spawn(APP_CMD.command, APP_CMD.args, {
    env: SHARED_ENV,
    shell: true,
  });
  pipeOutput(app, "app", COLORS.app);

  app.on("exit", (code) => {
    log("sys", COLORS.sys, `App exited with code ${code}`);
    omni.kill();
    process.exit(code ?? 1);
  });

  // Make sure Ctrl+C kills both.
  process.on("SIGINT", () => {
    log("sys", COLORS.sys, "Shutting down...");
    app.kill();
    omni.kill();
    process.exit(0);
  });
}

main();