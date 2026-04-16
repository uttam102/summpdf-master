package main

import (
	"context"
	"log"

	"summpdf-go-backend/internal/handlers"
	"summpdf-go-backend/internal/repository"
	"summpdf-go-backend/internal/router"
	"summpdf-go-backend/internal/service"
	"summpdf-go-backend/pkg/config"
	"summpdf-go-backend/pkg/db"
)

func main() {
	// 1. Load Config (this also loads .env)
	cfg := config.LoadConfig()

	// 2. Connect to MongoDB
	client, err := db.ConnectMongoDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer client.Disconnect(context.Background())

	database := client.Database("summpdf")

	// 3. Initialize Services
	aiService, err := service.NewAIService(cfg.GeminiAPIKey)
	if err != nil {
		log.Fatalf("Failed to initialize AI Service: %v", err)
	}
	defer aiService.Close()

	pdfService := service.NewPDFService()
	anthropicService := service.NewAnthropicService(cfg.AnthropicAPIKey)
	localAIService := service.NewLocalAIService()

	// Study service (new)
	studyService := service.NewStudyService(aiService, anthropicService, localAIService)

	// 4. Initialize Repositories
	chatHandler := handlers.NewChatHandler(aiService, pdfService)
	profileRepo := repository.NewProfileRepository(database)
	profileHandler := handlers.NewProfileHandler(profileRepo)

	summaryRepo := repository.NewSummaryRepository(database)
	summaryHandler := handlers.NewSummaryHandler(summaryRepo, aiService, anthropicService, localAIService, pdfService)

	// Study repositories (new)
	studyRepo := repository.NewStudyRepository(database)
	folderRepo := repository.NewFolderRepository(database)

	userRepo := repository.NewUserRepository(database)
	authHandler := handlers.NewAuthHandler(userRepo)

	// Study handler (new)
	studyHandler := handlers.NewStudyHandler(studyRepo, folderRepo, summaryRepo, studyService, pdfService)

	// 5. Setup Router
	r := router.SetupRouter(chatHandler, profileHandler, summaryHandler, authHandler, studyHandler)

	// 6. Start Server
	log.Printf("🚀 summpdf-go-backend starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
