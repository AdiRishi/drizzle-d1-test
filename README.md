# Made to isolate bugs with Drizzle-ORM and Cloudflare D1

## Bug: Inner joins do not work correctly

Steps to reproduce

1. Clone this repository
2. Run `yarn install`
3. run `yarn wrangler d1 migrations apply db --local`

Now you can either interact with the app via in two ways

1. Local dev server (via `yarn dev`)
2. Vitest testing (via `yarn test`)

Either way, visiting the `/` route will demonstrate the error at hand.

**Tldr on the bug**
In this example we have two tables - `Customer` and `Address`.
The `Address` table has a few columns, but we only populate the `countryAlpha3` column.

Now we run this query

```ts
const defaultJoin = await db
  .select()
  .from(customerTable)
  .innerJoin(addressTable, eq(addressTable.id, customerTable.addressId))
  .where(eq(customerTable.email, "test@test.com"))
  .get();
```

We would expect that `defaultJoin.Address.countryAlpha3` has the value `AUS`. However, the joined address table seems to be totally wrong. It has no `id` present and the value of `AUS` is somehow in the `city` column.
