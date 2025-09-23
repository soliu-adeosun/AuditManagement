loadNewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenNewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenNewRequestDependeciesLoaded;
    }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.NewRequestComponent.ApplicationDetails = function () {
    this.url = window.location.href;
    this.itemId = null;
    this.mode = null;
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
    this.sectionArr = [];
    this.sections = {};
    this.finalrating = [];
    this.questionSetCounter = 0;
}


function whenNewRequestDependeciesLoaded() {
    globalDefinitions.callLoader();
    $spcontext.assignAttributes();
    MainApplication.confirmAction = MainApplication.NewRequestComponent.actionConfirmed;
    AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
    globalDefinitions.extendStages();
    AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);

    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
    customWorkflowEngine.routeEngine(customWorkflowEngine).setCurrentUserAsInitiator();

    $("#employeeName").val(MainApplication.staffDetails[CurrentUserProperties.email].Title);
    $("#employeeId").val(MainApplication.staffDetails[CurrentUserProperties.email].EmployeeId);
    $("#department").val(MainApplication.staffDetails[CurrentUserProperties.email].Department);
    $("#employeeMail").val(MainApplication.staffDetails[CurrentUserProperties.email].Email);

    PeoplePicker.defaultValues = {};
    PeoplePicker.initializePeoplePickers(MainApplication.staffList);

    MainApplication.NewRequestComponent.updatePlaceholder();
    MainApplication.NewRequestComponent.addQuestionSet();

    for (var i = 0; i < MainApplication.auditType.length; i++) {
		$("#typeOfAudit").append(`<option>${MainApplication.auditType[i]}</option>`);
	}
    for (var i = 0; i < MainApplication.process.length; i++) {
		$("#process").append(`<option>${MainApplication.process[i]}</option>`);
	}
    for (var i = 0; i < MainApplication.procedure.length; i++) {
		$("#procedure").append(`<option>${MainApplication.procedure[i]}</option>`);
	}

    MainApplication.NewRequestComponent.updateQuestionsPlaceholder();

    $('#addQuestionButton').on('click', function() {
        MainApplication.NewRequestComponent.addQuestionSet();
    });

    $('#questionsContainer').on('click', '.remove-question-set', function() {
        const questionSetId = $(this).data('id');
        MainApplication.NewRequestComponent.removeQuestionSet(questionSetId);
    });

   

    // Helper function to find person data in MainApplication.staffList
    MainApplication.NewRequestComponent.findPersonData = function (email) {
        const person = MainApplication.staffList.find(p => p.Email === email) || {};
        return {
            Email: email,
            Title: person.Title || '',
            ID: person.ID || '',
            EmployeeId: person.EmployeeId || '',
            Department: person.Department || '',
            Designation: person.Designation || '',
            Supervisor: person.Supervisor || '',
            PersonalNumber: person.PersonalNumber || '',
            DateOfEmployment: person.DateOfEmployment || '',
            JobRole: person.JobRole || ''
        };
    }

    const initialSelections = $("#auditees").val() || [];
    initialSelections.forEach(email => {
        const personData = MainApplication.NewRequestComponent.findPersonData(email);
        MainApplication.NewRequestComponent.addPersonBlock(personData);
    });

    $("#auditees").on("select2:select", function (e) {
        const person = e.params.data;
        const $option = $(person.element);
        const personData = MainApplication.NewRequestComponent.findPersonData($option.val());
        MainApplication.NewRequestComponent.addPersonBlock(personData);
        MainApplication.NewRequestComponent.updatePlaceholder();
    });

    $("#auditees").on("select2:unselect", function (e) {
        const person = e.params.data;
        const $option = $(person.element);
        MainApplication.NewRequestComponent.removePersonBlock({ Email: $option.val() });
        MainApplication.NewRequestComponent.updatePlaceholder();
    });

    setTimeout(function () {
        globalDefinitions.closeLoader();
    }, 2000);
}

MainApplication.NewRequestComponent.addPersonBlock = function(person) {
    const block = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-4 person-block" data-id="${person.Email}">
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Employee Name</label>
                <input id="auditeeName_${person.Email.replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.Title}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                <input id="auditeeId_${person.Email.replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.EmployeeId}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Email</label>
                <input id="auditeeMail_${person.Email.replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.Email}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Department</label>
                <input id="auditeeDepartment_${person.Email.replace(/[^a-zA-Z0-9]/g, '_')}" type="text" value="${person.Department}" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readonly />
            </div>
        </div>
    `;
    $("#auditeesContainer").append(block);
}

MainApplication.NewRequestComponent.removePersonBlock = function(person) {
    $(`#auditeesContainer .person-block[data-id="${person.Email}"]`).remove();
}

