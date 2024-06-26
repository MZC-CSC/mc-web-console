package mcinframanager

var (
	// getMcisList             = "/ns/{nsId}/mcis"
	// getMcis                 = "/ns/{nsId}/mcis/{mcisId}"
	// delMcis                 = "/ns/{nsId}/mcis/{mcisId}"
	// createMcis              = "/ns/{nsId}/mcis"
	// createDynamicMcis       = "/ns/{nsId}/mcisDynamic"
	// getLoadDefaultResource  = "/ns/{nsId}/loadDefaultResource"
	// delDefaultResource      = "/ns/{nsId}/defaultResources"
	// mcisRecommendVm         = "/mcisRecommendVm"
	// mcisDynamicCheckRequest = "/mcisDynamicCheckRequest"
	// sendCommandToMcis       = "/ns/{nsId}/cmd/mcis/{mcisId}"
	// controlLifecycle        = "/ns/{nsId}/control/mcis/{mcisId}"
	// getImageId              = "/ns/system-purpose-common-ns/resources/image/{imageId}"
	// createVMDynamic 		= "/ns/{nsId}/mcis/{mcisId}/vmDynamic"

	// 퍼블릭 VM Image
	getPublicImage = "/ns/system-purpose-common-ns/resources/image/{imageId}"
	///////////////////
	GetObjects                  = "/object"
	DeleteObjects               = "/object"
	GetProviderList             = "/provider"
	GetRegion                   = "/provider/{providerName}/region/{regionName}"
	RegisterCredential          = "/credential"
	ForwardAnyReqToAny          = "/forward/{path}"
	CheckHTTPVersion            = "/httpVersion"
	GetConfig                   = "/config/{configId}"
	InitConfig                  = "/config/{configId}"
	GetConnConfigList           = "/connConfig"
	PostMcisVmDynamic           = "/ns/{nsId}/mcis/{mcisId}/vmDynamic"
	PostImage                   = "/ns/{nsId}/resources/image"
	DelAllImage                 = "/ns/{nsId}/resources/image"
	GetImage                    = "/ns/{nsId}/resources/image/{imageId}"
	GetMcisPolicy               = "/ns/{nsId}/policies/mcis/{mcisId}"
	PostMcisPolicy              = "/ns/{nsId}/policies/mcis/{mcisId}"
	DelMcisPolicy               = "/ns/{nsId}/policies/mcis/{mcisId}"
	GetLoadDefaultResource      = "/ns/{nsId}/loadDefaultResource"
	DelDefaultResource          = "/ns/{nsId}/defaultResources"
	McisRecommendVm             = "/mcisRecommendVm"
	PostCmdMcis                 = "/ns/{nsId}/cmd/mcis/{mcisId}"
	GetControlMcis              = "/ns/{nsId}/control/mcis/{mcisId}"
	GetControlVm              	= "/ns/{nsId}/control/mcis/{mcisId}/vm/{vmId}"
	PostMcisDynamicCheckRequest = "/mcisDynamicCheckRequest"
	InspectResourcesOverview    = "/inspectResourcesOverview"
	GetCloudOSList              = "/cloudOS"
	GetConnConfig               = "/connConfig/{connConfigName}"
	PostConnConfig              = "/connConfig"
	DeleteConnConfig            = "/connConfig/{connConfigName}"
	GetSshKeyList               = "/ns/{nsId}/resources/sshKey"
	GetSshKey                   = "/ns/{nsId}/resources/sshKey/{sshKeyId}"
	CreateSshKey                = "/ns/{nsId}/resources/sshKey"
	DeleteSshKey                = "/ns/{nsId}/resources/sshKey/{sshKeyId}"
	DeleteAllSshKey             = "/ns/{nsId}/resources/sshKey"
	RegisterImageWithId         = "/ns/{nsId}/resources/image/registerWithId"
	RegisterImageWithInfo       = "/ns/{nsId}/resources/image/registerWithInfo"
	GetAllResources             = "/inspectAllResources"
	CheckResource               = "/checkResource/{resourceType}"
	RegisterNS                  = "/ns"
	GetNSList                   = "/ns"
	GetNS                       = "/ns/{nsId}"
	DeleteNS                    = "/ns/{nsId}"
	DeleteAllNS                 = "/ns"
	RegisterMCISPolicy          = "/ns/{nsId}/policies/mcis"
	GetAllMcisPolicy            = "/ns/{nsId}/policies/mcis"
	GetVPCList                  = "/ns/{nsId}/resources/vpc"
	GetVPC                      = "/ns/{nsId}/resources/vpc/{vpcId}"
	CreateVPC                   = "/ns/{nsId}/resources/vpc"
	DeleteVPC                   = "/ns/{nsId}/resources/vpc/{vpcId}"
	DeleteAllVPC                = "/ns/{nsId}/resources/vpc"
	GetSGList                   = "/ns/{nsId}/resources/securityGroup"
	GetSG                       = "/ns/{nsId}/resources/securityGroup/{securityGroupId}"
	CreateSG                    = "/ns/{nsId}/resources/securityGroup"
	DeleteSG                    = "/ns/{nsId}/resources/securityGroup/{securityGroupId}"
	DeleteAllSG                 = "/ns/{nsId}/resources/securityGroup"
	GetSpecList                 = "/ns/{nsId}/resources/spec"
	GetSpec                     = "/ns/{nsId}/resources/spec/{specId}"
	CreateSpec                  = "/ns/{nsId}/resources/spec"
	DeleteSpec                  = "/ns/{nsId}/resources/spec/{specId}"
	DeleteAllSpec               = "/ns/{nsId}/resources/spec"
	GetCommonSpecList           = "/spec"
	GetCommonSpec               = "/spec/{specId}"
	GetResourceCommonSpec       = "/spec/{resourceType}/{specId}"
	GetConnConfigListByType     = "/connConfig/type/{connType}"
	GetResourceList             = "/resource"
	GetResource                 = "/resource/{resourceId}"
	GetMcisList                 = "/ns/{nsId}/mcis"
	GetMcis                     = "/ns/{nsId}/mcis/{mcisId}"
	CreateMcis                  = "/ns/{nsId}/mcis"
	DeleteMcis                  = "/ns/{nsId}/mcis/{mcisId}"
	DeleteAllMcis               = "/ns/{nsId}/mcis"
	CreateDynamicMcis           = "/ns/{nsId}/mcisDynamic"
	GetVm                       = "/ns/{nsId}/mcis/{mcisId}/vm/{vmId}"
	GetVmList                   = "/ns/{nsId}/mcis/{mcisId}/vm"
	CreateVm                    = "/ns/{nsId}/mcis/{mcisId}/vm"
	DeleteVm                    = "/ns/{nsId}/mcis/{mcisId}/vm/{vmId}"
	DeleteAllVm                 = "/ns/{nsId}/mcis/{mcisId}/vm"
	GetResourceByConn           = "/conn/{connConfigName}/resource/{resourceType}"
	GetAllResourcesByType       = "/resources/{resourceType}"
	GetAllResourcesByConn       = "/conn/{connConfigName}/resources"
)
