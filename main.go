package main

import (
	"clen_shop/config"
	"clen_shop/models"
	"clen_shop/routes"
)

func main() {

	config.ConnectDB()
	config.DB.AutoMigrate(&models.Category{}, &models.Product{}, &models.ProductImage{})

	r := routes.SetupRoutes()

	r.Run(":8080")

}
