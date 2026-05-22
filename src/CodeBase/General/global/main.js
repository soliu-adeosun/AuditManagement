var MainApplication = new MainStartPoint();
var customWorkflowEngine;
var CurrentUserProperties = {};

var configProperties = {
    restrictedlinks: [],
};

var configPropertiesRoot = {
    restrictedlinks: [],
};

var speedctxRoot;
var globalDefinitions;
var rsBAContext;

function MainStartPoint() {
    this.url = window.location.href;
    this.notyf = new Notyf({
        duration: 5000,
        //dismissible: true,
        position: {
            x: 'right', // 'left' or 'right'
            y: 'top'   // 'top' or 'bottom'
        },
        types: [
            {
                type: 'black',
                background: 'black',
                icon: {
                    className: 'material-icons',
                    tagName: 'i',
                    text: 'info' // optional icon
                },
                duration: 3000
            }
        ]
    });
    this.profilephoto = `/_layouts/15/userphoto.aspx?size=M&accountname=`;
    this.profilephotoLarge = `/_layouts/15/userphoto.aspx?size=L&accountname=`;
    this.messageTemplate = {};
    this.cachedState = {
        mode: false,
        pageStateCall: null,
        reportAdmin: false,
        isWorkflowActor: false,
        workflowActors: {},
        isAdmin: false,
        isReportAdmin: false,
        ipaddress: "",
        departments: [],
        hods: {},
        currentUserIsHod: {
            auth: false,
            department: ""
        },
    };
    this.staffDetails = {};
    this.staffList = [];

    this.configuredTaskMembers = {};
    this.isUserAnActor = false;



    this.NewRequestComponent = {};
    this.DashboardComponent = {};
    this.ApproveRequestComponent = {};
    this.ViewRequestComponent = {};
    this.ReportComponent = {};

    this.CurrentPageSubmitFunction = null;
    this.auditType = [];
    this.processes = [];
    // this.procedures = [];

    this.auditNavigationClicks = function (clicklocation) {
        globalDefinitions.AuditLogManager_SaveLog({
            Action: `Authorized accessed ${clicklocation}`,
            Message: `user visited the ${clicklocation} at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`
        });
    }

}

