loadApproveRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenApproveRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenApproveRequestDependeciesLoaded;
    }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.ApproveRequestComponent.ApplicationDetails = function () {
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

whenApproveRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    $spcontext.assignAttributes();
    AppRequest = new MainApplication.ApproveRequestComponent.ApplicationDetails();
    globalDefinitions.extendStages();
    globalDefinitions.callLoader();
    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    $spcontext.filesDictionary = {};

    $spcontext.validationProperties.text.extend["Comments"] = function (field) {
        var passed = false;
        if ((field.trim() !== "" && (AppRequest.actionTaken === globalDefinitions.stageDefinitions.decline ||
            AppRequest.actionTaken === globalDefinitions.stageDefinitions.correction)) ||
            AppRequest.actionTaken === globalDefinitions.stageDefinitions.approve) passed = true;
        return passed;
    }

    $spcontext.applyValidationEvents();
    MainApplication.ApproveRequestComponent.recoverListData();
};


MainApplication.ApproveRequestComponent.recoverListData = function() {
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
            },
            {
                operator: 'Eq',
                field: 'Approval_Status',
                type: 'Text',
                val: globalDefinitions.stageDefinitions.pending
            }
        ]);
        
        var extraProperties = [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL","Author",
            "AuditeesDetails", "QuestionsDetails"
        ];

        speedctxRoot.getListToControl(globalDefinitions.stageDefinitions.listname, query, extraProperties, function (listProperties) {
            if ($.isEmptyObject(listProperties)) {
                MainApplication.notyf.error("Request doesnt exist...");
                $spcontext.redirect("#/", false);
                globalDefinitions.closeLoader();
                
            }
            else {
                // globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
                // listProperties.ParallelApprovals = $spcontext.JSONToObject(listProperties.ParallelApprovals);

                // for(var x = 0; x < listProperties.ParallelApprovals.length; x++){
                //     listProperties.ParallelApprovals[x].ismember = MainApplication.configuredTaskMembers[listProperties.ParallelApprovals[x].name].belongs;
                // }

                // if (listProperties.ParallelApprovals.length > 0) {
                //     customWorkflowEngine.updateStageByName({
                //         name: globalDefinitions.stageDefinitions.stakeholder,
                //         users: listProperties.ParallelApprovals
                //     });
                // }
                
                // customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
                //     customWorkflowEngine.routeEngine(customWorkflowEngine).
                //     PageSecurity(customWorkflowEngine.stages.securityModeTask, listProperties.Current_Approver, listProperties.Approval_Status, function (error) {

                        if (typeof error === "undefined") {

                            // if(listProperties.UpdateMode !== "Yes"){
                            //     $("#processbyall").remove();
                            // }
                            
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
                            listProperties.QuestionsDetails = $spcontext.JSONToObject(listProperties.QuestionsDetails);
                            // listProperties.BankDetails = $spcontext.JSONToObject(listProperties.BankDetails);
                            // listProperties.ProductType = $spcontext.JSONToObject(listProperties.ProductType);


                            //$("#orgtype").text(str);
                            // listProperties.OrganizationType = listProperties.OrganizationType.toString();
                            // listProperties.ProductType = listProperties.ProductType.toString();

                            MainApplication.ApproveRequestComponent.displayAuditees(listProperties.AuditeesDetails);
                            MainApplication.ApproveRequestComponent.displayQuestionSets(listProperties.QuestionsDetails);


                            AppRequest.FolderUrl = listProperties.Attachment_Folder;
                            AppRequest.FileUrls = $spcontext.deferenceObject(listProperties.AttachmentURL);

                            if (listProperties.Transaction_History.length !== 0) {
                                $("#transaction-history").show();
                                globalDefinitions.displayHistory(listProperties.Transaction_History);
                            }

                            AppRequest.requestDetails = listProperties;
                            
                            const ArrayOfOtherAuditorsEmail = Array.isArray(listProperties.OtherAuditors)
                            ? [...new Set(listProperties.OtherAuditors.map(owner => owner.email))]
                            : [];

                            PeoplePicker.setDefault("OtherAuditors", ArrayOfOtherAuditorsEmail);
                            PeoplePicker.initializePeoplePickers(MainApplication.staffList);
                            PeoplePicker.disablePicker("OtherAuditors");

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

MainApplication.ApproveRequestComponent.confirmSubmit = function (actionTaken) {
    $("#confirmModal").modal("show");
    AppRequest.actionTaken = actionTaken;
}

MainApplication.ApproveRequestComponent.actionConfirmed = function () {
    $("#confirmModal").modal("hide");
    MainApplication.ApproveRequestComponent.saveDataToList(AppRequest.actionTaken);
}

MainApplication.ApproveRequestComponent.saveDataToList = function (actionTaken) {
    //
    globalDefinitions.onActionClicked();

    var tempData = $spcontext.bind({});
    if ($spcontext.checkPassedValidation()) {
        var formData = {};
        AppRequest.comment = $("#approvercomment").val();

        var returnStr = "";
        var returnStage = "";
        if(actionTaken === "DeclinedVDR"){
            returnStr = "Returned to vendor";
            returnStage = "AAA";
        }

        if(actionTaken === "ApprovedForAll"){
            returnStr = "Proceessed by all (SCM)";
            returnStage = "AA5";
        }

        var historyProp = {
            stage: AppRequest.requestDetails.Current_Approver,
            comment: AppRequest.comment,
            action: (actionTaken === globalDefinitions.stageDefinitions.approve) ? actionTaken : returnStr
        };

        if(AppRequest.requestDetails.Current_Approver === globalDefinitions.stageDefinitions.stakeholder){
            for(var x = 0; x < AppRequest.requestDetails.ParallelApprovals.length; x++){
                if(AppRequest.requestDetails.ParallelApprovals[x].ismember && 
                    (AppRequest.requestDetails.ParallelApprovals[x].status === globalDefinitions.stageDefinitions.pending.toLowerCase() || 
                        AppRequest.requestDetails.ParallelApprovals[x].status === globalDefinitions.stageDefinitions.correction)){
                    AppRequest.requestDetails.ParallelApprovals[x].status = actionTaken;
                    AppRequest.requestDetails.ParallelApprovals[x].workliststatus = AppRequest.requestDetails.ParallelApprovals[x].name + `|${actionTaken}`
                    delete AppRequest.requestDetails.ParallelApprovals[x].ismember;
                    historyProp.stage = AppRequest.requestDetails.ParallelApprovals[x].name;
                    break;
                }
            }

            formData.ParallelApprovals = JSON.stringify(AppRequest.requestDetails.ParallelApprovals);
        }

        /*if(AppRequest.requestDetails.Current_Approver === globalDefinitions.stageDefinitions.customerservice){
            formData.AccountNumber = tempData.AccountNumber;
            formData.ExpiryDate = $spcontext.stringnifyDate({ value : tempData.ExpiryDate, format: "dd/mm/yy", includeTime : false, reconstruct: "mm/dd/yy" });
        }*/

        formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, historyProp);
        
        if(actionTaken === "DeclinedVDR" && AppRequest.requestDetails.Current_Approver === globalDefinitions.stageDefinitions.scm){
            actionTaken = globalDefinitions.stageDefinitions.correction;
            AppRequest.actionTaken = actionTaken;
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.requestDetails.Current_Approver_Code, actionTaken);
        }
        else if(actionTaken === "DeclinedVDR"){
            AppRequest.actionTaken = globalDefinitions.stageDefinitions.approve;
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, returnStage, globalDefinitions.stageDefinitions.approve);
        }
        else if(actionTaken === "ApprovedForAll"){
            AppRequest.actionTaken = globalDefinitions.stageDefinitions.approve;
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, returnStage, globalDefinitions.stageDefinitions.approve);
        }
        else{
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.requestDetails.Current_Approver_Code, globalDefinitions.stageDefinitions.approve);
        }
        
        globalDefinitions.onActionCompleted();
        MainApplication.ApproveRequestComponent.proceedToList(formData);
    }
    else {
        globalDefinitions.HandlerError("", true);
        globalDefinitions.onActionFailed();
    }
}

