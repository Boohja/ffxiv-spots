import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/spots/route";
import { createClient } from "@/lib/supabase/server";
import { uploadImageFile } from "@/lib/uploads/storage";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/uploads/storage", () => ({
  UploadValidationError: class UploadValidationError extends Error {},
  uploadImageFile: vi.fn(),
}));

type SpotRow = Record<string, unknown>;
type ImageRow = Record<string, unknown>;

type SupabaseHarness = {
  client: {
    auth: {
      getUser: ReturnType<typeof vi.fn>;
    };
    from: ReturnType<typeof vi.fn>;
  };
  imageInserts: ImageRow[][];
  spotInserts: SpotRow[];
  spotUpdates: SpotRow[];
};

type HarnessOptions = {
  draftCount?: number;
  pendingCount?: number;
  role?: "submitter" | "trusted_submitter" | "moderator" | "admin" | null;
  userId?: string;
};

class SpotsQuery {
  private countKind: "draft" | "pending" | undefined;

  constructor(private readonly harness: SupabaseHarness, private readonly options: Required<HarnessOptions>) {}

  select(_columns: string, options?: { count?: "exact"; head?: boolean }) {
    if (options?.head) {
      this.countKind = "pending";
    }

    return this;
  }

  eq(column: string, value: string) {
    if (column === "state" && value === "draft") {
      this.countKind = "draft";
    }

    return this;
  }

  in() {
    this.countKind = "pending";
    return this;
  }

  maybeSingle() {
    return Promise.resolve({ data: null, error: null });
  }

  insert(row: SpotRow) {
    this.harness.spotInserts.push(row);
    return Promise.resolve({ error: null });
  }

