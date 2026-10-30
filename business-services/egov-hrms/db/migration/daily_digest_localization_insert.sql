-- =========================================================================================
-- Localization Entries for HRMS Employee Daily Action Items Digest Notifications
-- Module: egov-hrms | Locale: en_IN | Tenant: pb
-- =========================================================================================

-- 1. Email Subject Template
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    'en_IN',
    'hrms.employee.daily.digest.email.subject',
    'UPYOG Daily Action Items: {{PENDING_COUNT}} Applications Pending [{{DATE}}]',
    'pb',
    'egov-hrms',
    1,
    NOW(),
    1,
    NOW()
)
ON CONFLICT (id) DO UPDATE 
SET message = EXCLUDED.message,
    lastmodifieddate = NOW();

-- 2. Email HTML Body Template (Modern Official Executive Design with SLA Breakdown)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
    'en_IN',
    'hrms.employee.daily.digest.email.body',
    '<!DOCTYPE html>
<html lang="en"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<title>mSeva / UPYOG - Daily Action Items Digest</title>

<!--[if mso]>
<xml>
    <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<style>
    table, td, div, p, a, li {
        font-family: Arial, Helvetica, sans-serif !important;
    }
</style>
<![endif]-->

<style>
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
    }
    body, table, td, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
    }
    table, td {
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
        border-collapse: collapse;
    }
    img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
    }
    a {
        color: #0b3d91;
    }
    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }
    @media screen and (max-width: 620px) {
        .container {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
        }
        .px {
            padding-left: 16px !important;
            padding-right: 16px !important;
        }
        .py {
            padding-top: 18px !important;
            padding-bottom: 18px !important;
        }
        .btn a {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 14px 18px !important;
        }
        .mobile-title {
            font-size: 20px !important;
            line-height: 1.3 !important;
        }
        .header-col {
            display: block !important;
            width: 100% !important;
            text-align: left !important;
        }
        .header-badge-col {
            display: block !important;
            width: 100% !important;
            text-align: left !important;
            padding-top: 12px !important;
            padding-left: 0 !important;
        }
        .stat-card {
            display: block !important;
            width: 100% !important;
            margin-bottom: 10px !important;
        }
        .stat {
            font-size: 24px !important;
        }
        .tbl th, .tbl td {
            font-size: 11px !important;
            padding: 7px 5px !important;
        }
    }
    @media (prefers-color-scheme: dark) {
        .dm-bg { background-color: #0b1220 !important; }
        .dm-card { background-color: #141f33 !important; }
        .dm-soft { background-color: #1b2942 !important; }
        .dm-text { color: #e6edf7 !important; }
        .dm-strong { color: #ffffff !important; }
        .dm-muted { color: #9fb0c7 !important; }
        .dm-border { border-color: #2c3d5a !important; }
        .dm-head { background-color: #1b2942 !important; color: #e6edf7 !important; }
        .dm-cell { background-color: #141f33 !important; color: #e6edf7 !important; }
        .dm-note { background-color: #2a2518 !important; }
        .dm-note-tx { color: #f3d99a !important; }
    }
</style>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f9;">

<div style="display:none; font-size:1px; color:#f4f6f9; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
mSeva / UPYOG Daily Action Items: {{PENDING_COUNT}} application(s) pending ({{OVERDUE_COUNT}} overdue, {{DUE_SOON_COUNT}} due soon). Status: {{APPLICATION_STATUS}}.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9;" class="dm-bg">
<tr>
    <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="660" cellpadding="0" cellspacing="0" border="0" class="container dm-card" style="width:660px; max-width:660px; background-color:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #d9e0e8; box-shadow:0 4px 18px rgba(15,23,42,0.08);">
            
            <!-- Top Tricolor Accent Stripe -->
            <tr>
                <td style="padding:0; line-height:0; font-size:0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="height:4px;">
                        <tr>
                            <td width="33.3%" style="background-color:#f58220; height:4px; line-height:4px; font-size:0;">&nbsp;</td>
                            <td width="33.4%" style="background-color:#ffffff; height:4px; line-height:4px; font-size:0;">&nbsp;</td>
                            <td width="33.3%" style="background-color:#138808; height:4px; line-height:4px; font-size:0;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Modern Executive Header -->
            <tr>
                <td style="background-color:#0b3d91; background:linear-gradient(135deg, #062758 0%, #0b3d91 60%, #154c9e 100%); padding:24px 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <!-- Left: Official Portal Brand -->
                            <td valign="middle" align="left" class="header-col">
                                <p style="margin:0 0 5px; font-family:''Segoe UI'',Arial,sans-serif; font-size:10.5px; font-weight:700; letter-spacing:1px; color:#fbbf24; text-transform:uppercase;">
                                    Department of Local Government &bull; Government of Punjab
                                </p>
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td valign="middle" style="padding-right:12px;">
                                            <div style="width:40px; height:40px; line-height:40px; text-align:center; background-color:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.28); border-radius:8px; font-size:20px; color:#ffffff;">
                                                &#127963;
                                            </div>
                                        </td>
                                        <td valign="middle">
                                            <h1 class="mobile-title" style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:24px; font-weight:700; line-height:1.2; color:#ffffff; letter-spacing:0.3px;">
                                                mSeva / UPYOG
                                            </h1>
                                            <p style="margin:2px 0 0; font-family:''Segoe UI'',Arial,sans-serif; font-size:12.5px; line-height:1.3; color:#d0deee;">
                                                Municipal Citizen Services Portal
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>

                            <!-- Right: Date and Action Badge -->
                            <td valign="middle" align="right" class="header-badge-col" style="padding-left:16px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
                                    <tr>
                                        <td align="right">
                                            <div style="display:inline-block; padding:6px 14px; background-color:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.28); border-radius:20px;">
                                                <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:11.5px; font-weight:700; color:#ffffff; letter-spacing:0.3px; white-space:nowrap;">
                                                    &#128197;&nbsp; {{DATE}}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="right" style="padding-top:7px;">
                                            <span style="display:inline-block; padding:3px 11px; background-color:#fef3c7; color:#92400e; font-family:''Segoe UI'',Arial,sans-serif; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; border-radius:10px; border:1px solid #fde68a;">
                                                Action Required
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Official Notice Card -->
            <tr>
                <td style="padding:20px 30px 0; background-color:#ffffff;" class="dm-card px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #0b3d91; border-radius:6px;" class="dm-soft dm-border">
                        <tr>
                            <td style="padding:13px 18px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td>
                                            <p style="margin:0 0 3px; font-family:''Segoe UI'',Arial,sans-serif; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0b3d91;">
                                                Daily Action Items Digest
                                            </p>
                                            <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:14.5px; font-weight:700; line-height:1.4; color:#0f172a;" class="dm-text">
                                                Pending Citizen Service Application(s) &mdash; <span style="color:#0b3d91;">{{MODULE_NAME}} Module</span>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Main Body Content -->
            <tr>
                <td class="px py" style="padding:22px 30px 28px; background-color:#ffffff;" class="dm-card">
                    <p style="margin:0 0 14px; font-family:''Segoe UI'',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#1e293b;" class="dm-text">
                        Dear <strong>{{RECIPIENT_NAME}}</strong>,
                    </p>

                    <p style="margin:0 0 20px; font-family:''Segoe UI'',Arial,sans-serif; font-size:13.5px; line-height:1.75; color:#374151; text-align:justify;" class="dm-text">
                        This is an automated workflow notification from the mSeva / UPYOG platform. Below is the summary of citizen service applications pending at your desk, categorized by statutory Service Level Agreement (SLA) status:
                    </p>

                    <!-- Executive SLA Metrics Breakdown Cards -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
                        <tr>
                            <!-- Total Card -->
                            <td width="28%" valign="top" style="padding-right:6px;">
                                <div style="background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px 10px; text-align:center;">
                                    <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#1e40af;">
                                        Total Pending
                                    </p>
                                    <p class="stat" style="margin:4px 0 0; font-family:''Segoe UI'',Arial,sans-serif; font-size:26px; font-weight:800; line-height:1.1; color:#0b3d91;">
                                        {{PENDING_COUNT}}
                                    </p>
                                </div>
                            </td>
                            <!-- Overdue Card -->
                            <td width="24%" valign="top" style="padding:0 3px;">
                                <div style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px 8px; text-align:center;">
                                    <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#991b1b;">
                                        &#128308; Overdue
                                    </p>
                                    <p class="stat" style="margin:4px 0 0; font-family:''Segoe UI'',Arial,sans-serif; font-size:26px; font-weight:800; line-height:1.1; color:#dc2626;">
                                        {{OVERDUE_COUNT}}
                                    </p>
                                </div>
                            </td>
                            <!-- Due Soon Card -->
                            <td width="24%" valign="top" style="padding:0 3px;">
                                <div style="background-color:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px 8px; text-align:center;">
                                    <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#92400e;">
                                        &#128993; &lt;48h Due
                                    </p>
                                    <p class="stat" style="margin:4px 0 0; font-family:''Segoe UI'',Arial,sans-serif; font-size:26px; font-weight:800; line-height:1.1; color:#d97706;">
                                        {{DUE_SOON_COUNT}}
                                    </p>
                                </div>
                            </td>
                            <!-- Within SLA Card -->
                            <td width="24%" valign="top" style="padding-left:6px;">
                                <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 8px; text-align:center;">
                                    <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#166534;">
                                        &#128994; On Track
                                    </p>
                                    <p class="stat" style="margin:4px 0 0; font-family:''Segoe UI'',Arial,sans-serif; font-size:26px; font-weight:800; line-height:1.1; color:#16a34a;">
                                        {{WITHIN_SLA_COUNT}}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Table of Pending Items with SLA Breakdown -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="tbl" style="width:100%; border-collapse:collapse; margin:0 0 22px; font-family:''Segoe UI'',Arial,sans-serif;">
                        <thead>
                            <tr>
                                <th align="left" style="background-color:#0b3d91; border:1px solid #0b3d91; padding:10px 12px; font-size:11.5px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.4px;">
                                    Module
                                </th>
                                <th align="left" style="background-color:#0b3d91; border:1px solid #0b3d91; padding:10px 12px; font-size:11.5px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.4px;">
                                    Pending Status
                                </th>
                                <th align="center" style="background-color:#0b3d91; border:1px solid #0b3d91; padding:10px 8px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.4px; width:65px;">
                                    Overdue
                                </th>
                                <th align="center" style="background-color:#0b3d91; border:1px solid #0b3d91; padding:10px 8px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.4px; width:65px;">
                                    &lt;48h Due
                                </th>
                                <th align="center" style="background-color:#0b3d91; border:1px solid #0b3d91; padding:10px 8px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.4px; width:65px;">
                                    On Track
                                </th>
                                <th align="center" style="background-color:#0b3d91; border:1px solid #0b3d91; padding:10px 8px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.4px; width:55px;">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {{TABLE_ROWS}}
                            <tr style="background-color:#f1f5f9;">
                                <td colspan="2" style="border:1px solid #cbd5e1; padding:11px 12px; font-size:12.5px; font-weight:700; color:#0f172a;" class="dm-cell dm-border">
                                    Total Action Items
                                </td>
                                <td align="center" style="border:1px solid #cbd5e1; padding:11px 8px; font-size:12.5px; font-weight:800; color:#dc2626;" class="dm-cell dm-border">
                                    {{OVERDUE_COUNT}}
                                </td>
                                <td align="center" style="border:1px solid #cbd5e1; padding:11px 8px; font-size:12.5px; font-weight:800; color:#d97706;" class="dm-cell dm-border">
                                    {{DUE_SOON_COUNT}}
                                </td>
                                <td align="center" style="border:1px solid #cbd5e1; padding:11px 8px; font-size:12.5px; font-weight:800; color:#16a34a;" class="dm-cell dm-border">
                                    {{WITHIN_SLA_COUNT}}
                                </td>
                                <td align="center" style="border:1px solid #cbd5e1; padding:11px 8px; font-size:13.5px; font-weight:800; color:#0b3d91;" class="dm-cell dm-border">
                                    {{PENDING_COUNT}}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Primary Action CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" class="btn" style="margin:24px auto;">
                        <tr>
                            <td align="center" bgcolor="#0b3d91" style="border-radius:6px; box-shadow:0 3px 8px rgba(11,61,145,0.28);">
                                <a href="{{EMPLOYEE_INBOX_URL}}" target="_blank" style="display:inline-block; font-family:''Segoe UI'',Arial,sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; padding:13px 34px; border-radius:6px; letter-spacing:0.3px;">
                                    Open Employee Inbox &nbsp;&rarr;
                                </a>
                            </td>
                        </tr>
                    </table>

                    <!-- Compliance Guidance Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px; background-color:#fffbeb; border-left:4px solid #f59e0b; border-radius:4px;" class="dm-note">
                        <tr>
                            <td style="padding:13px 16px;">
                                <p style="margin:0 0 4px; font-family:''Segoe UI'',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.7px; text-transform:uppercase; color:#92400e;" class="dm-note-tx">
                                    Public Service Delivery Timeline Notice
                                </p>
                                <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:12.5px; line-height:1.65; color:#78350f;" class="dm-note-tx">
                                    Please prioritize overdue and impending applications to avoid timeline breaches under the Punjab Transparency in Delivery of Public Services Act. Applications exceeding prescribed SLA limits are liable to administrative escalation.
                                </p>
                            </td>
                        </tr>
                    </table>

                    <!-- Technical Support & Disclaimer -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px dashed #cbd5e1; padding-top:14px;" class="dm-border">
                        <tr>
                            <td style="font-family:''Segoe UI'',Arial,sans-serif; font-size:11.5px; line-height:1.65; color:#64748b;" class="dm-muted">
                                This is an automated notification from the mSeva / UPYOG platform. If you have already processed these items or need assistance, please log in to the portal or contact your local municipal IT administrator.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Official Footer Strip -->
            <tr>
                <td style="background-color:#0f172a; padding:18px 28px; text-align:center;">
                    <p style="margin:0 0 5px; font-family:''Segoe UI'',Arial,sans-serif; font-size:11.5px; line-height:1.5; color:#cbd5e1; font-weight:600;">
                        Department of Local Government &bull; Government of Punjab
                    </p>
                    <p style="margin:0 0 4px; font-family:''Segoe UI'',Arial,sans-serif; font-size:10.5px; line-height:1.5; color:#94a3b8;">
                        &copy; {{CURRENT_YEAR}} mSeva / UPYOG Municipal Platform. All rights reserved.
                    </p>
                    <p style="margin:0; font-family:''Segoe UI'',Arial,sans-serif; font-size:10px; line-height:1.5; color:#64748b;">
                        Confidential &bull; Generated solely for official municipal administration
                    </p>
                </td>
            </tr>

        </table>
    </td>
</tr>
</table>
</body>
</html>',
    'pb',
    'egov-hrms',
    1,
    NOW(),
    1,
    NOW()
)
ON CONFLICT (id) DO UPDATE 
SET message = EXCLUDED.message,
    lastmodifieddate = NOW();
