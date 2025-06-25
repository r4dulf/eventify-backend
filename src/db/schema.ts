import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("user").notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),

  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // ISO string
  location: text("location").notNull(),

  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id),
});

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),

  registeredAt: text("registered_at").notNull(), // ISO string
});
