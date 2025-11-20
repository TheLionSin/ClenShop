package routes

import (
	"clen_shop/controllers"
	"clen_shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterCategoryRoutes(r *gin.Engine) {
	r.GET("/categories", controllers.ListCategories)

	admin := r.Group("/admin")
	admin.Use(middleware.RequireAuth(), middleware.RequireRole("admin"))

	admin.POST("/categories", controllers.CreateCategory)
	admin.PUT("/categories/:id", controllers.UpdateCategory)
	admin.DELETE("/categories/:id", controllers.DeleteCategory)
}
