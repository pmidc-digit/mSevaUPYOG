-- =========================================================================================
-- SQL Update / Upsert Queries for Punjab Rent & Lease HTML Email Templates
-- Database: PostgreSQL | Table: message (egov-localization service)
-- State: Punjab (tenantid = 'pb') | Locale: en_IN | Modules: rainmaker-rl & rl-services
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- OPTION 1: DIRECT UPDATE QUERIES (Run these if the records already exist in the database)
-- -----------------------------------------------------------------------------------------

-- 1. UPDATE: Overdue Rent Notice & Penalty Applied (Notification Job)
UPDATE message
SET 
    message = '<!DOCTYPE html>
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
                      Rent &amp; Lease
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #fecaca;border-left:5px solid #dc2626;padding:15px 32px;">
              <strong style="color:#991b1b;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Urgent: Rent Overdue &amp; Penalty Applied
              </strong>
              <span style="color:#7f1d1d;font-size:13px;display:block;margin-top:3px;">
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
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Since:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Original Rent Demand:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;color:#dc2626;font-weight:500;">Late Penalty Fee (Levied):</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;color:#dc2626;">+ Rs. {5}</td>
                </tr>
                <tr>
                  <td style="padding:15px 18px;background-color:#fef2f2;font-size:14px;font-weight:700;color:#991b1b;">Total Net Outstanding:</td>
                  <td align="right" style="padding:15px 18px;background-color:#fef2f2;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(220,38,38,0.28);">
                      PAY OVERDUE RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or copy this secure link: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
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
              Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
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
</html>',
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code IN ('rl.demand.overdue.penalty.email', 'RL_OVERDUE_PENALTY_EMAIL')
  AND locale = 'en_IN'
  AND tenantid = 'pb';

-- 2. UPDATE: Monthly Rent Demand Generated (Bulk Demand Generation Job)
UPDATE message
SET 
    message = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rent Bill Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Monthly Rent Demand Generated for {4} — Allotment No. {3}. Total Rent Payable: Rs. {2}. Due Date: {DUE_DATE}.
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
            <td style="background-color:#eff6ff;border-bottom:1px solid #bfdbfe;border-left:5px solid #2563eb;padding:15px 32px;">
              <strong style="color:#1e40af;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Monthly Rent Demand Notice
              </strong>
              <span style="color:#1e3a8a;font-size:13px;display:block;margin-top:3px;">
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

              <!-- Demand Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Monthly Rent Bill Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Billing Cycle:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;color:#4b5563;">Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;color:#dc2626;">{DUE_DATE}</td>
                </tr>
                <tr>
                  <td style="padding:15px 18px;background-color:#eff6ff;font-size:14px;font-weight:700;color:#0b2545;">Total Rent Payable:</td>
                  <td align="right" style="padding:15px 18px;background-color:#eff6ff;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(22,163,74,0.28);">
                      VIEW BILL &amp; PAY ONLINE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Direct Payment Link: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
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
              Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
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
</html>',
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code IN ('rl.demand.generated.email', 'RL_BILL_GENERATED_EMAIL')
  AND locale = 'en_IN'
  AND tenantid = 'pb';


-- -----------------------------------------------------------------------------------------
-- OPTION 2: SAFE UPSERT QUERIES (Inserts if not present, Updates if already present)
-- Works with UNIQUE constraint (tenantid, locale, module, code)
-- -----------------------------------------------------------------------------------------

-- 1. UPSERT: Overdue Rent Notice & Penalty Applied
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    COALESCE((SELECT id FROM message WHERE code = 'rl.demand.overdue.penalty.email' AND locale = 'en_IN' AND tenantid = 'pb' AND module = 'rainmaker-rl'), gen_random_uuid()::varchar),
    'en_IN',
    'rl.demand.overdue.penalty.email',
    '<!DOCTYPE html>
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
                      Rent &amp; Lease
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #fecaca;border-left:5px solid #dc2626;padding:15px 32px;">
              <strong style="color:#991b1b;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Urgent: Rent Overdue &amp; Penalty Applied
              </strong>
              <span style="color:#7f1d1d;font-size:13px;display:block;margin-top:3px;">
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
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Since:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Original Rent Demand:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;color:#dc2626;font-weight:500;">Late Penalty Fee (Levied):</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;color:#dc2626;">+ Rs. {5}</td>
                </tr>
                <tr>
                  <td style="padding:15px 18px;background-color:#fef2f2;font-size:14px;font-weight:700;color:#991b1b;">Total Net Outstanding:</td>
                  <td align="right" style="padding:15px 18px;background-color:#fef2f2;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(220,38,38,0.28);">
                      PAY OVERDUE RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or copy this secure link: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
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
              Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
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
</html>',
    'pb',
    'rainmaker-rl',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT (tenantid, locale, module, code) 
DO UPDATE SET 
    message = EXCLUDED.message,
    lastmodifieddate = CURRENT_TIMESTAMP;

