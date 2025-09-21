loadViewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenViewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenViewRequestDependeciesLoaded;
    }
};



whenViewRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    console.log("BOOM!! View page is up and running");
    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000);
};