loadDashboardComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenDashboardDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = loadDashboardComponent;
    }
};



whenDashboardDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    globalDefinitions.extendStages();
    globalDefinitions.sortResponse();

    speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
    speedctxRoot.DataForTable.pagesize = 30;
    speedctxRoot.DataForTable.paginateSize = 5;
    speedctxRoot.DataForTable.modifyTR = false;
    
    //set context is complusory
    speedctxRoot.DataForTable.context = speedctxRoot;
    speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
    speedctxRoot.DataForTable.propertiesHandler = {
        "Created": function (valueToEva) {
            return $spcontext.stringnifyDate({
                value: valueToEva.Created,
                includeTime: true
            });
        },
        "Approval_Status": function (valueToEva) {
            if (valueToEva.Approval_Status === "Pending" && valueToEva.Current_Approver === "Saved For Later") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Not Submitted</span>`;
            } else if (valueToEva.Approval_Status === "Completed") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Completed</span>`;
            } else if (valueToEva.Approval_Status === "Declined") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800">Rejected</span>`;
            } else if (valueToEva.Approval_Status === "Pending") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>`;
            }
        },
        "Modified": function (valueToEva) {
            var approvalStr = `
                <div class="flex space-x-1 sm:space-x-2">
                    <a href="#/approverequest?itemId=${valueToEva.WorkflowRequestID}" class="p-1 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                            <path fill-rule="evenodd" d="M11.986 3H12a2 2 0 0 1 2 2v6a2 2 0 0 1-1.5 1.937V7A2.5 2.5 0 0 0 10 4.5H4.063A2 2 0 0 1 6 3h.014A2.25 2.25 0 0 1 8.25 1h1.5a2.25 2.25 0 0 1 2.236 2ZM10.5 4v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4h3Z" clip-rule="evenodd" />
                            <path fill-rule="evenodd" d="M3 6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3Zm1.75 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5ZM4 11.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                        </svg>
                    </a>
                    <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                            <path fill-rule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd" />
                        </svg>
                    </a>
                </div>`;

            var editStr = `
                <div class="flex space-x-1 sm:space-x-2">
                    <a href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}" class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </a>
                </div>`;

            var viewStr = `
                <div class="flex space-x-1 sm:space-x-2">
                    <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                            <path fill-rule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd" />
                        </svg>
                    </a>
                </div>`;

            if (valueToEva.Approval_Status === "Pending" && valueToEva.Current_Approver === "Save For Later"){
                return editStr;
            } else if (valueToEva.Approval_Status === "Completed"){
                return viewStr;
            } else {
                return approvalStr;
            }
        }
    };

    MainApplication.DashboardComponent.retrieveRequest();
};

MainApplication.DashboardComponent.retrieveRequest = function(){
    var queryToUse = [{
            ascending: "FALSE",
            orderby: "Modified"
        },
        {
            operator: 'Eq',
            field: 'InitiatorLogin',
            type: 'Text',
            val: CurrentUserProperties.email
        }
    ];


    var query = speedctxRoot.camlBuilder(queryToUse);
    var extraProperties = {
        merge: true,
        data: [
        "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
        "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
        "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL","Author",
        "AuditeesDetails", "QuestionsDetails"
        ]
    };
    
    speedctxRoot.getListToTable(configProperties.AUDMGTLIST.setting, query, extraProperties, null, function (tableData) {
        var pendingItems = tableData.filter(function (item) {
            return item.Approval_Status === "Pending";
        });

        var completedItems = tableData.filter(function (item) {
            return item.Approval_Status === "Completed";
        });


        $("#totalAudit").text(tableData.length);
        $("#pendingAudit").text(pendingItems.length);
        $("#completedAudit").text(completedItems.length);

        if (tableData.length == 0) {
            $("#tasktable").hide();
            $('#speed-data-table').empty();
            $('.threport').hide();
            $('.norequest').show();
        } else {
            $("#tasktable").show();
            $('.threport').show();
            $('.norequest').hide();
        }
        globalDefinitions.closeLoader();
    });
}