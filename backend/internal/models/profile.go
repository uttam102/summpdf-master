package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserProfile struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ClerkID    string             `bson:"clerk_id" json:"clerk_id"`
	FullName   string             `bson:"full_name" json:"full_name"`
	Bio        string             `bson:"bio" json:"bio"`
	Profession string             `bson:"profession" json:"profession"`
	Location   string             `bson:"location" json:"location"`
	UpdatedAt  time.Time          `bson:"updated_at" json:"updated_at"`
}
