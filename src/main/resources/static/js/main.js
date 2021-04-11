$(document).ready(function () {
	//console.log("document: ready");
	//init();
});

function getApiVersions(){
  	let data = {}
    data["baseUrl"] = $("#baseUrl").val();
    //console.log("getApiVersions: "+JSON.stringify(data));
  	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getAllApiVersions",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			//console.log(result);
			let jResult = JSON.parse(result);
            $("#showApiVersion").empty();
			
			if (jResult.statusCode != 200){
				$('<p>statusCode='+jResult.statusCode+'; Response='+jResult.Response+'</p>').appendTo("#showApiVersion");
			} else {
	           	let selectOptions = '';
	           	selectOptions += '<label for="apiVersion">API Version:</label>';
				selectOptions += '<select name="apiVersion" id="apiVersion">';
				let apiVersionList = jResult.Response;
				apiVersionList.sort(function(a, b){return b.version - a.version});
				for (let i = 0; i < apiVersionList.length; i++) {
				let apiVersion = apiVersionList[i];
					selectOptions += '<option value="'+apiVersion.version+'">'+apiVersion.version+'</option>';
				}
				selectOptions += '</select>';
	            $(selectOptions).appendTo("#showApiVersion");
			}
		},
		error : function(e) {
			console.error("ERROR: ", JSON.stringify(e));
		}
    });
}

function connect(){
	$("#showTypes").empty();

	if ($("#orgId").val() == "" || $("#baseUrl").val() == "" || $("#sessionId").val() == ""){
		$('<p>Please, provide credentials.</p>').appendTo("#showTypes");
		return null;	
	}

	$('<p>Connecting...</p>').appendTo("#showTypes");

    let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
    //console.log("connect="+JSON.stringify(data));

    let packageMap = new Map();
	//console.log(packageMap);
  	localStorage.setItem("packageMap", JSON.stringify(Array.from(packageMap.entries())));

    $.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getConnection",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			//console.log(result);
			let jResult = JSON.parse(result);
            $("#showTypes").empty();
			
			if (jResult.statusCode != 200){
				$('<p>statusCode='+jResult.statusCode+'; Response='+jResult.Response+'</p>').appendTo("#showTypes");
			} else {
	           	let selectOptions = '';
	           	selectOptions += '<label for="typeName">Choose a type:</label>';
				selectOptions += '<select name="typeName" id="typeName" onchange="selectedType()">';
				selectOptions += '<option value=""></option>';
				let metadataTypes = jResult.Response;
				//console.log(metadataTypes);

				for (let i = 0; i < metadataTypes.length; i++) {
					selectOptions += '<option value="'+metadataTypes[i]+'">'+metadataTypes[i]+'</option>';
				}
				selectOptions += '</select>';
	            $(selectOptions).appendTo("#showTypes");
			}
		},
		error : function(e) {
			console.error("ERROR: ", JSON.stringify(e));
		}
    });
}

function selectedType(){
	
	let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
	let metadataType = $("#typeName").val();
	if (metadataType === "CustomField" || metadataType === "RecordType"){
		metadataType = "CustomObject";
	}
	data["typeName"] = metadataType;
    //console.log("selectedType="+JSON.stringify(data));

	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getMetadataByType",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			//console.log(result);
			let jResult = JSON.parse(result);
			
			if (jResult.statusCode != 200){
				$('<p>statusCode='+jResult.statusCode+'; Response='+jResult.Response+'</p>').appendTo("#showTypes");
				//console.log(new Date());
			} else {
				let retrieveResult = JSON.parse(jResult.Response[0]);
				//console.log(retrieveResult);
				if (retrieveResult.hasOwnProperty('id') && retrieveResult.hasOwnProperty('done')){
					if (!retrieveResult.done){
						$("#showItems").empty();
						$('<p>status: '+retrieveResult.state+'</p>').appendTo("#showItems");
					  	localStorage.setItem("queuedId", retrieveResult.id);					
						getQueuedResult(retrieveResult.id);
					}				
				}
			}
		},
		error : function(e) {
			console.error("ERROR: ", JSON.stringify(e));
		}
    });
}

