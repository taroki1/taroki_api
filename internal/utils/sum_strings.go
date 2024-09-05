package utils

// SumStrings - функция для конкатенации
func SumStrings(strs ...string) string {
	result := ""
	for _, str := range strs {
		result += str
	}
	return result
}
