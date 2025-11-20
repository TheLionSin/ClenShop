package models

import "gorm.io/gorm"

type ProductImage struct {
	gorm.Model
	ProductID uint   `gorm:"index;not null"`
	URL       string `gorm:"size:500;not null"`
	IsPrimary bool   `gorm:"not null;default:false"`
	SortOrder int    `gorm:"not null;default:0"`
}
