package chat

import (
	"taro-api/cmd/bot"
	"taro-api/internal/utils"

	tele "gopkg.in/telebot.v3"
)

// NewCommandHandler создает новый обработчик сообщений
func NewCommandHandler(bot *bot.TaroBot) *Handler {
	return &Handler{bot: bot}
}

const welcomeMessageTemplateRu = `

Меня зовут Taroki, я твой проводник в мир таро и эзотерики 💫

Здесь ты можешь: 

– Узнать значения всех карт таро
– Получить схемы таро раскладов
– Смотреть бесплатные мастер-классы по таро, магии и другим направлениям
– Получать подсказку на день от карт таро
– Практиковаться в чтении раскладов
– Записаться на расклад к эксперту-тарологу

Чтобы начать работу – нажми на кнопку ниже 👇🏻

`

const welcomeMessageTemplateEn = `

My name is Taroki, I am your guide to the world of tarot and esotericism 💫

Here you can: 

– Find out the meanings of all tarot cards 
– Get tarot layouts 
– Watch free master classes on tarot, magic and other areas 
– Receive daily hints from tarot cards 
– Practice reading layouts 
– Sign up for a reading with an expert tarot reader 

To get started, click on the button below 👇🏻
`

// StartHandler обрабатывает команду /start
func (h *Handler) StartHandler(ctx tele.Context) error {
	menu := &tele.ReplyMarkup{}
	tmaButton := &tele.Btn{Text: "Запустить / Launch 🃏", WebApp: &tele.WebApp{URL: h.bot.TmaURL}}

	menu.Inline(
		menu.Row(*tmaButton),
	)

	return ctx.Send(utils.SumStrings(
		ctx.Sender().FirstName,
		", приветствую! ♥️",
		welcomeMessageTemplateRu,
		ctx.Sender().FirstName,
		", hello! ♥️",
		welcomeMessageTemplateEn), menu)
}
