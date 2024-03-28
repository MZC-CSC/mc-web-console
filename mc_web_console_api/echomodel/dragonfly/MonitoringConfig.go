package dragonfly

// 모니터링 정책 설정
type MonitoringConfig struct {
	//AgentInterval     int `json:"agent_interval"`     //모니터링 에이전트 수집 주기
	//CollectorInterval int `json:"collector_interval"` //모니터링 콜렉터 Aggregate 주기

	// ScheduleInterval  int `json:"schedule_interval"`
	MaxHostCount int `json:"max_host_count"` // 단일 콜렉터에서 수집하는 최대 가상머신 수
	// AgentTTL          int `json:"agent_TTL"`
	MonitoringPolicy string `json:"monitoring_policy"`

	DefaultPolicy           string `json:"default_policy"`  // push
	PullerInterval          int    `json:"puller_interval"` //
	PullerAggregateInterval int    `json:"puller_aggregate_interval"`
	AggregateType           string `json:"aggregate_type"`           // avg
	DeployType              string `json:"deploy_type"`              // compose
	McisAgentInterval       int    `json:"mcis_agent_interval"`      //모니터링 에이전트 수집 주기
	McisCollectorInterval   int    `json:"mcis_collector_interval"`  //모니터링 콜렉터 Aggregate 주기
	Mck8sAgentInterval      int    `json:"mck8s_agent_interval"`     //모니터링 에이전트 수집 주기
	Mck8sCollectorInterval  int    `json:"mck8s_collector_interval"` //모니터링 콜렉터 Aggregate 주기

}
