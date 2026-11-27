-- =========================================================================================
-- SQL SCRIPT FOR PUNJAB mSEVA SEWERAGE DEMAND GENERATION SCHEDULER EMAIL TEMPLATES
-- Database: PostgreSQL | Table: public.message (egov-localization service)
-- State: Punjab (tenantid = 'pb') | Locale: en_IN | Module: rainmaker-sw
--
-- TEMPLATES INCLUDED:
-- 1. SW_DEMAND_GEN_START_EMAIL_TEMPLATE      (Consolidated Batch Initialization Alert)
-- 2. SW_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE (Official ULB Completion & Failure Report)
--
-- Official Government of Punjab / Department of Local Government / PMIDC HTML Format.
-- Strictly internal department/officer alert templates. Zero mention of "citizen".
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- STEP 1: CLEANUP EXISTING ENTRIES FOR IDEMPOTENT EXECUTION
-- -----------------------------------------------------------------------------------------
DELETE FROM public.message
WHERE code IN ('SW_DEMAND_GEN_START_EMAIL_TEMPLATE', 'SW_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE')
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module IN ('rainmaker-sw', 'rainmaker-ws');

-- -----------------------------------------------------------------------------------------
-- STEP 2: INSERT OFFICIAL GOVERNMENT-FORMAT HTML EMAIL TEMPLATES
-- -----------------------------------------------------------------------------------------

