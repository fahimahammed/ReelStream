# ReelStream

ReelStream is a video streaming platform that enables users to upload, view, like/unlike videos, and access analytics. It is built using a microservices architecture and leverages technologies like `PostgreSQL`, `Redis`, `Minio`, `FFmpeg`, and `Prometheus` for monitoring.

---

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Architecture Diagram](#architecture-diagram)
- [Technical Decisions](#technical-decisions)

---

## Setup Instructions

### Prerequisites
1. **Docker**: Ensure Docker and Docker Compose are installed.
2. **PostgreSQL Client**: Required for manual database interactions.
3. **FFmpeg**: Required for video processing and thumbnail generation.

### 1. Clone the Repository

```bash
git clone https://github.com/fahimahammed/ReelStream-Server.git
cd reelstream
```

### 2. Set Up Environment Variables

Copy the example environment file and configure necessary values:

```bash
cp .env.example .env
```

Ensure variables such as `DATABASE_URL`, `JWT_SECRET`, and others are correctly set.

### 3. Build and Start Docker Containers

Run the following command to start all services:

```bash
docker-compose up --build
```

This initializes the backend, PostgreSQL, Redis, Minio, and other dependencies.

### 4. Access the Application

- **Backend API**: `http://localhost:3000`
- **Minio Console**: `http://localhost:9001` (Username: `fahim`, Password: `fahim123`)
- **Prometheus Dashboard**: `http://localhost:9090`

---

## API Documentation

### **1. Upload Video**
- **Endpoint:** `POST /api/v1/videos`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  - `video`: File (MP4 format)
  - `title`: (String) Video title
  - `description`: (String) Video description

### **2. Get Videos (Paginated)**
- **Endpoint:** `GET /api/v1/videos?page=1`
- **Query Params:** `page`: (Integer) Page number

### **3. Get Video By ID**
- **Endpoint:** `GET /api/v1/videos/{videoId}`

### **4. Like/Unlike Video**
- **Endpoint:** `POST /api/v1/videos/{videoId}/like`
- **Headers:** `Authorization: Bearer <token>`

### **5. Register User**
- **Endpoint:** `POST /api/v1/auth/register`
- **Request Body:**
  - `name`: (String) Full name
  - `email`: (String) Email address
  - `password`: (String) Password

### **6. Login User**
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  - `email`: (String) Registered email
  - `password`: (String) User password

### **7. Refresh Token**
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Request Body:**
  - `refreshToken`: (String) Refresh token

### **8. Get Analytics**
- **Endpoint:** `GET /api/v1/analytics`
- **Headers:** `Authorization: Bearer <token>`

### **9. Health Check**
- **Endpoint:** `GET /health`
- **Description:** Checks the backend’s health status.

### **10. Metrics**
- **Endpoint:** `GET /metrics`
- **Description:** Provides system performance metrics.

---

## Architecture Diagram

```plaintext
                            +------------+
                            |  Frontend  |
                            +------+-----+
                                   |
                     +-------------+--------------+
                     |                            |
             +-------v-------+              +-----v------+
             |    Backend    |              |   Minio    |
             | (Node.js API) |              | (Object    |
             +-------+-------+              | Storage)   |
                     |                      +------------+
             +-------v-------+                  
             |    PostgreSQL |
             |  (Database)   |
             +-------+-------+
                     |
             +-------v-------+
             |    Redis      |
             | (Cache)       |
             +---------------+
                     |
             +-------v-------+
             |    FFmpeg     |
             |               |
             +---------------+
```

### Components:
- **Frontend**: Communicates with the backend.
- **Backend**: Handles API requests (Node.js + Express).
- **PostgreSQL**: Stores structured data.
- **Redis**: Improves performance with caching.
- **Minio**: Manages video storage.
- **FFmpeg**: Processes video encoding and generates thumbnails.

---

## Technical Decisions

### **1. PostgreSQL**
- Chosen for its relational database capabilities, ideal for structured data.

### **2. Redis**
- Utilized for caching frequently accessed data, enhancing performance.

### **3. Minio**
- Provides scalable object storage, compatible with AWS S3.

### **4. JWT Authentication**
- Ensures secure, stateless user authentication.

### **5. Docker & Docker Compose**
- Facilitates consistent development and deployment environments.

### **6. FFmpeg**
- Used for video processing, including encoding, transcoding, and thumbnail generation.

### **7. Prometheus**
- Monitors system performance and collects metrics.

---

This documentation provides a clear understanding of ReelStream’s setup, API endpoints, architecture, and technical choices.



---

Let me know if you need any modifications or additional sections!
# ReelStream - Backend

This repository contains the backend implementation of ReelStream, providing APIs for video uploads, authentication, analytics, and engagement tracking.

## Features
- TypeScript-based REST API with proper error handling
- Video processing service:
  - Validate video format (mp4 only)
  - Max duration: 60 seconds
  - Max size: 50MB
  - Generate thumbnails
- Caching strategy for video metadata
- Rate limiting implementation
- Logging system for API tracking
- Basic analytics for video views and engagement
- JWT-based authentication (User registration & login)
- Database migrations and index optimization

## Tech Stack
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL
- **Caching & Rate Limiting:** Redis
- **Storage:** MinIO (or AWS S3 alternative)
- **Authentication:** JWT
- **Monitoring:** Prometheus, Grafana
- **Containerization:** Docker

## Installation & Setup

### Prerequisites
- Node.js & Yarn
- Docker & Docker Compose
- PostgreSQL
- Redis
- MinIO (for object storage)
- FFmpeg (for video processing)

### Setup
```sh
cd backend
cp .env.example .env  # Update environment variables
yarn install
yarn run migrate  # Run database migrations
yarn start
```

### Running with Docker
```sh
docker-compose up --build
```

## API Endpoints
### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Videos
- `POST /api/videos/upload` - Upload a video
- `GET /api/videos` - Fetch video reels feed
- `GET /api/videos/:id` - Get video details
- `POST /api/videos/:id/like` - Like/unlike a video
- `GET /api/videos/:id/analytics` - Get video analytics

## Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m 'Add feature-name'`)
4. Push to the branch (`git push origin feature-name`)
5. Create a Pull Request

## License
This project is licensed under the MIT License.



# Endpoint Listing
---

## **🔐 Authentication Routes**
| Method | Endpoint         | Description              | Auth Required |
|--------|----------------|-------------------------|--------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ No |
| `GET` | `/api/auth/profile` | Get logged-in user's profile | ✅ Yes |

---

## **📹 Video Management**
| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|--------------|
| `POST` | `/api/videos/upload` | Upload a video reel | ✅ Yes |
| `GET` | `/api/videos` | Get all public videos (paginated) | ❌ No |
| `GET` | `/api/videos/:id` | Get video details (with caching) | ❌ No |
| `DELETE` | `/api/videos/:id` | Delete user’s own video | ✅ Yes | 

---

## **👤 User Profile & Video List**
| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|--------------|
| `GET` | `/api/users/:id/videos` | Get all videos uploaded by a user | ❌ No |
| `GET` | `/api/users/:id` | Get user profile info | ❌ No |

---

## **📊 Analytics**
| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|--------------|
| `GET` | `/api/analytics/videos` | Get engagement analytics (views, likes, uploads) | ✅ Yes |


---

## **🚀 Features Covered**
✅ **Authentication** – JWT-based auth  
✅ **Video Upload** – MP4 validation, storage, and thumbnail generation  
✅ **Engagement Features** – Like, view tracking  
✅ **Caching & Rate Limiting** – Redis-based caching & request limiting  
✅ **Analytics** – Video & user engagement tracking  
✅ **Health & Monitoring** – API health check & metrics  

---

# important command

docker run \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=fahim" \
  -e "MINIO_ROOT_PASSWORD=fahim123" \
  quay.io/minio/minio server /data --console-address ":9001"

  prometheus --config.file=prometheus.yml