MainApplication.ApproveRequestComponent.proceedToList = function(formData) {
    globalDefinitions.callLoader();
    var Attachments = $spcontext.grabAllAttachments();
    //used to grab all string links so that it can be updated.
    //AppRequest.FileUrls = $spcontext.grabAllAttachmentsLinks();
    globalDefinitions.uploadAttachment(Attachments, globalDefinitions.stageDefinitions.foldername,
        globalDefinitions.stageDefinitions.documentlib,
        function () {
            formData.ID = AppRequest.requestDetails.ID;
            $spcontext.updateItems([formData], globalDefinitions.stageDefinitions.listname, function () {
                AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
                globalDefinitions.EmailSetup(customWorkflowEngine, AppRequest, function (mailStatus) {
                    globalDefinitions.closeLoader();
                    globalDefinitions.showSuccessModal();
                    $spcontext.redirect("#/mytask", false);
                });
            });
        })
}

MainApplication.ApproveRequestComponent.displayAuditees = function(auditees) {

    const $displayContainer = $("#auditeesContainer");
    $displayContainer.empty();

    if (!auditees || auditees.length === 0) {
        $displayContainer.append(`
            <div class="text-center text-gray-500 mt-4">
                No auditees to display.
            </div>
        `);
        return;
    }

    auditees.forEach(person => {
        const block = `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-4 person-block" data-id="${person.Email || ''}">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Employee Name</label>
                    <input id="auditeeName_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.Title || ''}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                    <input id="auditeeId_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.EmployeeId || ''}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Email</label>
                    <input id="auditeeMail_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.Email || ''}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Department</label>
                    <input id="auditeeDepartment_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.Department || ''}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
            </div>
        `;
        $displayContainer.append(block);
    });
};


MainApplication.ApproveRequestComponent.displayQuestionSets = function(questionSets) {
    const $displayContainer = $("#questionsContainer");
    $displayContainer.empty();

    if (!questionSets || questionSets.length === 0) {
        $displayContainer.append(`
            <div class="text-center text-gray-500 mt-4">
                No question sets to display.
            </div>
        `);
        return;
    }

    questionSets.forEach((questionSet, index) => {
        const questionSetId = questionSet.id || `question-set-${index}`;
        const block = `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-2 question-set border-2 p-2 relative" data-id="${questionSetId}">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Questions</label>
                    <input type="text" value="${questionSet.Questions || ''}" class="question-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Audit Finding</label>
                    <input type="text" value="${questionSet.AuditFinding || ''}" class="audit-finding-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">ISO Clause</label>
                    <input type="text" value="${questionSet.ISOClause || ''}" class="iso-clause-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Objective Evidence</label>
                    <input type="text" value="${questionSet.ObjectiveEvidence || ''}" class="objective-evidence-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Non-conformance Statement</label>
                    <input type="text" value="${questionSet.NonConformanceStatement || ''}" class="non-conformance-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
            </div>
        `;
        $displayContainer.append(block);
    });
};