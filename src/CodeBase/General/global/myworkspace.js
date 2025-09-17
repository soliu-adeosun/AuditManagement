function loadWorkspaceComponent() {
    if (MainApplication.cachedState.mode) {
        MainApplication.MyWorkspaceComponent.pageLoaded = false;
        whenWorkspaceDependeciesLoaded();
    }
    else {
        MainApplication.cachedState.pageStateCall = whenWorkspaceDependeciesLoaded;
    }
}

function whenWorkspaceDependeciesLoaded() {
    MainApplication.globalSetupForPageLoaded();
    MainApplication.MyWorkspaceComponent.myitems = [];
    MainApplication.MyWorkspaceComponent.mytask = [];
    MainApplication.MyWorkspaceComponent.resolved = [];
    MainApplication.MyWorkspaceComponent.context = new Speed();
    MainApplication.MyWorkspaceComponent.context.DataForTable.tablecontentId = "speed-data-table";
    MainApplication.MyWorkspaceComponent.context.DataForTable.pagesize = 30;
    MainApplication.MyWorkspaceComponent.context.DataForTable.paginateSize = 5;
    MainApplication.MyWorkspaceComponent.context.DataForTable.modifyTR = false;
    //set context is complusory
    MainApplication.MyWorkspaceComponent.context.DataForTable.context = MainApplication.MyWorkspaceComponent.context;
    MainApplication.MyWorkspaceComponent.context.DataForTable.paginationbId = "btmpagination";
    MainApplication.MyWorkspaceComponent.context.DataForTable.paginationuId = "toppagination";
    MainApplication.MyWorkspaceComponent.context.DataForTable.propertiesHandler = {
        "Created": function (valueToEva) {
            return $spcontext.stringnifyDate({
                value: valueToEva.Created,
                includeTime: true
            });
        },
        "Approval_Status": function (valueToEva) {
            return MainApplication.requestStatusIcon(valueToEva.Approval_Status);
        },
        "Modified": function (valueToEva) {
            var icon = "";
            var str = "";
            if (MainApplication.MyWorkspaceComponent.currentTab === "Task") {
                var link = "";
                if (typeof MainApplication.WorkflowsComponent[valueToEva.Module] !== "undefined") {
                    if (typeof MainApplication.WorkflowsComponent[valueToEva.Module][valueToEva.Workflow] !== "undefined") {
                        link = MainApplication.WorkflowsComponent[valueToEva.Module][valueToEva.Workflow].link;
                    }
                }

                icon = `<i class="fa-solid fa-pen-to-square"></i>`;
                str = `<div class="pointer">
                            <a href="${link}/approverequest?itemId=${valueToEva.WorkflowRequestID}">
                                ${icon}
                            </a>
                        </div>`;
            }
            else {
                icon = `<span class="mdi mdi-eye-outline"></span>`;
                var link = "";
                if (typeof MainApplication.WorkflowsComponent[valueToEva.Module] !== "undefined") {
                    if (typeof MainApplication.WorkflowsComponent[valueToEva.Module][valueToEva.Workflow] !== "undefined") {
                        link = MainApplication.WorkflowsComponent[valueToEva.Module][valueToEva.Workflow].link;
                    }
                }
                str = `<div class="pointer">
                            <a href="${link}/viewrequest?itemId=${valueToEva.WorkflowRequestID}">
                                ${icon}
                            </a>
                        </div>`;
            }

            return str;
        }
    };


    MainApplication.MyWorkspaceComponent.action = $spcontext.getParameterByName("action", window.location.href);

    if (MainApplication.MyWorkspaceComponent.action === "myrequest") {
        MainApplication.MyWorkspaceComponent.getMyItems();
    }
    else if (MainApplication.MyWorkspaceComponent.action === "mytask") {
        MainApplication.MyWorkspaceComponent.getMyTask();
    }
    else if (MainApplication.MyWorkspaceComponent.action === "myactions") {
        MainApplication.MyWorkspaceComponent.getMyActions();
    }

    $("#mytasktab").click(() => {
        MainApplication.MyWorkspaceComponent.getMyTask()
    });

    $("#myrequesttab").click(() => {
        MainApplication.MyWorkspaceComponent.getMyItems();
    });

    $("#resolvedtab").click(() => {
        MainApplication.MyWorkspaceComponent.getMyActions();
    });
}

