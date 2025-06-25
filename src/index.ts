import Fastify from "fastify";
import cors from "@fastify/cors";
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

const app = Fastify({
  logger: {
    msgPrefix: "[Fastify]",
    level: process.env.NODE_ENV === "production" ? "error" : "info",

    redact: {
      paths: ["req.headers.authorization", "req.body.password"],
      remove: true,
    },
  },
});

await app.register(swagger);

await app.register(cors, {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  credentials: true,
});

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
