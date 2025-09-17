MainApplication.NavigationComponent.currentTopLevel = "";
MainApplication.NavigationComponent.currentSubLevel = "";
MainApplication.NavigationComponent.lastPageTitle = "";
MainApplication.NavigationComponent.history = [];

MainApplication.NavigationComponent.setupNavigation = function () {
    $("#modulesnav").empty();
    for (var module in MainApplication.modules) {
        var moduleNavId = $spcontext.uniqueIdGenerator();
        var apps = "";
        for (var app in MainApplication.modules[module].applications) {
            //show on navigation if app has special access permission
            if($.inArray(MainApplication.modules[module].applications[app].access, MainApplication.curentUserGroupMemberships) < 0 && MainApplication.modules[module].applications[app].access !== "All"){
                continue;
            }

            apps += `<li class="nav-item">
                        <a class="nav-link" href="${MainApplication.modules[module].applications[app].link}">
                        <i class="menu-icon">${MainApplication.modules[module].applications[app].icon}</i>
                        <span>${app}</span>
                        </a>
                    </li>`;
        }
        var str = `<li class="nav-item">
                        <a class="nav-link" data-bs-toggle="collapse" href="#${moduleNavId}" aria-expanded="false" aria-controls="${moduleNavId}">
                            <i class="menu-icon">${MainApplication.modules[module].icon}</i>
                            <span class="menu-title">${MainApplication.modules[module].title}</span>
                            <i class="fa fa-chevron-right menu-arrow" />
                        </a>
                        <div class="collapse" id="${moduleNavId}" data-bs-parent="#sidebar">
                            <ul class="nav flex-column sub-menu">
                                ${apps}
                            </ul>
                        </div>
                    </li>`;
        $("#modulesnav").append(str);
    }

    //======================GET SAVED APPS===============================================

    MainApplication.NavigationComponent.getCurrentUserSavedApps();

    //====================== Configured URLs =============================================
    $("#errorlogsnav").attr("href", configPropertiesRoot.ERRORLOGSURL.setting);
    $("#sitecontentnav").attr("href", configPropertiesRoot.SITECONTENTSURL.setting);
    $("#sitesettingnav").attr("href", configPropertiesRoot.SITESETTINGSURL.setting);
    $("#sitegroupnav").attr("href", configPropertiesRoot.GROUPSURL.setting);

    (function ($) {
        $(function () {
            $('[data-toggle="offcanvas"]').on("click", function () {
                $('.sidebar-offcanvas').toggleClass('active')
            });

            $('[data-toggle="minimize"]').on("click", function () {
                $('div.container-scroller').toggleClass('sidebar-icon-only');
                $('h4.header-title').toggleClass('d-none');
            });

            $(".signoutblock").on("click", function () {
                //put signout code here
            });

            document.querySelectorAll(".sub-menu .nav-item .nav-link").forEach((item) => {
                item.addEventListener("click", function (event) {
                    event.preventDefault(); // Prevent Bootstrap interference
                    var parentId = $(this).parent().parent().parent().attr("id");
                    let targetUrl = this.getAttribute("href"); // Get the actual link
                    let openInNewTab = this.getAttribute("target");
                    let menu = document.getElementById(parentId);

                    // Navigate first
                    if(openInNewTab === "_blank"){
                        window.open(targetUrl, "_blank");
                    }
                    else{
                        window.location.href = targetUrl;
                    }
                    
                    // Then close the menu after a short delay
                    setTimeout(() => {
                        if (menu.classList.contains("show")) {
                            $(`#${parentId}`).removeClass("show");
                        }
                    }, 100);
                });
            });

        });
    })(jQuery);
}

MainApplication.NavigationComponent.getCurrentUserSavedApps = function () {
    $("#savedapps").empty();
    var query = [
        {},
        {
            operator: 'Eq',
            field: 'Email',
            type: 'Text',
            val: CurrentUserProperties.email
        }
    ]
    var extraProperties = {
        merge: false,
        data: ["Title", "AppLink", "AppIcon"]
    };

    speedctxRoot.getListToItems(
        "BookmarkApps",
        query, extraProperties,
        true,
        null,
        function (items) {
            for (var x = 0; x < items.length; x++) {
                var apps = `<li class="nav-item">
                                <a class="nav-link" href="${items[x].AppLink}">
                                    <i class="menu-icon">${items[x].AppIcon}</i>
                                    <span>${items[x].Title}</span>
                                </a>
                            </li>`;
                $("#savedapps").append(apps);
            }
        });
}

MainApplication.NavigationComponent.breadcrumb = function (data) {
    $("#appbreadcrumb").empty();
    $("#appbreadcrumb").append(`<a href="#"><img src="${window.ERPIMAGES.home}" /></a>`);
    for (var x = 0; x < data.length; x++) {
        var active = (x == (data.length - 1)) ? "active" : "";
        $("#appbreadcrumb").append(`<span class="mdi mdi-chevron-right"></span>`);
        $("#appbreadcrumb").append(`<span><a href="${data[x].url}"> ${data[x].title}</a></span>`);
    }
}

MainApplication.NavigationComponent.checkSamePageRefresh = function () {
    if (MainApplication.NavigationComponent.history.length > 0) {
        var lastPage = MainApplication.NavigationComponent.history[(MainApplication.NavigationComponent.history.length - 1)].title;
        if (lastPage.toLowerCase() === MainApplication.NavigationComponent.lastPageTitle.toLowerCase()) {
            MainApplication.cachedState.pageStateCall();
        }
    }
}