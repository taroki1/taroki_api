package middlewares

import (
	"context"
	"net/http"
	"strings"

	initdata "github.com/telegram-mini-apps/init-data-golang"
)

type contextKey string

const (
	// InitDataKey - ключ контекста
	InitDataKey = contextKey("init-data")
)

// AuthMiddleware - мидлвейр для авторизации пользователей TMA
func AuthMiddleware(token string) func(http.Handler) http.Handler {
	fn := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authParts := strings.Split(r.Header.Get("authorization"), " ")
			if len(authParts) != 2 {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			authType := authParts[0]
			authData := authParts[1]

			switch authType {
			case "tma":
				if err := initdata.Validate(authData, token, 0); err != nil {
					http.Error(w, err.Error(), http.StatusUnauthorized)
					return
				}

				initData, err := initdata.Parse(authData)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				ctx := withInitData(r.Context(), initData)
				*r = *r.WithContext(ctx)
				next.ServeHTTP(w, r)
			default:
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
			}
		})
	}
	return fn
}

func withInitData(ctx context.Context, initData initdata.InitData) context.Context {
	return context.WithValue(ctx, InitDataKey, initData)
}
