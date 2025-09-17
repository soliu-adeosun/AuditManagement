AUDITMANAGEMENT.loadViewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		AUDITMANAGEMENT.whenViewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = AUDITMANAGEMENT.whenViewRequestDependeciesLoaded;
    }
};



AUDITMANAGEMENT.whenViewRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! View page is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000);
};