package com.cdac.esign.xmlparser;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.StringReader;
import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.springframework.stereotype.Component;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import com.cdac.esign.form.FormXmlDataAsp;
/*
<Esign ver ="" sc ="" ts="" txn="" ekycId="" ekycIdType="" aspId=""
AuthMode="" responseSigType="" responseUrl="">
<Docs>
<InputHash id=""
hashAlgorithm="" docInfo="">Document
Hash in Hex</InputHash>
</Docs>
<Signature>Digital signature of ASP</Signature>
</Esign>
*/
@Component
public class AspXmlGenerator {

	public String finalGenerateAspXml(FormXmlDataAsp aspXmlDetais, HttpServletRequest request) {
		try {
			String xmlData = "";
			DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

			// root elements
			Document doc = docBuilder.newDocument();
			Element esign = doc.createElement("Esign");
			doc.appendChild(esign);

			// set attribute to esign Esign
			Attr attr = doc.createAttribute("ver");
			attr.setValue(aspXmlDetais.getVer());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("sc");
			attr.setValue(aspXmlDetais.getSc());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("ts");
			attr.setValue(aspXmlDetais.getTs());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("txn");
			attr.setValue(aspXmlDetais.getTxn());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("ekycId");
			attr.setValue(aspXmlDetais.getEkycId());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("ekycIdType");
			attr.setValue(aspXmlDetais.getEkycIdType());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("aspId");
			attr.setValue(aspXmlDetais.getAspId());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("AuthMode");
			attr.setValue(aspXmlDetais.getAuthMode());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("responseSigType");
			attr.setValue(aspXmlDetais.getResponseSigType());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("responseUrl");
			attr.setValue(aspXmlDetais.getResponseUrl());
			esign.setAttributeNode(attr);

			// Docs elements
			Element docs = doc.createElement("Docs");
			esign.appendChild(docs);

			// InputHash elements
			Element inputHash = doc.createElement("InputHash");

			// set attribute to staff element
			attr = doc.createAttribute("id");
			attr.setValue(aspXmlDetais.getId());
			inputHash.setAttributeNode(attr);

			attr = doc.createAttribute("hashAlgorithm");
			attr.setValue(aspXmlDetais.getHashAlgorithm());
			inputHash.setAttributeNode(attr);

			attr = doc.createAttribute("docInfo");
			attr.setValue(aspXmlDetais.getDocInfo());
			inputHash.setAttributeNode(attr);

			inputHash.appendChild(doc.createTextNode(aspXmlDetais.getDocHashHex()));
			docs.appendChild(inputHash);

			// Signature elements
			Element signature = doc.createElement("Signature");
			signature.appendChild(doc.createTextNode(aspXmlDetais.getDigSigAsp()));
			esign.appendChild(signature);

			// write the content into xml file
			TransformerFactory transformerFactory = TransformerFactory.newInstance();
			Transformer transformer = transformerFactory.newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			DOMSource source = new DOMSource(doc);

			// Root Directory.
		    String uploadRootPath = System.getProperty("java.io.tmpdir") + "/esign/uploads";
		    File uploadRootDir = new File(uploadRootPath);
		    if (!uploadRootDir.exists()) {
		       uploadRootDir.mkdirs();
		    }

		    try {
               File serverFile = new File(uploadRootDir.getAbsolutePath() + File.separator + "Testing.xml");
		       StringWriter writer = new StringWriter();
		       StreamResult result = new StreamResult(writer);
		       TransformerFactory tf = TransformerFactory.newInstance();
		       Transformer transformerTemp = tf.newTransformer();
		       transformerTemp.transform(source, result);

               BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(serverFile));
               stream.write(writer.toString().getBytes());
               xmlData = writer.toString();
               stream.close();

               return xmlData;
            } catch (Exception e) {
        		return "";
            }

		  } catch (ParserConfigurationException pce) {
			pce.printStackTrace();
			return "";
		  } catch (TransformerException tfe) {
			tfe.printStackTrace();
			return "";
		  }
	}

	public String generateAspXml(FormXmlDataAsp aspXmlDetais) {
		try {
			DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

			// root elements
			Document doc = docBuilder.newDocument();
			Element esign = doc.createElement("Esign");
			doc.appendChild(esign);

			// set attribute to esign Esign
			Attr attr = doc.createAttribute("ver");
			attr.setValue(aspXmlDetais.getVer());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("sc");
			attr.setValue(aspXmlDetais.getSc());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("ts");
			attr.setValue(aspXmlDetais.getTs());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("txn");
			attr.setValue(aspXmlDetais.getTxn());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("ekycId");
			attr.setValue(aspXmlDetais.getEkycId());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("ekycIdType");
			attr.setValue(aspXmlDetais.getEkycIdType());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("aspId");
			attr.setValue(aspXmlDetais.getAspId());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("AuthMode");
			attr.setValue(aspXmlDetais.getAuthMode());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("responseSigType");
			attr.setValue(aspXmlDetais.getResponseSigType());
			esign.setAttributeNode(attr);

			attr = doc.createAttribute("responseUrl");
			attr.setValue(aspXmlDetais.getResponseUrl());
			esign.setAttributeNode(attr);

			// Docs elements
			Element docs = doc.createElement("Docs");
			esign.appendChild(docs);

			// InputHash elements
			Element inputHash = doc.createElement("InputHash");

			attr = doc.createAttribute("id");
			attr.setValue(aspXmlDetais.getId());
			inputHash.setAttributeNode(attr);

			attr = doc.createAttribute("hashAlgorithm");
			attr.setValue(aspXmlDetais.getHashAlgorithm());
			inputHash.setAttributeNode(attr);

			attr = doc.createAttribute("docInfo");
			attr.setValue(aspXmlDetais.getDocInfo());
			inputHash.setAttributeNode(attr);

			inputHash.appendChild(doc.createTextNode(aspXmlDetais.getDocHashHex()));
			docs.appendChild(inputHash);

			// Convert document to XML string without writing to file
			TransformerFactory transformerFactory = TransformerFactory.newInstance();
			Transformer transformer = transformerFactory.newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			DOMSource source = new DOMSource(doc);

		    StringWriter writer = new StringWriter();
		    StreamResult result = new StreamResult(writer);
		    transformer.transform(source, result);

		    return writer.toString();
		  } catch (ParserConfigurationException pce) {
			pce.printStackTrace();
			  return "";
		  } catch (TransformerException tfe) {
			tfe.printStackTrace();
			  return "";
		  }
	}

	public void writeToXmlFile(String xmlIn, String fileName) {
		try {
			Document doc;
			doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xmlIn)));

			TransformerFactory transformerFactory = TransformerFactory.newInstance();
			Transformer transformer = transformerFactory.newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			DOMSource source = new DOMSource(doc);
           File serverFile = new File(fileName);

		   StringWriter writer = new StringWriter();
		   StreamResult result = new StreamResult(writer);
		   TransformerFactory tf = TransformerFactory.newInstance();
		   Transformer transformerTemp = tf.newTransformer();
		   transformerTemp.transform(source, result);

		   BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(serverFile));
		   stream.write(writer.toString().getBytes());
		   stream.close();

        } catch (Exception e) {
        	e.printStackTrace();
        }
	}
}
