# Progress Tracker & Focus Dashboard

A professional, production-ready REST API and single-page application for tracking daily study tasks, habits, and productivity streaks. The interface follows a clean, minimalist SaaS style (inspired by Notion, Stripe, and Linear dashboards) with strict high-contrast dark mode aesthetics.

---

## 🎯 Project Goal

The primary goal of this application is to assist individuals in building consistent study habits through a gamified habit loop:
1. **Focus Sessions**: Track hours spent on individual tasks using an integrated global focus timer that logs session duration directly to tasks.
2. **Task Board**: Manage daily tasks via an interactive drag-and-drop Kanban workflow (Pending, In Progress, Completed).
3. **Habit Automation**: Set up daily, weekday, weekend, or custom weekday recurring templates to automatically generate scheduled daily tasks.
4. **Analytics Heatmap**: Review historical consistency using a 30-day activity completion grid and month-by-month calendar calendars.
5. **Productivity Scoring**: Get real-time productivity scoring, streaks tracking, and daily target focus indicators.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS
- **Routing**: React Router DOM (v7)
- **Forms & Validation**: React Hook Form, Zod
- **Data Visualization**: Recharts (Area, Bar, and Pie Charts)
- **Transitions**: Framer Motion (subtle, fast UI feedback)
- **HTTP Client**: Axios (configured with silent token refresh interceptors)

### Backend (Server)
- **Runtime & Framework**: Node.js, Express, TypeScript
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT Access Token (15m expiry) + HttpOnly HTTP-secured Refresh Token cookie (7d expiry)
- **Security**: Helmet, CORS (configured for credentials), Express Rate Limit (DDoS protection)
- **Documentation**: Swagger API specification (`/api-docs`)
- **Logging**: Morgan middleware + local file system logger

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (version `>= 18.0.0`)
- **MongoDB** (running locally on port `27017` or a cloud-hosted MongoDB Atlas Connection String)

---

### Step 1: Install Dependencies

1. **Clone or Navigate to the Workspace root**:
   ```bash
   cd ProgressTracker
   ```

2. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `/server` directory:
```env
# Server Configurations
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/progresstracker

# Security Keys
JWT_ACCESS_SECRET=your_jwt_access_secret_key_change_me_in_prod
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_change_me_in_prod
```

---

### Step 3: Run the Application

#### Start the Database
Ensure your MongoDB server is active:
```bash
# Example if using mongod locally on Windows Command Prompt
mongod --dbpath "C:\data\db"
```

#### Run Backend Server (Development Mode)
In the `/server` directory, execute:
```bash
npm run dev
```
- The backend API will start on: `http://localhost:5000`
- Swagger API Docs will be available at: `http://localhost:5000/api-docs`

#### Run Frontend Client (Development Mode)
In a separate terminal, navigate to the `/client` directory and execute:
```bash
npm run dev
```
- The client application will launch on: `http://localhost:5173` (or the next available port)

---

### Step 4: Build for Production

To create optimized production builds for deployment:

- **Client Production Build**:
  ```bash
  cd client
  npm run build
  ```
  Generates static output assets in `/client/dist/`.

- **Server Compilation**:
  ```bash
  cd server
  npm run build
  ```
  Compiles TypeScript into raw JavaScript output inside `/server/dist/`. Run the compiled API server with `npm start`.
