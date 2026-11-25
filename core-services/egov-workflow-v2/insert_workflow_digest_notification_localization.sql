-- =========================================================================================
-- SQL SCRIPT FOR PUNJAB WORKFLOW DAILY WORKLOAD DIGEST NOTIFICATIONS
-- Database: PostgreSQL | Table: message (egov-localization service)
-- State: Punjab (tenantid = 'pb') | Locale: en_IN
-- Module: rainmaker-workflow
--
-- STRICT ROLE ISOLATION:
-- 1. EG_WF_DIGEST_EMAIL: For Employees/Officers. Zero mention of "citizen" or "applicant".
-- 2. EG_WF_DIGEST_EMAIL_CITIZEN: For Citizens/Applicants. Zero mention of "employee" or "officer".
--    Contains the 5-day submission deadline advisory.
-- 3. EG_WF_DIGEST_MSG: SMS DLT template for pending workload digest.
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- STEP 1: CLEANUP EXISTING DIGEST ENTRIES (IDEMPOTENT EXECUTION)
-- -----------------------------------------------------------------------------------------
DELETE FROM message
WHERE code IN ('EG_WF_DIGEST_MSG', 'EG_WF_DIGEST_EMAIL', 'EG_WF_DIGEST_EMAIL_CITIZEN')
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rainmaker-workflow';


-- -----------------------------------------------------------------------------------------
-- STEP 2: INSERT WORKLOAD DIGEST NOTIFICATION TEMPLATES
-- -----------------------------------------------------------------------------------------

-- 1. Daily Workload Digest SMS Notification (DLT Template: EG_WF_DIGEST_MSG)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'b2c3d4e5-wf03-4434-a928-cb5222a25003',
    'en_IN',
    'EG_WF_DIGEST_MSG',
    'Dear {1}, you have {2} pending application(s) across {3} municipal service(s) awaiting your action on mSeva Punjab. Please login to review and process: mseva.lgpunjab.gov.in - PMIDC',
    'pb',
    'rainmaker-workflow',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
);

