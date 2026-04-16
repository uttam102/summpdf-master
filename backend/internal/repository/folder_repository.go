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

type FolderRepository struct {
	collection *mongo.Collection
}

func NewFolderRepository(db *mongo.Database) *FolderRepository {
	return &FolderRepository{
		collection: db.Collection("folders"),
	}
}

// CreateFolder creates a new folder for a user
func (r *FolderRepository) CreateFolder(ctx context.Context, folder *models.Folder) error {
	folder.CreatedAt = time.Now()
	folder.UpdatedAt = time.Now()

	doc := bson.M{
		"user_id":    folder.UserID,
		"name":       folder.Name,
		"subject":    folder.Subject,
		"color":      folder.Color,
		"parent_id":  folder.ParentID,
		"created_at": folder.CreatedAt,
		"updated_at": folder.UpdatedAt,
	}

	result, err := r.collection.InsertOne(ctx, doc)
	if err != nil {
		return err
	}

	folder.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// GetFoldersByUserID gets all folders for a user, sorted by creation date
func (r *FolderRepository) GetFoldersByUserID(ctx context.Context, userID string) ([]models.Folder, error) {
	var folders []models.Folder

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})
	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &folders); err != nil {
		return nil, err
	}

	return folders, nil
}

// GetFolderByID gets a specific folder
func (r *FolderRepository) GetFolderByID(ctx context.Context, id string) (*models.Folder, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var folder models.Folder
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&folder)
	if err != nil {
		return nil, err
	}

	return &folder, nil
}

// UpdateFolder updates a folder's details
func (r *FolderRepository) UpdateFolder(ctx context.Context, folderID string, updates bson.M) error {
	objID, err := primitive.ObjectIDFromHex(folderID)
	if err != nil {
		return err
	}

	updates["updated_at"] = time.Now()
	_, err = r.collection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updates},
	)

	return err
}

// DeleteFolder deletes a folder (soft delete for safety - delete associated summaries)
func (r *FolderRepository) DeleteFolder(ctx context.Context, folderID string) error {
	objID, err := primitive.ObjectIDFromHex(folderID)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

// GetFoldersBySubject gets folders grouped by subject
func (r *FolderRepository) GetFoldersBySubject(ctx context.Context, userID string) (map[string][]models.Folder, error) {
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"user_id": userID,
				"subject": bson.M{"$exists": true, "$ne": ""},
			},
		},
		{
			"$group": bson.M{
				"_id": "$subject",
				"folders": bson.M{"$push": "$$ROOT"},
			},
		},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		Subject string          `bson:"_id"`
		Folders []models.Folder `bson:"folders"`
	}

	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	grouped := make(map[string][]models.Folder)
	for _, result := range results {
		grouped[result.Subject] = result.Folders
	}

	return grouped, nil
}
