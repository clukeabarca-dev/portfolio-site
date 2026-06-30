CREATE TABLE `qr_settings` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `qr_codes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `destination_url` text NOT NULL,
  `fg_color` text DEFAULT '#17352f' NOT NULL,
  `bg_color` text DEFAULT '#fbfaf6' NOT NULL,
  `logo_key` text,
  `logo_mime` text,
  `logo_enabled` integer DEFAULT 0 NOT NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_codes_slug_idx` ON `qr_codes` (`slug`);
--> statement-breakpoint
CREATE TABLE `qr_scans` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `qr_code_id` integer NOT NULL,
  `slug` text NOT NULL,
  `destination_url` text NOT NULL,
  `scanned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `country` text,
  `region` text,
  `city` text,
  `device_type` text DEFAULT 'unknown' NOT NULL,
  `browser` text DEFAULT 'unknown' NOT NULL,
  `os` text DEFAULT 'unknown' NOT NULL,
  `referer` text,
  `user_agent` text
);
--> statement-breakpoint
CREATE INDEX `qr_scans_code_time_idx` ON `qr_scans` (`qr_code_id`, `scanned_at`);
--> statement-breakpoint
CREATE INDEX `qr_scans_time_idx` ON `qr_scans` (`scanned_at`);
--> statement-breakpoint
CREATE TABLE `qr_code_users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `qr_code_id` integer NOT NULL,
  `email` text NOT NULL,
  `name` text DEFAULT '' NOT NULL,
  `role` text DEFAULT 'editor' NOT NULL,
  `access_key` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(`qr_code_id`, `email`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_code_users_access_idx` ON `qr_code_users` (`access_key`);
--> statement-breakpoint
CREATE INDEX `qr_code_users_code_idx` ON `qr_code_users` (`qr_code_id`);
