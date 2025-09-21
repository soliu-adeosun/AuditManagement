loadDashboardComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenDashboardDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenDashboardDependeciesLoaded;
    }
};



whenDashboardDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! Dashboard is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
  },2000);
};