
# 🚀 Campus-Poll

**Campus-Poll** is a professional, full-stack polling and real-time analytics platform built to serve the university community. Developed by **Team TypeTitan** under the **AmaliTech UCC Coding Club**, it provides a secure, interactive way to create, manage, and analyze campus-wide votes.

---

## 🏗️ Technical Architecture

### **The Stack**

* **Frontend:** React 19 (Hooks, Context API), Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL with Prisma ORM
* **Authentication:** JWT (JSON Web Tokens) with secure cookie/header handling
* **Documentation:** Swagger UI (OpenAPI 3.0)
* **Deployment:** Render (Backend/Frontend), Neon (Serverless PostgreSQL)

### **Key Technical Features**

* **Secure Voting:** Integrated rate limiting and XSS protection to ensure poll integrity.
* **Real-time Analytics:** Dynamic chart visualizations for instant feedback on voting trends.
* **Comprehensive API:** 15+ documented endpoints for poll CRUD operations and user management.
* **Mobile First:** Fully responsive UI/UX designed for students on the go.

---

## 📊 Database Schema

The system runs on a robust 5-table relational schema designed for scalability:

1. **Users:** Management and authentication.
2. **Polls:** Core poll data (titles, descriptions, expiration).
3. **Options:** The individual choices within a poll.
4. **Votes:** Tracks user selections and prevents duplicates.
5. **Analytics:** Aggregated data for fast rendering of results.

---

## 🚀 Getting Started

### **Prerequisites**

* Node.js (v18+)
* PostgreSQL instance (Local or Neon.tech)

### **Installation**

1. **Clone the repo:**
```bash
git clone https://github.com/biileprince/campus-poll.git
cd campus-poll

```


2. **Install dependencies:**
```bash
# For backend
cd backend && npm install
# For frontend
cd ../frontend && npm install

```


3. **Environment Setup:**
Create a `.env` file in the backend folder:
```env
DATABASE_URL="your_postgresql_url"
JWT_SECRET="your_secret_key"
PORT=5000

```


4. **Run Migrations:**
```bash
npx prisma migrate dev

```


5. **Launch:**
```bash
# Start backend
npm run dev
# Start frontend
npm run dev

```



---

## 🛠️ API Documentation

Once the server is running, you can explore and test the API endpoints via Swagger:
🔗 `http://localhost:5000/api-docs`

---

## 👥 Team TypeTitan

This project was built during the 2024/2025 academic year at the **University of Cape Coast**.

* **Project Lead:** [Prince Yennuyar Biile](https://github.com/biileprince)
* **The Team:** Developed in collaboration with the AmaliTech UCC Coding Club Backend Team.


