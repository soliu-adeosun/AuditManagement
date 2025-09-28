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
var popContext;
var testContext;

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
    docsclassfication: [],
    businesstype: [],
    orgtype: [],
    countries: [],
    states: [],
    cities: [],
    vendors: [],
    products: [],
    currency: [],
    documentupload: {},
    corporatedocumentupload: {}
  };
  this.staffDetails = {};
  this.staffList = [];

  this.configuredTaskMembers = {};
  this.isUserAnActor = false;



  this.NewRequestComponent = {};
  this.DashboardComponent = {};
  this.ApproveRequestComponent = {};
  this.ViewRequestComponent = {};

  this.CurrentPageSubmitFunction = null;
  this.auditType = [];
  this.processes = [];
  // this.procedures = [];

  this.auditNavigationClicks = function(clicklocation){
    globalDefinitions.AuditLogManager_SaveLog({
        Action : `Authorized accessed ${clicklocation}`,
        Message : `user visited the ${clicklocation} at ${$spcontext.stringnifyDate({ format : "dd/mm/yy", includeTime : true})}`
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
      var expectedDepenciesCount = 7;
      // speedctxRoot = new Speed();
      globalDefinitions = new GlobalDefinitionsManager();

      globalDefinitions.callLoader();
      
      // globalDefinitions.stageDefinitions.workflowcode = "RSAUD-";
      // globalDefinitions.stageDefinitions.workflow = "Audit Management";
      

      // speedctxRoot.errorHandler = globalDefinitions.errorHandler;
      // $spcontext.errorHandler = globalDefinitions.errorHandler;

      window.globalProp.getClientIP().then((response)=>{
        MainApplication.cachedState.ipaddress = response;
        checkAppDependency();
      }).catch((error)=>{
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

        popContext = new Speed(configPropertiesRoot.POPCONTEXT.setting);

        speedctxRoot = new Speed(configPropertiesRoot.AUDITMANAGEMENTURL.setting);
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



          var basicQuery = [
                {
                    ascending: "TRUE",  //ascending or descending
                    orderby: "Title", //Column Name to order by
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

          speedctxRoot.getItem("Processes", speedctxRoot.camlBuilder(basicQuery), function (_spMeta) {
              var listEnumerator = _spMeta.getEnumerator();
              MainApplication.processes = [];
              while (listEnumerator.moveNext()) {
                  var title = listEnumerator.get_current().get_item("Title");
                  MainApplication.processes.push(title);
              }
              checkAppDependency();
          })

          var fieldProperties = {
                ignoreThreshold: false,
                merge: false,
                data: ["ID","Title", "Processes"]
            };

            MainApplication.procedures = {};
            MainApplication.proceduresInfo = {};
            MainApplication.proceduresAtom = {};
            speedctxRoot.getListToItems(
                "Procedures",
                basicQuery,
                fieldProperties,
                true,
                function (item) {
                    if (!MainApplication.proceduresInfo[item.Processes.value]) {
                        MainApplication.proceduresInfo[item.Processes.value] = [];
                    }
                    MainApplication.proceduresInfo[item.Processes.value].push(item);
                    return item;
                },
                function (items) {
                    MainApplication.procedures = items;
                    checkAppDependency();
                }
            );

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
            "Job_x0020_Role"
        ];

        popContext.getListToItems(
            "Staff List",
            [{}],
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
                    JobRole: item.Job_x0020_Role || ''
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

        checkAppDependency();
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


whenLayoutLoaded();

function deleteRowAttachment(elementBindProperty, index, elementId) {
  var customId = "#" + elementBindProperty + "display" + index;
  var property = document.getElementById(elementId).getAttribute("speed-file-validate");
  property = (typeof property === "undefined" || property === null) ? document.getElementById(elementId).getAttribute("speed-file-bind") : property;
  $spcontext.clearFileInput(elementId);
  $(customId).remove();
  //delete $spcontext.filesDictionary[property];
  $spcontext.filesDictionary[property].files.splice(index, 1);
  //redraw attachments
  $("div[speed-file-bind='" + elementBindProperty + "']").empty();

  if ($spcontext.filesDictionary[property].files.length !== 0) {
    for (var y = 0; y < $spcontext.filesDictionary[property].files.length; y++) {
      if (typeof $spcontext.filesDictionary[property].files[y] === "string") {
        var splitedLinks = $spcontext.filesDictionary[property].files[y].split("/");
        var pos = splitedLinks.length - 1;
        displayName = splitedLinks[pos];
        var attachmentBlock = "<p id='" + elementBindProperty + "display" + y + "' style='color : #002c4d'><a href='" + $spcontext.filesDictionary[property].files[y] + "'>" + displayName + "<span><a style='color: red; cursor: pointer; padding-left: 5px' class='attachment-inline-delete' onclick='deleteRowAttachment(\"" + elementBindProperty + "\", " + y + ",\"" + elementId + "\")'>x</a></span></a></p>";
        $("div[speed-file-bind='" + elementBindProperty + "']").append(attachmentBlock);
      } else {
        var attachmentBlock = "<p id='" + elementBindProperty + "display" + y + "' style='color : #002c4d'>" + $spcontext.filesDictionary[property].files[y].dataName +
          "<span><a class='attachment-inline-delete' style='color: red; cursor: pointer; padding-left: 5px' onclick='deleteRowAttachment(\"" + elementBindProperty + "\", " + y + ",\"" + elementId + "\")'>x</a></span></p>";
        $("div[speed-file-bind='" + elementBindProperty + "']").append(attachmentBlock);
      }
    }
  }
}
