import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";

export interface AuthUser {
  id: number;
  role: "user" | "admin";
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const authPlugin = fp(async (fastify) => {
  fastify.decorateRequest("user");

  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) return;

      const token = authHeader.slice(7);

      try {
        request.user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
      } catch {
        return reply.status(401).send({ message: "Invalid or expired token" });
      }
    }
  );
});

export default authPlugin;
