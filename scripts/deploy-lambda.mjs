// Packages lambda/ and deploys it to the dogchase-api function.
// Usage: npm run deploy:lambda   (runs the unit tests first)
// Zips with PowerShell's Compress-Archive, so this runs on Windows.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

const FILES = ["index.mjs", "shared.mjs", "validate.mjs", "package.json"].map(f => `lambda/${f}`);
const AWS = ["--profile", process.env.AWS_PROFILE || "dogchase", "--region", "us-east-1"];
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });

rmSync("lambda/function.zip", { force: true });
run("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path ${FILES.join(",")} -DestinationPath lambda/function.zip`]);
run("aws", ["lambda", "update-function-code", "--function-name", "dogchase-api", "--zip-file", "fileb://lambda/function.zip",
  ...AWS, "--query", "[LastModified,CodeSha256]", "--output", "text"]);
run("aws", ["lambda", "wait", "function-updated", "--function-name", "dogchase-api", ...AWS]);
console.log("Deployed dogchase-api");
