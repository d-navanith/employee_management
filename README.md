# SMART_HR - Enterprise Employee Management System

A role-based Human Resource & Employee Management Web Application built with **React 18/19**, **Vite 8**, **Tailwind CSS v4**, **Lucide Icons**, **Express.js**, **Prisma ORM**, and **PostgreSQL (Neon)**.

---

## 🚀 Live Local Servers

- **Frontend (Vite 8 SPA):** [http://localhost:5173](http://localhost:5173)
- **Backend (Express API):** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Role-Based Authentication & Permissions Matrix

The system implements 2 distinct login roles with database and API-level boundary isolation:

| Role | Email | Password | Secret Code / Token | Capabilities & Boundaries |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin (HR)** | `hr@smarthr.local` | `Admin@123` | **`HR7788`** | **Full System & HR Administration:** Protected by a **Secret Security Code / Token**. Full access to all modules, System Maintenance mode, audit logs, database snapshots, role management & user account delegation, controls and changes the secret code, and complete employee CRUD & sensitive records. |
| **Viewer** | `viewer@smarthr.local` | `Viewer@123` | *Not required* | **Redacted Analytics Only:** View-only access. Shows workforce overview, total count, **Day vs Night shift worker counts**, and **Staff counts**. *All sensitive fields (Salary, Bank Accounts, Personal National ID, Emergency Contacts) are strictly redacted over the API.* |

---

## 🎨 UI & Design Implementation (Matching Design Theme)

The UI was crafted specifically to match the design language from your screenshots:
1. **Sidebar Navigation:**
   - Dark square badge with emerald hexagonal icon: `SMART_HR`
   - Active user role indicator (`SUPER ADMIN`, `VIEWER PORTAL`)
   - Soft rounded pill navigation buttons: `Home`, `Dashboard`, `Employeeee`, `Maintenance & System`, `Manage User Roles`
2. **Dashboard & Analytics:**
   - Stat cards: `Total Employees`, `New Hires (This Year)`, `Employee Exits (This Year)`, `Employees Joining (This Quarter)`, `Employees Relieving (This Quarter)`.
   - Dedicated shift metrics: `Day Shift Workers`, `Night Shift Workers`, `Staff Count`.
   - Distribution widgets: `Department Wise Employee Count` and `Designation Wise Employee Count`.
3. **Employee Master Directory:**
   - `ID`, `Full Name`, `Department` filters with `≈` symbols.
   - `+ Add Employee` black rounded action button (visible only to Developer & HR).
   - Empty state matching screenshot with Create, Clear Filters, and Documentation actions.
4. **Employee Master Record Form:**
   - 8 Tabs: `Overview` | `Address & Contacts` | `Attendance & Leaves` | `Salary` | `Personal Details` | `Profile` | `Joining` | `Exit`.
   - Distinct emerald green **Save** button in top right.
   - Soft gray rounded input styling (`.soft-input`).

---

## 🌐 Honest Assessment: Tech Stack & Free Deployment (Vercel + Render + Neon)

### 1. Frontend: React + Vite + Tailwind on Vercel (Rating: 10/10)
- **Verdict:** Highly Recommended.
- Vercel's free tier provides unlimited automatic builds directly from your GitHub repository, global CDN edge hosting with zero cold starts, and free SSL certificates.

### 2. Database: PostgreSQL on Neon Serverless (Rating: 10/10)
- **Verdict:** Highly Recommended.
- Neon offers a generous free serverless PostgreSQL instance (up to 0.5 GB storage, instant branching, connection pooling). It integrates seamlessly with Prisma.

### 3. Backend: Express.js + Prisma on Render (Rating: 8.5/10)
- **Verdict:** Very good for prototyping and small teams on the free tier.
- **Render's Free Tier Behavior:** Render spins down free Web Services after 15 minutes of inactivity. When a request arrives, it takes ~50 seconds to wake up (cold start).
- **Pro-Tip:** If you deploy to Render free tier, you can use a free pinging service (like UptimeRobot or Cron-job.org) to ping your `/api/health` endpoint every 10 minutes to keep it awake 24/7!
- **Alternative:** If you want zero cold starts on the backend, **Railway** or **Supabase** (as backend/BaaS) are excellent alternatives. However, Express + Render is battle-tested and very easy to manage.

---

## 🚢 How to Deploy to Free Cloud (Step-by-Step)

### Step 1: Create your Neon PostgreSQL Database
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project named `employee-management`.
3. Under "Connection Details", select **Prisma** or **PostgreSQL with pooling**.
4. Copy the connection string. It will look like:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-random-name.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Deploy Backend to Render
1. Push this repository to GitHub.
2. Go to [render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma db push --schema=prisma/schema.postgresql.prisma && node prisma/seed.js`
   - **Start Command:** `node src/index.js`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` = (Your Neon connection string from Step 1)
   - `JWT_SECRET` = (A secure random 32+ character string)
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**. Render will generate a URL like `https://smart-hr-backend.onrender.com`.

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In `client/vite.config.js` or through environment variables, set the API target to your Render URL.
5. Click **Deploy**. Vercel will launch your app in ~30 seconds.

---

## 🛠️ Local Development Commands

To run both services locally on your computer:

```bash
# Start Backend (Port 5000)
cd server
npm run dev

# Start Frontend (Port 5173)
cd client
npm run dev

# Re-seed test database with default users and employees
cd server
npm run seed
```
