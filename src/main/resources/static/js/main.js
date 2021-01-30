$(document).ready(function () {
	console.log("document: ready");
	//init();
});

function connect(){
    let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
    console.log("connect="+JSON.stringify(data));
    
    $.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getConnection",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			console.log(result);
			let metadataTypes = JSON.parse(result);
			console.log(metadataTypes);
            $("#showTypes").empty();
            
			if (metadataTypes.length > 0){
				$('<p>Connected</p>').appendTo("#showTypes");

	           	let selectOptions = '';
	           	selectOptions += '<label for="typeName">Choose a type:</label>';
				selectOptions += '<select name="typeName" id="typeName" onchange="selectedType()">';
				selectOptions += '<option value=""></option>';
				$().appendTo("#showTypes");
				for (let i = 0; i < metadataTypes.length; i++) {
					selectOptions += '<option value="'+metadataTypes[i]+'">'+metadataTypes[i]+'</option>';
				}
				selectOptions += '</select>';
	            $(selectOptions).appendTo("#showTypes");
			}
			
		},
		error : function(e) {
			console.error("ERROR: ", e);
		}
    });
}

function selectedType(){
	
	let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
	data["typeName"] = $("#typeName").val();
    console.log("selectedType="+JSON.stringify(data));

	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getMetadataByType",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			let retrieveResult = JSON.parse(result);
			console.log(retrieveResult);
			if (retrieveResult.hasOwnProperty('id') && retrieveResult.hasOwnProperty('done')){
				if (!retrieveResult.done){
				  	localStorage.setItem("queuedId", retrieveResult.id);					
					getQueuedResult(retrieveResult.id);
				}				
			}
		},
		error : function(e) {
			console.error("ERROR: ", e);
		}
    });
}

function getQueuedResult(queuedId){
	let data = {}
	data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
	data["queuedId"] = queuedId;
	console.log("getQueuedResult=start");

	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getQueuedData",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			let queuedResult = JSON.parse(result);
			if (queuedResult.length == 1){
				let queuedObj = JSON.parse(queuedResult[0]);
				console.log(queuedObj);
				if (queuedObj.hasOwnProperty("success") && !queuedObj.success){
				  	let jobId = localStorage.getItem("queuedId");
					getQueuedResult(jobId);
				}
			} else {
				console.log(queuedResult);
			}
			console.log("getQueuedResult=finish");
		},
		error : function(e) {
			console.error("ERROR: ", e);
		}
    });
}
