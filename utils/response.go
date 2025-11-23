package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RespondOK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{"ok": true, "data": data})
}

func RespondCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{"ok": true, "data": data})
}

func RespondError(c *gin.Context, status int, message string, extras ...gin.H) {
	body := gin.H{
		"error": message,
	}

	// если передали extras — добавим в ответ
	if len(extras) > 0 {
		for k, v := range extras[0] {
			body[k] = v
		}
	}

	c.JSON(status, body)
}

func RespondValidation(c *gin.Context, errors map[string]string) {
	c.JSON(http.StatusBadRequest, gin.H{"ok": false, "errors": errors})
}
