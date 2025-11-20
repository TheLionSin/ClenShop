package routes

import (
	"clen_shop/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterCategoryRoutes(r *gin.Engine) {
	r.GET("/categories", controllers.ListCategories)
	r.POST("/categories", controllers.CreateCategory)
	r.PUT("/categories/:id", controllers.UpdateCategory)
	r.DELETE("/categories/:id", controllers.DeleteCategory)
}
