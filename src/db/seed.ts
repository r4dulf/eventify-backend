import { randomUUID } from "crypto";
import { events, registrations, users } from "./schema";
import { faker } from "@faker-js/faker";
import { db } from "./client";
import { hashPassword } from "utils/hash";

await db.delete(registrations);
await db.delete(events);
await db.delete(users);

const getRandomPlaceholderImage = () => {
  const width = faker.number.int({ min: 600, max: 1600 });
  const height = faker.number.int({ min: 400, max: 900 });

  return `https://picsum.photos/${width}/${height}`;
};

const adminPassword = "password123";
const userPassword = "userpassword";

const [admin] = await db
  .insert(users)
  .values({
    key: randomUUID(),
    name: "Admin User",
    email: "admin@example.com",
    passwordHash: await hashPassword(adminPassword),
    role: "admin",
  })
  .returning({ id: users.id });

const generatedUsers = await Promise.all(
  Array.from({ length: 19 }).map(async () => ({
    key: randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash: await hashPassword(userPassword),
    role: "user",
  }))
);

const otherUsers = await db
  .insert(users)
  .values(generatedUsers)
  .returning({ id: users.id, key: users.key });

const allUsers = [admin, ...otherUsers];

const allEvents = await db
  .insert(events)
  .values(
    Array.from({ length: 10 }).map(() => {
      const creator = faker.helpers.arrayElement(allUsers);

      return {
        key: randomUUID(),
        title: faker.lorem.words(3),
        description: faker.lorem.sentence({ min: 10, max: 100 }),
        date: faker.date.future().toISOString(),
        location: faker.location.city(),
        createdByUserId: creator.id,
        imageUrl: getRandomPlaceholderImage(),
      };
    })
  )
  .returning({ id: events.id, key: events.key });

for (const event of allEvents) {
  const participantCount = faker.number.int({ min: 2, max: 8 });
  const participants = faker.helpers.arrayElements(
    otherUsers,
    participantCount
  );

  await db.insert(registrations).values(
    Array.from({ length: 30 }).map(() => ({
      key: randomUUID(),
      eventId: faker.helpers.arrayElement(allEvents).id,
      userId: faker.helpers.arrayElement(allUsers).id,
      registeredAt: faker.date.recent().toISOString(),
    }))
  );
}

console.log("✅ Seed complete with 1 admin, 19 users, 10 events");
