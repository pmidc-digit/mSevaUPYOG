-- =========================================================================================
-- SQL INSERT SCRIPT FOR PUNJAB WORKFLOW ASSIGNEE NOTIFICATIONS
-- Database: PostgreSQL | Table: message (egov-localization service)
-- State: Punjab (tenantid = 'pb') | Locale: en_IN
-- Module: rainmaker-workflow
--
-- 1) SMS Template Code   : EG_WF_ASSIGNEE_MSG
-- 2) Email Template Code : EG_WF_ASSIGNEE_EMAIL
-- =========================================================================================

-- 1. Workflow Assignee SMS Notification (DLT Template: EG_WF_ASSIGNEE_MSG)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'a1b2c3d4-wf01-4434-a928-cb5222a25001',
    'en_IN',
    'EG_WF_ASSIGNEE_MSG',
    'Dear {1}, Application No. {2} ({3}) has been assigned to you by {4}. Status: {5}. Please login to mSeva employee portal to process - mSeva Punjab',
    'pb',
    'rainmaker-workflow',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT (code, locale, tenantid, module) DO UPDATE
SET message = EXCLUDED.message,
    lastmodifieddate = CURRENT_TIMESTAMP;

-- 2. Workflow Assignee HTML Email Notification (Code: EG_WF_ASSIGNEE_EMAIL)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    'a1b2c3d4-wf02-4434-a928-cb5222a25002',
    'en_IN',
    'EG_WF_ASSIGNEE_EMAIL',
    '<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Official Notification: New Application Assigned | mSeva Punjab</title>
  <style type="text/css">
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-padding { padding: 20px 16px !important; }
      .header-padding { padding: 18px 16px !important; }
      .stack-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#edf1f5; font-family:Arial, Helvetica, sans-serif; color:#1f2937; -webkit-font-smoothing:antialiased;">

  <!-- Hidden Inbox Preheader Text -->
  <div style="display:none; font-size:1px; color:#edf1f5; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    New Application No. {2} ({3}) has been assigned to you on mSeva Punjab by {4}. Action required within SLA.
  </div>

  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#edf1f5; padding:28px 12px;">
    <tr>
      <td align="center">

        <!-- Main Email Container -->
        <table role="presentation" class="email-container" width="620" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; width:100%; background-color:#ffffff; border:1px solid #cbd5e1;">

          <!-- Top Official Accent Strip -->
          <tr>
            <td style="background-color:#d97706; height:4px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Official Government Header -->
          <tr>
            <td class="header-padding" style="background-color:#0b2545; padding:22px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <p style="margin:0 0 3px 0; font-size:11px; font-weight:bold; letter-spacing:1.4px; text-transform:uppercase; color:#fbbf24;">
                      Government of Punjab
                    </p>
                    <h1 style="margin:0; font-size:20px; font-weight:bold; color:#ffffff; letter-spacing:0.3px; line-height:1.25;">
                      Department of Local Government
                    </h1>
                    <p style="margin:5px 0 0 0; font-size:13px; color:#cbd5e1;">
                      mSeva Punjab &nbsp;|&nbsp; Official Employee Portal
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding-left:12px;">
                    <span style="display:inline-block; border:1px solid #fbbf24; color:#fbbf24; font-size:10px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; padding:5px 10px; white-space:nowrap;">
                      Official Notice
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject & Meta Bar -->
          <tr>
            <td style="background-color:#f8fafc; padding:12px 30px; border-bottom:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="font-size:12px; font-weight:bold; color:#0b2545; text-transform:uppercase; letter-spacing:0.5px;">
                    Subject: Assignment of New Application
                  </td>
                  <td align="right" style="font-size:12px; color:#64748b; white-space:nowrap;">
                    Ref: <strong>{2}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="content-padding" style="padding:28px 30px;">

              <!-- Salutation -->
              <p style="margin:0 0 14px 0; font-size:15px; color:#0f172a;">
                Dear <strong>{1}</strong>,
              </p>

              <!-- Formal Notification Text -->
              <p style="margin:0 0 20px 0; font-size:14px; line-height:1.65; color:#334155;">
                This is to formally notify you that a new application has been assigned to your queue on the <strong>mSeva Punjab</strong> portal by <strong>{4}</strong> for necessary scrutiny and disposal. You are requested to examine the application and initiate appropriate action within the prescribed Service Level Agreement (SLA) timeline.
              </p>

              <!-- Application Particulars Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse; border:1px solid #cbd5e1; margin:0 0 20px 0;">
                <tr>
                  <td colspan="2" style="background-color:#eef2f6; padding:10px 16px; font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:0.6px; color:#0b2545; border-bottom:1px solid #cbd5e1;">
                    Application Particulars
                  </td>
                </tr>
                <tr>
                  <td class="stack-col" style="padding:11px 16px; width:38%; font-size:13px; font-weight:bold; color:#475569; background-color:#f8fafc; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">
                    Application Number
                  </td>
                  <td class="stack-col" style="padding:11px 16px; font-size:14px; font-weight:bold; color:#0f172a; border-bottom:1px solid #e2e8f0;">
                    {2}
                  </td>
                </tr>
                <tr>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; font-weight:bold; color:#475569; background-color:#f8fafc; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">
                    Service / Module
                  </td>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; color:#0f172a; border-bottom:1px solid #e2e8f0;">
                    {3}
                  </td>
                </tr>
                <tr>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; font-weight:bold; color:#475569; background-color:#f8fafc; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">
                    Current Status
                  </td>
                  <td class="stack-col" style="padding:11px 16px; border-bottom:1px solid #e2e8f0;">
                    <span style="display:inline-block; background-color:#fef3c7; color:#92400e; border:1px solid #fcd34d; font-size:12px; font-weight:bold; padding:3px 10px; border-radius:3px;">
                      {5}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; font-weight:bold; color:#475569; background-color:#f8fafc; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">
                    Assigned By
                  </td>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; color:#0f172a; border-bottom:1px solid #e2e8f0;">
                    {4}
                  </td>
                </tr>
                <tr>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; font-weight:bold; color:#475569; background-color:#f8fafc; border-right:1px solid #e2e8f0;">
                    Date of Assignment
                  </td>
                  <td class="stack-col" style="padding:11px 16px; font-size:13px; color:#0f172a;">
                    {6}
                  </td>
                </tr>
              </table>

              {COMMENT_SECTION}

              <!-- SLA Notice Callout -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fffbeb; border-left:4px solid #d97706; border-top:1px solid #fde68a; border-right:1px solid #fde68a; border-bottom:1px solid #fde68a; margin:0 0 24px 0;">
                <tr>
                  <td style="padding:12px 16px; font-size:12.5px; line-height:1.55; color:#78350f;">
                    <strong>Action Required:</strong> Please log in to the mSeva Employee Portal to view attached documents and process this application within the stipulated SLA period to avoid escalation.
                  </td>
                </tr>
              </table>

              <!-- Bulletproof CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 16px auto;">
                <tr>
                  <td align="center" style="background-color:#0b2545; border-radius:4px;">
                    <a href="{7}" target="_blank" style="display:inline-block; padding:12px 30px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; letter-spacing:0.3px;">
                      Login to mSeva Employee Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 26px 0; font-size:12px; color:#64748b; text-align:center; line-height:1.5;">
                If the button does not open, copy and paste this link into your browser:<br>
                <a href="{7}" target="_blank" style="color:#0b2545; word-break:break-all; text-decoration:underline;">{7}</a>
              </p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
                <tr>
                  <td style="border-top:1px solid #e2e8f0; height:1px; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Official Sign-off -->
              <p style="margin:0; font-size:13px; line-height:1.6; color:#334155;">
                Regards,<br>
                <strong>mSeva Punjab Portal Administration</strong><br>
                Department of Local Government, Government of Punjab
              </p>

            </td>
          </tr>

          <!-- Official Footer -->
          <tr>
            <td style="background-color:#f1f5f9; border-top:1px solid #cbd5e1; padding:16px 30px; text-align:center;">
              <p style="margin:0 0 5px 0; font-size:11.5px; font-weight:bold; color:#334155;">
                Department of Local Government &bull; Government of Punjab
              </p>
              <p style="margin:0; font-size:11px; color:#64748b; line-height:1.5;">
                This is an automated system-generated notification from the mSeva Punjab portal. Please do not reply directly to this email. For technical support, please contact the mSeva Helpdesk.
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
    'rainmaker-workflow',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT (code, locale, tenantid, module) DO UPDATE
SET message = EXCLUDED.message,
    lastmodifieddate = CURRENT_TIMESTAMP;
