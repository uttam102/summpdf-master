package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sort"
	"strings"
)

type LocalAIService struct{}

func NewLocalAIService() *LocalAIService {
	return &LocalAIService{}
}

// --- Approach A: Extractive Summarizer ---

var STOP_WORDS = map[string]bool{
	"the": true, "a": true, "an": true, "is": true, "it": true, "in": true, "on": true, "at": true, "to": true, "and": true, "or": true, "but": true,
	"of": true, "for": true, "with": true, "this": true, "that": true, "are": true, "was": true, "were": true, "be": true, "been": true,
	"have": true, "has": true, "had": true, "do": true, "does": true, "did": true, "not": true, "from": true, "by": true, "as": true, "its": true,
}

func (s *LocalAIService) ExtractiveSummarize(text string, style string) string {
	sentenceCount := 4
	switch style {
	case "detailed":
		sentenceCount = 10
	case "bullet":
		sentenceCount = 6
	case "simple":
		sentenceCount = 4
	case "one-liner":
		sentenceCount = 1
	}

	// Simple sentence splitting
	re := regexp.MustCompile(`[.!?]\s+`)
	sentences := re.Split(strings.ReplaceAll(text, "\n", " "), -1)

	var filteredSentences []string
	for _, s := range sentences {
		trimmed := strings.TrimSpace(s)
		if len(trimmed) > 30 {
			filteredSentences = append(filteredSentences, trimmed)
		}
	}

	if len(filteredSentences) == 0 {
		return "Could not extract meaningful sentences from this document."
	}

	// Score sentences
	wordRe := regexp.MustCompile(`\b[a-z]+\b`)
	words := wordRe.FindAllString(strings.ToLower(text), -1)
	wordFreq := make(map[string]int)
	for _, w := range words {
		if !STOP_WORDS[w] {
			wordFreq[w]++
		}
	}

	type ScoredSentence struct {
		Text  string
		Score int
		Index int
	}

	var scored []ScoredSentence
	for i, s := range filteredSentences {
		score := 0
		sWords := wordRe.FindAllString(strings.ToLower(s), -1)
		for _, w := range sWords {
			if !STOP_WORDS[w] {
				score += wordFreq[w]
			}
		}
		// Boost keywords for "Importance"
		lowerS := strings.ToLower(s)
		boosts := []string{"conclusion", "significant", "result", "found", "summary", "important", "purpose", "goal", "key"}
		for _, b := range boosts {
			if strings.Contains(lowerS, b) {
				score += 50 // Heavy boost for key sentences
			}
		}

		scored = append(scored, ScoredSentence{Text: s, Score: score, Index: i})
	}

	// Sort by score
	sort.Slice(scored, func(i, j int) bool {
		return scored[i].Score > scored[j].Score
	})

	// Pick top N
	if len(scored) > sentenceCount {
		scored = scored[:sentenceCount]
	}

	// Sort back to original order
	sort.Slice(scored, func(i, j int) bool {
		return scored[i].Index < scored[j].Index
	})

	var result []string
	for _, s := range scored {
		if style == "bullet" {
			result = append(result, "• "+s.Text)
		} else {
			result = append(result, s.Text)
		}
	}

	if style == "bullet" {
		return strings.Join(result, "\n")
	}
	return strings.Join(result, " ") + "."
}

// --- Approach B: Ollama Local LLM ---

type OllamaRequest struct {
	Model    string          `json:"model"`
	Messages []OllamaMessage `json:"messages"`
	Stream   bool            `json:"stream"`
}

type OllamaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OllamaResponse struct {
	Message struct {
		Content string `json:"content"`
	} `json:"message"`
}

func (s *LocalAIService) OllamaSummarize(ctx context.Context, text string, style string) (string, error) {
	stylePrompts := map[string]string{
		"concise":   "Summarize the following document in 3-5 sentences. Be clear and direct.",
		"detailed":  "Write a detailed summary covering all key themes, arguments, and conclusions.",
		"bullet":    "Summarize the key points as a bullet point list using • symbols.",
		"academic":  "Write an academic abstract: cover purpose, methodology, findings, and conclusions.",
		"simple":    "Summarize in very simple language anyone can understand. Avoid technical terms.",
		"one-liner": "Summarize the entire document into exactly one or two powerful lines. Be extremely concise.",
	}

	instruction := stylePrompts[style]
	if instruction == "" {
		instruction = stylePrompts["concise"]
	}

	truncated := text
	if len(text) > 12000 {
		truncated = text[:12000] + "\n\n[Document truncated]"
	}

	prompt := fmt.Sprintf("%s\nDo not add any preamble — provide the summary directly.\n\nDocument:\n\n%s", instruction, truncated)

	reqBody := OllamaRequest{
		Model: "llama3",
		Messages: []OllamaMessage{
			{Role: "user", Content: prompt},
		},
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "http://localhost:11434/api/chat", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("ollama connection failed: %v (is Ollama running?)", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("ollama error: %s", string(body))
	}

	var ollamaResp OllamaResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return "", err
	}

	return ollamaResp.Message.Content, nil
}
func (s *LocalAIService) GenerateContent(ctx context.Context, prompt string) (string, error) {
	reqBody := OllamaRequest{
		Model: "llama3",
		Messages: []OllamaMessage{
			{Role: "user", Content: prompt},
		},
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "http://localhost:11434/api/chat", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("ollama connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("ollama error: %s", string(body))
	}

	var ollamaResp OllamaResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return "", err
	}

	return ollamaResp.Message.Content, nil
}
