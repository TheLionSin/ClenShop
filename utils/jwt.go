package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func jwtSecret() []byte {
	sec := os.Getenv("JWT_SECRET")

	return []byte(sec)
}

func accessTTL() time.Duration {
	if s := os.Getenv("JWT_ACCESS_TTL_MIN"); s != "" {
		if d, err := time.ParseDuration(s + "m"); err == nil {
			return d
		}
	}
	return 60 * time.Minute
}

func GenerateAccessJWT(userID uint, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(accessTTL()).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func ParseAccessJWT(tokenString string) (*jwt.Token, jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret(), nil
	})

	return token, claims, err
}
