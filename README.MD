# SIMPLE E-COMMERCE BACKEND

> A simple e-commerce backend that managing user, product cart and order workflows.

## ✨ Features

- **Caching Architecture:** Utilizes Redis for high-performance cache management.
- **Cache Stampede Prevention:** Integrates Mutex locking mechanisms to safely handle high-demand concurrent resource requests.
- **Background Worker Processing:** Integrates **BullMQ** to offload heavy operations, such as async Order Processing, keeping the main thread responsive.
- **Rate Limiting:** Utilizes Express Rate Limit to protect public API endpoints against brute force and abuse.
- **Efficient Pagination:** Implements Prisma's cursor and limit (`take`) capabilities to ensure highly efficient database resource querying.


## 🛠️ Tech Stack & Prerequisites

Before setting up, ensure you have the following installed:

- **Language Runtime:** Node.js v20.x or higher
- **Database:** MYSQL 15+ (Database), Redis 7.x (Caching)
- **Key Frameworks:** Express, Prisma ORM, TypeScript


## 📦 Installation

Get a local instance running by executing these steps in your terminal:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/okogod/simple-ecommerce-backend.git .
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory and configure the following variables (refer to `.env.example` for details):

```env
PORT=8080

REDIS_HOST="localhost"
REDIS_PORT=6379

DB_NAME="simple_ecommerce_backend"
DB_PASSWORD=
DB_USER="root"
DB_HOST="localhost"
DATABASE_URL="mysql://root@localhost:3306/simple_ecommerce_backend"

JWT_ACCESS_TOKEN="jwt_access_token"
JWT_REFRESH_TOKEN="jwt_refesh_token"
```



## 🚀 Usage

### 1. Start the API Server
To start the application locally in development mode with hot-reloading:

```bash
npm run dev
```
The interactive API documentation will be available locally at: `http://localhost:8080/api-docs`

### 2. Start the Background Worker
In a separate terminal window, launch the task processor for handling orders and heavy tasks:
```bash
npm run worker
```

