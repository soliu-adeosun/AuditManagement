loadDashboardComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenDashboardDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenDashboardDependeciesLoaded;
    }
};



whenDashboardDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! Dashboard is up and running");

    MainApplication.DashboardComponent.getMyItems();
    setTimeout(function(){
        globalDefinitions.closeLoader();
  },2000);
};


MainApplication.DashboardComponent.getMyItems = function () {
    var queryCaml = [
        {
            ascending: "FALSE",
            orderby: "Modified",
            viewScope: "RecursiveAll"
        },
        {
            operator: 'Eq',
            field: 'InitiatorLogin',
            type: 'Text',
            val: CurrentUserProperties.email
        }
    ];

    var queryStr = speedctxRoot.camlBuilder(queryCaml);
    var extraProperties = {
        merge: true,
        data: [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
            "AuditeesDetails", "QuestionsDetails"
        ]
    };

    speedctxRoot.getListToItems(
        configProperties.AUDMGTLIST.setting,
        queryStr,
        extraProperties,
        true,
        null,
        function (items) {
            MainApplication.DashboardComponent.myitems = items;

            var pendingItems = items.filter(function (item) {
                return item.Approval_Status === "Pending";
            });

            var completedItems = items.filter(function (item) {
                return item.Approval_Status === "Completed";
            });


            $("#totalAudit").text(items.length);
            $("#pendingAudit").text(pendingItems.length);
            $("#completedAudit").text(completedItems.length);
        }
    );
}