-- =========================================================================================
-- COMPLETE SQL INSERT SCRIPT FOR ALL 8 NOTIFICATIONS (8 EMAILS + 8 SMS) FOR PUNJAB mSEVA
-- Database: PostgreSQL | Table: message (egov-localization service)
-- Tenant: pb (State Level) | Locale: en_IN | Modules: rainmaker-rl & rl-services
-- Total Rows Inserted: 32 (16 per module: 8 Emails + 8 SMS)
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- SECTION: INSERTS FOR MODULE 'rainmaker-rl'
-- -----------------------------------------------------------------------------------------

-- Email: RL_OVERDUE_PENALTY_NOTICE (rl.demand.overdue.penalty.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('5a1eb054-dc7a-4bdc-b062-e9c6a83f0979', 'en_IN', 'rl.demand.overdue.penalty.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Overdue Rent Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Statutory Demand Notice: Rent dues for Allotment No. {3} are overdue since {4}. Total Net Outstanding: Rs. {6}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #d97706;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#d97706;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Rent & Lease
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #e5e7eb;border-left:5px solid #dc2626;padding:15px 32px;">
              <strong style="color:#dc2626;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Urgent: Rent Overdue & Penalty Applied
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Immediate settlement required to avoid further penalties or legal lease suspension.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Statutory Demand Notice for Overdue Municipal Rent — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                This is an official notice from <strong style="color:#111827;">{8}</strong>. Your municipal rent dues for Allotment / Property No. <strong style="color:#111827;">{3}</strong> have remained unpaid and are overdue since <strong style="color:#111827;">{4}</strong>. Pursuant to Punjab Municipal rules and lease terms, a late fee penalty has been levied on your account.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Statement of Overdue Dues
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment / Property No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Since:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Original Rent Demand:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Late Penalty Fee (Levied):</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">+ Rs. {5}</td>
                </tr>
                <tr style="background-color:#fef2f2;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#991b1b;">Total Net Outstanding:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY OVERDUE RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_OVERDUE_DETAILED_NOTICE (rl.demand.overdue.detailed.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('83b786e4-ffb7-440f-b19b-1b8693f76909', 'en_IN', 'rl.demand.overdue.detailed.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Detailed Rent Overdue Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Official Notice: Your municipal rent of Rs. {2} for Property {3} is overdue since {4}. Total outstanding: Rs. {6}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #dc2626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#dc2626;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Formal Demand
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #e5e7eb;border-left:5px solid #b91c1c;padding:15px 32px;">
              <strong style="color:#b91c1c;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Formal Statutory Rent Demand Notice
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Final opportunity to settle outstanding lease arrears before statutory recovery proceedings.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Formal Statutory Demand Notice for Overdue Rent — Property No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Notice is hereby given by <strong style="color:#111827;">{8}</strong> that municipal rent charges for property <strong style="color:#111827;">{3}</strong> have fallen overdue since <strong style="color:#111827;">{4}</strong>. Applicable late penalty has been computed as per Punjab Municipal Acts.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Formal Arrears Assessment
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Property / Allotment Identifier:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Principal Rent Amount:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Late Penalty Charge:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">+ Rs. {5}</td>
                </tr>
                <tr style="background-color:#fef2f2;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#991b1b;">Total Outstanding Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#b91c1c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      SETTLE OUTSTANDING DUES &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_BILL_GENERATED_NOTICE (rl.demand.generated.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('39a7e9c2-1272-4f91-87fc-3ff5072fe34f', 'en_IN', 'rl.demand.generated.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Monthly Rent Demand Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Monthly Municipal Rent Demand Notice for {4}: Total payable Rs. {2} for Allotment No. {3}. Due date is {DUE_DATE}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #2563eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#2563eb;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Monthly Demand
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#eff6ff;border-bottom:1px solid #e5e7eb;border-left:5px solid #2563eb;padding:15px 32px;">
              <strong style="color:#2563eb;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Monthly Rent Demand Notice
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Kindly remit your municipal rent on or before <strong>{DUE_DATE}</strong> to avoid late payment penalties.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Monthly Municipal Rent Demand for {4} — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Your monthly municipal rent demand for <strong style="color:#111827;">{8}</strong> has been generated for the billing cycle <strong style="color:#111827;">{4}</strong>. Please review your official bill summary below and complete payment prior to the due date.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Monthly Rent Bill Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Billing Cycle:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{DUE_DATE}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Total Rent Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      VIEW BILL & PAY ONLINE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_DUE_DATE_REMINDER (rl.demand.due.reminder.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('db49d3ff-920c-4ffc-b93e-384a6ca39814', 'en_IN', 'rl.demand.due.reminder.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rent Due Date Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Friendly Reminder: Rent of Rs. {2} for Allotment No. {3} is due on {4}. Pay online to avoid late penalties.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #f59e0b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#f59e0b;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Due Reminder
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fffbeb;border-bottom:1px solid #e5e7eb;border-left:5px solid #d97706;padding:15px 32px;">
              <strong style="color:#d97706;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Friendly Reminder: Rent Due Soon
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Pay on or before <strong>{4}</strong> to avoid late fee penalty and retain a clean payment record.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Rent Payment Due Date Reminder — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                This is a friendly reminder that municipal rent dues for Allotment No. <strong style="color:#111827;">{3}</strong> are payable on or before <strong style="color:#111827;">{4}</strong>. Avoid the last-minute rush and avoid any statutory late fee penalty by paying online securely.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Upcoming Due Details
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Payment Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Net Amount Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{5}" target="_blank" style="background-color:#d97706;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{5}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{5}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_APP_APPROVED_NOTICE (rl.application.approved.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('a1e943c5-6e68-4825-b9dc-66a010b793fe', 'en_IN', 'rl.application.approved.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Application Approved & Fee Demand</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Congratulations! Your Rent & Lease Application No. {2} has been APPROVED by {3}. Please remit allotment fee Rs. {4}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #16a34a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Approved
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#f0fdf4;border-bottom:1px solid #e5e7eb;border-left:5px solid #16a34a;padding:15px 32px;">
              <strong style="color:#16a34a;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Application Approved — Allotment Fee Payable
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Your allotment application has completed verification and has been formally approved.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {3}<br>
                    <strong style="color:#111827;">Subject:</strong> Rent & Lease Application Approved — Application No. <strong>{2}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                We are pleased to inform you that your Rent & Lease Application <strong style="color:#111827;">{2}</strong> has been <strong>APPROVED</strong> by <strong style="color:#111827;">{3}</strong>. To complete the allotment process and generate your official lease agreement, please remit the initial allotment fee online.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Approval & Fee Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Application No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Sanctioning Authority:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Initial Allotment Fee Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {4}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{5}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY ALLOTMENT FEE & COMPLETE LEASE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{5}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{5}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{3}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_PAYMENT_SUCCESS_CONFIRM (rl.payment.success.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('bd926f69-ee27-4c1d-bc3a-4e9b974abab2', 'en_IN', 'rl.payment.success.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Payment Receipt Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Official Payment Receipt: Rs. {2} received for Allotment No. {3} vide Receipt No. {4}. Download your official receipt.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #16a34a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Payment Success
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#f0fdf4;border-bottom:1px solid #e5e7eb;border-left:5px solid #16a34a;padding:15px 32px;">
              <strong style="color:#16a34a;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Payment Received Successfully
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Your payment has been reconciled in Punjab Municipal records and official receipt has been issued.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Official Receipt for Allotment No. <strong>{3}</strong> — Receipt No. <strong>{4}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Thank you. We have received payment of <strong style="color:#111827;">Rs. {2}</strong> towards Rent & Lease Allotment <strong style="color:#111827;">{3}</strong> under Receipt No. <strong style="color:#111827;">{4}</strong>. Your updated ledger and official tax receipt are available for download.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Transaction Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Receipt Number:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Amount Received:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Transaction Status:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">SUCCESS / CLEARED</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{5}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      DOWNLOAD OFFICIAL RECEIPT &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{5}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{5}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_SETTLEMENT_PAYMENT_NOTICE (rl.lease.settlement.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('8698f022-22de-4354-b4fb-c4ee49811871', 'en_IN', 'rl.lease.settlement.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Lease Settlement Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Settlement Dues Notice: Settlement amount of Rs. {2} is payable for surrender/closure of Allotment No. {3}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #7c3aed;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#7c3aed;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Settlement Demand
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#faf5ff;border-bottom:1px solid #e5e7eb;border-left:5px solid #7c3aed;padding:15px 32px;">
              <strong style="color:#7c3aed;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Lease Disconnection / Surrender Settlement
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Final settlement dues are payable to complete lease surrender and issue No Objection Certificate.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {5}<br>
                    <strong style="color:#111827;">Subject:</strong> Settlement Dues for Surrender / Disconnection — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Pursuant to your request for lease surrender or disconnection of Allotment No. <strong style="color:#111827;">{3}</strong>, the final reconciliation of rent, utility dues, and deductions has been processed by <strong style="color:#111827;">{5}</strong>. Please pay the settlement balance below to complete closure.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Final Settlement Statement
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment Identifier:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Competent Authority:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{5}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Net Settlement Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{4}" target="_blank" style="background-color:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY SETTLEMENT DUES &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{4}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{4}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{5}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_APPLICATION_CLOSED_NOTICE (rl.lease.closed.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('061102ae-410b-4f29-8ed2-82a2fab22a76', 'en_IN', 'rl.lease.closed.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Lease Agreement Closed</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Official Confirmation: Rent & Lease Allotment No. {2} has been successfully CLOSED in records of {3}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #475569;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#475569;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Lease Closed
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#f8fafc;border-bottom:1px solid #e5e7eb;border-left:5px solid #475569;padding:15px 32px;">
              <strong style="color:#475569;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Lease Agreement Successfully Closed
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                All obligations have ceased and your lease account has been archived with nil outstanding.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {3}<br>
                    <strong style="color:#111827;">Subject:</strong> Formal Closure of Rent & Lease Allotment — Allotment No. <strong>{2}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                This is to formally certify that Rent & Lease Allotment No. <strong style="color:#111827;">{2}</strong> has been <strong>SUCCESSFULLY CLOSED</strong> in the official records of <strong style="color:#111827;">{3}</strong>. All outstanding demands, security deposits, and settlement accounts have been reconciled and cleared in full.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Closure Confirmation Record
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Issuing ULB / Authority:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Account Status:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">PERMANENTLY CLOSED</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Outstanding Balance:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. 0.00 (NIL)</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="https://mseva.lgpunjab.gov.in/digit-ui/citizen" target="_blank" style="background-color:#475569;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      VIEW CLOSED LEASE ARCHIVE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="https://mseva.lgpunjab.gov.in/digit-ui/citizen" target="_blank" style="color:#1d4ed8;text-decoration:underline;">https://mseva.lgpunjab.gov.in/digit-ui/citizen</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{3}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_OVERDUE_PENALTY_NOTICE (rl.demand.overdue.penalty.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('806b2409-fead-4580-be1e-22141b0e529b', 'en_IN', 'rl.demand.overdue.penalty.sms', 'Dear {1}, rent payment of Rs.{2} for Allotment No.{3} is overdue. Penalty of Rs.{4} applied. Pay now at {5} to avoid lease action - mSeva Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_OVERDUE_DETAILED_NOTICE (rl.demand.overdue.detailed.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('0f6176ed-c631-4d10-aaa8-26a85101e66e', 'en_IN', 'rl.demand.overdue.detailed.sms', 'Dear {1}, your rent of Rs.{2} for property {3} is overdue since {4}. Penalty fee Rs.{5} levied. Total due Rs.{6}. Pay at {7} - {8}, Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_BILL_GENERATED_NOTICE (rl.demand.generated.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('75714983-7df3-480a-b936-09c71f9c4119', 'en_IN', 'rl.demand.generated.sms', 'Dear {1}, rent bill of Rs.{2} for {3} has been generated for Allotment {4}. Due date is {5}. Pay online at {6} - mSeva Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_DUE_DATE_REMINDER (rl.demand.due.reminder.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('5625787a-da71-4b1d-8e97-0b3e2842a9e8', 'en_IN', 'rl.demand.due.reminder.sms', 'Dear {1}, friendly reminder that rent of Rs.{2} for Allotment {3} is due on {4}. Pay at {5} to avoid late fee penalty - mSeva Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_APP_APPROVED_NOTICE (rl.application.approved.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('ac40673f-3617-4750-9788-8c6b8fa6222e', 'en_IN', 'rl.application.approved.sms', 'Dear {1}, your Rent & Lease application {2} has been APPROVED by {3}. Please pay the allotment fee of Rs.{4} at {5} - mSeva Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_PAYMENT_SUCCESS_CONFIRM (rl.payment.success.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('49e0e43e-63c9-4e07-8f83-77a94b5296fd', 'en_IN', 'rl.payment.success.sms', 'Dear {1}, payment of Rs.{2} received towards Rent & Lease Allotment {3} vide Receipt No.{4}. Download receipt at {5} - mSeva Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_SETTLEMENT_PAYMENT_NOTICE (rl.lease.settlement.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('06dde03d-6cf7-4fae-8e02-4ab85b11604d', 'en_IN', 'rl.lease.settlement.sms', 'Dear {1}, settlement dues of Rs.{2} for lease surrender/closure of Allotment {3} are payable. Pay at {4} to complete closure - {5}', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_APPLICATION_CLOSED_NOTICE (rl.lease.closed.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('a8bd2816-f3f3-497c-b570-631dc41499b1', 'en_IN', 'rl.lease.closed.sms', 'Dear {1}, Rent & Lease Allotment {2} has been successfully CLOSED in records of {3}. All dues are cleared. Thank you - mSeva Punjab', 'pb', 'rainmaker-rl', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------------------
-- SECTION: INSERTS FOR MODULE 'rl-services'
-- -----------------------------------------------------------------------------------------

-- Email: RL_OVERDUE_PENALTY_NOTICE (rl.demand.overdue.penalty.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('9f6a0856-0453-4691-a539-a25c3ed56b4f', 'en_IN', 'rl.demand.overdue.penalty.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Overdue Rent Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Statutory Demand Notice: Rent dues for Allotment No. {3} are overdue since {4}. Total Net Outstanding: Rs. {6}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #d97706;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#d97706;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Rent & Lease
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #e5e7eb;border-left:5px solid #dc2626;padding:15px 32px;">
              <strong style="color:#dc2626;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Urgent: Rent Overdue & Penalty Applied
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Immediate settlement required to avoid further penalties or legal lease suspension.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Statutory Demand Notice for Overdue Municipal Rent — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                This is an official notice from <strong style="color:#111827;">{8}</strong>. Your municipal rent dues for Allotment / Property No. <strong style="color:#111827;">{3}</strong> have remained unpaid and are overdue since <strong style="color:#111827;">{4}</strong>. Pursuant to Punjab Municipal rules and lease terms, a late fee penalty has been levied on your account.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Statement of Overdue Dues
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment / Property No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Since:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Original Rent Demand:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Late Penalty Fee (Levied):</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">+ Rs. {5}</td>
                </tr>
                <tr style="background-color:#fef2f2;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#991b1b;">Total Net Outstanding:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY OVERDUE RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_OVERDUE_DETAILED_NOTICE (rl.demand.overdue.detailed.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('1a4ab9cc-ac5c-4647-b8a1-03232c53ab7d', 'en_IN', 'rl.demand.overdue.detailed.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Detailed Rent Overdue Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Official Notice: Your municipal rent of Rs. {2} for Property {3} is overdue since {4}. Total outstanding: Rs. {6}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #dc2626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#dc2626;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Formal Demand
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #e5e7eb;border-left:5px solid #b91c1c;padding:15px 32px;">
              <strong style="color:#b91c1c;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Formal Statutory Rent Demand Notice
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Final opportunity to settle outstanding lease arrears before statutory recovery proceedings.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Formal Statutory Demand Notice for Overdue Rent — Property No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Notice is hereby given by <strong style="color:#111827;">{8}</strong> that municipal rent charges for property <strong style="color:#111827;">{3}</strong> have fallen overdue since <strong style="color:#111827;">{4}</strong>. Applicable late penalty has been computed as per Punjab Municipal Acts.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Formal Arrears Assessment
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Property / Allotment Identifier:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Principal Rent Amount:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Late Penalty Charge:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">+ Rs. {5}</td>
                </tr>
                <tr style="background-color:#fef2f2;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#991b1b;">Total Outstanding Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#b91c1c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      SETTLE OUTSTANDING DUES &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_BILL_GENERATED_NOTICE (rl.demand.generated.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('548c607f-9e68-4931-ad4a-f88d11a38c8a', 'en_IN', 'rl.demand.generated.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Monthly Rent Demand Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Monthly Municipal Rent Demand Notice for {4}: Total payable Rs. {2} for Allotment No. {3}. Due date is {DUE_DATE}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #2563eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#2563eb;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Monthly Demand
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#eff6ff;border-bottom:1px solid #e5e7eb;border-left:5px solid #2563eb;padding:15px 32px;">
              <strong style="color:#2563eb;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Monthly Rent Demand Notice
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Kindly remit your municipal rent on or before <strong>{DUE_DATE}</strong> to avoid late payment penalties.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Monthly Municipal Rent Demand for {4} — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Your monthly municipal rent demand for <strong style="color:#111827;">{8}</strong> has been generated for the billing cycle <strong style="color:#111827;">{4}</strong>. Please review your official bill summary below and complete payment prior to the due date.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Monthly Rent Bill Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Billing Cycle:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{DUE_DATE}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Total Rent Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      VIEW BILL & PAY ONLINE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_DUE_DATE_REMINDER (rl.demand.due.reminder.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('bdc87ae5-cdac-4df3-8ec0-1333e7bd28b4', 'en_IN', 'rl.demand.due.reminder.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rent Due Date Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Friendly Reminder: Rent of Rs. {2} for Allotment No. {3} is due on {4}. Pay online to avoid late penalties.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #f59e0b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#f59e0b;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Due Reminder
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fffbeb;border-bottom:1px solid #e5e7eb;border-left:5px solid #d97706;padding:15px 32px;">
              <strong style="color:#d97706;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Friendly Reminder: Rent Due Soon
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Pay on or before <strong>{4}</strong> to avoid late fee penalty and retain a clean payment record.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Rent Payment Due Date Reminder — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                This is a friendly reminder that municipal rent dues for Allotment No. <strong style="color:#111827;">{3}</strong> are payable on or before <strong style="color:#111827;">{4}</strong>. Avoid the last-minute rush and avoid any statutory late fee penalty by paying online securely.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Upcoming Due Details
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Payment Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Net Amount Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{5}" target="_blank" style="background-color:#d97706;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{5}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{5}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_APP_APPROVED_NOTICE (rl.application.approved.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('cdd33346-2169-4434-a928-cb5222a25fc2', 'en_IN', 'rl.application.approved.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Application Approved & Fee Demand</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Congratulations! Your Rent & Lease Application No. {2} has been APPROVED by {3}. Please remit allotment fee Rs. {4}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #16a34a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Approved
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#f0fdf4;border-bottom:1px solid #e5e7eb;border-left:5px solid #16a34a;padding:15px 32px;">
              <strong style="color:#16a34a;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Application Approved — Allotment Fee Payable
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Your allotment application has completed verification and has been formally approved.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {3}<br>
                    <strong style="color:#111827;">Subject:</strong> Rent & Lease Application Approved — Application No. <strong>{2}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                We are pleased to inform you that your Rent & Lease Application <strong style="color:#111827;">{2}</strong> has been <strong>APPROVED</strong> by <strong style="color:#111827;">{3}</strong>. To complete the allotment process and generate your official lease agreement, please remit the initial allotment fee online.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Approval & Fee Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Application No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Sanctioning Authority:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Initial Allotment Fee Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {4}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{5}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY ALLOTMENT FEE & COMPLETE LEASE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{5}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{5}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{3}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_PAYMENT_SUCCESS_CONFIRM (rl.payment.success.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('d14caa93-7b58-450d-bf9e-93823cfc16f3', 'en_IN', 'rl.payment.success.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Payment Receipt Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Official Payment Receipt: Rs. {2} received for Allotment No. {3} vide Receipt No. {4}. Download your official receipt.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #16a34a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Payment Success
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#f0fdf4;border-bottom:1px solid #e5e7eb;border-left:5px solid #16a34a;padding:15px 32px;">
              <strong style="color:#16a34a;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Payment Received Successfully
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Your payment has been reconciled in Punjab Municipal records and official receipt has been issued.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {8}<br>
                    <strong style="color:#111827;">Subject:</strong> Official Receipt for Allotment No. <strong>{3}</strong> — Receipt No. <strong>{4}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Thank you. We have received payment of <strong style="color:#111827;">Rs. {2}</strong> towards Rent & Lease Allotment <strong style="color:#111827;">{3}</strong> under Receipt No. <strong style="color:#111827;">{4}</strong>. Your updated ledger and official tax receipt are available for download.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Transaction Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Receipt Number:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Amount Received:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Transaction Status:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">SUCCESS / CLEARED</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{5}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      DOWNLOAD OFFICIAL RECEIPT &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{5}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{5}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{8}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_SETTLEMENT_PAYMENT_NOTICE (rl.lease.settlement.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('a4a948a0-df92-4178-854a-01046631d3a7', 'en_IN', 'rl.lease.settlement.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Lease Settlement Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Settlement Dues Notice: Settlement amount of Rs. {2} is payable for surrender/closure of Allotment No. {3}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #7c3aed;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#7c3aed;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Settlement Demand
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#faf5ff;border-bottom:1px solid #e5e7eb;border-left:5px solid #7c3aed;padding:15px 32px;">
              <strong style="color:#7c3aed;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Lease Disconnection / Surrender Settlement
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                Final settlement dues are payable to complete lease surrender and issue No Objection Certificate.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {5}<br>
                    <strong style="color:#111827;">Subject:</strong> Settlement Dues for Surrender / Disconnection — Allotment No. <strong>{3}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                Pursuant to your request for lease surrender or disconnection of Allotment No. <strong style="color:#111827;">{3}</strong>, the final reconciliation of rent, utility dues, and deductions has been processed by <strong style="color:#111827;">{5}</strong>. Please pay the settlement balance below to complete closure.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Final Settlement Statement
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment Identifier:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Competent Authority:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{5}</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Net Settlement Payable:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{4}" target="_blank" style="background-color:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      PAY SETTLEMENT DUES &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="{4}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{4}</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{5}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- Email: RL_APPLICATION_CLOSED_NOTICE (rl.lease.closed.email)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('05068997-8439-4de0-a665-7ec09379aeec', 'en_IN', 'rl.lease.closed.email', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Lease Agreement Closed</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Official Confirmation: Rent & Lease Allotment No. {2} has been successfully CLOSED in records of {3}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b2545;padding:24px 32px;border-bottom:4px solid #475569;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="color:#ffffff;font-size:21px;font-weight:700;letter-spacing:0.3px;display:block;line-height:1.2;">mSeva Punjab</span>
                    <span style="color:#93c5fd;font-size:12px;font-weight:500;display:block;margin-top:4px;">Department of Local Government, Government of Punjab</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color:#475569;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;letter-spacing:0.6px;text-transform:uppercase;display:inline-block;">
                      Lease Closed
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#f8fafc;border-bottom:1px solid #e5e7eb;border-left:5px solid #475569;padding:15px 32px;">
              <strong style="color:#475569;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Lease Agreement Successfully Closed
              </strong>
              <span style="color:#374151;font-size:13px;display:block;margin-top:3px;">
                All obligations have ceased and your lease account has been archived with nil outstanding.
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
                <tr>
                  <td style="font-size:13px;color:#4b5563;line-height:1.5;">
                    <strong style="color:#111827;">Issuing Authority:</strong> {3}<br>
                    <strong style="color:#111827;">Subject:</strong> Formal Closure of Rent & Lease Allotment — Allotment No. <strong>{2}</strong>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#111827;margin:0 0 14px 0;">
                Dear <strong>{1}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.65;color:#374151;margin:0 0 24px 0;">
                This is to formally certify that Rent & Lease Allotment No. <strong style="color:#111827;">{2}</strong> has been <strong>SUCCESSFULLY CLOSED</strong> in the official records of <strong style="color:#111827;">{3}</strong>. All outstanding demands, security deposits, and settlement accounts have been reconciled and cleared in full.
              </p>

              <!-- Breakdown Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Closure Confirmation Record
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Issuing ULB / Authority:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Account Status:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">PERMANENTLY CLOSED</td>
                </tr>
                <tr style="background-color:#eff6ff;">
                  <td style="padding:15px 18px;font-size:14px;font-weight:700;color:#0b2545;">Outstanding Balance:</td>
                  <td align="right" style="padding:15px 18px;font-size:17px;font-weight:800;color:#0b2545;">Rs. 0.00 (NIL)</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="https://mseva.lgpunjab.gov.in/digit-ui/citizen" target="_blank" style="background-color:#475569;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                      VIEW CLOSED LEASE ARCHIVE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or access directly via: <a href="https://mseva.lgpunjab.gov.in/digit-ui/citizen" target="_blank" style="color:#1d4ed8;text-decoration:underline;">https://mseva.lgpunjab.gov.in/digit-ui/citizen</a>
              </p>
              <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:13px;color:#374151;line-height:1.5;">
                Yours faithfully,<br>
                <strong style="color:#111827;">{3}</strong><br>
                <span style="font-size:12px;color:#6b7280;">Department of Local Government, Punjab</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#4b5563;line-height:1.6;">
              <strong style="color:#111827;">Department of Local Government, Punjab (mSeva)</strong><br>
              Helpline: <strong>1800-1800-0172</strong> &nbsp;|&nbsp; Email: <a href="mailto:support.mseva@punjab.gov.in" style="color:#1d4ed8;text-decoration:none;">support.mseva@punjab.gov.in</a> &nbsp;|&nbsp; Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
              <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-style:italic;">
                This is a system generated communication from Punjab Municipal Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_OVERDUE_PENALTY_NOTICE (rl.demand.overdue.penalty.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('0bea5d8e-1464-4294-83d4-6a93769dc950', 'en_IN', 'rl.demand.overdue.penalty.sms', 'Dear {1}, rent payment of Rs.{2} for Allotment No.{3} is overdue. Penalty of Rs.{4} applied. Pay now at {5} to avoid lease action - mSeva Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_OVERDUE_DETAILED_NOTICE (rl.demand.overdue.detailed.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('25196490-25ce-4aa5-a1f2-939a6f0c4618', 'en_IN', 'rl.demand.overdue.detailed.sms', 'Dear {1}, your rent of Rs.{2} for property {3} is overdue since {4}. Penalty fee Rs.{5} levied. Total due Rs.{6}. Pay at {7} - {8}, Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_BILL_GENERATED_NOTICE (rl.demand.generated.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('167f5418-489e-415d-bda5-2fe9197add33', 'en_IN', 'rl.demand.generated.sms', 'Dear {1}, rent bill of Rs.{2} for {3} has been generated for Allotment {4}. Due date is {5}. Pay online at {6} - mSeva Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_DUE_DATE_REMINDER (rl.demand.due.reminder.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('03f8b17d-4243-4f7b-bc41-17da6fa0eabc', 'en_IN', 'rl.demand.due.reminder.sms', 'Dear {1}, friendly reminder that rent of Rs.{2} for Allotment {3} is due on {4}. Pay at {5} to avoid late fee penalty - mSeva Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_APP_APPROVED_NOTICE (rl.application.approved.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('f8b17d1f-1c65-4d6b-9bdc-4c9648e656b7', 'en_IN', 'rl.application.approved.sms', 'Dear {1}, your Rent & Lease application {2} has been APPROVED by {3}. Please pay the allotment fee of Rs.{4} at {5} - mSeva Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_PAYMENT_SUCCESS_CONFIRM (rl.payment.success.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('8d066003-ef74-4e8a-9144-c82cee3454c7', 'en_IN', 'rl.payment.success.sms', 'Dear {1}, payment of Rs.{2} received towards Rent & Lease Allotment {3} vide Receipt No.{4}. Download receipt at {5} - mSeva Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_SETTLEMENT_PAYMENT_NOTICE (rl.lease.settlement.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('b6318ac0-4ace-4454-aea3-9a0aecc3664d', 'en_IN', 'rl.lease.settlement.sms', 'Dear {1}, settlement dues of Rs.{2} for lease surrender/closure of Allotment {3} are payable. Pay at {4} to complete closure - {5}', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- SMS: RL_APPLICATION_CLOSED_NOTICE (rl.lease.closed.sms)
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES ('0a07164a-9485-439d-8a33-96b517cc7286', 'en_IN', 'rl.lease.closed.sms', 'Dear {1}, Rent & Lease Allotment {2} has been successfully CLOSED in records of {3}. All dues are cleared. Thank you - mSeva Punjab', 'pb', 'rl-services', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------------------
-- VERIFICATION QUERY:
-- -----------------------------------------------------------------------------------------
SELECT id, code, locale, module, tenantid, length(message) AS length, createddate
FROM message
WHERE tenantid = 'pb'
  AND code IN (
      'rl.demand.overdue.penalty.email',
      'rl.demand.overdue.detailed.email',
      'rl.demand.generated.email',
      'rl.demand.due.reminder.email',
      'rl.application.approved.email',
      'rl.payment.success.email',
      'rl.lease.settlement.email',
      'rl.lease.closed.email',
      'rl.demand.overdue.penalty.sms',
      'rl.demand.overdue.detailed.sms',
      'rl.demand.generated.sms',
      'rl.demand.due.reminder.sms',
      'rl.application.approved.sms',
      'rl.payment.success.sms',
      'rl.lease.settlement.sms',
      'rl.lease.closed.sms'
  )
ORDER BY module, code;
