-- ============================================================
-- 1. Demand Generation Start Summary Email Template
-- ============================================================

INSERT INTO public.message
(
    id,
    locale,
    code,
    message,
    tenantid,
    module,
    createdby,
    createddate,
    lastmodifiedby,
    lastmodifieddate
)
VALUES
(
    gen_random_uuid(),
    'en_IN',
    'WS_DEMAND_GEN_START_EMAIL_TEMPLATE',
    '<h2>Water Demand Generation Scheduled - {triggerDate}</h2><!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;"><tr><td style="background:#1a73e8;padding:20px 30px;"><h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Water Demand Generation Scheduler</h1><p style="margin:4px 0 0;color:#c5ddf8;font-size:13px;">Demand Batches Initiated &bull; {triggerDate}</p></td></tr><tr><td style="padding:24px 30px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="48%" style="background:#f8f9fa;border:1px solid #e0e0e0;padding:16px;text-align:center;"><div style="font-size:11px;color:#5f6368;text-transform:uppercase;font-weight:600;">Total Tenants / ULBs</div><div style="font-size:28px;font-weight:700;color:#1a73e8;margin-top:4px;">{totalTenants}</div></td><td width="4%"></td><td width="48%" style="background:#f8f9fa;border:1px solid #e0e0e0;padding:16px;text-align:center;"><div style="font-size:11px;color:#5f6368;text-transform:uppercase;font-weight:600;">Total Connections Queued</div><div style="font-size:28px;font-weight:700;color:#1a73e8;margin-top:4px;">{totalConnections}</div></td></tr></table><h3 style="margin:24px 0 10px;font-size:14px;color:#202124;border-bottom:2px solid #1a73e8;padding-bottom:6px;">Tenant-wise Breakdown</h3><table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;"><thead><tr style="background:#f1f3f4;"><th style="padding:8px 10px;text-align:center;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">#</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Tenant ID</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">City</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Billing Cycle</th><th style="padding:8px 10px;text-align:right;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Connections</th><th style="padding:8px 10px;text-align:center;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Status</th></tr></thead><tbody>{tenantRows}</tbody></table><p style="margin:20px 0 0;font-size:12px;color:#80868b;line-height:1.5;">Demand generation is executing in background. Completion reports will be sent once each tenant finishes processing.</p></td></tr><tr><td style="background:#f8f9fa;padding:14px 30px;text-align:center;font-size:11px;color:#80868b;border-top:1px solid #e0e0e0;">mSeva UPYOG &bull; Water &amp; Sewerage Calculation Engine</td></tr></table></td></tr></table></body></html>',
    'pb',
    'rainmaker-ws',
    0,
    NOW(),
    0,
    NOW()
);


-- ============================================================
-- 2. Demand Generation Completion Email Template
-- ============================================================

INSERT INTO public.message
(
    id,
    locale,
    code,
    message,
    tenantid,
    module,
    createdby,
    createddate,
    lastmodifiedby,
    lastmodifieddate
)
VALUES
(
    gen_random_uuid(),
    'en_IN',
    'WS_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE',
    '<h2>Water Demand Generation Report - {cityName} ({billingCycle})</h2><!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;"><tr><td style="background:#1a73e8;padding:20px 30px;"><h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Water Demand Generation Report</h1><p style="margin:4px 0 0;color:#c5ddf8;font-size:13px;">{cityName} ({tenantId}) &bull; {billingCycle} (FY {financialYear})</p></td></tr><tr><td style="padding:24px 30px;"><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:13px;"><tr><td style="padding:8px 0;color:#5f6368;width:35%;">Status:</td><td style="padding:8px 0;"><span style="background:{statusColor};color:#ffffff;padding:3px 12px;border-radius:3px;font-size:12px;font-weight:600;">{statusLabel}</span></td></tr><tr><td style="padding:8px 0;color:#5f6368;border-top:1px solid #f1f3f4;">Started:</td><td style="padding:8px 0;color:#202124;border-top:1px solid #f1f3f4;">{generatedOn}</td></tr><tr><td style="padding:8px 0;color:#5f6368;border-top:1px solid #f1f3f4;">Completed:</td><td style="padding:8px 0;color:#202124;border-top:1px solid #f1f3f4;">{completedOn}</td></tr><tr><td style="padding:8px 0;color:#5f6368;border-top:1px solid #f1f3f4;">Duration:</td><td style="padding:8px 0;color:#202124;font-weight:600;border-top:1px solid #f1f3f4;">{duration}</td></tr></table><table width="100%" cellpadding="0" cellspacing="8"><tr><td width="50%" style="background:#e8f5e9;border:1px solid #c8e6c9;padding:14px;text-align:center;"><div style="font-size:11px;color:#2e7d32;text-transform:uppercase;font-weight:600;">Demands Generated</div><div style="font-size:26px;font-weight:700;color:#2e7d32;margin-top:4px;">{successCount}</div><div style="font-size:11px;color:#43a047;">of {totalCount} targeted</div></td><td width="50%" style="background:#fce4ec;border:1px solid #f8bbd0;padding:14px;text-align:center;"><div style="font-size:11px;color:#c62828;text-transform:uppercase;font-weight:600;">Failed</div><div style="font-size:26px;font-weight:700;color:#c62828;margin-top:4px;">{failureCount}</div><div style="font-size:11px;color:#e53935;">{successPercentage}% success rate</div></td></tr><tr><td colspan="2" style="background:#e3f2fd;border:1px solid #bbdefb;padding:14px;text-align:center;"><div style="font-size:11px;color:#1565c0;text-transform:uppercase;font-weight:600;">Total Revenue Generated</div><div style="font-size:26px;font-weight:700;color:#1565c0;margin-top:4px;">&#8377; {totalAmount}</div></td></tr></table></td></tr><tr><td style="background:#f8f9fa;padding:14px 30px;text-align:center;font-size:11px;color:#80868b;border-top:1px solid #e0e0e0;">mSeva UPYOG &bull; Water &amp; Sewerage Calculation Engine</td></tr></table></td></tr></table></body></html>',
    'pb',
    'rainmaker-ws',
    0,
    NOW(),
    0,
    NOW()
);


