import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import {
  RegisterBody,
  LoginBody,
  AuthResponse,
} from "../schemas/auth.schema.js";
import { Static } from "@sinclair/typebox";

type RegisterInput = Static<typeof RegisterBody>;
type LoginInput = Static<typeof LoginBody>;

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/auth/register",
    {
      schema: {
        tags: ["Auth"],
        body: RegisterBody,
        response: {
          200: AuthResponse,
        },
      },
    },
    async (req: FastifyRequest<{ Body: RegisterInput }>, reply) => {
      const { name, email, password, key: customKey } = req.body;
      const key = customKey ?? randomUUID();

      const keyExists = await db.query.users.findFirst({
        where: eq(users.key, key),
      });

      if (keyExists) {
        return reply.status(400).send({ message: "Key already exists" });
      }

      const userExists = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (userExists) {
        return reply.status(400).send({ message: "User already exists" });
      }

      const passwordHash = await hashPassword(password);

      const [user] = await db
        .insert(users)
        .values({ name, email, passwordHash, key })
        .returning({ id: users.id, role: users.role });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return reply.send({ token });
    }
  );

  fastify.post(
    "/auth/login",
    {
      schema: {
        tags: ["Auth"],
        body: LoginBody,
        response: {
          200: AuthResponse,
        },
      },
    },

    async (req: FastifyRequest<{ Body: LoginInput }>, reply) => {
      const { email, password } = req.body;

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return reply.status(401).send({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return reply.send({ token });
    }
  );
};
