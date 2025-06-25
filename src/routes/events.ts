import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { events } from "../db/schema.js";
import { eq, like } from "drizzle-orm";
import { Type, Static } from "@sinclair/typebox";
import { CreateEventBody, EventResponse } from "../schemas/event.schema.js";
import { randomUUID } from "crypto";

type CreateEventInput = Static<typeof CreateEventBody>;
type SearchQuery = { search?: string };

export const eventRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/events",
    {
      schema: {
        tags: ["Events"],
        body: CreateEventBody,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },

    async (req: FastifyRequest<{ Body: CreateEventInput }>, reply) => {
      if (!req.user) return reply.status(401).send({ message: "Unauthorized" });

      const { key: customKey, title, description, date, location } = req.body;
      const key = customKey ?? randomUUID();

      const exists = await db.query.events.findFirst({
        where: eq(events.key, key),
      });
      if (exists) {
        return reply.status(400).send({ message: "Key already exists" });
      }

      await db.insert(events).values({
        key,
        title,
        description,
        date,
        location,
        createdByUserId: req.user.id,
      });

      return reply.send({ success: true });
    }
  );

  fastify.get(
    "/events",
    {
      schema: {
        tags: ["Events"],
        querystring: Type.Object({
          search: Type.Optional(Type.String()),
        }),
        response: {
          200: Type.Array(EventResponse),
        },
      },
    },

    async (req: FastifyRequest<{ Querystring: SearchQuery }>, reply) => {
      const { search } = req.query;
      const result = search
        ? await db
            .select()
            .from(events)
            .where(like(events.title, `%${search}%`))
        : await db.select().from(events);

      return reply.send(result);
    }
  );

  fastify.get(
    "/events/:key",
    {
      schema: {
        tags: ["Events"],
        params: Type.Object({ key: Type.String() }),
        response: {
          200: EventResponse,
        },
      },
    },

    async (req: FastifyRequest<{ Params: { key: string } }>, reply) => {
      const event = await db.query.events.findFirst({
        where: eq(events.key, req.params.key),
      });

      if (!event) {
        return reply.status(404).send({ message: "Event not found" });
      }

      return reply.send(event);
    }
  );
};
