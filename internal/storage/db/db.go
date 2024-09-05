package db

import (
	"context"
	"fmt"
	"runtime"
	"strconv"
	"sync"
	"taro-api/internal/utils"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Storage - Struct representing the database instance
type Storage struct {
	db        *gorm.DB
	ctx       context.Context
	once      sync.Once
	stickyErr error
}

// New - конструктор базы данных
func New(ctx context.Context) (*Storage, error) {
	maxConns := 10 * runtime.GOMAXPROCS(0)

	sqldb, err := gorm.Open(sqlite.Open("appdb.db"), &gorm.Config{})

	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	db, err := sqldb.DB()
	db.SetMaxOpenConns(maxConns)
	db.SetMaxIdleConns(maxConns)
	db.SetConnMaxLifetime(time.Hour)

	if migrateErr := sqldb.AutoMigrate(
		&User{}); migrateErr != nil {
		fmt.Println("Sorry couldn't migrate'...")
	}

	return &Storage{db: sqldb, ctx: ctx}, nil
}

// CloseDatabaseConnection - Closes the database connection
func (s *Storage) CloseDatabaseConnection() error {
	const op = "storage.sql.Close"

	s.once.Do(func() {
		sqlDB, err := s.db.DB()

		if err != nil {
			s.stickyErr = fmt.Errorf("%s: %w", op, err)
		}

		if err := sqlDB.Close(); err != nil {
			s.stickyErr = fmt.Errorf("%s: %w", op, err)
		}
	})

	return s.stickyErr
}

// GetUserByTelegramID - Возвращает пользователя по его Telegram ID
func (s *Storage) GetUserByTelegramID(telegramID, referralID int64, botToken string) (*User, error) {
	var refID int64

	// Размер вознаграждения для реферера
	var inviteBonusAmount int64 = 5
	// Размер вознаграждение для реферала
	var referralBonusAmount int64 = 10

	var exists bool

	s.db.Raw("SELECT EXISTS(SELECT 1 FROM users WHERE telegram_id = ?) AS found",
		telegramID).Scan(&exists)

	if referralID == telegramID {
		refID = 0
	} else {
		refID = referralID
	}

	user := User{
		TelegramID: telegramID,
		ReferrerID: refID,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("telegram_id = ?", telegramID).FirstOrCreate(&user).Error; err != nil {
			return err
		}

		if refID != 0 && !user.ReferralBonusApplied && !exists {
			user.Balance += referralBonusAmount
			if err := tx.Model(&User{}).
				Where("telegram_id = ?", refID).
				UpdateColumn("balance", gorm.Expr("balance + ?", inviteBonusAmount)).Error; err != nil {
				return err
			}
			if err := tx.Model(&user).
				Update("balance", user.Balance).
				Update("referral_bonus_applied", true).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	if err := s.db.Model(&user).Preload("Referrals").Find(&user).Error; err != nil {
		return nil, err
	}

	userPhotoLink := utils.SumStrings("/photo/", strconv.FormatInt(telegramID, 10))
	user.PhotoURL = userPhotoLink
	
	return &user, nil
}
