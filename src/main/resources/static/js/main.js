$(document).ready(function () {
	console.log("document: ready");
	//init();			
});

function connect(){
	$("#showTypes").empty();
	$('<p>Connecting...</p>').appendTo("#showTypes");

    let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
    //console.log("connect="+JSON.stringify(data));

    let packageMap = new Map();
	console.log(packageMap);
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
				console.log(metadataTypes);

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
	let metadataType = $("#typeName").val();
	if (metadataType === "CustomField"){
		metadataType = "CustomObject";
	}
	data["typeName"] = metadataType;
    console.log("selectedType="+JSON.stringify(data));

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
				console.log(new Date());
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
	let metadataType = $("#typeName").val();

	if (metadataType === "CustomField"){
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
				console.log(jResult);

				if (queuedResult.length == 1){
					let queuedObj = JSON.parse(queuedResult[0]);
					//console.log(queuedObj);
					if (queuedObj.hasOwnProperty("success") && !queuedObj.success){
					  	let jobId = localStorage.getItem("queuedId");
						$("#showItems").empty();
						$('<p>status: '+queuedObj.status+'</p>').appendTo("#showItems");

						getQueuedResult(jobId);
					} else {
						console.log(new Date());
						if (queuedObj.hasOwnProperty("fileProperties")){
							let typeComponents = queuedObj.fileProperties;
				            $("#showItems").empty();
							$("#showObjects").empty();
							let metadataType = $("#typeName").val();
							
						  	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
							
							if (!packageMap.has(metadataType)){
								console.log('added new type '+metadataType);
								packageMap.set(metadataType, []);
							}
							let oldSelectedList = packageMap.get(metadataType);
							console.log('oldSelectedList '+oldSelectedList);

							let componentNames = [];
							for (let i = 0; i < typeComponents.length; i++) {
								let component = typeComponents[i];
								componentNames.push(component.fullName);
							}		
							console.log(componentNames);
							console.log("jResult.hasOwnProperty('standardObjects') "+jResult.hasOwnProperty("standardObjects"));
							if (jResult.hasOwnProperty("standardObjects")){
								let standardObjects = jResult.standardObjects;
								console.log(standardObjects);
								for (let i = 0; i < standardObjects.length; i++) {
									componentNames.push(standardObjects[i]);
								}
							}
							
							componentNames.sort();

							
							if (metadataType === "CustomField"){
								console.log(metadataType);
								let selectObjects = '';
					           	selectObjects += '<label for="objectName">Choose an object:</label>';
								selectObjects += '<select name="objectName" id="objectName" onchange="selectedObject()">';
								selectObjects += '<option value=""></option>';
								for (let i = 0; i < componentNames.length; i++) {
									selectObjects += '<option value="'+componentNames[i]+'">'+componentNames[i]+'</option>';
								}
								selectObjects += '</select>';
					            $(selectObjects).appendTo("#showObjects");
								console.log(componentNames);
								return ;
							}
							
							createTable(oldSelectedList, componentNames);

						}
					}
				}
			}
		},
		error : function(e) {
			console.error("ERROR: ", e);
		}
    });
}

function createTable(oldSelectedList, componentNames){
	let metadataType = $("#typeName").val();
	let objectName = "";
	if (metadataType === "CustomField"){
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
			let thisValue = componentFullName;
			if (objectName.length > 0){
				thisValue = objectName +'.'+componentFullName;
			}
			let selected = oldSelectedList.includes(componentFullName);
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
	let data = {}
    data["orgId"] = $("#orgId").val();
    data["baseUrl"] = $("#baseUrl").val();
    data["sessionId"] = $("#sessionId").val();
    data["apiVersion"] = $("#apiVersion").val();
	data["objectName"] = $("#objectName").val();;
    console.log("selectedObject="+JSON.stringify(data));

	$.ajax({
    	type : "POST",
		contentType : "application/json",
		url : "/getFieldsByObject",
		data : JSON.stringify(data),
		dataType : 'text',
		success : function(result) {
			console.log(result);
			let jResult = JSON.parse(result);
			
			if (jResult.statusCode != 200){
				$('<p>statusCode='+jResult.statusCode+'; Response='+jResult.Response+'</p>').appendTo("#showTypes");
				console.log(new Date());
			} else {
				let fields = jResult.Response;
				console.log(fields);
				
				$("#showItems").empty();
				let metadataType = $("#typeName").val();
				
			  	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
				
				if (!packageMap.has(metadataType)){
					console.log('added new type '+metadataType);
					packageMap.set(metadataType, []);
				}
				let oldSelectedList = packageMap.get(metadataType);
				console.log('oldSelectedList '+oldSelectedList);
		
				fields.sort();
				
				createTable(oldSelectedList, fields);
			}
		},
		error : function(e) {
			console.error("ERROR: ", e);
		}
    });
}

function selectAll(source) {
	console.log('selectAll');
 	let checkboxes = document.getElementsByName('component');
	console.log(source +' '+source.checked);
	console.log(checkboxes);

	for( let i = 0; i < checkboxes.length; i++){ 
    	checkboxes[i].checked = source.checked;
	}
}


function addComponent(){
  	let packageMap = new Map(JSON.parse(localStorage.getItem("packageMap")));
	
	let newSelectedSet = [];
	$('#componentsId input:checked').each(function() {
		if ($(this).attr('value')!= undefined){
	    	newSelectedSet.push($(this).attr('value'));			
		}
	});
	
	let typeName = $("#typeName").val();

	if(!packageMap.has(typeName)){
		console.log('added new type '+typeName);
		packageMap.set(typeName, []);
	}
	if (newSelectedSet.length > 0){
		console.log('concat '+typeName);
		let oldList = packageMap.get(typeName);
		console.log('before oldList '+oldList);
		for( let i = 0; i < newSelectedSet.length; i++){ 
			// to do: debug this section! something is wrong
    		oldList.push(newSelectedSet[i]);
			console.log('add '+newSelectedSet[i]);
		}
		oldList.sort();
		console.log('after oldList '+oldList);
		packageMap.set(typeName, Array.from(newSelectedSet));
	} else {
		console.log('delete '+typeName);
		packageMap.delete(typeName);
	}
	console.log(packageMap);
	
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
		
		packageTree += '<input type="submit" value="create file" onclick="createPackageXml()"><br/>';
	    $(packageTree).appendTo("#packageTreeId");

	}
}

function carretFunc(element){
	console.log(element);
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
