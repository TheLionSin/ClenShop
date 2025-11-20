package utils

import "strings"

func BuildOrder(sort string, allowed map[string]string) string {
	if sort == "" {
		return "created_at desc"
	}
	fields := strings.Split(sort, ",")
	out := make([]string, 0, len(fields))
	for _, f := range fields {
		f = strings.TrimSpace(f)
		if f == "" {
			continue
		}
		dir := "asc"
		name := f
		if strings.HasPrefix(f, "-") {
			dir = "desc"
			name = strings.TrimPrefix(f, "-")
		}
		if col, ok := allowed[name]; ok {
			out = append(out, col+" "+dir)
		}
	}
	if len(out) == 0 {
		return "created_at desc"
	}
	return strings.Join(out, ", ")
}
