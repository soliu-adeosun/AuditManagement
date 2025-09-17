var MainApplication = new MainStartPoint();
var customWorkflowEngine;
var CurrentUserProperties = {};
var configPropertiesRoot = {
  restrictedlinks: [],
};

var configProperties = {
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
  this.gamification = {};
  this.modules = {};
  this.staffDetails = {};
  this.staffList = [];
  this.jobroles = [];
  this.organogram = [];
  this.organogramData = {};
  this.curentUserGroupMemberships = [];
  this.profilephoto = `/_layouts/15/userphoto.aspx?size=M&accountname=`;
  this.profilephotoLarge = `/_layouts/15/userphoto.aspx?size=L&accountname=`;
  this.task_requestid = {
    task: 0,
    request: 0
  };
  this.erphistoryHandler = {};
  this.currency = {};
  this.cachedState = {
    mode: false,
    pageStateCall: null,
    isWorkflowActor: false,
    workflowActors: {},
    isAdmin: false,
    ipaddress: "",
    internetSpeed: 0
  };

  this.createComponentClass = function (link) {
    let component = {
      cached: false,
      link: link,
      NewRequest: {},
      Task: {},
      ApproveRequest: {},
      ViewRequest: {},
      Report: {},
    }

    return component;
  }

  this.workflowUsers = {};
  this.ListsComponent = {};
  this.NavigationComponent = {};
  this.ReportComponent = {};
  this.DashboardComponent = {};
  this.HomeComponent = {};
  this.MyWorkspaceComponent = {};
  this.ProfileComponent = {};
  this.AuditComponent = {};
  this.WorkflowsComponent = {
    AuditManagement: this.createComponentClass("#/")
  };
}

// object has to be defined so that we can use them to create functions for the workflow state call;
var AUDITMANAGEMENT = {};

function whenLayoutLoaded() {
  //load view port to enable page to be mobile responsive
  $("head").append(`<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">`);
  //============================================================================================
  $spcontext.loadSPDependencies(
    function () {

      //2 of these from security check
      var dependenciesCount = 0;
      var expectedDepenciesCount = 2; //chaneg back to 10 when api returns
      speedctxRoot = new Speed();
      globalDefinitions = new GlobalDefinitionsManager();

      globalDefinitions.callLoader();
      globalDefinitions.stageDefinitions.workflowcode = "AUDMGT-SYS";
      speedctxRoot.errorHandler = globalDefinitions.errorHandler;
      $spcontext.errorHandler = globalDefinitions.errorHandler;

      speedctxRoot.latencyHandler = globalDefinitions.latencyHandler;
      $spcontext.latencyHandler = globalDefinitions.latencyHandler;

      //call from tsx end
      window.checkAppDependency = checkAppDependency;
      window.showCriticalErrorModal = globalDefinitions.showCriticalErrorModal;

      //CurrentUserProperties = $spcontext.currentUserDetailsSync();
      $spcontext.currentUserDetails((user) => {
        CurrentUserProperties.isAdmin = user.get_isSiteAdmin();
        if (!user.get_isSiteAdmin()) {
          $("#spCommandBar").hide();
        }
        CurrentUserProperties.login = user.get_loginName();
        CurrentUserProperties.email = user.get_email();
        CurrentUserProperties.title = user.get_title();

        CurrentUserProperties.userfolder = CurrentUserProperties.email.replace(/\./g, "_");
        CurrentUserProperties.login = CurrentUserProperties.email;
        let name = CurrentUserProperties.title.split(" ");
        let initials = "";
        try {
          initials += name[0].charAt(0);
          initials += name[1].charAt(0);
        } catch (e) { }

        // $("#greeting").text(getGreeting());
        // $("#userinitials").text(initials);
        // $("#userinitials").attr("title", CurrentUserProperties.title);
        $("#currentusername").text(CurrentUserProperties.title);
        $("#currentuseremail").text(CurrentUserProperties.email);

        $("#currentuseravatar").attr("src", `${MainApplication.profilephoto}${CurrentUserProperties.email}`);

        checkAppDependency();
      });

      // setTimeout(function () {
      //   window.globalProp.getClientIP().then((response) => {
      //     MainApplication.cachedState.ipaddress = response;
      //     checkAppDependency();
      //   }).catch((error) => {
      //     console.log(error);
      //     checkAppDependency();
      //   })
      // }, $spcontext.latency);


      // speedctxRoot.allUserMembershipGroups((groups) => {
      //   var systemGroups = ["Approvers", "Designers", "Hierarchy Managers", "Quick Deploy Users", "Restricted Readers", "Style Resource Readers"]
      //   MainApplication.curentUserGroupMemberships = groups.filter(item => !systemGroups.includes(item));
      //   checkAppDependency();
      // });

      speedctxRoot.getItem("Configuration", $spcontext.camlBuilder(), function (configObjects) {
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

        // $("#companylogo").attr("src", configPropertiesRoot.COMPANYLOGO.setting);
        $("#auditmanagementversion").text(configPropertiesRoot.AUDMGTVERSION.setting);
        $("#versioneffectivedate").text(configPropertiesRoot.VERSIONEFFECTIVEDATE.setting);
        $("#auditmanagementversionMobile").text(configPropertiesRoot.AUDMGTVERSION.setting);
        $("#versioneffectivedateMobile").text(configPropertiesRoot.VERSIONEFFECTIVEDATE.setting);
        checkAppDependency();


        // speedctxRoot.isCurrentUserMemberOfGroup(configPropertiesRoot.ERPADMINISTRATOR.setting,
        //   function (isMember) {
        //     MainApplication.cachedState.isAdmin = isMember;
        //     if (!isMember) {
        //       $(".admin-nav").remove();
        //     }
        //   });
      });

      var basicQuery = [
        {
          ascending: "TRUE",
          orderby: "Title",
        },
      ];

      speedctxRoot.getItem("Message_Template", $spcontext.camlBuilder(basicQuery), function (_spMeta) {
        var listEnumerator = _spMeta.getEnumerator();
        while (listEnumerator.moveNext()) {
          var title = listEnumerator.get_current().get_item("Title");
          MainApplication.messageTemplate[title] = listEnumerator.get_current().get_item("Template");
        }
      });


      function checkAppDependency() {
        dependenciesCount++;
        if (dependenciesCount === expectedDepenciesCount) {
          globalDefinitions.closeLoader();
          MainApplication.cachedState.mode = true; //I put this here to fullfil it's purpose because there's a blocker at the AuditLog below :)
          globalDefinitions.AuditLogManager_SaveLog({
            Action: `Logged into/Opened Audit Management System`,
            Message: `user logged in to application at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`
          });
          // MainApplication.NavigationComponent.setupNavigation();
          $spcontext.errorHandler = globalDefinitions.errorHandler;
          // MainApplication.cachedState.mode = true;
          try {
            MainApplication.cachedState.pageStateCall();
          }
          catch (ex) {

          }

        }
      }
    }
  );
}


