package controllers

import (
	"clen_shop/config"
	"clen_shop/dto"
	"clen_shop/models"
	"clen_shop/utils"
	"clen_shop/validators"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func CreateProduct(c *gin.Context) {
	var req dto.ProductCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid json")
		return
	}

	if err := validators.Validate.Struct(req); err != nil {
		errorsMap := make(map[string]string)
		for _, e := range err.(validator.ValidationErrors) {
			errorsMap[e.Field()] = fmt.Sprintf("не проходит поле '%s'", e.Tag())
		}
		utils.RespondValidation(c, errorsMap)
		return
	}

	p := models.Product{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		IsActive:    true,
		CategoryID:  req.CategoryID,
	}

	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}

	if err := config.DB.Create(&p).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	if len(req.Images) > 0 {
		images := make([]models.ProductImage, 0, len(req.Images))
		for _, img := range req.Images {
			images = append(images, models.ProductImage{
				ProductID: p.ID,
				URL:       img.URL,
				IsPrimary: img.IsPrimary,
				SortOrder: img.SortOrder,
			})
		}
		_ = config.DB.Create(&images).Error
	}

	utils.RespondCreated(c, productToResp(p))
}

func UpdateProduct(c *gin.Context) {
	var req dto.ProductUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid json")
		return
	}

	if err := validators.Validate.Struct(req); err != nil {
		errorsMap := make(map[string]string)
		for _, e := range err.(validator.ValidationErrors) {
			errorsMap[e.Field()] = fmt.Sprintf("не проходит поле '%s'", e.Tag())
		}
		utils.RespondValidation(c, errorsMap)
		return
	}

	var p models.Product

	if err := config.DB.Preload("Images").First(&p, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.RespondError(c, http.StatusNotFound, "product not found")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if req.Name != nil {
			p.Name = *req.Name
		}
		if req.Slug != nil {
			p.Slug = *req.Slug
		}
		if req.Description != nil {
			p.Description = *req.Description
		}
		if req.Price != nil {
			p.Price = *req.Price
		}
		if req.Stock != nil {
			p.Stock = *req.Stock
		}
		if req.IsActive != nil {
			p.IsActive = *req.IsActive
		}
		if req.CategoryID != nil {
			p.CategoryID = *req.CategoryID
		}

		if err := tx.Save(&p).Error; err != nil {
			return err
		}

		if req.Images != nil && len(req.Images) > 0 {
			if err := tx.Where("product_id = ?", p.ID).Delete(&models.ProductImage{}).Error; err != nil {
				return err
			}

			images := make([]models.ProductImage, 0, len(req.Images))
			for _, img := range req.Images {
				images = append(images, models.ProductImage{
					ProductID: p.ID,
					URL:       img.URL,
					IsPrimary: img.IsPrimary,
					SortOrder: img.SortOrder,
				})
			}
			if err := tx.Create(&images).Error; err != nil {
				return err
			}
			p.Images = images
		}
		return nil
	})

	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	utils.RespondOK(c, productToResp(p))

}

func DeleteProduct(c *gin.Context) {
	if err := config.DB.Delete(&models.Product{}, c.Param("id")).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}
	utils.RespondOK(c, gin.H{"deleted": true})
}

func ListProducts(c *gin.Context) {
	page, limit := utils.GetPage(c)
	q := c.Query("q")
	categoryID := c.Query("category_id")
	priceMin := c.Query("price_min")
	priceMax := c.Query("price_max")

	allowedSort := map[string]string{
		"name":       "name",
		"price":      "price",
		"created_at": "created_at",
	}

	order := utils.BuildOrder(c.Query("sort"), allowedSort)

	db := config.DB.Model(&models.Product{}).Where("is_active = ?", true)

	if q != "" {
		db = db.Where("name ILIKE ? OR slug ILIKE ?", "%"+q+"%", "%"+q+"%")
	}

	if categoryID != "" {
		if cid, err := strconv.Atoi(categoryID); err == nil {
			db = db.Where("category_id = ?", cid)
		}
	}

	if priceMin != "" {
		if v, err := strconv.ParseInt(priceMin, 10, 64); err == nil {
			db = db.Where("price >= ?", v)
		}
	}
	if priceMax != "" {
		if v, err := strconv.ParseInt(priceMax, 10, 64); err == nil {
			db = db.Where("price <= ?", v)
		}
	}

	var total int64
	_ = db.Count(&total)

	var items []models.Product

	if err := db.Preload("Images", func(tx *gorm.DB) *gorm.DB {
		return tx.Order("is_primary desc, sort_order asc")
	}).
		Order(order).Limit(limit).Offset(utils.Offset(page, limit)).Find(&items).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	resp := make([]dto.ProductResponse, 0, len(items))
	for _, it := range items {
		resp = append(resp, productWithImagesToResp(it))
	}
	utils.RespondOK(c, gin.H{
		"page":  page,
		"limit": limit,
		"total": total,
		"items": resp,
	})

}

func GetProduct(c *gin.Context) {
	var p models.Product
	if err := config.DB.Preload("Images", func(tx *gorm.DB) *gorm.DB {
		return tx.Order("is_primary desc, sort_order asc")
	}).
		First(&p, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.RespondError(c, http.StatusNotFound, "not found")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}
	utils.RespondOK(c, productWithImagesToResp(p))
}

func AdminListProducts(c *gin.Context) {
	page, limit := utils.GetPage(c)

	db := config.DB.Model(&models.Product{}).
		Preload("Images", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("is_primary desc, sort_order asc")
		})

	if q := c.Query("q"); q != "" {
		db = db.Where("name ILIKE ? OR slug ILIKE ?", "%"+q+"%", "%"+q+"%")
	}

	if catID := c.Query("category_id"); catID != "" {
		if cid, err := strconv.Atoi(catID); err == nil && cid > 0 {
			db = db.Where("category_id = ?", cid)
		}
	}

	if active := c.Query("active"); active != "" {
		if active == "true" {
			db = db.Where("is_active = ?", true)
		} else if active == "false" {
			db = db.Where("is_active = ?", false)
		}
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	var products []models.Product
	if err := db.Order("created_at desc").Limit(limit).Offset(utils.Offset(page, limit)).Find(&products).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	resp := make([]dto.ProductResponse, 0, len(products))
	for _, p := range products {
		resp = append(resp, productWithImagesToResp(p))
	}

	utils.RespondOK(c, gin.H{
		"page":  page,
		"limit": limit,
		"total": total,
		"items": resp,
	})
}

func productToResp(p models.Product) dto.ProductResponse {
	return dto.ProductResponse{
		ID: p.ID, Name: p.Name, Slug: p.Slug, Description: p.Description,
		Price: p.Price, Stock: p.Stock, IsActive: p.IsActive, CategoryID: p.CategoryID,
		Images: []dto.ProductImageDTO{},
	}
}

func productWithImagesToResp(p models.Product) dto.ProductResponse {
	resp := productToResp(p)
	if len(p.Images) > 0 {
		resp.Images = make([]dto.ProductImageDTO, 0, len(p.Images))
		for _, img := range p.Images {
			resp.Images = append(resp.Images, dto.ProductImageDTO{
				ID: img.ID, URL: img.URL, IsPrimary: img.IsPrimary, SortOrder: img.SortOrder,
			})
		}
	}
	return resp
}
