function loadListsClientComponent() {
    if (MainApplication.cachedState.mode) {
        whenListsDependeciesLoaded();
    }
    else {
        MainApplication.cachedState.pageStateCall = whenListsDependeciesLoaded;
    }
}

function whenListsDependeciesLoaded() {
    $('#listItemModal').on('hidden.bs.modal', function (e) {
        $spcontext.resetBind();
        $spcontext.filesDictionary = {};
        $("input.urldirect").val("");
        $("#createbutton").show();
        $("#updatebutton").hide();
    });

    MainApplication.ListsComponent.libraryName = configPropertiesRoot.DEFAULTLIBRARYFORIMAGES.setting;
    // if(!MainApplication.ListsComponent.workflowmode){
    //     MainApplication.ListsComponent.setupPageForSamePageRefresh();
    // }
}

MainApplication.ListsComponent.onListItemCreated = null;
MainApplication.ListsComponent.listOrder = "FALSE";
MainApplication.ListsComponent.setupPageForSamePageRefresh = function (context, callbackMode,order) {
    MainApplication.ListsComponent.listOrder = (typeof order === "undefined") ? "FALSE" : order;
    MainApplication.ListsComponent.context = (typeof context === "undefined") ? $spcontext : context;
    if(typeof callbackMode === "undefined"){
        MainApplication.ListsComponent.onListItemCreated = null;
    }
    MainApplication.ListsComponent.context.DataForTable.tablecontentId = "listdata";
    MainApplication.ListsComponent.context.DataForTable.pagesize = 30;
    MainApplication.ListsComponent.context.DataForTable.paginateSize = 5;
    MainApplication.ListsComponent.context.DataForTable.context = MainApplication.ListsComponent.context;
    MainApplication.ListsComponent.context.DataForTable.paginationbId = "btmpagination";
    MainApplication.ListsComponent.context.DataForTable.propertiesHandler = {
        Modified: function (propValue, pos) {
            return `<span class="pointer" onclick="MainApplication.ListsComponent.viewItem('${pos}')"><i class="fa-solid fa-pen-to-square"></i></span>
                    <span class="pointer"><img src="${window.ERPIMAGES.trash}" onclick="MainApplication.ListsComponent.deleteItem('${pos}')" /></span>`;
        },
        TrimmedContent: function (propValue, pos, key) {
            return ($spcontext.removeHtml(propValue[key]).slice(0, 100) + "....");
        },
        LinkTrimmedContent: function (propValue, pos, key) {
            return (propValue[key].slice(0, 30) + "....");
        },
        UserContent: function (propValue, pos, key) {
            var retValue = "";
            if (typeof propValue[key] === "undefined" || propValue[key] === "") {
                return retValue;
            }

            if (Array.isArray(propValue[key])) {
                for (var x = 0; x < propValue.length; x++) {
                    retValue += `<span>${propValue[key]}</span><br/>`;
                }
            }
            else {
                retValue += propValue[key].value;
            }
            return retValue;
        },
        DateContent: function (propValue, pos, key) {
            return $spcontext.stringnifyDate({ value: propValue[key], format: "dd/mm/yy" });
        }
    };
    MainApplication.cachedState.formPreloaded = false;
    globalDefinitions.callLoader();
    $("#createbutton").show();
    $("#updatebutton").hide();

    MainApplication.ListsComponent.listInformation = {
        name: "",
        columnsMetaData: [],
        systemColumn: ["Title", "ID", "Modified", "Author", "Created"],
        columns: [],
        data: []
    };
    MainApplication.ListsComponent.url = window.location.href;
    MainApplication.ListsComponent.listInformation.name = $spcontext.getParameterByName("list", MainApplication.ListsComponent.url);
    MainApplication.ListsComponent.hyperLinkColumns = [];
    MainApplication.ListsComponent.hyperLinkFileLinks = {};
    MainApplication.ListsComponent.filesInformation = [];
    MainApplication.ListsComponent.currentItemInView = {};
    $("#listnameheader").text(MainApplication.ListsComponent.listInformation.name);

    MainApplication.ListsComponent.context.getColumnsInList(MainApplication.ListsComponent.listInformation.name, function (listFields, listnameForColumn) {
        var oEnumerator = listFields.getEnumerator();
        while (oEnumerator.moveNext()) {
            var oField = oEnumerator.get_current();
            var title = oField.get_title();
            var metaData = $spcontext.xmlToJson($.parseXML(oField.get_schemaXml())).Field;
            var attributes = metaData["@attributes"];
            var source = attributes.SourceID;
            var passed = $spcontext.validationProperties.text.extend.URL(source.toString());
            if (!passed) {
                MainApplication.ListsComponent.listInformation.columns.push(title);
                var SPElementProperties = {};
                SPElementProperties.fieldOptions = SP.AddFieldOptions.defaultValue;
                SPElementProperties.addToDefault = true;
                SPElementProperties.fieldType = attributes.Type;
                if (attributes.Type == "Text") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Text\" />";
                }
                else if (attributes.Type == "Note") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Note\" RichText=\"FALSE\" />";
                }

                else if (attributes.Type == "DateTime") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"DateTime\" />";
                }

                else if (attributes.Type == "Number") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Number\" />";
                }

                else if (attributes.Type == "URL") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"URL\" />";
                }

                else if (attributes.Type == "Choice") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"Choice\" />";
                    var choicesData = metaData.CHOICES.CHOICE;
                    var choiceArr = [];
                    for (var x = 0; x < choicesData.length; x++) {
                        choiceArr.push(choicesData[x]["#text"]);
                    }
                    SPElementProperties.choices = choiceArr;
                }
                else if (attributes.Type == "User" || attributes.Type == "UserMulti") {
                    SPElementProperties.columnField = "<Field DisplayName=\"" + title + "\" Type=\"User\" />";
                }

                MainApplication.ListsComponent.listInformation.columnsMetaData.push(SPElementProperties);
            }
        }

        MainApplication.ListsComponent.setUpFormFeatures();
        MainApplication.ListsComponent.getListData(listnameForColumn);
    });
}

