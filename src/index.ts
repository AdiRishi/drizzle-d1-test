import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { customerTable, addressTable } from "./schema";
import * as schema from "./schema";

export type Env = {
  __D1_BETA__DB: D1Database;
};

function getDrizzleClient(env: Env): DrizzleD1Database<typeof schema> {
  const db = drizzle(env.__D1_BETA__DB, { logger: true, schema });
  return db;
}

async function populateDB(db: DrizzleD1Database<typeof schema>) {
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

app.get("/", (c) =>
  c.text("Visit one of the following endpoints - /join-test")
);

app.get("/join-test", async (c) => {
  const db = getDrizzleClient(c.env);
  await populateDB(db);

  // test joins
  const defaultJoin = await db
    .select()
    .from(customerTable)
    .innerJoin(addressTable, eq(addressTable.id, customerTable.addressId))
    .where(eq(customerTable.email, "test@test.com"))
    .get();

  // direct query test
  const directAddress = await db
    .select()
    .from(addressTable)
    .where(eq(addressTable.id, defaultJoin.Customer.addressId))
    .get();

  const explicitSelect = await db
    .select({
      Customer: customerTable,
      Address: addressTable,
    })
    .from(customerTable)
    .innerJoin(addressTable, eq(addressTable.id, customerTable.addressId))
    .where(eq(customerTable.email, "test@test.com"))
    .get();

  console.log(explicitSelect);

  return c.json(
    {
      joinedCustomer: defaultJoin.Customer,
      joinedAddress: defaultJoin.Address,
      directAddress,
      explicitSelect,
    },
    200
  );
});

app.get("/relation-test", async (c) => {
  const db = getDrizzleClient(c.env);
  await populateDB(db);

  const customer = await db.query.customerTable.findFirst({
    with: { address: true },
    where: eq(customerTable.email, "test@test.com"),
  });
  return c.json(customer);
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
