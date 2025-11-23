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

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func CreateCategory(c *gin.Context) {
	var req dto.CategoryCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid json")
		return
	}

	if err := validators.Validate.Struct(req); err != nil {
		errorsMap := make(map[string]string)
		for _, e := range err.(validator.ValidationErrors) {
			errorsMap[e.Field()] = fmt.Sprintf("не проходит '%s'", e.Tag())
		}
		utils.RespondValidation(c, errorsMap)
		return
	}

	category := models.Category{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		ParentID:    req.ParentID,
		ImageURL:    req.ImageURL,
	}

	if err := config.DB.Create(&category).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	utils.RespondCreated(c, dto.CategoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		ImageURL:    category.ImageURL,
		ParentID:    category.ParentID,
	})

}

func UpdateCategory(c *gin.Context) {
	var req dto.CategoryUpdateRequest

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

	var category models.Category
	if err := config.DB.First(&category, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.RespondError(c, http.StatusNotFound, "category not found")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	if req.Name != nil {
		category.Name = *req.Name
	}

	if req.Slug != nil {
		category.Slug = *req.Slug
	}

	if req.Description != nil {
		category.Description = *req.Description
	}

	if req.ImageURL != nil {
		category.ImageURL = *req.ImageURL
	}

	category.ParentID = req.ParentID

	if err := config.DB.Save(&category).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	utils.RespondOK(c, dto.CategoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		ImageURL:    category.ImageURL,
		ParentID:    category.ParentID,
	})

}

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	var category models.Category

	// тянем категорию с товарами
	if err := config.DB.Preload("Products").First(&category, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.RespondError(c, http.StatusNotFound, "Категория не найдена")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Ошибка поиска категории")
		return
	}

	// если есть привязанные товары — возвращаем ошибку
	if len(category.Products) > 0 {
		productList := make([]gin.H, 0, len(category.Products))
		for _, p := range category.Products {
			productList = append(productList, gin.H{
				"id":   p.ID,
				"name": p.Name,
			})
		}

		utils.RespondError(
			c,
			http.StatusBadRequest,
			fmt.Sprintf("Невозможно удалить категорию '%s': к ней привязаны товары", category.Name),
			gin.H{"products": productList},
		)
		return
	}

	// безопасно удаляем — привязанных товаров нет
	if err := config.DB.Unscoped().Delete(&category).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Ошибка удаления категории")
		return
	}

	utils.RespondOK(c, gin.H{"deleted": true})
}

func GetCategory(c *gin.Context) {

	slug := c.Param("slug")

	var category models.Category

	if err := config.DB.Where("slug = ?", slug).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.RespondError(c, http.StatusNotFound, "category not found")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	utils.RespondOK(c, dto.CategoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		ImageURL:    category.ImageURL,
		ParentID:    category.ParentID,
		Products:    category.Products,
	})

}

func ListCategories(c *gin.Context) {
	page, limit := utils.GetPage(c)
	q := c.Query("q")

	db := config.DB.Model(&models.Category{})

	if q != "" {
		db = db.Where("name ILIKE ? or slug ILIKE ?", "%"+q+"%", "%"+q+"%")
	}

	var total int64
	_ = db.Count(&total).Error

	var items []models.Category

	if err := db.Order("created_at desc").Limit(limit).Offset(utils.Offset(page, limit)).
		Find(&items).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	resp := make([]dto.CategoryResponse, 0, len(items))
	for _, it := range items {
		resp = append(resp, dto.CategoryResponse{
			ID:          it.ID,
			Name:        it.Name,
			Slug:        it.Slug,
			Description: it.Description,
			ImageURL:    it.ImageURL,
			ParentID:    it.ParentID,
		})
	}

	utils.RespondOK(c, gin.H{
		"page":  page,
		"limit": limit,
		"total": total,
		"items": resp,
	})

}
