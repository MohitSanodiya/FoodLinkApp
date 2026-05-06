# 🚀 FoodLink AI - Complete Setup Guide

Follow these steps to run this project on your system.

---

## 📋 Prerequisites (Install These First)

| Software | Version | Download Link |
|----------|---------|---------------|
| **Java JDK** | 17 or higher | https://adoptium.net/ |
| **Node.js** | 18 or higher | https://nodejs.org/ |
| **MySQL** | 8.0+ | https://dev.mysql.com/downloads/installer/ |
| **Git** (optional) | Latest | https://git-scm.com/ |

### ✅ Verify Installation
Open terminal/command prompt and run:
```bash
java -version        # Should show java 17+
node -v              # Should show v18+
npm -v               # Should show 9+
mysql --version      # Should show 8.0+
```

---

## 🗄️ Step 1: Database Setup

1. Open MySQL terminal:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE foodlink;
EXIT;
```

3. Update database credentials (if your MySQL password is NOT `root`):
   - Edit `backend/.env` → Change `DB_USERNAME` and `DB_PASSWORD`
   - Edit `node-backend/.env` → Change MySQL credentials there too

---

## 🟢 Step 2: Start Spring Boot Backend (Port 8080)

Open **Terminal 1**:

**Linux/Mac:**
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

**Windows:**
```bash
cd backend
mvnw.cmd spring-boot:run
```

⏳ Wait until you see: `Started FoodlinkBackendApplication` in the terminal.
> First run will take a few minutes as it downloads dependencies.

---

## 🟡 Step 3: Start Admin Node Backend (Port 5001)

Open **Terminal 2**:
```bash
cd node-backend
npm install
npm start
```

⏳ Wait until you see: `Server running on port 5001`

---

## 🔵 Step 4: Start Frontend Server (Port 3000)

Open **Terminal 3**:
```bash
node serve-frontend.js
```

⏳ Wait until you see: `Frontend server running at http://localhost:3000/`

---

## 🌐 Step 5: Open in Browser

Go to: **http://localhost:3000**

---

## 🔑 Login Credentials

### Admin Account
| Field    | Value               |
|----------|---------------------|
| Email    | admin@foodlink.com  |
| Password | admin123            |

### To Create New Accounts
1. Go to Register page
2. Create accounts with roles: **HOTEL**, **NGO**, or **GAUSHALA**
3. Login with the registered credentials

---

## 🧪 Seed Admin Account (First Time Only)

If admin account doesn't exist, run:
```bash
cd node-backend
npm run seed
```

---

## ❗ Troubleshooting

| Problem | Solution |
|---------|----------|
| `mvnw: Permission denied` | Run: `chmod +x backend/mvnw` |
| `Port 8080 already in use` | Kill the process: `lsof -i :8080` then `kill <PID>` |
| `MySQL connection refused` | Make sure MySQL service is running |
| `npm: command not found` | Install Node.js from https://nodejs.org |
| `java: command not found` | Install JDK 17 from https://adoptium.net |
| Admin dashboard shows "Backend Unreachable" | Start the Node backend (Step 3) |

---

## 📁 Project Structure

```
FoodLink-AI_2/
├── backend/          → Spring Boot API (Java) - Port 8080
├── node-backend/     → Admin Panel API (Node.js) - Port 5001
├── frontend/         → UI (HTML/CSS/JS) - Port 3000
├── serve-frontend.js → Static file server for frontend
└── setup_db.sql      → Database schema (auto-created by Spring Boot)
```

---

## ⚠️ Important Notes

1. **All 3 terminals must stay open** while using the project
2. **Start in order**: MySQL → Spring Boot → Node Backend → Frontend
3. **First run takes longer** because Maven downloads Java dependencies
4. The database tables are **auto-generated** on first Spring Boot launch
