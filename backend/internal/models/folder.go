package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Folder struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID    string             `bson:"user_id" json:"user_id"`
	Name      string             `bson:"name" json:"name"`
	Subject   string             `bson:"subject,omitempty" json:"subject"`
	Color     string             `bson:"color,omitempty" json:"color"` // Hex color for UI
	ParentID  *string            `bson:"parent_id,omitempty" json:"parent_id"` // For nested folders
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type SyllabusTopic struct {
	Topic       string    `bson:"topic" json:"topic"`
	Date        string    `bson:"date,omitempty" json:"date"`
	Description string    `bson:"description,omitempty" json:"description"`
	Difficulty  string    `bson:"difficulty,omitempty" json:"difficulty"`
	PageRefs    []string  `bson:"page_refs,omitempty" json:"page_refs"`
}
