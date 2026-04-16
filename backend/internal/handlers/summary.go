package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"summpdf-go-backend/internal/models"
	"summpdf-go-backend/internal/repository"
	"summpdf-go-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type SummaryHandler struct {
	repo             *repository.SummaryRepository
	aiService        *service.AIService
	anthropicService *service.AnthropicService
	localAIService   *service.LocalAIService
	pdfService       *service.PDFService
}

func NewSummaryHandler(repo *repository.SummaryRepository, ai *service.AIService, anthropic *service.AnthropicService, local *service.LocalAIService, pdf *service.PDFService) *SummaryHandler {
	return &SummaryHandler{repo: repo, aiService: ai, anthropicService: anthropic, localAIService: local, pdfService: pdf}
}

func (h *SummaryHandler) Summarize(c *gin.Context) {
	var req struct {
		UserID   string `json:"user_id"`
		FileUrl  string `json:"file_url"`
		FileName string `json:"file_name"`
		Style    string `json:"style"`
		Provider string `json:"provider"` // New field
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 1. Extract text from PDF
	text, err := h.pdfService.ExtractTextFromURL(req.FileUrl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract text: " + err.Error()})
		return
	}

	// 2. Generate Summary with selected AI Provider
	var summaryText string

	switch req.Provider {
	case "ollama":
		summaryText, err = h.localAIService.OllamaSummarize(c.Request.Context(), text, req.Style)
	case "extractive":
		summaryText = h.localAIService.ExtractiveSummarize(text, req.Style)
		err = nil
	case "claude":
		summaryText, err = h.anthropicService.Summarize(c.Request.Context(), text, req.Style)
	case "gemini":
		summaryText, err = h.aiService.GenerateSummary(c.Request.Context(), text, req.Style)
	default:
		// Default fallback logic: try Claude then Gemini
		summaryText, err = h.anthropicService.Summarize(c.Request.Context(), text, req.Style)
		if err != nil {
			summaryText, err = h.aiService.GenerateSummary(c.Request.Context(), text, req.Style)
		}
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI generation failed: " + err.Error()})
		return
	}

	// 3. Save to database
	summary := &models.PdfSummary{
		UserID:          req.UserID,
		OriginalFileUrl: req.FileUrl,
		FileName:        req.FileName,
		Title:           req.FileName, // Default title
		SummaryText:     summaryText,
		WordCount:       len(strings.Fields(summaryText)),
		Status:          "completed",
	}

	err = h.repo.CreateSummary(c.Request.Context(), summary)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save summary"})
		return
	}

	c.JSON(http.StatusOK, summary)
}

func (h *SummaryHandler) GetSummaries(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	summaries, err := h.repo.GetSummariesByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch summaries"})
		return
	}

	c.JSON(http.StatusOK, summaries)
}

func (h *SummaryHandler) GetSummary(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	summary, err := h.repo.GetSummaryByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Summary not found"})
		return
	}

	c.JSON(http.StatusOK, summary)
}

func (h *SummaryHandler) DeleteSummary(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	err := h.repo.DeleteSummary(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete summary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *SummaryHandler) UploadPDF(c *gin.Context) {
	file, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded (use 'pdf' field)"})
		return
	}

	// Create uploads directory if it doesn't exist
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		if err := os.Mkdir("uploads", 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory"})
			return
		}
	}

	filename := filepath.Base(file.Filename)
	savePath := filepath.Join("uploads", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file: " + err.Error()})
		return
	}

	// Use request host for the file URL to avoid port/host mismatches
	fileURL := fmt.Sprintf("http://%s/uploads/%s", c.Request.Host, filename)

	c.JSON(http.StatusOK, gin.H{
		"url":  fileURL,
		"name": filename,
	})
}

func (h *SummaryHandler) Index(c *gin.Context) {
	userName, _ := c.Get("user_name")
	userPicture, _ := c.Get("user_picture")
	c.HTML(http.StatusOK, "index.html", gin.H{
		"userName":    userName,
		"userPicture": userPicture,
	})
}

func (h *SummaryHandler) About(c *gin.Context) {
	userName, _ := c.Get("user_name")
	userPicture, _ := c.Get("user_picture")
	c.HTML(http.StatusOK, "about.html", gin.H{
		"title":       "About - SummPDF",
		"userName":    userName,
		"userPicture": userPicture,
	})
}

func (h *SummaryHandler) Dashboard(c *gin.Context) {
	// For now, use a guest user ID. In a real app, this would come from session/JWT.
	userID := "guest"
	summaries, _ := h.repo.GetSummariesByUserID(c.Request.Context(), userID)

	c.HTML(http.StatusOK, "dashboard.html", gin.H{
		"title":     "Dashboard - SummPDF",
		"summaries": summaries,
	})
}

func (h *SummaryHandler) Profile(c *gin.Context) {
	c.HTML(http.StatusOK, "profile.html", gin.H{
		"title": "Profile - SummPDF",
	})
}

func (h *SummaryHandler) Pricing(c *gin.Context) {
	c.HTML(http.StatusOK, "pricing.html", gin.H{
		"title": "Pricing - SummPDF",
	})
}
