# SummPDF: Total React + Go Migration 🚀

SummPDF has been successfully migrated from Next.js into a unified **Vite React SPA** frontend and a high-performance **Go Gin API** backend.

## 🏗️ Project Structure

-   `/frontend`: **Standalone React 19 (Vite) SPA**. Handles all UI, routing, and cloud uploads.
-   `/backend`: **Go Language API**. Handles AI Summarization, PDF processing, Chat, and Database (MongoDB).

## ✨ Key Features (Total React Edition)

-   **⚡ Blazing-Fast Frontend**: Migrated to Vite for instant HMR and smaller bundles.
-   **🏢 Unified Go Brain**: All logic (AI, Chat, DB) is consolidated in a high-speed Go API.
-   **🧠 AI Summarization**: Powered by Google Gemini via the Go SDK—now part of the backend!
-   **💬 Interactive PDF Chat**: Real-time AI chat integrated directly with the Go service.
-   **📊 Modern Dashboard**: Fully reactive document management with instant UI status updates.
-   **🎨 Premium Design**: Maintained the high-end Rose/Teal theme with Tailwind v4.

## 🚀 Getting Started

### 1. Backend (Go Language)
Requires Go 1.22+ and a `.env` file with `DATABASE_URL` (MongoDB) and `GEMINI_API_KEY`.

```bash
cd backend
go mod tidy
go run cmd/main.go
```
*Backend runs on: `http://localhost:8080`*

### 2. Frontend (Vite + React)
Requires Node.js 18+ and a `.env` with `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_UPLOADTHING_TOKEN`.

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

## 🛠️ Stack Summary
-   **Frontend**: React 19, Vite, TypeScript, Tailwind v4, React Router, Clerk React SDK.
-   **Backend**: Go (Gin), MongoDB Go Driver, Google Generative AI SDK (Gemini).
-   **Cloud**: UploadThing (PDF Storage), MongoDB Atlas (Database).

---
*Optimized for speed and maintainability.* 💎
