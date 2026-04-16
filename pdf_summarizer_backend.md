# PDF Summarizer — Backend Documentation

A backend service that accepts a PDF file, extracts its text, and returns an AI-generated summary using the Anthropic Claude API.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Language | Python 3.10+ |
| Web Framework | FastAPI |
| PDF Text Extraction | pdfplumber |
| AI Summarization | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Server | Uvicorn |

---

## Project Structure

```
pdf-summarizer-backend/
├── main.py               # FastAPI app entry point
├── summarizer.py         # Claude API summarization logic
├── pdf_extractor.py      # PDF text extraction logic
├── requirements.txt      # Python dependencies
├── .env                  # API keys (never commit this)
└── README.md
```

---

## Installation

```bash
# 1. Clone or create the project folder
mkdir pdf-summarizer-backend && cd pdf-summarizer-backend

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install fastapi uvicorn pdfplumber anthropic python-multipart python-dotenv
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## Source Files

### `pdf_extractor.py` — Extract text from PDF

```python
import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text from a PDF given its raw bytes.
    Returns a single string with all page content joined.
    """
    text_parts = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"[Page {i + 1}]\n{page_text.strip()}")

    if not text_parts:
        raise ValueError("No readable text found in the PDF. It may be scanned or image-based.")

    return "\n\n".join(text_parts)
```

---

### `summarizer.py` — Call Claude API

```python
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

STYLE_PROMPTS = {
    "concise":  "Provide a concise summary in 3-5 sentences covering the main points.",
    "detailed": "Provide a detailed summary with key themes, main arguments, and important details.",
    "bullet":   "Summarize the key points as a clear bullet point list.",
    "academic": "Provide an academic-style abstract: purpose, methods, findings, and conclusions.",
    "simple":   "Summarize in very simple, plain language that anyone can understand. Avoid jargon.",
}

def summarize_text(text: str, style: str = "concise") -> str:
    """
    Send extracted PDF text to Claude and return the summary.
    """
    style_instruction = STYLE_PROMPTS.get(style, STYLE_PROMPTS["concise"])

    # Limit text to ~15,000 characters to stay within token limits
    truncated_text = text[:15000]
    if len(text) > 15000:
        truncated_text += "\n\n[Document truncated for summarization]"

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": (
                    f"You are a professional document summarizer.\n"
                    f"{style_instruction}\n"
                    f"Do not add any preamble — provide the summary directly.\n\n"
                    f"Document content:\n\n{truncated_text}"
                )
            }
        ]
    )

    return message.content[0].text
```

---

### `main.py` — FastAPI App

```python
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import extract_text_from_pdf
from summarizer import summarize_text

app = FastAPI(title="PDF Summarizer API", version="1.0.0")

# Allow requests from your frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@app.get("/")
def root():
    return {"status": "ok", "message": "PDF Summarizer API is running"}


@app.post("/summarize")
async def summarize_pdf(
    file: UploadFile = File(...),
    style: str = Query(default="concise", enum=["concise", "detailed", "bullet", "academic", "simple"])
):
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Read and validate file size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")

    # Extract text
    try:
        text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to extract text from the PDF.")

    # Summarize
    try:
        summary = summarize_text(text, style=style)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate summary. Check your API key.")

    return {
        "filename": file.filename,
        "style": style,
        "summary": summary,
        "char_count": len(text),
    }
```

---

### `requirements.txt`

```
fastapi
uvicorn[standard]
pdfplumber
anthropic
python-multipart
python-dotenv
```

---

## Running the Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`

---

## API Reference

### `POST /summarize`

Accepts a PDF file and returns an AI-generated summary.

**Request**

| Parameter | Type | Location | Description |
|---|---|---|---|
| `file` | PDF file | form-data | The PDF to summarize (max 5MB) |
| `style` | string | query param | One of: `concise`, `detailed`, `bullet`, `academic`, `simple` |

**Example using `curl`**

```bash
curl -X POST "http://localhost:8000/summarize?style=bullet" \
  -F "file=@/path/to/document.pdf"
```

**Example using Python `requests`**

```python
import requests

with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/summarize",
        params={"style": "bullet"},
        files={"file": ("document.pdf", f, "application/pdf")}
    )

print(response.json())
```

**Success Response (200)**

```json
{
  "filename": "document.pdf",
  "style": "bullet",
  "summary": "• Key point one\n• Key point two\n• Key point three",
  "char_count": 8432
}
```

**Error Responses**

| Status | Reason |
|---|---|
| 400 | Not a PDF, or file exceeds 5MB |
| 422 | PDF has no readable text (scanned/image-based) |
| 500 | Text extraction or Claude API failure |

---

## Frontend Integration

Call the backend from your frontend like this:

```javascript
async function summarizePDF(file, style = "concise") {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`http://localhost:8000/summarize?style=${style}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Summarization failed");
  }

  const data = await response.json();
  return data.summary;
}
```

---

## Notes

- Scanned PDFs (image-only) are not supported without adding OCR (e.g. `pytesseract`).
- Text is truncated to 15,000 characters before being sent to Claude to avoid hitting token limits.
- Replace `allow_origins=["*"]` in CORS settings with your actual frontend domain in production.
- Never expose your `ANTHROPIC_API_KEY` in frontend code — always call Claude from the backend.
