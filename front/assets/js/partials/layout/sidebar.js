
document.addEventListener("DOMContentLoaded", function () {
    updatemenu();
    document.querySelectorAll('div[name^="sidebar_"]').forEach(function(item) {
        item.addEventListener('click', function() {
            const hrefStr = this.getAttribute('href')
            if( "#navbar-extra" !== hrefStr) {
                window.location = hrefStr
            }
        });
    });
    setActiveMenu();
});

function updatemenu(){
    var  menuData = webconsolejs["common/storage/localstorage"].getMenuLocalStorage()
    const menuHTML = generateMenuHTML(menuData);
    document.getElementById("sidebar-menu-inner").innerHTML = menuHTML;
}

function generateMenuHTML(menus) {
    let html = '';
    let debugMenu = document.getElementById("sidebar-menu-inner").innerHTML ; // 디버그 용도
    menus.forEach(title => {
        html += ` <li class="nav-item">`
        html += ` <div class="hr-text fs-3">${title.displayName}</div>`
        html += ` </li>`
        title.menus.forEach(category => {
            html += ` <li class="nav-item">`
            html += ` <span class="nav-link">${category.displayName}</span>`
            html += ` </li>`
            if (category.menus && category.menus.length > 0) {
                category.menus.forEach(menu => {
                    html += `<li class="nav-item box-link dropdown" name="sidebar_${menu.id}">`;
                    html += `<div class="nav-link dropdown-toggle" name="sidebar_${menu.id}" href="${stringToBool(menu.isAction) ? `/webconsole/${title.id}/${category.id}/${menu.id}` : "#navbar-extra"}" data-bs-toggle="dropdown" data-bs-auto-close="false" role="button" aria-expanded="false">`;
                    html += `<span class="nav-link-icon d-md-none d-lg-inline-block">${iconsArr[menu.id] ? iconsArr[menu.id] : iconsArr["undefined"] }</span>`; // svg
                    html += `<span class="nav-link-title">${menu.displayName}</span>`;
                    html += `</div>`;
                    if (menu.menus && menu.menus.length > 0) {
                        html += `<div class="dropdown-menu" name="sidebar_${menu.id}"><div class="dropdown-menu-columns">`;
                        menu.menus.forEach(subMenu => {
                            html += `<div class="dropdown-menu-column">`;
                            html += `<a class="dropdown-item" href="/webconsole/${title.id}/${category.id}/${menu.id}/${subMenu.id}" id="sidebar_${menu.id}_${subMenu.id}">`;
                            html += `${subMenu.displayName}</a>`;
                            html += `</div>`;
                        });
                        html += `</div></div>`;
                    }
                    html += `</li>`;
                });
            }
        });
    });
    return html+debugMenu;
}

function setActiveMenu() {
    try {
        const path = window.location.pathname.split('/');
        console.log("path ", path);
        const depth4 = path[4] ? `sidebar_${path[4]}` : null;
        const depth5 = path[5] ? `sidebar_${path[4]}_${path[5]}` : null;
        if (depth4) {
            const elements = document.querySelectorAll(`[name="${depth4}"]`);
            console.log(depth4, elements)
            elements.forEach(i => {
                if (!i.classList.contains('show')) i.classList.add('show');
                if (!i.classList.contains('active')) i.classList.add('active');
            });
        }
        if (depth5) {
            const element = document.getElementById(depth5);
            if (element && !element.classList.contains('active')) {
                element.classList.add('active');
            }
        }
    } catch (error) {
        console.log('An error occurred in setActiveMenu:', error.message);
    }
}

function stringToBool(str) {
    return str.toLowerCase() === 'true';
}

const iconsArr = {

    "workloads" : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-layout-dashboard">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
        <path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" />
        <path
            d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
        <path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" />
        </svg>`,

    "undefined" : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-layout-dashboard">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
        <path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" />
        <path
            d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
        <path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" />
        </svg>`,
}
