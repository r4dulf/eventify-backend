# 🎫 Eventify API

Eventify is a REST API for managing events and user registration.  
Implemented with the stack Fastify + Drizzle ORM + SQLite.

---

## ⚙️ Stack

- **Fastify** — high-performance web framework
- **Drizzle ORM** — type-safe ORM with SQLite support
- **TypeBox** — schema typing and Swagger auto-generation
- **SQLite** — file-based database
- **JWT** — token-based authorization

---

## 🛠 Environment Setup (.env)

You need to create a `.env` file in the project root with the following parameters:

```env
JWT_SECRET="your_jwt_secret"
PORT=3000
```

---

## 🚀 Project Launch

```bash
# 1. Install dependencies
npm install

# 2. Create database (or update schema)
npm run drizzle:push

# 3. Seed with test data
npm run seed

# 4. Start server
npm run dev

# 5. Generate types
npm run types
```

> The database is stored in the file `eventify.sqlite`

---

## 🧪 Test Users

All test users are stored in the `test-users.json` file, which is created after running `npm run seed`.

---

## 📄 API Documentation

Swagger is available at:

```
GET /docs
```

It describes all routes with types, parameters, and example responses.

---

## 🛡 License

MIT
