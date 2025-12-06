package dto

type ProductCreateRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Slug        string `json:"slug" validate:"required,min=2,max=100"`
	Description string `json:"description" validate:"required,max=5000"`
	Price       int64  `json:"price" validate:"required,min=1"`
	Stock       int    `json:"stock" validate:"min=0"`
	IsActive    *bool  `json:"is_active"`
	CategoryID  uint   `json:"category_id" validate:"required"`

	Tastes []string `json:"tastes" validate:"omitempty,dive,min=1,max=100"`

	Images []struct {
		URL       string `json:"url" validate:"required,url"`
		IsPrimary bool   `json:"is_primary"`
		SortOrder int    `json:"sort_order" validate:"min=0"`
	} `json:"images" validate:"dive"`
}

type ProductUpdateRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=2,max=100"`
	Slug        *string `json:"slug" validate:"omitempty,min=2,max=100"`
	Description *string `json:"description" validate:"omitempty,max=5000"`
	Price       *int64  `json:"price" validate:"omitempty,min=1"`
	Stock       *int    `json:"stock" validate:"omitempty,min=0"`
	IsActive    *bool   `json:"is_active"`
	CategoryID  *uint   `json:"category_id"`

	Tastes *[]string `json:"tastes" validate:"omitempty,dive,min=1,max=100"`

	Images []struct {
		URL       string `json:"url" validate:"required,url"`
		IsPrimary bool   `json:"is_primary"`
		SortOrder int    `json:"sort_order" validate:"min=0"`
	} `json:"images" validate:"omitempty,dive"`
}

type ProductResponse struct {
	ID          uint              `json:"id"`
	Name        string            `json:"name"`
	Slug        string            `json:"slug"`
	Description string            `json:"description"`
	Price       int64             `json:"price"`
	Stock       int               `json:"stock"`
	IsActive    bool              `json:"is_active"`
	CategoryID  uint              `json:"category_id"`
	Images      []ProductImageDTO `json:"images"`
	Tastes      []string          `json:"tastes"`
}

type ProductImageDTO struct {
	ID        uint   `json:"id"`
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
	SortOrder int    `json:"sort_order"`
}
