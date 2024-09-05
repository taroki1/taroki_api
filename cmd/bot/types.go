package bot

import tele "gopkg.in/telebot.v3"

// TaroBot - объект бота
type TaroBot struct {
	Bot         *tele.Bot
	BotID       string
	ChannelID   int64
	AdminUserID int64
	TmaURL      string
}
