package getuser

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"taro-api/internal/helpers/telegram"
	resp "taro-api/internal/lib/api/response"
	"taro-api/internal/middlewares"
	"taro-api/internal/storage"
	"taro-api/internal/storage/db"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
	initdata "github.com/telegram-mini-apps/init-data-golang"
)

// UserResponse - структура ответа
type UserResponse struct {
	*db.User
}

type photoResponse []byte

// UserGetter - интерфейс для получения пользователя
type UserGetter interface {
	GetUserByTelegramID(id, referralID int64, botToken string) (*db.User, error)
}

// New - создает новый обработчик запроса пользователя
func New(log *slog.Logger, getter UserGetter, botToken string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.user.getByTelegramID"

		log = log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		initData, ok := ctxInitData(r.Context())
		if !ok {
			http.Error(w, "Init data not found", http.StatusUnauthorized)
			return
		}

		var referralID int64 = 0

		referralIDStr := r.URL.Query().Get("referralID")

		if referralIDStr != "" {
			var err error
			referralID, err = strconv.ParseInt(referralIDStr, 10, 64)
			if err != nil {
				http.Error(w, "Invalid referralID", http.StatusBadRequest)
				return
			}
		}

		user, err := getter.GetUserByTelegramID(initData.User.ID, referralID, botToken)

		if errors.Is(err, storage.ErrUserNotFound) {
			log.Info("User not found", "slug", initData.User.ID)

			render.JSON(w, r, resp.Error("not found"))

			return
		}

		if err != nil {
			log.Error("failed to get user")

			render.JSON(w, r, resp.Error(err.Error()))

			return
		}

		responseUser(w, r, user)
	}

}

// Photo - возвращает аватар пользователя (прокси)
func Photo(log *slog.Logger, botToken string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		initData, ok := ctxInitData(r.Context())
		if !ok {
			http.Error(w, "Init data not found", http.StatusUnauthorized)
			return
		}
		originalLink, err := telegram.GetUserAvatarOriginalURL(initData.User.ID, botToken)
		if err != nil {
			slog.Error("Error getting avatar URL", "error", err)
			return
		}
		imageResp, err := http.Get(originalLink)
		if err != nil {
			slog.Error("Error fetching image", "error", err)
			return
		}
		defer imageResp.Body.Close()
		imageData, err := io.ReadAll(imageResp.Body)
		if err != nil {
			slog.Error("Error reading image data", "error", err)
			return
		}
		responsePhoto(w, imageData)
	}
}

func ctxInitData(ctx context.Context) (initdata.InitData, bool) {
	initData, ok := ctx.Value(middlewares.InitDataKey).(initdata.InitData)
	return initData, ok
}

func responseUser(w http.ResponseWriter, r *http.Request, user *db.User) {
	render.JSON(w, r, UserResponse{
		User: user,
	})
}

func responsePhoto(w http.ResponseWriter, imageData []byte) {
	w.Header().Set("Content-Type", "image/jpeg")
	w.Write(imageData)
	// render.JSON(w, r, photoResponse(imageData))
}
