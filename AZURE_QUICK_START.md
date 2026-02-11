# 🚀 SAFE-8 Azure Quick Start

## ⚡ Startup Command
```bash
/home/site/wwwroot/startup.sh
```

## 💚 Health Check
```
Path: /health/ping
```

## 🔑 Required Environment Variables
```bash
NODE_ENV=production
DB_SERVER=your-server.database.windows.net
DB_NAME=SAFE8
DB_USER=your-username
DB_PASSWORD=your-password
CSRF_SECRET=your-32-char-secret
```

## ✅ Quick Test
After deployment:
```bash
# Test health check
curl https://your-app.azurewebsites.net/health/ping
# Returns: OK

# Test detailed health
curl https://your-app.azurewebsites.net/health
# Returns: JSON with database status
```

## 📊 Deployment Logs
Azure Portal → Deployment Center → Logs

## 🔍 Application Logs  
Azure Portal → Monitoring → Log stream

## ⚠️ NPM TAR Warnings
**These are SAFE to ignore** - they don't prevent deployment.

Configuration files suppress most warnings:
- `.npmrc` - Controls npm behavior
- `loglevel=error` - Reduces noise
- `npm ci` - Cleaner installs

## 🎯 Files Modified
✅ `startup.sh` - Application startup
✅ `deploy.sh` - Build process
✅ `.npmrc` - NPM settings
✅ `server/.npmrc` - Server NPM settings
✅ `server/index.js` - Added `/health/ping`
✅ `.deployment` - Azure build config

---
**Everything is configured! Deploy and go live! 🚀**
