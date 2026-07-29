// Cloud Resources 화면 공통 — CSP 리소스 응답에서 Provider/Region 추출.
// 리소스 타입별로 응답 형태가 다름:
//  - VPC/SecurityGroup/SSHKey/DataDisk/NLB: connectionConfig.{providerName, regionDetail.regionName}
//  - Spec/Image(system)/MyImage: 최상위 providerName + regionName(Spec) 또는 regionList(Image)
// 위 필드가 없는 예외 케이스에 대비해 connectionName("<provider>-<region>" 형식)에서 추출하는 fallback 포함.

function fromConnectionName(item) {
  const connectionName = item?.connectionName;
  if (!connectionName || typeof connectionName !== 'string') return null;
  const idx = connectionName.indexOf('-');
  if (idx < 0) return null;
  return { provider: connectionName.slice(0, idx), region: connectionName.slice(idx + 1) };
}

export function getProvider(item) {
  return item?.connectionConfig?.providerName
    || item?.providerName
    || fromConnectionName(item)?.provider
    || '-';
}

export function getRegion(item) {
  const conn = item?.connectionConfig;
  if (conn?.regionDetail) return conn.regionDetail.regionName || conn.regionDetail.regionId || '-';
  if (item?.regionName) return item.regionName;
  if (Array.isArray(item?.regionList) && item.regionList.length) return item.regionList.join(', ');
  return fromConnectionName(item)?.region || '-';
}
