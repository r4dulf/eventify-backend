import { Type } from "@sinclair/typebox";
import { PublicUser } from "./user.schema.js";

export const RegisterForEventParams = Type.Object({
  key: Type.String(),
});

export const EventIdParams = Type.Object({
  key: Type.String(),
});

export const RegistrationResponse = Type.Object({
  success: Type.Boolean(),
});

export const ParticipantsResponse = Type.Array(PublicUser);
