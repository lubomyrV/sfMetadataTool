package com.example.demo.controller;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;
import java.util.TreeSet;

@RestController
public class HelperController {
	
	static int pause = 1000;
	
	@PostMapping("/getQueuedData")
    public String retrieveResponseById (@RequestBody String data) {
		System.out.println("pause="+pause);
		try{
		    Thread.sleep(pause);
		}catch(InterruptedException ex){
		    Thread.currentThread().interrupt();
		}
		pause += 1000;
		JSONObject obj = new JSONObject(data);
		String sessionId = obj.getString("sessionId");
		String queuedId = obj.getString("queuedId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		double apiVersion = obj.getDouble("apiVersion");

		
		String xmlfile = readFile("retrieveResponse.xml");
		xmlfile = xmlfile.replace("queuedIdVar", queuedId);
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);			
		
		String responce =  "";
		try {
			responce = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.checkRetrieveStatus);
		} catch (Exception e) {
			System.out.println("An error occurred in the sendPost() method");		
			e.printStackTrace();
		}
		
		Set<String> xmlNameTypes = parseXmlResponse(responce);
		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		return jarray.toString();
	}
	
	@PostMapping("/getMetadataByType")
    public String getMetadataByType (@RequestBody String data) {
		JSONObject obj = new JSONObject(data);
		String sessionId = obj.getString("sessionId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		float apiVersion = obj.getFloat("apiVersion");
		String typeName = obj.getString("typeName");
		
		String xmlfile = readFile("retrieveRequest.xml");
		xmlfile = xmlfile.replace("typeNameVar", typeName);
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);			
		xmlfile = xmlfile.replace("apiVersionVar", String.valueOf(apiVersion));
		
		String responce =  "";
		try {
			responce = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.retrieveRequest);
		} catch (Exception e) {
			System.out.println("An error occurred in the sendPost() method");		
			e.printStackTrace();
		}
		
		Set<String> xmlNameTypes = parseXmlResponse(responce);
		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		if (jarray.length() > 0) {
			return jarray.get(0).toString();
		}
		return jarray.toString();
	}
	
	@PostMapping("/getConnection")
    public String init (@RequestBody String data) {
		JSONObject obj = new JSONObject(data);
		
		String sessionId = obj.getString("sessionId");
		String orgId = obj.getString("orgId");
		String baseUrl = obj.getString("baseUrl");
		float apiVersion = obj.getFloat("apiVersion");
		
		String xmlfile = readFile("describeMetadata.xml");
		
		xmlfile = xmlfile.replace("sessionIdVar", sessionId);			
		xmlfile = xmlfile.replace("apiVersionVar", String.valueOf(apiVersion));
		
		String responce =  "";
		try {
			responce = sendPost(sessionId, orgId, baseUrl, apiVersion, xmlfile, MetadataApi.retrieveRequest);
		} catch (Exception e) {
			System.out.println("An error occurred in the sendPost() method");		
			e.printStackTrace();
		}
		
		Set<String> xmlNameTypes = parseXmlResponse(responce);

		if (!xmlNameTypes.isEmpty()) {
			String metadataTypesData = readFile("metadataTypes.txt");
			String [] mtypesArr = metadataTypesData.split(";");
			for (int i = 0; i < mtypesArr.length; i++) {
				xmlNameTypes.add(mtypesArr[i]);
			}			
		}
		
		JSONArray jarray = new JSONArray(new TreeSet<String>(xmlNameTypes).toArray());
		return jarray.toString();
    }
	
	private Set<String> parseXmlResponse(String xmlResponse){
		Set<String> xmlNameTypes = new HashSet<String>();
		int PRETTY_PRINT_INDENT_FACTOR = 4;
		String jsonPrettyPrintString = "";
		JSONObject xmlJSONObj = null;
		try {
			xmlJSONObj = XML.toJSONObject(xmlResponse);
            jsonPrettyPrintString = xmlJSONObj.toString(PRETTY_PRINT_INDENT_FACTOR);
        } catch (JSONException je) {
        	System.out.println("An error occurred with parsing XML to JSON");
            System.out.println(je.toString());
        }
		System.out.println(xmlJSONObj);
		for (String keyEnvelope : xmlJSONObj.keySet()) {
            JSONObject xmlJSONObj2 = (JSONObject) xmlJSONObj.get(keyEnvelope);
            for (String keyBody : xmlJSONObj2.keySet()) {
            	if (keyBody.equalsIgnoreCase("soapenv:Body")) {
            		JSONObject xmlJSONObj3 = (JSONObject) xmlJSONObj2.get("soapenv:Body");
                	if (xmlJSONObj3.has("soapenv:Fault")) {
                		xmlNameTypes.add(String.valueOf(xmlJSONObj3.get("soapenv:Fault")));
                	} else {
                		for (String key : xmlJSONObj3.keySet()) {
                			JSONObject xmlJSONObj4 = (JSONObject) xmlJSONObj3.get(key);
	                    	System.out.println(xmlJSONObj4);
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
    	                    	} else if (xmlJSONObj5.has("id")){
        	                    	xmlNameTypes.add(xmlJSONObj5.toString());
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
	      System.out.println("An error occurred in the readFile() method");
	      e.printStackTrace();
	    } finally {
		     myReader.close();
		}
		return data.toString();
	}
	
	private String sendPost(String sessionId, String orgId, String baseUrl, double apiVersion, String xmlfile, MetadataApi retrieveType) throws Exception {
        String uri = baseUrl+"/services/Soap/m/"+apiVersion+"/"+orgId;
        System.out.println("xmlfile="+xmlfile);
        System.out.println("retrieveType="+retrieveType+";uri="+uri);
		HttpRequest request = HttpRequest.newBuilder()
        		.POST(HttpRequest.BodyPublishers.ofString(xmlfile))
        		.uri(URI.create(uri))
                .setHeader("SOAPAction", String.valueOf(retrieveType))
        		.header("Content-Type", "text/xml")
                .build();

        HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2).build();
		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("statusCode: "+response.statusCode());
        System.out.println("body: "+response.body());
        return response.body();
    }
	
	private enum MetadataApi {
		retrieveRequest,
		retrieveResponse,
		checkRetrieveStatus
	}

}
