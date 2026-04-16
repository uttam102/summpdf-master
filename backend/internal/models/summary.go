package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PdfSummary struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID          string             `bson:"user_id" json:"user_id"`
	OriginalFileUrl string             `bson:"original_file_url" json:"original_file_url"`
	SummaryText     string             `bson:"summary_text" json:"summary_text"`
	WordCount       int                `bson:"word_count" json:"word_count"`
	Title           string             `bson:"title" json:"title"`
	FileName        string             `bson:"file_name" json:"file_name"`
	Status          string             `bson:"status" json:"status"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`

	// Study-specific fields
	Subject         string             `bson:"subject,omitempty" json:"subject"`                 // "Biology", "Math 101"
	FolderID        *string            `bson:"folder_id,omitempty" json:"folder_id"`             // Link to folder
	Topics          []string           `bson:"topics,omitempty" json:"topics"`                     // Syllabus topics
	StudyStatus     string             `bson:"study_status,omitempty" json:"study_status"`        // "not_started", "in_progress", "completed", "reviewing"
	ProgressPercent int                `bson:"progress_percent,omitempty" json:"progress_percent"` // 0-100

	// Q&A pairs for study
	QAPairs []QAPair `bson:"qa_pairs,omitempty" json:"qa_pairs"`

	// Study tracking for spaced repetition
	NextReviewDate *time.Time `bson:"next_review_date,omitempty" json:"next_review_date"`
	LastReviewedAt *time.Time `bson:"last_reviewed_at,omitempty" json:"last_reviewed_at"`
	ReviewCount    int        `bson:"review_count,omitempty" json:"review_count"`
	StudySessions  []StudySession `bson:"study_sessions,omitempty" json:"study_sessions"`

	// Study schedule
	StudySchedule *StudySchedule `bson:"study_schedule,omitempty" json:"study_schedule"`

	// Difficulty rating (for spaced repetition adjustment)
	Difficulty string `bson:"difficulty,omitempty" json:"difficulty"` // "easy", "medium", "hard"
}

type QAPair struct {
	Question   string  `bson:"question" json:"question"`
	Answer     string  `bson:"answer" json:"answer"`
	Confidence float32 `bson:"confidence,omitempty" json:"confidence"` // 0-1
	CreatedAt  time.Time `bson:"created_at" json:"created_at"`
}

type StudySession struct {
	Date          time.Time `bson:"date" json:"date"`
	Duration      int       `bson:"duration,omitempty" json:"duration"`           // minutes
	PagesCovered  int       `bson:"pages_covered,omitempty" json:"pages_covered"`
	Understanding int       `bson:"understanding,omitempty" json:"understanding"` // 1-5 rating
}

type StudySchedule struct {
	StartDate time.Time `bson:"start_date" json:"start_date"`
	EndDate   time.Time `bson:"end_date" json:"end_date"`
	Frequency string    `bson:"frequency,omitempty" json:"frequency"` // "daily", "custom"
}
