package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"summpdf-go-backend/internal/models"
	"time"
)

type StudyService struct {
	aiService        *AIService
	anthropicService *AnthropicService
	localAIService   *LocalAIService
}

func NewStudyService(ai *AIService, anthropic *AnthropicService, local *LocalAIService) *StudyService {
	return &StudyService{
		aiService:        ai,
		anthropicService: anthropic,
		localAIService:   local,
	}
}

// Spaced repetition interval calculation based on SM-2 algorithm
var baseIntervals = []int{1, 3, 7, 14, 30, 60, 120} // Days for reviews 1-7

// CalculateNextReviewDate calculates when to review next based on spaced repetition
func (s *StudyService) CalculateNextReviewDate(currentReviewCount int, difficulty string, understanding int) time.Time {
	now := time.Now()

	// Determine base interval
	var interval int
	if currentReviewCount < len(baseIntervals) {
		interval = baseIntervals[currentReviewCount]
	} else {
		// After 7 reviews, use exponential intervals
		interval = int(float64(baseIntervals[len(baseIntervals)-1]) *
			float64(currentReviewCount-len(baseIntervals)+1))
	}

	// Adjust based on difficulty
	switch difficulty {
	case "easy":
		interval = int(float64(interval) * 1.3)
	case "hard":
		interval = int(float64(interval) * 0.7)
	}

	// Further adjust based on immediate understanding rating
	if understanding > 0 {
		if understanding >= 4 {
			interval = int(float64(interval) * 1.2) // Easy material
		} else if understanding <= 2 {
			interval = int(float64(interval) * 0.8) // Hard material
		}
	}

	// Cap at 6 months for very familiar material
	if interval > 180 {
		interval = 180
	}

	return now.AddDate(0, 0, interval)
}

// GenerateQA generates question-answer pairs from PDF text using AI
func (s *StudyService) GenerateQA(ctx context.Context, pdfText string, count int) ([]models.QAPair, error) {
	if count <= 0 {
		count = 5 // Default to 5 questions
	}

	systemPrompt := `You are a study assistant that creates educational questions from text.
Extract the most important concepts and create question-answer pairs.

FORMAT REQUIREMENTS:
1. Return ONLY a JSON array of Q&A pairs
2. Each object must have: "question", "answer", "confidence" (0.0-1.0)
3. Questions should test understanding of key concepts
4. Answers should be concise but complete
5. Generate exactly ` + fmt.Sprint(count) + ` pairs

Example format:
[
  {
    "question": "What is the main concept discussed?",
    "answer": "The main concept is...",
    "confidence": 0.85
  }
]

DOCUMENT TEXT:
` + pdfText

	// Use Claude for structured JSON responses
	var response string
	var err error

	// Try Anthropic first (better for structured responses)
	if s.anthropicService != nil {
		response, err = s.anthropicService.GenerateContent(ctx, systemPrompt)
		if err == nil {
			return s.parseQAResponse(response)
		}
	}

	// Fallback to Gemini
	if s.aiService != nil {
		response, err = s.aiService.GenerateContent(ctx, systemPrompt)
		if err != nil {
			return nil, err
		}
		return s.parseQAResponse(response)
	}

	// Fallback to local AI
	if s.localAIService != nil {
		response, err = s.localAIService.GenerateContent(ctx, systemPrompt)
		if err != nil {
			return nil, err
		}
		return s.parseQAResponse(response)
	}

	return nil, fmt.Errorf("no AI service available")
}

// parseQAResponse parses the AI response into Q&A pairs
func (s *StudyService) parseQAResponse(rawResponse string) ([]models.QAPair, error) {
	// Clean the response if it contains markdown code blocks or extra text
	cleanJSON := rawResponse
	if start := strings.Index(rawResponse, "["); start != -1 {
		if end := strings.LastIndex(rawResponse, "]"); end != -1 && end > start {
			cleanJSON = rawResponse[start : end+1]
		}
	}

	var pairs []models.QAPair
	err := json.Unmarshal([]byte(cleanJSON), &pairs)
	if err != nil {
		fmt.Printf("Raw response before clean: %s\n", rawResponse)
		fmt.Printf("Clean JSON: %s\n", cleanJSON)
		return nil, fmt.Errorf("failed to parse Q&A JSON: %v", err)
	}

	// Add timestamps and default confidence if missing
	now := time.Now()
	for i := range pairs {
		pairs[i].CreatedAt = now
		if pairs[i].Confidence <= 0 {
			pairs[i].Confidence = 0.8
		}
	}

	return pairs, nil
}

