function loadDashboardComponent (){
    if(MainApplication.cachedState.mode){
        whenDashboardDependeciesLoaded();
    }
    else{
        MainApplication.cachedState.pageStateCall = whenDashboardDependeciesLoaded;
    }
}

function whenDashboardDependeciesLoaded (){
    globalDefinitions.closeLoader();

    MainApplication.DashboardComponent.myitems
    MainApplication.DashboardComponent.mytask;
    MainApplication.DashboardComponent.resolved
    
    /*if(typeof MainApplication.staffDetails[CurrentUserProperties.email]){
        $("#scorelabel").text(MainApplication.staffDetails[CurrentUserProperties.email].Score);
        //MainApplication.DashboardComponent.getMyActions();
        //MainApplication.DashboardComponent.getMyItems();
        $("#myrequestlabel").text(MainApplication.staffDetails[CurrentUserProperties.email].MyItemsCount);
        $("#resolvedlabel").text(MainApplication.staffDetails[CurrentUserProperties.email].MyResolvedCount);
        MainApplication.DashboardComponent.getMyTask();
    }
    else{
        globalDefinitions.HandlerError("User not found in the system");
    }*/
    console.log("dahboard loaded");
}

MainApplication.DashboardComponent.getMyItems = function(){
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
        merge: true,
        data: ["Approval_Status"]
    };

    speedctxRoot.getListToItems(
        "ERPMyRequestHistory",
        queryStr,extraProperties, 
        true,
        null,
        function(items){
            MainApplication.DashboardComponent.myitems = items;
            $("#myrequestlabel").text(items.length);
        }
    );
}

MainApplication.DashboardComponent.getMyActions = function(){
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
        data: ["ID", "WorkflowRequestID"]
    };

    speedctxRoot.getListToItems("ERPActionHistory", queryCaml,extraProperties, true,null,
        function(items){
            MainApplication.DashboardComponent.resolved = items;
            $("#resolvedlabel").text(items.length);
    });

}

MainApplication.DashboardComponent.getMyTask = function(){
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

    for(var x = 0; x < MainApplication.curentUserGroupMemberships.length; x++){
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
        data: ["ID", "WorkflowRequestID"]
    };

    speedctxRoot.getListToItems("ERPTasks", queryCaml,extraProperties, true,null,
        function(items){
            MainApplication.DashboardComponent.mytask = items;
            $("#tasklabel").text(items.length);
    });
}