-- ============================================================
-- 3. Bill Generation Completion Email Template
-- ============================================================

INSERT INTO public.message
(
    id,
    locale,
    code,
    message,
    tenantid,
    module,
    createdby,
    createddate,
    lastmodifiedby,
    lastmodifieddate
)
VALUES
(
    gen_random_uuid(),
    'en_IN',
    'WS_BILL_GEN_COMPLETION_EMAIL_TEMPLATE',
    '<h2>Water Bill Generation Report - {primaryCity} ({completedOn})</h2><!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;"><tr><td style="background:#7b1fa2;padding:20px 30px;"><h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Water Bill Generation Report</h1><p style="margin:4px 0 0;color:#e1bee7;font-size:13px;">{primaryCity} ({primaryTenant}) &bull; {totalLocalities} Batches Processed</p></td></tr><tr><td style="padding:24px 30px;"><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:13px;"><tr><td style="padding:8px 0;color:#5f6368;width:35%;">Status:</td><td style="padding:8px 0;"><span style="background:{statusColor};color:#ffffff;padding:3px 12px;border-radius:3px;font-size:12px;font-weight:600;">{overallStatus}</span></td></tr><tr><td style="padding:8px 0;color:#5f6368;border-top:1px solid #f1f3f4;">Started:</td><td style="padding:8px 0;color:#202124;border-top:1px solid #f1f3f4;">{generatedOn}</td></tr><tr><td style="padding:8px 0;color:#5f6368;border-top:1px solid #f1f3f4;">Completed:</td><td style="padding:8px 0;color:#202124;border-top:1px solid #f1f3f4;">{completedOn}</td></tr><tr><td style="padding:8px 0;color:#5f6368;border-top:1px solid #f1f3f4;">Duration:</td><td style="padding:8px 0;color:#202124;font-weight:600;border-top:1px solid #f1f3f4;">{duration}</td></tr></table><table width="100%" cellpadding="0" cellspacing="8"><tr><td width="33%" style="background:#e8f5e9;border:1px solid #c8e6c9;padding:14px;text-align:center;"><div style="font-size:11px;color:#2e7d32;text-transform:uppercase;font-weight:600;">Bills Generated</div><div style="font-size:26px;font-weight:700;color:#2e7d32;margin-top:4px;">{totalSuccess}</div></td><td width="33%" style="background:#fce4ec;border:1px solid #f8bbd0;padding:14px;text-align:center;"><div style="font-size:11px;color:#c62828;text-transform:uppercase;font-weight:600;">Failed</div><div style="font-size:26px;font-weight:700;color:#c62828;margin-top:4px;">{totalFailure}</div></td><td width="34%" style="background:#e3f2fd;border:1px solid #bbdefb;padding:14px;text-align:center;"><div style="font-size:11px;color:#1565c0;text-transform:uppercase;font-weight:600;">Total Amount</div><div style="font-size:26px;font-weight:700;color:#1565c0;margin-top:4px;">&#8377; {totalAmount}</div></td></tr></table><h3 style="margin:24px 0 10px;font-size:14px;color:#202124;border-bottom:2px solid #7b1fa2;padding-bottom:6px;">Locality / Group Breakdown</h3><table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;"><thead><tr style="background:#f1f3f4;"><th style="padding:8px 10px;text-align:center;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">#</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Locality</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">City</th><th style="padding:8px 10px;text-align:right;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Scheduled</th><th style="padding:8px 10px;text-align:right;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Success</th><th style="padding:8px 10px;text-align:right;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Failed</th><th style="padding:8px 10px;text-align:right;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Amount</th><th style="padding:8px 10px;text-align:center;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Status</th></tr></thead><tbody>{localityRows}</tbody></table><h3 style="margin:24px 0 10px;font-size:14px;color:#202124;border-bottom:2px solid #c62828;padding-bottom:6px;">Failure Summary</h3><table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;"><thead><tr style="background:#f1f3f4;"><th style="padding:8px 10px;text-align:center;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">#</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Consumer Code</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Locality</th><th style="padding:8px 10px;text-align:left;color:#5f6368;font-weight:600;border-bottom:1px solid #dadce0;">Reason</th></tr></thead><tbody>{failedRows}</tbody></table></td></tr><tr><td style="background:#f8f9fa;padding:14px 30px;text-align:center;font-size:11px;color:#80868b;border-top:1px solid #e0e0e0;">mSeva UPYOG &bull; Water &amp; Sewerage Calculation Engine</td></tr></table></td></tr></table></body></html>',
    'pb',
    'rainmaker-ws',
    0,
    NOW(),
    0,
    NOW()
);