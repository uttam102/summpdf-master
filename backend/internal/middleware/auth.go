package middleware

import (
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := c.Cookie("user_id")
		if err == nil && userID != "" {
			c.Set("user_id", userID)

			userName, _ := c.Cookie("user_name")
			c.Set("user_name", userName)

			userPicture, _ := c.Cookie("user_picture")
			c.Set("user_picture", userPicture)
		}
		c.Next()
	}
}
