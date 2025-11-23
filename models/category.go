package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name        string `gorm:"size:100;not null"`
	Slug        string `gorm:"size:100;uniqueIndex;not null"`
	Description string `gorm:"type:text"`

	ImageURL string `gorm:"size:500"`

	ParentID *uint
	Parent   *Category `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Children []Category `gorm:"foreignKey:ParentID"`

	Products []Product
}
