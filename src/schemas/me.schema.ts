import { Type } from "@sinclair/typebox";
import { EventResponse } from "./event.schema.js";
import { User } from "./user.schema.js";

export const MeResponse = User;

export const MeEventsResponse = Type.Object({
  created: Type.Array(EventResponse),
  registered: Type.Array(EventResponse),
});