MainApplication.updateGamificationScore = function (score, callback) {
  if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[CurrentUserProperties.email];
    var dataForUpdate = {
      ID: staffDetails.ID,
      Score: (Number(staffDetails.Score) + Number(score))
    }

    speedctxRoot.updateItems([dataForUpdate], "StaffInformation", function () {
      MainApplication.staffDetails[CurrentUserProperties.email].Score = dataForUpdate.Score;
      if (typeof callback === "function") {
        callback();
      }
    });
  }
  else {
    callback();
  }
}

MainApplication.createERPMyRequests = function (data, callback, context) {
  var contextInUse = (typeof context !== "undefined") ? context : speedctxRoot;
  if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[CurrentUserProperties.email];
    MainApplication.erphistoryHandler.dependencies = 0;
    MainApplication.erphistoryHandler.expectedDependencies = 3;
    contextInUse.createItems([data.Request], "ERPMyRequestHistory", function () {
      MainApplication.erphistoryHandler.dependencies++;
      if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
        callback();
      }
    });

    var dereferenceRequest = $spcontext.deferenceObject(data.Request);
    delete dereferenceRequest.Email;
    if (Array.isArray(data.Task)) {
      var multiData = [];
      for (var x = 0; x < data.Task.length; x++) {
        var taskData = { ...dereferenceRequest, ...data.Task[x] };
        taskData.SLA_COUNT_UPDATED = "No";
        multiData.push(taskData);
      }

      contextInUse.createItems(multiData, "ERPTasks", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }
    else {
      var taskData = { ...dereferenceRequest, ...data.Task };
      taskData.SLA_COUNT_UPDATED = "No";
      contextInUse.createItems([taskData], "ERPTasks", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }


    staffDetails.MyItemsCount = Number(staffDetails.MyItemsCount) + 1;
    MainApplication.staffDetails[CurrentUserProperties.email].MyItemsCount = staffDetails.MyItemsCount;
    var score = (Number(staffDetails.Score) + Number(data.Gamification.Score));
    MainApplication.staffDetails[CurrentUserProperties.email].Score = score;
    speedctxRoot.updateItems([{ ID: staffDetails.ID, MyItemsCount: staffDetails.MyItemsCount, Score: score }], "StaffInformation", function () {
      MainApplication.erphistoryHandler.dependencies++;
      if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
        callback();
      }
    });

  }
}

MainApplication.createERPMyRequestsNoTask = function (data, callback, context) {
  var contextInUse = (typeof context !== "undefined") ? context : speedctxRoot;
  if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[CurrentUserProperties.email];
    MainApplication.erphistoryHandler.dependencies = 0;
    MainApplication.erphistoryHandler.expectedDependencies = 2;
    contextInUse.createItems([data.Request], "ERPMyRequestHistory", function () {
      MainApplication.erphistoryHandler.dependencies++;
      if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
        callback();
      }
    });

    staffDetails.MyItemsCount = Number(staffDetails.MyItemsCount) + 1;
    MainApplication.staffDetails[CurrentUserProperties.email].MyItemsCount = staffDetails.MyItemsCount;
    var score = (Number(staffDetails.Score) + Number(data.Gamification.Score));
    MainApplication.staffDetails[CurrentUserProperties.email].Score = score;
    speedctxRoot.updateItems([{ ID: staffDetails.ID, MyItemsCount: staffDetails.MyItemsCount, Score: score }], "StaffInformation", function () {
      MainApplication.erphistoryHandler.dependencies++;
      if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
        callback();
      }
    });

  }
}

