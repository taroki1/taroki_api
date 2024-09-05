package telegram

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"taro-api/internal/utils"
)

// UserProfileResponse - структура ответа API telegram о текущем пользователе
type UserProfileResponse struct {
	Ok     bool `json:"ok"`
	Result struct {
		ID                                 int      `json:"id"`
		FirstName                          string   `json:"first_name"`
		LastName                           string   `json:"last_name"`
		Username                           string   `json:"username"`
		Type                               string   `json:"type"`
		ActiveUsernames                    []string `json:"active_usernames"`
		Bio                                string   `json:"bio"`
		HasPrivateForwards                 bool     `json:"has_private_forwards"`
		HasRestrictedVoiceAndVideoMessages bool     `json:"has_restricted_voice_and_video_messages"`
		BusinessIntro                      struct {
			Sticker struct {
				Width      int    `json:"width"`
				Height     int    `json:"height"`
				Emoji      string `json:"emoji"`
				SetName    string `json:"set_name"`
				IsAnimated bool   `json:"is_animated"`
				IsVideo    bool   `json:"is_video"`
				Type       string `json:"type"`
				Thumbnail  struct {
					FileID       string `json:"file_id"`
					FileUniqueID string `json:"file_unique_id"`
					FileSize     int    `json:"file_size"`
					Width        int    `json:"width"`
					Height       int    `json:"height"`
				} `json:"thumbnail"`
				Thumb struct {
					FileID       string `json:"file_id"`
					FileUniqueID string `json:"file_unique_id"`
					FileSize     int    `json:"file_size"`
					Width        int    `json:"width"`
					Height       int    `json:"height"`
				} `json:"thumb"`
				FileID       string `json:"file_id"`
				FileUniqueID string `json:"file_unique_id"`
				FileSize     int    `json:"file_size"`
			} `json:"sticker"`
		} `json:"business_intro"`
		PersonalChat struct {
			ID       int    `json:"id"`
			Title    string `json:"title"`
			Username string `json:"username"`
			Type     string `json:"type"`
		} `json:"personal_chat"`
		Photo struct {
			SmallFileID       string `json:"small_file_id"`
			SmallFileUniqueID string `json:"small_file_unique_id"`
			BigFileID         string `json:"big_file_id"`
			BigFileUniqueID   string `json:"big_file_unique_id"`
		} `json:"photo"`
		EmojiStatusCustomEmojiID string `json:"emoji_status_custom_emoji_id"`
		MaxReactionCount         int    `json:"max_reaction_count"`
		AccentColorID            int    `json:"accent_color_id"`
		BackgroundCustomEmojiID  string `json:"background_custom_emoji_id"`
		ProfileAccentColorID     int    `json:"profile_accent_color_id"`
	} `json:"result"`
}

const (
	apiURL = "https://api.telegram.org"
)

// GetUserAvatarOriginalURL возвращает приватную ссылку на аватар пользователя Telegram
func GetUserAvatarOriginalURL(telegramID int64, token string) (string, error) {
	telegramIDStr := strconv.FormatInt(telegramID, 10)
	url := utils.SumStrings(apiURL, "/bot", token, "/getChat?chat_id=", telegramIDStr)
	response, err := http.Get(url)

	if err != nil {
		slog.Error("Error getting avatar URL", "error", err)
		return "", err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		slog.Error("Error reading response body", "error", err)
		return "", err
	}

	fileID, err := getAvatarURLFromResponse(body)

	if err != nil {
		slog.Error("Error getting avatar 160x160 fileID from response", "error", err)
		return "", err
	}

	photoURL, err := getTelegramAvatarURLByFileID(fileID, token)

	if err != nil {
		slog.Error("Error getting avatar file URL", "error", err)
		return "", err
	}

	resp, err := http.Get(photoURL)
	if err != nil {
		slog.Error("Error getting avatar image", "error", err)
		return "", err
	}
	defer resp.Body.Close()

	return photoURL, nil

}

func getAvatarURLFromResponse(body []byte) (string, error) {
	var response UserProfileResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return "", err
	}

	return response.Result.Photo.SmallFileID, nil
}

func getTelegramAvatarURLByFileID(fileID string, token string) (string, error) {

	url := utils.SumStrings(apiURL, "/bot", token, "/getFile?file_id=", fileID)

	response, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	var responseData struct {
		Ok     bool `json:"ok"`
		Result struct {
			FilePath string `json:"file_path"`
		} `json:"result"`
	}

	err = json.NewDecoder(response.Body).Decode(&responseData)
	if err != nil {
		return "", err
	}

	filePath := responseData.Result.FilePath

	avatarURL := utils.SumStrings(apiURL, "/file/bot", token, "/", filePath)

	return avatarURL, nil
}
