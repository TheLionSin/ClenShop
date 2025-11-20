package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func RespondOK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{"ok": true, "data": data})
}

func RespondCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{"ok": true, "data": data})
}

func RespondError(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"ok": false, "error": msg})
}

func RespondValidation(c *gin.Context, errors map[string]string) {
	c.JSON(http.StatusBadRequest, gin.H{"ok": false, "errors": errors})
}
