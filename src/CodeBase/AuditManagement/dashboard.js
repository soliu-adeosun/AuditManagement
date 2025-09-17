AUDITMANAGEMENT.loadDashboardComponent = function () {
    if (MainApplication.cachedState.mode) {
		AUDITMANAGEMENT.whenDashboardDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = AUDITMANAGEMENT.whenDashboardDependeciesLoaded;
    }
};



AUDITMANAGEMENT.whenDashboardDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! Dashboard is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
  },2000);
};