function whenLayoutLoaded() {
    //load view port to enable page to be mobile responsive
    $("head").append(`<meta name="viewport" content="width=device-width, initial-scale=1">`);
    //============================================================================================
    $spcontext.loadSPDependencies(
        function () {
            var dependenciesCount = 0;
            var expectedDepenciesCount = 11;
            // speedctxRoot = new Speed();
            globalDefinitions = new GlobalDefinitionsManager();

            globalDefinitions.callLoader();

            // globalDefinitions.stageDefinitions.workflowcode = "RSAUD-";
            // globalDefinitions.stageDefinitions.workflow = "Audit Management";


            // speedctxRoot.errorHandler = globalDefinitions.errorHandler;
            // $spcontext.errorHandler = globalDefinitions.errorHandler;

            window.globalProp.getClientIP().then((response) => {
                MainApplication.cachedState.ipaddress = response;
                checkAppDependency();
            }).catch((error) => {
                checkAppDependency();
            })

            $spcontext.currentUserDetails((user) => {
                CurrentUserProperties.email = user.get_email();
                CurrentUserProperties.email = CurrentUserProperties.email.toLowerCase();
                CurrentUserProperties.login = CurrentUserProperties.email;
                CurrentUserProperties.title = user.get_title();

                var name = CurrentUserProperties.title.split(" ");
                var initials = "";
                try {
                    initials += name[0].charAt(0);
                    initials += name[1].charAt(0);
                } catch (e) { }

                $("#currentusername").text(CurrentUserProperties.title);
                //$("#userinitials").attr("title", CurrentUserProperties.title);
                checkAppDependency();
            });

            $spcontext.getItem("Configuration", $spcontext.camlBuilder(), function (configObjects) {
                var listEnumerator = configObjects.getEnumerator();
                while (listEnumerator.moveNext()) {
                    var settingType = listEnumerator.get_current().get_item("SettingType");
                    var configObj = {};
                    configObj.title = listEnumerator.get_current().get_item("Title");
                    configObj.setting = listEnumerator.get_current().get_item("Setting");
                    if (settingType == "Restricted") {
                        configPropertiesRoot.restrictedlinks.push(configObj);
                    } else {
                        configPropertiesRoot[configObj.title] = configObj;
                    }
                }

                rsBAContext = new Speed(configPropertiesRoot.POPCONTEXT.setting);

                speedctxRoot = new Speed(configPropertiesRoot.AUDITMANAGEMENTURL.setting);
                // testContext = new Speed("/sites");
                speedctxRoot.errorHandler = globalDefinitions.errorHandler;

                // $spcontext.errorHandler = globalDefinitions.errorHandler;

                speedctxRoot.getItem("Configuration", speedctxRoot.camlBuilder(), function (configObjects) {
                    var listEnumerator = configObjects.getEnumerator();
                    while (listEnumerator.moveNext()) {
                        var settingType = listEnumerator.get_current().get_item("SettingType");
                        var configObj = {};
                        configObj.title = listEnumerator.get_current().get_item("Title");
                        configObj.setting = listEnumerator.get_current().get_item("Setting");
                        if (settingType == "Restricted") {
                            configProperties.restrictedlinks.push(configObj);
                        } else {
                            configProperties[configObj.title] = configObj;
                        }
                    }

                    globalDefinitions.stageDefinitions.workflowcode = configProperties.WORKFLOWCODE.setting;
                    globalDefinitions.stageDefinitions.workflow = configProperties.WORKFLOWNAME.setting;

                    $("#auditmanagementversion").text(configProperties.AUDMGTVERSION.setting);
                    $("#versioneffectivedate").text(configProperties.VERSIONEFFECTIVEDATE.setting);
                    $("#auditmanagementversionMobile").text(configProperties.AUDMGTVERSION.setting);
                    $("#versioneffectivedateMobile").text(configProperties.VERSIONEFFECTIVEDATE.setting);

                    // speedctxRoot.isUserMemberOfGroup([configProperties.MANAGEMENT.setting, configProperties.CEO.setting],
                    //   { email : CurrentUserProperties.email, groupEmails: true },function(isUserMember, groupUserProperties){
                    //       MainApplication.isUserAnActor = isUserMember;
                    //       MainApplication.configuredTaskMembers = groupUserProperties;
                    //   })

                    // speedctxRoot.isCurrentUserMemberOfGroup(configProperties.REPORTADMIN.setting, function (isAdmin) {
                    //     MainApplication.cachedState.isReportAdmin = isAdmin;
                    // });
                    checkAppDependency();
                });

                $spcontext.isUserMemberOfGroup([configPropertiesRoot.MANAGEMENT.setting, configPropertiesRoot.CEO.setting, configPropertiesRoot.REPORTADMIN.setting],
                    { email: CurrentUserProperties.email, groupEmails: true }, function (isUserMember, groupUserProperties) {
                        MainApplication.isUserAnActor = isUserMember;
                        MainApplication.configuredTaskMembers = groupUserProperties;
                        checkAppDependency();
                    })

                $spcontext.isCurrentUserMemberOfGroup(configPropertiesRoot.REPORTADMIN.setting, function (isAdmin) {
                    MainApplication.cachedState.isReportAdmin = isAdmin;
                    checkAppDependency();
                });



                var basicQuery = [
                    {
                        ascending: "TRUE",  //ascending or descending
                        orderby: "Title", //Column Name to order by
                    }
                ];

                var isoQuery = [
                    {
                        ascending: "TRUE",  //ascending or descending
                        orderby: "SortClause", //Column Name to order by
                    }
                ];

                speedctxRoot.getItem("AuditType", speedctxRoot.camlBuilder(basicQuery), function (_spMeta) {
                    var listEnumerator = _spMeta.getEnumerator();
                    MainApplication.auditType = [];
                    while (listEnumerator.moveNext()) {
                        var title = listEnumerator.get_current().get_item("Title");
                        MainApplication.auditType.push(title);
                    }
                    checkAppDependency();
                })

                var fieldProperties = {
                    ignoreThreshold: false,
                    merge: false,
                    data: ["ID", "Title", "PROCEDURES"]
                };

                MainApplication.procedures = {};
                MainApplication.proceduresInfo = {};
                MainApplication.processes = [];

                rsBAContext.getListToItems(
                    "Procedure_process",
                    basicQuery,
                    fieldProperties,
                    true,
                    function (item) {
                        // Use Title as the key to group PROCEDURES
                        if (!MainApplication.proceduresInfo[item.Title]) {
                            MainApplication.proceduresInfo[item.Title] = [];
                            // Add unique Title to processes array
                            MainApplication.processes.push(item.Title);
                        }
                        // Only push PROCEDURES if it's not already in the array to ensure distinct values
                        if (!MainApplication.proceduresInfo[item.Title].includes(item.PROCEDURES)) {
                            MainApplication.proceduresInfo[item.Title].push(item.PROCEDURES);
                        }
                        return item;
                    },
                    function (items) {
                        MainApplication.procedures = items;
                        checkAppDependency();
                    }
                );

                rsBAContext.getItem("ISO CLAUSE", $spcontext.camlBuilder(isoQuery), function (_spMeta) {
                    var listEnumerator = _spMeta.getEnumerator();
                    MainApplication.isoClause = [];
                    MainApplication.occurrence = [];

                    while (listEnumerator.moveNext()) {
                        var title = listEnumerator.get_current().get_item("Title");
                        var occurrenceData = $spcontext.checkNull(listEnumerator.get_current().get_item("d65x"));

                        MainApplication.isoClause.push(title);

                        // Only push non-empty strings
                        if (occurrenceData !== "") {
                            MainApplication.occurrence.push(occurrenceData);
                        }
                    }

                    checkAppDependency();
                });

                var riskQuery = [
                    {
                        ascending: "TRUE",  //ascending or descending
                        orderby: "Value", //Column Name to order by
                    }
                ];

                speedctxRoot.getItem("RiskImpact", speedctxRoot.camlBuilder(riskQuery), function (_spMeta) {
                    var listEnumerator = _spMeta.getEnumerator();
                    MainApplication.riskImpact = [];
                    while (listEnumerator.moveNext()) {
                        var riskImpactObj = {};
                        riskImpactObj.title = listEnumerator.get_current().get_item("Title");
                        riskImpactObj.value = listEnumerator.get_current().get_item("Value");
                        riskImpactObj.color = listEnumerator.get_current().get_item("ColorCode");
                        MainApplication.riskImpact.push(riskImpactObj);
                    }
                    checkAppDependency();
                })

                speedctxRoot.getItem("NonConformanceRating", speedctxRoot.camlBuilder(riskQuery), function (_spMeta) {
                    var listEnumerator = _spMeta.getEnumerator();
                    MainApplication.NCRating = [];
                    while (listEnumerator.moveNext()) {
                        var ncRatingObj = {};
                        ncRatingObj.title = listEnumerator.get_current().get_item("Title");
                        ncRatingObj.value = listEnumerator.get_current().get_item("Value");
                        MainApplication.NCRating.push(ncRatingObj);
                    }
                    checkAppDependency();
                })

                var employeeInfoColumns = [
                    "ID",
                    "Title",
                    "EMAIL_x0020_ADDRESS",
                    "DESIGNATION",
                    "SUPERVISOR",
                    "PERSONAL_x0020_NUMBER",
                    "DEPARTMENT",
                    "EID",
                    "D_x002e_O_x002e_E_x0020__x002f__",
                    "Job_x0020_Role",
                    "Active"
                ];

                rsBAContext.getListToItems(
                    "Staff List",
                    [{
                        orderby: "ID",
                        ascending: "FALSE"
                    },
                    {
                        operator: 'Eq',
                        field: 'Active',
                        type: 'Text',
                        val: "Yes"
                    }
                    ],
                    {
                        ignoreThreshold: false,
                        data: employeeInfoColumns,
                        merge: false,
                    },
                    false,
                    function (item) {
                        // Transform item to use new field names
                        const transformedItem = {
                            ID: item.ID || '',
                            Title: item.Title || '',
                            Email: item.EMAIL_x0020_ADDRESS || '',
                            Designation: item.DESIGNATION || '',
                            Supervisor: item.SUPERVISOR || '',
                            PersonalNumber: item.PERSONAL_x0020_NUMBER || '',
                            Department: item.DEPARTMENT || '',
                            EmployeeId: item.EID || '',
                            DateOfEmployment: item.D_x002e_O_x002e_E_x0020__x002f__ || '',
                            JobRole: item.Job_x0020_Role || '',
                            Active: item.Active || ''
                        };

                        if (transformedItem.Emailmail !== "") {
                            if (typeof MainApplication.staffDetails[transformedItem.Email.toLowerCase()] === "undefined") {
                                MainApplication.staffDetails[transformedItem.Email.toLowerCase()] = transformedItem;
                                MainApplication.staffList.push(transformedItem);
                            }
                        }

                        return transformedItem;
                    },
                    function (items) {
                        MainApplication.staffList = items;
                        checkAppDependency();
                    }
                );

                // checkAppDependency();
            });



            function checkAppDependency() {
                dependenciesCount++;
                if (dependenciesCount === expectedDepenciesCount) {

                    console.log("Dependency count: ", dependenciesCount);
                    console.log("Expected Dependencies: ", expectedDepenciesCount);
                    globalDefinitions.AuditLogManager_SaveLog({
                        Action: `Logged into/Opened Audit Management application`,
                        Message: `user logged in to application at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`
                    });
                    if (MainApplication.isUserAnActor) {
                        $(".reportNav").show();
                        $(".reportNavMobile").show();
                    }
                    $spcontext.errorHandler = globalDefinitions.errorHandler;
                    MainApplication.cachedState.mode = true;
                    MainApplication.cachedState.pageStateCall();
                }
            }
        },
        {
            clientPeoplePicker: true
        }
    );
}

