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

type SummaryRepository struct {
	collection *mongo.Collection
}

func NewSummaryRepository(db *mongo.Database) *SummaryRepository {
	return &SummaryRepository{
		collection: db.Collection("pdf_summaries"),
	}
}

func (r *SummaryRepository) GetSummariesByUserID(ctx context.Context, userID string) ([]models.PdfSummary, error) {
	var summaries []models.PdfSummary
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &summaries); err != nil {
		return nil, err
	}

	return summaries, nil
}

func (r *SummaryRepository) GetSummaryByID(ctx context.Context, id string) (*models.PdfSummary, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var summary models.PdfSummary
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&summary)
	if err != nil {
		return nil, err
	}

	return &summary, nil
}

func (r *SummaryRepository) DeleteSummary(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

func (r *SummaryRepository) CreateSummary(ctx context.Context, summary *models.PdfSummary) error {
	summary.CreatedAt = time.Now()
	summary.UpdatedAt = time.Now()

	res, err := r.collection.InsertOne(ctx, summary)
	if err != nil {
		return err
	}

	summary.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}
