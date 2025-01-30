# ReelStream

ReelStream is a video streaming platform that allows users to upload, view, like/unlike, and get analytics on videos. It provides a modern backend architecture with microservices and utilizes several powerful tools like Postgres, Redis, Minio, and Prometheus for monitoring.

---

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Architecture Diagram](#architecture-diagram)
- [Technical Decisions Explanation](#technical-decisions-explanation)

---

## Setup Instructions

### Prerequisites
1. **Docker**: Make sure you have Docker and Docker Compose installed.
2. **PostgreSQL Client**: If you'd like to interact with the database manually.

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/reelstream.git
cd reelstream
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env` and update the values for database and API keys.

```bash
cp .env.example .env
```

Ensure that the environment variables such as `DATABASE_URL`, `JWT_SECRET`, and others are set correctly.

### 3. Build and Start the Docker Containers

Run the following command to build the containers:

```bash
docker-compose up --build
```

This will build all services (backend, PostgreSQL, Redis, Minio, etc.) and run them in containers.

### 4. Access the Application

- Backend: `http://localhost:3000`
- Minio Console: `http://localhost:9001` (username: `fahim`, password: `fahim123`)
- Prometheus: `http://localhost:9090`

---

## API Documentation

### **1. Upload Video**

**Endpoint:** `POST /api/v1/video/upload`

**Request Headers:**
- `Authorization`: Bearer `<token>`

**Request Body:**
- `video`: File (MP4 video file)
- `data`: JSON Object
  - `title`: (String) Title of the video
  - `description`: (String) Description of the video

---

### **2. Get Videos (Paginated)**

**Endpoint:** `GET /api/v1/video/upload?page=1`

**Request Headers:**
- `Authorization`: Bearer `<token>`

**Query Params:**
- `page`: (Integer) Page number for pagination

---

### **3. Get Video By ID**

**Endpoint:** `GET /api/v1/video/upload/{videoId}`

**Request Headers:**
- `Authorization`: Bearer `<token>`

**Path Params:**
- `videoId`: (String) ID of the video to fetch

---

### **4. Like/Unlike Video**

**Endpoint:** `POST /api/v1/video/upload/{videoId}/like`

**Request Headers:**
- `Authorization`: Bearer `<token>`

**Path Params:**
- `videoId`: (String) ID of the video to like/unlike

---

### **5. Register User**

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
- `name`: (String) Full name of the user
- `email`: (String) Email address of the user
- `password`: (String) Password for the user account

---

### **6. Login User**

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
- `email`: (String) Registered email address
- `password`: (String) User password

---

### **7. Refresh Token**

**Endpoint:** `POST /api/v1/auth/refresh-token`

**Request Body:**
- `refreshToken`: (String) The refresh token to get a new access token

---

### **8. Get My Profile Analytics**

**Endpoint:** `GET /api/v1/analytics`

**Request Headers:**
- `Authorization`: Bearer `<token>`

---

### **9. Health Check**

**Endpoint:** `GET /health`

**Description:** This endpoint checks the health status of the backend.

---

### **10. Metrics**

**Endpoint:** `GET /metrics`

**Description:** This endpoint provides metrics related to the performance of the backend.

---

## Architecture Diagram

Below is the architecture for **ReelStream**:

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
             |    PostgreSQL  |
             |  (Database)   |
             +-------+-------+
                     |
             +-------v-------+
             |    Redis      |
             | (Cache)       |
             +---------------+

```

**Explanation of Components:**
- **Frontend**: The client-side application which communicates with the backend through API calls.
- **Backend**: The API server built with Node.js and Express that handles requests such as video upload, user registration, etc.
- **PostgreSQL**: The relational database used for storing user and video data.
- **Redis**: In-memory data store used for caching and improving performance.
- **Minio**: Object storage service for storing video files.

---

## Technical Decisions Explanation

1. **PostgreSQL**: 
   - Chosen for its robust relational database capabilities. It is ideal for storing structured data like user information and video metadata.

2. **Redis**:
   - Used as an in-memory cache for faster access to frequently queried data. This improves the overall performance of the platform, especially when querying video lists or user engagement stats.

3. **Minio**:
   - Chosen for object storage because of its compatibility with Amazon S3, making it scalable and cost-effective for storing large video files.

4. **JWT for Authentication**:
   - JSON Web Tokens (JWT) are used for stateless authentication. They allow the backend to authenticate requests securely and ensure user sessions are maintained.

5. **Docker & Docker Compose**:
   - The project is containerized using Docker to ensure consistency across development, testing, and production environments. Docker Compose is used to orchestrate multiple services like the backend, database, cache, and storage.

6. **FFmpeg**:
   - FFmpeg is used to handle video processing tasks such as encoding, transcoding, and streaming. It is a powerful open-source tool that integrates seamlessly with the platform.

7. **Prometheus**:
   - Prometheus is used for monitoring system performance and gathering metrics. It helps track key performance indicators like API response time, system health, and database performance.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
