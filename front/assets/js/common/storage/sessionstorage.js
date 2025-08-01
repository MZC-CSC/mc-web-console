// user token mng START
//////////////////////////////////////////////////////////

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=').map(c => c.trim());
        if (key === name) {
            return value;
        }
    }
    return null;
}

export function setSessionCurrentUserToken() {
    const accesstoken = getCookie('Authorization');
    sessionStorage.setItem('currentUserToken', accesstoken)
}

export function getSessionCurrentUserToken() {
    let currentUserToken = sessionStorage.getItem('currentUserToken')
    return currentUserToken
}

// user token mng END
//////////////////////////////////////////////////////////

// workspaceS
export function getSessionCurrentWorkspace() {
    return JSON.parse(sessionStorage.getItem("currentWorkspace"))
}

export function setSessionCurrentWorkspace(workspace) {
    sessionStorage.setItem('currentWorkspace', JSON.stringify(workspace))
}

// // project
export function getSessionCurrentProject() {
    return JSON.parse(sessionStorage.getItem("currentProject"))
}

export function setSessionCurrentProject(project) {
    sessionStorage.setItem('currentProject', JSON.stringify(project))
}

export function getSessionWorkspaceProjectList() {
    return JSON.parse(sessionStorage.getItem("currentWorkspaceProjcetList"))
}

export function setSessionWorkspaceProjectList(userWorkspaceProjectList) {
    //console.log("setSessionWorkspaceProjectList userWorkspaceProjectList", userWorkspaceProjectList)
    var workspaceProjectList = JSON.stringify(userWorkspaceProjectList)
    sessionStorage.setItem('currentWorkspaceProjcetList', workspaceProjectList)
    //var workspaceList = []
    var workspaceList = userWorkspaceProjectList;
    // const jsonData = JSON.parse(userWorkspaceProjectList);
    userWorkspaceProjectList.forEach(item => {
        console.log(item)
        // var wsItem = item.workspaceProject.workspace;
        // workspaceList.push(wsItem);
        // console.log("setSessionWorkspaceProjectList wsItem", wsItem)
        // // var proItems = item.workspaceProject.projects;
        // var proItems = wsItem.projects;
        // var projectList = []
        // proItems.forEach(subitem => {
        //     projectList.push(subitem);
        // });
        // console.log("setSessionWorkspaceProjectList projectList", projectList)
        // setSessionProjectList(wsItem.id, JSON.stringify(projectList))
        //setSessionProjectList(wsItem.name, JSON.stringify(projectList))// 공백같은 것은 없겠지?
        setSessionProjectList(item.id, JSON.stringify(item.projects))
    });
    setSessionWorkspaceList(JSON.stringify(workspaceList))
}

export function clearSessionCurrentWorkspaceProject() {
    sessionStorage.removeItem("currentWorkspaceProjcetList")
    sessionStorage.removeItem("currentProject")
    sessionStorage.removeItem("currentWorkspace")
}

////////// 선택한 workspace, project 저장
export function getSessionCurrentWorkspaceProjcet() {
    let currentWorkspacProject = JSON.parse(sessionStorage.getItem('currentWorkspacProject'))
    return currentWorkspacProject
}

export function setSessionCurrentWorkspaceProjcet(workspaceId, projectId) {
    let currentWorksppacProject = {
        "currentWorkspace": workspaceId,
        "currentProject": projectId
    }
    sessionStorage.setItem('currentWorkspacProject', JSON.stringify(currentWorksppacProject))
}

export async function getSessionWorkspaceList() {
    let workspaceList = JSON.parse(await sessionStorage.getItem('workspaceList'))
    if (workspaceList == null) {
        await webconsolejs["common/storage/sessionstorage"].updateSessionWorkspaceList()
        workspaceList = webconsolejs["common/storage/sessionstorage"].getSessionWorkspaceList()
    }
    return workspaceList.Workspaces
}

export async function setSessionWorkspaceList(v) {
    sessionStorage.setItem('workspaceList', v)
}

export async function getSessionProjectList(workspaceId) {
    console.log("getSessionProjectList ", workspaceId)
    let projectList = JSON.parse(await sessionStorage.getItem("projectList_" + workspaceId))
    console.log(projectList);
    return projectList
}

export async function setSessionProjectList(workspaceId, projectList) {

    sessionStorage.setItem("projectList_" + workspaceId, projectList)
}

// sessionStorage의 workspaceList 갱신
export async function updateSessionWorkspaceList(workspaceList) {
    // const response = await webconsolejs["common/http/api"].commonAPIPost('/api/workspacelistbyuser')
    // sessionStorage.setItem('workspaceList', JSON.stringify(response.data.responseData));
    sessionStorage.setItem('workspaceList', JSON.stringify(workspaceList));
}

// sessionStorage의 projectList 갱신 : 조회된 목록을 갱신
//export async function updateSessionProjectListByWorkspaceId(workspaceId) {
export async function updateSessionProjectList(projectList) {
    sessionStorage.setItem('projectList', JSON.stringify(projectList));
}

