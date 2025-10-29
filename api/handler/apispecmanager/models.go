package apispecmanager

// FrameworkVersion represents a specific version configuration of a framework
type FrameworkVersion struct {
	Version    string `mapstructure:"version" yaml:"version" json:"version"`
	SwaggerUrl string `mapstructure:"swaggerUrl" yaml:"swaggerUrl" json:"swaggerUrl"`
	BaseUrl    string `mapstructure:"baseUrl" yaml:"baseUrl" json:"baseUrl"`
	AuthType   string `mapstructure:"authType" yaml:"authType" json:"authType"`
	Username   string `mapstructure:"username" yaml:"username" json:"username"`
	Password   string `mapstructure:"password" yaml:"password" json:"password"`
	Enabled    bool   `mapstructure:"enabled" yaml:"enabled" json:"enabled"`
}

// Framework represents a framework with multiple versions
type Framework struct {
	Name          string             `mapstructure:"name" yaml:"name" json:"name"`
	DisplayName   string             `mapstructure:"displayName" yaml:"displayName" json:"displayName"`
	ActiveVersion string             `mapstructure:"activeVersion" yaml:"activeVersion" json:"activeVersion"`
	Versions      []FrameworkVersion `mapstructure:"versions" yaml:"versions" json:"versions"`
}

// FrameworksConfig represents the root configuration for all frameworks
type FrameworksConfig struct {
	Frameworks []Framework `mapstructure:"frameworks" yaml:"frameworks" json:"frameworks"`
}

// SwaggerSpec represents the parsed swagger specification
type SwaggerSpec struct {
	OpenAPI string                                 `yaml:"openapi"`
	Info    SwaggerInfo                            `yaml:"info"`
	Paths   map[string]map[string]SwaggerOperation `yaml:"paths"`
	Servers []SwaggerServer                        `yaml:"servers"`
}

// SwaggerInfo contains metadata about the API
type SwaggerInfo struct {
	Title       string `yaml:"title"`
	Description string `yaml:"description"`
	Version     string `yaml:"version"`
}

// SwaggerServer contains server information
type SwaggerServer struct {
	Url         string `yaml:"url"`
	Description string `yaml:"description"`
}

// SwaggerOperation represents an API operation in swagger
type SwaggerOperation struct {
	OperationId string                 `yaml:"operationId"`
	Summary     string                 `yaml:"summary"`
	Description string                 `yaml:"description"`
	Tags        []string               `yaml:"tags"`
	Parameters  []SwaggerParameter     `yaml:"parameters"`
	RequestBody *SwaggerRequestBody    `yaml:"requestBody"`
	Responses   map[string]interface{} `yaml:"responses"`
}

// SwaggerParameter represents operation parameters
type SwaggerParameter struct {
	Name        string                 `yaml:"name"`
	In          string                 `yaml:"in"`
	Description string                 `yaml:"description"`
	Required    bool                   `yaml:"required"`
	Schema      map[string]interface{} `yaml:"schema"`
}

// SwaggerRequestBody represents request body specification
type SwaggerRequestBody struct {
	Description string                 `yaml:"description"`
	Required    bool                   `yaml:"required"`
	Content     map[string]interface{} `yaml:"content"`
}

// ApiOperation represents an API operation for response
type ApiOperation struct {
	Framework   string `json:"framework"`
	Version     string `json:"version"`
	OperationId string `json:"operationId"`
	Method      string `json:"method"`
	Path        string `json:"path"`
	Description string `json:"description"`
	Summary     string `json:"summary"`
}

// ApiServerInfo represents server configuration in the format compatible with api.yaml
type ApiServerInfo struct {
	Version string      `yaml:"version"`
	BaseUrl string      `yaml:"baseurl"`
	Auth    ApiAuthInfo `yaml:"auth,omitempty"`
}

// ApiAuthInfo represents authentication information
type ApiAuthInfo struct {
	Type     string `yaml:"type,omitempty"`
	Username string `yaml:"username,omitempty"`
	Password string `yaml:"password,omitempty"`
}

// ApiOperationSpec represents an operation spec in the format compatible with api.yaml
type ApiOperationSpec struct {
	Method       string `yaml:"method"`
	ResourcePath string `yaml:"resourcePath"`
	Description  string `yaml:"description"`
}