MainApplication.ListsComponent.getListData = function (listnameForColumn) {
    //now reterive Data 
    var query = [
        {
            ascending: MainApplication.ListsComponent.listOrder,
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
    MainApplication.ListsComponent.context.getListToItems(listnameForColumn, $spcontext.camlBuilder(query), {
        merge: false,
        data: (MainApplication.ListsComponent.listInformation.systemColumn.concat(MainApplication.ListsComponent.listInformation.columns))
    }, false, function (listItem) {
        for (var item in listItem) {
            if (listItem[item] !== "") {
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

                else if (SPFieldType.toLowerCase() === "sp.fieldurlvalue") {
                    listItem[item] = listItem[item].get_url();
                }

                else if (SPFieldType.toLowerCase() === "date") {
                    listItem[item] = $spcontext.stringnifyDate({ value: listItem[item], format: "yy-mm-dd" });
                }
            }
            else {
                listItem[item] = "";
            }
        }
        return listItem;
    }, function (items, listnameForItems) {
        MainApplication.ListsComponent.listInformation.data = items;
        MainApplication.ListsComponent.context.manualTable(MainApplication.ListsComponent.listInformation.data);
        globalDefinitions.closeLoader();
        MainApplication.cachedState.formPreloaded = true;
    });
}

MainApplication.ListsComponent.setUpFormFeatures = function () {
    $("#listheadtr, #listitemcomponent").empty();
    $("#listheadtr").append(`<th scope="col">SN</th>`);
    $("#listheadtr").append(`<th scope="col" speed-table-data="Modified">Action</th>`);
    $("#listheadtr").append(`<th scope="col" speed-table-data="Title">Title</th>`);
    $("#listitemcomponent").append(
        `<div class="col-12 col-lg-6 mb-3">
            <label>Title<span class="required">*</span></label>
            <input type="text" class="form-control" speed-bind-validate="Title" speed-bind-class="FormItemData" />
        </div>`
    )

    for (var x = 0; x < MainApplication.ListsComponent.listInformation.columns.length; x++) {

        if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "Text") {
            $("#listheadtr").append(
                `<th scope="col" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );

            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                    <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                    <input type="text" class="form-control" speed-bind-validate="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData" />
                </div>`
            )
        }
        else if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "Note") {
            $("#listheadtr").append(
                `<th scope="col" speed-table-group="TrimmedContent" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );

            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                    <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                    <textarea class="form-control" speed-bind-validate="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData"></textarea>
                </div>`
            );
        }
        else if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "Number") {
            $("#listheadtr").append(
                `<th scope="col" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );

            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                    <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                    <input type="number" class="form-control" speed-bind-validate="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData" />
                </div>`
            );
        }
        else if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "DateTime") {
            $("#listheadtr").append(
                `<th scope="col"  speed-table-group="DateContent" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );

            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                    <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                    <input type="date" class="form-control" speed-bind-validate="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData" />
                </div>`
            );
        }
        else if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "URL") {
            MainApplication.ListsComponent.hyperLinkColumns.push(MainApplication.ListsComponent.listInformation.columns[x])
            $("#listheadtr").append(
                `<th scope="col"  speed-table-group="LinkTrimmedContent" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );

            var options = `<option value="">Please select a value</option><option>Hyperlink</option><option>Document</option>`;
            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                    <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                    <select id="triggerselect${MainApplication.ListsComponent.listInformation.columns[x]}" class="form-control itemselectmeta"  speed-bind-class="FormItemData" 
                            onchange="MainApplication.ListsComponent.URLEventChange(this,'${MainApplication.ListsComponent.listInformation.columns[x]}')" speed-bind="${MainApplication.ListsComponent.listInformation.columns[x]}">
                            ${options}
                    </select>

                    <div>
                        <div id="urlblock${MainApplication.ListsComponent.listInformation.columns[x]}">
                            <input id="${MainApplication.ListsComponent.listInformation.columns[x]}" type="text" class="form-control urldirect"  speed-bind-class="FormItemData" />
                        </div>
                        <div id="fileurlblock${MainApplication.ListsComponent.listInformation.columns[x]}">
                            <input id="fileinput${MainApplication.ListsComponent.listInformation.columns[x]}" type="file"  class="form-control" speed-file-bind="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData" />
                            <div speed-file-bind="${MainApplication.ListsComponent.listInformation.columns[x]}"></div>
                        </div>
                    </div>
                </div>`
            )
        }
        else if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "Choice") {
            $("#listheadtr").append(
                `<th scope="col" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );
            var options = `<option value="">Please select a value</option>`;
            for (var y = 0; y < MainApplication.ListsComponent.listInformation.columnsMetaData[x].choices.length; y++) {
                options += `<option>${MainApplication.ListsComponent.listInformation.columnsMetaData[x].choices[y]}</option>`;
            }

            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                        <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                        <select speed-bind-validate="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData"
                                class="form-control">
                            ${options}
                        </select>
                </div>`
            )
        }
        else if (MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "User" ||
            MainApplication.ListsComponent.listInformation.columnsMetaData[x].fieldType === "UserMulti") {
            $("#listheadtr").append(
                `<th scope="col"  speed-table-group="UserContent" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );

            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                        <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                        <div speed-bind-people="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData" speed-bind-topicker="true"></div>
                </div>`
            );
        }
        else {
            $("#listheadtr").append(
                `<th scope="col" speed-table-data="${MainApplication.ListsComponent.listInformation.columns[x]}">${MainApplication.ListsComponent.listInformation.columns[x]}</th>`
            );
            $("#listitemcomponent").append(
                `<div class="col-12 col-lg-6 mb-3">
                    <label>${MainApplication.ListsComponent.listInformation.columns[x]}</label>
                    <input type="text"  class="form-control" speed-bind-validate="${MainApplication.ListsComponent.listInformation.columns[x]}" speed-bind-class="FormItemData" />
                </div>`
            );
        }

    }

    $spcontext.assignAttributes();
    $spcontext.createMultiplePeoplePicker({
        All: {
            width: "100%",
            //multipleValues : true
        },
    });

    $spcontext.applyAttachmentEvent(
        {
            o365: true,
            appendFiles: false,
            cancelClear: true
        },
        function (elementName, listOfFiles, fileId) {
            $("div[speed-file-bind='" + elementName + "']").empty();
            if (listOfFiles.files.length !== 0) {
                for (var y = 0; y < listOfFiles.files.length; y++) {
                    var attachmentBlock = "<p id='" + elementName + "display" + y + "' style='color : #002c4d'>" +
                        listOfFiles.files[y].dataName +
                        "<span><a class='attachment-inline-delete' style='color: red; cursor: pointer; padding-left: 5px' onclick='deleteRowAttachment(\"" +
                        elementName + '", ' + y + ',"' + fileId + "\")'>x</a></span></p>";
                    $("div[speed-file-bind='" + elementName + "']").append(attachmentBlock);
                }
            }
        },
        function (errors) {
            globalDefinitions.HandlerError(errors.msg);
        }
    );
}

