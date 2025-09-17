function loadProfileComponent() {
    if (MainApplication.cachedState.mode) {
        MainApplication.ProfileComponent.pageLoaded = false;
        whenProfileDependeciesLoaded();
    }
    else {
        MainApplication.cachedState.pageStateCall = whenProfileDependeciesLoaded;
    }
}

function whenProfileDependeciesLoaded() {
    MainApplication.globalSetupForPageLoaded();
    $("#uploadtype").on("change", () => {
        var value = document.getElementById("uploadtype").value;
        if (value === "From Computer") {
            $("#signatureuploadblock").show();
            $("#signaturecanvasblock").hide();
            $("#signaturefile").attr("speed-validate-mode", "true");
        }
        else if (value === "Sign on canvas") {
            $("#signatureuploadblock").hide();
            $("#signaturecanvasblock").show();
            $("#signaturefile").attr("speed-validate-mode", "false");
        }
        else {
            $("#signatureuploadblock").hide();
            $("#signaturecanvasblock").hide();
            $("#signaturefile").attr("speed-validate-mode", "false");
        }
    });

    if (MainApplication.staffDetails[CurrentUserProperties.email].DefaultSignatureGUID == "") {
        MainApplication.ProfileComponent.signatureGuid = $spcontext.uniqueIdGenerator();
    }
    else {
        MainApplication.ProfileComponent.signatureGuid =
            MainApplication.staffDetails[CurrentUserProperties.email].DefaultSignatureGUID;
        MainApplication.ProfileComponent.showSignatureImage();
    }

    $spcontext.appliedEvents.attachments = [];
    $spcontext.applyAttachmentEvent({
        o365: true,
        appendFiles: false,
        cancelClear: false,
        fileNameasName: false,
        dataNameDefault: MainApplication.ProfileComponent.signatureGuid,
        dynamicNaming: false,
        overideFileExtension: "png"
    }, function (elementName, listOfFiles, fileId) {
        console.log(listOfFiles);
    }, function (errors) {
        alert(errors.msg);
    });

    if (typeof $spcontext.filesDictionary.Signature !== "undefined") {
        $spcontext.filesDictionary.Signature.files = [];
    }

    $("#profileimage").attr("src", `${MainApplication.profilephotoLarge}${CurrentUserProperties.email}`);

    $spcontext.htmlBind(MainApplication.staffDetails[CurrentUserProperties.email]);

    $spcontext.dataUriFormFileSrc({url : configPropertiesRoot.COMPANYLOGO.setting, metaData : true},function(baseuri){
        MainApplication.ProfileComponent.companyLogo = baseuri
    });

    var userImage = MainApplication.profilephotoLarge + CurrentUserProperties.email;
    $spcontext.dataUriFormFileSrc({url : userImage, metaData : true},function(baseuri){
        MainApplication.ProfileComponent.userImage = baseuri
    });
    //payslip section
    MainApplication.ProfileComponent.getUserPaySlip();
}

MainApplication.ProfileComponent.saveProfile = function () {
    var data = $spcontext.bind({}, "Profile");
    data.ID = MainApplication.staffDetails[CurrentUserProperties.email].ID;
    for (var key in data) {
        if (key !== "ID") {
            MainApplication.staffDetails[CurrentUserProperties.email][key] = data[key];
        }
    }
    speedctxRoot.updateItems([data], "StaffInformation", function () {
        globalDefinitions.HandlerSuccess(`You have successfully updated your profile.`);
    });
}

MainApplication.ProfileComponent.uploadSignature = function () {
    globalDefinitions.onActionClicked();
    if ($spcontext.checkPassedValidation()) {
        var siteContextUrl = speedctxRoot.initiate().get_url();
        var folderUrl = siteContextUrl + "/" + configPropertiesRoot.SIGNATURELIBRARY.setting + "/" + CurrentUserProperties.userfolder + "/";
        speedctxRoot.getFileFolderExists(folderUrl, "folder", function () {
            MainApplication.ProfileComponent.createFileinFolder(folderUrl);
        },
            function () {
                var libraryProperties = {
                    libraryName: configPropertiesRoot.SIGNATURELIBRARY.setting,
                    breakRoleInheritance: true,
                    users: [],
                    groups: [],
                }
                speedctxRoot.createFolder(CurrentUserProperties.userfolder, libraryProperties.libraryName, function () {
                    MainApplication.ProfileComponent.createFileinFolder(folderUrl);
                });
            });
    }
    else {
        globalDefinitions.HandlerError("", true);
        globalDefinitions.onActionFailed();
    }
}

