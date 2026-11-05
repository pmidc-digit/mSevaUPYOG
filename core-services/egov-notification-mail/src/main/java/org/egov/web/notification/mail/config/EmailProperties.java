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

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailProperties {

    // ─── Provider Toggle ─────────────────────────────────────────────────────
    @Value("${nic.mail.enabled:true}")
    @Getter
    private boolean nicMailEnabled;

    // ─── NIC: Both relay hosts (selected at send-time based on email content) ──
    @Value("${mail.nic.host.otp:relayotps.nic.in}")
    @Getter
    private String nicHostOtp;

    @Value("${mail.nic.host.smtpsgw:relaysmtpsgw.nic.in}")
    @Getter
    private String nicHostSmtpsgw;

    // ─── NIC: Connection ──────────────────────────────────────────────────────
    @Value("${mail.nic.port:465}")
    @Getter
    private Integer nicPort;

    @Value("${mail.nic.protocol:smtp}")
    @Getter
    private String nicProtocol;

    @Value("${mail.nic.sender.username}")
    @Getter
    private String nicSenderUsername;

    @Value("${mail.nic.sender.password}")
    @Getter
    private String nicSenderPassword;

    @Value("${mail.nic.smtp.from}")
    @Getter
    private String nicSenderFrom;

    // ─── NIC: SMTP options ────────────────────────────────────────────────────
    @Value("${mail.nic.smtp.auth:true}")
    @Getter
    private String nicSmtpAuth;

    @Value("${mail.nic.smtp.starttls.enable:true}")
    @Getter
    private String nicStartTlsEnabled;

    @Value("${mail.nic.smtp.starttls.required:true}")
    @Getter
    private String nicStartTlsRequired;

    @Value("${mail.nic.smtp.ssl.protocols:TLSv1.2}")
    @Getter
    private String nicSslProtocols;

    @Value("${mail.nic.smtp.ssl.trust:*}")
    @Getter
    private String nicSslTrust;

    @Value("${mail.nic.smtp.timeout:30000}")
    @Getter
    private String nicTimeout;

    @Value("${mail.nic.smtp.connectiontimeout:30000}")
    @Getter
    private String nicConnectionTimeout;

    @Value("${mail.nic.smtp.writetimeout:30000}")
    @Getter
    private String nicWriteTimeout;

    @Value("${mail.nic.smtp.debug:true}")
    @Getter
    private String nicSmtpDebug;

    // ─── Gmail: Connection ────────────────────────────────────────────────────
    @Value("${mail.gmail.host:smtp.gmail.com}")
    @Getter
    private String gmailHost;

    @Value("${mail.gmail.port:587}")
    @Getter
    private Integer gmailPort;

    @Value("${mail.gmail.protocol:smtp}")
    @Getter
    private String gmailProtocol;

    @Value("${mail.gmail.sender.username:}")
    @Getter
    private String gmailSenderUsername;

    @Value("${mail.gmail.sender.password:}")
    @Getter
    private String gmailSenderPassword;

    @Value("${mail.gmail.smtp.from:}")
    @Getter
    private String gmailSenderFrom;

    // ─── Gmail: SMTP options ──────────────────────────────────────────────────
    @Value("${mail.gmail.smtp.auth:true}")
    @Getter
    private String gmailSmtpAuth;

    @Value("${mail.gmail.smtp.starttls.enable:true}")
    @Getter
    private String gmailStartTlsEnabled;

    @Value("${mail.gmail.smtp.starttls.required:true}")
    @Getter
    private String gmailStartTlsRequired;

    @Value("${mail.gmail.smtp.ssl.protocols:TLSv1.2}")
    @Getter
    private String gmailSslProtocols;

    @Value("${mail.gmail.smtp.ssl.trust:smtp.gmail.com}")
    @Getter
    private String gmailSslTrust;

    @Value("${mail.gmail.smtp.timeout:30000}")
    @Getter
    private String gmailTimeout;

    @Value("${mail.gmail.smtp.connectiontimeout:30000}")
    @Getter
    private String gmailConnectionTimeout;

    @Value("${mail.gmail.smtp.writetimeout:30000}")
    @Getter
    private String gmailWriteTimeout;

    @Value("${mail.gmail.smtp.debug:false}")
    @Getter
    private String gmailSmtpDebug;

}