MainApplication.ListsComponent.URLEventChange = function (elementProp, column) {

    if (elementProp.value === "Hyperlink") {
        $(`#fileurlblock${column}`).hide();
        $(`#urlblock${column}`).show();
        $(`#urlblock${column} input`).attr("speed-validate-mode", "true");
        $(`#fileurlblock${column} input`).attr("speed-validate-mode", "false");
        $spcontext.clearFileInput(`fileinput${column}`, true);
        $(`#fileurlblock${column} div`).text("");
    }
    else if (elementProp.value === "Document") {
        $(`#fileurlblock${column}`).show();
        $(`#urlblock${column}`).hide();
        $(`#urlblock${column} input`).attr("speed-validate-mode", "false");
        $(`#fileurlblock${column} input`).attr("speed-validate-mode", "true");
        $(`#urlblock${column} input`).val("");
    }
    else {
        $(`#urlblock${column} input`).attr("speed-validate-mode", "false");
        $(`#fileurlblock${column} input`).attr("speed-validate-mode", "false");
        $spcontext.clearFileInput(`fileinput${column}`, true);
        $(`#fileurlblock${column} div`).text("");
        $(`#urlblock${column} input`).val("");
        $(".itemselectmeta").trigger("change");
    }
}

MainApplication.ListsComponent.deleteItem = function (pos) {
    globalDefinitions.callLoader();
    var data = MainApplication.ListsComponent.context.DataForTable.tabledata[pos];
    MainApplication.ListsComponent.context.deleteItem(MainApplication.ListsComponent.listInformation.name, data.ID, function () {
        MainApplication.ListsComponent.getListData(MainApplication.ListsComponent.listInformation.name);
        //globalDefinitions.closeLoader();
        globalDefinitions.HandlerSuccess(`You have successfully deleted this request`);
    });
}

