package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	_ = godotenv.Load(".env")
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		_ = godotenv.Load("../.env")
		databaseURL = os.Getenv("DATABASE_URL")
	}
	if databaseURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(databaseURL))
	if err != nil {
		log.Fatalf("mongo.Connect: %v", err)
	}
	defer client.Disconnect(context.Background())

	coll := client.Database("summpdf").Collection("pdf_summaries")
	cursor, err := coll.Find(context.Background(), bson.M{}, options.Find().SetLimit(3))
	if err != nil {
		log.Fatalf("coll.Find: %v", err)
	}
	defer cursor.Close(context.Background())

	var summaries []bson.M
	if err = cursor.All(context.Background(), &summaries); err != nil {
		log.Fatalf("cursor.All: %v", err)
	}

	for _, s := range summaries {
		fmt.Printf("Summary ID: %v, Title: %v\n", s["_id"], s["title"])
	}
}
