var DiscussionsReq = new Discussions();

function Discussions() {
	this.listname = "";
    this.ID = "";
    this.body = "";
    this.details = {};
    this.title = "";
    this.currentRefCommentId = "";
    this.SpContext = null;
    this.queryDetails = [];
    this.useDefault = true;
    this.yearInUse = true;
    this.bodyInUse = true;
}

Discussions.prototype.createDiscussion = function (details, callback) {
    details = (typeof details !== "undefined") ? details : {};
    details.title = (typeof details.title !== "undefined") ? details.title : "";
    details.body = (typeof details.body !== "undefined") ? details.body : "";
    details.email = (typeof details.email !== "undefined") ? details.email : "";
    var discussion = {};
    discussion.Title = details.title;
    discussion.Body = details.body;
    if(this.yearInUse){
        discussion.Year = this.SpContext.serverDate().getFullYear();
    }
    discussion.NoOfComments = 0;
    discussion.NoOfReactions = 0;
    discussion.NoOfLikes = 0;
    discussion.NoOfDisLikes = 0;
    
    if(typeof details.metadata !== "undefined"){
    	for(var column in details.metadata){
    		discussion[column] = details.metadata[column];
    	}
    }

    if(details.email !== ""){
        discussion.Email = details.email;
    }

    if(details.title.trim() !== ""){
        this.SpContext.createItems([discussion], DiscussionsReq.listname, function (createdItemsProperties) {
            callback();
        });
    }
}



Discussions.prototype.getDiscussion = function(callback){
    //this.yearInUse = (typeof this.yearInUse === "undefined") ? true : this.queryDetails.yearInUse;

    var query = [{}];
    query.push({
        operator: 'Eq',
        field: this.queryDetails.FieldName,
        type: this.queryDetails.FieldType,
        val: this.queryDetails.FieldValue
    })

    if(this.yearInUse){
        query.push({
            operator: 'Eq',
            field: "Year",
            type: "Text",
            val: this.SpContext.serverDate().getFullYear()
        })
    }

    this.SpContext.getItem(DiscussionsReq.listname, this.SpContext.camlBuilder(query), function (_spMeta) {
        var count = 0;
		var listEnumerator = _spMeta.getEnumerator();
		while (listEnumerator.moveNext()) {
            count++;
            var discussionobject = {};
			
			discussionobject.noOfComments = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfComments'),0);
            discussionobject.noOfReactions = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfReactions'),0);
            discussionobject.noOfLikes = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfLikes'),0);
            discussionobject.noOfDislikes = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfDisLikes'),0);
            discussionobject.comments = DiscussionsReq.SpContext.JSONToObject(listEnumerator.get_current().get_item('Comments'));
            discussionobject.likes = DiscussionsReq.SpContext.JSONToObject(listEnumerator.get_current().get_item('Likes'));
            discussionobject.reactions = DiscussionsReq.SpContext.JSONToObject(listEnumerator.get_current().get_item('Reactions'));

            DiscussionsReq.ID = listEnumerator.get_current().get_item('ID');
	        DiscussionsReq.title = listEnumerator.get_current().get_item("Title");
            if(DiscussionsReq.bodyInUse) {
                DiscussionsReq.body = listEnumerator.get_current().get_item("Body");
            }

            DiscussionsReq.details = discussionobject;
		}

        if(typeof callback == "function"){
            callback(count);
        }
	});
}


Discussions.prototype.getDiscussionByID = function(id, callback){

    var query = [{}];
    query.push({
        operator: 'Eq',
        field: "ID",
        type: "Number",
        val: id
    })


    this.SpContext.getItem(DiscussionsReq.listname, this.SpContext.camlBuilder(query), function (_spMeta) {
        var count = 0;
		var listEnumerator = _spMeta.getEnumerator();
		while (listEnumerator.moveNext()) {
            count++;
            var discussionobject = {};
			
			discussionobject.noOfComments = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfComments'),0);
            discussionobject.noOfReactions = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfReactions'),0);
            discussionobject.noOfLikes = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfLikes'),0);
            discussionobject.noOfDislikes = DiscussionsReq.SpContext.checkNull(listEnumerator.get_current().get_item('NoOfDisLikes'),0);
            discussionobject.comments = DiscussionsReq.SpContext.JSONToObject(listEnumerator.get_current().get_item('Comments'));
            discussionobject.likes = DiscussionsReq.SpContext.JSONToObject(listEnumerator.get_current().get_item('Likes'));
            discussionobject.reactions = DiscussionsReq.SpContext.JSONToObject(listEnumerator.get_current().get_item('Reactions'));

            DiscussionsReq.ID = listEnumerator.get_current().get_item('ID');
	        DiscussionsReq.title = listEnumerator.get_current().get_item("Title");
            if(DiscussionsReq.bodyInUse) {
                DiscussionsReq.body = listEnumerator.get_current().get_item("Body");
            }
            DiscussionsReq.details = discussionobject;
		}

        if(typeof callback == "function"){
            callback(count);
        }
	});
}


Discussions.prototype.CommentOnDiscussion = function(comments, commentid, callback){

    if(commentid === "" && comments.trim() !== ""){
        DiscussionsReq.details.comments.unshift({
            user : CurrentUserProperties.title,
            email : CurrentUserProperties.email,
            content : comments,
            likes : [],
            reactions : [],
            subcomments : [],
            time : this.SpContext.stringnifyDate({ includeTime : true})
        });

    }
    else if (commentid !== "" && comments.trim() !== ""){
        DiscussionsReq.details.comments[commentid].subcomments.unshift({
            user : CurrentUserProperties.title,
            email : CurrentUserProperties.email,
            content : comments,
            likes : [],
            reactions : [],
            referenceComment : DiscussionsReq.currentRefCommentId,
            time : this.SpContext.stringnifyDate({ includeTime : true})
        });
    }
	
	if(comments.trim() !== ""){
	    DiscussionsReq.details.noOfComments++;
	
	    var updateObj = {
	        ID : DiscussionsReq.ID,
	        NoOfComments : DiscussionsReq.details.noOfComments,
	        Comments : JSON.stringify(DiscussionsReq.details.comments)
	    }
	
	    this.SpContext.updateItems([updateObj], DiscussionsReq.listname, function () {
	        DiscussionsReq.getDiscussionByID(DiscussionsReq.ID, callback);
	    });
	}
    
}