// ExtractTopicsFromSyllabus extracts structured topics from syllabus text
func (s *StudyService) ExtractTopicsFromSyllabus(ctx context.Context, syllabusText string) ([]models.SyllabusTopic, error) {
	systemPrompt := `You are a study planner that extracts structured topics from a course syllabus.

FORMAT REQUIREMENTS:
1. Return ONLY a JSON array of topic objects
2. Each topic object must have:
   - "topic": string (topic name)
   - "date": string (due date if available, otherwise "")
   - "description": string (brief description)
   - "difficulty": string ("easy", "medium", or "hard")
   - "page_refs": array of page references (if mentioned, otherwise empty array)
3. Extract all mentioned topics and readings
4. Use context to infer difficulty if not explicitly mentioned

Example format:
[
  {
    "topic": "Cell Division",
    "date": "2024-09-15",
    "description": "Mitosis and meiosis processes",
    "difficulty": "medium",
    "page_refs": ["Ch3 p45-52", "Lab Manual p12"]
  }
]

SYLLABUS TEXT:
` + syllabusText

	// Use Anthropic for structured JSON
	if s.anthropicService != nil {
		response, err := s.anthropicService.GenerateContent(ctx, systemPrompt)
		if err == nil {
			return s.parseSyllabusTopics(response)
		}
	}

	// Fallback to Gemini
	if s.aiService != nil {
		response, err := s.aiService.GenerateContent(ctx, systemPrompt)
		if err == nil {
			return s.parseSyllabusTopics(response)
		}
	}

	return nil, fmt.Errorf("topic extraction failed")
}

// parseSyllabusTopics parses the AI response into syllabus topics
func (s *StudyService) parseSyllabusTopics(rawResponse string) ([]models.SyllabusTopic, error) {
	cleanJSON := rawResponse
	if start := strings.Index(rawResponse, "["); start != -1 {
		if end := strings.LastIndex(rawResponse, "]"); end != -1 && end > start {
			cleanJSON = rawResponse[start : end+1]
		}
	}

	var topics []models.SyllabusTopic
	err := json.Unmarshal([]byte(cleanJSON), &topics)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Syllabus JSON: %v", err)
	}

	return topics, nil
}

// GenerateStudyGuide generates a study guide from summary text and topics
func (s *StudyService) GenerateStudyGuide(ctx context.Context, summaryText string, topics []string) (string, error) {
	systemPrompt := fmt.Sprintf(`Create a structured study guide from this summary.

Focus on these topics: %v

FORMAT:
1. Start with an overview
2. For each topic, create:
   - Key concepts (bullet points)
   - Important definitions
   - Related examples
   - Practice questions
3. End with study tips

SUMMARY:
%s`, topics, summaryText)

	if s.aiService != nil {
		return s.aiService.GenerateSummary(ctx, systemPrompt, "detailed")
	}

	return "", fmt.Errorf("AI service unavailable")
}

// GetReviewQueue gets all summaries needing review for a user
func (s *StudyService) GetReviewQueue(userID string) ([]models.PdfSummary, error) {
	// This would be implemented by calling the repository
	// For now, returning empty - will be implemented in handler
	return []models.PdfSummary{}, nil
}

// CalculateStudyStats calculates statistics for study dashboard
func (s *StudyService) CalculateStudyStats(summaries []models.PdfSummary) *StudyStats {
	stats := &StudyStats{
		TotalSummaries: len(summaries),
	}

	for _, summary := range summaries {
		// Count by status
		switch summary.StudyStatus {
		case "completed":
			stats.CompletedSummaries++
		case "in_progress":
			stats.InProgressSummaries++
		case "reviewing":
			stats.ReviewingSummaries++
		}

		// Sum up reviews
		stats.TotalReviews += summary.ReviewCount

		// Track progress
		stats.TotalProgress += summary.ProgressPercent
		if summary.ProgressPercent == 100 {
			stats.CompletedSummaries++
		}
	}

	if stats.TotalSummaries > 0 {
		stats.AverageProgress = float64(stats.TotalProgress) / float64(stats.TotalSummaries)
	}

	// Calculate streak (placeholder - would need more complex date-based calculation)
	stats.CurrentStreak = 1 // Placeholder

	return stats
}

type StudyStats struct {
	TotalSummaries      int
	CompletedSummaries  int
	InProgressSummaries int
	ReviewingSummaries  int
	TotalReviews        int
	TotalProgress       int
	AverageProgress     float64
	CurrentStreak       int
}