MainApplication.reportSyncSearch = function (keyquery, data) {
    if (!keyquery || keyquery.trim().length < 3) {
        return data;
    }

    keyquery = keyquery.trim().toLowerCase();

    return data.filter(item =>
        item.WorkflowRequestID?.toLowerCase().includes(keyquery) ||
        item.InitiatorName?.toLowerCase().includes(keyquery) ||
        item.TypeOfAudit?.toLowerCase().includes(keyquery) ||
        item.Approval_Status?.toLowerCase().includes(keyquery) ||
        item.Current_Approver?.toLowerCase().includes(keyquery)
    );
};


whenLayoutLoaded();


MainApplication.displayPeople = function (people, containerId, prefix, placeholderText) {
    const $displayContainer = $(`#${containerId}`);
    $displayContainer.empty();

    if (!people || people.length === 0) {
        $displayContainer.append(`
            <div class="text-center text-gray-500 mt-4">
                ${placeholderText}
            </div>
        `);
        return;
    }

    people.forEach((person, index) => {
        const block = `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-4 person-block" data-id="${person.Email || ''}">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">
                        <span class="index-number">${index + 1}.</span> Employee Name
                    </label>
                    <input id="${prefix}Name_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" 
                           type="text" 
                           value="${person.Title || ''}" 
                           class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 
                                  focus:border-transparent transition-all text-sm sm:text-base" 
                           readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                    <input id="${prefix}Id_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" 
                           type="text" 
                           value="${person.EmployeeId || ''}" 
                           class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 
                                  focus:border-transparent transition-all text-sm sm:text-base" 
                           readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Email</label>
                    <input id="${prefix}Mail_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" 
                           type="text" 
                           value="${person.Email || ''}" 
                           class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 
                                  focus:border-transparent transition-all text-sm sm:text-base" 
                           readonly />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Division/Unit</label>
                    <input id="${prefix}Department_${(person.Email || '').replace(/[^a-zA-Z0-9]/g, '_')}" 
                           type="text" 
                           value="${person.Department || ''}" 
                           class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 
                                  focus:border-transparent transition-all text-sm sm:text-base" 
                           readonly />
                </div>
            </div>
        `;
        $displayContainer.append(block);
    });
};