MainApplication.createERPActionHistory = function (data, callback, context) {
  var contextInUse = (typeof context !== "undefined") ? context : speedctxRoot;
  if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[CurrentUserProperties.email];
    MainApplication.erphistoryHandler.dependencies = 0;
    MainApplication.erphistoryHandler.expectedDependencies = 2;

    contextInUse.createItems([data.Action], "ERPActionHistory", function () {
      MainApplication.erphistoryHandler.dependencies++;
      if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
        callback();
      }
    });


    if (!data.Gamification.NoUpdate || typeof data.Gamification.NoUpdate === "undefined") {
      MainApplication.erphistoryHandler.expectedDependencies++;
      staffDetails.MyResolvedCount = Number(staffDetails.MyResolvedCount) + 1;
      MainApplication.staffDetails[CurrentUserProperties.email].MyResolvedCount = staffDetails.MyResolvedCount;
      var score = (Number(staffDetails.Score) + Number(data.Gamification.Score));
      MainApplication.staffDetails[CurrentUserProperties.email].Score = score;
      speedctxRoot.updateItems([{ ID: staffDetails.ID, MyResolvedCount: staffDetails.MyResolvedCount, Score: score }], "StaffInformation", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }

    if (data.Task.Approval_Status === globalDefinitions.stageDefinitions.completed || data.Task.Approval_Status === globalDefinitions.stageDefinitions.decline) {
      MainApplication.erphistoryHandler.expectedDependencies++;
      contextInUse.deleteItem("ERPTasks", data.Task.ID, function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });

      contextInUse.updateItems([data.Request], "ERPMyRequestHistory", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }
    else {
      data.Task.SLA_COUNT_UPDATED = "No";
      contextInUse.updateItems([data.Task], "ERPTasks", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }

  }
}

MainApplication.rerouteERPActionHistory = function (data, callback, context) {
  var contextInUse = (typeof context !== "undefined") ? context : speedctxRoot;
  if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[CurrentUserProperties.email];

    MainApplication.erphistoryHandler.dependencies = 0;
    MainApplication.erphistoryHandler.expectedDependencies = 2;
    contextInUse.updateItems([data.Request], "ERPMyRequestHistory", function () {
      MainApplication.erphistoryHandler.dependencies++;
      if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
        callback();
      }
    });

    if (MainApplication.task_requestid.task === 0) {
      var taskData = { ...data.RequestInfo, ...data.Task };
      taskData.SLA_COUNT_UPDATED = "No";
      contextInUse.createItems([taskData], "ERPTasks", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }
    else {
      data.Task.SLA_COUNT_UPDATED = "No";
      contextInUse.updateItems([data.Task], "ERPTasks", function () {
        MainApplication.erphistoryHandler.dependencies++;
        if (MainApplication.erphistoryHandler.dependencies === MainApplication.erphistoryHandler.expectedDependencies && typeof callback === "function") {
          callback();
        }
      });
    }

  }
}

MainApplication.updateERPTask = function (data, callback, context) {
  var contextInUse = (typeof context !== "undefined") ? context : speedctxRoot;
  if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[CurrentUserProperties.email];
    data.SLA_COUNT_UPDATED = "No";
    contextInUse.updateItems([data], "ERPTasks", function () {
      if (typeof callback === "function") {
        callback();
      }
    });

  }
}

MainApplication.getERPRequest_Task_ID = function (RequestID, customQuery, callback, context) {
  var contextInUse = (typeof context !== "undefined") ? context : speedctxRoot;
  MainApplication.task_requestid.task = 0;
  MainApplication.task_requestid.request = 0;
  MainApplication.task_requestid.dependencies = 0;
  var taskQuery = [];
  var query = [
    {
      rowlimit: 1
    },
    {
      operator: 'Eq',
      field: 'WorkflowRequestID',
      type: 'Text',
      val: RequestID
    }
  ];

  taskQuery = $spcontext.deferenceObject(query);
  if (typeof customQuery !== "undefined") {
    for (var x = 0; x < customQuery.length; x++) {
      taskQuery.push(customQuery[x]);
    }
  }

  contextInUse.getItem("ERPMyRequestHistory", $spcontext.camlBuilder(query), function (_spMeta) {
    var listEnumerator = _spMeta.getEnumerator();
    while (listEnumerator.moveNext()) {
      var ID = listEnumerator.get_current().get_item("ID");
      MainApplication.task_requestid.request = ID;
    }
    MainApplication.task_requestid.dependencies++;
    if (MainApplication.task_requestid.dependencies === 2 && typeof callback === "function") {
      callback();
    }
  });

  contextInUse.getItem("ERPTasks", $spcontext.camlBuilder(taskQuery), function (_spMeta) {
    var listEnumerator = _spMeta.getEnumerator();
    while (listEnumerator.moveNext()) {
      var ID = listEnumerator.get_current().get_item("ID");
      MainApplication.task_requestid.task = ID;
    }

    MainApplication.task_requestid.dependencies++;
    if (MainApplication.task_requestid.dependencies === 2 && typeof callback === "function") {
      callback();
    }
  });
}

MainApplication.requestStatusIcon = function (data) {
  var str = "";
  if (data === globalDefinitions.stageDefinitions.pending) {
    str = `<div class="status_bar pending">
                <img src="${window.ERPIMAGES.pending}">
                <p>${data}</p>
              </div>`;
  }
  else if (data === globalDefinitions.stageDefinitions.completed) {
    str = `<div class="status_bar success">
                <img src="${window.ERPIMAGES.completed}">
                <p>${data}</p>
              </div>`;
  }
  else if (data === globalDefinitions.stageDefinitions.decline) {
    str = `<div class="status_bar error">
                <i class="fa-solid fa-circle-xmark" style="color: #f2074e;"></i>
                <p>${data}</p>
              </div>`;
  }
  else if (data === globalDefinitions.stageDefinitions.save) {
    str = `<div class="status_bar pending">
                <i class="fa-regular fa-floppy-disk"></i>
                <p>${data}</p>
              </div>`;
  }
  else {
    str = `<div class="status_bar success">
                <img src="${window.ERPIMAGES.completed}">
                <p>${data}</p>
              </div>`;
  }

  return str;
}

