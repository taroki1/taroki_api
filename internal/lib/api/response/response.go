package response

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Response - структура ответа
type Response struct {
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

// Возможные статусы ответов
const (
	StatusOK    = "OK"
	StatusError = "Error"
)

// OK - Возвращает успешный ответ
func OK() Response {
	return Response{
		Status: StatusOK,
	}
}

// Error - Возвращает статус и текст ошибки
func Error(msg string) Response {
	return Response{
		Status: StatusError,
		Error:  msg,
	}
}

// ValidationError - проверяет на ошибки
func ValidationError(errs validator.ValidationErrors) Response {
	var errMsgs []string

	for _, err := range errs {
		switch err.ActualTag() {
		case "required":
			errMsgs = append(errMsgs, fmt.Sprintf("field %s is a required field", err.Field()))
		case "url":
			errMsgs = append(errMsgs, fmt.Sprintf("field %s is not a valid URL", err.Field()))
		default:
			errMsgs = append(errMsgs, fmt.Sprintf("field %s is not valid", err.Field()))
		}
	}

	return Response{
		Status: StatusError,
		Error:  strings.Join(errMsgs, ", "),
	}
}
