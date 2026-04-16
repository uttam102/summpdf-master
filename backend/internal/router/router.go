package router

import (
	"summpdf-go-backend/internal/handlers"
	"summpdf-go-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(
	chatHandler *handlers.ChatHandler,
	profileHandler *handlers.ProfileHandler,
	summaryHandler *handlers.SummaryHandler,
	authHandler *handlers.AuthHandler,
	studyHandler *handlers.StudyHandler,
) *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.AuthMiddleware())

	// Static files & Templates
	r.Static("/uploads", "./uploads")
	r.LoadHTMLGlob("templates/*")

	// Routes
	r.GET("/", summaryHandler.Index)
	r.GET("/about", summaryHandler.About)
	r.GET("/dashboard", summaryHandler.Dashboard)
	r.GET("/profile", summaryHandler.Profile)
	r.GET("/pricing", summaryHandler.Pricing)

	// Auth Routes
	r.GET("/auth/google/login", authHandler.GoogleLogin)
	r.GET("/auth/google/callback", authHandler.GoogleCallback)
	r.GET("/auth/logout", authHandler.Logout)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "SummPDF Structured Go Backend is Live!"})
	})

	api := r.Group("/api")
	{
		api.POST("/upload", summaryHandler.UploadPDF)
		api.POST("/chat", chatHandler.Chat)

		api.GET("/profile/:clerk_id", profileHandler.GetProfile)
		api.POST("/profile", profileHandler.UpdateProfile)

		// Summary endpoints
		api.GET("/summaries/:user_id", summaryHandler.GetSummaries)
		api.GET("/summaries/item/:id", summaryHandler.GetSummary)
		api.POST("/summarize", summaryHandler.Summarize)
		api.DELETE("/summaries/:id", summaryHandler.DeleteSummary)
		api.PUT("/summaries/:id/move", studyHandler.MoveToFolder)

		// Study endpoints - Q&A generation
		api.POST("/summaries/:id/qa/generate", studyHandler.GenerateQA)

		// Study endpoints - Folders
		api.GET("/folders", studyHandler.GetFolders)
		api.POST("/folders", studyHandler.CreateFolder)
		api.PUT("/folders/:id", studyHandler.UpdateFolder)
		api.DELETE("/folders/:id", studyHandler.DeleteFolder)

		// Study endpoints - Schedule and review
		api.PUT("/summaries/:id/study-schedule", studyHandler.UpdateStudySchedule)
		api.POST("/summaries/:id/review", studyHandler.MarkAsReviewed)
		api.GET("/study/revise", studyHandler.GetReviewQueue)
		api.GET("/study/stats", studyHandler.GetStudyStats)

		// Syllabus processing
		api.POST("/syllabus/extract", studyHandler.ExtractSyllabus)
	}

	return r
}