-- 2. Official Daily Pendency Report HTML Email Notification for EMPLOYEES (Code: EG_WF_DIGEST_EMAIL)
-- Strictly for department officers/employees. Zero mention of "citizen".
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'b2c3d4e5-wf04-4434-a928-cb5222a25004',
    'en_IN',
    'EG_WF_DIGEST_EMAIL',
    '<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Official Daily Pendency Report | mSeva Punjab</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #eef2f6; font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif; }

    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-shell { border-radius: 0 !important; }
      .outer-padding { padding: 12px 6px !important; }
      .content-padding { padding: 22px 18px !important; }
      .header-padding { padding: 20px 18px !important; }
      .ribbon-padding { padding: 12px 18px !important; }
      .header-stack { display: block !important; width: 100% !important; text-align: left !important; padding-left: 0 !important; }
      .badge-wrap { padding-top: 12px !important; }
      .kpi-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .kpi-spacer { display: block !important; width: 100% !important; height: 12px !important; }
      .btn-block { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#eef2f6; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#1e293b; -webkit-font-smoothing:antialiased;">

  <!-- Hidden Inbox Preheader -->
  <div style="display:none; font-size:1px; color:#eef2f6; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
    Official Daily Pendency Report: {2} pending application(s) across {3} service(s) on mSeva Punjab as of {5}.&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="outer-padding" style="background-color:#eef2f6; padding:28px 12px;">
    <tr>
      <td align="center">

        <!-- Main Email Container Wrapper -->
        <table role="presentation" class="email-container" width="620" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; width:100%;">
          <tr>
            <td>
              <div class="email-shell" style="background-color:#ffffff; border:1px solid #d5dde7; border-radius:10px; overflow:hidden; box-shadow:0 4px 14px rgba(11, 37, 69, 0.06);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#ffffff;">

                  <!-- Top Official Accent Strip -->
                  <tr>
                    <td style="background-color:#d97706; height:5px; font-size:0; line-height:0;">&nbsp;</td>
                  </tr>

                  <!-- Official Government Header -->
                  <tr>
                    <td class="header-padding" style="background-color:#0b2545; padding:24px 32px; border-bottom:3px solid #1d4ed8;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="header-stack" align="left" valign="middle">
                            <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:#fbbf24;">
                              Government of Punjab
                            </p>
                            <h1 style="margin:0; font-size:21px; font-weight:700; color:#ffffff; letter-spacing:0.2px; line-height:1.25;">
                              Department of Local Government
                            </h1>
                            <p style="margin:6px 0 0 0; font-size:12.5px; color:#cbd5e1; letter-spacing:0.2px;">
                              mSeva Punjab &nbsp;&bull;&nbsp; Municipal Governance &amp; Workflow Portal
                            </p>
                          </td>
                          <td class="header-stack badge-wrap" align="right" valign="middle" style="padding-left:14px;">
                            <span style="display:inline-block; background-color:#17365d; border:1px solid #fbbf24; border-radius:20px; color:#fbbf24; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:6px 12px; white-space:nowrap;">
                              &#9679;&nbsp; Pendency Report
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Subject & Reference Ribbon -->
                  <tr>
                    <td class="ribbon-padding" style="background-color:#f8fafc; padding:14px 32px; border-bottom:1px solid #e2e8f0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="left" style="font-size:12.5px; font-weight:700; color:#0b2545; text-transform:uppercase; letter-spacing:0.4px;">
                            Subject: Daily Pendency Report of Assigned Applications
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-top:5px; font-size:11.5px; color:#64748b;">
                            Generated On: <strong style="color:#1e293b;">{5}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Report Type: <strong style="color:#1e293b;">Daily Consolidated Report</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Body Content -->
                  <tr>
                    <td class="content-padding" style="padding:28px 32px;">

                      <!-- Salutation -->
                      <p style="margin:0 0 14px 0; font-size:15px; color:#0f172a;">
                        Dear <strong style="color:#0b2545;">{1}</strong>,
                      </p>

                      <!-- Formal Administrative Text -->
                      <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:#334155;">
                        {10}
                      </p>

                      <!-- Summary Metrics (Enhanced Executive KPI Cards) -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px 0;">
                        <tr>

                          <!-- Card 1: Total Pending Applications -->
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(11, 37, 69, 0.06);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#0b2545; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:16px 18px 14px 18px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:10px;">
                                      <tr>
                                        <td align="left" valign="middle" style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#475569; line-height:1.3;">
                                          Total Pending<br>Applications
                                        </td>
                                        <td align="right" valign="top" style="padding-left:6px;">
                                          <span style="display:inline-block; background-color:#e0e7ff; color:#1e3a8a; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; padding:3px 8px; border-radius:12px; white-space:nowrap;">
                                            Pending
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                    <div style="font-size:38px; font-weight:700; color:#0b2545; line-height:1.05; letter-spacing:-0.5px;">
                                      {2}
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="background-color:#f1f5f9; border-top:1px solid #e2e8f0; padding:9px 18px; font-size:11.5px; font-weight:600; color:#475569; line-height:1.4;">
                                    <span style="color:#1d4ed8; font-size:10px; vertical-align:middle;">&#9679;</span>&nbsp; {11}
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>

                          <!-- Responsive Spacer -->
                          <td class="kpi-spacer" width="4%" style="font-size:0; line-height:0;">&nbsp;</td>

                          <!-- Card 2: Active Services / Modules -->
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #f3d9a4; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(180, 83, 9, 0.07);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#d97706; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:16px 18px 14px 18px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:10px;">
                                      <tr>
                                        <td align="left" valign="middle" style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#785a28; line-height:1.3;">
                                          Active Services /<br>Modules
                                        </td>
                                        <td align="right" valign="top" style="padding-left:6px;">
                                          <span style="display:inline-block; background-color:#fef3c7; color:#92400e; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; padding:3px 8px; border-radius:12px; white-space:nowrap;">
                                            Impacted
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                    <div style="font-size:38px; font-weight:700; color:#b45309; line-height:1.05; letter-spacing:-0.5px;">
                                      {3}
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="background-color:#fffbeb; border-top:1px solid #fde68a; padding:9px 18px; font-size:11.5px; font-weight:600; color:#78350f; line-height:1.4;">
                                    <span style="color:#d97706; font-size:10px; vertical-align:middle;">&#9679;</span>&nbsp; Municipal departments impacted
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>

                        </tr>
                      </table>

                      <!-- SLA Performance Breakdown Grid -->
                      {SLA_METRICS_SECTION}

                      <!-- Service Breakdown Table -->
                      <div style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin:0 0 24px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th colspan="2" align="left" style="background-color:#f1f5f9; padding:10px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0b2545; border-bottom:1px solid #cbd5e1;">
                                Service-Wise Pendency Breakdown
                              </th>
                            </tr>
                            <tr style="background-color:#0b2545;">
                              <th align="left" style="padding:11px 16px; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#ffffff; border-right:1px solid #1e3a8a;">
                                Municipal Service / Module
                              </th>
                              <th align="right" style="padding:11px 16px; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#ffffff; width:135px;">
                                Pending Count
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {4}
                            <tr style="background-color:#f8fafc;">
                              <td style="padding:12px 16px; font-size:13px; font-weight:700; color:#0b2545; border-top:2px solid #94a3b8; border-right:1px solid #cbd5e1;">
                                Grand Total (Pending Applications)
                              </td>
                              <td align="right" style="padding:12px 16px; font-size:15px; font-weight:700; color:#b45309; border-top:2px solid #94a3b8;">
                                {2}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Statutory SLA & RTS Advisory -->
                      <div style="background-color:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; border-radius:8px; overflow:hidden; margin:0 0 26px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding:14px 18px;">
                              <div style="font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#92400e; margin-bottom:5px;">
                                &#9888;&nbsp; {8}
                              </div>
                              <div style="font-size:13px; line-height:1.55; color:#78350f;">
                                {9}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Official CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 14px auto;">
                        <tr>
                          <td align="center">
                            <a href="{6}" target="_blank" class="btn-block" style="display:inline-block; background-color:#0b2545; padding:13px 32px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; letter-spacing:0.3px; border-radius:6px; border:1px solid #0b2545;">
                              {7}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Direct Link Fallback -->
                      <p style="margin:0 0 26px 0; font-size:11.5px; color:#64748b; text-align:center; line-height:1.55;">
                        If the button above does not open, copy and paste this URL into your browser:<br>
                        <a href="{6}" target="_blank" style="color:#1d4ed8; word-break:break-all; text-decoration:underline;">{6}</a>
                      </p>

                      <!-- Divider -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
                        <tr>
                          <td style="border-top:1px solid #e2e8f0; height:1px; font-size:0; line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- Official Sign-off -->
                      <p style="margin:0; font-size:13px; line-height:1.65; color:#334155;">
                        Issued by,<br>
                        <strong style="color:#0b2545;">State Workflow Monitoring Cell</strong><br>
                        Department of Local Government, Government of Punjab
                      </p>

                    </td>
                  </tr>

                  <!-- Official Government Footer -->
                  <tr>
                    <td style="background-color:#f1f5f9; border-top:1px solid #dbe3ec; padding:18px 32px; text-align:center;">
                      <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; color:#0f172a;">
                        Punjab Municipal Infrastructure Development Company (PMIDC)
                      </p>
                      <p style="margin:0 0 8px 0; font-size:11px; color:#475569; line-height:1.45;">
                        Municipal Bhawan, Plot No. 3, Sector 35-A, Chandigarh, Punjab &ndash; 160022
                      </p>
                      <p style="margin:0; font-size:10.5px; color:#64748b; line-height:1.45;">
                        This is an automated system-generated daily pendency report from mSeva Punjab. Please do not reply directly to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>',
    'pb',
    'rainmaker-workflow',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
);

