# NestJS Prisma Auth Template

<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  🚀 Template NestJS dengan Prisma (MySQL) untuk autentikasi 
  (Register, Login, JWT, Role-based Access)
</p>

---

## ✨ Fitur

- Register dengan hashing password (`bcrypt`)
- Login dengan JWT
- Refresh token (opsional)
- Role-based Authorization (`admin`, `user`)
- Prisma ORM (MySQL)
- Struktur modular & clean code

---

## 📦 Project setup

Clone project ini lalu install dependency:

```bash
$ npm install
```

Copy file `.env.example` ke `.env` lalu isi variabel berikut:

```env
DATABASE_URL="mysql://user:password@localhost:3306/db_name"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="1h"
BCRYPT_SALT_ROUNDS=12
```

---

## 🛠️ Prisma setup

Generate Prisma Client:

```bash
$ npx prisma generate
```

Jalankan migrasi database sesuai schema:

```bash
$ npx prisma migrate dev --name init
```

---

## 🚀 Menjalankan Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

---

## 🔑 Autentikasi

- **Register** → `POST /auth/register`  
  body:
  ```json
  {
    "username": "johndoe",
    "password": "password123",
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

- **Login** → `POST /auth/login`  
  body:
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```

- **Protected Route** → Gunakan header `Authorization: Bearer <token>`  
  contoh:
  ```bash
  curl -H "Authorization: Bearer <token>" http://localhost:3000/users/profile
  ```

---

## 🛡️ Role-based Access

Gunakan decorator `@Roles('admin')` di controller untuk membatasi akses.

Contoh:
```ts
@Get('admin-only')
@Roles('admin')
getAdminData() {
  return { message: 'Ini hanya untuk admin' };
}
```

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)

---

## 📜 License

[MIT licensed](LICENSE)
