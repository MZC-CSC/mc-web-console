// DISK API — lookup helpers + DataDisk CRUD

export async function getAllDataDisk(nsId) {
  const controller = '/api/mc-infra-manager/GetAllDataDisk';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId }
  });
  return response?.data?.responseData;
}

export async function getDataDisk(nsId, dataDiskId) {
  const controller = '/api/mc-infra-manager/GetDataDisk';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId, dataDiskId }
  });
  return response?.data?.responseData;
}

export async function postDataDisk(nsId, body) {
  const controller = '/api/mc-infra-manager/PostDataDisk';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId },
    request: body
  });
  return response?.data;
}

export async function delDataDisk(nsId, dataDiskId) {
  const controller = '/api/mc-infra-manager/DelDataDisk';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, {
    pathParams: { nsId, dataDiskId }
  });
  return response?.data;
}

// 해당 provider, connection 으로 사용가능한 Disk의 Type 정보(type, min, max ) 조회
// ex) AWS -> standard|1|1024, gp2|1|16384
export async function getCommonLookupDiskInfo(provider, connectionName) {
  const data = {
    queryParams: {
      provider: provider,
      connectionName: connectionName
    }
  };

  const controller = '/api/disklookup';
  const response = await webconsolejs['common/api/http'].commonAPIPost(controller, data);
  return response.data.responseData;
}
