/**
 * Fetch a GitHub PR's body text.
 *
 * Uses the same API endpoint as verifyPrOwnership but extracts the `body`
 * field instead of the author/repo info. Returns null on any error
 * (transient failures are acceptable — this is a best-effort cross-check).
 */
export async function fetchPrBody(
  prUrl: string,
  token?: string,
): Promise<string | null> {
  const match = prUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/,
  );
  if (!match) return null;

  const [, owner, repo, prNumber] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as { body?: string | null };
    return data.body ?? null;
  } catch {
    return null;
  }
}
