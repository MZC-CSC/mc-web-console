
// VM의 OS를 가져온다
// common에 있는 이미지 사용 (system-purpose-common-ns)
// TODO: custom 일 때 처리
export async function getCommonVmImageInfo(imageId) {
    // endPoint := "/ns/{nsId}/resources/image/{imageId}"
  
    // "/ns/system-purpose-common-ns/resources/image/{imageId}"
  
    const data = {
      pathParams: {
        // nsId: nsid, 
        nsId: "system", 
        imageId: imageId
      }
    }
  
    var controller = "/api/" + "mc-infra-manager/" + "GetImage";
    const response = await webconsolejs["common/api/http"].commonAPIPost(
      controller,
      data
    );
  
    var operatingSystem = response.data.responseData.guestOS
    return operatingSystem
  }