package handlers

import (
	"net/http"

	"summpdf-go-backend/internal/models"
	"summpdf-go-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	repo *repository.ProfileRepository
}

func NewProfileHandler(repo *repository.ProfileRepository) *ProfileHandler {
	return &ProfileHandler{repo: repo}
}

func (h *ProfileHandler) GetProfile(c *gin.Context) {
	clerkID := c.Param("clerk_id")
	if clerkID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "clerk_id is required"})
		return
	}

	profile, err := h.repo.GetProfileByClerkID(c.Request.Context(), clerkID)
	if err != nil {
		c.JSON(http.StatusOK, nil)
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	var profile models.UserProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if profile.ClerkID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "clerk_id is required"})
		return
	}

	err := h.repo.UpdateProfile(c.Request.Context(), &profile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
