var Installer = new ApplicationInstaller();
function ApplicationInstaller () {
    this.SiteLists = {};
    this.totalSiteListCalls = 0;
    this.completedCalls = 0;

    this.migrationData = {};
    this.everyOneExtExternal = "";
    this.siteCtx;
    this.totalList = 0;
    this.totalListCreated = 0;
    this.totalListDataCreated = 0;
}

function loadInstallerDependencies(){
    $spcontext.loadSPDependencies(function () {
        document.getElementById('attachments').addEventListener('change', Installer.handleFileSelect, false);
        $("#migrationtype").on("change", Installer.showInstallationType);
    });
}

ApplicationInstaller.prototype.runMigrationDownload = function(){
    Installer.SiteLists = {};
    var siteToInstall = $("#siteurl").val();
    if(siteToInstall !== ""){
        $("#loaderModal").modal("show");
        Installer.siteCtx = new Speed(siteToInstall);
        Installer.siteCtx.getAllListInSite(function(allList){
            var oEnumerator = allList.getEnumerator();
            while (oEnumerator.moveNext()) {
                var oList = oEnumerator.get_current();
                if(!oList.get_hidden() && oList.get_baseType() == SP.BaseType.genericList){
                    if(oList.get_title() !== "Workflow Tasks" && oList.get_title() != "Content and Structure Reports" && oList.get_title() != "Reusable Content"){
                        var sitelist = oList.get_title();
                        Installer.SiteLists[sitelist] = {
                            name : sitelist,
                            columnsMetaData: [],
                            systemColumn : ["Title"],
                            columns: [],
                            data: []
                        }
                        Installer.totalSiteListCalls++;
                    }
                }
            }
        
            for(var listsDef in Installer.SiteLists){
                Installer.siteCtx.getColumnsInList(listsDef,function(listFields, listnameForColumn){
                    var oEnumerator = listFields.getEnumerator();
                
                    while (oEnumerator.moveNext()) {
                        var oField = oEnumerator.get_current();
                        var title = oField.get_title();
                        var metaData = Installer.siteCtx.xmlToJson($.parseXML(oField.get_schemaXml())).Field;
                        var attributes = metaData["@attributes"];
                        var source = attributes.SourceID;
                        var passed = Installer.siteCtx.validationProperties.text.extend.URL(source.toString());
                        if(!passed){
                            Installer.SiteLists[listnameForColumn].columns.push(title);
                            var SPElementProperties = {};
                            SPElementProperties.fieldOptions = SP.AddFieldOptions.defaultValue;
                            SPElementProperties.addToDefault = true;
                            SPElementProperties.fieldType = attributes.Type;
                            if(attributes.Type == "Text"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Text\" />";
                            }
                            else if(attributes.Type == "Note"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Note\" RichText=\"FALSE\" />";
                            }
        
                            else if(attributes.Type == "DateTime"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"DateTime\" />";
                            }

                            else if(attributes.Type == "Number"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Number\" />";
                            }
        
                            else if(attributes.Type == "Choice"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Choice\" />";
                                var choicesData = metaData.CHOICES.CHOICE;
                                var choiceArr = [];
                                for(var x = 0; x < choicesData.length; x++){
                                    choiceArr.push(choicesData[x]["#text"]);
                                }
                                SPElementProperties.choices = choiceArr;
                            }
                            else if(attributes.Type == "User" || attributes.Type == "UserMulti"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"User\" />";
                            }
                            else if(attributes.Type == "URL"){
                                SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"URL\" />";
                            }

        
                            Installer.SiteLists[listnameForColumn].columnsMetaData.push(SPElementProperties);
                        }
                    }
                
                    //now reterive Data 
                    var query = [{
                        ascending: "TRUE",
                        orderby: "ID",
                        viewScope: "RecursiveAll"
                    },
                    {
                        operator: 'Neq',
                        field: 'FSObjType',
                        type: 'Lookup',
                        val: 1
                    },
                ];
                    Installer.siteCtx.getListToItems(listnameForColumn,Installer.siteCtx.camlBuilder(query),{
                        merge: false,
                        data: (Installer.SiteLists[listnameForColumn].systemColumn.concat(Installer.SiteLists[listnameForColumn].columns))
                    },false,function(listItem){
                        for(var item in listItem){
                            if(listItem[item] !== ""){
                                var SPFieldType;
                                var nopropinJSEngine = false;
                                try {
                                    SPFieldType = listItem[item].__proto__.constructor.__typeName.toLowerCase();
                                } catch (ex) {
                                    try {
                                        nopropinJSEngine = true;
                                        SPFieldType = $.type(listItem[item]);
                                    } catch (ex) {
                                        SPFieldType = "string";
                                    }
                                }

                                if (SPFieldType.toLowerCase() === "sp.fielduservalue" || SPFieldType.toLowerCase() === "sp.fieldlookupvalue" || (nopropinJSEngine && SPFieldType.toLowerCase() === "object")) {
                                    var objProp = {};
                                    objProp.id = $spcontext.checkNull(listItem[item].get_lookupId());
                                    objProp.value = SpeedContext.checkNull(listItem[item].get_lookupValue());
                                    if (SPFieldType.toLowerCase() === "sp.fielduservalue" || (nopropinJSEngine && SPFieldType.toLowerCase() === "object")) {
                                        try {
                                            objProp.email = SpeedContext.checkNull(listItem[item].get_email());
                                        } catch (e) {
                                            objProp.email = "";
                                        };
                                    }
                                }

                                else if (SPFieldType.toLowerCase() === "sp.fieldurlvalue"){
                                    listItem[item] = listItem[item].get_url();
                                }

                                else if (SPFieldType.toLowerCase() === "date"){
                                    listItem[item] = $spcontext.stringnifyDate({ value : listItem[item], format : "yy-mm-dd" });
                                }
                            }
                            else{
                                listItem[item] = null;
                            }
                            
                        }
                        return listItem;
                    },function(items,listnameForItems){
                        Installer.SiteLists[listnameForItems].data = items;
                        
                        Installer.DownloadManager();
                    });
                });
            }
        });
    }
    else{
        alert("You must put the relative url of a site .....")
    }
}