MainApplication.NewRequestComponent.getAllAuditeeData = function () {
    const $container = $('#auditeesContainer');
    const $blocks = $container.find('.person-block');
    const auditeeData = [];

    $blocks.each(function () {
        const $block = $(this);
        const email = $block.data('id');
        if (!email) return;

        const personData = {
            Title: $block.find(`input[id*="auditeeName_${email.replace(/[^a-zA-Z0-9]/g, '_')}"]`).val() || '',
            Email: email,
            EmployeeId: $block.find(`input[id*="auditeeId_${email.replace(/[^a-zA-Z0-9]/g, '_')}"]`).val() || '',
            Department: $block.find(`input[id*="auditeeDepartment_${email.replace(/[^a-zA-Z0-9]/g, '_')}"]`).val() || ''
        };

        auditeeData.push(personData);
    });

    return auditeeData;
};

// Helper function to update placeholder visibility
MainApplication.NewRequestComponent.updatePlaceholder = function () {
    const $container = $("#auditeesContainer");
    const $personBlocks = $container.find('.person-block');
    const $placeholder = $container.find('#auditees-placeholder');

    if ($personBlocks.length === 0) {
        if ($placeholder.length === 0) {
            const placeholderHtml = `
                <div id="auditees-placeholder" class="text-center py-6 text-gray-500 text-sm sm:text-base">
                    No auditees selected. Please select an auditee from the picker above.
                </div>
            `;
            $container.append(placeholderHtml);
        }
    } else {
        $placeholder.remove();
    }
}

// Function to add a new question set to questionsContainer
MainApplication.NewRequestComponent.addQuestionSet = function () {
    const questionSetId = `question-set-${AppRequest.questionSetCounter++}`;
    const questionSetHtml = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-2 question-set border-2 p-2 relative" data-id="${questionSetId}">
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Questions</label>
                <input type="text" placeholder="Enter text here..." class="question-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Audit Finding</label>
                <input type="text" placeholder="Enter text here..." class="audit-finding-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">ISO Clause</label>
                <input type="text" placeholder="Enter text here..." class="iso-clause-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Objective Evidence</label>
                <input type="text" placeholder="Enter text here..." class="objective-evidence-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
            </div>
            <div class="mt-2">
                <label class="block text-sm font-medium text-blue-600 mb-2">Non-conformance Statement</label>
                <input type="text" placeholder="Enter text here..." class="non-conformance-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
            </div>
            <div class="absolute right-0">
                <button class="remove-question-set p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" data-id="${questionSetId}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
    `;
    $('#questionsContainer').append(questionSetHtml);
    MainApplication.NewRequestComponent.updateQuestionsPlaceholder();
}

// Function to remove a question set with animation
MainApplication.NewRequestComponent.removeQuestionSet = function (questionSetId) {
    AppRequest.questionSetCounter--;
    const $questionSet = $(`#questionsContainer .question-set[data-id="${questionSetId}"]`);
    if ($questionSet.length) {
        $questionSet.addClass('opacity-0').css('transition', 'opacity 0.3s ease');
        setTimeout(() => {
            $questionSet.remove();
            MainApplication.NewRequestComponent.updateQuestionsPlaceholder();
        }, 300); // Match animation duration
    }
}

// Function to update placeholder visibility
MainApplication.NewRequestComponent.updateQuestionsPlaceholder = function () {
    const $container = $('#questionsContainer');
    const $questionSets = $container.find('.question-set');
    const $placeholder = $container.find('#questions-placeholder');

    if ($questionSets.length === 0 && $placeholder.length === 0) {
        $container.append(`
            <div id="questions-placeholder" class="text-center py-6 text-gray-500 text-sm sm:text-base">
                No questions added. Click "Add New" to start.
            </div>
        `);
    } else if ($questionSets.length > 0) {
        $placeholder.remove();
    }
}

// Function to collect all question set data
// MainApplication.NewRequestComponent.getAllQuestionsData = function() {
//     const $questionSets = $('#questionsContainer .question-set');
//     const questionsData = [];
//     $questionSets.each(function() {
//         const $set = $(this);
//         questionsData.push({
//             Questions: $set.find('input[placeholder*="Questions"]').val() || '',
//             AuditFinding: $set.find('input[placeholder*="Audit Finding"]').val() || '',
//             ISOClause: $set.find('input[placeholder*="ISO Clause"]').val() || '',
//             ObjectiveEvidence: $set.find('input[placeholder*="Objective Evidence"]').val() || '',
//             NonConformanceStatement: $set.find('input[placeholder*="Non-conformance Statement"]').val() || ''
//         });
//     });
//     return questionsData;
// };


