import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";
import { expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from ".";
import { Env } from ".";

const describe = setupMiniflareIsolatedStorage();

describe("worker", () => {
  let worker: UnstableDevWorker;
  let workerEnv: Env;

  beforeAll(async () => {
    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  beforeEach(() => {
    workerEnv = getMiniflareBindings();
  });

  it("Worker should be able to boot successfully", () => {
    expect(worker.address).toBeTruthy();
  });

  it("should respond to the ping route by simulating the worker", async () => {
    const response = await worker.fetch("/ping");
    expect(response).toBeTruthy();
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("pong");
  });

  it("should respond to the ping route via invoking the app", async () => {
    const req = new Request("http://localhost/ping", { method: "GET" });
    const res = await app.fetch(req, workerEnv);
    expect(await res.text()).toBe("pong");
  });
});
