const { spawn } = require("child_process");
const os = require("os");
const path = require("path");

const env = {
  ...process.env,
  CLAUDE_CONFIG_DIR: path.join(os.homedir(), ".claude-omniroute"),
  ANTHROPIC_BASE_URL: "http://localhost:20128",
  ANTHROPIC_AUTH_TOKEN: process.env.OMNIROUTE_TOKEN, // see note below
  ANTHROPIC_API_KEY: "",
  ANTHROPIC_MODEL: "Allen-AI/claude-omni-v1",
};

const child = spawn("claude", process.argv.slice(2), {
  env,
  stdio: "inherit",
  shell: true, // needed on Windows so it resolves claude.cmd
});

child.on("exit", (code) => process.exit(code ?? 0));