MainApplication.ListsComponent.createItem = function () {
    var itemInfo = $spcontext.bind({}, "FormItemData");

    if ($spcontext.checkPassedValidation()) {
        globalDefinitions.callLoader();

        var files = $spcontext.grabAllAttachments();
        if (files.length > 0) {
            for (var x = 0; x < files.length; x++) {
                MainApplication.ListsComponent.filesInformation.push({ title: files[x].property });
            }
            var currentFolder = MainApplication.ListsComponent.context.initiate().get_url() + "/" + MainApplication.ListsComponent.libraryName;
            //upload to root library because thats used to store images
            speedctxRoot.uploadMultipleLargeFile(files, [{ folder: currentFolder, metadata: {} }], 0,
                function (percentage, filedetails, fileMetaData, position) {
                    //feedback message
                    var property = MainApplication.ListsComponent.filesInformation[position].title;
                    MainApplication.ListsComponent.hyperLinkFileLinks[property] = filedetails.get_serverRelativeUrl();
                },
                function () {
                    for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
                        if (typeof itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] !== "undefined") {
                            if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "Hyperlink") {
                                itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = $(`input#${MainApplication.ListsComponent.hyperLinkColumns[i]}`).val();
                                if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "") {
                                    itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = null;
                                }
                            }
                            else {
                                itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = MainApplication.ListsComponent.hyperLinkFileLinks[MainApplication.ListsComponent.hyperLinkColumns[i]];
                            }
                        }
                    }
                    MainApplication.ListsComponent.context.createItems([itemInfo], MainApplication.ListsComponent.listInformation.name, function (itemCreatedInformation) {
                        MainApplication.ListsComponent.getListData(MainApplication.ListsComponent.listInformation.name);
                        if(MainApplication.ListsComponent.onListItemCreated == null){
                            $("#listItemModal").modal("hide");
                            globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);
                        }
                        else{
                            var properties = {
                                itemInfo : itemInfo,
                                listname : MainApplication.ListsComponent.listInformation.name,
                                createdItemId : itemCreatedInformation[0].get_id()
                            }
                            MainApplication.ListsComponent.onListItemCreated(properties, function(){
                                $("#listItemModal").modal("hide");
                                globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);
                            })
                        }
                    });
                }
            );
        }
        else {
            for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
                if (typeof itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] !== "undefined") {
                    if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "Hyperlink") {
                        itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = $(`input#${MainApplication.ListsComponent.hyperLinkColumns[i]}`).val();
                    }
                }
            }
            MainApplication.ListsComponent.context.createItems([itemInfo], MainApplication.ListsComponent.listInformation.name, function (itemCreatedInformation) {
                MainApplication.ListsComponent.getListData(MainApplication.ListsComponent.listInformation.name);
                if(MainApplication.ListsComponent.onListItemCreated == null){
                    $("#listItemModal").modal("hide");
                    globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);
                }
                else{
                    var properties = {
                        itemInfo : itemInfo,
                        listname : MainApplication.ListsComponent.listInformation.name,
                        createdItemId : itemCreatedInformation[0].get_id()
                    }
                    MainApplication.ListsComponent.onListItemCreated(properties, function(){
                        $("#listItemModal").modal("hide");
                        globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);
                    })
                }
            });
        }

    }
    else {
        globalDefinitions.HandlerError($spcontext.errors[0].msg);
    }
}

