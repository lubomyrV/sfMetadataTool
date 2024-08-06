# sfMetadataTool

A simple web app based on Spring Boot, it connects to an org, retrieves metadata, and creates a package.xml file. The app communicates with Salesforce Metadata API via SOAP protocol. An example of [the created file](https://github.com/lubomyrV/sfMetadataTool/blob/master/package.xml).

Here is an article that describes how it works https://medium.com/@lubomyr.voloschak/salesforce-metadata-api-f7aa2fb94f76

In order to compile this app - the following tools are needed:

1) JRE,JDK v.8

2) Apache Maven 3.3.9

To assembly via command line, type:

`mvn clean`

`mvn compile`

`mvn package`

In order to run the app, go to the `target/` folder and type

`$ java -jar demo-0.0.1-SNAPSHOT.jar`

All config files `standardObjects.txt, metadataTypes.txt, retrieveResponse.xml, retrieveRequest.xml, readMetadata.xml, describeSObjects.xml  and describeMetadata.xml` should be in the same folder as the demo-0.0.1-SNAPSHOT.jar file.

Open `http://localhost:8080/` and fill in credentials to connect to your org.

![example](https://github.com/lubomyrV/sfMetadataTool/blob/master/sfmd2.png)
