/**
 * Transfer & Appointment Module Constants
 * Compliant with Technical Requirement Document (Feature 1: Jurisdiction Management)
 */

export const MODULE_CODE = "TRANSFER_APPOINTMENT";

export const STATE_TENANT_ID = "pb";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_OFFSET: 0,
};

export const REASON_CONSTRAINTS = {
  MAX_LENGTH: 500,
  MIN_LENGTH: 3,
};

/**
 * Standard business rule validation keys matching TRD section 3.2
 */
export const VALIDATION_MESSAGES = {
  VAL_01: "ERR_CANNOT_REMOVE_LAST_JURISDICTION",
  VAL_02: "ERR_CANNOT_REMOVE_LAST_JURISDICTION",
  VAL_03: "ERR_UNAUTHORIZED_ULB_CHANGE",
  VAL_04: "ERR_DUPLICATE_JURISDICTION",
  VAL_05: "ERR_EMPLOYEE_INACTIVE",
  VAL_06: "ERR_REASSIGN_PENDING_ITEMS",
  VAL_07: "ERR_CONCURRENT_EDIT_STALE",
};

export const ACTION_TYPES = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE: "UPDATE",
};

export const ERROR_MESSAGES_FALLBACK = {
  ERR_CANNOT_REMOVE_LAST_JURISDICTION: "Cannot remove. The employee must have at least one jurisdiction.",
  ERR_SELECT_ULB_TO_ADD: "Please select a ULB to assign.",
  ERR_DUPLICATE_JURISDICTION: "Employee already has this jurisdiction assigned.",
  ERR_FETCHING_EMPLOYEES: "Failed to fetch employees. Please try again.",
  ERR_JURISDICTION_UPDATE_FAILED: "Failed to update jurisdiction. Please try again.",
  ERR_CONCURRENT_EDIT_STALE: "Record was updated by another user. Please refresh and try again.",
  ERR_REASSIGN_PENDING_ITEMS: "Please reassign pending workflow tasks before removing this jurisdiction.",
  ERR_UNAUTHORIZED_ULB_CHANGE: "You are not authorized to modify jurisdictions for other ULBs.",
  ERR_EMPLOYEE_INACTIVE: "Cannot modify jurisdictions for an inactive employee.",
  ERR_BASE_TENANT_MANDATORY: "Base ULB jurisdiction is mandatory.",
  ERR_INVALID_JURISDICTION: "Invalid jurisdiction selected.",
  JUR_NO_CHANGES_TO_SAVE: "No changes staged to save.",
};

/**
 * Returns human-readable error text with fallback if not yet configured in backend localization
 */
export const getLocalizedError = (key, t) => {
  if (!key) return "";
  const translated = typeof t === "function" ? t(key) : key;
  if (translated && translated !== key) return translated;
  return ERROR_MESSAGES_FALLBACK[key] || key;
};

