package routes

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	cfg := cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://clen.kz",
			"https://clen.kz",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	r.Use(cors.New(cfg))

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	RegisterCategoryRoutes(r)
	RegisterProductRoutes(r)
	RegisterAuthRoutes(r)
	RegisterUserRoutes(r)

	return r
}
