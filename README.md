# sfMetadataTool

A simple web app based on Spring Boot, it connects to an org, retrieves metadata, and creates a package.xml file. The app communicates with Salesforce Metadata API via SOAP protocol. An example of [the created file](https://github.com/lubomyrV/sfMetadataTool/blob/master/package.xml).

In order to compile this app - the following tools are needed:

1) JRE,JDK v.8

2) Apache Maven 3.3.9

To assembly via command line, type:

`mvn clean`

`mvn compile`

`mvn package`

In order to run the app, go to the `target/` folder and type

`$ java -jar demo-0.0.1-SNAPSHOT.jar`

Open `http://localhost:8080/` to connect to org.

![example](https://github.com/lubomyrV/sfMetadataTool/blob/master/sfmd1.png)
