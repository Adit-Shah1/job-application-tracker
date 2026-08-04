import { chromium } from "@playwright/test";
const sp = "/private/tmp/claude-501/-Volumes-T7-Touch-repos-job-application-tracker/30f587bd-43da-432a-a6ce-f5004c0be787/scratchpad";
const b = await chromium.launch({ executablePath: "/Applications/Arc.app/Contents/MacOS/Arc" });
const p = await b.newPage({ viewportSize: { width: 900, height: 340 }, deviceScaleFactor: 3 });
await p.goto("file://" + sp + "/preview.html");
await p.screenshot({ path: sp + "/checkboxes.png" });
await b.close();
console.log("ok");
