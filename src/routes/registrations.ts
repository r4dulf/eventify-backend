import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { events, users, registrations } from "../db/schema.js";
import {
  RegisterForEventParams,
  RegistrationResponse,
  ParticipantsResponse,
} from "../schemas/registration.schema.js";
import { Type } from "@sinclair/typebox";
import { randomUUID } from "crypto";

export const registrationRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/events/:key/register",
    {
      schema: {
        tags: ["Registrations"],
        params: RegisterForEventParams,
        body: Type.Object({ key: Type.Optional(Type.String()) }),
        response: { 200: RegistrationResponse },
      },
    },
    async (
      req: FastifyRequest<{
        Params: { key: string };
        Body: { key?: string };
      }>,
      reply
    ) => {
      if (!req.user) return reply.status(401).send({ message: "Unauthorized" });

      const event = await db.query.events.findFirst({
        where: eq(events.key, req.params.key),
      });

      if (!event) return reply.status(404).send({ message: "Event not found" });

      const already = await db.query.registrations.findFirst({
        where: and(
          eq(registrations.userId, req.user.id),
          eq(registrations.eventId, event.id)
        ),
      });

      if (already)
        return reply.status(400).send({ message: "Already registered" });

      const key = req.body.key ?? randomUUID();

      const duplicate = await db.query.registrations.findFirst({
        where: eq(registrations.key, key),
      });

      if (duplicate)
        return reply.status(400).send({ message: "Key already exists" });

      await db.insert(registrations).values({
        key,
        userId: req.user.id,
        eventId: event.id,
        registeredAt: new Date().toISOString(),
      });

      return reply.send({ success: true });
    }
  );

  fastify.get(
    "/events/:key/participants",
    {
      schema: {
        tags: ["Registrations"],
        params: RegisterForEventParams,
        response: {
          200: ParticipantsResponse,
        },
      },
    },

    async (req: FastifyRequest<{ Params: { key: string } }>, reply) => {
      const event = await db.query.events.findFirst({
        where: eq(events.key, req.params.key),
      });

      if (!event) return reply.status(404).send({ message: "Event not found" });

      const participants = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(registrations)
        .innerJoin(users, eq(users.id, registrations.userId))
        .where(eq(registrations.eventId, event.id));

      return reply.send(participants);
    }
  );

  fastify.get("/events/popular", async (req, res) => {
    const limit = Number((req.query as any).limit ?? 5);

    const popularEvents = await db
      .select({
        key: events.key,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        createdByUserId: events.createdByUserId,
        registrationsCount: count(registrations.id).as("registrationsCount"),
        imageUrl: events.imageUrl,
      })
      .from(events)
      .leftJoin(registrations, sql`${events.id} = ${registrations.eventId}`)
      .groupBy(events.id)
      .orderBy(desc(sql`registrationsCount`))
      .limit(limit);

    return res.send(popularEvents);
  });
};
