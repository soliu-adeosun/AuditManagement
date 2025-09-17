function loadAuditlogsDependencies() {
    if(MainApplication.cachedState.mode){
        whenAuditDependenciesLoaded();
    }
    else{
        MainApplication.cachedState.pageStateCall = loadAuditlogsDependencies;
    }
}

MainApplication.AuditComponent = {};
function whenAuditDependenciesLoaded(){
    MainApplication.globalSetupForPageLoaded();
    MainApplication.AuditComponent.currentLogUrl = "";

    let searchTimeout; // Timeout variable for debouncing
        
    $("#auditlogSearch").on("input", function () {
        clearTimeout(searchTimeout);

        let searchQuery = $(this).val().trim().toLowerCase();

        if (searchQuery.length === 0) {
            MainApplication.AuditComponent.getLogs(MainApplication.AuditComponent.currentLogUrl, "");
            return;
        }


        if (searchQuery.length < 3) {
            return;
        }

        searchTimeout = setTimeout(() => {
            MainApplication.AuditComponent.getLogs(MainApplication.AuditComponent.currentLogUrl);
        }, 300);
    });

    MainApplication.AuditComponent.Logs = [];

    $spcontext.assignAttributes();
    $spcontext.DataForTable.tablecontentId = "speed-data-table";
    $spcontext.DataForTable.pagesize = 50;
    $spcontext.DataForTable.paginateSize = 5;
    $spcontext.DataForTable.modifyTR = false;
    $spcontext.DataForTable.paginationbId = "btmpagination";
    //set context is complusory
    $spcontext.DataForTable.context = $spcontext;

    $spcontext.DataForTable.propertiesHandler = {
        "Created": function (valueToEva) {
            return (typeof valueToEva.Created === "undefined") ? $spcontext.stringnifyDate({ includeTime : true}) : valueToEva.Created;
        }
    };

    if(MainApplication.cachedState.isAdmin || MainApplication.cachedState.isAuditor){
        MainApplication.AuditComponent.getAllLogs();
    }
    else{
        var errormsg = "You are not authorized to access this resource";
        $("#criticalerrortext").text(errormsg);
        $("#criticalModal").modal("show");
        globalDefinitions.AuditLogManager_SaveLog({
            Action : `Unauthorized action to view Audit log`,
            Message : errormsg
        });
        $spcontext.redirect("#/", false);
    }
}

MainApplication.AuditComponent.getAllLogs = function(){
    globalDefinitions.callLoader();
    var query = [{
        orderby: "ID",
        ascending: "FALSE"
    }];

    $spcontext.getItem("AuditLogs", $spcontext.camlBuilder(query), function (_spMeta) {
        var listEnumerator = _spMeta.getEnumerator();
        var count = 0;
        
        while (listEnumerator.moveNext()) {
            count++;
            var itemDetails = {};
            itemDetails.name = listEnumerator.get_current().get_item('FileLeafRef');
            itemDetails.url = listEnumerator.get_current().get_item('FileRef');
            itemDetails.size = listEnumerator.get_current().get_item('File_x0020_Size');
            
            itemDetails.name = itemDetails.name.split('_')[0];

            MainApplication.AuditComponent.Logs.push(itemDetails);

            if (count == 1) {
                MainApplication.AuditComponent.getLogs(itemDetails.url);
            }

            $("#v-pills-tab").append(
                `<div>
                    <button 
                        class="nav-link active log-btn" data-url="${itemDetails.url}" 
                        id="v-pills-home-tab" data-bs-toggle="pill" data-bs-target="#v-pills-home" 
                        type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">
                        <div class="log-date-menu">
                            <img src="${window.ERPIMAGES.logfileicon}" />
                            <p>${itemDetails.name}</p>
                        </div>
                    </button>
                </div>`
            );
        }
    });
};

$(document).on("click", ".log-btn", function() {
    var fileUrl = $(this).attr("data-url");
    MainApplication.AuditComponent.getLogs(fileUrl);
});


MainApplication.AuditComponent.getLogs = function(url) {
    MainApplication.AuditComponent.currentLogUrl = url;

    // globalDefinitions.callLoader();
    
    $spcontext.readFile(url, function(data) {
        var tableData = data.split(/\r?\n/).filter(line => line.trim() !== "").map(line => {
            try {
                return JSON.parse(line);
            } catch (e) {
                console.error("Error parsing line:", line, e);
                return null;
            }
        }).filter(item => item !== null);

        tableData.reverse();
        var searchQuery = $("#auditlogSearch").val().trim().toLowerCase();

        if (searchQuery.length >= 3) {
            tableData = tableData.filter(data =>
                data.Title?.toLowerCase().includes(searchQuery) ||
                data.Email?.toLowerCase().includes(searchQuery) ||
                data.Action?.toLowerCase().includes(searchQuery) ||
                data.IPAddress?.includes(searchQuery)
            );
        }

        MainApplication.AuditComponent.showTableData(tableData);
    });
};




MainApplication.AuditComponent.showTableData = function(data){
    if (data.length == 0) {
        $("#datatableview").hide();
        $('#norequest').show();
    } else {
        $("#datatableview").show();
        $('#norequest').hide();
    }
    $spcontext.manualTable(data);
    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000)
    
}