MainApplication.ProfileComponent.createFileinFolder = function (folderurl, data) {
    var fileProperties = {
        folder: folderurl,
        metadata: {
            Title: CurrentUserProperties.email
        }
    }
    var data = $spcontext.bind({}, "Signature");
    var dataUri = "";
    if (data.UploadType === "Sign on canvas") {
        dataUri = window.currentApproverSignature.toDataURL("image/png");
        speedctxRoot.uploadFile(`${MainApplication.ProfileComponent.signatureGuid}.png`, dataUri, folderurl, function (filedetails) {
            MainApplication.ProfileComponent.signatureUploadedSuccessfully();
        });
    }
    else {
        speedctxRoot.uploadMultipleFiles([$spcontext.filesDictionary.Signature.files[0]], [fileProperties], 0, function () {

        }, function () {
            MainApplication.ProfileComponent.signatureUploadedSuccessfully();
        });
    }

}

MainApplication.ProfileComponent.signatureUploadedSuccessfully = function () {

    $spcontext.filesDictionary.Signature.files = [];
    MainApplication.ProfileComponent.showSignatureImage();
    var data = {};
    data.ID = MainApplication.staffDetails[CurrentUserProperties.email].ID;
    data.DefaultSignatureGUID = MainApplication.ProfileComponent.signatureGuid;
    speedctxRoot.updateItems([data], "StaffInformation", function () {
        globalDefinitions.onActionCompleted();
        globalDefinitions.HandlerSuccess(`You have successfully updated your signature.`);
    });
}

MainApplication.ProfileComponent.showSignatureImage = function () {
    var siteContextUrl = speedctxRoot.initiate().get_url();
    var folderUrl = siteContextUrl + "/" + configPropertiesRoot.SIGNATURELIBRARY.setting + "/" + CurrentUserProperties.userfolder + "/";
    $("#signatureuploaded").attr("src", (folderUrl + MainApplication.ProfileComponent.signatureGuid + ".png?v=" + $spcontext.stringnifyDate({ asId: true, includeTime: true })));
    $("#signatureuploaded").show();
}

MainApplication.ProfileComponent.getUserPaySlip = function () {
    MainApplication.WorkflowsComponent.HRMS.Payroll.context = new Speed(configPropertiesRoot.PAYROLLURL.setting)
    $(".payslip").empty();
    MainApplication.ProfileComponent.employementType = MainApplication.staffDetails[CurrentUserProperties.email].StaffType;

    if (MainApplication.ProfileComponent.employementType === "Fulltime") {
        $(".fulltime").show();
        $(".contract").remove();
    }
    else {
        $(".fulltime").remove();
        $(".contract").show();
    }
    var query = [
        {
        },
        {
            operator: 'Eq',
            field: 'Title',
            type: 'Text',
            val: CurrentUserProperties.email
        }
    ];
    var extraProperties = {
        merge: false,
        data: ["ID", "Title", "AnnualGross", "PayeAnnual", "MonthlyTakeHome",
            "PensionContribution", "Breakdown", "MonthlyBreakdown", "TaxBreakdown",
            "PensionBreakdown", "ContractBreakdown",]
    };

    MainApplication.WorkflowsComponent.HRMS.Payroll.context.getListToControl(
        "PayrollInformation",
        $spcontext.camlBuilder(query), extraProperties, function (listProperties) {
            if (!$.isEmptyObject(listProperties)) {
                listProperties.Breakdown = $spcontext.JSONToObject(listProperties.Breakdown);
                listProperties.MonthlyBreakdown = $spcontext.JSONToObject(listProperties.MonthlyBreakdown);
                listProperties.TaxBreakdown = $spcontext.JSONToObject(listProperties.TaxBreakdown);
                listProperties.PensionBreakdown = $spcontext.JSONToObject(listProperties.PensionBreakdown);
                listProperties.ContractBreakdown = $spcontext.JSONToObject(listProperties.ContractBreakdown);
                $spcontext.htmlBind(listProperties, {
                    Money: function (pos, data) {
                        return (configPropertiesRoot.ERPCURRENCY.setting + $spcontext.numberWithCommas(data))
                    }
                });
                MainApplication.ProfileComponent.payrollData = listProperties;
            }
        });
}