Discussions.prototype.LikeDiscussion = function(commentid,subcommentid, callback){
    if(typeof commentid === "undefined" || commentid == null){
        var userliked = false;
        var userlikePos = "";
        for(var x = 0; x < DiscussionsReq.details.likes.length; x++){
            if(DiscussionsReq.details.likes[x].email.toLowerCase() == CurrentUserProperties.email.toLowerCase()){
                userlikePos = x;
                userliked = true;
                break;
            }
        }

        if(!userliked){
            DiscussionsReq.details.likes.unshift({
                user : CurrentUserProperties.title,
                email : CurrentUserProperties.email,
                time : this.SpContext.stringnifyDate({ includeTime : true})
            });
            DiscussionsReq.details.noOfLikes++;
        }
        else{
            DiscussionsReq.details.likes.splice(userlikePos, 1);
            DiscussionsReq.details.noOfLikes--;
        }
        
    }
    else if ((typeof commentid !== "undefined" || commentid !== null) && (typeof subcommentid === "undefined" || subcommentid == null)){
        var userliked = false;
        var userlikePos = "";
        for(var x = 0; x < DiscussionsReq.details.comments[commentid].likes.length; x++){
            if(DiscussionsReq.details.comments[commentid].likes[x].email.toLowerCase() == CurrentUserProperties.email.toLowerCase()){
                userlikePos = x;
                userliked = true;
                break;
            }
        }

        if(!userliked){
            DiscussionsReq.details.comments[commentid].likes.unshift({
                user : CurrentUserProperties.title,
                email : CurrentUserProperties.email,
                time : this.SpContext.stringnifyDate({ includeTime : true})
            });
        }
        else{
            DiscussionsReq.details.comments[commentid].likes.splice(userlikePos, 1);
        }
        
    }

    else if ((typeof commentid !== "undefined" || commentid !== null) && (typeof subcommentid !== "undefined" || subcommentid !== null)){
        var userliked = false;
        var userlikePos = "";
        for(var x = 0; x < DiscussionsReq.details.comments[commentid].subcomments[subcommentid].likes.length; x++){
            if(DiscussionsReq.details.comments[commentid].subcomments[subcommentid].likes[x].email.toLowerCase() == CurrentUserProperties.email.toLowerCase()){
                userlikePos = x;
                userliked = true;
                break;
            }
        }

        if(!userliked){
            DiscussionsReq.details.comments[commentid].subcomments[subcommentid].likes.unshift({
                user : CurrentUserProperties.title,
                email : CurrentUserProperties.email,
                time : this.SpContext.stringnifyDate({ includeTime : true})
            });
        }
        else{
            DiscussionsReq.details.comments[commentid].subcomments[subcommentid].likes.splice(userlikePos, 1);
        }
    }

    var updateObj = {
        ID : DiscussionsReq.ID,
        NoOfLikes : DiscussionsReq.details.noOfLikes,
        Comments : JSON.stringify(DiscussionsReq.details.comments),
        Likes : JSON.stringify(DiscussionsReq.details.likes),
    }

    $spcontext.updateItems([updateObj], DiscussionsReq.listname, function () {
        DiscussionsReq.getDiscussionByID(DiscussionsReq.ID, callback);
    });
}

Discussions.prototype.createDiscussionList = function (callback) {
    var arr = [
        
        {
            columnField: "<Field DisplayName=\"Body\" Type=\"Note\" RichText=\"FALSE\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldMultiLineText,
            addToDefault: true,
        },
        {
            columnField: "<Field DisplayName=\"NoOfComments\" Type=\"Number\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldNumber,
            addToDefault: true
        },
        {
            columnField: "<Field DisplayName=\"NoOfReactions\" Type=\"Number\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldNumber,
            addToDefault: true
        },
        {
            columnField: "<Field DisplayName=\"NoOfLikes\" Type=\"Number\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldNumber,
            addToDefault: true
        },
        {
            columnField: "<Field DisplayName=\"NoOfDisLikes\" Type=\"Number\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldNumber,
            addToDefault: true
        },
        {
            columnField: "<Field DisplayName=\"Comments\" Type=\"Note\" RichText=\"FALSE\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldMultiLineText,
            addToDefault: true,
        },
        {
            columnField: "<Field DisplayName=\"Likes\" Type=\"Note\" RichText=\"FALSE\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldMultiLineText,
            addToDefault: true,
        },
        {
            columnField: "<Field DisplayName=\"Reactions\" Type=\"Note\" RichText=\"FALSE\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldMultiLineText,
            addToDefault: true,
        },
        {
            columnField: "<Field DisplayName=\"Year\" Type=\"Text\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldText,
            addToDefault: true
        },
        {
            columnField: "<Field DisplayName=\"Email\" Type=\"Text\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldText,
            addToDefault: true
        },
        {
            columnField: "<Field DisplayName=\"PublishedDate\" Type=\"DateTime\" />",
            fieldOptions: SP.AddFieldOptions.defaultValue,
            fieldType: SP.FieldDateTime,
            addToDefault: true
        }
        
    ];

    this.SpContext.formAppInitialization(this.listname, arr, callback);
}