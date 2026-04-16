package models

type ChatRequest struct {
	PDFURL   string `json:"pdfUrl"`
	Question string `json:"question"`
}

type ChatResponse struct {
	Answer string `json:"answer"`
}

type ErrorResponse struct {
	Error      string `json:"error"`
	RetryAfter int    `json:"retry_after,omitempty"`
}