-- 1. Sewerage Demand Generation Start Summary Email Template (Code: SW_DEMAND_GEN_START_EMAIL_TEMPLATE)
INSERT INTO public.message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'b2c3d4e5-5e01-4a34-a928-cb5222a26001',
    'en_IN',
    'SW_DEMAND_GEN_START_EMAIL_TEMPLATE',
    '<h2>Sewerage Demand Generation Scheduled - Summary Report ({triggerDate})</h2><!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Official Notification: Sewerage Batch Demand Generation Scheduled | mSeva Punjab</title>
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
    @media only screen and (max-width: 660px) {
      .email-container { width: 100% !important; }
      .email-shell { border-radius: 0 !important; }
      .outer-padding { padding: 12px 6px !important; }
      .content-padding { padding: 22px 16px !important; }
      .header-padding { padding: 20px 16px !important; }
      .ribbon-padding { padding: 12px 16px !important; }
      .header-stack { display: block !important; width: 100% !important; text-align: left !important; padding-left: 0 !important; }
      .badge-wrap { padding-top: 12px !important; }
      .kpi-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .kpi-spacer { display: block !important; width: 100% !important; height: 12px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#eef2f6; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#1e293b; -webkit-font-smoothing:antialiased;">

  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="outer-padding" style="background-color:#eef2f6; padding:28px 12px;">
    <tr>
      <td align="center">

        <!-- Main Email Container -->
        <table role="presentation" class="email-container" width="660" cellspacing="0" cellpadding="0" border="0" style="max-width:660px; width:100%;">
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
                              mSeva Punjab &nbsp;&bull;&nbsp; Sewerage Billing &amp; Revenue Scheduler
                            </p>
                          </td>
                          <td class="header-stack badge-wrap" align="right" valign="middle" style="padding-left:14px;">
                            <span style="display:inline-block; background-color:#17365d; border:1px solid #fbbf24; border-radius:20px; color:#fbbf24; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:6px 12px; white-space:nowrap;">
                              &#9679;&nbsp; Batch Scheduled
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
                            Subject: Sewerage Batch Demand Generation Initialized
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-top:5px; font-size:11.5px; color:#64748b;">
                            Initiated On: <strong style="color:#1e293b;">{triggerDate}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Service: <strong style="color:#1e293b;">Sewerage Charges (SW)</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Body Content -->
                  <tr>
                    <td class="content-padding" style="padding:28px 32px;">

                      <p style="margin:0 0 14px 0; font-size:14.5px; color:#0f172a;">
                        Respected <strong style="color:#0b2545;">Municipal Commissioner / Executive Officer / System Administrator</strong>,
                      </p>

                      <p style="margin:0 0 24px 0; font-size:13.5px; line-height:1.65; color:#334155;">
                        This is to formally inform you that the automated <strong>Sewerage Demand Generation Scheduler</strong> on <strong>mSeva Punjab</strong> has been triggered. Please find below the ULB-wise schedule and eligible sewerage connection counts queued for billing:
                      </p>

                      <!-- Executive KPI Cards -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px 0;">
                        <tr>
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(11, 37, 69, 0.06);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#0b2545; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:16px 18px 14px 18px;">
                                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#475569; margin-bottom:8px;">Total ULBs / Tenants</div>
                                    <div style="font-size:34px; font-weight:700; color:#0b2545; line-height:1.05;">{totalTenants}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="background-color:#f1f5f9; border-top:1px solid #e2e8f0; padding:8px 18px; font-size:11.5px; font-weight:600; color:#475569;">
                                    <span style="color:#1d4ed8;">&#9679;</span>&nbsp; Urban Local Bodies Evaluated
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                          <td class="kpi-spacer" width="4%" style="font-size:0; line-height:0;">&nbsp;</td>
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #bfdbfe; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(29, 78, 216, 0.07);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#1d4ed8; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:16px 18px 14px 18px;">
                                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#1e40af; margin-bottom:8px;">Connections Queued</div>
                                    <div style="font-size:34px; font-weight:700; color:#1d4ed8; line-height:1.05;">{totalConnections}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="background-color:#eff6ff; border-top:1px solid #dbeafe; padding:8px 18px; font-size:11.5px; font-weight:600; color:#1e3a8a;">
                                    <span style="color:#1d4ed8;">&#9679;</span>&nbsp; Active Non-Metered Sewerage
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- ULB Breakdown Table -->
                      <div style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin:0 0 24px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th colspan="6" align="left" style="background-color:#f1f5f9; padding:10px 14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0b2545; border-bottom:1px solid #cbd5e1;">
                                ULB-Wise Batch Schedule Summary
                              </th>
                            </tr>
                            <tr style="background-color:#0b2545;">
                              <th align="center" style="padding:10px 8px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff; width:40px;">#</th>
                              <th align="left" style="padding:10px 10px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff;">Tenant ID</th>
                              <th align="left" style="padding:10px 10px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff;">ULB / City</th>
                              <th align="left" style="padding:10px 10px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff;">Billing Cycle</th>
                              <th align="right" style="padding:10px 10px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff;">Connections</th>
                              <th align="center" style="padding:10px 10px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff;">Status</th>
                            </tr>
                          </thead>
                          <tbody style="font-size:12.5px; color:#334155;">
                            {tenantRows}
                          </tbody>
                        </table>
                      </div>

                      <!-- Official Status Advisory Box -->
                      <div style="background-color:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; border-radius:8px; overflow:hidden; margin:0 0 24px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding:14px 18px;">
                              <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#92400e; margin-bottom:4px;">
                                &#9432;&nbsp; Processing Status Notice
                              </div>
                              <div style="font-size:13px; line-height:1.55; color:#78350f;">
                                Asynchronous demand calculation is currently running for all scheduled ULBs. Separate completion reports with billed demand amounts, success counts, and exception logs will be dispatched automatically upon completion for each ULB.
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Divider -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
                        <tr>
                          <td style="border-top:1px solid #e2e8f0; height:1px; font-size:0; line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- Official Sign-off -->
                      <p style="margin:0; font-size:13px; line-height:1.65; color:#334155;">
                        Issued by,<br>
                        <strong style="color:#0b2545;">PMIDC IT Team</strong><br>
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
                        This is an official automated system notification from the mSeva Punjab Billing Engine. Please do not reply directly to this email.
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
    'rainmaker-sw',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
);

-- 2. Official Sewerage Demand Generation Completion Report Email Template (Code: SW_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE)
INSERT INTO public.message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'b2c3d4e5-5e02-4a34-a928-cb5222a26002',
    'en_IN',
    'SW_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE',
    '<h2>Sewerage Demand Generation Report - {cityName} ({billingCycle})</h2><!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Official Report: Sewerage Demand Generation Completion | mSeva Punjab</title>
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
    @media only screen and (max-width: 660px) {
      .email-container { width: 100% !important; }
      .email-shell { border-radius: 0 !important; }
      .outer-padding { padding: 12px 6px !important; }
      .content-padding { padding: 22px 16px !important; }
      .header-padding { padding: 20px 16px !important; }
      .ribbon-padding { padding: 12px 16px !important; }
      .header-stack { display: block !important; width: 100% !important; text-align: left !important; padding-left: 0 !important; }
      .badge-wrap { padding-top: 12px !important; }
      .kpi-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .kpi-spacer { display: block !important; width: 100% !important; height: 12px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#eef2f6; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#1e293b; -webkit-font-smoothing:antialiased;">

  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="outer-padding" style="background-color:#eef2f6; padding:28px 12px;">
    <tr>
      <td align="center">

        <!-- Main Email Container -->
        <table role="presentation" class="email-container" width="660" cellspacing="0" cellpadding="0" border="0" style="max-width:660px; width:100%;">
          <tr>
            <td>
              <div class="email-shell" style="background-color:#ffffff; border:1px solid #d5dde7; border-radius:10px; overflow:hidden; box-shadow:0 4px 14px rgba(11, 37, 69, 0.06);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#ffffff;">

                  <!-- Top Official Accent Strip -->
                  <tr>
                    <td style="background-color:{statusColor}; height:5px; font-size:0; line-height:0;">&nbsp;</td>
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
                              mSeva Punjab &nbsp;&bull;&nbsp; Sewerage Billing &amp; Revenue Completion Report
                            </p>
                          </td>
                          <td class="header-stack badge-wrap" align="right" valign="middle" style="padding-left:14px;">
                            <span style="display:inline-block; background-color:{statusColor}; border-radius:20px; color:#ffffff; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:6px 14px; white-space:nowrap;">
                              &#9679;&nbsp; {statusLabel}
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
                            Subject: Sewerage Demand Generation Completion Report &mdash; {cityName}
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-top:5px; font-size:11.5px; color:#64748b;">
                            ULB / Tenant: <strong style="color:#1e293b;">{cityName} ({tenantId})</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Billing Cycle: <strong style="color:#1e293b;">{billingCycle} (FY {financialYear})</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Body Content -->
                  <tr>
                    <td class="content-padding" style="padding:28px 32px;">

                      <p style="margin:0 0 14px 0; font-size:14.5px; color:#0f172a;">
                        Respected <strong style="color:#0b2545;">Municipal Commissioner / Executive Officer / System Administrator</strong>,
                      </p>

                      <p style="margin:0 0 24px 0; font-size:13.5px; line-height:1.65; color:#334155;">
                        The batch sewerage demand generation job for <strong>{cityName}</strong> (<code>{tenantId}</code>), initialized on <strong>{generatedOn}</strong>, has completed processing for the billing cycle <strong>{formattedFrom} to {formattedTo}</strong>. Below is the official execution and revenue summary:
                      </p>

                      <!-- Executive KPI Cards Row 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px 0;">
                        <tr>
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#ffffff; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(11, 37, 69, 0.05);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#0b2545; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:14px 18px;">
                                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#475569; margin-bottom:6px;">Targeted Connections</div>
                                    <div style="font-size:30px; font-weight:700; color:#0b2545; line-height:1.1;">{totalCount}</div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                          <td class="kpi-spacer" width="4%" style="font-size:0; line-height:0;">&nbsp;</td>
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(21, 128, 61, 0.05);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#15803d; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:14px 18px;">
                                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#166534; margin-bottom:6px;">Demands Generated</div>
                                    <div style="font-size:30px; font-weight:700; color:#15803d; line-height:1.1;">{successCount}</div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Executive KPI Cards Row 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px 0;">
                        <tr>
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(185, 28, 28, 0.05);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#b91c1c; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:14px 18px;">
                                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#991b1b; margin-bottom:6px;">Failed / Pending ({successPercentage}% Success)</div>
                                    <div style="font-size:30px; font-weight:700; color:#b91c1c; line-height:1.1;">{failureCount}</div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                          <td class="kpi-spacer" width="4%" style="font-size:0; line-height:0;">&nbsp;</td>
                          <td class="kpi-col" width="48%" valign="top">
                            <div style="background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(29, 78, 216, 0.05);">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="background-color:#1d4ed8; height:4px; font-size:0; line-height:0;">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td style="padding:14px 18px;">
                                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#1e40af; margin-bottom:6px;">Total Tax Demand Generated</div>
                                    <div style="font-size:28px; font-weight:700; color:#1d4ed8; line-height:1.15;">&#8377; {totalAmount}</div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Execution Metadata Table -->
                      <div style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin:0 0 24px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th colspan="2" align="left" style="background-color:#f1f5f9; padding:10px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0b2545; border-bottom:1px solid #cbd5e1;">
                                Official Batch Execution Details
                              </th>
                            </tr>
                          </thead>
                          <tbody style="font-size:13px;">
                            <tr style="border-bottom:1px solid #e2e8f0;">
                              <td style="padding:10px 16px; width:42%; font-weight:600; color:#475569; background-color:#f8fafc;">ULB / Tenant Code</td>
                              <td style="padding:10px 16px; font-weight:700; color:#0b2545;">{cityName} ({tenantId})</td>
                            </tr>
                            <tr style="border-bottom:1px solid #e2e8f0;">
                              <td style="padding:10px 16px; font-weight:600; color:#475569; background-color:#f8fafc;">Billing Cycle &amp; Financial Year</td>
                              <td style="padding:10px 16px; color:#1e293b;">{formattedFrom} to {formattedTo} ({billingCycle}, FY {financialYear})</td>
                            </tr>
                            <tr style="border-bottom:1px solid #e2e8f0;">
                              <td style="padding:10px 16px; font-weight:600; color:#475569; background-color:#f8fafc;">Job Started On</td>
                              <td style="padding:10px 16px; color:#1e293b;">{generatedOn}</td>
                            </tr>
                            <tr style="border-bottom:1px solid #e2e8f0;">
                              <td style="padding:10px 16px; font-weight:600; color:#475569; background-color:#f8fafc;">Job Completed On</td>
                              <td style="padding:10px 16px; color:#1e293b;">{completedOn}</td>
                            </tr>
                            <tr>
                              <td style="padding:10px 16px; font-weight:600; color:#475569; background-color:#f8fafc;">Total Processing Duration</td>
                              <td style="padding:10px 16px; font-weight:700; color:#1d4ed8;">{duration}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Failed Connections Log -->
                      <div style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin:0 0 24px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th colspan="3" align="left" style="background-color:#f1f5f9; padding:10px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0b2545; border-bottom:1px solid #cbd5e1;">
                                Exception &amp; Failed Connections Log
                              </th>
                            </tr>
                            <tr style="background-color:#0b2545;">
                              <th align="left" style="padding:10px 14px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff; width:10%;">#</th>
                              <th align="left" style="padding:10px 14px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff; width:35%;">Connection No</th>
                              <th align="left" style="padding:10px 14px; font-size:11px; font-weight:700; text-transform:uppercase; color:#ffffff; width:55%;">Reason of Failure</th>
                            </tr>
                          </thead>
                          <tbody style="font-size:12.5px; color:#334155;">
                            {failedConnectionsRows}
                          </tbody>
                        </table>
                      </div>

                      <!-- Divider -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
                        <tr>
                          <td style="border-top:1px solid #e2e8f0; height:1px; font-size:0; line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- Official Sign-off -->
                      <p style="margin:0; font-size:13px; line-height:1.65; color:#334155;">
                        Issued by,<br>
                        <strong style="color:#0b2545;">PMIDC IT Team</strong><br>
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
                        This is an official automated system notification from the mSeva Punjab Billing Engine. Please do not reply directly to this email.
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
    'rainmaker-sw',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
);
