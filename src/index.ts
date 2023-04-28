import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { customerTable } from "./schema";
import { addressTable } from "./schema";

export type Env = {
  __D1_BETA__DB: D1Database;
};

function getDrizzleClient(env: Env): DrizzleD1Database {
  const db = drizzle(env.__D1_BETA__DB, { logger: true });
  return db;
}

async function populateDB(db: DrizzleD1Database) {
  let existingAddress = await db.select().from(addressTable).all();
  if (existingAddress.length === 0) {
    existingAddress.push(
      await db
        .insert(addressTable)
        .values({ countryAlpha3: "AUS" })
        .returning()
        .get()
    );
  }

  const existingCustomer = await db.select().from(customerTable).all();
  if (existingCustomer.length === 0) {
    await db
      .insert(customerTable)
      .values({
        firstName: "John",
        lastName: "Doe",
        email: "test@test.com",
        addressId: existingAddress[0].id,
      })
      .run();
  }
}

export const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = getDrizzleClient(c.env);
  await populateDB(db);

  // test joins
  const customer = await db
    .select()
    .from(customerTable)
    .innerJoin(addressTable, eq(addressTable.id, customerTable.addressId))
    .where(eq(customerTable.email, "test@test.com"))
    .get();

  // direct query test
  const directAddress = await db
    .select()
    .from(addressTable)
    .where(eq(addressTable.id, customer.Customer.addressId))
    .get();

  return c.json(
    {
      joinedCustomer: customer.Customer,
      joinedAddress: customer.Address,
      directAddress: directAddress,
    },
    200
  );
});

app.get("/ping", (c) => c.text("pong"));

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