MainApplication.ProfileComponent.printSlip = function () {

    let empName = MainApplication.staffDetails[CurrentUserProperties.email].Title;
    let annualGross = configPropertiesRoot.ERPCURRENCY.setting + $spcontext.numberWithCommas(MainApplication.ProfileComponent.payrollData['AnnualGross']);

    var payslipHeader = {
        table: {
            widths: ["50%", "50%"],
            body: [
                [
                    { text: "Payslip", style: "sectionHeader", alignment: "left" },
                    { image: MainApplication.ProfileComponent.companyLogo, alignment: "right", width: 50 }
                ],
                [
                    { image: MainApplication.ProfileComponent.userImage, width: 50, margin: [2, 10, 0, 10] },
                    {}
                ]
            ]
        },
        layout: "noBorders"
    }
    var payslipContent;
    if (MainApplication.ProfileComponent.employementType === "Fulltime") {
        payslipContent = [
            // Payslip Header
            payslipHeader,
            // Employee Details Table
            [
                { text: [{ text: "Employee:  ", style: "label" }, { text: empName, style: "value", fontSize: "14", bold: true }] },
            ],
            [
                { text: [{ text: "Annual Gross:  ", style: "label" }, { text: annualGross, style: "value", fontSize: "14", bold: true }] },
            ],

            // Annual Breakdown Section
            [{ text: "Annual Break Down", style: "sectionHeader" }],
            {
                table: {
                    widths: ["10%", "50%", "20%", "20%"],
                    body: getSlipTableData(MainApplication.ProfileComponent.payrollData['Breakdown']),
                },
                layout: "noBorders",
            },

            // Tax Break Down Section
            { text: "\nTax Break Down", style: "sectionHeader" },
            {
                table: {
                    widths: ["10%", "50%", "20%", "20%"],
                    body: getSlipTableData(MainApplication.ProfileComponent.payrollData['TaxBreakdown'], 'TaxBreakdown'),
                },
                layout: "noBorders",
            },
            // Monthly Breakdown Section
            { text: "\nMonthly Breakdown", style: "sectionHeader" },
            {
                table: {
                    widths: ["10%", "60%", "30%"],
                    body: getSlipTableData(MainApplication.ProfileComponent.payrollData['MonthlyBreakdown'], 'MonthlyBreakdown'),
                },
                layout: "noBorders",
            },
            // Pension Breakdown Section
            { text: "\nPension Breakdown", style: "sectionHeader" },
            {
                table: {
                    widths: ["10%", "50%", "20%", "20%"],
                    body: getSlipTableData(MainApplication.ProfileComponent.payrollData['PensionBreakdown'], 'TaxBreakdown'),
                },
                layout: "noBorders",
            },

        ]
    }
    else {
        payslipContent = [
            // Payslip Header
            payslipHeader,
            // Employee Details Table
            [
                { text: [{ text: "Employee:  ", style: "label" }, { text: empName, style: "value", fontSize: "14", bold: true }] },
            ],
            [
                { text: [{ text: "Annual Gross:  ", style: "label" }, { text: annualGross, style: "value", fontSize: "14", bold: true }] },
            ],

            // Contract Breakdown Section
            [{ text: "Contract Break Down", style: "sectionHeader" }],
            {
                table: {
                    widths: ["10%", "50%", "20%", "20%"],
                    body: getSlipTableData(MainApplication.ProfileComponent.payrollData['ContractBreakdown'], "ContractBreakdown"),
                },
                layout: "noBorders",
            }
        ]
    }

    let docDefinition = {
        watermark: { text: configPropertiesRoot.COMPANYNAME.setting, bold: true, angle: 45, opacity: 0.1 },
        content: payslipContent,
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
            },
            label: {
                fontSize: 12,
                bold: true,
                color: "#002147",
            },
            value: {
                fontSize: 12,
                bold: false,
            },
            sectionHeader: {
                fontSize: 14,
                bold: true,
                color: "#002147",
                margin: [0, 10, 0, 5],
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: "white",
                fillColor: "#002147",
                alignment: "left",
                margin: [5, 0, 0, 0],
            },
            bold: {
                bold: true,
            },
        },
    };

    pdfMake.createPdf(docDefinition).print();
}