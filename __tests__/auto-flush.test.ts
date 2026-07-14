/**
 * Auto-flush integration tests: GPS task → tryFlushPoints → real API → real DB.
 *
 * Only Expo native modules are mocked. HTTP requests hit production.
 */

// ---- API base override ----
jest.mock("../services/config", () => ({
  getApiBase: jest.fn(() => Promise.resolve("https://trackhub-to06.onrender.com")),
}));

import * as TaskManager from "expo-task-manager";
import {
  clearSyncRide,
  flushAllPending,
  initSyncRide,
  startTracking,
} from "../services/location";

// ---- Auth ----
const BASE = "https://trackhub-to06.onrender.com";
const USER = { email: "ci-test@trackhub.dev", password: "citest-2026!!" };
let token: string | null = null;

async function auth() {
  if (token) return;
  let r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER),
  });
  if (!r.ok) {
    r = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...USER, username: "citest" }),
    });
  }
  token = (await r.json()).accessToken;
  const t = require("../services/tokens");
  t.getAccessToken = () => token;
  t.tokensReady = Promise.resolve();
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    },
  });
  if (!r.ok) throw new Error(`${opts.method ?? "GET"} ${path} → ${r.status}`);
  return r.json();
}

// ---- GPS task callback (registered at module init) ----
let taskCb: ((p: {
  data: { locations: Array<{ coords: { latitude: number; longitude: number; altitude: number | null; accuracy: number | null; speed: number | null }; timestamp: number }> };
  error: { message: string } | null;
}) => Promise<void>) | null = null;

for (const c of (TaskManager.defineTask as jest.Mock).mock.calls) {
  if (c[0] === "TRACKHUB_LOCATION") taskCb = c[1] as never;
}

function fireGPS(locs: Array<{ lat: number; lon: number; speed?: number; alt?: number; ts?: number }>) {
  if (!taskCb) throw new Error("GPS task not registered");
  return taskCb({
    data: {
      locations: locs.map((l) => ({
        coords: {
          latitude: l.lat,
          longitude: l.lon,
          altitude: l.alt ?? null,
          accuracy: 5,
          speed: l.speed ?? null,
        },
        timestamp: l.ts ?? Date.now(),
      })),
    },
    error: null,
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- Per-test ride ----
let rideId: number;
const cleanup: number[] = [];

beforeAll(() => auth());

beforeEach(async () => {
  clearSyncRide();
  const ride = await apiFetch("/rides", {
    method: "POST",
    body: JSON.stringify({ startTime: new Date().toISOString() }),
  });
  rideId = ride.id;
  cleanup.push(rideId);
  initSyncRide(rideId);
  await startTracking();
  await wait(100);
});

afterAll(async () => {
  for (const id of cleanup) {
    await fetch(`${BASE}/rides/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
});

// ═══════════════════════════════════════════════════════

const N = 200;

describe("auto-flush: GPS task → real API", () => {
  test(`${N} GPS ticks — all points reach backend`, async () => {
    for (let i = 0; i < N; i++) {
      await fireGPS([{
        lat: 53.65 + i * 0.00001,
        lon: 23.86 + i * 0.00001,
        speed: 3 + (i % 5),
        alt: 150 + (i % 3) * 2,
        ts: Date.now() + i * 3000,
      }]);
    }
    await wait(15000);

    const full = await apiFetch(`/rides/${rideId}`);
    expect(full.trackPoints.length).toBeGreaterThanOrEqual(N);
  }, 120000);

  test(`${N} points — latitudes are monotonic`, async () => {
    for (let i = 0; i < N; i++) {
      await fireGPS([{
        lat: 53.65 + i * 0.00001,
        lon: 23.86,
        ts: Date.now() + i * 3000,
      }]);
    }
    await wait(15000);

    const full = await apiFetch(`/rides/${rideId}`);
    const pts = full.trackPoints;
    expect(pts.length).toBeGreaterThanOrEqual(N);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].latitude).toBeGreaterThanOrEqual(pts[i - 1].latitude);
    }
  }, 120000);

  test("speed and elevation values are stored correctly", async () => {
    await fireGPS([
      { lat: 53.650, lon: 23.860, speed: 0, alt: 100 },
      { lat: 53.651, lon: 23.861, speed: 5.5, alt: 102 },
      { lat: 53.652, lon: 23.862, speed: 12.3, alt: 105 },
    ]);
    await wait(5000);

    const full = await apiFetch(`/rides/${rideId}`);
    expect(full.trackPoints.length).toBe(3);
    expect(full.trackPoints[0].speed).toBe(0);
    expect(full.trackPoints[1].speed).toBeCloseTo(5.5, 1);
    expect(full.trackPoints[2].speed).toBeCloseTo(12.3, 1);
    expect(full.trackPoints[0].elevation).toBe(100);
    expect(full.trackPoints[2].elevation).toBe(105);
  }, 30000);

  test("flushAllPending after auto-flush does not duplicate", async () => {
    for (let i = 0; i < 10; i++) {
      await fireGPS([{ lat: 53.65 + i * 0.00001, lon: 23.86, ts: Date.now() + i * 3000 }]);
    }
    await wait(5000);

    const before = (await apiFetch(`/rides/${rideId}`)).trackPoints.length;
    await flushAllPending();
    await wait(2000);
    const after = (await apiFetch(`/rides/${rideId}`)).trackPoints.length;

    expect(after).toBe(before);
  }, 30000);
});
