package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name        string         `gorm:"size:100;not null"`
	Slug        string         `gorm:"size:100;uniqueIndex;not null"`
	Description string         `gorm:"type:text"`
	Price       int64          `gorm:"not null;index"`
	Stock       int            `gorm:"not null;default:0"`
	IsActive    bool           `gorm:"not null;default:true"`
	CategoryID  uint           `gorm:"index"`
	Category    Category       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	Images      []ProductImage `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Tastes []ProductTaste `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type ProductTaste struct {
	gorm.Model
	ProductID uint   `gorm:"index;not null"`
	Name      string `gorm:"size:100;not null"`
}
