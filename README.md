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
