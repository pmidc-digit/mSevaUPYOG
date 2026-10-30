/*
 * eGov suite of products aim to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) 2016  eGovernments Foundation
 *
 *  The updated version of eGov suite of products as by eGovernments Foundation
 *  is available at http://www.egovernments.org
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see http://www.gnu.org/licenses/ or
 *  http://www.gnu.org/licenses/gpl.html .
 *
 *  In addition to the terms of the GPL license to be adhered to in using this
 *  program, the following additional terms are to be complied with:
 *
 *      1) All versions of this program, verbatim or modified must carry this
 *         Legal Notice.
 *
 *      2) Any misrepresentation of the origin of the material is prohibited. It
 *         is required that all modified versions of this material be marked in
 *         reasonable ways as different from the original version.
 *
 *      3) This license does not grant any rights to any user of the program
 *         with regards to rights under trademark law for use of the trade names
 *         or trademarks of eGovernments Foundation.
 *
 *  In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 */

package org.egov.web.notification.mail.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.Properties;

@Slf4j
@Configuration
public class ApplicationConfiguration {

    @Autowired
    private EmailProperties emailProperties;

    // ─── NIC OTP relay sender ─────────────────────────────────────────────────
    @Bean("nicOtpMailSender")
    public JavaMailSenderImpl nicOtpMailSender() {
        return buildNicSender(emailProperties.getNicHostOtp());
    }

    // ─── NIC SMTPSGW relay sender ─────────────────────────────────────────────
    @Bean("nicSmtpsgwMailSender")
    public JavaMailSenderImpl nicSmtpsgwMailSender() {
        return buildNicSender(emailProperties.getNicHostSmtpsgw());
    }

    // ─── Gmail sender ─────────────────────────────────────────────────────────
    @Bean("gmailMailSender")
    public JavaMailSenderImpl gmailMailSender() {
        log.info("Configuring Gmail sender | host={}", emailProperties.getGmailHost());
        final JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(emailProperties.getGmailHost());
        sender.setPort(emailProperties.getGmailPort());
        sender.setProtocol(emailProperties.getGmailProtocol());
        sender.setUsername(emailProperties.getGmailSenderUsername());
        sender.setPassword(emailProperties.getGmailSenderPassword());

        final Properties props = new Properties();
        props.setProperty("mail.smtp.auth",              emailProperties.getGmailSmtpAuth());
        props.setProperty("mail.smtp.starttls.enable",   emailProperties.getGmailStartTlsEnabled());
        props.setProperty("mail.smtp.starttls.required", emailProperties.getGmailStartTlsRequired());
        props.setProperty("mail.smtp.ssl.protocols",     emailProperties.getGmailSslProtocols());
        props.setProperty("mail.smtp.ssl.trust",         emailProperties.getGmailSslTrust());
        props.setProperty("mail.smtp.timeout",           emailProperties.getGmailTimeout());
        props.setProperty("mail.smtp.connectiontimeout", emailProperties.getGmailConnectionTimeout());
        props.setProperty("mail.smtp.writetimeout",      emailProperties.getGmailWriteTimeout());
        props.setProperty("mail.smtp.debug",             emailProperties.getGmailSmtpDebug());
        sender.setJavaMailProperties(props);
        return sender;
    }

    /** Shared helper — builds a NIC sender for the given relay host. */
    private JavaMailSenderImpl buildNicSender(String host) {
        log.info("Configuring NIC sender | host={}", host);
        final JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(emailProperties.getNicPort());
        sender.setProtocol(emailProperties.getNicProtocol());
        sender.setUsername(emailProperties.getNicSenderUsername());
        sender.setPassword(emailProperties.getNicSenderPassword());

        final Properties props = new Properties();
        props.setProperty("mail.smtp.auth",              emailProperties.getNicSmtpAuth());
        props.setProperty("mail.smtp.starttls.enable",   emailProperties.getNicStartTlsEnabled());
        props.setProperty("mail.smtp.starttls.required", emailProperties.getNicStartTlsRequired());
        props.setProperty("mail.smtp.ssl.protocols",     emailProperties.getNicSslProtocols());
        props.setProperty("mail.smtp.ssl.trust",         emailProperties.getNicSslTrust());
        props.setProperty("mail.smtp.timeout",           emailProperties.getNicTimeout());
        props.setProperty("mail.smtp.connectiontimeout", emailProperties.getNicConnectionTimeout());
        props.setProperty("mail.smtp.writetimeout",      emailProperties.getNicWriteTimeout());
        props.setProperty("mail.smtp.debug",             emailProperties.getNicSmtpDebug());
        // SMTPS mirror
        props.setProperty("mail.smtps.auth",             emailProperties.getNicSmtpAuth());
        props.setProperty("mail.smtps.starttls.enable",  emailProperties.getNicStartTlsEnabled());
        props.setProperty("mail.smtps.ssl.protocols",    emailProperties.getNicSslProtocols());
        props.setProperty("mail.smtps.ssl.trust",        emailProperties.getNicSslTrust());
        props.setProperty("mail.smtps.timeout",          emailProperties.getNicTimeout());
        props.setProperty("mail.smtps.connectiontimeout",emailProperties.getNicConnectionTimeout());
        props.setProperty("mail.smtps.writetimeout",     emailProperties.getNicWriteTimeout());
        props.setProperty("mail.smtps.debug",            emailProperties.getNicSmtpDebug());
        sender.setJavaMailProperties(props);
        return sender;
    }
    
    @Value("${egov.localization.host}")
    @Getter
    private String localizationHost;
    
    @Value("${egov.localization.context.path}")
    @Getter
    private String localizationContextPath;
    
    @Value("${egov.localization.search.endpoint}")
    @Getter
    private String localizationSearchEndpoint;
    

    @Value("${egov.user.host}")
    @Getter
    private String userHost;
    
    @Value("${egov.user.context.path}")
    @Getter
    private String userContextPath;
    
    @Value("${egov.user.search.endpoint}")
    @Getter
    private String userSearchEndpoint;
    
    @Value("${egov.user.state.tenant.id}")
    @Getter
    private String stateTenantId;
    
    
}
