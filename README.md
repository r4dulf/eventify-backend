# 🎫 Eventify API

Eventify — це REST API для керування подіями та реєстрацією користувачів.  
Реалізовано на стеку Fastify + Drizzle ORM + SQLite.

---

## ⚙️ Стек

- **Fastify** — високошвидкісний веб-фреймворк
- **Drizzle ORM** — типобезпечний ORM з підтримкою SQLite
- **TypeBox** — типізація схем і автогенерація Swagger
- **SQLite** — файлова база даних
- **JWT** — авторизація токенами

---

## 🚀 Запуск проєкту

```bash
# 1. Встановити залежності
npm install

# 2. Створити базу (або оновити схему)
npx drizzle-kit push

# 3. Засіяти тестовими даними
npm run seed

# 4. Запустити сервер
npm run dev
```

> База зберігається у файлі `eventify.sqlite`

---

## 🧪 Тестові користувачі

```txt
admin@example.com / admin123
user@example.com  / user123
```

JWT видається через `/auth/login`  

---

## 📄 API документація

Swagger доступний на:

```
GET /docs
```

Описує всі маршрути з типами, параметрами, прикладами відповідей.

---

## 🛡 License

MIT
