/**
 * Extract a GitHub issue number referenced in a PR body.
 *
 * Looks for the standard "Closes #N", "Fixes #N", "Resolves #N" patterns
 * (case-insensitive) in the PR description body. Returns the first match
 * or null if none found.
 *
 * Used to cross-check the GHB platform's auto-detection so PRs get
 * matched to the correct bounty instead of being assigned to a
 * semantically-similar but wrong issue.
 */
export function extractIssueReference(prBody: string): number | null {
  // Standard GitHub closing keywords — accept any casing
  const re =
    /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/i;
  const match = prBody.match(re);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export type ExtractIssueReferenceResult = number | null;
