import { expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from ".";
import { Env } from ".";

const describe = setupMiniflareIsolatedStorage();

describe("D1 DB test", () => {
  let workerEnv: Env;
  let ctx: ExecutionContext;

  beforeEach(async () => {
    workerEnv = getMiniflareBindings();
    ctx = new ExecutionContext();
    await workerEnv.__D1_BETA__DB.exec(`
    CREATE TABLE "Address" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,"createdAt" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) NOT NULL,"line1" text,"line2" text,"city" text,"state" text,"countryAlpha3" text NOT NULL,"postCode" text);
    CREATE TABLE "Customer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,"createdAt" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) NOT NULL,"updatedAt" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) NOT NULL,"firstName" text NOT NULL,"lastName" text NOT NULL,"email" text NOT NULL,"addressId" integer NOT NULL,FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON UPDATE cascade ON DELETE set null);
    CREATE INDEX "Customer_email_idx" ON "Customer" ("email");
    `);
  });

  it("should successfully execute the join query", async () => {
    const req = new Request("http://localhost/join-test", { method: "GET" });
    const res = await app.fetch(req, workerEnv, ctx);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;

    expect(json.joinedCustomer.id).toBeTruthy();
    expect(json.joinedAddress.id).toBeNull(); // THIS IS THE BUG
    expect(json.joinedAddress.city).toBe("AUS"); // WHY? THIS SHOULD BE IN countryAlpha3
    expect(json.joinedAddress.countryAlpha3).toBeUndefined(); // BAD
    expect(json.directAddress.id).toBeTruthy();
  });
});
