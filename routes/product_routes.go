package routes

import (
	"clen_shop/controllers"
	"clen_shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterProductRoutes(r *gin.Engine) {

	r.GET("/products", controllers.ListProducts)
	r.GET("/products/:slug", controllers.GetProduct)

	admin := r.Group("/admin")
	admin.Use(middleware.RequireAuth(), middleware.RequireRole("admin"))

	admin.GET("/products", controllers.AdminListProducts)
	admin.GET("/products/:id", controllers.AdminGetProduct)
	admin.POST("/products", controllers.CreateProduct)
	admin.PUT("/products/:id", controllers.UpdateProduct)
	admin.DELETE("/products/:id", controllers.DeleteProduct)

}
