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
    isVendor: false,
    vendorStatus : "",
    vendorRequestID : "NA",
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

  this.configuredTaskMembers = {};
  this.isUserAnActor = false;



  this.NewRequestComponent = {};
  this.DashboardComponent = {};
  this.ApproveRequestComponent = {};
  this.ViewRequestComponent = {};

  this.CurrentPageSubmitFunction = null;

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
      var expectedDepenciesCount = 3;
      // speedctxRoot = new Speed();
      globalDefinitions = new GlobalDefinitionsManager();

      globalDefinitions.callLoader();
      
      globalDefinitions.stageDefinitions.workflowcode = "AUD-MGT-";
      globalDefinitions.stageDefinitions.workflow = "Audit Management";
      

      // speedctxRoot.errorHandler = globalDefinitions.errorHandler;
      // $spcontext.errorHandler = globalDefinitions.errorHandler;

      window.globalProp.getClientIP().then((response)=>{
        MainApplication.cachedState.ipaddress = response;
        checkAppDependency();
      }).catch((error)=>{
         console.log(error);
         checkAppDependency();
      })

      // MainApplication._ConfigurationSettings($spcontext, tempConfigProperties, function () {
      //       speedctxRoot = new Speed(tempConfigProperties.AUDITMANAGEMENTURL.setting);
      //       speedctxRoot.errorHandler = globalDefinitions.errorHandler;
      //       $spcontext.errorHandler = globalDefinitions.errorHandler;

      //       MainApplication._ConfigurationSettings(speedctxRoot, configPropertiesRoot, function () {
      //           checkAppDependency();
      //       });

      //   });
      // window.checkAppDependency = checkAppDependency;

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

        speedctxRoot = new Speed(configPropertiesRoot.AUDITMANAGEMENTURL.setting);
        speedctxRoot.errorHandler = globalDefinitions.errorHandler;
        $spcontext.errorHandler = globalDefinitions.errorHandler;

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

            $("#auditmanagementversion").text(configProperties.AUDMGTVERSION.setting);
            $("#versioneffectivedate").text(configProperties.VERSIONEFFECTIVEDATE.setting);
            $("#auditmanagementversionMobile").text(configProperties.AUDMGTVERSION.setting);
            $("#versioneffectivedateMobile").text(configProperties.VERSIONEFFECTIVEDATE.setting);

          });

        checkAppDependency();
      });


      function checkAppDependency() {
        dependenciesCount++;
        console.log("Number of dependecies: ", dependenciesCount);
        console.log("Dependencies expected: ", expectedDepenciesCount);
        if (dependenciesCount === expectedDepenciesCount) {
          globalDefinitions.AuditLogManager_SaveLog({
            Action: `Logged into/Opened Audit Management application`,
            Message: `user logged in to application at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`
          });
          $spcontext.errorHandler = globalDefinitions.errorHandler;
          MainApplication.cachedState.mode = true;
          MainApplication.cachedState.pageStateCall();
          globalDefinitions.closeLoader();
        }
      }
    },
    {
      clientPeoplePicker: true
    }
  );
}

// MainApplication._ConfigurationSettings = function (spParamsContext, configParameters, callback) {
//     spParamsContext.getItem("Configuration", $spcontext.camlBuilder(), function (configObjects) {
//         var restrictedCount = 0;
//         var listEnumerator = configObjects.getEnumerator();
//         while (listEnumerator.moveNext()) {
//             var settingType = listEnumerator.get_current().get_item("SettingType");
//             var configObj = {};
//             configObj.title = listEnumerator.get_current().get_item("Title");
//             configObj.setting = listEnumerator.get_current().get_item("Setting");
//             if (settingType == "Restricted") {
//                 configParameters.restrictedlinks.push(configObj);
//             } else {
//                 configParameters[configObj.title] = configObj;
//             }
//         }

//         $("#auditmanagementversion").text(configParameters.AUDMGTVERSION.setting);
//         $("#versioneffectivedate").text(configParameters.VERSIONEFFECTIVEDATE.setting);
//         $("#auditmanagementversionMobile").text(configParameters.AUDMGTVERSION.setting);
//         $("#versioneffectivedateMobile").text(configParameters.VERSIONEFFECTIVEDATE.setting);

//         speedctxRoot = new Speed(configParameters.AUDITMANAGEMENTURL.setting);
//         speedctxRoot.errorHandler = globalDefinitions.errorHandler;
//         $spcontext.errorHandler = globalDefinitions.errorHandler;

//         if (typeof callback == "function") {
//             callback();
//         }
//     });
// };

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
