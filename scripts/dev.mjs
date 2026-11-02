import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(root, "backend");
const frontendDir = path.join(root, "frontend");
const wrapperJar = path.join(backendDir, "gradle", "wrapper", "gradle-wrapper.jar");
const vite = path.join(frontendDir, "node_modules", "vite", "bin", "vite.js");
const children = [];
let stopping = false;

function stopChildren(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

function launch(command, args, label, cwd, env = process.env) {
  const child = spawn(command, args, { cwd, env, stdio: "inherit" });
  child.label = label;
  child.on("error", (error) => {
    console.error(`[${label}] ${error.message}`);
    stopChildren(1);
  });
  child.on("close", (code) => {
    if (!stopping) {
      console.error(`[${label}] stopped${code ? ` with exit code ${code}` : ""}.`);
      stopChildren(code || 1);
    }
  });
  children.push(child);
  return child;
}

async function waitForBackend(backend) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (stopping || backend.exitCode !== null) {
      throw new Error("Kotlin backend stopped before it became ready.");
    }
    try {
      const response = await fetch("http://127.0.0.1:8080/api/health");
      if (response.ok) return;
    } catch {
      await delay(500);
    }
  }
  throw new Error("Kotlin backend did not become ready within 2 minutes.");
}

async function installFrontendDependencies() {
  if (existsSync(vite)) return;
  console.log("Installing frontend dependencies (first run only)...");
  await new Promise((resolve, reject) => {
    const npm = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], {
      cwd: frontendDir,
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    npm.once("error", reject);
    npm.once("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm install exited with code ${code}`));
    });
  });
}

async function main() {
  if (!existsSync(wrapperJar)) throw new Error("Gradle wrapper jar is missing.");
  await installFrontendDependencies();

  console.log("Starting Kotlin backend (first run may download Gradle dependencies)...");
  const backend = launch("java", [
    "-classpath",
    wrapperJar,
    "org.gradle.wrapper.GradleWrapperMain",
    "run",
    "--no-daemon",
  ], "backend", backendDir, { ...process.env, PORT: "8080" });

  await waitForBackend(backend);
  console.log("Kotlin API is ready at http://localhost:8080");
  console.log("Starting Parkwise at http://localhost:5173. Press Ctrl+C to stop both services.\n");
  launch(process.execPath, [vite, "--host", "127.0.0.1"], "frontend", frontendDir);
}

process.on("SIGINT", () => stopChildren(0));
process.on("SIGTERM", () => stopChildren(0));

main().catch((error) => {
  console.error(`\nUnable to start Parkwise: ${error.message}`);
  stopChildren(1);
});
