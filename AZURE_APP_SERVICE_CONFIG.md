# Azure App Service Configuration for SAFE-8

## Application Settings (Environment Variables)

Configure these in Azure Portal → Configuration → Application settings:

```
NODE_ENV=production
PORT=8080 (or use default)
WEBSITES_PORT=8080

# Database
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password

# CSRF
CSRF_SECRET=your-csrf-secret-key-min-32-chars

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Redis (optional)
REDIS_URL=redis://your-redis.redis.cache.windows.net:6380
REDIS_PASSWORD=your-redis-key

# CORS
CORS_ORIGIN=https://your-app.azurewebsites.net
```

## Startup Command

In Azure Portal → Configuration → General settings → Startup Command:

```bash
/home/site/wwwroot/startup.sh
```

OR if you prefer direct node startup:

```bash
cd /home/site/wwwroot/server && node index.js
```

## Health Check Configuration

In Azure Portal → Monitoring → Health check:

**Health check path:** `/health/ping`

**This enables:**
- Automatic unhealthy instance removal
- Instance replacement when health checks fail
- Improved application availability

## Build Configuration

The `.deployment` file tells Azure to run the build during deployment:

```
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
SCM_SCRIPT_GENERATOR_ARGS=--node
```

## Deployment Process

When you deploy, Azure will:

1. **Sync files** to `/home/site/wwwroot`
2. **Run deploy.sh** (if custom deployment)
   - Install root dependencies
   - Build frontend (Vite)
   - Install server dependencies (production only)
3. **Execute startup.sh** when starting
   - Verify build
   - Start Node.js server

## NPM TAR Warnings - Resolution

The `npm warn tar TAR_ENTRY_ERROR` warnings you're seeing are:

### What they are:
- Non-fatal warnings during package extraction
- Often caused by path length limits or filesystem issues
- Do NOT prevent your app from running

### Solutions Implemented:

1. **`.npmrc` configuration** - Reduces logging verbosity
   ```
   loglevel=error
   progress=false
   ```

2. **`npm ci` instead of `npm install`** - Cleaner, faster installs
   - Uses package-lock.json exactly
   - Removes node_modules before install
   - More reliable in CI/CD

3. **Offline caching** - Reduces network issues
   ```
   prefer-offline=true
   ```

4. **Legacy peer deps** - Avoids dependency conflicts
   ```
   legacy-peer-deps=true
   ```

### If warnings persist:

They won't break your application. Azure will:
- ✅ Complete the install despite warnings
- ✅ Start your application successfully
- ✅ Serve your app normally

You can verify this by checking:
1. Deployment logs show "Build complete"
2. Application starts without errors
3. Health check `/health/ping` returns 200 OK

## File Structure

```
/home/site/wwwroot/
├── dist/              # Built frontend (Vite output)
├── server/
│   ├── node_modules/  # Server dependencies (production)
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   ├── index.js       # Main server file
│   └── package.json
├── node_modules/      # Root dependencies (pruned to production)
├── startup.sh         # Startup script
├── deploy.sh          # Build script
├── package.json       # Root package file
├── .npmrc             # NPM config
└── web.config         # IIS config (if needed)
```

## Troubleshooting

### Check Deployment Logs
Azure Portal → Deployment Center → Logs

### Check Application Logs
Azure Portal → Monitoring → Log stream

### Test Health Endpoint
```bash
curl https://your-app.azurewebsites.net/health/ping
# Should return: OK

curl https://your-app.azurewebsites.net/health
# Should return JSON with status: "OK"
```

### SSH into Container (if needed)
Azure Portal → Development Tools → SSH → Go

```bash
cd /home/site/wwwroot
ls -la
cd server
node index.js  # Test manually
```

## Performance Optimizations

1. **Compression** enabled in server (gzip)
2. **Static file caching** (dist folder)
3. **Production build** (minified, optimized)
4. **Database connection pooling** (mssql)
5. **Rate limiting** (express-rate-limit)
6. **Health checks** (automatic instance recovery)

## Security Features

✅ Helmet.js security headers
✅ CSRF protection
✅ SQL injection prevention (parameterized queries)
✅ Password hashing (bcrypt)
✅ Rate limiting (auth endpoints)
✅ CORS configuration
✅ HTTPS enforcement (production)

---

## Quick Deploy Checklist

- [ ] Set all environment variables in Azure
- [ ] Configure startup command: `/home/site/wwwroot/startup.sh`
- [ ] Configure health check path: `/health/ping`
- [ ] Deploy code (via Git, GitHub Actions, or ZIP)
- [ ] Wait for build to complete
- [ ] Verify deployment logs
- [ ] Test health endpoint
- [ ] Test application functionality

---

**Your app is ready for production! 🚀**
