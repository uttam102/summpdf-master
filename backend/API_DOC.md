# SummPDF Backend API Documentation

Structured Go Backend with Gemini AI Integration.

## Base URL
`http://localhost:8080` (Default, check `.env` for `PORT`)

---

## 🚀 Endpoints

### 1. Health Check
Checks if the server is running.

- **URL:** `/ping`
- **Method:** `GET`
- **Response (200 OK):**
```json
{
  "message": "SummPDF Structured Go Backend is Live!"
}
```

---

### 2. Chat with PDF
Extracts text from a PDF URL and answers questions using AI.

- **URL:** `/api/chat`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "pdfUrl": "https://example.com/sample.pdf",
  "question": "What is the summary of this document?"
}
```
- **Response (200 OK):**
```json
{
  "answer": "The document discusses..."
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing fields or unreadable PDF.
  - `429 Too Many Requests`: AI model quota limit (wait 15s).
  - `500 Internal Server Error`: AI Service or extraction failure.

---

## 🛠 Project Structure
```
backend/
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/    <- HTTP Handlers (Controllers)
│   ├── middleware/  <- Custom Middlewares (CORS, Auth)
│   ├── models/      <- Request/Response Structs
│   ├── repository/  <- Database Operations
│   ├── router/      <- Route configuration
│   └── service/     <- Business Logic (AI, PDF Extraction)
├── pkg/
│   ├── config/      <- Configuration loader
│   ├── db/          <- Database initializers
│   └── helpers/     <- Utility functions
├── API_DOC.md
├── go.mod
└── go.sum
```
