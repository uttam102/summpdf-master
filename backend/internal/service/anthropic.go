package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type AnthropicService struct {
	APIKey string
}

type AnthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AnthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	Messages  []AnthropicMessage `json:"messages"`
}

type AnthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

var STYLE_PROMPTS = map[string]string{
	"concise":   "Provide a concise summary in 3-5 sentences covering the main points.",
	"detailed":  "Provide a detailed summary with key themes, main arguments, and important details.",
	"bullet":    "Summarize the key points as a clear bullet point list.",
	"academic":  "Provide an academic-style abstract: purpose, methods, findings, and conclusions.",
	"simple":    "Summarize in very simple, plain language that anyone can understand. Avoid jargon.",
	"one-liner": "Summarize the entire document into a single, punchy, and ultra-concise sentence (maximum 2 lines).",
}

func NewAnthropicService(apiKey string) *AnthropicService {
	return &AnthropicService{APIKey: apiKey}
}

func (s *AnthropicService) Summarize(ctx context.Context, text string, style string) (string, error) {
	styleInstruction, ok := STYLE_PROMPTS[style]
	if !ok {
		styleInstruction = STYLE_PROMPTS["concise"]
	}

	// 15,000 character limit as per spec
	truncatedText := text
	if len(text) > 15000 {
		truncatedText = text[:15000] + "\n\n[Document truncated for summarization]"
	}

	prompt := fmt.Sprintf("You are a professional document summarizer.\n%s\nDo not add any preamble — provide the summary directly.\n\nDocument content:\n\n%s", styleInstruction, truncatedText)

	reqBody := AnthropicRequest{
		Model:     "claude-3-5-sonnet-20240620", // Using latest stable version
		MaxTokens: 2000,
		Messages: []AnthropicMessage{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		err := fmt.Errorf("anthropic api error (status %d): %s", resp.StatusCode, string(body))
		fmt.Printf("❌ Anthropic Error: %v\n", err)
		return "", err
	}

	var anthropicResp AnthropicResponse
	if err := json.NewDecoder(resp.Body).Decode(&anthropicResp); err != nil {
		return "", err
	}

	if len(anthropicResp.Content) > 0 {
		return anthropicResp.Content[0].Text, nil
	}

	return "", fmt.Errorf("empty response from anthropic")
}
func (s *AnthropicService) GenerateContent(ctx context.Context, prompt string) (string, error) {
	fmt.Printf("🤖 Attempting generation with Anthropic: claude-3-5-sonnet-20240620\n")
	reqBody := AnthropicRequest{
		Model:     "claude-3-5-sonnet-20240620",
		MaxTokens: 4000,
		Messages: []AnthropicMessage{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("anthropic api error (status %d): %s", resp.StatusCode, string(body))
	}

	var anthropicResp AnthropicResponse
	if err := json.NewDecoder(resp.Body).Decode(&anthropicResp); err != nil {
		return "", err
	}

	if len(anthropicResp.Content) > 0 {
		return anthropicResp.Content[0].Text, nil
	}

	return "", fmt.Errorf("empty response from anthropic")
}
