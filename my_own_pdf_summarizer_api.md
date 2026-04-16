# Build Your Own PDF Summarizer API

A complete guide to building your own REST API that accepts a PDF file and returns a summary — no third-party AI service needed. This uses a local open-source model (via Ollama) or a simple extractive summarizer so you fully own the pipeline.

---

## Two Approaches

| Approach | Description | Best For |
|---|---|---|
| **A — Extractive** | Pulls the most important sentences directly from the PDF text | Fast, no GPU needed, fully offline |
| **B — Local LLM (Ollama)** | Runs a local AI model on your machine to generate summaries | Better quality, needs decent hardware |

---

## Project Structure

```
my-pdf-summarizer-api/
├── main.py                # FastAPI app — your API endpoints
├── pdf_extractor.py       # Extract text from PDF
├── summarizer.py          # Your own summarization logic
├── requirements.txt       # Dependencies
├── .env                   # Config (no external API keys needed)
└── README.md
```

---

## Installation

```bash
# 1. Create project folder
mkdir my-pdf-summarizer-api && cd my-pdf-summarizer-api

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install fastapi uvicorn pdfplumber python-multipart python-dotenv

# For Approach B (local LLM) — also install:
pip install ollama
```

---

## Source Files

### `pdf_extractor.py` — Extract Text from PDF

```python
import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all readable text from a PDF file.
    Returns combined text from all pages.
    """
    text_parts = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text_parts.append(f"[Page {i + 1}]\n{page_text.strip()}")

    if not text_parts:
        raise ValueError(
            "No readable text found in this PDF. "
            "It may be a scanned or image-based document."
        )

    return "\n\n".join(text_parts)
```

---

### `summarizer.py` — Your Own Summarization Logic

#### Approach A — Extractive Summarizer (no external dependencies)

This picks the most important sentences from the document using word frequency scoring. Fully offline, no AI service needed.

```python
import re
from collections import Counter

# Common words to ignore when scoring sentences
STOP_WORDS = {
    "the","a","an","is","it","in","on","at","to","and","or","but",
    "of","for","with","this","that","are","was","were","be","been",
    "have","has","had","do","does","did","not","from","by","as","its"
}

def extractive_summary(text: str, style: str = "concise") -> str:
    """
    Picks the most important sentences from the text based on word frequency.
    """
    # How many sentences to return based on style
    sentence_count = {
        "concise": 4,
        "detailed": 10,
        "bullet": 6,
        "simple": 4,
    }.get(style, 4)

    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.replace("\n", " "))
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    if not sentences:
        return "Could not extract meaningful sentences from this document."

    # Score each sentence by how many important words it contains
    words = re.findall(r'\b[a-z]+\b', text.lower())
    word_freq = Counter(w for w in words if w not in STOP_WORDS)

    def score(sentence):
        words_in = re.findall(r'\b[a-z]+\b', sentence.lower())
        return sum(word_freq.get(w, 0) for w in words_in if w not in STOP_WORDS)

    ranked = sorted(sentences, key=score, reverse=True)
    top_sentences = ranked[:sentence_count]

    # Restore original order
    ordered = [s for s in sentences if s in top_sentences]

    if style == "bullet":
        return "\n".join(f"• {s}" for s in ordered)
    else:
        return " ".join(ordered)


def summarize_text(text: str, style: str = "concise") -> str:
    return extractive_summary(text, style)
```

---

#### Approach B — Local LLM via Ollama (better quality)

First install Ollama from https://ollama.com and pull a model:

```bash
ollama pull llama3
```

Then replace `summarizer.py` with:

```python
import ollama

STYLE_PROMPTS = {
    "concise":  "Summarize the following document in 3-5 sentences. Be clear and direct.",
    "detailed": "Write a detailed summary covering all key themes, arguments, and conclusions.",
    "bullet":   "Summarize the key points as a bullet point list using • symbols.",
    "academic": "Write an academic abstract: cover purpose, methodology, findings, and conclusions.",
    "simple":   "Summarize in very simple language anyone can understand. Avoid technical terms.",
}

def summarize_text(text: str, style: str = "concise") -> str:
    """
    Use a local Ollama model to summarize the extracted PDF text.
    No external API — runs entirely on your machine.
    """
    style_instruction = STYLE_PROMPTS.get(style, STYLE_PROMPTS["concise"])

    # Truncate to avoid overloading the model context window
    truncated = text[:12000]
    if len(text) > 12000:
        truncated += "\n\n[Document truncated]"

    prompt = (
        f"{style_instruction}\n"
        f"Do not add any preamble — provide the summary directly.\n\n"
        f"Document:\n\n{truncated}"
    )

    response = ollama.chat(
        model="llama3",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]
```

