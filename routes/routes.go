package routes

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(cors.Default())

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	RegisterCategoryRoutes(r)
	RegisterProductRoutes(r)
	RegisterAuthRoutes(r)
	RegisterUserRoutes(r)

	return r
}
