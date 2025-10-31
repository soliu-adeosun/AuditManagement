loadViewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenViewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = loadViewRequestComponent;
    }
};



var AppRequest;
var customWorkflowEngine;

MainApplication.ViewRequestComponent.ApplicationDetails = function () {
    this.url = window.location.href;
    this.itemId = null;
    this.requestDetails = {};
    this.Attachments = [];
    this.FileUrls = {};
    this.FolderUrl = "";
    this.AttachmentLoader = {};
    this.messageTemplate = {};
    this.feedback = false;
    this.approverComments = "";
    this.transactionHistory = [];
    this.defaultStage = "AA0";
    this.returned = false;
    this.messageType = "standard";
    this.documentsToUpdate = {};
}

whenViewRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    $spcontext.assignAttributes();
    AppRequest = new MainApplication.ViewRequestComponent.ApplicationDetails();
    globalDefinitions.extendStages();
    globalDefinitions.callLoader();
    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    $spcontext.filesDictionary = {};


    $spcontext.applyValidationEvents();
    MainApplication.ViewRequestComponent.recoverListData();
};


MainApplication.ViewRequestComponent.recoverListData = function() {
    AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);
    if (AppRequest.itemId !== null && AppRequest.itemId !== "") {

        var query = speedctxRoot.camlBuilder([{
            rowlimit: 1
        },

            {
                operator: 'Eq',
                field: 'WorkflowRequestID',
                type: 'Text',
                val: AppRequest.itemId
            }
        ]);
        
        var extraProperties = [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL","Author",
            "AuditeesDetails", "AuditorsDetails", "QuestionsDetails", "RiskAssessment", "Satisfactory"
        ];

        speedctxRoot.getListToControl(globalDefinitions.stageDefinitions.listname, query, extraProperties, function (listProperties) {
            if ($.isEmptyObject(listProperties)) {
                MainApplication.notyf.error("Request does not exist...");
                $spcontext.redirect("#/", false);
                globalDefinitions.closeLoader();
                
            }
            else {
                // globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
                
                // customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
                //     customWorkflowEngine.routeEngine(customWorkflowEngine).
                //     PageSecurity(customWorkflowEngine.stages.securityModeTask, listProperties.Current_Approver, listProperties.Approval_Status, function (error) {

                        if (typeof error === "undefined") {
                            
                            listProperties.Created = $spcontext.stringnifyDate({
                                value: listProperties.Created
                            });

                            listProperties.DateIncorporated = $spcontext.stringnifyDate({
                                value: listProperties.DateIncorporated,
                                format : "dd/mm/yy"
                            });

                            listProperties.Transaction_History = $spcontext.JSONToObject(listProperties.Transaction_History);
                            listProperties.AttachmentURL = $spcontext.JSONToObject(listProperties.AttachmentURL, 'object');
                            listProperties.AuditeesDetails = $spcontext.JSONToObject(listProperties.AuditeesDetails);
                            listProperties.AuditorsDetails = $spcontext.JSONToObject(listProperties.AuditorsDetails);
                            listProperties.QuestionsDetails = $spcontext.JSONToObject(listProperties.QuestionsDetails);
                            listProperties.RiskAssessment = $spcontext.JSONToObject(listProperties.RiskAssessment);

                            MainApplication.displayPeople(listProperties.AuditeesDetails, "auditeesContainer", "auditees", "No Auditees found");
                            MainApplication.displayPeople(listProperties.AuditorsDetails, "auditorsContainer", "auditors", "No Auditors found");

                            MainApplication.displayQuestionSets(listProperties.QuestionsDetails);


                            AppRequest.FolderUrl = listProperties.Attachment_Folder;
                            AppRequest.FileUrls = $spcontext.deferenceObject(listProperties.AttachmentURL);

                            if (listProperties.Transaction_History.length !== 0) {
                                $("#transaction-history").show();
                                globalDefinitions.displayHistory(listProperties.Transaction_History);
                            }

                            AppRequest.requestDetails = listProperties;
                            
                            const ArrayOfOtherAuditorsEmail = Array.isArray(listProperties.OtherAuditors)
                            ? [...new Set(listProperties.OtherAuditors.map(auditors => auditors.email))]
                            : [];

                            const ArrayOfAuditeesEmail = Array.isArray(listProperties.Auditees)
                            ? [...new Set(listProperties.Auditees.map(auditees => auditees.email))]
                            : [];

                            PeoplePicker.setDefault("OtherAuditors", ArrayOfOtherAuditorsEmail);
                            PeoplePicker.setDefault("Auditees", ArrayOfAuditeesEmail);
                            PeoplePicker.initializePeoplePickers(MainApplication.staffList);
                            PeoplePicker.disablePicker("OtherAuditors");
                            PeoplePicker.disablePicker("Auditees");

                            if (MainApplication.isUserAnActor){
                                MainApplication.displayNCRiskAssessmentReadOnly(listProperties.RiskAssessment);
                            }

                            $spcontext.htmlBind(listProperties);
                            

                            globalDefinitions.closeLoader();
                            
                        } else {
                            globalDefinitions.HandlerError(error);
                            globalDefinitions.AuditLogManager_SaveLog({
                                Action: `Unauthorized action to view Audit Management ${listProperties.WorkflowRequestID}`,
                                Message: error
                            });
                            setTimeout(function () {
                                globalDefinitions.closeLoader();
                            }, 1000);
                            $spcontext.redirect("#/", false);
                        }
                    // });
                    
                // });
            }
        });
    } else {
        globalDefinitions.closeLoader();
        MainApplication.notyf.error("Invalid Request...");
        $spcontext.redirect("#/", false);
    }
}