---

### `main.py` — Your API

```python
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import extract_text_from_pdf
from summarizer import summarize_text

app = FastAPI(
    title="My PDF Summarizer API",
    description="Your own API to extract and summarize PDF documents.",
    version="1.0.0"
)

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
    return {"status": "ok", "message": "My PDF Summarizer API is running"}


@app.post("/summarize")
async def summarize_pdf(
    file: UploadFile = File(...),
    style: str = Query(
        default="concise",
        enum=["concise", "detailed", "bullet", "academic", "simple"],
        description="The summarization style"
    )
):
    """
    Upload a PDF file and receive a summary.
    No external AI API is used — summarization runs on your own server.
    """
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Read file and check size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")

    # Step 1: Extract text from PDF
    try:
        text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read the PDF file.")

    # Step 2: Summarize using your own logic
    try:
        summary = summarize_text(text, style=style)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

    return {
        "filename": file.filename,
        "style": style,
        "summary": summary,
        "page_count": text.count("[Page "),
        "char_count": len(text),
    }
```

---

### `requirements.txt`

```
fastapi
uvicorn[standard]
pdfplumber
python-multipart
python-dotenv

# Only needed for Approach B (local LLM):
# ollama
```

---

## Running Your API

```bash
uvicorn main:app --reload --port 8000
```

Your API is now live at:

```
http://localhost:8000
```

Interactive docs (auto-generated by FastAPI):

```
http://localhost:8000/docs
```

---

## API Reference

### `POST /summarize`

Upload a PDF and get a summary back.

**Parameters**

| Parameter | Type | Where | Description |
|---|---|---|---|
| `file` | PDF file | form-data | The PDF file to summarize (max 5MB) |
| `style` | string | query | `concise` / `detailed` / `bullet` / `academic` / `simple` |

**curl Example**

```bash
curl -X POST "http://localhost:8000/summarize?style=bullet" \
  -F "file=@/path/to/your-document.pdf"
```

**Python `requests` Example**

```python
import requests

with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/summarize",
        params={"style": "concise"},
        files={"file": ("document.pdf", f, "application/pdf")}
    )

data = response.json()
print(data["summary"])
```

**JavaScript `fetch` Example**

```javascript
async function summarizePDF(file, style = "concise") {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `http://localhost:8000/summarize?style=${style}`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Summarization failed");
  }

  const data = await response.json();
  return data.summary;
}
```

**Success Response (200)**

```json
{
  "filename": "report.pdf",
  "style": "bullet",
  "summary": "• Key finding one\n• Key finding two\n• Key finding three",
  "page_count": 5,
  "char_count": 9230
}
```

**Error Responses**

| Status | Reason |
|---|---|
| 400 | Not a PDF file, or file too large |
| 422 | PDF has no readable text (image/scanned) |
| 500 | Text extraction or summarization failure |

---

## Comparison: Approach A vs B

| | Approach A (Extractive) | Approach B (Local LLM) |
|---|---|---|
| External API needed | No | No |
| Internet needed | No | No |
| GPU required | No | Optional (faster with GPU) |
| Summary quality | Good for factual docs | Better, more natural |
| Speed | Very fast | Slower (model loading) |
| Extra install | None | Ollama + model (~4GB) |

---

## Notes

- Both approaches run **100% on your own machine** — no data is sent anywhere.
- For Approach B, you can swap `llama3` for any Ollama-supported model (e.g. `mistral`, `phi3`).
- Scanned PDFs (image-only) require adding OCR support via `pytesseract` — not covered here.
- In production, replace `allow_origins=["*"]` with your actual frontend domain.
