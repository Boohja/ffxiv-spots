import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/landmarks/nearest/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

type LandmarkRow = {
  id: number;
  name: string;
  x: number;
  y: number;
};

function makeLandmarkQuery(data: LandmarkRow[] | null, error: Error | null = null) {
  return {
    calls: [] as Array<[string, string, number | string]>,
    data,
    error,
    eq(column: string, value: string) {
      this.calls.push(["eq", column, value]);
      return this;
    },
    gte(column: string, value: number) {
      this.calls.push(["gte", column, value]);
      return this;
    },
    lte(column: string, value: number) {
      this.calls.push(["lte", column, value]);
      return this;
    },
    select() {
      return this;
    },
    then<TResult1 = { data: LandmarkRow[] | null; error: Error | null }, TResult2 = never>(
      resolve?: ((value: { data: LandmarkRow[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
      reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve({ data: this.data, error: this.error }).then(resolve, reject);
    },
  };
}

function getJson(response: Response) {
  return response.json() as Promise<unknown>;
}

describe("GET /api/landmarks/nearest", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("skips Supabase for unknown zones or invalid coordinates", async () => {
    const response = await GET(new Request("http://localhost/api/landmarks/nearest?zone=Nope&x=10&y=20"));

    expect(response.status).toBe(200);
    expect(await getJson(response)).toEqual({ landmark: null });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns the nearest landmark within the close-enough radius", async () => {
    const query = makeLandmarkQuery([
      { id: 1, name: "Too Far", x: 12, y: 20 },
      { id: 2, name: "Bronze Lake", x: 10.5, y: 20.4 },
    ]);

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => query),
    } as never);

    const response = await GET(
      new Request("http://localhost/api/landmarks/nearest?zone=Upper%20La%20Noscea&x=10&y=20"),
    );

    expect(response.status).toBe(200);
    expect(await getJson(response)).toEqual({
      landmark: {
        id: 2,
        name: "Bronze Lake",
        x: 10.5,
        y: 20.4,
        distance: 0.64,
      },
    });
    expect(query.calls).toContainEqual(["eq", "zone", "Upper La Noscea"]);
    expect(query.calls).toContainEqual(["gte", "x", 8.25]);
    expect(query.calls).toContainEqual(["lte", "y", 21.75]);
  });

  it("returns no landmark when every candidate is outside the radius", async () => {
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => makeLandmarkQuery([{ id: 3, name: "Distant", x: 14, y: 20 }])),
    } as never);

    const response = await GET(
      new Request("http://localhost/api/landmarks/nearest?zone=Upper%20La%20Noscea&x=10&y=20"),
    );

    expect(response.status).toBe(200);
    expect(await getJson(response)).toEqual({ landmark: null });
  });

  it("surfaces lookup failures as a server error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => makeLandmarkQuery(null, new Error("database sad"))),
    } as never);

    const response = await GET(
      new Request("http://localhost/api/landmarks/nearest?zone=Upper%20La%20Noscea&x=10&y=20"),
    );

    expect(response.status).toBe(500);
    expect(await getJson(response)).toEqual({ error: "Could not look up nearby landmarks." });
  });
});