  update(row: SpotRow) {
    this.harness.spotUpdates.push(row);

    return {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
  }

  then<TResult1 = { count: number; error: null }, TResult2 = never>(
    resolve?: ((value: { count: number; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    const count = this.countKind === "draft" ? this.options.draftCount : this.options.pendingCount;
    return Promise.resolve({ count, error: null }).then(resolve, reject);
  }
}

class SpotImagesQuery {
  constructor(private readonly harness: SupabaseHarness) {}

  insert(rows: ImageRow[]) {
    this.harness.imageInserts.push(rows);
    return Promise.resolve({ error: null });
  }
}

class AppUsersQuery {
  constructor(private readonly options: Required<HarnessOptions>) {}

  select() {
    return this;
  }

  eq() {
    return this;
  }

  maybeSingle() {
    return Promise.resolve({
      data: this.options.role ? { role: this.options.role } : null,
      error: null,
    });
  }
}

function makeHarness(options: HarnessOptions = {}) {
  const normalizedOptions = {
    draftCount: options.draftCount ?? 0,
    pendingCount: options.pendingCount ?? 0,
    role: options.role ?? "submitter",
    userId: options.userId ?? "user-1",
  };
  const harness: SupabaseHarness = {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: normalizedOptions.userId ? { id: normalizedOptions.userId } : null,
          },
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "spots") {
          return new SpotsQuery(harness, normalizedOptions);
        }

        if (table === "spot_images") {
          return new SpotImagesQuery(harness);
        }

        if (table === "app_users") {
          return new AppUsersQuery(normalizedOptions);
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    },
    imageInserts: [],
    spotInserts: [],
    spotUpdates: [],
  };

  vi.mocked(createClient).mockResolvedValue(harness.client as never);

  return harness;
}

function makeFormData(values: Record<string, string | Blob | Array<string | Blob>>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    const valuesToAppend = Array.isArray(value) ? value : [value];

    for (const item of valuesToAppend) {
      formData.append(key, item);
    }
  }

  return formData;
}

function makeRequest(formData: FormData) {
  return {
    formData: () => Promise.resolve(formData),
  } as Request;
}

async function responseJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/spots", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    vi.mocked(uploadImageFile).mockReset();
    delete process.env.XIVSPOTS_MAX_DRAFTS_PER_USER;
    delete process.env.XIVSPOTS_MAX_PENDING_SPOTS_PER_USER;
  });

  it("requires an authenticated user", async () => {
    makeHarness({ userId: "" });

    const response = await POST(makeRequest(makeFormData({ state: "draft", zone: "Upper La Noscea", x: "10", y: "20" })));

    expect(response.status).toBe(401);
    expect(await responseJson(response)).toEqual({ error: "Sign in before submitting a spot." });
  });

  it("saves a draft with just zone and valid coordinates", async () => {
    const harness = makeHarness();

    const response = await POST(
      makeRequest(
        makeFormData({
          state: "draft",
          zone: "Upper La Noscea",
          x: "10.4",
          y: "20.1",
          title: "",
          tags: "Beach, sunset, beach",
        }),
      ),
    );

    expect(response.status).toBe(201);
    expect(uploadImageFile).not.toHaveBeenCalled();
    expect(harness.spotInserts).toHaveLength(1);
    expect(harness.spotInserts[0]).toMatchObject({
      submitted_by: "user-1",
      state: "draft",
      zone: "Upper La Noscea",
      x: 10.4,
      y: 20.1,
      title: "Upper La Noscea photo spot",
      tags: ["beach", "sunset"],
    });
    expect(harness.imageInserts).toEqual([]);
    expect(await responseJson(response)).toMatchObject({
      spot: {
        slug: "upper-la-noscea-photo-spot",
        state: "draft",
      },
      uploads: [],
    });
  });

  it("requires a screenshot for submitted spots", async () => {
    makeHarness();

    const response = await POST(
      makeRequest(makeFormData({ state: "submitted", zone: "Upper La Noscea", x: "10", y: "20" })),
    );

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toEqual({ error: "Choose a screenshot." });
    expect(uploadImageFile).not.toHaveBeenCalled();
  });

  it("uploads screenshots and stores image rows for submitted spots", async () => {
    const harness = makeHarness();
    const file = new File(["jpg bytes"], "spot.jpg", { type: "image/jpeg" });

    vi.mocked(uploadImageFile).mockResolvedValue({
      key: "spots/spot-id/spot.webp",
      url: "https://example.test/spot.webp",
      width: 1280,
      height: 720,
      size: 12345,
      contentType: "image/webp",
    });

    const response = await POST(
      makeRequest(
        makeFormData({
          state: "submitted",
          zone: "Upper La Noscea",
          x: "10",
          y: "20",
          title: "Mistfall Overlook",
          images: file,
        }),
      ),
    );

    expect(response.status).toBe(201);
    expect(uploadImageFile).toHaveBeenCalledWith(file, { folder: expect.stringMatching(/^spots\//) });
    expect(harness.spotInserts[0]).toMatchObject({
      state: "submitted",
      title: "Mistfall Overlook",
      slug: "mistfall-overlook",
    });
    expect(harness.imageInserts).toEqual([
      [
        expect.objectContaining({
          storage_key: "spots/spot-id/spot.webp",
          url: "https://example.test/spot.webp",
          width: 1280,
          height: 720,
          size: 12345,
          alt: "Mistfall Overlook",
          sort_order: 0,
        }),
      ],
    ]);
  });

  it("lets reviewers create and immediately accept a spot", async () => {
    const harness = makeHarness({ role: "moderator" });
    const file = new File(["jpg bytes"], "spot.jpg", { type: "image/jpeg" });

    vi.mocked(uploadImageFile).mockResolvedValue({
      key: "spots/spot-id/spot.webp",
      url: "https://example.test/spot.webp",
      width: 1280,
      height: 720,
      size: 12345,
      contentType: "image/webp",
    });

    const response = await POST(
      makeRequest(
        makeFormData({
          state: "accepted",
          zone: "Upper La Noscea",
          x: "10",
          y: "20",
          title: "Accepted Overlook",
          images: file,
        }),
      ),
    );

    expect(response.status).toBe(201);
    expect(harness.spotInserts[0]).toMatchObject({
      state: "submitted",
      title: "Accepted Overlook",
    });
    expect(harness.spotUpdates[0]).toMatchObject({
      accepted_by: "user-1",
      state: "accepted",
    });
    expect(await responseJson(response)).toMatchObject({
      spot: {
        state: "accepted",
      },
    });
  });

  it("rejects immediate acceptance by non-reviewers", async () => {
    const harness = makeHarness({ role: "submitter" });
    const file = new File(["jpg bytes"], "spot.jpg", { type: "image/jpeg" });

    const response = await POST(
      makeRequest(
        makeFormData({
          state: "accepted",
          zone: "Upper La Noscea",
          x: "10",
          y: "20",
          title: "Accepted Overlook",
          images: file,
        }),
      ),
    );

    expect(response.status).toBe(403);
    expect(await responseJson(response)).toEqual({ error: "Only reviewers can immediately accept spots." });
    expect(harness.spotInserts).toEqual([]);
  });

  it("enforces configurable draft limits before inserting", async () => {
    process.env.XIVSPOTS_MAX_DRAFTS_PER_USER = "1";
    const harness = makeHarness({ draftCount: 1 });

    const response = await POST(
      makeRequest(makeFormData({ state: "draft", zone: "Upper La Noscea", x: "10", y: "20" })),
    );

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toEqual({ error: "You can keep up to 1 drafts." });
    expect(harness.spotInserts).toEqual([]);
  });
});
