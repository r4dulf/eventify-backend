import { Type } from "@sinclair/typebox";

export const User = Type.Object({
  id: Type.Number(),
  key: Type.String(),
  name: Type.String(),
  email: Type.String(),
  role: Type.Union([Type.Literal("user"), Type.Literal("admin")]),
});

export const PublicUser = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  email: Type.String(),
});

export const PublicUserList = Type.Array(PublicUser);
