// list: FilterSpecsByRange — system ns는 스펙 수천 건이므로 limit 없이는 응답이 수백 MB로 타임아웃됨
export async function list(ns, limit = 500) {
  const controller = '/api/mc-infra-manager/FilterSpecsByRange';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId: ns },
    request: { limit }
  });
  return response?.data?.responseData;
}

export async function register(ns, body) {
  const controller = '/api/mc-infra-manager/Postspec';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId: ns },
    request: body
  });
  return response?.data;
}

export async function get(ns, name) {
  const controller = '/api/mc-infra-manager/Getspec';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId: ns, specId: name }
  });
  return response?.data?.responseData;
}

export async function del(ns, name) {
  const controller = '/api/mc-infra-manager/Delspec';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId: ns, specId: name }
  });
  return response?.data;
}

// fetchSpecs: fetch specs from CSP connections into namespace
export async function fetchSpecs(ns, connectionName = '') {
  const controller = '/api/mc-infra-manager/Fetchspecs';
  const body = connectionName ? { connectionName } : {};
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId: ns },
    request: body
  });
  return response?.data?.responseData;
}

export async function lookupList(connectionName) {
  const controller = '/api/mc-infra-manager/ForwardAnyReqToAny';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { path: 'spider/vmspecs' },
    queryParams: { ConnectionName: connectionName }
  });
  return response?.data?.responseData;
}
