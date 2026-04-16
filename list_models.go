package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

func main() {
	_ = godotenv.Load("backend/.env")
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		_ = godotenv.Load(".env")
		apiKey = os.Getenv("GEMINI_API_KEY")
	}

	client, err := genai.NewClient(context.Background(), option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	iter := client.ListModels(context.Background())
	for {
		m, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Model: %s\n", m.Name)
	}
}
