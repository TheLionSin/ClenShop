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
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func Register(c *gin.Context) {
	var req dto.RegisterRequest

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

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "hash error")
		return
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hash,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			utils.RespondError(c, http.StatusConflict, "email already exists")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	resp := dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	utils.RespondCreated(c, resp)
}

func Login(c *gin.Context) {
	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid json")
		return
	}

	if err := validators.Validate.Struct(&req); err != nil {
		errorsMap := make(map[string]string)
		for _, e := range err.(validator.ValidationErrors) {
			errorsMap[e.Field()] = fmt.Sprintf("не проходит '%s'", e.Tag())
		}
		utils.RespondValidation(c, errorsMap)
		return
	}

	var user models.User

	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.RespondError(c, http.StatusNotFound, "user does not exist")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		utils.RespondError(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	access, err := utils.GenerateAccessJWT(user.ID, user.Role)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "token error")
		return
	}

	pass, hash, exp, err := utils.NewRefreshToken()
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "token error")
		return
	}

	rt := models.RefreshToken{
		UserID:    user.ID,
		TokenHash: hash,
		ExpiresAt: exp,
		UserAgent: c.Request.UserAgent(),
		IP:        c.ClientIP(),
	}

	if err := config.DB.Create(&rt).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	utils.RespondOK(c, dto.TokenPairResponse{
		AccessToken:  access,
		RefreshToken: pass,
	})

}

func Refresh(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid json")
		return
	}

	if err := validators.Validate.Struct(&req); err != nil {
		errorsMap := make(map[string]string)
		for _, e := range err.(validator.ValidationErrors) {
			errorsMap[e.Field()] = fmt.Sprintf("не проходит '%s'", e.Tag())
		}
		utils.RespondValidation(c, errorsMap)
		return
	}

	hash := utils.HashRefresh(req.RefreshToken)

	var rt models.RefreshToken

	err := config.DB.Where("token_hash = ? AND expires_at > ?", hash, time.Now()).First(&rt).Error
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	_ = config.DB.Delete(&rt).Error

	var user models.User
	if err := config.DB.First(&user, rt.UserID).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	access, err := utils.GenerateAccessJWT(user.ID, user.Role)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "token error")
		return
	}

	pass, hash, exp, err := utils.NewRefreshToken()
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "token error")
		return
	}

	rt2 := models.RefreshToken{
		UserID:    user.ID,
		TokenHash: hash,
		ExpiresAt: exp,
		UserAgent: c.Request.UserAgent(),
		IP:        c.ClientIP(),
	}

	if err := config.DB.Create(&rt2).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}

	utils.RespondOK(c, dto.TokenPairResponse{
		AccessToken:  access,
		RefreshToken: pass,
	})
}

func Logout(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid json")
		return
	}
	hash := utils.HashRefresh(req.RefreshToken)
	_ = config.DB.Where("token_hash = ?", hash).Delete(&models.RefreshToken{}).Error
	utils.RespondOK(c, gin.H{"message": "logged out"})
}

func GetCurrentUser(c *gin.Context) {
	uid, ok := c.Get("userID")
	if !ok {
		utils.RespondError(c, http.StatusUnauthorized, "unauthorized")
		return
	}
	var user models.User

	if err := config.DB.Select("id", "name", "email").First(&user, uid.(uint)).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	utils.RespondOK(c, dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	})
}