ApplicationInstaller.prototype.DownloadManager = function(){
    Installer.completedCalls++
    if(Installer.totalSiteListCalls == Installer.completedCalls){
        console.log("calls completed....");
        Installer.download("siteData.json", JSON.stringify(Installer.SiteLists));
        $("#loaderModal").modal("hide");
        $("#successModal").modal("show");
    }
}

ApplicationInstaller.prototype.download = function(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

ApplicationInstaller.prototype.runMigrationInstallation = function(){
    
    var siteToInstall = $("#siteurl").val();
    if(siteToInstall !== ""){
        $("#loaderModal").modal("show");
        Installer.siteCtx = new Speed(siteToInstall);
        Installer.everyOneExtExternal = $("#everyoneID").val();;
        for(var lists in Installer.migrationData){
            Installer.siteCtx.createList({
                title: lists,
                description: "",
                templateType: SP.ListTemplateType.genericList,
                users: [
                    {role : SP.RoleType.reader, login : Installer.everyOneExtExternal}
                ]
            },function(listCreated){
                var columns = Installer.migrationData[listCreated].columnsMetaData;
                if(columns.length > 0 ){
                    for(var x = 0; x < columns.length; x++){

                        if(columns[x].fieldType == "Text"){
                            columns[x].fieldType = SP.FieldText;
                        }
                        else if(columns[x].fieldType == "Note"){
                            columns[x].fieldType = SP.FieldMultiLineText;
                        }
    
                        else if(columns[x].fieldType == "DateTime"){
                            columns[x].fieldType = SP.FieldDateTime;
                        }

                        else if(columns[x].fieldType == "Number"){
                            columns[x].fieldType = SP.FieldNumber;
                        }
    
                        else if(columns[x].fieldType == "Choice"){
                            var choiceArr = columns[x].choices;
                            columns[x].fieldType = SP.FieldChoice;
                            columns[x].properties = function(field){
                                field.set_choices(choiceArr);
                            }
                        }
                        else if(columns[x].fieldType == "User" || columns[x].fieldType == "UserMulti"){
                            columns[x].fieldType = SP.FieldUser;
                        }
                        else if(columns[x].fieldType == "Lookup"){
                            columns[x].fieldType = SP.FieldText;
                            columns[x].columnField = "<Field DisplayName=\""+ Installer.migrationData[listCreated].columns[x] +"\" Type=\"Text\" />"; 
                        }
                        else if(columns[x].fieldType == "URL"){
                            columns[x].fieldType = SP.FieldUrl;
                        }
                    }

                    Installer.siteCtx.createColumnInList(columns,listCreated,function(){
                        Installer.installManager();
                    },function(){
                        console.log("failed to create columns...");
                        Installer.installManager();
                    });
                }
                else{
                    Installer.installManager();
                }
            },function(sender,args,properties){
                var columns = Installer.migrationData[properties.resource].columnsMetaData;
                if(columns.length > 0 ){
                    for(var x = 0; x < columns.length; x++){

                        if(columns[x].fieldType == "Text"){
                            columns[x].fieldType = SP.FieldText;
                        }
                        else if(columns[x].fieldType == "Note"){
                            columns[x].fieldType = SP.FieldMultiLineText;
                        }
    
                        else if(columns[x].fieldType == "DateTime"){
                            columns[x].fieldType = SP.FieldDateTime;
                        }

                        else if(columns[x].fieldType == "Number"){
                            columns[x].fieldType = SP.FieldNumber;
                        }
    
                        else if(columns[x].fieldType == "Choice"){
                            var choiceArr = columns[x].choices;
                            columns[x].fieldType = SP.FieldChoice;
                            columns[x].properties = function(field){
                                field.set_choices(choiceArr);
                            }
                        }
                        else if(columns[x].fieldType == "User" || columns[x].fieldType == "UserMulti"){
                            columns[x].fieldType = SP.FieldUser;
                        }

                        else if(columns[x].fieldType == "Lookup"){
                            columns[x].fieldType = SP.FieldText;
                            columns[x].columnField = "<Field DisplayName=\""+ Installer.migrationData[listCreated].columns[x] +"\" Type=\"Text\" />"; 
                        }
                        else if(columns[x].fieldType == "URL"){
                            columns[x].fieldType = SP.FieldUrl;
                        }
                    }

                    Installer.siteCtx.createColumnInList(columns,properties.resource,function(){
                        Installer.installManager();
                    },function(){
                        console.log("failed to create columns...");
                        Installer.installManager();
                    });
                }
                else{
                    Installer.installManager();
                }
            })
        }
    }
    else{
        alert("You must put the relative url of a site .....")
    } 
}

ApplicationInstaller.prototype.installManager = function(){
    Installer.totalListCreated++
    if(Installer.totalList == Installer.totalListCreated){
        Installer.insertDataToLists();
    }
}

ApplicationInstaller.prototype.installManager2 = function(){
    Installer.totalListDataCreated++
    if(Installer.totalList == Installer.totalListDataCreated){
        $("#loaderModal").modal("hide");
        $("#successModal").modal("show");
    }
}

ApplicationInstaller.prototype.insertDataToLists = function(){
    for(var lists in Installer.migrationData){
        var data = Installer.migrationData[lists].data;
        if(data.length != 0){
            Installer.siteCtx.createItems(data, lists, function(){
                Installer.installManager2();
            })
        }
        else{
            Installer.installManager2();
        }
    }
}

ApplicationInstaller.prototype.handleFileSelect = function(evt) {
    var input = evt.target;
    var reader = new FileReader();
    reader.onload = function () {
        Installer.migrationData = {};
        var fileData = reader.result;

        if (fileData == null) {
            fileData = reader.content;
        }

        Installer.migrationData = JSON.parse(fileData);
        $("#listbody").empty();
        for(var lists in Installer.migrationData){
            Installer.totalList++;
            $("#listbody").append("<tr><th>" + lists + "</th></tr>")
        }
    };
    reader.readAsBinaryString(input.files[0]);
}

ApplicationInstaller.prototype.showInstallationType = function(){
    var value = $("#migrationtype").val();
    if(value == "Migrate From"){
        $(".toclass").hide();
    }
    else{
        $(".toclass").show();
    }
}


ApplicationInstaller.prototype.confirmSubmit = function(){
    var msg = "Are you sure you want to run this action?";

    if (confirm(msg) == true) {
        var value = $("#migrationtype").val();
        if(value == "Migrate From"){
            Installer.runMigrationDownload();
        }
        else{
            Installer.runMigrationInstallation();
        }
    } else {
        alert("Request Cancelled ");
    }
}
