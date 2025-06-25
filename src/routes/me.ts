import { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { eq } from "drizzle-orm";
import { users, events, registrations } from "../db/schema.js";
import { MeResponse, MeEventsResponse } from "../schemas/me.schema.js";

export const meRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    "/me",
    {
      schema: {
        tags: ["Me"],
        response: {
          200: MeResponse,
        },
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
      });

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

      return reply.send(user);
    }
  );

  fastify.get(
    "/me/events",
    {
      schema: {
        tags: ["Me"],
        response: {
          200: MeEventsResponse,
        },
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const created = await db.query.events.findMany({
        where: eq(events.createdByUserId, req.user.id),
      });

      const registered = await db
        .select({ event: events })
        .from(registrations)
        .innerJoin(events, eq(events.id, registrations.eventId))
        .where(eq(registrations.userId, req.user.id));

      return reply.send({
        created,
        registered: registered.map((r) => r.event),
      });
    }
  );
};