MainApplication.ListsComponent.viewItem = function (pos) {
    var data = MainApplication.ListsComponent.context.DataForTable.tabledata[pos];
    data.position = pos;
    MainApplication.ListsComponent.currentItemInView = data;
    for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
        $(`#${MainApplication.ListsComponent.hyperLinkColumns[i]}`).val(data[MainApplication.ListsComponent.hyperLinkColumns[i]]);
        data[MainApplication.ListsComponent.hyperLinkColumns[i]] = "Hyperlink";
    }

    $spcontext.htmlBind(data, null, "FormItemData");

    $("#listItemModal").modal("show");
    $("#createbutton").hide();
    $("#updatebutton").show();

    for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
        data[MainApplication.ListsComponent.hyperLinkColumns[i]] = $(`#${MainApplication.ListsComponent.hyperLinkColumns[i]}`).val();
    }

    for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
        $(`#triggerselect${MainApplication.ListsComponent.hyperLinkColumns[i]}`).trigger('change');
    }
}

MainApplication.ListsComponent.updateItem = function () {
    var itemInfo = $spcontext.bind({}, "FormItemData");
    itemInfo.ID = MainApplication.ListsComponent.currentItemInView.ID;
    if ($spcontext.checkPassedValidation()) {
        globalDefinitions.callLoader();

        var files = $spcontext.grabAllAttachments();
        if (files.length > 0) {
            for (var x = 0; x < files.length; x++) {
                MainApplication.ListsComponent.filesInformation.push({ title: files[x].property });
            }
            var currentFolder = MainApplication.ListsComponent.context.initiate().get_url() + "/" + MainApplication.ListsComponent.libraryName;
            //upload to root library because thats used to store images
            speedctxRoot.uploadMultipleLargeFile(files, [{ folder: currentFolder, metadata: {} }], 0,
                function (percentage, filedetails, fileMetaData, position) {
                    //feedback message
                    var property = MainApplication.ListsComponent.filesInformation[position].title;
                    MainApplication.ListsComponent.hyperLinkFileLinks[property] = filedetails.get_serverRelativeUrl();
                },
                function () {
                    for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
                        if (typeof itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] !== "undefined") {
                            if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "Hyperlink") {
                                itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = $(`input#${MainApplication.ListsComponent.hyperLinkColumns[i]}`).val();
                                if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "") {
                                    itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = null;
                                }
                            }
                            else {
                                itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = MainApplication.ListsComponent.hyperLinkFileLinks[MainApplication.ListsComponent.hyperLinkColumns[i]];
                            }
                        }
                    }
                    MainApplication.ListsComponent.context.updateItems([itemInfo], MainApplication.ListsComponent.listInformation.name, function () {
                        MainApplication.ListsComponent.getListData(MainApplication.ListsComponent.listInformation.name);
                        $("#listItemModal").modal("hide");
                        globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);

                        //reset links
                        for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
                            var element = document.getElementById(`triggerselect${MainApplication.ListsComponent.hyperLinkColumns[i]}`);
                            MainApplication.ListsComponent.URLEventChange(element, MainApplication.ListsComponent.hyperLinkColumns[i])
                        }
                    });
                }
            );
        }
        else {
            for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
                if (typeof itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] !== "undefined") {
                    if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "Hyperlink") {
                        itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = $(`input#${MainApplication.ListsComponent.hyperLinkColumns[i]}`).val();
                        if (itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] === "") {
                            itemInfo[MainApplication.ListsComponent.hyperLinkColumns[i]] = null;
                        }
                    }
                }
            }
            MainApplication.ListsComponent.context.updateItems([itemInfo], MainApplication.ListsComponent.listInformation.name, function () {
                MainApplication.ListsComponent.getListData(MainApplication.ListsComponent.listInformation.name);
                $("#listItemModal").modal("hide");
                globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);

                //reset links
                for (var i = 0; i < MainApplication.ListsComponent.hyperLinkColumns.length; i++) {
                    var element = document.getElementById(`triggerselect${MainApplication.ListsComponent.hyperLinkColumns[i]}`);
                    MainApplication.ListsComponent.URLEventChange(element, MainApplication.ListsComponent.hyperLinkColumns[i])
                }
            });
        }
    }
    else {
        globalDefinitions.HandlerError($spcontext.errors[0].msg);
    }
}