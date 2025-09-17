AUDITMANAGEMENT.loadApproveRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		AUDITMANAGEMENT.whenApproveRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = AUDITMANAGEMENT.whenApproveRequestDependeciesLoaded;
    }
};



AUDITMANAGEMENT.whenApproveRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! Approve page is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000);
};