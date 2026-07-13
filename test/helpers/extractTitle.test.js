const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/helpers/extractTitle.js");

test("clean title passes through", async () => {
  const { extractTitle } = await load();
  assert.equal(extractTitle("Quarterly Planning Notes"), "Quarterly Planning Notes");
});

test('strips a "Title:" prefix (previously discarded / mis-set)', async () => {
  const { extractTitle } = await load();
  assert.equal(extractTitle("Title: Team Sync Recap"), "Team Sync Recap");
});

test('strips "Here is a concise title:" lead-in', async () => {
  const { extractTitle } = await load();
  assert.equal(
    extractTitle('Here is a concise title: "Budget Review Meeting"'),
    "Budget Review Meeting"
  );
});

test("takes the first line when the model adds explanation", async () => {
  const { extractTitle } = await load();
  assert.equal(
    extractTitle("Project Kickoff\n\nThis title captures the main topic of the notes."),
    "Project Kickoff"
  );
});

test("strips surrounding quotes and markdown emphasis", async () => {
  const { extractTitle } = await load();
  assert.equal(extractTitle('**"Sprint Retrospective"**'), "Sprint Retrospective");
  assert.equal(extractTitle("### Design Review"), "Design Review");
});

test("truncates an over-long response at a word boundary instead of discarding it", async () => {
  const { extractTitle } = await load();
  const long =
    "Comprehensive discussion regarding the migration of the legacy billing subsystem toward the new event driven architecture";
  const out = extractTitle(long);
  assert.ok(out.length > 0 && out.length <= 80, `expected non-empty <=80, got ${out.length}`);
  assert.ok(long.startsWith(out), "should be a prefix of the original");
  assert.ok(!/\s\S*$/.test(out) || !out.endsWith(" "), "no trailing partial word/space");
});

test("empty / non-string input yields empty string", async () => {
  const { extractTitle } = await load();
  assert.equal(extractTitle(""), "");
  assert.equal(extractTitle("   \n  "), "");
  assert.equal(extractTitle(undefined), "");
});