function getQueuedResult(queuedId){
	let data = {}
	data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
	let metadataType = $("#typeName").val();

	if (metadataType === "CustomField" || metadataType === "RecordType"){
		metadataType = "CustomObject";
	}
	data["typeName"] = metadataType;
	data["queuedId"] = queuedId;

	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getQueuedData",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			//console.log(result);
			let queuedResult = JSON.parse(result);
			
			let jResult = JSON.parse(result);
			
			if (jResult.statusCode != 200){
				$('<p>statusCode='+jResult.statusCode+'; Response='+jResult.Response+'</p>').appendTo("#showTypes");
			} else {
				let queuedResult = jResult.Response;
				//console.log(jResult);

				if (queuedResult.length == 1){
					let queuedObj = JSON.parse(queuedResult[0]);
					//console.log(queuedObj);
					if (queuedObj.hasOwnProperty("success") && !queuedObj.success){
					  	let jobId = localStorage.getItem("queuedId");
						$("#showItems").empty();
						$('<p>status: '+queuedObj.status+'</p>').appendTo("#showItems");

						getQueuedResult(jobId);
					} else {
						//console.log(new Date());
						if (queuedObj.hasOwnProperty("fileProperties")){
							let typeComponents = queuedObj.fileProperties;
				            $("#showItems").empty();
							$("#showObjects").empty();
							let metadataType = $("#typeName").val();
							
						  	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
							
							if (!packageMap.has(metadataType)){
								//console.log('added new type '+metadataType);
								packageMap.set(metadataType, []);
							}
							let oldSelectedList = packageMap.get(metadataType);
							//console.log('oldSelectedList '+oldSelectedList);

							let componentNames = [];
							for (let i = 0; i < typeComponents.length; i++) {
								let component = typeComponents[i];
								if (component.fullName != "package.xml"){
									componentNames.push(component.fullName);
								}
							}		
							//console.log(componentNames);
							//console.log("jResult.hasOwnProperty('standardObjects') "+jResult.hasOwnProperty("standardObjects"));
							if (jResult.hasOwnProperty("standardObjects")){
								let standardObjects = jResult.standardObjects;
								//console.log(standardObjects);
								for (let i = 0; i < standardObjects.length; i++) {
									componentNames.push(standardObjects[i]);
								}
							}
							
							componentNames.sort();

							
							if (metadataType === "CustomField" || metadataType === "RecordType"){
								//console.log(metadataType);
								let selectObjects = '';
					           	selectObjects += '<label for="objectName">Choose an object:</label>';
								selectObjects += '<select name="objectName" id="objectName" onchange="selectedObject()">';
								selectObjects += '<option value=""></option>';
								for (let i = 0; i < componentNames.length; i++) {
									selectObjects += '<option value="'+componentNames[i]+'">'+componentNames[i]+'</option>';
								}
								selectObjects += '</select>';
					            $(selectObjects).appendTo("#showObjects");
								//console.log(componentNames);
								return ;
							}
							
							createTable(oldSelectedList, componentNames);

						}
					}
				}
			}
		},
		error : function(e) {
			console.error("ERROR: ", JSON.stringify(e));
		}
    });
}

function createTable(oldSelectedList, componentNames){
	$("#showItems").empty();
	
	if (componentNames.length == 0){
		let components = '<div id="componentsId">';
		components += '<p>No data to display.';
		components += '</div>';
    	$(components).appendTo("#showItems");
		return ;
	}
	
	let metadataType = $("#typeName").val();
	let objectName = "";
	if (metadataType === "CustomField" || metadataType === "RecordType"){
		objectName = $("#objectName").val();
	}
	
	let components = '<div id="componentsId">';
	components += '<input type="submit" value="Add/Remove" onclick="addComponent()"><br/><br/>';
	components += '<table>';
	components += '<tr>';
		components += '<th>Name</th>';
		components += '<th><input type="checkbox" id="select-all" name="selectAll" onclick="selectAll(this)"></th>';
	components += '</tr>';
	
				
	for (let i = 0; i < componentNames.length; i++) {
			let componentFullName = componentNames[i];
			let selected = oldSelectedList.includes(componentFullName);
			let thisValue = componentFullName;
			if (objectName.length > 0){
				thisValue = objectName +'.'+componentFullName;
				selected = oldSelectedList.includes(thisValue);
			}
			components += '<tr>';	
				components += '<td><label for="component"> '+componentFullName+'</label></td>';
				components += '<td><input type="checkbox" id="'+componentFullName+'" name="component" value="'+thisValue+'"'; 
				if (selected){
					components += ' checked ';
				}
			components += '></td></tr>';								
	}
	components += '</table><br/>';
	components += '<input type="submit" value="Add/Remove" onclick="addComponent()">';
	components += '</div>';
    $(components).appendTo("#showItems");
}

function selectedObject(){
	$("#showItems").empty();
	let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
	data["objectName"] = $("#objectName").val();
    //console.log("selectedObject="+JSON.stringify(data));

	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getObject",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			//console.log(result);
			let jResult = JSON.parse(result);
			
			if (jResult.statusCode != 200){
				$('<p>statusCode='+jResult.statusCode+'; Response='+jResult.Response+'</p>').appendTo("#showTypes");
				//console.log(new Date());
			} else {
				
				$("#showItems").empty();
				let metadataType = $("#typeName").val();
				
			  	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
				
				if (!packageMap.has(metadataType)){
					//console.log('added new type '+metadataType);
					packageMap.set(metadataType, []);
				}
				let oldSelectedList = packageMap.get(metadataType);
				//console.log('oldSelectedList '+oldSelectedList);
				
				let resp = JSON.parse(jResult.Response);
				
				let components = [];
				let wrapCmp = [];
				if (metadataType === "CustomField" && resp.hasOwnProperty("fields")){
					//console.log(resp.fields);
					if (Array.isArray(resp.fields)){
						wrapCmp.push.apply(wrapCmp, resp.fields);
					} else {
						wrapCmp.push(resp.fields);
					}
				} else if (metadataType === "RecordType" && resp.hasOwnProperty("recordTypes")){
					if (Array.isArray(resp.recordTypes)){
						wrapCmp.push.apply(wrapCmp, resp.recordTypes);
					} else {
						wrapCmp.push(resp.recordTypes);
					}
				}
				for (let i = 0; i < wrapCmp.length; ++i){
					if (wrapCmp[i].fullName != "package.xml"){
						components.push(wrapCmp[i].fullName);
					}
				}

				components.sort();
				//console.log(components);
				
				createTable(oldSelectedList, components);
			}
		},
		error : function(e) {
			console.error("ERROR: ", JSON.stringify(e));
		}
    });
}

