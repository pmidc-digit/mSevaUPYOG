/*
 * eGov  SmartCity eGovernance suite aims to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) <2019>  eGovernments Foundation
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
 *      Further, all user interfaces, including but not limited to citizen facing interfaces,
 *         Urban Local Bodies interfaces, dashboards, mobile applications, of the program and any
 *         derived works should carry eGovernments Foundation logo on the top right corner.
 *
 *      For the logo, please refer http://egovernments.org/html/logo/egov_logo.png.
 *      For any further queries on attribution, including queries on brand guidelines,
 *         please contact contact@egovernments.org
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

package org.egov.edcr.web.controller.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.egov.infra.validation.exception.ApplicationRestException;
import org.egov.infra.web.rest.error.ErrorResponse;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/rest/dcr")
@Validated
public class RestExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(RestExceptionHandler.class);

    @GetMapping(value = "/error", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<ErrorResponse> getHandleError(HttpServletRequest request, HttpServletResponse response) {
        return buildErrorResponse(request);
    }

    @PostMapping(value = "/error", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<ErrorResponse> postHandleError(HttpServletRequest request, HttpServletResponse response) {
        return buildErrorResponse(request);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(HttpServletRequest request) {
        Object exAttr = request.getAttribute("javax.servlet.error.exception");
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        String messageAttr = (String) request.getAttribute("javax.servlet.error.message");

        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (statusCode != null) {
            try {
                HttpStatus parsed = HttpStatus.valueOf(statusCode);
                status = (parsed != HttpStatus.INTERNAL_SERVER_ERROR) ? parsed : HttpStatus.BAD_REQUEST;
            } catch (Exception e) {
                status = HttpStatus.BAD_REQUEST;
            }
        }

        String errorCode = "BAD_REQUEST";
        String errorMessage = "An error occurred while processing the request.";

        if (exAttr instanceof ApplicationRestException) {
            ApplicationRestException are = (ApplicationRestException) exAttr;
            if (are.getErrorCode() != null && !are.getErrorCode().trim().isEmpty() && !"INTERNAL_SERVER_ERROR".equalsIgnoreCase(are.getErrorCode())) {
                errorCode = are.getErrorCode();
            }
            if (are.getMessage() != null && !are.getMessage().trim().isEmpty()) {
                errorMessage = are.getMessage();
            }
        } else if (exAttr instanceof Throwable) {
            Throwable t = (Throwable) exAttr;
            errorMessage = extractRootCauseMessage(t);
        } else if (messageAttr != null && !messageAttr.trim().isEmpty()) {
            errorMessage = messageAttr;
        }

        if (errorMessage != null && !Jsoup.isValid(errorMessage, Whitelist.basic())) {
            errorMessage = "Invalid request input or parameters";
        }

        if (exAttr instanceof Throwable) {
            LOGGER.error("Servlet error page dispatched to /rest/dcr/error: [status: {}, code: {}] {}", status, errorCode, errorMessage, (Throwable) exAttr);
        } else {
            LOGGER.error("Servlet error page dispatched to /rest/dcr/error: [status: {}, code: {}] {}", status, errorCode, errorMessage);
        }
        ErrorResponse errorResponse = new ErrorResponse(errorCode, errorMessage, status);
        return new ResponseEntity<>(errorResponse, status);
    }

    private String extractRootCauseMessage(Throwable t) {
        if (t == null) {
            return "Unknown error occurred";
        }
        Throwable current = t;
        Throwable deepest = t;
        String lastMsg = null;
        String wrapperContext = null;

        while (current != null) {
            deepest = current;
            String m = current.getMessage();
            if (m != null && !m.trim().isEmpty()) {
                m = m.trim();
                if (m.endsWith(": null") || m.equalsIgnoreCase("null") || m.endsWith("Exception: null")) {
                    if (m.contains(":")) {
                        wrapperContext = m.substring(0, m.lastIndexOf(":")).trim();
                    }
                } else if (!"could not execute statement".equalsIgnoreCase(m) && !"null".equalsIgnoreCase(m) && !"Internal Server Error".equalsIgnoreCase(m)) {
                    lastMsg = m;
                }
            }
            current = current.getCause();
        }

        if (lastMsg == null) {
            String location = getExceptionLocation(deepest);
            String exName = deepest != null ? deepest.getClass().getSimpleName() : t.getClass().getSimpleName();
            String detailed = location != null ? exName + " at " + location : exName;

            if (wrapperContext != null && !wrapperContext.isEmpty()) {
                lastMsg = wrapperContext + ": " + detailed;
            } else {
                lastMsg = detailed;
            }
        }

        if (lastMsg == null) {
            lastMsg = deepest != null ? deepest.getClass().getSimpleName() : t.getClass().getSimpleName();
        }

        String cleaned = lastMsg.replace("\"", "'").replace("\r", " ").replace("\n", " ").trim();
        return cleaned.length() <= 250 ? cleaned : cleaned.substring(0, 250);
    }

    private String getExceptionLocation(Throwable t) {
        if (t == null || t.getStackTrace() == null || t.getStackTrace().length == 0) {
            return null;
        }
        for (StackTraceElement elem : t.getStackTrace()) {
            String className = elem.getClassName();
            if (className.startsWith("org.egov.")) {
                String simpleName = className.substring(className.lastIndexOf('.') + 1);
                return simpleName + "." + elem.getMethodName() + "(line " + elem.getLineNumber() + ")";
            }
        }
        StackTraceElement first = t.getStackTrace()[0];
        String simpleName = first.getClassName().substring(first.getClassName().lastIndexOf('.') + 1);
        return simpleName + "." + first.getMethodName() + "(line " + first.getLineNumber() + ")";
    }
}
