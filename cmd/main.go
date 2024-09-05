package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"taro-api/cmd/bot"
	"taro-api/internal/config"
	"taro-api/internal/handlers/api/getuser"
	chat "taro-api/internal/handlers/bot"
	"taro-api/internal/middlewares"
	"taro-api/internal/storage/db"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

func main() {

	cfg := config.MustLoad()

	taroBot := bot.TaroBot{
		Bot:         bot.InitBot(cfg.BotToken),
		BotID:       cfg.BotID,
		ChannelID:   cfg.ChannelID,
		AdminUserID: cfg.AdminUserID,
		TmaURL:      cfg.TmaURL,
	}

	storage, err := db.New(context.TODO())
	if err != nil {
		slog.Error("failed to init storage", err.Error(), "err")
		os.Exit(1)
	}

	defer func() {
		if err := storage.CloseDatabaseConnection(); err != nil {
			slog.Error("failed to close storage", err.Error(), "err")
			return
		}
		slog.Info("storage closed")
	}()

	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	router.Use(middleware.Recoverer)
	router.Use(middleware.URLFormat)
	router.Use(httprate.LimitByIP(500, 1*time.Second))
	router.Use(middleware.ThrottleBacklog(250, 1500, time.Second*10))

	router.Use(middlewares.AuthMiddleware(cfg.BotToken))

	// прокси для получения аватара пользователя
	router.Get("/me/photo", getuser.Photo(slog.Default(), cfg.BotToken))

	router.Get("/me", getuser.New(slog.Default(), storage, cfg.BotToken))

	done := make(chan os.Signal, 1)
	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	srv := &http.Server{
		Addr:         "0.0.0.0:8088",
		Handler:      router,
		ReadTimeout:  time.Second * 6,
		WriteTimeout: time.Second * 6,
		IdleTimeout:  time.Second * 30,
	}

	go func() {
		defer close(done)

		<-sigterm
		slog.Info("stopping http-server")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			slog.Error("failed to stop http-server", slog.String("Error", err.Error()))
		}
	}()

	slog.Info("starting http-server", slog.String("address", "0.0.0.0:8088"))

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			signal.Stop(sigterm)
			slog.Error("failed to start http-server")
			return
		}
	}()

	go func() {
		taroBot.Bot.Start()
	}()

	defer taroBot.Bot.Stop()
	registerBotHandlers(taroBot)
	<-done
	slog.Info("server http-stopped")

}

func registerBotHandlers(taroBot bot.TaroBot) {
	commandHandler := chat.NewCommandHandler(&taroBot)
	taroBot.Bot.Handle("/start", commandHandler.StartHandler)
}
