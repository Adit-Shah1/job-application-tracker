/**
 * Self-check for the pure helpers in extract-job.ts. Run: npx tsx src/lib/extract-job.check.ts
 * No test framework — the repo has none, and these are two pure functions.
 */
import assert from "node:assert/strict";
import { htmlToText, blockReason } from "./extract-job";

// htmlToText drops script/style but keeps <title> and body copy.
const html = `
  <html><head><title>Senior Engineer at Acme</title>
  <style>.a{color:red}</style><script>var x = "<b>not text</b>";</script></head>
  <body><h1>Senior Engineer</h1><p>Salary: $120,000 &amp; up</p>
  <div>Remote&nbsp;&mdash;&nbsp;US</div></body></html>`;
const text = htmlToText(html);

assert.ok(text.includes("Senior Engineer at Acme"), "keeps <title>");
assert.ok(text.includes("Salary: $120,000 & up"), "decodes &amp;");
assert.ok(!text.includes("color:red"), "drops <style>");
assert.ok(!text.includes("var x"), "drops <script>");
assert.ok(!text.includes("<"), "strips remaining tags");
assert.ok(!/\n{3,}/.test(text), "collapses blank lines");
assert.equal(htmlToText("<p>a</p>".repeat(60_000)).length, 40_000, "caps length");

// blockReason guards the fetch trust boundary: null means allowed.
assert.equal(blockReason("https://boards.greenhouse.io/acme/jobs/1"), null, "allows public https");
assert.equal(blockReason("https://172.32.0.1"), null, "172.32.x is public");

for (const bad of [
  "http://example.com",
  "https://localhost/x",
  "https://169.254.169.254/latest/meta-data/",
  "https://10.0.0.1",
  "https://192.168.1.1",
  "https://172.16.0.1",
  "https://172.31.255.255",
  "https://127.0.0.1:3000",
  "https://[::1]/",
  "https://db.internal/x",
  "https://api.local",
  "file:///etc/passwd",
  "not a url",
]) {
  assert.ok(blockReason(bad), `blocks ${bad}`);
}

console.log("extract-job: all checks passed");
