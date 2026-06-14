import { describe, it, expect } from "vitest";
import { extractIssueReference } from "../../src/github/extract-issue-reference";

describe("extractIssueReference", () => {
  it("extracts Closes #N", () => {
    expect(extractIssueReference("Closes #67")).toBe(67);
    expect(extractIssueReference("closes #108")).toBe(108);
    expect(extractIssueReference("This PR closes #42")).toBe(42);
  });

  it("extracts Fixes #N", () => {
    expect(extractIssueReference("Fixes #100")).toBe(100);
    expect(extractIssueReference("fixes #1")).toBe(1);
    expect(extractIssueReference("fix #99")).toBe(99);
  });

  it("extracts Resolves #N", () => {
    expect(extractIssueReference("Resolves #200")).toBe(200);
    expect(extractIssueReference("resolves #7")).toBe(7);
    expect(extractIssueReference("resolve #8")).toBe(8);
  });

  it("extracts Closed #N", () => {
    expect(extractIssueReference("Closed #10")).toBe(10);
  });

  it("extracts Fixed #N", () => {
    expect(extractIssueReference("Fixed #33")).toBe(33);
    expect(extractIssueReference("This PR fixed #33")).toBe(33);
  });

  it("extracts the first reference when multiple exist", () => {
    expect(
      extractIssueReference("Fixes #10\n\nRelated: #20, #30"),
    ).toBe(10);
  });

  it("returns null when no reference is found", () => {
    expect(extractIssueReference("No references here")).toBeNull();
    expect(extractIssueReference("Just a regular PR description")).toBeNull();
    expect(extractIssueReference("")).toBeNull();
  });

  it("handles references in markdown PR bodies", () => {
    const body = `## Summary\n\nAdds the diff-filter prefix for Anchor.\n\nCloses #67`;
    expect(extractIssueReference(body)).toBe(67);
  });

  it("handles the PR #99 scenario (Closes with just the body content)", () => {
    const body = `## Summary\n\nAdds \`.anchor/\` to \`GENERATED_DIR_PREFIXES\` so that Anchor framework build artifacts (test ledger, IDL cache) are filtered from the diff shown to Sonnet.\n\n## Changes\n\n- **\`packages/diff-filter/src/patterns.ts\`**: Added \`.anchor/\` to \`GENERATED_DIR_PREFIXES\` array\n- **\`packages/diff-filter/tests/classify.test.ts\`**: Added \`contracts/solana/.anchor/test-ledger/genesis.bin\` test case\n\n## Verification\n\n\`\`\`bash\n# All 69 existing tests pass\ncd packages/diff-filter && npx vitest run\n#\n# ✓ tests/parse.test.ts (8 tests)\n# ✓ tests/filter.test.ts (9 tests)\n# ✓ tests/classify.test.ts (52 tests)\n# Test Files  3 passed (3)\n# Tests  69 passed (69)\n\`\`\`\n\nCloses #67`;
    expect(extractIssueReference(body)).toBe(67);
  });

  it("returns null for numbers without a keyword prefix", () => {
    expect(extractIssueReference("See #67 for details")).toBeNull();
    expect(extractIssueReference("Related to #100")).toBeNull();
    expect(extractIssueReference("Issue #42")).toBeNull();
  });
});
