// npm run build:poki — the Poki build, into dist-poki/. See build.mjs for what
// differs. Setting the variable here keeps the command the same on any platform.
process.env.TARGET = "poki";
await import("../build.mjs");
