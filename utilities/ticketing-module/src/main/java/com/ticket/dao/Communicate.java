package com.ticket.dao;

import java.net.HttpURLConnection;
import java.net.URL;

public class Communicate {
	public static Boolean sendSMS(String to, String msg) {
		try {
			URL url;
			HttpURLConnection connection = null;

			String strUrl = ("http://smsgateway.spicedigital.in/MessagingGateway/MessagePush?username=PMIDCTrans&password=Pmidc@1234&messageType=text&mobile="
					+ to + "&senderId=PBSEWA&message=" + msg);

			url = new URL(strUrl);
			connection = (HttpURLConnection) url.openConnection();
			connection.connect();

//		DataInputStream inp=new DataInputStream(connection.getInputStream());
			// String msg=inp.readLine();
			// out.print(msg);
			connection.disconnect();
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	/*
	 * public static Boolean sendMail(String to, String subject,String body) {
	 * String result; String from="ests.khanna@gmail.com"; String host =
	 * "smtp.gmail.com"; Properties properties = System.getProperties();
	 * properties.setProperty("mail.transport.protocol", "smtp");
	 * properties.setProperty("mail.smtp.host", host);
	 * properties.put("mail.smtp.auth", "true"); properties.put("mail.smtp.port",
	 * "465"); properties.put("mail.debug", "true");
	 * properties.put("mail.smtp.socketFactory.port", "465");
	 * properties.put("mail.smtp.socketFactory.class",
	 * "javax.net.ssl.SSLSocketFactory");
	 * properties.put("mail.smtp.socketFactory.fallback", "false");
	 * properties.put("mail.smtp.ssl.enable", "true"); Session mailSession =
	 * Session.getDefaultInstance(properties, new javax.mail.Authenticator() {
	 * protected PasswordAuthentication getPasswordAuthentication() { return new
	 * PasswordAuthentication("punjabulb@gmail.com","Pmidc@#7259126185"); }}); try {
	 * 
	 * Transport transport = mailSession.getTransport(); InternetAddress addressFrom
	 * = new InternetAddress(from); MimeMessage message = new
	 * MimeMessage(mailSession); message.setSender(addressFrom);
	 * message.setSubject(subject); message.setContent(body, "text/plain");
	 * message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
	 * 
	 * transport.connect(); Transport.send(message); transport.close(); return true;
	 * } catch (MessagingException mex) { mex.printStackTrace(); result =
	 * "Error: unable to send message...."; System.out.print(result + mex); return
	 * false; }
	 * 
	 * }
	 */

}
