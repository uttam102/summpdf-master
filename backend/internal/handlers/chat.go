package handlers

import (
	"log"
	"strings"

	"summpdf-go-backend/internal/models"
	"summpdf-go-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	aiService  *service.AIService
	pdfService *service.PDFService
}

func NewChatHandler(ai *service.AIService, pdf *service.PDFService) *ChatHandler {
	return &ChatHandler{
		aiService:  ai,
		pdfService: pdf,
	}
}

func (ctrl *ChatHandler) Chat(c *gin.Context) {
	var req models.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	if req.PDFURL == "" || req.Question == "" {
		c.JSON(400, models.ErrorResponse{Error: "pdfUrl and question are required"})
		return
	}

	// 1. Extract Text
	extractedText, err := ctrl.pdfService.ExtractTextFromURL(req.PDFURL)
	if err != nil {
		log.Printf("❌ PDF Extraction Failed: %v", err)
		c.JSON(500, models.ErrorResponse{Error: "Failed to read PDF. Make sure the URL is public."})
		return
	}

	if strings.TrimSpace(extractedText) == "" {
		c.JSON(400, models.ErrorResponse{Error: "This PDF seems to be empty or unreadable."})
		return
	}

	// LIMIT text for safety
	if len(extractedText) > 40000 {
		extractedText = extractedText[:40000]
	}

	// 2. Generate AI Answer
	answer, err := ctrl.aiService.GenerateAnswer(c.Request.Context(), extractedText, req.Question)
	if err != nil {
		if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "Quota") {
			c.JSON(429, models.ErrorResponse{
				Error:      "All AI models are temporarily at their free limit. Please wait 15 seconds.",
				RetryAfter: 15,
			})
			return
		}
		c.JSON(500, models.ErrorResponse{Error: "AI service failed: " + err.Error()})
		return
	}

	c.JSON(200, models.ChatResponse{Answer: answer})
}
