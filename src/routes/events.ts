import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { events, registrations } from "../db/schema.js";
import { eq, like } from "drizzle-orm";
import { Type, Static } from "@sinclair/typebox";
import {
  CreateEventBody,
  EventResponse,
  UpdateEventSchema,
} from "../schemas/event.schema.js";
import { randomUUID } from "crypto";
import multipart from "@fastify/multipart";
import pump from "pump";
import fs from "fs";

type CreateEventInput = Static<typeof CreateEventBody>;
type SearchQuery = { search?: string };

type UpdateEventInput = {
  Params: { key: string };
  Body: {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
  };
};

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

  await fastify.register(multipart);

  fastify.post<{ Params: { key: string } }>("/events/:key/image", {
    schema: {
      tags: ["Events"],
    },
    handler: async (req, reply) => {
      if (!req.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const file = await req.file();
      const { key } = req.params;

      if (!file || !file.filename) {
        return reply.status(400).send({ message: "No file uploaded" });
      }

      const ext = file.filename.split(".").pop();
      const filename = `${key}.${ext}`;
      const filepath = `public/uploads/${filename}`;

      await pump(file.file, fs.createWriteStream(filepath));

      await db
        .update(events)
        .set({ imageUrl: `/uploads/${filename}` })
        .where(eq(events.key, key));

      return reply.send({ success: true, url: `/uploads/${filename}` });
    },
  });

  fastify.put(
    "/events/:key",
    {
      schema: {
        tags: ["Events"],
        params: Type.Object({
          key: Type.String(),
        }),
        body: UpdateEventSchema,
        response: {
          200: EventResponse,
        },
      },
    },

    async (req: FastifyRequest<UpdateEventInput>, reply) => {
      if (!req.user) return reply.status(401).send({ message: "Unauthorized" });

      const { key } = req.params;
      const event = await db.query.events.findFirst({
        where: eq(events.key, key),
      });

      if (!event) return reply.status(404).send({ message: "Event not found" });

      const isOwner = event.createdByUserId === req.user.id;
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return reply.status(403).send({ message: "Forbidden" });
      }

      await db
        .update(events)
        .set({
          title: req.body.title ?? event.title,
          description: req.body.description ?? event.description,
          date: req.body.date ?? event.date,
          location: req.body.location ?? event.location,
        })
        .where(eq(events.key, key));

      const updated = await db.query.events.findFirst({
        where: eq(events.key, key),
      });

      return reply.send(updated!);
    }
  );

  fastify.delete(
    "/events/:key",
    {
      schema: {
        tags: ["Events"],
        params: Type.Object({
          key: Type.String(),
        }),
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (req: FastifyRequest<{ Params: { key: string } }>, reply) => {
      if (!req.user) return reply.status(401).send({ message: "Unauthorized" });

      const { key } = req.params;
      const event = await db.query.events.findFirst({
        where: eq(events.key, key),
      });

      if (!event) return reply.status(404).send({ message: "Event not found" });

      const isOwner = event.createdByUserId === req.user.id;
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return reply.status(403).send({ message: "Forbidden" });
      }

      await db.delete(registrations).where(eq(registrations.eventId, event.id));
      await db.delete(events).where(eq(events.key, key));

      return reply.send({ success: true });
    }
  );
};
