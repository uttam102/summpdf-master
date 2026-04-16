package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"os"
	"summpdf-go-backend/internal/models"
	"summpdf-go-backend/internal/repository"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	googleoauth2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

var googleOauthConfig = &oauth2.Config{
	RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
	ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
	Endpoint:     google.Endpoint,
}

type AuthHandler struct {
	repo *repository.UserRepository
}

func NewAuthHandler(repo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{repo: repo}
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	state := generateStateOauthCookie(c)
	url := googleOauthConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	oauthState, _ := c.Cookie("oauthstate")
	if c.Query("state") != oauthState {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid oauth state"})
		return
	}

	token, err := googleOauthConfig.Exchange(context.Background(), c.Query("code"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Code exchange failed: " + err.Error()})
		return
	}

	oauth2Service, err := googleoauth2.NewService(context.Background(), option.WithTokenSource(googleOauthConfig.TokenSource(context.Background(), token)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create oauth2 service: " + err.Error()})
		return
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info: " + err.Error()})
		return
	}

	// 1. Check if user exists, if not create
	user, err := h.repo.GetUserByGoogleID(c.Request.Context(), userInfo.Id)
	if err != nil {
		// Create new user
		user = &models.User{
			GoogleID:  userInfo.Id,
			Email:     userInfo.Email,
			Name:      userInfo.Name,
			Picture:   userInfo.Picture,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err = h.repo.CreateUser(c.Request.Context(), user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
			return
		}
	}

	// 2. Set session cookie (Simplified for now - just using user_id)
	c.SetCookie("user_id", user.GoogleID, 3600*24*7, "/", "", false, true)
	c.SetCookie("user_name", user.Name, 3600*24*7, "/", "", false, false)
	c.SetCookie("user_picture", user.Picture, 3600*24*7, "/", "", false, false)

	c.Redirect(http.StatusTemporaryRedirect, "/dashboard")
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("user_id", "", -1, "/", "", false, true)
	c.Redirect(http.StatusTemporaryRedirect, "/")
}

func generateStateOauthCookie(c *gin.Context) string {
	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)
	c.SetCookie("oauthstate", state, 3600, "/", "", false, true)
	return state
}
