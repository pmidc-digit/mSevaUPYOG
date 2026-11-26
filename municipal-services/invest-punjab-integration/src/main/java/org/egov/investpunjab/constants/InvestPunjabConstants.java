package org.egov.investpunjab.constants;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class InvestPunjabConstants {

    private InvestPunjabConstants() {}

    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DATE_FORMAT = "yyyy-MM-dd";

    // Service Code Constants (Section 5.3 of Specification)
    public static final int SERVICE_CODE_REGISTRATION = 6;
    public static final int SERVICE_CODE_RENEWAL = 7;
    public static final int SERVICE_CODE_AMENDMENT = 8;
    public static final int SERVICE_CODE_REVERIFICATION = 9;
    public static final int SERVICE_CODE_MANUAL_TO_ONLINE = 10;

    // Service Type Identifier Constants
    public static final String SERVICE_WATER_CONNECTION = "BF_LG_WC";
    public static final String SERVICE_SEWER_CONNECTION = "BF_LG_SC";
    public static final String SERVICE_TRADE_LICENSE = "BF_TL";

    // Category Type Constants (Section 5.4 of Specification)
    public static final int CATEGORY_FIRST_TIME = 1;
    public static final int CATEGORY_DUE_PAYMENT = 2;
    public static final int CATEGORY_OBJECTION_RESOLVE = 3;
    public static final int CATEGORY_EDIT = 4;
    public static final int CATEGORY_VIEW_FORM = 5;

    public static final String CATEGORY_CODE_FT = "FT";
    public static final String CATEGORY_CODE_DP = "DP";
    public static final String CATEGORY_CODE_OR = "OR";
    public static final String CATEGORY_CODE_ED = "ED";
    public static final String CATEGORY_CODE_VW = "VW";

    // Status IDs (Section 7.II of Specification v1.2)
    public static final int STATUS_DRAFT = 11;
    public static final int STATUS_SUBMIT_FEE_PENDING = 12;
    public static final int STATUS_BALANCE_FEE_RAISED = 13;
    public static final int STATUS_SUBMIT_PRE_SCRUTINY = 14;
    public static final int STATUS_OBJECTION_RAISED = 15;
    public static final int STATUS_OBJECTION_RESOLVED = 16;
    public static final int STATUS_REJECTED = 17;
    public static final int STATUS_WITHDRAWN = 18;
    public static final int STATUS_APPROVED = 19;
    public static final int STATUS_BALANCE_FEE_PAID = 20;
    public static final int STATUS_FILE_IN_PROCESS = 21;
    public static final int STATUS_PRE_SCRUTINY_OBSERVATION_RAISED = 22;
    public static final int STATUS_PRE_SCRUTINY_OBSERVATION_RESOLVED = 23;
    public static final int STATUS_PRE_SCRUTINY_COMPLETE_SUBMITTED = 24;
    public static final int STATUS_PRE_SCRUTINY_REJECTED = 25;
    public static final int STATUS_FORWARDED_TO_OFFICER = 26;
    public static final int STATUS_PENDING_WITH_LG = 27;

    public static final Map<Integer, String> STATUS_NAME_MAP;
    static {
        Map<Integer, String> map = new HashMap<>();
        map.put(STATUS_DRAFT, "Application Form Save as draft");
        map.put(STATUS_SUBMIT_FEE_PENDING, "Application Submit But Fee Pending");
        map.put(STATUS_BALANCE_FEE_RAISED, "Application Balance fee Raised");
        map.put(STATUS_SUBMIT_PRE_SCRUTINY, "Application Submit For Pre Scrutiny");
        map.put(STATUS_OBJECTION_RAISED, "Application Objection Raised");
        map.put(STATUS_OBJECTION_RESOLVED, "Application Objection Resolved");
        map.put(STATUS_REJECTED, "Application Rejected");
        map.put(STATUS_WITHDRAWN, "Application Withdrawn");
        map.put(STATUS_APPROVED, "Application Approved");
        map.put(STATUS_BALANCE_FEE_PAID, "Application Balance Fee Paid");
        map.put(STATUS_FILE_IN_PROCESS, "File In Process");
        map.put(STATUS_PRE_SCRUTINY_OBSERVATION_RAISED, "Pre Scrutiny Observation raised");
        map.put(STATUS_PRE_SCRUTINY_OBSERVATION_RESOLVED, "Pre Scrutiny Observation Resolved");
        map.put(STATUS_PRE_SCRUTINY_COMPLETE_SUBMITTED, "Pre Scrutiny phase Complete and form Submitted / Application Submit");
        map.put(STATUS_PRE_SCRUTINY_REJECTED, "Pre Scrutiny Rejected");
        map.put(STATUS_FORWARDED_TO_OFFICER, "Forwarding to Supervisor/Nodal Officer/ Processing at Department End (Scrutiny + Normal Process)");
        map.put(STATUS_PENDING_WITH_LG, "Pending With LG");
        STATUS_NAME_MAP = Collections.unmodifiableMap(map);
    }

    // Error Codes (Section 7.III of Specification v1.2)
    public static final String IPBF000 = "IPBF000"; // Application Status Updated
    public static final String IPBF101 = "IPBF101"; // Token Expired
    public static final String IPBF102 = "IPBF102"; // Object Key Names are Not Matched
    public static final String IPBF103 = "IPBF103"; // Object Key length is Not Matched
    public static final String IPBF104 = "IPBF104"; // Key value should not be empty
    public static final String IPBF105 = "IPBF105"; // Date format should be YYYY-MM-DD
    public static final String IPBF106 = "IPBF106"; // Given Status Id is not Mapped
    public static final String IPBF107 = "IPBF107"; // Application is Already Approved
    public static final String IPBF108 = "IPBF108"; // PIN and Application Id is not Exist
    public static final String IPBF109 = "IPBF109"; // Application Status Already Updated
    public static final String IPBF110 = "IPBF110"; // Data not Found
    public static final String IPBF111 = "IPBF111"; // Approval file is not in proper format
    public static final String IPBF112 = "IPBF112"; // Application Submitted status is not received
    public static final String IPBF113 = "IPBF113"; // Form Submission Date is Missing
    public static final String IPBF114 = "IPBF114"; // Process days are coming out to be less than 0
    public static final String IPBF115 = "IPBF115"; // License number is missing
    public static final String IPBF116 = "IPBF116"; // Sender name/Receiver name fields are blank
    public static final String IPBF117 = "IPBF117"; // Approval date is coming as less than submission date
}