-- Also insert/update for module 'rl-services' to ensure coverage in case service queries under 'rl-services'
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    COALESCE((SELECT id FROM message WHERE code = 'rl.demand.overdue.penalty.email' AND locale = 'en_IN' AND tenantid = 'pb' AND module = 'rl-services'), gen_random_uuid()::varchar),
    'en_IN',
    'rl.demand.overdue.penalty.email',
    '<!DOCTYPE html>
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
                      Rent &amp; Lease
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef2f2;border-bottom:1px solid #fecaca;border-left:5px solid #dc2626;padding:15px 32px;">
              <strong style="color:#991b1b;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Urgent: Rent Overdue &amp; Penalty Applied
              </strong>
              <span style="color:#7f1d1d;font-size:13px;display:block;margin-top:3px;">
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
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Overdue Since:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Original Rent Demand:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">Rs. {2}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;color:#dc2626;font-weight:500;">Late Penalty Fee (Levied):</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;color:#dc2626;">+ Rs. {5}</td>
                </tr>
                <tr>
                  <td style="padding:15px 18px;background-color:#fef2f2;font-size:14px;font-weight:700;color:#991b1b;">Total Net Outstanding:</td>
                  <td align="right" style="padding:15px 18px;background-color:#fef2f2;font-size:17px;font-weight:800;color:#991b1b;">Rs. {6}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(220,38,38,0.28);">
                      PAY OVERDUE RENT NOW &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Or copy this secure link: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
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
              Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
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
</html>',
    'pb',
    'rl-services',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT (tenantid, locale, module, code) 
DO UPDATE SET 
    message = EXCLUDED.message,
    lastmodifieddate = CURRENT_TIMESTAMP;


-- 2. UPSERT: Monthly Rent Demand Generated
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    COALESCE((SELECT id FROM message WHERE code = 'rl.demand.generated.email' AND locale = 'en_IN' AND tenantid = 'pb' AND module = 'rainmaker-rl'), gen_random_uuid()::varchar),
    'en_IN',
    'rl.demand.generated.email',
    '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rent Bill Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Monthly Rent Demand Generated for {4} — Allotment No. {3}. Total Rent Payable: Rs. {2}. Due Date: {DUE_DATE}.
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
            <td style="background-color:#eff6ff;border-bottom:1px solid #bfdbfe;border-left:5px solid #2563eb;padding:15px 32px;">
              <strong style="color:#1e40af;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Monthly Rent Demand Notice
              </strong>
              <span style="color:#1e3a8a;font-size:13px;display:block;margin-top:3px;">
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

              <!-- Demand Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Monthly Rent Bill Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Billing Cycle:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;color:#4b5563;">Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;color:#dc2626;">{DUE_DATE}</td>
                </tr>
                <tr>
                  <td style="padding:15px 18px;background-color:#eff6ff;font-size:14px;font-weight:700;color:#0b2545;">Total Rent Payable:</td>
                  <td align="right" style="padding:15px 18px;background-color:#eff6ff;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(22,163,74,0.28);">
                      VIEW BILL &amp; PAY ONLINE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Direct Payment Link: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
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
              Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
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
</html>',
    'pb',
    'rainmaker-rl',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT (tenantid, locale, module, code) 
DO UPDATE SET 
    message = EXCLUDED.message,
    lastmodifieddate = CURRENT_TIMESTAMP;

-- Also insert/update for module 'rl-services'
INSERT INTO message (id, locale, code, message, tenantid, module, createdby, createddate, lastmodifiedby, lastmodifieddate)
VALUES (
    COALESCE((SELECT id FROM message WHERE code = 'rl.demand.generated.email' AND locale = 'en_IN' AND tenantid = 'pb' AND module = 'rl-services'), gen_random_uuid()::varchar),
    'en_IN',
    'rl.demand.generated.email',
    '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rent Bill Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Monthly Rent Demand Generated for {4} — Allotment No. {3}. Total Rent Payable: Rs. {2}. Due Date: {DUE_DATE}.
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
            <td style="background-color:#eff6ff;border-bottom:1px solid #bfdbfe;border-left:5px solid #2563eb;padding:15px 32px;">
              <strong style="color:#1e40af;font-size:14px;letter-spacing:0.3px;text-transform:uppercase;display:block;">
                Monthly Rent Demand Notice
              </strong>
              <span style="color:#1e3a8a;font-size:13px;display:block;margin-top:3px;">
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

              <!-- Demand Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:26px;">
                <tr>
                  <td colspan="2" style="background-color:#f9fafb;padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">
                    Monthly Rent Bill Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Allotment No:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">{3}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">Billing Cycle:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">{4}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;color:#4b5563;">Due Date:</td>
                  <td align="right" style="padding:12px 18px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;color:#dc2626;">{DUE_DATE}</td>
                </tr>
                <tr>
                  <td style="padding:15px 18px;background-color:#eff6ff;font-size:14px;font-weight:700;color:#0b2545;">Total Rent Payable:</td>
                  <td align="right" style="padding:15px 18px;background-color:#eff6ff;font-size:17px;font-weight:800;color:#0b2545;">Rs. {2}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{7}" target="_blank" style="background-color:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:6px;display:inline-block;letter-spacing:0.4px;box-shadow:0 3px 6px rgba(22,163,74,0.28);">
                      VIEW BILL &amp; PAY ONLINE &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#6b7280;text-align:center;line-height:1.5;margin:0 0 24px 0;word-break:break-all;">
                Direct Payment Link: <a href="{7}" target="_blank" style="color:#1d4ed8;text-decoration:underline;">{7}</a>
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
              Portal: <a href="https://mseva.lgpunjab.gov.in" target="_blank" style="color:#1d4ed8;text-decoration:none;">mseva.lgpunjab.gov.in</a>
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
</html>',
    'pb',
    'rl-services',
    1,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP
)
ON CONFLICT (tenantid, locale, module, code) 
DO UPDATE SET 
    message = EXCLUDED.message,
    lastmodifieddate = CURRENT_TIMESTAMP;

-- Verification query
SELECT id, code, locale, module, tenantid, length(message) AS template_char_length, lastmodifieddate 
FROM message 
WHERE code IN ('rl.demand.overdue.penalty.email', 'rl.demand.generated.email')
  AND tenantid = 'pb';
