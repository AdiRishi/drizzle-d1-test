import { sql } from 'drizzle-orm';
import { customType } from 'drizzle-orm/sqlite-core';
import { DateTime } from 'luxon';

export const dateTime = customType<{ data: DateTime; driverData: string }>({
  dataType() {
    return 'text';
  },
  toDriver(value: DateTime): string {
    if (value.isValid) {
      return value.toISO() as string;
    }
    throw new Error(
      `DateTime is invalid. Reason ${value.invalidReason} , Explanation ${value.invalidExplanation}`
    );
  },
  fromDriver(value: string): DateTime {
    // try both ISO and SQL for increased compatibility
    let result: DateTime;
    result = DateTime.fromISO(value, { zone: 'UTC' });
    if (result.isValid) {
      return result;
    }
    result = DateTime.fromSQL(value, { zone: 'UTC' });
    if (result.isValid) {
      return result;
    }

    throw new Error(
      `DateTime is invalid. Reason ${result.invalidReason} , Explanation ${result.invalidExplanation}`
    );
  },
});

export const dateTimeDefaultSQL = sql<string>`strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')`;
