import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.js";

const sqlite = new Database(process.env.DATABASE_URL || "./eventify.sqlite");

export const db = drizzle(sqlite, { schema });
