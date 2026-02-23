package com.cdac.esign.xmlparser;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.StringReader;
import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import com.cdac.esign.form.FormXmlDataAsp;

@Component
public class AspXmlGenerator {

    private static final Logger logger = LoggerFactory.getLogger(AspXmlGenerator.class);

    // 1. Generates the raw XML (To be signed by ASP)
    public String generateAspXml(FormXmlDataAsp aspXmlDetais) {
        try {
            Document doc = buildBaseDocument(aspXmlDetais);
            return convertDocumentToString(doc);
        } catch (Exception e) {
            logger.error("Error generating ASP XML", e);
            return "";
        }
    }

    // 2. Generates the Final XML (Includes the <Signature> tag)
    public String finalGenerateAspXml(FormXmlDataAsp aspXmlDetais, HttpServletRequest request) {
        try {
            Document doc = buildBaseDocument(aspXmlDetais);

            // Append the ASP Signature element
            Element esign = (Element) doc.getFirstChild();
            Element signature = doc.createElement("Signature");
            signature.appendChild(doc.createTextNode(aspXmlDetais.getDigSigAsp()));
            esign.appendChild(signature);

            // Convert to String
            String xmlData = convertDocumentToString(doc);

            // Optional: Write to file for debugging
            saveXmlToTempFile(xmlData, "Testing.xml");

            return xmlData;
        } catch (Exception e) {
            logger.error("Error generating Final ASP XML", e);
            return "";
        }
    }

    // --- Helper Methods to remove Code Duplication ---

    private Document buildBaseDocument(FormXmlDataAsp details) throws Exception {
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
        Document doc = docBuilder.newDocument();

        // Root <Esign>
        Element esign = doc.createElement("Esign");
        doc.appendChild(esign);

        // Attributes
        setAttr(doc, esign, "ver", details.getVer());
        setAttr(doc, esign, "sc", details.getSc());
        setAttr(doc, esign, "ts", details.getTs());
        setAttr(doc, esign, "txn", details.getTxn());
        setAttr(doc, esign, "ekycId", details.getEkycId());
        setAttr(doc, esign, "ekycIdType", details.getEkycIdType());
        setAttr(doc, esign, "aspId", details.getAspId());
        setAttr(doc, esign, "AuthMode", details.getAuthMode());
        setAttr(doc, esign, "responseSigType", details.getResponseSigType());
        setAttr(doc, esign, "responseUrl", details.getResponseUrl());

        // <Docs>
        Element docs = doc.createElement("Docs");
        esign.appendChild(docs);

        // <InputHash>
        Element inputHash = doc.createElement("InputHash");
        setAttr(doc, inputHash, "id", details.getId());
        setAttr(doc, inputHash, "hashAlgorithm", details.getHashAlgorithm());
        setAttr(doc, inputHash, "docInfo", details.getDocInfo());
        
        // CRITICAL: This Hash must be from the Prepared (Blank Field) PDF
        inputHash.appendChild(doc.createTextNode(details.getDocHashHex()));
        docs.appendChild(inputHash);

        return doc;
    }

    private void setAttr(Document doc, Element el, String name, String value) {
        if (value == null) value = "";
        Attr attr = doc.createAttribute(name);
        attr.setValue(value);
        el.setAttributeNode(attr);
    }

    private String convertDocumentToString(Document doc) throws Exception {
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes"); // formatted
        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes"); // usually required for C-DAC
        
        DOMSource source = new DOMSource(doc);
        StringWriter writer = new StringWriter();
        StreamResult result = new StreamResult(writer);
        transformer.transform(source, result);
        return writer.toString();
    }

    private void saveXmlToTempFile(String xmlData, String fileName) {
        try {
            String uploadRootPath = System.getProperty("java.io.tmpdir") + File.separator + "esign" + File.separator + "uploads";
            File uploadRootDir = new File(uploadRootPath);
            if (!uploadRootDir.exists()) {
                uploadRootDir.mkdirs();
            }
            File serverFile = new File(uploadRootDir.getAbsolutePath() + File.separator + fileName);
            try (BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(serverFile))) {
                stream.write(xmlData.getBytes());
            }
        } catch (Exception e) {
            logger.warn("Could not save debug XML file: " + e.getMessage());
        }
    }

    // Secured XML Writer
    public void writeToXmlFile(String xmlIn, String fileName) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // XXE Protection
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            
            Document doc = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xmlIn)));
            String safeXml = convertDocumentToString(doc);
            
            try (FileOutputStream fos = new FileOutputStream(new File(fileName))) {
                fos.write(safeXml.getBytes());
            }
        } catch (Exception e) {
            logger.error("Error writing XML to file", e);
        }
    }
}