package repository

import (
	"context"
	"time"

	"summpdf-go-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProfileRepository struct {
	collection *mongo.Collection
}

func NewProfileRepository(db *mongo.Database) *ProfileRepository {
	return &ProfileRepository{
		collection: db.Collection("user_profiles"),
	}
}

func (r *ProfileRepository) GetProfileByClerkID(ctx context.Context, clerkID string) (*models.UserProfile, error) {
	var profile models.UserProfile

	err := r.collection.FindOne(ctx, bson.M{"clerk_id": clerkID}).Decode(&profile)
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *ProfileRepository) UpdateProfile(ctx context.Context, profile *models.UserProfile) error {
	filter := bson.M{"clerk_id": profile.ClerkID}
	update := bson.M{
		"$set": bson.M{
			"full_name":  profile.FullName,
			"bio":        profile.Bio,
			"profession": profile.Profession,
			"location":   profile.Location,
			"updated_at": time.Now(),
		},
	}

	opts := options.Update().SetUpsert(true)

	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	return err
}