MainApplication.NewRequestComponent.getAllQuestionsData = function() {
    const $questionSets = $('#questionsContainer .question-set');
    const questionsData = [];

    $questionSets.each(function() {
        const $set = $(this);
        const questionData = {
            Questions: $set.find('.question-input').val() || '',
            AuditFinding: $set.find('.audit-finding-input').val() || '',
            ISOClause: $set.find('.iso-clause-input').val() || '',
            ObjectiveEvidence: $set.find('.objective-evidence-input').val() || '',
            NonConformanceStatement: $set.find('.non-conformance-input').val() || ''
        };

        // Log if any field is missing
        if (!questionData.Questions && !questionData.AuditFinding && !questionData.ISOClause && !questionData.ObjectiveEvidence && !questionData.NonConformanceStatement) {
            console.warn(`No data found for question set with data-id="${$set.data('id')}"`);
        }

        questionsData.push(questionData);
    });

    if (questionsData.length === 0) {
        console.warn('No question sets found in #questionsContainer');
    }

    return questionsData;
};



// Form submission processes


MainApplication.NewRequestComponent.confirmSubmit = function () {
    $("#confirmModal").modal("show");
}

MainApplication.NewRequestComponent.actionConfirmed = function () {
    MainApplication.NewRequestComponent.saveDataToList();
}

MainApplication.NewRequestComponent.saveDataToList = function () {
    globalDefinitions.onActionClicked();
    var formData = $spcontext.bind({});
    formData.InitiatorLogin = CurrentUserProperties.email;
    formData.InitiatorEmailAddress = CurrentUserProperties.email;
    formData.InitiatorName = CurrentUserProperties.title;

    formData.AuditeesDetails = MainApplication.NewRequestComponent.getAllAuditeeData();
    
    formData.QuestionsDetails = MainApplication.NewRequestComponent.getAllQuestionsData();
    
    // formData = Peoplepicker.getValue();
    const pickerValues = PeoplePicker.getValue();


    if ($spcontext.checkPassedValidation()) {
        formData.Auditees = pickerValues.Auditees;
        formData.OtherAuditors = pickerValues.OtherAuditors;

        formData.AuditeesDetails = JSON.stringify(formData.AuditeesDetails);
        formData.QuestionsDetails = JSON.stringify(formData.QuestionsDetails);
        // formData.KPIDetails = JSON.stringify(AppRequest.sections);
        // formData.StartDate = $spcontext.stringnifyDate({ value : formData.StartDate, format : "dd/mm/yy", reconstruct : "mm/dd/yy"});
        // formData.EndDate = $spcontext.stringnifyDate({ value : formData.EndDate, format : "dd/mm/yy", reconstruct : "mm/dd/yy"});
        
        globalDefinitions.callLoader();
        formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.transactionHistory, { stage: "Auditor", action: "Audit Created" });
        globalDefinitions.onActionCompleted();
        MainApplication.NewRequestComponent.proceedToList(formData);
    }
    else {
        globalDefinitions.HandlerError("", true);
        globalDefinitions.onActionFailed();
    }
}

MainApplication.NewRequestComponent.proceedToList = function (formData) {
    console.log("Form Data: ", formData);
    speedctxRoot.createItems([formData], configProperties.AUDMGTLIST.setting,
    function (createdItemsProperties) {
        var itemID = createdItemsProperties[0].get_id();
        var updateObj = {};
        updateObj.ID = itemID;
        var dateCreatedCode = $spcontext.stringnifyDate({
            includeTime: true,
            timeSpace: false,
            format: "dd-mm-yy"
        });
        dateCreatedCode = dateCreatedCode.replace(/-/g, "");
        updateObj.WorkflowRequestID = globalDefinitions.stageDefinitions.workflowcode + dateCreatedCode;

        AppRequest.requestDetails = formData;
        AppRequest.requestDetails.WorkflowRequestID = updateObj.WorkflowRequestID;
        updateObj.Year = $spcontext.serverDate().getFullYear();

        speedctxRoot.updateItems([updateObj], configProperties.AUDMGTLIST.setting, function () {
            setTimeout(() => {
                globalDefinitions.closeLoader();
            }, 2000);
            globalDefinitions.HandlerSuccess(`Audit Created Successfully`);
            
            globalDefinitions.AuditLogManager_SaveLog({
                Action: `created Audit ${AppRequest.requestDetails.WorkflowRequestID}`
            });
            globalDefinitions.onActionCompleted();
            $spcontext.redirect("#/", false);
        });
    });
}