MainApplication.organogramCallSetup = function (count, completedCallback) {
  speedctxRoot.getItem(MainApplication.organogram[count].listname, $spcontext.camlBuilder(), function (_spMeta) {
    var listEnumerator = _spMeta.getEnumerator();
    while (listEnumerator.moveNext()) {
      var details = {};
      details.title = $spcontext.checkNull(listEnumerator.get_current().get_item("Title"));
      details.parent = "";
      try {
        details.parent = listEnumerator.get_current().get_item("Parent").get_lookupValue();
      }
      catch (e) { }

      details.head = "";
      try {
        details.head = listEnumerator.get_current().get_item("Head").get_email();
      }
      catch (e) { }

      MainApplication.organogramData[_spMeta.ListName].data.push(details);
    }

    count++;
    if (count === MainApplication.organogram.length) {
      completedCallback();
    }
    else {
      MainApplication.organogramCallSetup(count, completedCallback);
    }
  });
}

MainApplication.organogramFormSetup = function (blockToAppend, mode, domInsert) {
  for (var x = 0; x < MainApplication.organogram.length; x++) {
    if (mode === "input") {
      var id = `organogramtype${x}`;
      var optionData = `<option value="">Please select a ${MainApplication.organogram[x].title}</option>`;
      var onchangeTrigger = "";
      if (MainApplication.organogram[x].parent === "Root") {
        for (var y = 0; y < MainApplication.organogramData[MainApplication.organogram[x].listname].data.length; y++) {
          optionData += `<option>${MainApplication.organogramData[MainApplication.organogram[x].listname].data[y].title}</option>`;
        }
      }

      if (x < (MainApplication.organogram.length - 1)) {
        var nextPos = x + 1;
        onchangeTrigger = ` onchange="MainApplication.organogramChangeTrigger(this.value, '${MainApplication.organogram[nextPos].listname}', ${x})"`
      }

      var str = `<div class="col-12 col-lg-6">
                  <label>${MainApplication.organogram[x].title}<span class="required">*</span></label>
                  <select id="${id}" class="form-control" speed-bind-validate="${MainApplication.organogram[x].title}" ${onchangeTrigger}>
                    ${optionData}
                  </select>
                </div>`;

      if (domInsert === "before") {
        $(str).insertBefore(`#${blockToAppend}`);
      }
      else {
        $(`#${blockToAppend}`).append(str);
      }

    }
    else if (mode === "noattribute") {
      var str = `<div class="col-12 col-lg-6">
                  <label>${MainApplication.organogram[x].title}</label>
                  <input type="text" class="form-control" id="_${MainApplication.organogram[x].title}" readonly/>
                </div>`;
      if (domInsert === "before") {
        $(str).insertBefore(`#${blockToAppend}`);
      }
      else {
        $(`#${blockToAppend}`).append(str);
      }
    }
    else if (mode === "viewmodal") {
      var str = `<div class="d-flex justify-content-between mb-2">
                    <p>${MainApplication.organogram[x].title}</p>
                    <p id="_${MainApplication.organogram[x].title}"></p>
                </div>`;
      if (domInsert === "before") {
        $(str).insertBefore(`#${blockToAppend}`);
      }
      else {
        $(`#${blockToAppend}`).append(str);
      }
    }
    else {
      var str = `<div class="col-12 col-lg-6">
                  <label>${MainApplication.organogram[x].title}</label>
                  <input type="text" class="form-control" speed-bind="${MainApplication.organogram[x].title}" speed-bind-class="Organogram" readonly/>
                </div>`;
      if (domInsert === "before") {
        $(str).insertBefore(`#${blockToAppend}`);
      }
      else {
        $(`#${blockToAppend}`).append(str);
      }
    }
  }
}

MainApplication.organogramChangeTrigger = function (value, key, currentPos, bindValue) {
  var nextPos = currentPos + 1;
  var optionData = `<option>Please select a ${MainApplication.organogram[nextPos].title}</option>`;
  for (var x = 0; x < MainApplication.organogramData[key].data.length; x++) {
    if (MainApplication.organogramData[key].data[x].parent === value) {
      var selected = "";
      if (typeof bindValue !== "undefined") {
        if (bindValue === MainApplication.organogramData[key].data[x].title) {
          selected = "selected='selected'"
        }
      }
      optionData += `<option ${selected}>${MainApplication.organogramData[key].data[x].title}</option>`;
    }
  }

  $(`#organogramtype${nextPos}`).empty().append(optionData);
}

MainApplication.bookmarkApplication = function (props, callback) {
  var query = [
    {
      rowlimit: 1
    },
    {
      operator: 'Eq',
      field: 'Email',
      type: 'Text',
      val: CurrentUserProperties.email
    },
    {
      operator: 'Eq',
      field: 'Title',
      type: 'Text',
      val: props.Title
    }
  ];
  //TODO: update this later to the function that can by pass threshold
  speedctxRoot.getItem("BookmarkApps", $spcontext.camlBuilder(query), function (_spMeta) {
    var listEnumerator = _spMeta.getEnumerator();
    var itemExist = false;
    while (listEnumerator.moveNext()) {
      itemExist = true;
    }

    if (!itemExist) {
      speedctxRoot.createItems([props], "BookmarkApps", function () {
        if (typeof callback === "function") {
          callback();
        }
      });
    }
    else {
      callback();
    }
  });

}

