package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequireRole(need string) gin.HandlerFunc {
	return func(c *gin.Context) {

		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "error": "no role in context"})
			c.Abort()
			return
		}

		userRole, _ := role.(string)
		if userRole != need {
			c.JSON(http.StatusForbidden, gin.H{"ok": false, "error": "access denied"})
			c.Abort()
			return
		}
		c.Next()
	}
}
