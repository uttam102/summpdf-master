package service

import (
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/ledongthuc/pdf"
)

type PDFService struct{}

func NewPDFService() *PDFService {
	return &PDFService{}
}

func (s *PDFService) ExtractTextFromURL(url string) (string, error) {
	// 1. Download the PDF
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download PDF: status %d", resp.StatusCode)
	}

	// Create a temp file
	tmpFile, err := os.CreateTemp("", "summpdf-*.pdf")
	if err != nil {
		return "", err
	}
	defer os.Remove(tmpFile.Name())
	defer tmpFile.Close()

	// Write body to temp file
	_, err = tmpFile.ReadFrom(resp.Body)
	if err != nil {
		return "", err
	}

	// 2. Extract Text
	f, r, err := pdf.Open(tmpFile.Name())
	if err != nil {
		return "", err
	}
	defer f.Close()

	var textBuilder strings.Builder
	totalPage := r.NumPage()

	for pageIndex := 1; pageIndex <= totalPage; pageIndex++ {
		p := r.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}
		rows, _ := p.GetTextByRow()
		for _, row := range rows {
			for _, word := range row.Content {
				// Restore the space, but we'll clean it later
				textBuilder.WriteString(word.S + " ")
			}
			textBuilder.WriteString("\n")
		}
	}

	return s.smartClean(textBuilder.String()), nil
}

// smartClean repairs "exploded" PDF text while preserving normal word spaces.
func (s *PDFService) smartClean(input string) string {
	// 1. Fix exploded characters (e.g., "I n d u s t r i a l" -> "Industrial")
	// We do this first globally because it might span small line breaks.
	reExploded := regexp.MustCompile(`(?i)\b[a-z](?:\s[a-z]){2,}\b`)
	input = reExploded.ReplaceAllStringFunc(input, func(m string) string {
		return strings.ReplaceAll(m, " ", "")
	})

	// 2. Process line by line to preserve structure
	lines := strings.Split(input, "\n")
	var cleanedLines []string

	reMultiSpace := regexp.MustCompile(`[^\S\r\n]{2,}`) // Matches 2+ spaces but not newlines

	for _, line := range lines {
		// Collapse multiple spaces within the line
		cleaned := reMultiSpace.ReplaceAllString(line, " ")
		cleaned = strings.TrimSpace(cleaned)

		if cleaned != "" {
			// Heuristic: If line starts with a common bullet symbol, ensure it's handled
			cleanedLines = append(cleanedLines, cleaned)
		}
	}

	return strings.Join(cleanedLines, "\n")
}