MainApplication.confirmUserAvailablityOnErp = function () {

}

MainApplication.confirmUserStillInOrganization = function (email) {
  var passed = true;
  if (typeof MainApplication.staffDetails[(email.toLowerCase())] !== "undefined") {
    var userDetails = MainApplication.staffDetails[(email.toLowerCase())];
    if (userDetails.HasExit === "Yes") {
      passed = false;
    }
  }
  return passed;
}

MainApplication.viewEmployeeProfile = function (email) {
  if (typeof MainApplication.staffDetails[email] !== "undefined") {
    var staffDetails = MainApplication.staffDetails[email];
    $("#viewuserpicmodal").attr("src", `${MainApplication.profilephotoLarge}${email}`);
    $(`#_organogramviewmodal`).empty();
    MainApplication.organogramFormSetup("_organogramviewmodal", "viewmodal", "append");

    for (let key in staffDetails) {
      try {
        document.getElementById(`_${key}`).innerHTML = staffDetails[key];
      }
      catch (e) { }
    }

    for (let x = 0; x < MainApplication.organogram.length; x++) {
      document.getElementById(`_${MainApplication.organogram[x].title}`).innerHTML = staffDetails[MainApplication.organogram[x].title];
    }

    let supervisor = MainApplication.staffDetails[staffDetails.Supervisor];
    if (typeof supervisor !== "undefined") {
      document.getElementById("_Supervisor").innerHTML = supervisor.Title;
    }


    $("#employeeProfileModal").modal("show");
  }
}

MainApplication.viewItemInformation = function (context, title) {

  var query = [
    {
      rowlimit: 1
    },
    {
      operator: 'Eq',
      field: 'Title',
      type: 'Text',
      val: title
    }
  ];
  context.getItem("StocksDefinitions", $spcontext.camlBuilder(query), function (_spMeta) {
    var listEnumerator = _spMeta.getEnumerator();
    while (listEnumerator.moveNext()) {
      var Title = $spcontext.checkNull(listEnumerator.get_current().get_item("Title"));
      var Category = $spcontext.checkNull(listEnumerator.get_current().get_item("Category"));
      var Description = $spcontext.checkNull(listEnumerator.get_current().get_item("Description"));
      var UoM = $spcontext.checkNull(listEnumerator.get_current().get_item("UoM"));
      var images = $spcontext.JSONToObject(listEnumerator.get_current().get_item("AttachmentURL"), "object");

      $(`#Inv_Title`).text(Title);
      $(`#Inv_Category`).text(Category);
      $(`#Inv_Description`).text(Description);
      $(`#Inv_UoM`).text(UoM);
      if (!$.isEmptyObject(images)) {
        $("#itempicmodal").attr("src", images.StockImages[0]);
      }

    }
  });

  context.getItem("Store", $spcontext.camlBuilder(query), function (_spMeta) {
    var listEnumerator = _spMeta.getEnumerator();
    while (listEnumerator.moveNext()) {
      var Warehouse = $spcontext.checkNull(listEnumerator.get_current().get_item("Warehouse"));
      var CPPU = $spcontext.checkNull(listEnumerator.get_current().get_item("CostPricePerUnit"));
      var Currency = $spcontext.checkNull(listEnumerator.get_current().get_item("Currency"));
      var AvailableStock = $spcontext.checkNull(listEnumerator.get_current().get_item("AvailableStock"));
      $(`#Inv_Warehouse`).text(Warehouse);
      $(`#Inv_CPPU`).text((MainApplication.currency[Currency].symbol + $spcontext.numberWithCommas(CPPU)));
      $(`#Inv_AvailableStock`).text(AvailableStock);
    }
  });

  $("#storeitemModal").modal("show");
}

MainApplication.confirmAction = function () {
}

