# Quick Start Guide - Wabe GmbH Portal

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Database Setup
```bash
# Create PostgreSQL database
createdb wabe_db

# Initialize schema
cd backend
node -e "import('./db/schema.js').then(m => m.initializeDatabase())"
cd ..
```

### Step 3: Configure Environment

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env and set:
# - NODE_ENV=development
# - JWT_SECRET=your_random_secret_32_chars_here
# - DB_URL=postgresql://localhost/wabe_db
# - ALLOWED_ORIGINS=http://localhost:3000
cd ..
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
# Edit .env and set:
# - VITE_API_URL=http://localhost:3001
cd ..
```

### Step 4: Run Development Servers
```bash
npm run dev
```

Backend: http://localhost:3001
Frontend: http://localhost:3000

## Generate JWT Secret

```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256})) | Select-Object -First 32
```

## Test Accounts

After first run, create an account in the app:
- Email: test@example.com
- Password: Test@12345

## Common Issues

### PostgreSQL not running?
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Port 3001 already in use?
```bash
# Kill process on port 3001
lsof -i :3001 | awk 'NR!=1 {print $2}' | xargs kill -9
```

### Clear node_modules?
```bash
rm -rf backend/node_modules frontend/node_modules
npm run install-all
```

## Security Features Implemented

✅ JWT Authentication with 24h expiration
✅ Password hashing (bcrypt 12 rounds)
✅ CORS whitelist
✅ Rate limiting (5 login attempts / 15 min)
✅ File type validation
✅ File header verification
✅ SQL injection prevention (parameterized queries)
✅ XSS protection
✅ CSRF tokens
✅ Secure headers (Helmet)
✅ Audit logging
✅ Encrypted passwords in database
✅ File deduplication (SHA-256)
✅ Random file naming (UUID)

## Next Steps

1. Configure PostgreSQL with SSL for production
2. Set up HTTPS/TLS certificates
3. Configure production domain in CORS
4. Set up monitoring and logging
5. Configure automated database backups
6. Deploy to production platform (Railway, Render, etc.)

## Deployment

See README.md for detailed production deployment instructions.

---

**Questions?** Check the README.md file for comprehensive documentation.
