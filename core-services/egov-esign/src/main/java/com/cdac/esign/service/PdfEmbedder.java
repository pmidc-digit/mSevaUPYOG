package com.cdac.esign.service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.xml.datatype.XMLGregorianCalendar;
import org.json.JSONObject;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;

import com.cdac.esign.xmlparser.XmlSigning;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfDate;
import com.itextpdf.text.pdf.PdfDictionary;
import com.itextpdf.text.pdf.PdfName;
import com.itextpdf.text.pdf.PdfSignature;
import com.itextpdf.text.pdf.PdfSignatureAppearance;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.PdfString;
import com.itextpdf.text.pdf.PdfSignatureAppearance.RenderingMode;
import com.itextpdf.kernel.geom.Rectangle;


import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;

import java.io.ByteArrayInputStream;
import com.itextpdf.kernel.pdf.PdfWriter;

import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts;




@Component
//@Scope("session")
public class PdfEmbedder {
    String    destFile=null;
   // HttpSession session = null;
    FileOutputStream fout;

     PdfSignatureAppearance appearance;

     @Autowired
     private Environment env;


     public Map<String, String> pdfSigner(byte[] file) {
    	    Map<String, String> responseMap = new HashMap<>();
    	    try {
    	        ByteArrayOutputStream baos = new ByteArrayOutputStream();
    	        PdfDocument pdfDoc = new PdfDocument(new PdfReader(new ByteArrayInputStream(file)), new PdfWriter(baos));
    	        PdfPage firstPage = pdfDoc.getPage(1);
    	        Rectangle pageSize = firstPage.getPageSize();

    	        float width = 200;
    	        float height = 60;
    	        float x = pageSize.getRight() - width - 20;
    	        float y = pageSize.getBottom() + 20;

    	        // Invisible stamp content
    	        String invisibleStamp =
    	                "Digitally Signed\n" +
    	                "Signed by: Temp User\n" +
    	                "Organization: Temp Org\n" +
    	                "Location: Temp Location\n" +
    	                "Reason: Temp Reason\n" +
    	                "Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

    	        // Use PdfCanvas to write invisible text
    	        PdfCanvas pdfCanvas = new PdfCanvas(firstPage);
    	        pdfCanvas.saveState();
    	        PdfExtGState gState = new PdfExtGState().setFillOpacity(0f); // Invisible
    	        pdfCanvas.setExtGState(gState);

    	        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
    	        pdfCanvas.beginText()
    	                 .setFontAndSize(font, 10)
    	                 .moveText(x, y)
    	                 .showText(invisibleStamp)
    	                 .endText();

    	        pdfCanvas.restoreState();
    	        pdfCanvas.release();

    	        pdfDoc.close();

    	        byte[] stampedPdfBytes = baos.toByteArray();

    	        // Compute SHA-256 hash
    	        String hashDocument = DigestUtils.sha256Hex(stampedPdfBytes);

    	        // Upload and get fileStoreId
    	        String fileStoreResponse = uploadPdfToFilestore(stampedPdfBytes, "pb", env);
    	        String fileStoreId = "";
    	        if (fileStoreResponse != null && fileStoreResponse.contains("fileStoreId")) {
    	            int idx = fileStoreResponse.indexOf("fileStoreId");
    	            int start = fileStoreResponse.indexOf(":", idx) + 2;
    	            int end = fileStoreResponse.indexOf("\"", start);
    	            if (start > 1 && end > start) {
    	                fileStoreId = fileStoreResponse.substring(start, end);
    	            }
    	        }

    	        responseMap.put("hash", hashDocument);
    	        responseMap.put("fileStoreId", fileStoreId);

    	    } catch (Exception e) {
    	        e.printStackTrace();
    	    }
    	    return responseMap;
    	}


    

     /**
      * Uploads a PDF byte array directly to filestore
      */
     public static String uploadPdfToFilestore(byte[] pdfBytes, String tenantId, Environment env) throws Exception {
         String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
         String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
         String uploadUrl = env.getProperty("filestore.upload.url", "/filestore/v1/files");
         URL url = new URL(baseUrl + uploadUrl);

         HttpURLConnection conn = (HttpURLConnection) url.openConnection();
         conn.setDoOutput(true);
         conn.setRequestMethod("POST");
         conn.setRequestProperty("accept", "application/json, text/plain, */*");
         conn.setRequestProperty("content-type", "multipart/form-data; boundary=" + boundary);

         try (DataOutputStream out = new DataOutputStream(conn.getOutputStream())) {
             // tenantId
             out.writeBytes("--" + boundary + "\r\n");
             out.writeBytes("Content-Disposition: form-data; name=\"tenantId\"\r\n\r\n");
             out.writeBytes(tenantId + "\r\n");

             // module
             out.writeBytes("--" + boundary + "\r\n");
             out.writeBytes("Content-Disposition: form-data; name=\"module\"\r\n\r\n");
             out.writeBytes(env.getProperty("default.module", "undefined") + "\r\n");

             // file
             out.writeBytes("--" + boundary + "\r\n");
             out.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"" + env.getProperty("default.signed.filename", "signed.pdf") + "\"\r\n");
             out.writeBytes("Content-Type: " + env.getProperty("default.content.type", "application/pdf") + "\r\n\r\n");
             out.write(pdfBytes);
             out.writeBytes("\r\n");

             out.writeBytes("--" + boundary + "--\r\n");
         }

         int responseCode = conn.getResponseCode();
         InputStream responseStream = (responseCode == 201) ? conn.getInputStream() : conn.getErrorStream();
         String response = readStream(responseStream);
         conn.disconnect();

         return response; // parse JSON to get fileStoreId if needed
     }

     private static String readStream(InputStream inputStream) throws IOException {
         ByteArrayOutputStream result = new ByteArrayOutputStream();
         byte[] buffer = new byte[8192];
         int length;
         while ((length = inputStream.read(buffer)) != -1) {
             result.write(buffer, 0, length);
         }
         return result.toString("UTF-8");
     }

public String signPdfwithDS(String response,HttpServletRequest request, HttpSession session) {
	session = request.getSession(false);
	//PdfSignatureAppearance appearance = (PdfSignatureAppearance)request.getSession().getAttribute("appearance");
	   int contentEstimated = 8192;
	   try {
		   if(request.getSession() == null) {
			   System.out.println("=================session===========");
		   }
	//   PdfSignatureAppearance appearance = (PdfSignatureAppearance)request.getSession().getAttribute("pdfHash");

	   //String esignRespResult = DocSignature;
       String errorCode = response.substring(response.indexOf("errCode"),response.indexOf("errMsg"));
       errorCode = errorCode.trim();
       if(errorCode.contains("NA")) {
		   String pkcsResponse = new XmlSigning().parseXml(response.trim());
		   byte[] sigbytes = Base64.decodeBase64(pkcsResponse);
		   byte[] paddedSig = new byte[contentEstimated];
		   System.arraycopy(sigbytes, 0, paddedSig, 0, sigbytes.length);
		   PdfDictionary dic2 = new PdfDictionary();
		   dic2.put(PdfName.CONTENTS,
		           new PdfString(paddedSig).setHexWriting(true));
		   //fout.close();
		   appearance.close(dic2);
       }
       else {
    	   destFile = "Error";
       }
	   }
	   catch(Exception e) {
		   e.printStackTrace();
	   }
	   return destFile;
	}
}
