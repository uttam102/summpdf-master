package repository

import (
	"context"
	"summpdf-go-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type StudyRepository struct {
	db *mongo.Database
}

func NewStudyRepository(db *mongo.Database) *StudyRepository {
	return &StudyRepository{db: db}
}

// UpdateStudyStatus updates the study status and progress
func (r *StudyRepository) UpdateStudyStatus(ctx context.Context, summaryID string, status string, progress int) error {
	objID, err := primitive.ObjectIDFromHex(summaryID)
	if err != nil {
		return err
	}

	updates := bson.M{
		"study_status":    status,
		"progress_percent": progress,
		"updated_at":      time.Now(),
	}

	_, err = r.db.Collection("pdf_summaries").UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updates},
	)

	return err
}

// AddQAPairs adds Q&A pairs to a summary
func (r *StudyRepository) AddQAPairs(ctx context.Context, summaryID string, qaPairs []models.QAPair) error {
	objID, err := primitive.ObjectIDFromHex(summaryID)
	if err != nil {
		return err
	}

	_, err = r.db.Collection("pdf_summaries").UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{
			"$set": bson.M{
				"qa_pairs":  qaPairs,
				"updated_at": time.Now(),
			},
		},
	)

	return err
}

// MoveToFolder moves a summary to a different folder
func (r *StudyRepository) MoveToFolder(ctx context.Context, summaryID string, folderID *string) error {
	objID, err := primitive.ObjectIDFromHex(summaryID)
	if err != nil {
		return err
	}

	_, err = r.db.Collection("pdf_summaries").UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{
			"$set": bson.M{
				"folder_id": folderID,
				"updated_at": time.Now(),
			},
		},
	)

	return err
}

// MarkAsReviewed marks a summary as reviewed and updates spaced repetition data
func (r *StudyRepository) MarkAsReviewed(ctx context.Context, summaryID string, understanding int, nextReview *time.Time) error {
	objID, err := primitive.ObjectIDFromHex(summaryID)
	if err != nil {
		return err
	}

	now := time.Now()

	updates := bson.M{
		"last_reviewed_at": now,
		"review_count":       bson.M{"$inc": 1},
		"updated_at":         now,
	}

	if nextReview != nil {
		updates["next_review_date"] = nextReview
	}

	if understanding > 0 {
		updates["difficulty"] = r.understandingToDifficulty(understanding)
	}

	_, err = r.db.Collection("pdf_summaries").UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updates, "$inc": bson.M{"review_count": 1}},
	)

	return err
}

// AddStudySession adds a study session entry
func (r *StudyRepository) AddStudySession(ctx context.Context, summaryID string, session models.StudySession) error {
	objID, err := primitive.ObjectIDFromHex(summaryID)
	if err != nil {
		return err
	}

	session.Date = time.Now()

	_, err = r.db.Collection("pdf_summaries").UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{
			"$push": bson.M{"study_sessions": session},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)

	return err
}

// UpdateStudySchedule updates the study schedule for a summary
func (r *StudyRepository) UpdateStudySchedule(ctx context.Context, summaryID string, schedule models.StudySchedule) error {
	objID, err := primitive.ObjectIDFromHex(summaryID)
	if err != nil {
		return err
	}

	_, err = r.db.Collection("pdf_summaries").UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{
			"$set": bson.M{
				"study_schedule": schedule,
				"updated_at":     time.Now(),
			},
		},
	)

	return err
}

// GetReviewQueue gets summaries needing review based on next_review_date
func (r *StudyRepository) GetReviewQueue(ctx context.Context, userID string, limit int) ([]models.PdfSummary, error) {
	now := time.Now()

	opts := options.Find().
		SetSort(bson.D{{Key: "next_review_date", Value: 1}}).
		SetLimit(int64(limit))

	cursor, err := r.db.Collection("pdf_summaries").Find(ctx,
		bson.M{
			"user_id":           userID,
			"next_review_date":  bson.M{"$lte": now},
			"study_status":      bson.M{"$in": []string{"in_progress", "reviewing"}},
		},
		opts,
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var summaries []models.PdfSummary
	if err = cursor.All(ctx, &summaries); err != nil {
		return nil, err
	}

	return summaries, nil
}

// GetStudyStats gets study statistics for a user
func (r *StudyRepository) GetStudyStats(ctx context.Context, userID string) (*StudyStats, error) {
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"user_id": userID,
			},
		},
		{
			"$group": bson.M{
				"_id": nil,
				"total_summaries":      bson.M{"$sum": 1},
				"completed_summaries":  bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []string{"$study_status", "completed"}}, 1, 0}}},
				"in_progress_summaries": bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []string{"$study_status", "in_progress"}}, 1, 0}}},
				"reviewing_summaries":  bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []string{"$study_status", "reviewing"}}, 1, 0}}},
				"total_reviews":        bson.M{"$sum": "$review_count"},
				"avg_progress":         bson.M{"$avg": "$progress_percent"},
				"streak_days":          bson.M{"$max": "$review_count"}, // Placeholder
			},
		},
	}

	cursor, err := r.db.Collection("pdf_summaries").Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []StudyStats
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return &StudyStats{}, nil
	}

	return &results[0], nil
}

// GetSummariesByFolder gets summaries within a specific folder
func (r *StudyRepository) GetSummariesByFolder(ctx context.Context, userID string, folderID string) ([]models.PdfSummary, error) {
	var summaries []models.PdfSummary

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.db.Collection("pdf_summaries").Find(ctx,
		bson.M{
			"user_id":   userID,
			"folder_id": folderID,
		},
		opts,
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &summaries); err != nil {
		return nil, err
	}

	return summaries, nil
}

// SearchSummariesByTopic searches for summaries by topic
func (r *StudyRepository) SearchSummariesByTopic(ctx context.Context, userID string, topic string) ([]models.PdfSummary, error) {
	var summaries []models.PdfSummary

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.db.Collection("pdf_summaries").Find(ctx,
		bson.M{
			"user_id": userID,
			"topics":  bson.M{"$in": []string{topic}},
		},
		opts,
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &summaries); err != nil {
		return nil, err
	}

	return summaries, nil
}

// Helper method to convert understanding to difficulty string
func (r *StudyRepository) understandingToDifficulty(understanding int) string {
	switch {
	case understanding >= 4:
		return "easy"
	case understanding >= 2:
		return "medium"
	default:
		return "hard"
	}
}

type StudyStats struct {
	TotalSummaries      int     `bson:"total_summaries" json:"total_summaries"`
	CompletedSummaries  int     `bson:"completed_summaries" json:"completed_summaries"`
	InProgressSummaries int     `bson:"in_progress_summaries" json:"in_progress_summaries"`
	ReviewingSummaries  int     `bson:"reviewing_summaries" json:"reviewing_summaries"`
	TotalReviews        int     `bson:"total_reviews" json:"total_reviews"`
	AvgProgress         float64 `bson:"avg_progress" json:"avg_progress"`
	StreakDays          int     `bson:"streak_days" json:"streak_days"`
}
