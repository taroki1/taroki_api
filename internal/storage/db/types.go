package db

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User - структура сущности пользователя
type User struct {
	ID                   uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
	TelegramID           int64     `gorm:"unique_index" json:"telegram_id"`
	Balance              int64     `json:"balance"`
	Role                 string    `json:"role"`
	PhotoURL             string    `json:"photo_url"`
	ReferrerID           int64     `json:"referrer,omitempty"`
	Referrals            *[]User   `gorm:"foreignKey:ReferrerID;references:TelegramID" json:"referrals,omitempty"`
	ReferralBonusApplied bool      `json:"referral_bonus_applied"`
}


// BeforeCreate - генерируем UUIDv4 для новой записи
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	u.Role = "user"
	if !u.IsValid() {
		err = errors.New("can't save invalid data")
	}
	return
}

// IsValid - валидация данных пользователя
func (u *User) IsValid() bool {
	if u.TelegramID == 0 || u.Balance < 0 {
		return false
	}
	return true
}
