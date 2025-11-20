package routes

import (
	"clen_shop/controllers"
	"clen_shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.Engine) {
	protected := r.Group("/")
	protected.Use(middleware.RequireAuth())

	protected.GET("me", controllers.GetCurrentUser)
}
