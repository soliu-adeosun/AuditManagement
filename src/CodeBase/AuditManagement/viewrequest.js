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
                            listProperties.QuestionsDetails = $spcontext.JSONToObject(listProperties.QuestionsDetails);

                            MainApplication.ViewRequestComponent.displayAuditees(listProperties.AuditeesDetails);
                            MainApplication.ViewRequestComponent.displayQuestionSets(listProperties.QuestionsDetails);


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

MainApplication.ViewRequestComponent.displayAuditees = function(auditees) {

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


MainApplication.ViewRequestComponent.displayQuestionSets = function (questionSets) {
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
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 small-gap mt-2 question-set border-2 p-2 relative" data-id="${questionSetId}">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Questions</label>
                    <textarea readonly class="question-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base">${questionSet.Questions || ''}</textarea>
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Audit Finding</label>
                    <input type="text" value="${questionSet.AuditFinding || ''}" class="audit-finding-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">ISO Clause</label>
                    <textarea readonly class="iso-clause-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base">${questionSet.ISOClause || ''}</textarea>
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Objective Evidence</label>
                    <textarea readonly class="objective-evidence-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base">${questionSet.ObjectiveEvidence || ''}</textarea>
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Non-conformance Statement</label>
                    <textarea readonly class="non-conformance-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base">${questionSet.NonConformanceStatement || ''}</textarea>
                </div>
            </div>
        `;
        $displayContainer.append(block);
    });
};