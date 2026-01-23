/**
 * 메뉴 아이템 타입
 */
export interface MenuItem {
  id: string;
  name: string;
  parentId: string;
  priority: number;
  menuNumber: number;
  isAction: boolean;
  path: string;
  icon?: string;
  menus?: MenuItem[];
}

/**
 * 백엔드 메뉴 응답 타입
 * Backend menu response type
 */
export interface BackendMenuItem {
  id: string;
  parentMenuId?: string;
  displayName: string;
  isAction: string; // "true" | "false" | string
  priority: string;
  menunumber?: string;
  menus?: BackendMenuItem[];
}

/**
 * 백엔드 메뉴를 프론트엔드 메뉴로 변환
 * Convert backend menu to frontend menu
 * 
 * @param backendMenu - 백엔드 메뉴 아이템 / Backend menu item
 * @param parentPath - 부모 경로 (재귀 호출 시 사용) / Parent path (used in recursive calls)
 * @returns 프론트엔드 메뉴 아이템 / Frontend menu item
 */
export function convertBackendMenuToMenuItem(
  backendMenu: BackendMenuItem,
  parentPath: string = ''
): MenuItem {
  // isAction 문자열을 boolean으로 변환
  // Convert isAction string to boolean
  const isAction = backendMenu.isAction === 'true' || backendMenu.isAction === true;
  
  // priority 문자열을 숫자로 변환
  // Convert priority string to number
  const priority = parseInt(backendMenu.priority, 10) || 0;
  
  // menunumber 문자열을 숫자로 변환
  // Convert menunumber string to number
  const menuNumber = backendMenu.menunumber ? parseInt(backendMenu.menunumber, 10) : 0;
  
  // path 생성: 부모 경로가 있으면 부모 경로 + id, 없으면 / + id
  // Generate path: parent path + id if parent exists, otherwise / + id
  const path = parentPath 
    ? `${parentPath}/${backendMenu.id}` 
    : `/${backendMenu.id}`;
  
  // 자식 메뉴 변환
  // Convert child menus
  const menus = backendMenu.menus?.map((child) =>
    convertBackendMenuToMenuItem(child, path)
  );
  
  return {
    id: backendMenu.id,
    name: backendMenu.displayName,
    parentId: backendMenu.parentMenuId || '',
    priority,
    menuNumber,
    isAction,
    path,
    menus,
  };
}

/**
 * 백엔드 메뉴를 평면 배열로 변환 (중첩 구조를 평면화)
 * Flatten backend menu structure to flat array
 * 
 * @param backendMenu - 백엔드 메뉴 아이템 / Backend menu item
 * @param parentPath - 부모 경로 (재귀 호출 시 사용) / Parent path (used in recursive calls)
 * @returns 평면화된 메뉴 배열 / Flattened menu array
 */
function flattenBackendMenu(
  backendMenu: BackendMenuItem,
  parentPath: string = ''
): MenuItem[] {
  const items: MenuItem[] = [];
  
  // 현재 메뉴 변환
  const isAction = backendMenu.isAction === 'true' || backendMenu.isAction === true;
  const priority = parseInt(backendMenu.priority, 10) || 0;
  const menuNumber = backendMenu.menunumber ? parseInt(backendMenu.menunumber, 10) : 0;
  const path = parentPath ? `${parentPath}/${backendMenu.id}` : `/${backendMenu.id}`;
  
  const menuItem: MenuItem = {
    id: backendMenu.id,
    name: backendMenu.displayName,
    parentId: backendMenu.parentMenuId || '',
    priority,
    menuNumber,
    isAction,
    path,
  };
  
  items.push(menuItem);
  
  // 자식 메뉴들을 재귀적으로 평면화
  if (backendMenu.menus && backendMenu.menus.length > 0) {
    backendMenu.menus.forEach((child) => {
      items.push(...flattenBackendMenu(child, path));
    });
  }
  
  return items;
}

/**
 * 백엔드 메뉴 배열을 프론트엔드 메뉴 배열로 변환 (평면 배열)
 * Convert backend menu array to frontend menu array (flat array)
 * 
 * 백엔드 응답이 중첩 구조로 오더라도, 모든 메뉴를 평면 배열로 변환합니다.
 * 이후 buildMenuTree 함수에서 parentId를 기반으로 트리 구조를 생성합니다.
 * 
 * Even if backend response has nested structure, convert all menus to flat array.
 * Then buildMenuTree function will create tree structure based on parentId.
 * 
 * @param backendMenus - 백엔드 메뉴 배열 / Backend menu array
 * @returns 프론트엔드 메뉴 배열 (평면 배열) / Frontend menu array (flat array)
 */
export function convertBackendMenusToMenuItems(
  backendMenus: BackendMenuItem[]
): MenuItem[] {
  const flatItems: MenuItem[] = [];
  
  // 모든 메뉴를 평면 배열로 변환
  backendMenus.forEach((menu) => {
    flatItems.push(...flattenBackendMenu(menu));
  });
  
  return flatItems;
}

/**
 * 메뉴 응답 타입
 */
export interface MenuResponse {
  status: number;
  data: {
    responseData: MenuItem[];
  };
}