function selectAll(source) {
	//console.log('selectAll');
 	let checkboxes = document.getElementsByName('component');
	//console.log(source +' '+source.checked);
	//console.log(checkboxes);

	for( let i = 0; i < checkboxes.length; i++){ 
    	checkboxes[i].checked = source.checked;
	}
}


function addComponent(){
  	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
	
	let newSelectedSet = [];
	let valueMap = new Map();
	let checkboxes = document.getElementsByName('component');
	for (let i = 0; i<checkboxes.length; i++) {
		valueMap.set(checkboxes[i].value, checkboxes[i].checked);
		if (checkboxes[i].checked){
			newSelectedSet.push(checkboxes[i].value);
		}
	}
	
	let typeName = $("#typeName").val();
	if (typeName === 'CustomField'){
		
		if (!packageMap.has(typeName)){
			newSelectedSet.sort();
			packageMap.set(typeName, Array.from(newSelectedSet));
		} else {
			let oldValues = new Set(packageMap.get(typeName));
			
			for (let [value, isSelected] of valueMap) {
				if (oldValues.has(value) && !isSelected){
					oldValues.delete(value);
				} else if (!oldValues.has(value) && isSelected){
					oldValues.add(value);
				}
			}
			
			let allValues = Array.from(oldValues);
			allValues.sort();
			packageMap.set(typeName, allValues);
		}
	} else {
		if (newSelectedSet.length > 0){
			newSelectedSet.sort();
			packageMap.set(typeName, Array.from(newSelectedSet));
		} else {
			packageMap.delete(typeName);
		}
	}
	//console.log(packageMap);
	
   	renderTree(packageMap);

	localStorage.setItem("packageMap", JSON.stringify(Array.from(packageMap.entries())));
}


function renderTree(packageMap){
	$("#packageTreeId").empty();

	if (packageMap.size > 0){
		let packageTree = '<ul id="myUL">';
				packageTree += '<li><span id="packageId" class="caret" onclick="carretFunc(this)">package.xml</span>';
					packageTree += '<ul class="nested">';
		for (let [key, value] of packageMap) {
						packageTree += '<li><span id="'+key+'Id" class="caret" onclick="carretFunc(this)">'+key+'</span>';
							packageTree += '<ul class="nested">';
			let str = value +'';
			let arrElement = [];
			arrElement = str.split(',');
				for(let i = 0; i < arrElement.length; ++i){
					packageTree += '<li>'+arrElement[i]+'</li>';
				}	
						packageTree += '</ul>';
					packageTree += '</li>';
		}		
				packageTree += '</ul>';
			packageTree += '</li>';
		packageTree += '</ul><br/>';
		
		packageTree += '<input type="submit" value="Download" onclick="createPackageXml()"><br/>';
	    $(packageTree).appendTo("#packageTreeId");

	}
}

function carretFunc(element){
	//console.log(element);
	element.parentElement.querySelector(".nested").classList.toggle("active");
	element.classList.toggle("caret-down");
}

function createPackageXml(){
	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
	
	let versionApi = $("#apiVersion").val();
	
	let data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
	data += '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n';
	for (let [key, value] of packageMap) {
		let arrElement = [];
		let str = value +'';
		arrElement = str.split(',');
		if (arrElement.length > 0){
			data += '\t<types>\n';
			data += '\t\t<name>'+key+'</name>\n';
			for(let i = 0; i < arrElement.length; ++i){
				data += '\t\t<members>'+arrElement[i]+'</members>\n';
			}
			data += '\t</types>\n';		
		}
	}
	data += '\t<version>'+versionApi+'</version>\n'
	data += '</Package>';
	
	
	download('package.xml', data);
}

function download(filename, text) {
	let element = document.createElement('a');
  	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  	element.setAttribute('download', filename);

  	element.style.display = 'none';
  	document.body.appendChild(element);

  	element.click();

  	document.body.removeChild(element);
}

function copyToClipboard() {
  let copyText = document.getElementById("myInput");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

function showApex() {
	document.getElementById("apexCode").style.display = "block";
}