MainApplication.MyWorkspaceComponent.getMyItems = function () {
    MainApplication.MyWorkspaceComponent.currentTab = "MyRequest";
    $("button.nav-link").removeClass("active");
    $("#myrequesttab").addClass("active");
    $("#statusheader").text("Status");
    $("#spacedesc").text("Displays all request raised by you");
    if (MainApplication.MyWorkspaceComponent.pageLoaded && MainApplication.MyWorkspaceComponent.myitems.length !== 0) {
        MainApplication.MyWorkspaceComponent.showTableData(MainApplication.MyWorkspaceComponent.myitems);
    }
    else {
        globalDefinitions.callLoader();
        var queryCaml = [{
            ascending: "FALSE",
            orderby: "Modified",
            viewScope: "RecursiveAll"
        },
        {
            operator: 'Eq',
            field: 'Email',
            type: 'Text',
            val: CurrentUserProperties.email
        }
        ];
        var queryStr = $spcontext.camlBuilder(queryCaml);
        var extraProperties = {
            merge: false,
            data: ["ID", "Title", "WorkflowRequestID", "WorkflowName", "Approval_Status", "ResourceCreated", "Module", "Workflow"]
        };

        speedctxRoot.getListToItems(
            "ERPMyRequestHistory",
            queryStr, extraProperties,
            true,
            null,
            function (items) {
                MainApplication.MyWorkspaceComponent.pageLoaded = true;
                for (var x = 0; x < items.length; x++) {
                    items[x].Status = items[x].Approval_Status;
                    items[x].Created = items[x].ResourceCreated;
                }
                MainApplication.MyWorkspaceComponent.myitems = items;
                MainApplication.MyWorkspaceComponent.showTableData(items);
            }
        );
    }

}

MainApplication.MyWorkspaceComponent.getMyActions = function () {
    MainApplication.MyWorkspaceComponent.currentTab = "Resolved";
    $("button.nav-link").removeClass("active");
    $("#resolvedtab").addClass("active");
    $("#statusheader").text("Action");
    $("#spacedesc").text("Displays all request you have taken action on");
    if (MainApplication.MyWorkspaceComponent.pageLoaded && MainApplication.MyWorkspaceComponent.resolved.length !== 0) {
        MainApplication.MyWorkspaceComponent.showTableData(MainApplication.MyWorkspaceComponent.resolved);
    }
    else {
        globalDefinitions.callLoader();
        var queryCaml = [{
            ascending: "FALSE",
            orderby: "ID",
            viewScope: "RecursiveAll"
        },
        {
            operator: 'Eq',
            field: 'Email',
            type: 'Text',
            val: CurrentUserProperties.email
        }
        ];

        var extraProperties = {
            ignoreThreshold: false,
            merge: false,
            data: ["ID", "Title", "WorkflowRequestID", "WorkflowName", "Action", "ActionCreated", "Stage", "Module", "Workflow"]
        };

        speedctxRoot.getListToItems("ERPActionHistory", queryCaml, extraProperties, true, null,
            function (items) {
                MainApplication.MyWorkspaceComponent.pageLoaded = true;
                for (var x = 0; x < items.length; x++) {
                    items[x].Status = items[x].Action;
                    items[x].Created = items[x].ActionCreated;
                }
                MainApplication.MyWorkspaceComponent.resolved = items;
                MainApplication.MyWorkspaceComponent.showTableData(items);
            });
    }

}

