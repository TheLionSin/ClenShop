package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Page struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

func GetPage(c *gin.Context) (page, limit int) {
	page = 1
	limit = 12

	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}
	return
}

func Offset(page, limit int) int {
	return (page - 1) * limit
}
