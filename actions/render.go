package actions

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
	v "github.com/m-cmp/mc-web-console/variables"
)

var (
	t        *Template
	partials []string
	manifest map[string]string
)

type Template struct {
	templates *template.Template
}

func init() {
	partialsPath := "templates/partials"
	entries, err := os.ReadDir(partialsPath)
	if err != nil {
		log.Fatal(err)
	}

	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".html" {
			partials = append(partials, filepath.Join(partialsPath, entry.Name()))
		}
	}

	t = &Template{
		templates: template.Must(template.ParseFiles(append(partials, []string{"templates/layouts/default.html", "templates/layouts/blank.html"}...)...)),
	}

	manifestFile, err := os.Open("public/manifest.json")
	if err != nil {
		log.Fatalf("Failed to open manifest file: %v", err)
	}
	defer manifestFile.Close()

	decoder := json.NewDecoder(manifestFile)
	err = decoder.Decode(&manifest)
	if err != nil {
		log.Fatalf("Failed to decode manifest file: %v", err)
	}
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	parts := strings.Split(name, ".")
	layout := "templates/layouts/" + parts[0] + ".html"
	content := "templates/pages/" + parts[1] + ".html"

	tmpl, err := t.templates.Clone()
	if err != nil {
		log.Printf("Template clone error: %v\n", err)
		return err
	}

	tmpl, err = tmpl.ParseFiles(content)
	if err != nil {
		log.Printf("Template parsing error: %v\n", err)
		return err
	}

	if v.MODE == v.MODE_DEVELOPMENT {
		manifestFile, err := os.Open("public/manifest.json")
		if err != nil {
			log.Fatalf("Failed to open manifest file: %v", err)
		}
		defer manifestFile.Close()

		decoder := json.NewDecoder(manifestFile)
		err = decoder.Decode(&manifest)
		if err != nil {
			log.Fatalf("Failed to decode manifest file: %v", err)
		}
	}

	dataMap, ok := data.(map[string]interface{})
	if !ok {
		dataMap = make(map[string]interface{})
	}
	dataMap["Manifest"] = manifest

	return tmpl.ExecuteTemplate(w, filepath.Base(layout), dataMap)
}

func PageController(c echo.Context) error {

	path := strings.TrimPrefix(c.Request().URL.Path, "/webconsole/")

	common.SetRenderData(c, common.SetDatas{{
		Key: "PageTitle",
		Data: map[string]string{
			"page-pretitle": "page-pretitle",
			"page-title":    "page-title",
		},
	}})
	c.Logger().Infof("test PageController %v", c.Request().URL.Path)
	c.Logger().Infof("test PageController %v", path)

	return c.Render(http.StatusOK, "default."+path, c.Get("Render"))
}