MainApplication.MyWorkspaceComponent.getMyTask = function () {
    MainApplication.MyWorkspaceComponent.currentTab = "Task";
    $("button.nav-link").removeClass("active");
    $("#mytasktab").addClass("active");
    $("#statusheader").text("Request Owner");
    $("#spacedesc").text("Displays all request pending your action/approval");
    if (MainApplication.MyWorkspaceComponent.pageLoaded && MainApplication.MyWorkspaceComponent.mytask.length !== 0) {
        MainApplication.MyWorkspaceComponent.showTableData(MainApplication.MyWorkspaceComponent.mytask);
    }
    else {
        globalDefinitions.callLoader();
        var queryCaml = [{
            ascending: "FALSE",
            orderby: "ID",
            viewScope: "RecursiveAll"
        },
        {
            evaluator: "Or",
            operator: 'Eq',
            field: 'PendingUserLogin',
            type: 'Text',
            val: CurrentUserProperties.email
        }
        ];

        for (var x = 0; x < MainApplication.curentUserGroupMemberships.length; x++) {
            queryCaml.push({
                evaluator: "Or",
                operator: 'Eq',
                field: 'PendingUserLogin',
                type: 'Text',
                val: MainApplication.curentUserGroupMemberships[x]
            });
        }

        queryCaml.push({
            //evaluator: "Or",
            operator: 'Eq',
            field: 'ReturnForCorrection',
            type: 'Text',
            val: "Yes"
        });
        //return for correction is yes and then show for that department the person belongs to 
        queryCaml.push({
            operator: 'Eq',
            field: 'RequestOwner',
            type: 'Text',
            val: CurrentUserProperties.email
        });

        var extraProperties = {
            ignoreThreshold: false,
            merge: false,
            data: ["ID", "Title", "WorkflowRequestID", "WorkflowName", "RequestOwner", "ResourceCreated", "Module", "Workflow"]
        };

        speedctxRoot.getListToItems("ERPTasks", queryCaml, extraProperties, true,
            function (item) {
                MainApplication.MyWorkspaceComponent.mytask.push(item);
                return item;
            },
            function (items) {
                MainApplication.MyWorkspaceComponent.taskDependenciesLoaded();
            });

        MainApplication.MyWorkspaceComponent.mytaskTotal = 0;
        MainApplication.MyWorkspaceComponent.mytaskExpected = 1;
        if(typeof configPropertiesRoot.EXTRANETURL !== "undefined") {
            MainApplication.MyWorkspaceComponent.mytaskExpected++;
            var speedctxExtranet = new Speed(configPropertiesRoot.EXTRANETURL.setting);
            speedctxExtranet.getListToItems("ERPTasks", queryCaml, extraProperties, true,
            function (item) {
                MainApplication.MyWorkspaceComponent.mytask.push(item);
                return item;
            },
            function (items) {
                MainApplication.MyWorkspaceComponent.taskDependenciesLoaded();
            });
        }
        
    }
}

MainApplication.MyWorkspaceComponent.taskDependenciesLoaded = function () {
    MainApplication.MyWorkspaceComponent.mytaskTotal++;
    if (MainApplication.MyWorkspaceComponent.mytaskExpected === MainApplication.MyWorkspaceComponent.mytaskTotal) {
        MainApplication.MyWorkspaceComponent.pageLoaded = true;
        MainApplication.MyWorkspaceComponent.mytask.sort((a, b) => new Date(a.ResourcesCreated) - new Date(b.ResourcesCreated));
        for (var x = 0; x < MainApplication.MyWorkspaceComponent.mytask.length; x++) {
            MainApplication.MyWorkspaceComponent.mytask[x].Status = MainApplication.MyWorkspaceComponent.mytask[x].RequestOwner;
            MainApplication.MyWorkspaceComponent.mytask[x].Created = MainApplication.MyWorkspaceComponent.mytask[x].ResourceCreated;
        }
        //MainApplication.MyWorkspaceComponent.mytask = items;
        MainApplication.MyWorkspaceComponent.showTableData(MainApplication.MyWorkspaceComponent.mytask);
    }
}


MainApplication.MyWorkspaceComponent.showTableData = function (data) {
    if (data.length == 0) {
        $("#datatableview").hide();
        $('#norequest').show();
    } else {
        $("#datatableview").show();
        $('#norequest').hide();
    }
    MainApplication.MyWorkspaceComponent.context.manualTable(data);
    globalDefinitions.closeLoader();
}
