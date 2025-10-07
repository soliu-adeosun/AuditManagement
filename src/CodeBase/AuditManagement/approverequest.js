loadApproveRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenApproveRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = loadApproveRequestComponent;
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
    this.isNonConformance = null;
}


whenApproveRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    globalDefinitions.extendStages();
    $spcontext.assignAttributes();
    
    AppRequest = new MainApplication.ApproveRequestComponent.ApplicationDetails();
    globalDefinitions.extendStages();
    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
    AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);

    $spcontext.filesDictionary = {};

    $spcontext.validationProperties.text.extend["Comments"] = function (field) {
        var passed = false;
        if ((field.trim() !== "" && (AppRequest.actionTaken === globalDefinitions.stageDefinitions.decline ||
            AppRequest.actionTaken === globalDefinitions.stageDefinitions.correction || AppRequest.actionTaken === "Revise")) ||
            AppRequest.actionTaken === globalDefinitions.stageDefinitions.approve) passed = true;
        return passed;
    }

    if (MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.ceo].belongs){
        $("#satisfactoryDiv").hide();
    }


    $("#satisfactory").on('change', function () {
        if (this.value === "Satisfactory") {
            if(AppRequest.isNonConformance === 0){
                $("#riskAssessmentContainer").hide();
                $("#managementRepContainer").show();
            }else{
                $("#riskAssessmentContainer").show();
                $("#managementRepContainer").hide();
            }
            
        } else {
            $("#riskAssessmentContainer").hide();
            $("#managementRepContainer").hide();
        }
    });
    $("#managementRepContainer").hide();
    $("#riskAssessmentContainer").hide();

    $spcontext.applyValidationEvents();
    MainApplication.ApproveRequestComponent.displayManagementDetails();
    MainApplication.ApproveRequestComponent.recoverListData();
};


MainApplication.ApproveRequestComponent.recoverListData = function() {
    
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
                MainApplication.notyf.error("You already took action on this request...");
                $spcontext.redirect("#/", false);
                globalDefinitions.closeLoader();
                
            }
            else {
                // customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
                //     customWorkflowEngine.routeEngine(customWorkflowEngine).
                //     PageSecurity(customWorkflowEngine.stages.securityModeTask, MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs, listProperties.Approval_Status, function (error) {

                        if (MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs) {
                        // if (typeof error === "undefined") {

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

                            if (MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.management].belongs){
                                MainApplication.ApproveRequestComponent.displayNCRiskAssessment(listProperties.QuestionsDetails);
                            }

                            $spcontext.htmlBind(listProperties);
                            globalDefinitions.closeLoader();
                            
                        } else {
                            globalDefinitions.HandlerError("You are not allowed to access this request");
                            globalDefinitions.AuditLogManager_SaveLog({
                                Action: `Unauthorized action on Audit Management ${listProperties.WorkflowRequestID}`,
                                Message: "You are not allowed to act on this request"
                            });
                            setTimeout(function () {
                                globalDefinitions.closeLoader();
                            }, 1000);
                            $spcontext.redirect("#/", false);
                        }
                    // }); //commented here
                    
                // }); //commented here
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
    MainApplication.confirmAction = MainApplication.ApproveRequestComponent.actionConfirmed;
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

        formData.Comment = AppRequest.comment;

        var historyProp = {
            stage: AppRequest.requestDetails.Current_Approver,
            comment: AppRequest.comment,
            action: actionTaken
        };

        if (MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.management].belongs) {
            var riskAssessment = MainApplication.ApproveRequestComponent.getNCRiskAssessmentData();
            var managementRep = MainApplication.ApproveRequestComponent.getManagementDetailsData();
        
            // if (riskAssessment && riskAssessment.length > 0) {
                formData.RiskAssessment = JSON.stringify(riskAssessment);
            // } else if (managementRep && managementRep.length > 0) {
                formData.ManagementRep = JSON.stringify(managementRep);
        //     }
        }

        formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, historyProp);
        
        if (actionTaken === "Approved" || actionTaken === "Declined") {
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.requestDetails.Current_Approver_Code, actionTaken);
        } else if (actionTaken === "Revise") {
            formData.Current_Approver = AppRequest.requestDetails.InitiatorName;
            formData.Current_Approver_Code = AppRequest.defaultStage;
            formData.PendingUserLogin = AppRequest.requestDetails.InitiatorEmailAddress;
            formData.PendingUserEmail = AppRequest.requestDetails.InitiatorEmailAddress;
            formData.Approval_Status = "Revise";
            formData.ReturnForCorrection = "Yes";
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
    // globalDefinitions.uploadAttachment(Attachments, globalDefinitions.stageDefinitions.foldername,
        // globalDefinitions.stageDefinitions.documentlib,
        // function () {
            formData.ID = AppRequest.requestDetails.ID;
            speedctxRoot.updateItems([formData], globalDefinitions.stageDefinitions.listname, function () {
                AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
                // globalDefinitions.EmailSetup(customWorkflowEngine, AppRequest, function (mailStatus) {
                    globalDefinitions.closeLoader();
                    globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);
                    globalDefinitions.AuditLogManager_SaveLog({
                        Action : `took action on audit request ${AppRequest.requestDetails.WorkflowRequestID}`
                    });
                    $spcontext.redirect("#/", false);
                // });
            });
        // })
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

