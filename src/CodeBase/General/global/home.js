function loadHomeComponent() {
    if (MainApplication.cachedState.mode) {
        whenHomeDependeciesLoaded();
    } else {
        MainApplication.cachedState.pageStateCall = whenHomeDependeciesLoaded;
    }
}

function whenHomeDependeciesLoaded() {
    MainApplication.globalSetupForPageLoaded();
    globalDefinitions.callLoader();

    MainApplication.HomeComponent.context = new Speed();
    MainApplication.HomeComponent.context.DataForTable.tablecontentId = "tasklist";
    MainApplication.HomeComponent.context.DataForTable.pagesize = 5;
    MainApplication.HomeComponent.context.DataForTable.paginateSize = 5;
    MainApplication.HomeComponent.context.DataForTable.modifyTR = false;
    //set context is complusory
    MainApplication.HomeComponent.context.DataForTable.context = MainApplication.HomeComponent.context;
    MainApplication.HomeComponent.context.DataForTable.paginationbId = "btmpagination";
    MainApplication.HomeComponent.context.DataForTable.paginationuId = "toppagination";
    MainApplication.HomeComponent.context.DataForTable.propertiesHandler = {
        "Created": function (valueToEva) {
            return $spcontext.stringnifyDate({
                value: valueToEva.Created,
                includeTime: true
            });
        },
        "RequestOwner": function (valueToEva) {
            return MainApplication.staffDetails[valueToEva.RequestOwner].Title;
        },
        "Modified": function (valueToEva) {
            var icon = "";
            var str = "";
            icon = `<i class="fa-solid fa-pen-to-square"></i>`;
                str = `<div class="pointer">
                            <a href="${MainApplication.WorkflowsComponent[valueToEva.Module][valueToEva.Workflow].link}/approverequest?itemId=${valueToEva.WorkflowRequestID}">
                                ${icon}
                            </a>
                        </div>`;

            return str;
        }
    };


    if (typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined") {
        $("#homeavatar").append(`<img src="${MainApplication.profilephoto}${CurrentUserProperties.email}" alt="Current person"/>`);
        $("#scorelabel").text(MainApplication.staffDetails[CurrentUserProperties.email].Score);
        $("#myrequestlabel").text(MainApplication.staffDetails[CurrentUserProperties.email].MyItemsCount);
        $("#resolvedlabel").text(MainApplication.staffDetails[CurrentUserProperties.email].MyResolvedCount);
        MainApplication.HomeComponent.getMyTask();
        MainApplication.HomeComponent.getMyLeave();
    }
    else {
        globalDefinitions.HandlerError("User not found in the system");
    }

    // $spcontext.getItem("BannerLinks", $spcontext.camlBuilder(), function (items) {
    //     var listEnumerator = items.getEnumerator();
    //     $("#banner").empty();
    //     var count = 0;
    //     while (listEnumerator.moveNext()) {
    //         var title = $spcontext.checkNull(listEnumerator.get_current().get_item("Title"));
    //         var imgLink = listEnumerator.get_current().get_item("BannerImage").get_url();
    //         var description = listEnumerator.get_current().get_item("Body");

    //         $("#banner").attr("src",`${imgLink}`);
    //         // description = $spcontext.checkNull(description);
    //         // var active = (count === 0) ? "active" : "";
    //         // var aria = (count === 0) ? "aria-current='true'" : ""
            
    //         // count++;
    //         // var previous = count - 1;
    //         // // var str = `<div class="item">
    //         // //          <img src=${imgLink.Title} class="img-fluid banner-img" />
    //         // //       </div>`;
    //         // var indicator = `<button
    //         //                     type="button"
    //         //                     data-bs-target="#carouselExampleIndicators"
    //         //                     data-bs-slide-to="${previous}"
    //         //                     aria-label="Slide ${count}"
    //         //                     class="${active}" 
    //         //                     ${aria}
    //         //                 />`;
    //         // $("#bannerindicator").append(indicator);

    //         // var caption = "";
    //         // if(title !== "" || description !== ""){
    //         //     caption = `<div class="carousel-caption d-none d-md-block">
    //         //                         <h1>${title}</h1>
    //         //                         <p>${description}</p>
    //         //                     </div>`;
    //         // }
    //         // var str = `<div class="carousel-item ${active}">
    //         //                     <img
    //         //                         src="${imgLink}"
    //         //                         class="d-block w-100 banner-img"
    //         //                         alt="..."
    //         //                         data-themekey="#"
    //         //                     />
    //         //                     ${caption}
    //         //                 </div>`

    //         //$("#banner").append(str);
    //     }
    // });

    var query = [
        {
            rowlimit : 10,
            orderby : "ID",
            ascending : "FALSE"
        }
    ]
    $spcontext.getItem("Announcements", $spcontext.camlBuilder(query), function (items) {
        var listEnumerator = items.getEnumerator();
        $("#announcement").empty();
        var count = 0;
        while (listEnumerator.moveNext()) {
            count++;
            var title = listEnumerator.get_current().get_item("Title");
            var str = `<div class="item">
                            <div class="announcement-header">
                                <div class="announcement-icon">📢</div>
                                <div>
                                    <div class="points-title">Announcement</div>
                                    <div class="points-subtitle">Here are the latest</div>
                                </div>
                            </div>
                            <div class="announcement-content">${title}</div>
                        </div>`;

            $("#announcement").append(str);
        }

        if(count > 0){
            $('#announcement').owlCarousel({
                items: 1,
                loop: true,
                autoplay: true,
            });
        }
    });


    var staffDetails = MainApplication.staffDetails;

    const getTop3Score = (obj, key) => {
        return Object.entries(obj) // Convert object to array of [key, value] pairs
            .sort(([, a], [, b]) => b[key] - a[key]) // Sort by the given key in descending order
            .slice(0, 5) // Take the top 3 elements
            .map(([id, value]) => ({ id, ...value })); // Convert back to object format
    };

    const top3 = getTop3Score(staffDetails, "Score");

    for (let i = 0; i < top3.length; i++) {
        try {
            var first = "";
            if(i == 0){
                first = `<span class="trophy-icon">🏆</span>`;
            }
            var str = `<li class="leaderboard-item">
                            <div class="leaderboard-person">
                                <div class="leaderboard-avatar">
                                    <img src="${MainApplication.profilephoto}${top3[i].Email}" alt="face"/>
                                </div>
                                <div class="leaderboard-name">
                                    ${top3[i].Title} ${first}
                                </div>
                            </div>
                            <div class="leaderboard-position">${top3[i].Score}pts</div>
                        </li>` 

            $("#rankItems").append(str);
        } catch (e) { }
    };

    var todaysDate = $spcontext.stringnifyDate({ dateDefinitions: true });
    var todaysBirthday = [];

    for (var user in MainApplication.staffDetails) {

        var month = MainApplication.staffDetails[user].MonthOfBirth;
        var day = MainApplication.staffDetails[user].DayOfBirth;

        if (Number(todaysDate.day) === day && Number(todaysDate.month) === month) {
            todaysBirthday.push(MainApplication.staffDetails[user]);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];

    $("#birthdays").empty();
    //var count = 0;
    var str = "";
    $("#totalbirthdays").text(todaysBirthday.length);
    
    for(var x = 0; x < todaysBirthday.length; x++){
        var monthNo = Number(todaysBirthday[x].MonthOfBirth);
        monthNo = monthNo - 1;
        var monthstr = months[monthNo];
        
        str += `<div class="item">
                    <div class="birthday-person">
                        <div class="birthday-avatar">
                            <img src="${MainApplication.profilephoto}${todaysBirthday[x].Email}" alt="Birthday person"/>
                        </div>
                        <div class="birthday-info">
                            <div class="birthday-name">${todaysBirthday[x].Title}</div>
                            <div class="birthday-department">${todaysBirthday[x].JobRole}</div>
                            <div class="birthday-date">${monthstr} ${todaysBirthday[x].DayOfBirth}</div>
                        </div>
                    </div>
                    <button class="send-wishes" type="button" onclick="MainApplication.HomeComponent.sendBirthdayWish('${MainApplication.profilephoto}${todaysBirthday[x].Email}')">Send wishes 🎁</button>
                </div>`
    }

    $("#birthdays").append(str);

    if(todaysBirthday.length > 0){
        $('#birthdays').owlCarousel({
            items: 1,
            loop: true,
        });
    }
}

MainApplication.HomeComponent.sendBirthdayWish = function (email) {
    var embedded = `https://teams.microsoft.com/l/chat/0/0?users=${email}&message=Happy Birthday!`;
    window.open(embedded, "_blank");
}

MainApplication.HomeComponent.getMyTask = function () {
    globalDefinitions.callLoader();
    var queryCaml = [
        {
            //rowlimit : 5,
            ascending: "TRUE",
            orderby: "Created",
            viewScope: "RecursiveAll"
        },
        {
            evaluator: "Or",
            operator: 'Eq',
            field: 'PendingUserLogin',
            type: 'Text',
            val: CurrentUserProperties.email
        }
    ];

    for (var x = 0; x < MainApplication.curentUserGroupMemberships.length; x++) {
        queryCaml.push({
            evaluator: "Or",
            operator: 'Eq',
            field: 'PendingUserLogin',
            type: 'Text',
            val: MainApplication.curentUserGroupMemberships[x]
        });
    }

    queryCaml.push({
        //evaluator: "Or",
        operator: 'Eq',
        field: 'ReturnForCorrection',
        type: 'Text',
        val: "Yes"
    });
    //return for correction is yes and then show for that department the person belongs to 
    queryCaml.push({
        operator: 'Eq',
        field: 'RequestOwner',
        type: 'Text',
        val: CurrentUserProperties.email
    });

    var extraProperties = {
        ignoreThreshold: false,
        merge: false,
        data: ["ID", "Title", "WorkflowRequestID", "WorkflowName", "RequestOwner", "ResourceCreated", "Module", "Workflow"]
    };

    speedctxRoot.getListToItems("ERPTasks", queryCaml, extraProperties, true, 
        function(item){
            try{
                item.Link = `${MainApplication.WorkflowsComponent[item.Module][item.Workflow].link}/approverequest?itemId=${item.WorkflowRequestID}`
            }
            catch(e){
                item.Link = "#";
            }

            item.ResourceCreated = $spcontext.stringnifyDate({ value : item.ResourceCreated, includeTime : true });
            return item;
        },
        function (items) {
            MainApplication.HomeComponent.mytask = items;
            $("#tasklabel").text(items.length);
            if(items.length > 0){
                var str =  `<li class="pending-item">
                                <div class="pending-item-name">{{Title}}</div>
                                <div class="pending-item-creator">{{ResourceCreated}}</div>
                                <div class="download-icon">
                                    <a href="{{Link}}">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </a>
                                </div>
                            </li>`;
                MainApplication.HomeComponent.context.customElementPagination(items, str);
            }
            else{
                var str = `<li class="pending-item">
                                <div class="pending-item-name">You have no pending task at the moment</div>
                                <div class="pending-item-creator"></div>
                                <div class="download-icon">
                                    
                                </div>
                            </li>`;
                $("#tasklist").append(str);
            }
            globalDefinitions.closeLoader();
        });
}

MainApplication.HomeComponent.getMyLeave = function(){
    var queryCaml = [
        {
          ascending: "FALSE",
          orderby: "Modified",
          viewScope: "RecursiveAll",
        },
        {
          operator: "Eq",
          field: "InitiatorLogin",
          type: "Text",
          val: CurrentUserProperties.email
        },
        {
            operator: "Eq",
            field: "Approval_Status",
            type: "Text",
            val: "Completed"
        },
        {
            operator: "Eq",
            field: "Year",
            type: "Text",
            val: $spcontext.serverDate().getFullYear()
        },
      ];
      var queryStr = $spcontext.camlBuilder(queryCaml);
      var extraProperties = {
        merge: false,
        data: ["RequestedDays"],
      };

      var leaveContext = new Speed(configPropertiesRoot.LEAVEURL.setting);
    
      leaveContext.getListToItems("LeaveRequests", queryStr, extraProperties, true, null, function (items) {
        var totalRequestedDays = 0;
        for(var x = 0; x < items.length; x++){
            totalRequestedDays += items[x].RequestedDays;
        }

        $("#noofdaystaken").text(totalRequestedDays);
        var percent = 0;
        if(typeof MainApplication.staffDetails[CurrentUserProperties.email] !== "undefined" && totalRequestedDays !== 0){
            percent = (totalRequestedDays * 100)/MainApplication.staffDetails[CurrentUserProperties.email].EntitledLeaveDays;
        }
        
        $("#leavepercent").text(percent);
        $("#leaveprogress").css("width",`${percent}%`);
      });


}