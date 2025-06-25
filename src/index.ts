import Fastify from "fastify";
import dotenv from "dotenv";

import swagger from "./plugins/swagger";
import { authRoutes } from "./routes/auth";
import authMiddleware from "./plugins/auth";
import { eventRoutes } from "./routes/events";
import { registrationRoutes } from "./routes/registrations";
import { meRoutes } from "./routes/me";
import { db } from "./db/client.js"; // Import the database client

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

dotenv.config();

const app = Fastify();

await app.register(swagger);
await app.register(meRoutes);
await app.register(registrationRoutes);
await app.register(authRoutes);
await app.register(authMiddleware);
await app.register(eventRoutes);

app.get("/ping", async () => {
  return { pong: true };
});

app.listen({ port: PORT }, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
