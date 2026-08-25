import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function run(name, command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const pipe = (stream) => stream.on("data", (d) => process.stdout.write(`[${name}] ${d}`));
  pipe(child.stdout);
  pipe(child.stderr);
  return child;
}

const server = run("server", process.execPath, ["server/index.js"], { PORT: "5178" });
const vite = run("web", path.join(root, "node_modules", ".bin", "vite"), [], {});

let closing = false;
function close(code) {
  if (closing) return;
  closing = true;
  try { server.kill(); } catch {}
  try { vite.kill(); } catch {}
  process.exit(code ?? 0);
}
process.on("SIGINT", () => close(0));
process.on("SIGTERM", () => close(0));
vite.on("exit", (code) => {
  console.log("[web] vite exited — shutting down");
  close(code);
});
