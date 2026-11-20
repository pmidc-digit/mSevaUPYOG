import { STATE_TENANT_ID, VALIDATION_MESSAGES } from "../constants";

/**
 * Checks whether the current user is a Punjab state-level user.
 * State users have tenantId "pb" or roles with state-wide access.
 *
 * @param {string} tenantId - Current logged-in user tenantId
 * @returns {boolean}
 */
export const isStateLevelUser = (tenantId) => {
  if (!tenantId) return false;
  return tenantId === STATE_TENANT_ID || tenantId === `${STATE_TENANT_ID}.punjab`;
};

/**
 * Filters and returns only active jurisdictions for an employee.
 * In DIGIT/UPYOG, soft-deleted jurisdictions have isActive === false.
 *
 * @param {Object} employee - The employee object
 * @returns {Array<Object>}
 */
export const getActiveJurisdictions = (employee) => {
  if (!employee || !Array.isArray(employee?.jurisdictions)) {
    return [];
  }
  return employee.jurisdictions.filter((j) => j?.isActive !== false);
};

/**
 * Evaluates row-level authorization per TRD section JUR-07 & VAL-03.
 * A ULB user can view all jurisdictions of an employee, but can only act
 * (Add/Remove) on their own ULB row. Punjab state users can act on any row.
 *
 * @param {string} currentUserTenantId - Logged-in user's tenantId
 * @param {string} targetUlbTenantId - TenantId of the jurisdiction row
 * @returns {boolean}
 */
export const canUserModifyJurisdictionRow = (currentUserTenantId, targetUlbTenantId) => {
  if (!currentUserTenantId || !targetUlbTenantId) return false;
  if (isStateLevelUser(currentUserTenantId)) return true;
  const c = currentUserTenantId.toLowerCase();
  const t = targetUlbTenantId.toLowerCase();
  return c === t || c.endsWith(`.${t}`) || t.endsWith(`.${c}`);
};

/**
 * Validates whether a jurisdiction can be added for the employee.
 * Enforces VAL-04 (no duplicate active jurisdiction) and VAL-05 (employee must be active).
 *
 * @param {Object} employee - Employee object
 * @param {string} targetTenantId - ULB tenant to add
 * @returns {{ isValid: boolean, errorKey?: string }}
 */
export const validateJurisdictionAddition = (employee, targetTenantId) => {
  if (!employee) {
    return { isValid: false, errorKey: "ERR_EMPLOYEE_NOT_FOUND" };
  }

  // VAL-05: Inactive employees cannot receive new jurisdictions
  if (employee?.isActive === false || employee?.user?.active === false) {
    return { isValid: false, errorKey: VALIDATION_MESSAGES.VAL_05 };
  }

  // VAL-04: Duplicate active jurisdiction check
  const activeJurisdictions = getActiveJurisdictions(employee);
  const alreadyExists = activeJurisdictions.some(
    (j) => j?.boundary === targetTenantId || j?.tenantId === targetTenantId
  );

  if (alreadyExists) {
    return { isValid: false, errorKey: VALIDATION_MESSAGES.VAL_04 };
  }

  return { isValid: true };
};

/**
 * Validates whether a jurisdiction can be removed for the employee.
 * Enforces VAL-01 (employee must always keep at least one active jurisdiction).
 *
 * @param {Object} employee - Employee object
 * @returns {{ isValid: boolean, errorKey?: string }}
 */
export const validateJurisdictionRemoval = (employee) => {
  if (!employee) {
    return { isValid: false, errorKey: "ERR_EMPLOYEE_NOT_FOUND" };
  }

  const activeJurisdictions = getActiveJurisdictions(employee);

  // VAL-01: An employee must always keep at least one active jurisdiction
  if (activeJurisdictions.length <= 1) {
    return { isValid: false, errorKey: VALIDATION_MESSAGES.VAL_01 };
  }

  return { isValid: true };
};

/**
 * Formats epoch timestamp to standard DD/MM/YYYY readable date.
 *
 * @param {number|string} epoch
 * @returns {string}
 */
export const formatEpochToDate = (epoch) => {
  if (!epoch) return "N/A";
  const date = new Date(Number(epoch));
  if (isNaN(date.getTime())) return "N/A";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Resolves the display name or district of a tenant from the tenants master list.
 *
 * @param {string} tenantId
 * @param {Array<Object>} ulbList
 * @returns {{ ulbName: string, districtName: string }}
 */
export const resolveTenantDetails = (tenantId, ulbList = []) => {
  if (!tenantId) return { ulbName: "N/A", districtName: "N/A" };
  const found = ulbList.find((u) => u?.code === tenantId);
  return {
    ulbName: found?.name || tenantId,
    districtName: found?.city?.districtName || found?.city?.name || "Punjab",
  };
};