MainApplication.downloadFile = function (bytes, fileName) {
  // Create a Blob from the byte array
  const blob = new Blob([bytes], { type: "application/pdf" });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  // Trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

MainApplication.setupWorkflowActors = function (callback, specialLogin = {}, isSPFlow = true, userGroupManual = {}, groupcheck = true) {

  var SPUsers = {};
  //user set up is done here 
  if (typeof AppRequest.supervisorDetails !== "undefined") {
    SPUsers = {};
    SPUsers[globalDefinitions.stageDefinitions.supervisor] = {
      value: AppRequest.supervisorDetails.Title,
      email: AppRequest.supervisorDetails.Email,
    }
  }

  //user/group setup is done here
  //group set up is automatically done by the system
  customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(SPUsers, function (resolved) {
    if (typeof callback === "function") {
      callback();
    }
  }, specialLogin, isSPFlow, userGroupManual, groupcheck);
}

MainApplication.setupSupervisorForNewRequest = function (redirectlink) {
  if (MainApplication.staffDetails[CurrentUserProperties.email].Supervisor === "") {
    globalDefinitions.HandlerError(`You can not raise this process because you have no supervisor configured.
        please contact admin to update your record.`);
    $spcontext.redirect(redirectlink, false);
  }
  else {
    AppRequest.supervisorDetails = MainApplication.staffDetails[MainApplication.staffDetails[CurrentUserProperties.email].Supervisor];
    if (typeof AppRequest.supervisorDetails !== "undefined") {
      if (AppRequest.supervisorDetails.HasExit === "Yes") {
        globalDefinitions.HandlerError(`You can not raise this process because your supervisor configured has exited the organization.
                please contact admin to update your record.`);
        $spcontext.redirect(redirectlink, false);
      }
      else {
        if (AppRequest.supervisorDetails.OnLeave === "Yes") {
          AppRequest.supervisorDelegateDetails = MainApplication.staffDetails[AppRequest.supervisorDetails.Delegate];
          MainApplication.notyf.error(`Your supervisor ${AppRequest.supervisorDetails.Title} is 
                    currently on leave, the request will be forwarded to their delegate ${AppRequest.supervisorDelegateDetails.Title}`);
          AppRequest.supervisorDetails = AppRequest.supervisorDelegateDetails;
        }
      }
    }
  }

  try {
    customWorkflowEngine.updateStageByName({
      name: "Supervisor",
      username: AppRequest.supervisorDetails.Title,
      authenticationValue: AppRequest.supervisorDetails.Email,
      emails: [AppRequest.supervisorDetails.Email],
    });
  }
  catch (e) {
    console.log("seems supervisor update is initiated before workflow engine is initiated");
  }
}

MainApplication.configureListItemPermission = function (resource, initatorEmail, specialReadUsers) {
  var groupsAccess = [globalDefinitions.stageDefinitions.auditors];
  resource.groups.push({ role: SP.RoleType.reader, name: globalDefinitions.stageDefinitions.auditors });
  var groups = customWorkflowEngine.getAllGroupsInWorkflow();
  for (var x = 0; x < groups.length; x++) {
    resource.groups.push({ role: SP.RoleType.contributor, name: groups[x] });
    groupsAccess.push(groups[x]);
  }

  var users = customWorkflowEngine.getAllUsersInWorkflow();

  for (var x = 0; x < users.length; x++) {
    if (users[x].name === globalDefinitions.stageDefinitions.supervisor) {

      if (MainApplication.staffDetails[initatorEmail].Supervisor !== "") {
        var supervisorDetails = MainApplication.staffDetails[MainApplication.staffDetails[initatorEmail].Supervisor];
        if (supervisorDetails.OnLeave === "Yes") {
          resource.users.push({ role: SP.RoleType.contributor, login: supervisorDetails.Delegate });
          groupsAccess.push(supervisorDetails.Delegate);
        }
        else {
          resource.users.push({ role: SP.RoleType.contributor, login: MainApplication.staffDetails[initatorEmail].Supervisor });
          groupsAccess.push(MainApplication.staffDetails[initatorEmail].Supervisor);
        }
      }
    }

    if (users[x].name === globalDefinitions.stageDefinitions.concurrent) {
      if (MainApplication.staffDetails[initatorEmail].ConcurrentReviewer !== "") {
        resource.users.push({ role: SP.RoleType.contributor, login: MainApplication.staffDetails[initatorEmail].ConcurrentReviewer });
        groupsAccess.push(MainApplication.staffDetails[initatorEmail].ConcurrentReviewer);
      }
    }
  }

  if (Array.isArray(specialReadUsers)) {
    for (var y = 0; y < specialReadUsers.length; y++) {
      if (specialReadUsers[y].type.toLowerCase() === "user") {
        if ($.inArray(specialReadUsers[y].key, groupsAccess) < 0) {
          resource.users.push({ role: SP.RoleType.reader, login: specialReadUsers[y].key });
          groupsAccess.push(specialReadUsers[y].key);
        }
      }
      else if (specialReadUsers[y].type.toLowerCase() === "group") {
        if ($.inArray(specialReadUsers[y].key, groupsAccess) < 0) {
          resource.groups.push({ role: SP.RoleType.reader, name: specialReadUsers[y].key });
          groupsAccess.push(specialReadUsers[y].key);
        }
      }
    }
  }

  return resource;
}

MainApplication.configureProcessItemUserTaskPermission = function (listProperties) {
  if (listProperties.Current_Approver === globalDefinitions.stageDefinitions.supervisor) {

    customWorkflowEngine.updateStageByName({
      name: listProperties.Current_Approver,
      username: MainApplication.staffDetails[(listProperties.PendingUserLogin.toLowerCase())].Title,
      authenticationValue: listProperties.PendingUserLogin,
      emails: [listProperties.PendingUserLogin]
    });
  }

  if (listProperties.Current_Approver === globalDefinitions.stageDefinitions.concurrent) {
    customWorkflowEngine.updateStageByName({
      name: globalDefinitions.stageDefinitions.concurrent,
      username: MainApplication.staffDetails[(listProperties.PendingUserLogin.toLowerCase())].Title,
      authenticationValue: listProperties.PendingUserLogin,
      emails: [listProperties.PendingUserLogin]
    });
  }
}

MainApplication.configureProcessItemUserViewPermission = function (listProperties) {

  var users = customWorkflowEngine.getAllUsersInWorkflow();

  for (var x = 0; x < users.length; x++) {
    if (users[x].name === globalDefinitions.stageDefinitions.supervisor) {
      if (MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor].OnLeave === "Yes") {
        customWorkflowEngine.updateStageByName({
          name: globalDefinitions.stageDefinitions.supervisor,
          username: MainApplication.staffDetails[MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor].Delegate].Title,
          authenticationValue: MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor].Delegate,
          emails: [MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor].Delegate]
        });
      }
      else {
        customWorkflowEngine.updateStageByName({
          name: globalDefinitions.stageDefinitions.supervisor,
          username: MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor].Title,
          authenticationValue: MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor,
          emails: [MainApplication.staffDetails[listProperties.InitiatorEmailAddress].Supervisor]
        });
      }
    }

    if (users[x].name === globalDefinitions.stageDefinitions.concurrent) {
      if (MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer !== "") {
        if (MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer].OnLeave === "Yes") {
          customWorkflowEngine.updateStageByName({
            name: globalDefinitions.stageDefinitions.concurrent,
            username: MainApplication.staffDetails[MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer].Delegate].Title,
            authenticationValue: MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer].Delegate,
            emails: [MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer].Delegate]
          });
        }
        else {
          customWorkflowEngine.updateStageByName({
            name: globalDefinitions.stageDefinitions.concurrent,
            username: MainApplication.staffDetails[MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer].Title,
            authenticationValue: MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer,
            emails: [MainApplication.staffDetails[listProperties.InitiatorEmailAddress].ConcurrentReviewer]
          });
        }
      }
    }
  }



}

