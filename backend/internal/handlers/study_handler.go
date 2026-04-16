package handlers

import (
	"net/http"
	"summpdf-go-backend/internal/models"
	"summpdf-go-backend/internal/repository"
	"summpdf-go-backend/internal/service"
	"time"

	"github.com/gin-gonic/gin"
)

type StudyHandler struct {
	studyRepo    *repository.StudyRepository
	folderRepo   *repository.FolderRepository
	summaryRepo  *repository.SummaryRepository
	studyService *service.StudyService
	pdfService   *service.PDFService
}

func NewStudyHandler(studyRepo *repository.StudyRepository, folderRepo *repository.FolderRepository,
	summaryRepo *repository.SummaryRepository, studyService *service.StudyService, pdfService *service.PDFService) *StudyHandler {
	return &StudyHandler{
		studyRepo:    studyRepo,
		folderRepo:   folderRepo,
		summaryRepo:  summaryRepo,
		studyService: studyService,
		pdfService:   pdfService,
	}
}

// GenerateQA handles request to generate Q&A pairs for a summary
func (h *StudyHandler) GenerateQA(c *gin.Context) {
	summaryID := c.Param("id")
	var req struct {
	Count int `json:"count"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.Count <= 0 || req.Count > 20 {
		req.Count = 5 // Default to 5 questions
	}

	// Get the summary to extract text
	summary, err := h.summaryRepo.GetSummaryByID(c.Request.Context(), summaryID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Summary not found"})
		return
	}

	// Generate Q&A using AI service
	qaPairs, err := h.studyService.GenerateQA(c.Request.Context(), summary.SummaryText, req.Count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Q&A: " + err.Error()})
		return
	}

	// Save Q&A to database
	err = h.studyRepo.AddQAPairs(c.Request.Context(), summaryID, qaPairs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save Q&A"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"qa_pairs": qaPairs, "count": len(qaPairs)})
}

// CreateFolder creates a new folder
func (h *StudyHandler) CreateFolder(c *gin.Context) {
	var folder models.Folder
	if err := c.ShouldBindJSON(&folder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if folder.UserID == "" || folder.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and name are required"})
		return
	}

	err := h.folderRepo.CreateFolder(c.Request.Context(), &folder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
		return
	}

	c.JSON(http.StatusOK, folder)
}

// GetFolders gets all folders for a user
func (h *StudyHandler) GetFolders(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	folders, err := h.folderRepo.GetFoldersByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch folders"})
		return
	}

	c.JSON(http.StatusOK, folders)
}

// UpdateFolder updates a folder
func (h *StudyHandler) UpdateFolder(c *gin.Context) {
	folderID := c.Param("id")
	var updates map[string]interface{}

	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	err := h.folderRepo.UpdateFolder(c.Request.Context(), folderID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeleteFolder deletes a folder
func (h *StudyHandler) DeleteFolder(c *gin.Context) {
	folderID := c.Param("id")

	err := h.folderRepo.DeleteFolder(c.Request.Context(), folderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// MoveToFolder moves a summary to a folder
func (h *StudyHandler) MoveToFolder(c *gin.Context) {
	summaryID := c.Param("id")
	var req struct {
	FolderID *string `json:"folder_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	err := h.studyRepo.MoveToFolder(c.Request.Context(), summaryID, req.FolderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to move summary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateStudySchedule updates the study schedule for a summary
func (h *StudyHandler) UpdateStudySchedule(c *gin.Context) {
	summaryID := c.Param("id")
	var schedule models.StudySchedule

	if err := c.ShouldBindJSON(&schedule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	err := h.studyRepo.UpdateStudySchedule(c.Request.Context(), summaryID, schedule)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update schedule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "schedule": schedule})
}

// ExtractSyllabus extracts topics from a syllabus PDF
func (h *StudyHandler) ExtractSyllabus(c *gin.Context) {
	var req struct {
	FileURL string `json:"file_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Extract text from syllabus PDF
	text, err := h.pdfService.ExtractTextFromURL(req.FileURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract text from syllabus"})
		return
	}

	// Extract topics using AI
	topics, err := h.studyService.ExtractTopicsFromSyllabus(c.Request.Context(), text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract topics: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
	"topics": topics,
	"count":  len(topics),
	})
}

// MarkAsReviewed marks a summary as reviewed
func (h *StudyHandler) MarkAsReviewed(c *gin.Context) {
	summaryID := c.Param("id")
	var req struct {
	Understanding int       `json:"understanding"` // 1-5
	NextReview    *time.Time `json:"next_review,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// If next review not provided, calculate it
	if req.NextReview == nil {
		summary, err := h.summaryRepo.GetSummaryByID(c.Request.Context(), summaryID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Summary not found"})
			return
		}

		nextReview := h.studyService.CalculateNextReviewDate(
			summary.ReviewCount,
			summary.Difficulty,
			req.Understanding,
		)
		req.NextReview = &nextReview
	}

	err := h.studyRepo.MarkAsReviewed(c.Request.Context(), summaryID, req.Understanding, req.NextReview)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark as reviewed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
	"success":         true,
	"next_review":     req.NextReview,
	"next_review_str": req.NextReview.Format("2006-01-02"),
	})
}

// GetReviewQueue gets all summaries needing review
func (h *StudyHandler) GetReviewQueue(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	// Default to returning 10 summaries, max 50
	limit := 10
	if l := c.Query("limit"); l != "" {
		// Parse limit
	}

	summaries, err := h.studyRepo.GetReviewQueue(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch review queue"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
	"summaries": summaries,
	"count":     len(summaries),
	"due_today": len(summaries),
	})
}

// GetStudyStats gets study statistics for a user
func (h *StudyHandler) GetStudyStats(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	// Get user's summaries from summary repository
	summaries, err := h.summaryRepo.GetSummariesByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch summaries"})
		return
	}

	stats := h.studyService.CalculateStudyStats(summaries)

	c.JSON(http.StatusOK, gin.H{
	"stats": stats,
	})
}

// summaryRepo field is needed but not defined. Let's add it to the struct
type StudyHandlerWithSummary struct {
	*StudyHandler
	summaryRepo *repository.SummaryRepository
}