MainApplication.ApproveRequestComponent.displayQuestionSets = function (questionSets) {
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

MainApplication.ApproveRequestComponent.createNCRiskAssessment = function (questionsDetails) {
    // Predefined options for select fields
    const isoClauseOptions = MainApplication.isoClause || [];
    const occurrenceOptions = MainApplication.occurrence || [];
    const ncRatingOptions = MainApplication.NCRating || [];
    const riskImpactOptions = MainApplication.riskImpact || [];

    // Filter questionsDetails for Non-Conformance entries
    const nonConformanceData = questionsDetails.filter(data => data.AuditFinding === 'Non-Conformance');

    // If no non-conformance data, trigger management details and return
    if (nonConformanceData.length === 0) {
        AppRequest.isNonConformance = 0;
        return;
    }

    // Build Non-Conformance Risk Assessment table
    let html = `
        <div>
            <h2 class="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">NONCONFORMANCE RISK ASSESSMENT SECTION</h2>
            <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC REF ID</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">ISO CLAUSE</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">OCCURRENCE</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC RATING</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC CLASSIFICATION</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">RISK IMPACT</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">OVERALL RISK EXPOSURE</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    // Add rows for each non-conformance entry
    nonConformanceData.forEach((data, index) => {
        // Sanitize data to prevent XSS
        const ncId = $('<div>').text(data.NonConformanceID || '').html();
        const ncStatement = $('<div>').text(data.NonConformanceStatement || '').html();
        const isoClause = $('<div>').text(data.ISOClause || '').html();

        html += `
            <tr class="border-b" data-nc-id="${ncId}">
                <td class="px-2 py-2">
                    <input type="text" value="${ncId}" readonly class="nc-reference-input w-full px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" />
                </td>
                <td class="px-2 py-2">
                    <select class="iso-clause-input w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 text-sm dropdown-arrow">
                        <option value="">Select</option>
                        ${isoClauseOptions.map(option => `<option value="${option}" ${option === isoClause ? 'selected' : ''}>${option}</option>`).join('')}
                    </select>
                </td>
                <td class="px-2 py-2">
                    <textarea readonly class="non-conformance-input w-full px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm">${ncStatement || ''}</textarea>
                </td>
                <td class="px-2 py-2">
                    <select class="occurrence-input w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 text-sm dropdown-arrow">
                        <option value="">Select</option>
                        ${occurrenceOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </td>
                <td class="px-2 py-2">
                    <select class="nc-rating-input w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 text-sm dropdown-arrow">
                        <option value="">Select</option>
                        ${ncRatingOptions.map(option => `<option value="${option.value}">${option.title}</option>`).join('')}
                    </select>
                </td>
                <td class="px-2 py-2">
                    <input type="text" readonly class="nc-classification-input w-full px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" />
                </td>
                <td class="px-2 py-2">
                    <select class="risk-impact-input w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 text-sm dropdown-arrow">
                        <option value="">Select</option>
                        ${riskImpactOptions.map(option => `<option value="${option.value}">${option.title}</option>`).join('')}
                    </select>
                </td>
                <td class="px-2 py-2">
                    <input type="text" readonly class="overall-risk-exposure-input w-full px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" />
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Create DOM element and attach event listeners
    const $container = $('<div>').html(html);

    // Add event listeners for NC Rating and Risk Impact selects
    $container.find('tr').each(function () {
        const $row = $(this);
        const $ncRatingSelect = $row.find('.nc-rating-input');
        const $ncClassificationInput = $row.find('.nc-classification-input');
        const $riskImpactSelect = $row.find('.risk-impact-input');
        const $overallRiskExposureInput = $row.find('.overall-risk-exposure-input');

        function updateNCClassificationAndRiskExposure() {
            const ncRatingValue = parseFloat($ncRatingSelect.val()) || 0;
            // Set NC Classification based on NC Rating
            if (ncRatingValue >= 1 && ncRatingValue <= 4) {
                $ncClassificationInput.val('Minor');
            } else if (ncRatingValue >= 5 && ncRatingValue <= 6) {
                $ncClassificationInput.val('Major');
            } else {
                $ncClassificationInput.val('');
            }

            // Update Overall Risk Exposure
            const riskImpactValue = parseFloat($riskImpactSelect.val()) || 0;
            const product = ncRatingValue * riskImpactValue;
            $overallRiskExposureInput.val(product || '');
        }

        $ncRatingSelect.on('change', updateNCClassificationAndRiskExposure);
        $riskImpactSelect.on('change', updateNCClassificationAndRiskExposure);

        // Initialize with current values
        updateNCClassificationAndRiskExposure();
    });

    return $container[0]; // Return as DOM element
};

// Function to display the NC Risk Assessment section
MainApplication.ApproveRequestComponent.displayNCRiskAssessment = function (questionsDetails) {
    const $container = $('#riskAssessmentContainer');
    $container.empty(); // Clear existing content
    const ncRiskAssessmentElement = MainApplication.ApproveRequestComponent.createNCRiskAssessment(questionsDetails);
    if (ncRiskAssessmentElement) {
        $container.append(ncRiskAssessmentElement);
    }
};

// Function to collect all data from the NC Risk Assessment table
MainApplication.ApproveRequestComponent.getNCRiskAssessmentData = function () {
    const $rows = $('#riskAssessmentContainer table tbody tr');
    const ncRiskData = [];

    $rows.each(function () {
        const $row = $(this);
        const ncData = {
            NCReferenceNo: $row.find('.nc-reference-input').val() || '',
            ISOClause: $row.find('.iso-clause-input').val() || '',
            NonConformance: $row.find('.non-conformance-input').val() || '',
            Occurrence: $row.find('.occurrence-input').val() || '',
            NCRating: $row.find('.nc-rating-input').val() || '',
            NCClassification: $row.find('.nc-classification-input').val() || '',
            RiskImpact: $row.find('.risk-impact-input').val() || '',
            OverallRiskExposure: $row.find('.overall-risk-exposure-input').val() || ''
        };

        // Only add to array if at least one field has a value
        if (Object.values(ncData).some(value => value !== '')) {
            ncRiskData.push(ncData);
        }
    });

    return ncRiskData;
};


MainApplication.ApproveRequestComponent.createManagementDetails = function () {
    // Get the array of management emails
    const managementEmails = MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.management]?.emails || [];

    // Base HTML structure
    let html = `
        <div>
            <h2 class="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">MANAGEMENT REPRESENTATIVE</h2>
    `;

    // If no emails, show a message
    if (managementEmails.length === 0) {
        html += `
            <p class="text-sm text-gray-600">No management team members found.</p>
        </div>
        `;
        return $('<div>').html(html)[0]; // Return as DOM element
    }

    // Build grid for each staff member
    managementEmails.forEach(email => {
        // Get staff details
        const staffDetails = MainApplication.staffDetails[email] || { Name: '', Email: email };
        
        // Sanitize data to prevent XSS
        const name = $('<div>').text(staffDetails.Title || '').html();
        const emailValue = $('<div>').text(staffDetails.Email || email).html();

        html += `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Name</label>
                    <input readonly type="text" value="${name}" placeholder="Enter text here..." class="management-name-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Email</label>
                    <input readonly type="text" value="${emailValue}" placeholder="Enter text here..." class="management-email-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                </div>
            </div>
        `;
    });

    html += `</div>`;

    // Return as DOM element using jQuery
    return $('<div>').html(html)[0];
};

// Function to display the Management Details section
MainApplication.ApproveRequestComponent.displayManagementDetails = function () {
    const $container = $('#managementRepContainer');
    $container.empty(); // Clear existing content
    const managementDetailsElement = MainApplication.ApproveRequestComponent.createManagementDetails();
    $container.append(managementDetailsElement);
};

// Function to collect all data from the Management Details section
MainApplication.ApproveRequestComponent.getManagementDetailsData = function () {
    const $grids = $('#managementRepContainer .grid.grid-cols-1.lg\\:grid-cols-2');
    const managementData = [];

    $grids.each(function () {
        const $grid = $(this);
        const managementEntry = {
            Name: $grid.find('.management-name-input').val() || '',
            Email: $grid.find('.management-email-input').val() || ''
        };

        // Only add to array if at least one field has a value
        if (Object.values(managementEntry).some(value => value !== '')) {
            managementData.push(managementEntry);
        }
    });

    return managementData;
};