MainApplication.reportSyncSearch = function (keyquery, data) {
  if (!keyquery || keyquery.trim().length < 3) {
    return data;
  }

  keyquery = keyquery.trim().toLowerCase();

  return data.filter(item =>
    item.WorkflowRequestID?.toLowerCase().includes(keyquery) ||
    item.Title?.toLowerCase().includes(keyquery)
  );
};

MainApplication.globalSetupForPageLoaded = function () {
  globalDefinitions.scrollTop();
}

// MainApplication.getInternetDownloadSpeed = function () {
//   const fileSizeInBytes = 5 * 1024 * 1024; // 5MB
//   const startTime = performance.now();
//   speedctxRoot.getFileDataURIViaRest(configPropertiesRoot.INTERNETTESTFILEURL.setting, function (data) {
//     const endTime = performance.now();
//     const durationInSeconds = (endTime - startTime) / 1000;
//     const bitsLoaded = fileSizeInBytes * 8;
//     const speedBps = bitsLoaded / durationInSeconds;
//     const speedMbps = speedBps / (1024 * 1024);
//     MainApplication.cachedState.internetSpeed = speedMbps.toFixed(2);
//     console.log(`Internet Speed: ${speedMbps.toFixed(2)} Mbps`);
//   });
// }

MainApplication.InitializeRichText = function (elementId, textMode = false) {
  var noteOptions = [
    ['style', ['style']],
    ['font', ['bold', 'italic', 'underline', 'clear']],
    ['fontsize', ['fontsize']],
    ['color', ['color']],
    ['para', ['ul', 'ol', 'paragraph']],
    ['table', ['table']]
  ]
  if (!textMode) {
    noteOptions.push(['insert', ['link', 'picture']]);
    noteOptions.push(['view', ['fullscreen', 'codeview', 'help']]);
  }

  $(`#${elementId}`).summernote({
    tabsize: 2,
    height: 300,
    toolbar: noteOptions,
    callbacks: {
      onImageUpload: function (files) {
        for (let i = 0; i < files.length; i++) {
          var fileSize = files[i].size / 1000;
          if (fileSize < configPropertiesRoot.MAXFILESIZE.setting) {
            globalDefinitions.callLoader();
            speedctxRoot.uploadDirectFile(files[i], configPropertiesRoot.EDITORIMAGEURL.setting, function (fileUrl) {
              $(`#${elementId}`).summernote('insertImage', fileUrl.get_serverRelativeUrl());
              globalDefinitions.closeLoader();
            });
          }
          else {
            globalDefinitions.HandlerError(`the file uploaded exceeds the acceptable file size(${configPropertiesRoot.MAXFILESIZE.setting})`);
          }
        }
      }
    }
  });
}

