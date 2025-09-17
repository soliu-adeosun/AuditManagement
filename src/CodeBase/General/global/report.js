MainApplication.ReportComponent.downloadData = function(excelname, data){
    //console.log(csvContent);
    if (navigator.msSaveOrOpenBlob){
        var blobContent = data;
        // Works for Internet Explorer and Microsoft Edge
        var blob = new Blob( [blobContent], {type: "text/csv"} );
        navigator.msSaveOrOpenBlob(blob, excelname);
    }
    else{
        var encodedString;
        var downloadLink
        try{
            encodedString = btoa(data);
            downloadLink =  `data:text/csv;base64,${encodedString}`;
        }
        catch(e){
            var csvContent = "data:text/csv;charset=utf-8,";
            csvContent += data;
            var blob = new Blob([data]);
            if(blob.size > 2000000){
                globalDefinitions.HandlerError("Please use the filter to reduce the data size, as the size of the data exceeds 2MB");
            }
            downloadLink = encodeURI(csvContent);
        }
        
        var link = document.createElement("a");
        link.setAttribute("href", downloadLink);
        link.setAttribute("download", excelname);
        link.click();
    }
}

MainApplication.ReportComponent.validateCSVContent = function(data){
    if(typeof data == "string"){
        //data = data.replace(/,/g, "~");
        data = data.replace(/\n/g, "");
        data = data.replace(/\r/g, "");
        data = data.replace(/\r\n/g, "");
        data = MainApplication.ReportComponent.encloseStringWithCommaCheck(data);
    }
    return data;
}

MainApplication.ReportComponent.encloseStringWithCommaCheck = function(value) {
    if (value.includes(',')) {
      return '"' + value + '"';
    }
    return value;
}

MainApplication.ReportComponent.updateRoute = function() {

}