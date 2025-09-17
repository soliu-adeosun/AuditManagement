AUDITMANAGEMENT.loadNewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		AUDITMANAGEMENT.whenNewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = AUDITMANAGEMENT.whenNewRequestDependeciesLoaded;
    }
};



AUDITMANAGEMENT.whenNewRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! NewRequest page is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000);
};