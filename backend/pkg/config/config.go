package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	GeminiAPIKey    string
	AnthropicAPIKey string
	Port            string
	DatabaseURL     string
	ClerkSecretKey  string
}

func LoadConfig() *Config {
	// Attempt to load .env from multiple possible locations
	paths := []string{
		".env",         // Current directory
		"backend/.env", // Root directory (running from root)
		"../.env",      // Parent directory (running from a subfolder)
		"../../.env",   // Root of the project (if run from deep subfolder)
	}

	for _, path := range paths {
		if _, err := os.Stat(path); err == nil {
			_ = godotenv.Load(path)
		}
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY is not set in environment or .env file. Please ensure it exists in backend/.env")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		GeminiAPIKey:    apiKey,
		AnthropicAPIKey: os.Getenv("ANTHROPIC_API_KEY"),
		Port:            port,
		DatabaseURL:     databaseURL,
		ClerkSecretKey:  os.Getenv("CLERK_SECRET_KEY"),
	}
}
