package service

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AIService struct {
	client *genai.Client
}

func NewAIService(apiKey string) (*AIService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	return &AIService{client: client}, nil
}

func (s *AIService) Close() {
	if s.client != nil {
		s.client.Close()
	}
}

func (s *AIService) GenerateSummary(ctx context.Context, pdfText string, style string) (string, error) {
	styleInstructions := map[string]string{
		"concise":   "generate a comprehensive, high-quality, and structured summary. Use professional markdown, start with an Overview, provide Key Highlights as a bulleted list, and end with a Conclusion.",
		"detailed":  "generate a deeply detailed summary covering all key technical aspects, methodology, and specific findings. Use detailed sections and sub-bullets.",
		"bullet":    "summarize the key points as a clear, high-impact bulleted list.",
		"academic":  "provide an academic-style abstract: purpose, methods, findings, and conclusions.",
		"simple":    "summarize in very simple, plain language that anyone can understand. Avoid jargon.",
		"one-liner": "summarize the entire document into exactly ONE or TWO powerful and punchy lines. Be extremely concise and direct.",
	}

	instruction, ok := styleInstructions[style]
	if !ok {
		instruction = styleInstructions["concise"]
	}

	systemPrompt := fmt.Sprintf(`You are a professional PDF Analyzer AI.
You have been provided with the full text of a PDF document below.
Your job is to %s

DOCUMENT TEXT:
%s`, instruction, pdfText)

	targetModels := []string{
		"gemini-2.5-flash",
		"gemini-2.0-flash",
		"gemini-flash-latest",
	}

	var lastErr error
	for _, modelName := range targetModels {
		model := s.client.GenerativeModel(modelName)
		model.SetTemperature(0.4)

		log.Printf("🤖 Attempting summary with model: %s", modelName)
		resp, err := model.GenerateContent(ctx, genai.Text(systemPrompt))

		if err == nil {
			if len(resp.Candidates) > 0 {
				return s.formatResponse(resp), nil
			}
		}

		lastErr = err
		if lastErr != nil && (strings.Contains(lastErr.Error(), "429") || strings.Contains(lastErr.Error(), "Quota") || strings.Contains(lastErr.Error(), "404")) {
			log.Printf("⏳ Model %s pool busy/unavailable. Trying next...", modelName)
			continue
		}
		break
	}

	return "", lastErr
}

func (s *AIService) GenerateAnswer(ctx context.Context, pdfText, question string) (string, error) {
	systemPrompt := `You are a professional Recruiter-Level AI Assistant.
You have been provided with the full text of a document below.
Your job is to answer the user's question based ONLY on the provided text.

STRICT RULES:
1. Answer concisely based on the text.
2. If not found, say: "I'm sorry, that information is not present in the document provided."
3. No outside knowledge.

DOCUMENT TEXT:
` + pdfText

	// Aggressive Cascading Fallback Models
	targetModels := []string{
		"gemini-2.5-pro",
		"gemini-2.0-flash",
		"gemini-2.0-flash-001",
	}

	var lastErr error
	for _, modelName := range targetModels {
		model := s.client.GenerativeModel(modelName)
		model.SetTemperature(0.1)

		log.Printf("🤖 Attempting chat with model: %s", modelName)
		resp, err := model.GenerateContent(ctx, genai.Text(systemPrompt), genai.Text("USER QUESTION: "+question))

		if err == nil {
			if len(resp.Candidates) > 0 {
				return s.formatResponse(resp), nil
			}
		}

		lastErr = err
		if lastErr != nil && (strings.Contains(lastErr.Error(), "429") || strings.Contains(lastErr.Error(), "Quota") || strings.Contains(lastErr.Error(), "404")) {
			log.Printf("⏳ Model %s pool busy/unavailable. Trying next...", modelName)
			continue
		}
		break
	}

	return "", lastErr
}

func (s *AIService) formatResponse(resp *genai.GenerateContentResponse) string {
	var answer strings.Builder
	for _, part := range resp.Candidates[0].Content.Parts {
		answer.WriteString(strings.TrimSpace(strings.ReplaceAll(fmt.Sprintf("%v", part), "\r", "")))
	}
	return answer.String()
}
func (s *AIService) GenerateContent(ctx context.Context, prompt string) (string, error) {
	targetModels := []string{
		"gemini-2.5-flash",
		"gemini-2.0-flash",
		"gemini-flash-latest",
	}

	var lastErr error
	for _, modelName := range targetModels {
		model := s.client.GenerativeModel(modelName)
		model.SetTemperature(0.2) // Low temp for structured data

		log.Printf("🤖 Attempting direct generation with model: %s", modelName)
		resp, err := model.GenerateContent(ctx, genai.Text(prompt))

		if err == nil {
			if len(resp.Candidates) > 0 {
				return s.formatResponse(resp), nil
			}
		}

		lastErr = err
		log.Printf("❌ Gemini Error with model %s: %v", modelName, err)
		if lastErr != nil && (strings.Contains(lastErr.Error(), "429") || strings.Contains(lastErr.Error(), "Quota") || strings.Contains(lastErr.Error(), "404")) {
			log.Printf("⏳ Model %s pool busy/unavailable. Trying next...", modelName)
			continue
		}
		break
	}

	return "", lastErr
}
