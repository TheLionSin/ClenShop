package dto

import "clen_shop/models"

type CategoryCreateRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Slug        string `json:"slug" validate:"required,min=2,max=100"`
	Description string `json:"description"`

	ParentID *uint `json:"parent_id"`

	ImageURL string `json:"image_url" validate:"omitempty,url"`
}

type CategoryUpdateRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=2,max=100"`
	Slug        *string `json:"slug" validate:"omitempty,min=2,max=100"`
	Description *string `json:"description"`
	ParentID    *uint   `json:"parent_id"`
	ImageURL    *string `json:"image_url" validate:"omitempty,url"`
}

type CategoryResponse struct {
	ID          uint             `json:"id"`
	Name        string           `json:"name"`
	Slug        string           `json:"slug"`
	Description string           `json:"description"`
	ImageURL    string           `json:"image_url"`
	ParentID    *uint            `json:"parent_id"`
	Products    []models.Product `json:"products"`
}