-- 3. Dedicated Application Status & Submission Reminder HTML Email for CITIZENS (Code: EG_WF_DIGEST_EMAIL_CITIZEN)
-- Strictly for citizens/applicants. Zero mention of "employee" or "officer".
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'b2c3d4e5-wf05-4434-a928-cb5222a25005',
    'en_IN',
    'EG_WF_DIGEST_EMAIL_CITIZEN',
    '<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Official Application Status &amp; Action Reminder | mSeva Punjab</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #eef2f6; font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif; }

    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-shell { border-radius: 0 !important; }
      .outer-padding { padding: 12px 6px !important; }
      .content-padding { padding: 22px 18px !important; }
      .header-padding { padding: 20px 18px !important; }
      .ribbon-padding { padding: 12px 18px !important; }
      .header-stack { display: block !important; width: 100% !important; text-align: left !important; padding-left: 0 !important; }
      .badge-wrap { padding-top: 12px !important; }
      .kpi-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .kpi-spacer { display: block !important; width: 100% !important; height: 12px !important; }
      .btn-block { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#eef2f6; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#1e293b; -webkit-font-smoothing:antialiased;">

  <!-- Hidden Inbox Preheader -->
  <div style="display:none; font-size:1px; color:#eef2f6; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
    Official Reminder: You have {2} pending application(s) awaiting your action on mSeva Punjab as of {5}.&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="outer-padding" style="background-color:#eef2f6; padding:28px 12px;">
    <tr>
      <td align="center">

        <!-- Main Email Container Wrapper -->
        <table role="presentation" class="email-container" width="620" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; width:100%;">
          <tr>
            <td>
              <div class="email-shell" style="background-color:#ffffff; border:1px solid #d5dde7; border-radius:10px; overflow:hidden; box-shadow:0 4px 14px rgba(11, 37, 69, 0.06);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#ffffff;">

                  <!-- Top Official Accent Strip -->
                  <tr>
                    <td style="background-color:#d97706; height:5px; font-size:0; line-height:0;">&nbsp;</td>
                  </tr>

                  <!-- Official Government Header -->
                  <tr>
                    <td class="header-padding" style="background-color:#0b2545; padding:24px 32px; border-bottom:3px solid #1d4ed8;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="header-stack" align="left" valign="middle">
                            <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:#fbbf24;">
                              Government of Punjab
                            </p>
                            <h1 style="margin:0; font-size:21px; font-weight:700; color:#ffffff; letter-spacing:0.2px; line-height:1.25;">
                              Department of Local Government
                            </h1>
                            <p style="margin:6px 0 0 0; font-size:12.5px; color:#cbd5e1; letter-spacing:0.2px;">
                              mSeva Punjab &nbsp;&bull;&nbsp; Citizen Services Portal
                            </p>
                          </td>
                          <td class="header-stack badge-wrap" align="right" valign="middle" style="padding-left:14px;">
                            <span style="display:inline-block; background-color:#17365d; border:1px solid #fbbf24; border-radius:20px; color:#fbbf24; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:6px 12px; white-space:nowrap;">
                              &#9679;&nbsp; Action Required
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Subject & Reference Ribbon -->
                  <tr>
                    <td class="ribbon-padding" style="background-color:#f8fafc; padding:14px 32px; border-bottom:1px solid #e2e8f0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="left" style="font-size:12.5px; font-weight:700; color:#0b2545; text-transform:uppercase; letter-spacing:0.4px;">
                            Subject: Notice Regarding Pending Municipal Application(s)
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-top:5px; font-size:11.5px; color:#64748b;">
                            Generated On: <strong style="color:#1e293b;">{5}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Notice Type: <strong style="color:#1e293b;">Submission &amp; Status Reminder</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Body Content -->
                  <tr>
                    <td class="content-padding" style="padding:28px 32px;">

                      <!-- Salutation -->
                      <p style="margin:0 0 14px 0; font-size:15px; color:#0f172a;">
                        Dear <strong style="color:#0b2545;">{1}</strong>,
                      </p>

                      <!-- Formal Administrative Text -->
                      <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:#334155;">
                        {10}
                      </p>

                      <!-- Summary Metrics (Enhanced Executive KPI Cards) -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px 0;">
                        <tr>

                          <!-- Card 1: Total Pending Applications -->
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(11, 37, 69, 0.06);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#0b2545; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:16px 18px 14px 18px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:10px;">
                                      <tr>
                                        <td align="left" valign="middle" style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#475569; line-height:1.3;">
                                          Total Pending<br>Applications
                                        </td>
                                        <td align="right" valign="top" style="padding-left:6px;">
                                          <span style="display:inline-block; background-color:#e0e7ff; color:#1e3a8a; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; padding:3px 8px; border-radius:12px; white-space:nowrap;">
                                            Pending
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                    <div style="font-size:38px; font-weight:700; color:#0b2545; line-height:1.05; letter-spacing:-0.5px;">
                                      {2}
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="background-color:#f1f5f9; border-top:1px solid #e2e8f0; padding:9px 18px; font-size:11.5px; font-weight:600; color:#475569; line-height:1.4;">
                                    <span style="color:#1d4ed8; font-size:10px; vertical-align:middle;">&#9679;</span>&nbsp; {11}
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>

                          <!-- Responsive Spacer -->
                          <td class="kpi-spacer" width="4%" style="font-size:0; line-height:0;">&nbsp;</td>

                          <!-- Card 2: Active Services / Modules -->
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #f3d9a4; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(180, 83, 9, 0.07);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#d97706; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:16px 18px 14px 18px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:10px;">
                                      <tr>
                                        <td align="left" valign="middle" style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#785a28; line-height:1.3;">
                                          Active Services /<br>Modules
                                        </td>
                                        <td align="right" valign="top" style="padding-left:6px;">
                                          <span style="display:inline-block; background-color:#fef3c7; color:#92400e; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; padding:3px 8px; border-radius:12px; white-space:nowrap;">
                                            Impacted
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                    <div style="font-size:38px; font-weight:700; color:#b45309; line-height:1.05; letter-spacing:-0.5px;">
                                      {3}
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="background-color:#fffbeb; border-top:1px solid #fde68a; padding:9px 18px; font-size:11.5px; font-weight:600; color:#78350f; line-height:1.4;">
                                    <span style="color:#d97706; font-size:10px; vertical-align:middle;">&#9679;</span>&nbsp; Municipal departments impacted
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>

                        </tr>
                      </table>

                      <!-- SLA Performance Breakdown Grid -->
                      {SLA_METRICS_SECTION}

                      <!-- Service Breakdown Table -->
                      <div style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin:0 0 24px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th colspan="2" align="left" style="background-color:#f1f5f9; padding:10px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0b2545; border-bottom:1px solid #cbd5e1;">
                                Service-Wise Breakdown
                              </th>
                            </tr>
                            <tr style="background-color:#0b2545;">
                              <th align="left" style="padding:11px 16px; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#ffffff; border-right:1px solid #1e3a8a;">
                                Municipal Service / Module
                              </th>
                              <th align="right" style="padding:11px 16px; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#ffffff; width:135px;">
                                Pending Count
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {4}
                            <tr style="background-color:#f8fafc;">
                              <td style="padding:12px 16px; font-size:13px; font-weight:700; color:#0b2545; border-top:2px solid #94a3b8; border-right:1px solid #cbd5e1;">
                                Grand Total (Pending Applications)
                              </td>
                              <td align="right" style="padding:12px 16px; font-size:15px; font-weight:700; color:#b45309; border-top:2px solid #94a3b8;">
                                {2}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Action Required Notice Box -->
                      <div style="background-color:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; border-radius:8px; overflow:hidden; margin:0 0 26px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding:14px 18px;">
                              <div style="font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#92400e; margin-bottom:5px;">
                                &#9888;&nbsp; {8}
                              </div>
                              <div style="font-size:13px; line-height:1.55; color:#78350f;">
                                {9}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Official CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 14px auto;">
                        <tr>
                          <td align="center">
                            <a href="{6}" target="_blank" class="btn-block" style="display:inline-block; background-color:#0b2545; padding:13px 32px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; letter-spacing:0.3px; border-radius:6px; border:1px solid #0b2545;">
                              {7}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Direct Link Fallback -->
                      <p style="margin:0 0 26px 0; font-size:11.5px; color:#64748b; text-align:center; line-height:1.55;">
                        If the button above does not open, copy and paste this URL into your browser:<br>
                        <a href="{6}" target="_blank" style="color:#1d4ed8; word-break:break-all; text-decoration:underline;">{6}</a>
                      </p>

                      <!-- Divider -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
                        <tr>
                          <td style="border-top:1px solid #e2e8f0; height:1px; font-size:0; line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- Official Sign-off -->
                      <p style="margin:0; font-size:13px; line-height:1.65; color:#334155;">
                        Issued by,<br>
                        <strong style="color:#0b2545;">State Workflow Monitoring Cell</strong><br>
                        Department of Local Government, Government of Punjab
                      </p>

                    </td>
                  </tr>

                  <!-- Official Government Footer -->
                  <tr>
                    <td style="background-color:#f1f5f9; border-top:1px solid #dbe3ec; padding:18px 32px; text-align:center;">
                      <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; color:#0f172a;">
                        Punjab Municipal Infrastructure Development Company (PMIDC)
                      </p>
                      <p style="margin:0 0 8px 0; font-size:11px; color:#475569; line-height:1.45;">
                        Municipal Bhawan, Plot No. 3, Sector 35-A, Chandigarh, Punjab &ndash; 160022
                      </p>
                      <p style="margin:0; font-size:10.5px; color:#64748b; line-height:1.45;">
                        This is an automated system-generated notification from mSeva Punjab. Please do not reply directly to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>',
    'pb',
    'rainmaker-workflow',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------------------
-- STEP 3: VERIFICATION
-- -----------------------------------------------------------------------------------------
SELECT id, code, locale, module, tenantid, length(message) AS template_char_length, lastmodifieddate 
FROM message 
WHERE code IN ('EG_WF_DIGEST_MSG', 'EG_WF_DIGEST_EMAIL', 'EG_WF_DIGEST_EMAIL_CITIZEN')
  AND tenantid = 'pb'
  AND module = 'rainmaker-workflow'
ORDER BY code ASC;
