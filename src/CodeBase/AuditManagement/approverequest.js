loadApproveRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenApproveRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenApproveRequestDependeciesLoaded;
    }
};



whenApproveRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! Approve page is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000);
};