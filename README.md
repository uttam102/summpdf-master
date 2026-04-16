<div align="center">
  
# SummPDF

**Instant AI-Powered PDF Summaries & Intelligent Chat**

A high-performance full-stack application built with **React (Vite)** and **Go (Gin)** that empowers you to instantly summarize documents, interactively chat with your PDFs, and manage your studies effectively.

---

[![Frontend](https://img.shields.io/badge/Frontend-React_19_%7C_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Backend](https://img.shields.io/badge/Backend-Go_API-00ADD8?style=for-the-badge&logo=go&logoColor=white)](#)
[![AI Platform](https://img.shields.io/badge/AI_Engine-Google_Gemini-FFA700?style=for-the-badge&logo=google&logoColor=white)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#)

</div>

<br>

SummPDF has been completely reimagined to deliver blazing-fast processing by leveraging a **Vite React Single Page Application** to handle complex user interfaces and a deeply optimized **Go Gin API** responsible for heavy computational loads, AI coordination, and data ingestion.

## ✨ Key Features

- **⚡ Blazing-Fast Interface:** Powered by Vite & React 19, giving instant load speeds and immediate responses.
- **🧠 Advanced AI Summarization:** Integrated seamlessly with the Google Gemini SDK for incredibly accurate document distillation.
- **💬 Interactive PDF Intelligence:** Ask questions and have fluid, real-time conversations directly with your documents.
- **🔒 Secure Authentication:** Handled professionally through Clerk for robust user management.
- **📦 Cloud File Storage:** UploadThing integration allows seamless, secure cloud hosting of all your uploaded PDFs.
- **🎨 Premium UI/UX:** Stunning, high-end Teal & Rose design system completely tokenized via TailwindCSS v4.

---

## 📸 Screenshots

*(Replace the links below with your actual screenshot images once you capture them)*

### 1. 🏠 Landing / Home Page
> *Showcases the beautiful Teal & Rose UI/UX design.*
<img src="https://via.placeholder.com/800x450.png?text=Landing+Page+Screenshot" alt="SummPDF Landing Page" width="800">

### 2. 📊 User Dashboard
> *Shows all uploaded files, processing statuses, and study folders.*
<img src="https://via.placeholder.com/800x450.png?text=User+Dashboard+Screenshot" alt="Dashboard" width="800">

### 3. 💬 AI Summarization & Chat Interface
> *Highlights the core feature: reading the summary and chatting with the PDF.*
<img src="https://via.placeholder.com/800x450.png?text=PDF+Chat+Interface+Screenshot" alt="AI Chat Interface" width="800">

---

## 🏗️ Architecture Stack

### 💻 Frontend Client
- **Framework:** React 19 + Vite
- **Language:** JavaScript/TypeScript
- **Styling:** TailwindCSS v4
- **Routing:** React Router v7
- **Authentication:** Clerk React SDK

### ⚙️ Backend Engine
- **Language:** Golang (Go 1.22+)
- **Server Framework:** Gin Web Framework
- **Database:** MongoDB (Go Driver)
- **AI Integration:** Google Generative AI SDK (Gemini AI platform)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
- **[Go](https://go.dev/)** (v1.22 or higher)
- **[Node.js](https://nodejs.org/)** (v18 or higher)
- **[npm](https://www.npmjs.com/)** or **yarn**

### 1️⃣ Setting up the Backend (Go)

You must configure your `.env` variables located at `backend/.env`. You will need to provide your `DATABASE_URL` (MongoDB Atlas string) and your `GEMINI_API_KEY`.

```bash
cd backend

# Install all Go module dependencies
go mod tidy

# Start the Gin server
go run cmd/main.go
```
*The Backend API will spin up and listen on: `http://localhost:8080`*

### 2️⃣ Setting up the Frontend (React Vite)

You must configure the `.env` file located in the `frontend/` directory with your unique `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_UPLOADTHING_TOKEN`.

```bash
cd frontend

# Install package dependencies
npm install

# Run the local development server
npm run dev
```
*The Frontend Dashboard will be accessible at: `http://localhost:5173`*

---

## 📂 Project Structure Overview

```text
summpdf-master/
├── backend/                       # Go (Gin) API Backend
│   ├── cmd/main.go                # Application entry point
│   ├── internal/handlers/         # HTTP request handlers (Auth, Chat, Study, Summary)
│   ├── internal/models/           # DB schema modeling
│   ├── internal/service/          # Business logic & AI generation pipelines
│   └── pkg/config/                # Global environment configuration
└── frontend/                      # React SPA
    ├── src/components/            # UI components (Upload, Study, Chat dialogs)
    ├── src/pages/                 # Key screens (Dashboard, Home, Pricing)
    ├── src/lib/                   # API abstractions (UploadThing, Langchain)
    └── src/index.css              # Global styling via Tailwind v4
```

---

<div align="center">
  <b>Built with ❤️ by the SummPDF Team</b>
  <br>
  <i>Optimized for speed, scaling, and maintainability.</i>
</div>
