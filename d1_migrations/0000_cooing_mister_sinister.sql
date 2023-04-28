CREATE TABLE `Address` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) NOT NULL,
	`line1` text,
	`line2` text,
	`city` text,
	`state` text,
	`countryAlpha3` text NOT NULL,
	`postCode` text
);
--> statement-breakpoint
CREATE TABLE `Customer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL,
	`addressId` integer NOT NULL,
	FOREIGN KEY (`addressId`) REFERENCES `Address`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `Customer_email_idx` ON `Customer` (`email`);