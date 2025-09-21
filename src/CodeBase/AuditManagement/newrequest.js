loadNewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenNewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = whenNewRequestDependeciesLoaded;
    }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.NewRequestComponent.ApplicationDetails = function () {
    this.url = window.location.href;
    this.itemId = null;
    this.mode = null;
    this.requestDetails = {};
    this.Attachments = [];
    this.FileUrls = {};
    this.FolderUrl = "";
    this.AttachmentLoader = {};
    this.messageTemplate = {};
    this.feedback = false;
    this.approverComments = "";
    this.transactionHistory = [];
    this.defaultStage = "AA0";
    this.returned = false;
    this.sectionArr = [];
    this.sections = {};
    this.finalrating = [];
}

whenNewRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    $spcontext.assignAttributes();
    AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();

    setTimeout(function(){
        globalDefinitions.closeLoader();
    },2000);
};