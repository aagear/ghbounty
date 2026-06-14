import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchPrBody } from "../../src/github/fetch-pr-body";

describe("fetchPrBody", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the PR body on success", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ body: "Closes #67\n\nFixes the diff-filter." }),
        { status: 200 },
      ),
    );

    const result = await fetchPrBody(
      "https://github.com/owner/repo/pull/99",
    );
    expect(result).toBe("Closes #67\n\nFixes the diff-filter.");
  });

  it("returns null for non-GitHub URLs", async () => {
    const result = await fetchPrBody(
      "https://gitlab.com/owner/repo/pull/1",
    );
    expect(result).toBeNull();
  });

  it("returns null on HTTP error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    const result = await fetchPrBody(
      "https://github.com/owner/repo/pull/9999",
    );
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ENOTFOUND"));
    const result = await fetchPrBody(
      "https://github.com/owner/repo/pull/42",
    );
    expect(result).toBeNull();
  });

  it("sends the auth token when provided", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ body: "Fixes #1" }), { status: 200 }),
    );

    await fetchPrBody(
      "https://github.com/owner/repo/pull/42",
      "ghp_abc123",
    );
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer ghp_abc123");
  });

  it("returns null when body is null in the response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ body: null }), { status: 200 }),
    );

    const result = await fetchPrBody(
      "https://github.com/owner/repo/pull/42",
    );
    expect(result).toBeNull();
  });
});
