package com.example.demo.controller;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
import java.util.TreeSet;

@RestController
public class HelperController {

	static final int PAUSE = 500; // milliseconds

	@PostMapping("/getQueuedData")
	public String retrieveResponseById(@RequestBody String data) {
		try {
			Thread.sleep(PAUSE);
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
		}
		JSONObject obj = new JSONObject(data);
		String sessionId = obj.getString("sessionId");
		String queuedId = obj.getString("queuedId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		double apiVersion = obj.getDouble("apiVersion");
		String typeName = obj.getString("typeName");
		String xmlfile = readFile("retrieveResponse.xml");
		xmlfile = xmlfile.replace("queuedIdVar", queuedId);
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);

		HttpResponse<String> response = null;
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			response = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.checkRetrieveStatus);
		} catch (Exception e) {
			System.err.println("getQueuedData - An error occurred in the sendPost() method " + e.getMessage());
			resultMap.put("Exception", e.getMessage());
		}
		resultMap.put("statusCode", response.statusCode());
		Set<String> xmlNameTypes = new HashSet<String>();
		if (response != null) {
			xmlNameTypes.addAll(parseXmlResponse(response.body()));
		}

		Set<String> standardObjects = new HashSet<String>();
		if (typeName.equalsIgnoreCase("customobject") && xmlNameTypes.size() > 0) {
			JSONObject jobj = null;
			for (Iterator<String> iterator = xmlNameTypes.iterator(); iterator.hasNext();) {
				String rawjson = (String) iterator.next();
				jobj = new JSONObject(rawjson);
				break;
			}
			if (jobj != null && jobj.has("success") && (boolean) jobj.get("success")) {
				String standardObjectsStr = readFile("standardObjects.txt");
				String[] standardObjectsArray = standardObjectsStr.split(",");
				for (int i = 0; i < standardObjectsArray.length; i++) {
					String standardObject = standardObjectsArray[i];
					standardObjects.add(standardObject);
				}
			}
		}

		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		if (standardObjects.size() > 0) {
			try {
				JSONArray stdObjects = new JSONArray(standardObjects.toString());
				resultMap.put("standardObjects", stdObjects);
			} catch (Exception e) {
				System.out.println(e.getMessage());
			}
		}
		resultMap.put("Response", jarray);
		return new JSONObject(resultMap).toString();
	}

	@PostMapping("/getObject")
	public String getObject(@RequestBody String data) {
		JSONObject obj = new JSONObject(data);
		String sessionId = obj.getString("sessionId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		float apiVersion = Float.valueOf(obj.getString("apiVersion"));
		String objectName = obj.getString("objectName");
		String xmlfile = readFile("readMetadata.xml");
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);
		xmlfile = xmlfile.replace("objectNameVar", objectName);

		HttpResponse<String> response = null;
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			response = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.readMetadata);
		} catch (Exception e) {
			System.err.println("getMetadataByType - An error occurred in the sendPost() method " + e.getMessage());
			resultMap.put("Exception", e.getMessage());
		}

		resultMap.put("statusCode", response.statusCode());
		Set<String> xmlNameTypes = new HashSet<String>();
		if (response != null) {
			xmlNameTypes.addAll(parseXmlResponse(response.body()));
		}

		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		resultMap.put("Response", jarray);
		return new JSONObject(resultMap).toString();
	}

	@PostMapping("/getMetadataByType")
	public String getMetadataByType(@RequestBody String data) {
		JSONObject obj = new JSONObject(data);
		String sessionId = obj.getString("sessionId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		float apiVersion = Float.valueOf(obj.getString("apiVersion"));
		String typeName = obj.getString("typeName");
		String xmlfile = readFile("retrieveRequest.xml");
		xmlfile = xmlfile.replace("typeNameVar", typeName);
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);
		xmlfile = xmlfile.replace("apiVersionVar", String.valueOf(apiVersion));

		HttpResponse<String> response = null;
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			response = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.retrieveRequest);
		} catch (Exception e) {
			System.err.println("getMetadataByType - An error occurred in the sendPost() method " + e.getMessage());
			resultMap.put("Exception", e.getMessage());
		}

		resultMap.put("statusCode", response.statusCode());
		Set<String> xmlNameTypes = new HashSet<String>();
		if (response != null) {
			xmlNameTypes.addAll(parseXmlResponse(response.body()));
		}

		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		resultMap.put("Response", jarray);
		return new JSONObject(resultMap).toString();
	}

	@PostMapping("/getConnection")
	public String init(@RequestBody String data) {
		JSONObject obj = new JSONObject(data);
		String sessionId = obj.getString("sessionId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		float apiVersion = Float.valueOf(obj.getString("apiVersion"));
		String xmlfile = readFile("describeMetadata.xml");
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);
		xmlfile = xmlfile.replace("apiVersionVar", String.valueOf(apiVersion));

		HttpResponse<String> response = null;
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			response = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.retrieveRequest);
		} catch (Exception e) {
			System.err.println("getConnection - An error occurred in the sendPost() method " + e.getMessage());
			resultMap.put("Exception", e.getMessage());
		}

		resultMap.put("statusCode", response.statusCode());
		Set<String> xmlNameTypes = new HashSet<String>();
		if (response != null) {
			xmlNameTypes.addAll(parseXmlResponse(response.body()));
		}

		if (!xmlNameTypes.isEmpty()) {
			String metadataTypesData = readFile("metadataTypes.txt");
			if (!metadataTypesData.isBlank()) {
				String[] mtypesArr = metadataTypesData.split(",");
				for (int i = 0; i < mtypesArr.length; i++) {
					xmlNameTypes.add(mtypesArr[i]);
				}
			}
		}
		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		resultMap.put("Response", jarray);
		return new JSONObject(resultMap).toString();
	}

	@PostMapping("/getAllApiVersions")
	public String getApiVersions(@RequestBody String data) {
		JSONObject obj = new JSONObject(data);
		String baseUrl = obj.getString("baseUrl");
		String uri = baseUrl + "/services/data/";
		HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(uri))
				.header("Content-Type", "text/xml")
				.header("Accept", "application/json")
				.build();

		Map<String, Object> resultMap = new HashMap<String, Object>();
		HttpResponse<String> response = null;
		try {
			HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2).build();
			response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		} catch (Exception e) {
			System.err.println("getApiVersions - An error occurred in the sendPost() method " + e.getMessage());
			resultMap.put("Exception", e.getMessage());
		}

		resultMap.put("statusCode", response.statusCode());
		JSONArray jarray = new JSONArray(response.body());
		resultMap.put("Response", jarray);
		return new JSONObject(resultMap).toString();
	}

	private Set<String> parseXmlResponse(String xmlResponse) {
		Set<String> xmlNameTypes = new HashSet<String>();
		JSONObject xmlJSONObj = null;
		xmlJSONObj = XML.toJSONObject(xmlResponse);
		for (String keyEnvelope : xmlJSONObj.keySet()) {
			JSONObject xmlJSONObj2 = (JSONObject) xmlJSONObj.get(keyEnvelope);
			for (String keyBody : xmlJSONObj2.keySet()) {
				if (keyBody.equalsIgnoreCase("soapenv:Body")) {
					JSONObject xmlJSONObj3 = (JSONObject) xmlJSONObj2.get("soapenv:Body");
					if (xmlJSONObj3.has("soapenv:Fault")) {
						JSONObject faultObj = (JSONObject) xmlJSONObj3.get("soapenv:Fault");
						xmlNameTypes.add(faultObj.getString("faultstring"));
					} else {
						for (String key : xmlJSONObj3.keySet()) {
							JSONObject xmlJSONObj4 = (JSONObject) xmlJSONObj3.get(key);
							if (xmlJSONObj4.has("result")) {
								JSONObject xmlJSONObj5 = (JSONObject) xmlJSONObj4.get("result");
								if (xmlJSONObj5.has("metadataObjects")) {
									JSONArray metadataObjects = (JSONArray) xmlJSONObj5.get("metadataObjects");
									for (int i = 0; i < metadataObjects.length(); i++) {
										JSONObject metadataObject = metadataObjects.getJSONObject(i);
										if (metadataObject.has("xmlName")) {
											xmlNameTypes.add(metadataObject.getString("xmlName"));
										}
									}
								} else if (xmlJSONObj5.has("id")) {
									xmlNameTypes.add(xmlJSONObj5.toString());
								} else if (xmlJSONObj5.has("records")) {
									JSONObject records = (JSONObject) xmlJSONObj5.get("records");
									xmlNameTypes.add(records.toString());
								}
							}
						}
					}
				}
			}
		}
		return xmlNameTypes;
	}

	private String readFile(String fileName) {
		StringBuilder data = null;
		Scanner myReader = null;
		try {
			File myObj = new File(fileName);
			myReader = new Scanner(myObj);
			data = new StringBuilder("");
			while (myReader.hasNextLine()) {
				data.append(myReader.nextLine());
			}
		} catch (FileNotFoundException e) {
			System.err.println("readFile - An error occurred in the readFile() method " + e.getMessage());
			return e.getMessage();
		} finally {
			myReader.close();
		}
		return data.toString();
	}

	private HttpResponse<String> sendPost(String sessionId, String orgId, String baseUrl, double apiVersion,
			String xmlfile, MetadataApi retrieveType) throws Exception {
		String uri = baseUrl + "/services/Soap/m/" + apiVersion + "/" + orgId;
		HttpRequest request = HttpRequest.newBuilder()
				.POST(HttpRequest.BodyPublishers.ofString(xmlfile))
				.uri(URI.create(uri))
				.setHeader("SOAPAction", String.valueOf(retrieveType))
				.header("Content-Type", "text/xml")
				.build();

		HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2).build();
		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		return response;
	}

	private enum MetadataApi {
		retrieveRequest,
		retrieveResponse,
		checkRetrieveStatus,
		readMetadata
	}

}