MainApplication.updateConditions = function (requestInfo, specialObjects = {}) {
  routingGroups = customWorkflowEngine.routingGroups;
  for (var x = 0; x <= (routingGroups.length - 1); x++) {
    var possibleRoutes = routingGroups[x].possibleRoutes;
    for (var y = 0; y <= (possibleRoutes.length - 1); y++) {
      if (typeof possibleRoutes[y].name === "string") {
        var name = possibleRoutes[y].name.trim();
        for (var propName in requestInfo) {
          try {
            var stringToFind = "{{" + propName + "}}";
            var regex = new RegExp(stringToFind, "g");
            name = name.replace(regex, requestInfo[propName]);
          } catch (e) { }
        }

        for (var propName in specialObjects) {
          try {
            var stringToFind = "{{" + propName + "}}";
            var regex = new RegExp(stringToFind, "g");
            name = name.replace(regex, specialObjects[propName]);
          } catch (e) { }
        }

        routingGroups[x].possibleRoutes[y].name = name;
      }

      if (typeof possibleRoutes[y].condition === "string") {
        //"AND|STRING: {{COLUMN}},'sam' | NUMBER: {{COLUMN}} > 42"
        var condition = possibleRoutes[y].condition.trim();
        for (var propName in requestInfo) {
          try {
            var stringToFind = "{{" + propName + "}}";
            var regex = new RegExp(stringToFind, "g");
            condition = condition.replace(regex, requestInfo[propName]);
          } catch (e) { }
        }

        for (var propName in specialObjects) {
          try {
            var stringToFind = "{{" + propName + "}}";
            var regex = new RegExp(stringToFind, "g");
            condition = condition.replace(regex, specialObjects[propName]);
          } catch (e) { }
        }

        //try for supervisor
        var newsupervisorDetails = {};
        try {
          var supervisor = MainApplication.staffDetails[MainApplication.staffDetails[requestInfo.InitiatorEmailAddress].Supervisor];
          for (var propName in supervisor) {
            newsupervisorDetails[`Supervisor${propName}`] = supervisor[propName];
          }
        }
        catch (e) { }

        for (var propName in newsupervisorDetails) {
          try {
            var stringToFind = "{{" + propName + "}}";
            var regex = new RegExp(stringToFind, "g");
            condition = condition.replace(regex, newsupervisorDetails[propName]);
          } catch (e) { }
        }

        var subconditions = condition.split("|");
        var logic = subconditions[0];
        var booleanResults = [];
        for (var a = 1; a < subconditions.length; a++) {
          var condition = subconditions[a].trim();
          // Process each condition as needed
          var instructions = condition.split(":");
          if (instructions[0] === "STRING") {
            // Handle string condition
            var strForEvaluation = instructions[1].split(",");
            var value = math.equalText(strForEvaluation[0].trim().toLowerCase(), strForEvaluation[1].trim().toLowerCase());
            booleanResults.push(value);
          } else if (instructions[0] === "NUMBER") {
            // Handle number condition
            var value = math.evaluate(instructions[1].trim());
            booleanResults.push(value);
          }
        }

        var boolResult;
        for (var b = 0; b < booleanResults.length; b++) {

          if (logic === "AND") {
            boolResult = true;
            if (!booleanResults[b]) {
              boolResult = false;
              break;
            }
          }
          //OR Operator
          else {
            boolResult = false;
            if (booleanResults[b]) {
              boolResult = true;
              break;
            }
          }
        }

        routingGroups[x].possibleRoutes[y].condition = boolResult
        //return boolResult;
      }
    }
  }
}

MainApplication.attachmentFeedbackDisplay = function (elementName, listOfFiles, fileId) {
  $("div[speed-file-bind='" + elementName + "']").empty();

  if (listOfFiles.files.length !== 0) {
    for (var y = 0; y < listOfFiles.files.length; y++) {
      if (typeof listOfFiles.files[y] === "string") {
        var splitedLinks = listOfFiles.files[y].split("/");
        var pos = splitedLinks.length - 1;
        displayName = splitedLinks[pos];
        var attachmentBlock = "<p id='" + elementName + "display" + y + "' style='color : #002c4d'><a href='" + listOfFiles.files[y] + "'>" + displayName + "<span><a style='color: red; cursor: pointer; padding-left: 5px' class='attachment-inline-delete' onclick='MainApplication.WorkflowsComponent.FMS.SalesOrder.ApproveRequest.deleteRowAttachment(\"" + elementName + '", ' + y + ',"' + fileId + "\")'>x</a></span></a></p>";
        $("div[speed-file-bind='" + elementName + "']").append(attachmentBlock);
      } else {
        var attachmentBlock = "<p id='" + listOfFiles.files[y].property + "display" + y + "' style='color : #002c4d'>" + listOfFiles.files[y].dataName + "<span><a class='attachment-inline-delete' style='color: red; cursor: pointer; padding-left: 5px' onclick='MainApplication.WorkflowsComponent.FMS.SalesOrder.ApproveRequest.deleteRowAttachment(\"" + elementName + '", ' + y + ',"' + listOfFiles.files[y].id + "\")'>x</a></span></p>";
        $("div[speed-file-bind='" + listOfFiles.files[y].property + "']").append(attachmentBlock);
      }
    }
  }
}

MainApplication.deleteRowAttachment = function (elementBindProperty, index, elementId) {
  var customId = "#" + elementBindProperty + "display" + index;
  var property = document.getElementById(elementId).getAttribute("speed-file-validate");
  property = typeof property === "undefined" || property === null ? document.getElementById(elementId).getAttribute("speed-file-bind") : property;
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
        var attachmentBlock = "<p id='" + elementBindProperty + "display" + y + "' style='color : #002c4d'><a href='" + $spcontext.filesDictionary[property].files[y] + "'>" + displayName + "<span><a style='color: red; cursor: pointer; padding-left: 5px' class='attachment-inline-delete' onclick='MainApplication.WorkflowsComponent.FMS.ExpenseClaim.NewRequest.deleteRowAttachment(\"" + elementBindProperty + '", ' + y + ',"' + elementId + "\")'>x</a></span></a></p>";
        $("div[speed-file-bind='" + elementBindProperty + "']").append(attachmentBlock);
      } else {
        var attachmentBlock = "<p id='" + elementBindProperty + "display" + y + "' style='color : #002c4d'>" + $spcontext.filesDictionary[property].files[y].dataName + "<span><a class='attachment-inline-delete' style='color: red; cursor: pointer; padding-left: 5px' onclick='MainApplication.WorkflowsComponent.FMS.ExpenseClaim.NewRequest.deleteRowAttachment(\"" + elementBindProperty + '", ' + y + ',"' + elementId + "\")'>x</a></span></p>";
        $("div[speed-file-bind='" + elementBindProperty + "']").append(attachmentBlock);
      }
    }
  }
};

whenLayoutLoaded();