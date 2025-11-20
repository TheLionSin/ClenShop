package controllers

import (
	"clen_shop/config"
	"clen_shop/dto"
	"clen_shop/models"
	"clen_shop/utils"
	"clen_shop/validators"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
	"net/http"
	"strconv"
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
		db = db.Where("name ILIKE ? OR slug ILIKE", "%"+q+"%", "%"+q+"%")
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
	utils.RespondOK(c, gin.H{"ok": true, "page": page, "limit": limit, "total": total, "data": resp})
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
