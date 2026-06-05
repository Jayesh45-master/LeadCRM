# LeadPro - Premium Lead Management CRM

LeadPro is a sleek, modern, and highly interactive Full-Stack Lead Management CRM built for small businesses to track, qualify, and convert potential customers.

## 🚀 Features

- **Lead Statistics Dashboard**: Visual KPI metrics (Total leads, active pipeline, conversions, conversion rate) with responsive charts and pipeline funnel breakdowns.
- **Robust CRUD Operations**: Full capability to add, view, edit, and delete leads.
- **Advanced Lead Table**: Live search (name, email, company) with input debounce, status filtering, multi-field sorting, and pagination.
- **Inline Status Editor**: Seamless dropdown selector to move leads along the pipeline directly from the table layout.
- **Visual Design System**: Rich, responsive interface utilizing HSL tailored colors, dark/light contrast elements, glassmorphism overlays, custom scrollbars, and fluid animations.
- **Clean REST API**: Fully modular architecture with controllers, models, router, global error-handling, and schema validation.
- **Database Seeder**: Instantly populate the local database with pre-configured realistic lead entries for immediate evaluation.

---

## 🎨 Design Theme & Colors

- 🟣 **Primary (Brand)**: `#6D5DFC` (Royal Purple)
- 🔵 **Accent (Information)**: `#3B82F6` (Blue)
- 🟢 **Success (Converted)**: `#22C55E` (Green)
- 🟡 **Warning (Qualified)**: `#F59E0B` (Amber)
- 🔴 **Danger (Lost)**: `#EF4444` (Red)
- **Backgrounds**:
  - Main Panel: `#F8FAFC`
  - Cards & Modals: `#FFFFFF`
  - Sidebar Navigator: `#0F172A`

---

## 💻 Tech Stack

- **Frontend**: React.js (built on Vite), vanilla CSS, Lucide React icons.
- **Backend**: Node.js, Express.js, CORS, Dotenv, Nodemon.
- **Database**: MongoDB (using Mongoose ODM).

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** running locally on default port `27017` (e.g. `mongodb://localhost:27017/`)

### Setup Instructions

Follow these steps to run both backend and frontend applications concurrently:

#### Step 1: Clone & Configure Backend
1. Open a terminal inside the `/backend` folder:
   ```bash
   cd backend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Set up the local database seeder to populate sample leads:
   ```bash
   npm run seed
   ```
4. Start the backend development server (listens on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

#### Step 2: Configure & Start Frontend
1. Open a separate terminal inside the `/frontend` folder:
   ```bash
   cd frontend
   ```
2. Install React dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Click or navigate to the local server URI in your browser: `http://localhost:5173/`

---

## 🔌 API Endpoints Reference

All backend API routes are prefix-scoped with `/api/leads`:

| HTTP Method | Route | Description | Query Parameters (Optional) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/leads/stats/summary` | Retrieve dashboard KPI counts, conversion rates, and history graphs. | None |
| **GET** | `/api/leads` | Get leads with search, filters, pagination, and sorting. | `search`, `status`, `sortBy`, `order`, `page`, `limit` |
| **GET** | `/api/leads/:id` | Retrieve detailed database record for a single lead. | None |
| **POST** | `/api/leads` | Create and validation check a new CRM lead. | Request body containing name, email, phone, company, status, notes |
| **PUT** | `/api/leads/:id` | Update lead fields, logs, or pipeline statuses. | Request body containing modified fields |
| **DELETE** | `/api/leads/:id` | Delete and remove lead entry from database. | None |

---

## 🗄️ Database Schema Fields

The MongoDB `Lead` collection uses the following data fields:

- **Name** (`String`, Required, Trimmed)
- **Email** (`String`, Required, Unique, Lowercased, Regex Validated)
- **Phone** (`String`, Required)
- **Company** (`String`, Required)
- **Status** (`String`, Enum: `'New'`, `'Contacted'`, `'Qualified'`, `'Converted'`, `'Lost'`, Default: `'New'`)
- **Notes** (`String`, Optional, Default: `""`)
- **Created Date** (`Date`, Default: `Date.now`)
