# 🐳 Docker Deployment Guide - KasirQ POS

## Prerequisites

- Docker 24.x atau lebih baru
- Docker Compose v2.x atau lebih baru
- Git (untuk clone repository)

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd class-buddy-notify-15-main
```

### 2. Setup Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit file .env dengan text editor favorit Anda
nano .env
```

Isi dengan credentials Supabase yang valid:
```env
VITE_SUPABASE_URL=https://czopvrdqbuezueacfjyf.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Build & Run

**Development (tanpa Nginx):**
```bash
docker-compose up -d --build
```

**Production (dengan Nginx):**
```bash
docker-compose --profile production up -d --build
```

### 4. Akses Aplikasi

- **Development:** http://localhost:8080
- **Production (via Nginx):** http://localhost

## Docker Commands Reference

### Build & Start

```bash
# Build image
docker-compose build

# Start containers (detached mode)
docker-compose up -d

# Start dengan rebuild (jika ada perubahan code)
docker-compose up -d --build
```

### Monitoring

```bash
# Lihat status containers
docker-compose ps

# Lihat logs real-time
docker-compose logs -f

# Lihat logs specific service
docker-compose logs -f kasirq-frontend

# Check resource usage
docker stats
```

### Stop & Remove

```bash
# Stop containers (data tetap ada)
docker-compose stop

# Stop dan remove containers
docker-compose down

# Remove containers + networks + volumes
docker-compose down -v
```

### Troubleshooting

```bash
# Restart specific service
docker-compose restart kasirq-frontend

# Rebuild dari scratch (hapus cache)
docker-compose build --no-cache

# Masuk ke container untuk debugging
docker exec -it kasirq-pos-app sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' kasirq-pos-app
```

## Architecture

### Multi-stage Build

Dockerfile menggunakan multi-stage build untuk optimasi:

**Stage 1 (Builder):**
- Base image: `node:20-alpine`
- Install dependencies
- Build production bundle

**Stage 2 (Production):**
- Base image: `node:20-alpine`
- Install `serve` (static file server)
- Copy built assets dari stage 1
- Hasil: Image ~150MB (vs ~1GB tanpa multi-stage)

### Services

#### kasirq-frontend
- **Port:** 8080
- **Base:** Node 20 Alpine
- **Server:** serve (lightweight static server)
- **Health Check:** HTTP GET ke `http://localhost:8080` setiap 30 detik

#### nginx (Optional - Production Profile)
- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Base:** nginx:alpine
- **Purpose:** Reverse proxy + static file caching
- **Features:**
  - Gzip compression
  - Static file caching (1 year)
  - Security headers
  - Load balancing ready

### Network

- **kasirq-network:** Bridge network untuk komunikasi antar containers

## Production Deployment

### 1. Prepare SSL Certificates (Optional)

```bash
mkdir ssl
# Copy cert.pem dan key.pem ke folder ssl/
```

### 2. Update nginx.conf

Uncomment SSL configuration di `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ...
}
```

### 3. Deploy dengan Nginx

```bash
docker-compose --profile production up -d --build
```

### 4. Check Health

```bash
# Check container health
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoint
curl http://localhost/
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Docker

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker Image
      run: docker-compose build
    
    - name: Run Tests
      run: docker-compose run kasirq-frontend npm test
    
    - name: Deploy to Server
      run: |
        docker-compose up -d --build
```

## Performance Optimization

### Image Size Optimization

✅ Multi-stage build (Builder + Production)
✅ Alpine Linux base (minimal size)
✅ `.dockerignore` untuk exclude unnecessary files
✅ npm ci untuk deterministic installs

**Hasil:** Image size ~150MB

### Runtime Optimization

✅ Nginx gzip compression
✅ Static file caching (1 year expires)
✅ Health checks untuk auto-recovery
✅ Resource limits (bisa ditambahkan di docker-compose.yml)

### Resource Limits (Optional)

Tambahkan di `docker-compose.yml`:

```yaml
services:
  kasirq-frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Security Best Practices

✅ **Non-root user** di container (serve runs as node user)
✅ **Health checks** untuk detect unhealthy containers
✅ **Security headers** di Nginx (X-Frame-Options, CSP, dll)
✅ **No sensitive data** di image (use environment variables)
✅ **.dockerignore** untuk exclude .env, .git, dll
✅ **Read-only nginx.conf** (mounted as :ro)

## Troubleshooting

### Issue 1: Container tidak start

```bash
# Check logs
docker-compose logs kasirq-frontend

# Common causes:
# - Environment variables tidak diset
# - Port 8080 sudah digunakan
# - Build error
```

**Solution:**
```bash
# Check port usage
netstat -tuln | grep 8080

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue 2: Health check failed

```bash
# Check container status
docker inspect kasirq-pos-app | grep Health -A 10

# Check if app is responding
docker exec kasirq-pos-app wget -O- http://localhost:8080
```

**Solution:**
```bash
# Increase health check start_period
# Edit docker-compose.yml:
healthcheck:
  start_period: 60s  # Increase from 40s
```

### Issue 3: Cannot connect to Supabase

```bash
# Check environment variables
docker exec kasirq-pos-app env | grep SUPABASE

# Test connection from container
docker exec kasirq-pos-app wget -O- $VITE_SUPABASE_URL
```

**Solution:**
```bash
# Update .env file
# Recreate containers
docker-compose down
docker-compose up -d
```

### Issue 4: Nginx 502 Bad Gateway

```bash
# Check if frontend is running
docker-compose ps

# Check nginx logs
docker-compose logs nginx

# Check if frontend is healthy
docker inspect kasirq-pos-app | grep Health
```

**Solution:**
```bash
# Wait for frontend health check to pass
# Or restart frontend
docker-compose restart kasirq-frontend
```

## Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f kasirq-frontend

# Last 100 lines
docker-compose logs --tail=100

# Filter by time
docker-compose logs --since 1h
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Inspect container
docker inspect kasirq-pos-app

# Check disk usage
docker system df
```

## Cleanup

### Remove Old Images

```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune
```

### Complete Reset

```bash
# Stop all containers
docker-compose down

# Remove all containers, networks, images
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up -d --build
```

## Support

Untuk issues atau questions:
- Check [Troubleshooting](#troubleshooting) section
- Review logs dengan `docker-compose logs -f`
- Open issue di GitHub repository

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-02
