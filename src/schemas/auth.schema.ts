import { Type } from "@sinclair/typebox";

export const RegisterBody = Type.Object({
  key: Type.Optional(Type.String()),
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 6 }),
});

export const LoginBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 6 }),
});

export const AuthResponse = Type.Object({
  token: Type.String(),
});
