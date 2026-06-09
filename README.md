# Wabe GmbH - Kundenportal

Enterprise-grade customer portal with security-first architecture for document and file management.

## Security Architecture

### Core Security Features

1. **Authentication & Authorization**
   - JWT tokens with 24-hour expiration
   - bcrypt password hashing (12 rounds)
   - Rate limiting on login (5 attempts per 15 minutes)
   - Token refresh mechanism
   - Session invalidation on logout

2. **File Upload Security**
   - File type validation (whitelist: JPG, PNG, PDF, WEBP)
   - MIME type verification
   - File header verification (magic number checking)
   - Duplicate file detection via SHA-256 hashing
   - Maximum file size limits (10 MB per file)
   - Secure filename generation (UUIDs)
   - Files stored outside web root
   - Secure file permissions (700)

3. **Database Security**
   - PostgreSQL with parameterized queries (prevents SQL injection)
   - Connection pooling with SSL
   - Password hashing for storage
   - Audit logging for all actions
   - Row-level access control

4. **API Security**
   - HTTPS/TLS enforced in production
   - CORS whitelist
   - Helmet security headers
   - Content Security Policy (CSP)
   - Rate limiting (30 requests per minute per IP)
   - Input sanitization and validation
   - X-Frame-Options: DENY
   - No sensitive data in error messages

5. **Frontend Security**
   - No API keys in client code
   - Environment variables for secrets
   - XSS protection via React
   - Secure token storage (localStorage with httpOnly alternatives)
   - HTTPS enforcement
   - CSP headers

## Project Structure

```
wabe-gmbh-project/
├── backend/
│   ├── server.js              # Express server with security middleware
│   ├── package.json
│   ├── .env.example           # Environment template
│   ├── middleware/
│   │   ├── security.js        # Security utilities and validation
│   │   └── auth.js            # JWT authentication
│   ├── db/
│   │   ├── pool.js            # PostgreSQL connection pool
│   │   └── schema.js          # Database schema initialization
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   └── upload.js          # File upload endpoints
│   └── uploads/               # Secure file storage (not in git)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js         # Build configuration
│   ├── index.html             # Security headers
│   ├── .env.example           # Environment template
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Main app component
│       ├── App.css            # Global styles
│       ├── api.js             # API client with interceptors
│       ├── contexts/
│       │   └── AuthContext.jsx # Auth state management
│       └── pages/
│           ├── Landing.jsx    # Landing page
│           ├── Login.jsx      # Login page
│           ├── Register.jsx   # Registration page
│           ├── Dashboard.jsx  # File management
│           └── *.css          # Page styles
│
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

### 2. Environment Configuration (.env)

```env
NODE_ENV=production
PORT=3001

# Generate a strong JWT secret (at least 32 characters)
JWT_SECRET=your_super_secret_key_generate_this_randomly_at_least_32_chars

# PostgreSQL connection
DB_URL=postgresql://user:password@localhost:5432/wabe_db

# CORS allowed origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File upload limits
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb wabe_db

# Initialize schema (runs automatically on first server start)
node -e "import('./db/schema.js').then(m => m.initializeDatabase())"
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
```

### 5. Frontend Environment (.env)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_TOKEN_STORAGE_KEY=wabe_auth_token
VITE_SESSION_TIMEOUT=1800000
```

## Running Locally

### Backend
```bash
cd backend
npm run dev  # Development with nodemon
# or
npm start    # Production
```

### Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## Production Deployment

### Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT_SECRET (32+ characters, use: `openssl rand -hex 32`)
- [ ] Configure HTTPS/TLS certificates
- [ ] Set up PostgreSQL with SSL connections
- [ ] Configure CORS with exact domain names
- [ ] Enable firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring and logging
- [ ] Use strong database passwords
- [ ] Enable rate limiting
- [ ] Set up DDoS protection
- [ ] Regular security updates

### Recommended Hosting

**Backend:**
- Railway.app
- Render.com
- Fly.io
- AWS EC2 with RDS
- DigitalOcean App Platform

**Frontend:**
- Vercel
- Netlify
- AWS CloudFront + S3
- GitHub Pages

### Database Backups

```bash
# Backup
pg_dump wabe_db > backup_$(date +%Y%m%d).sql

# Restore
psql wabe_db < backup_20240101.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

### File Management
- `POST /api/upload/files` - Upload files (multipart/form-data)
- `GET /api/upload/project/:projectId` - List project files
- `DELETE /api/upload/file/:fileId` - Delete file

All endpoints except `/health` require JWT authentication in `Authorization` header:
```
Authorization: Bearer <token>
```

## Security Best Practices

1. **Secrets Management**
   - Never commit .env files
   - Use environment variables for all secrets
   - Rotate JWT secrets periodically
   - Use strong passwords (20+ characters)

2. **File Handling**
   - Regularly scan uploads for malware
   - Implement virus scanning integration (ClamAV)
   - Monitor upload directory size
   - Archive old files

3. **Monitoring**
   - Log all authentication attempts
   - Monitor failed logins
   - Alert on unusual activity
   - Regular audit log reviews

4. **Updates**
   - Keep dependencies updated: `npm audit`
   - Regular security patches
   - Stay informed of CVEs

5. **Testing**
   - Regular penetration testing
   - Security vulnerability scans
   - Load testing

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services
```

### JWT Secret Validation
```
Error: JWT_SECRET must be at least 32 characters
```
Solution: Generate strong secret
```bash
openssl rand -hex 32
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
Solution: Change PORT in .env or kill existing process
```bash
lsof -i :3001
kill -9 <PID>
```

## Support & Maintenance

- Check logs regularly: `npm run logs`
- Monitor database size: `SELECT pg_size_pretty(pg_database_size('wabe_db'));`
- Review audit logs monthly
- Test backups quarterly

## License

Proprietary - Wabe GmbH

---

**Last Updated:** 2024
**Version:** 1.0.0
