package service

import "strings"

// AsyncTrackOperationIDs mirrors Front ASYNC_TRACK_OPERATION_IDS (WEB-TECH-017).
var AsyncTrackOperationIDs = map[string]struct{}{
	"PostInfraDynamic":             {},
	"PostInfraDynamicFromTemplate": {},
	"PostK8sClusterDynamic":        {},
	"PostInfraNodeGroupDynamic":    {},
	"PostInfraNodeGroupScaleOut":   {},
	"PostK8sNodeGroupDynamic":      {},
	"Postk8snodegroup":             {},
	"GetControlInfra":              {},
	"GetControlInfraNode":          {},
	"DelInfra":                     {},
	"DelInfraNode":                 {},
	"Deletek8scluster":             {},
	"Deletek8snodegroup":           {},
}

// IsAsyncTrackOperation reports whether operationId should be persisted.
func IsAsyncTrackOperation(operationID string) bool {
	_, ok := AsyncTrackOperationIDs[operationID]
	if ok {
		return true
	}
	// case-insensitive fallback for yaml casing quirks
	for id := range AsyncTrackOperationIDs {
		if strings.EqualFold(id, operationID) {
			return true
		}
	}
	return false
}
