import { Type } from "@sinclair/typebox";

export const CreateEventBody = Type.Object({
  key: Type.Optional(Type.String()),
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  date: Type.String({ format: "date-time" }),
  location: Type.String({ minLength: 1 }),
  imageUrl: Type.Optional(Type.String()),
});

export const UpdateEventSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  date: Type.String({ format: "date-time" }),
  location: Type.String(),
});

export const EventResponse = Type.Object({
  key: Type.String(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  date: Type.String(),
  location: Type.String(),
  createdByUserId: Type.Number(),
  imageUrl: Type.Optional(Type.String()),
});
