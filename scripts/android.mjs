// Runs an Android Gradle task with the JDK and SDK installed for this project,
// so no Android Studio is needed.
// Usage: node scripts/android.mjs <gradle task>   (see the android:* npm scripts)
//
// Release builds are signed with the Play upload key, which lives outside the
// repo in ~/.eldoggo/dogchase/ (override with DOGCHASE_SIGNING=<path to upload.properties>).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const local = process.env.LOCALAPPDATA ?? "";
const env = {
  ...process.env,
  JAVA_HOME: process.env.JAVA_HOME || join(local, "Programs", "jdk-21"),
  ANDROID_HOME: process.env.ANDROID_HOME || join(local, "Android", "Sdk"),
};
for (const name of ["JAVA_HOME", "ANDROID_HOME"]) {
  if (!existsSync(env[name])) {
    console.error(`${name} not found at ${env[name]}`);
    process.exit(1);
  }
}

const task = process.argv[2];
if (!task) {
  console.error("Usage: node scripts/android.mjs <gradle task>");
  process.exit(1);
}
// Full path: cmd.exe can be configured not to run programs from the current folder.
const androidDir = resolve("android");
execFileSync(`"${join(androidDir, "gradlew.bat")}"`, [task, "--console=plain"], { cwd: androidDir, env, stdio: "inherit", shell: true });
