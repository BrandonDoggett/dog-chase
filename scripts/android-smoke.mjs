// Android smoke test: starts the installed debug app on a running emulator or
// USB device, then checks it from inside its WebView over the DevTools protocol.
// Usage: npm run android:apk, install it (adb install -r ...), start the
// emulator (see CLAUDE.md), then npm run android:smoke. Screenshots land in .smoke/.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const APP = "com.eldoggosoftware.dogchase";
const sdk = process.env.ANDROID_HOME || join(process.env.LOCALAPPDATA ?? "", "Android", "Sdk");
const adbExe = join(sdk, "platform-tools", "adb.exe");
const adb = (...args) => execFileSync(adbExe, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? `: ${detail}` : ""}`);
};
// Screenshots are for a person to look at, so a flaky adb transfer mustn't fail the run.
async function screenshot(name) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      adb("shell", "screencap", "-p", "/sdcard/dogchase-smoke.png");
      adb("pull", "/sdcard/dogchase-smoke.png", `.smoke/${name}.png`);
      return;
    } catch { await sleep(1000); }
  }
  console.log(`info  couldn't save .smoke/${name}.png`);
}

mkdirSync(".smoke", { recursive: true });
if (!adb("devices").split("\n").slice(1).some(line => /\tdevice$/.test(line.trim()))) {
  console.error("No emulator or device connected (check `adb devices`).");
  process.exit(1);
}

// Start fresh so the first-run name screen shows.
adb("shell", "pm", "clear", APP);
adb("logcat", "-c");
adb("shell", "am", "start", "-n", `${APP}/.MainActivity`);

let pid = "";
for (let i = 0; i < 60 && !pid; i++) {
  await sleep(500);
  try { pid = adb("shell", "pidof", APP); } catch {}
}
if (!pid) { console.error("The app didn't start."); process.exit(1); }

// Debug builds expose their WebView to DevTools on a per-process socket.
let target;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(1000);
  try {
    adb("forward", "tcp:9333", `localabstract:webview_devtools_remote_${pid}`);
    const list = await (await fetch("http://127.0.0.1:9333/json", { signal: AbortSignal.timeout(3000) })).json();
    target = list.find(t => t.type === "page" && t.url.startsWith("https://localhost"));
  } catch {}
}
if (!target) { console.error("Couldn't reach the app's WebView over DevTools."); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let nextId = 0;
const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); pending.get(m.id)?.(m); pending.delete(m.id); };
const send = (method, params = {}) => new Promise(resolve => {
  const id = ++nextId;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expr =>
  (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const sceneActive = async (key, ms = 60000) => {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(250))
    if (await evaluate(`!!window.dogChase?.scene.isActive(${JSON.stringify(key)})`)) return true;
  return false;
};

check("first run shows the name screen", await sceneActive("Name"));
await sleep(500);
await screenshot("android-1-name");

const probe = await evaluate(`(async () => {
  const r = document.querySelector("canvas").getBoundingClientRect();
  return {
    capacitor: !!window.Capacitor,
    serviceWorkers: navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0,
    canvases: document.querySelectorAll("canvas").length,
    nunito: document.fonts.check("900 16px Nunito"),
    canvas: [r.x, r.y, r.width, r.height],
  };
})()`);
check("runs inside Capacitor", probe.capacitor);
check("no service worker inside the app", probe.serviceWorkers === 0, `${probe.serviceWorkers} registered`);
check("exactly one game canvas", probe.canvases === 1, `found ${probe.canvases}`);
check("Nunito font loaded from the app bundle", probe.nunito);

const [cx, cy, cw] = probe.canvas, k = cw / 480;
async function tapGame(x, y) {
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cx + x * k, y: cy + y * k }] });
  await sleep(50);
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

await tapGame(240, 406); // LET'S GO
check("LET'S GO opens the pick screen and saves a generated name",
  await sceneActive("Select", 15000) && await evaluate(`isValidName(localStorage.getItem("dogchase_name"))`));
await sleep(600);
await screenshot("android-2-select");

await tapGame(240, 578); // Leaderboard
await sceneActive("Leaderboard", 15000);
let rows = 0;
for (let i = 0; i < 40 && !rows; i++) {
  await sleep(500);
  rows = await evaluate(`window.dogChase.scene.getScene("Leaderboard").rowContainer.list.length`);
}
check("leaderboard loads inside the app (CORS allows its origin)", rows > 0, "no rows arrived");
await screenshot("android-3-leaderboard");

const relaunches = adb("logcat", "-d", "-s", "WindowManager:I", "ActivityTaskManager:I")
  .split("\n").filter(line => line.includes(APP) && /relaunch/i.test(line));
check("the screen starts once, with no relaunch", relaunches.length === 0, relaunches.join(" | "));

// Informational: the status-bar spacing the page ended up with.
const spacing = await evaluate(`(() => {
  const root = getComputedStyle(document.documentElement);
  return { cssVarTop: root.getPropertyValue("--safe-area-inset-top").trim() || "(unset)",
           gameTop: getComputedStyle(document.getElementById("game")).top };
})()`);
console.log(`info  safe-area top: Capacitor variable ${spacing.cssVarTop}, #game top ${spacing.gameTop}`);

await tapGame(240, 592); // BACK
await sceneActive("Select", 15000);
await sleep(600);
await tapGame(480 - 34, 640 - 14); // Privacy link
let top = "";
for (let i = 0; i < 20 && (!top || top.includes(APP)); i++) {
  await sleep(500);
  top = adb("shell", "dumpsys", "activity", "activities").split("\n").find(line => line.includes("topResumedActivity")) ?? "";
}
check("Privacy opens in the phone's browser, outside the app", top !== "" && !top.includes(APP), top.trim());
adb("shell", "am", "start", "-n", `${APP}/.MainActivity`); // back to the game

ws.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
