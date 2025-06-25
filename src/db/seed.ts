import { db } from "./client.js";
import { users, events, registrations } from "./schema.js";
import { hashPassword } from "../utils/hash.js";
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";

const run = async () => {
  await db.run(sql`DELETE FROM registrations`);
  await db.run(sql`DELETE FROM events`);
  await db.run(sql`DELETE FROM users`);

  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("user123");

  const createdUsers = await db
    .insert(users)
    .values([
      {
        name: "Admin",
        email: "admin@example.com",
        passwordHash: adminPassword,
        role: "admin",
        key: randomUUID(),
      },
      {
        name: "Test User",
        email: "user@example.com",
        passwordHash: userPassword,
        role: "user",
        key: randomUUID(),
      },
    ])
    .returning({ id: users.id, key: users.key });

  const [admin, testUser] = createdUsers;

  const createdEvents = await db
    .insert(events)
    .values([
      {
        title: "TypeScript Workshop",
        description: "Практичний воркшоп",
        date: new Date().toISOString(),
        location: "Онлайн",
        createdByUserId: admin.id,
        key: randomUUID(),
      },
      {
        title: "Hackathon 2025",
        description: "24 години командної розробки",
        date: new Date(Date.now() + 86400000).toISOString(),
        location: "Київ",
        createdByUserId: admin.id,
        key: randomUUID(),
      },
    ])
    .returning({ key: events.key });

  const [event1, event2] = createdEvents;

  console.log("Seed complete");
  console.log("Test credentials:");
  console.log(`Admin:    admin@example.com / admin123`);
  console.log(`User:     user@example.com  / user123`);
  console.log("");
  console.log("UUID keys:");
  console.log(`Admin key:       ${admin.key}`);
  console.log(`Test User key:   ${testUser.key}`);
  console.log(`Event #1 key:    ${event1.key}`);
  console.log(`Event #2 key:    ${event2.key}`);
};

run().catch((err) => {
  console.error("Seed failed:", err);

  process.exit(1);
});
