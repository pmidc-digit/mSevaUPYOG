-- =========================================================================================
-- SQL UPDATE & CLEANUP SCRIPT FOR PUNJAB RENT & LEASE NOTIFICATIONS
-- Database: PostgreSQL | Table: message (egov-localization service)
-- State: Punjab (tenantid = 'pb') | Locale: en_IN
-- Entity ID (PE ID): 1301157492438182299 (Department of Local Government, Punjab)
-- Architecture:
--   - 'rl-services'   : Allotment Approval, Payment Receipt, Lease Settlement, Allotment Closure
--   - 'rl-calculator' : Rent Bill Generated, Due Date Reminder, Overdue Penalty, Detailed Notice
--   - 'rainmaker-rl'  : Redundant notification duplicates removed
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- PART 1: REASSIGN DEMAND NOTIFICATIONS TO 'rl-calculator' (IF STORED UNDER 'rl-services')
-- -----------------------------------------------------------------------------------------
UPDATE message
SET 
    module = 'rl-calculator',
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE module = 'rl-services'
  AND tenantid = 'pb'
  AND code LIKE 'rl.demand.%';
-- -----------------------------------------------------------------------------------------
-- PART 2: UPDATE 'rl-services' SMS TEMPLATES WITH DLT ENTITY ID & TEMPLATE IDs
-- -----------------------------------------------------------------------------------------

-- 2.1 RL_APP_APPROVED_NOTICE (Template ID: 1477179456975580842)
UPDATE message
SET 
    message = 'Dear {1}, your Rent & Lease application {2} has been APPROVED by {3}. Please pay the allotment fee of Rs.{4} at {5} - mSeva Punjab|1301157492438182299|1477179456975580842',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.application.approved.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-services';

-- 2.2 RL_PAYMENT_SUCCESS_CONFIRM (Template ID: 1477179456993786576)
UPDATE message
SET 
    message = 'Dear {1}, payment of Rs.{2} received towards Rent & Lease Allotment {3} vide Receipt No.{4}. Download receipt at {5} - mSeva Punjab|1301157492438182299|1477179456993786576',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.payment.success.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-services';

-- 2.3 RL_SETTLEMENT_PAYMENT_NOTICE (Template ID: 1477179457000595218)
UPDATE message
SET 
    message = 'Dear {1}, settlement dues of Rs.{2} for lease surrender/closure of Allotment {3} are payable. Pay at {4} to complete closure - {5}|1301157492438182299|1477179457000595218',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.lease.settlement.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-services';

-- 2.4 RL_APPLICATION_CLOSED_NOTICE (Template ID: 1477179457006970259)
UPDATE message
SET 
    message = 'Dear {1}, Rent & Lease Allotment {2} has been successfully CLOSED in records of {3}. All dues are cleared. Thank you - mSeva Punjab|1301157492438182299|1477179457006970259',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.lease.closed.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-services';


-- -----------------------------------------------------------------------------------------
-- PART 3: UPDATE 'rl-calculator' SMS TEMPLATES WITH DLT ENTITY ID & TEMPLATE IDs
-- -----------------------------------------------------------------------------------------

-- 3.1 RL_BILL_GENERATED_NOTICE (Template ID: 1477179456948449244)
UPDATE message
SET 
    message = 'Dear {1}, rent bill of Rs.{2} for {3} has been generated for Allotment {4}. Due date is {5}. Pay online at {6} - mSeva Punjab|1301157492438182299|1477179456948449244',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.demand.generated.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-calculator';

-- 3.2 RL_DUE_DATE_REMINDER (Template ID: 1477179456962813261)
UPDATE message
SET 
    message = 'Dear {1}, friendly reminder that rent of Rs.{2} for Allotment {3} is due on {4}. Pay at {5} to avoid late fee penalty - mSeva Punjab|1301157492438182299|1477179456962813261',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.demand.due.reminder.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-calculator';

-- 3.3 RL_OVERDUE_PENALTY_NOTICE (Template ID: 1477179456910508069)
UPDATE message
SET 
    message = 'Dear {1}, rent payment of Rs.{2} for Allotment No.{3} is overdue. Penalty of Rs.{4} applied. Pay now at {5} to avoid lease action - mSeva Punjab|1301157492438182299|1477179456910508069',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.demand.overdue.penalty.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-calculator';

-- 3.4 RL_OVERDUE_DETAILED_NOTICE (Template ID: 1477179456929015120)
UPDATE message
SET 
    message = 'Dear {1}, your rent of Rs.{2} for property {3} is overdue since {4}. Penalty fee Rs.{5} levied. Total due Rs.{6}. Pay at {7} - {8}, Punjab|1301157492438182299|1477179456929015120',
    lastmodifiedby = 1,
    lastmodifieddate = CURRENT_TIMESTAMP
WHERE code = 'rl.demand.overdue.detailed.sms'
  AND tenantid = 'pb'
  AND locale = 'en_IN'
  AND module = 'rl-calculator';


-- -----------------------------------------------------------------------------------------
-- -----------------------------------------------------------------------------------------
-- PART 4: COMPLETE VERIFICATION (SHOWS ALL 16 ROWS: 8 SMS + 8 EMAILS)
-- Expected result: 
--   - 'rl-services'   : 4 SMS + 4 EMAILS (8 rows)
--   - 'rl-calculator' : 4 SMS + 4 EMAILS (8 rows)
--   - 'rainmaker-rl'  : 0 rows (cleaned)
-- -----------------------------------------------------------------------------------------
SELECT module, 
       CASE WHEN code LIKE '%.sms' THEN 'SMS' ELSE 'EMAIL' END AS channel,
       code, 
       CASE 
           WHEN code LIKE '%.sms' THEN message 
           ELSE SUBSTRING(message FROM 1 FOR 70) || '... [HTML Email]' 
       END AS message_preview
FROM message 
WHERE tenantid = 'pb' 
  AND locale = 'en_IN' 
  AND (
      code LIKE 'rl.application.%'
      OR code LIKE 'rl.payment.%'
      OR code LIKE 'rl.lease.%'
      OR code LIKE 'rl.demand.%'
  )
ORDER BY module, channel DESC, code;