MainApplication.displayQuestionSets = function (questionSets) {
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
                    
                    <label class="block text-sm font-medium text-blue-600 mb-2"><span class="index-number">${index + 1}.</span> Questions</label>
                    <textarea readonly class="question-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base">${questionSet.Questions || ''}</textarea>
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Audit Finding</label>
                    <input readonly type="text" value="${questionSet.AuditFinding || ''}" class="audit-finding-input w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-blue-600 mb-2">Procedure Section</label>
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

MainApplication.displayNCRiskAssessmentReadOnly = function (ncRiskData) {
    // If no data, return empty container
    if (typeof ncRiskData === 'string') {
        try {
            ncRiskData = JSON.parse(ncRiskData);
        } catch (err) {
            console.error("Error parsing ncRiskData:", err);
            ncRiskData = [];
        }
    }

    if (!Array.isArray(ncRiskData) || ncRiskData.length === 0) {
        return $('#riskAssessmentContainer').html(
            '<p class="text-gray-500 italic my-4 sm:my-6 text-center">No Non-Conformance Risk Assessment data available.</p>'
        )[0];
    }

    // Build read-only table
    let html = `
        <div>
            <h2 class="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">Non-Conformance Risk Assessment Section</h2>
            <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">S/N</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC REF ID</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">ISO CLAUSE</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC STATEMENT</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">OCCURRENCE</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC RATING</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">NC CLASS</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">RISK IMPACT</th>
                            <th class="px-2 py-2 text-left text-sm font-medium text-blue-600">RISK EXPOSURE</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    // Add rows for each data entry
    ncRiskData.forEach((data, index) => {
        // Sanitize data to prevent XSS
        const ncId = $('<div>').text(data.NCReferenceNo || '').html();
        const isoClause = $('<div>').text(data.ISOClause || '').html();
        const ncStatement = $('<div>').text(data.NonConformance || '').html();
        const occurrence = $('<div>').text(data.Occurrence || '').html();
        const ncRating = $('<div>').text(data.NCRating || '').html();
        const ncClassification = $('<div>').text(data.NCClassification || '').html();
        const riskImpact = $('<div>').text(data.RiskImpact || '').html();

        // Find the ColorCode for the RiskImpact value
        const riskImpactValue = parseFloat(data.RiskImpact) || 0; // Convert to number for comparison
        const riskImpactOption = Array.isArray(MainApplication.riskImpact)
            ? MainApplication.riskImpact.find(option => parseFloat(option.value) === riskImpactValue) || {}
            : {};
        const riskImpactColor = riskImpactOption.color || '#f3f4f6'; // Use 'color' property
        const riskImpactTitle = riskImpactOption.title || data.RiskImpact;
        console.log(`Row ${index} RiskImpact:`, {
            dataRiskImpact: data.RiskImpact,
            riskImpactValue,
            matchedOption: riskImpactOption,
            colorCode: riskImpactColor
        });

        const overallRiskExposure = $('<div>').text(data.OverallRiskExposure || '').html();

        html += `
            <tr class="border-b">
                <td class="px-2 py-2">
                    <p>${index + 1}.</p>
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${ncId}" readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none" />
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${isoClause}" readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none" />
                </td>
                <td class="px-2 py-2">
                    <textarea readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none">${ncStatement}</textarea>
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${occurrence}" readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none" />
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${ncRating}" readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none" />
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${ncClassification}" readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none" />
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${riskImpactTitle}" readonly class="w-full px-3 py-2 text-sm border-none focus:outline-none" style="background-color: ${riskImpactColor}; color: black;" />
                </td>
                <td class="px-2 py-2">
                    <input type="text" value="${overallRiskExposure}" readonly class="w-full px-3 py-2 bg-gray-100 text-sm border-none focus:outline-none" />
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

    // Create and return DOM element
    return $('#riskAssessmentContainer').html(html)[0];
};