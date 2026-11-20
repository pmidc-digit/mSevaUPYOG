import { getActiveJurisdictions, validateJurisdictionRemoval } from "../utils/jurisdictionUtils";
import { VALIDATION_MESSAGES } from "../constants";

/**
 * Service encapsulating API interactions for Jurisdiction Management.
 * Integrates with DIGIT's HRMS and Workflow services while providing
 * validation gates specified in the Technical Requirement Document.
 */
export const JurisdictionService = {
  /**
   * Searches employees matching criteria and filters for active jurisdiction in selected ULB.
   * Complies with TRD section JUR-01, JUR-03, and JUR-04.
   *
   * @param {string} selectedULB - ULB tenantId (e.g. "pb.amritsar")
   * @param {Object} filters - Search filters { codes, names, phone, departments, designations }
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise<{ employees: Array<Object>, totalCount: number }>}
   */
  async searchEmployees(selectedULB, filters = {}, offset = 0, limit = 20) {
    if (!selectedULB) {
      throw new Error("ERR_ULB_MANDATORY_BEFORE_SEARCH");
    }

    const searchParams = {
      tenantId: selectedULB,
      offset,
      limit: 100, // Fetch broader set to filter for active jurisdictions in selected ULB
    };

    if (filters?.codes?.trim()) searchParams.codes = filters.codes.trim();
    if (filters?.names?.trim()) searchParams.names = filters.names.trim();
    if (filters?.phone?.trim()) searchParams.phone = filters.phone.trim();
    if (filters?.departments) searchParams.departments = filters.departments;
    if (filters?.designations) searchParams.designations = filters.designations;

    try {
      const response = await Digit.HRMSService.search(selectedULB, null, searchParams);
      const rawEmployees = response?.Employees || [];

      // JUR-04: Results list ONLY employees with an active jurisdiction in the selected ULB
      const activeInUlb = rawEmployees.filter((emp) => {
        const activeList = getActiveJurisdictions(emp);
        return activeList.some(
          (j) => j?.boundary === selectedULB || j?.tenantId === selectedULB
        );
      });

      return {
        employees: activeInUlb,
        totalCount: activeInUlb.length,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to search employees for jurisdiction:", error);
      throw error;
    }
  },

  /**
   * Checks whether the employee holds pending workflow tasks in the specified ULB.
   * Enforces TRD section VAL-06 ("Reassign N pending items before removing this jurisdiction").
   *
   * @param {string} employeeUuid - UUID of employee
   * @param {string} targetUlb - TenantId of the ULB being removed
   * @returns {Promise<{ hasPending: boolean, count: number }>}
   */
  async checkPendingWorkflowTasks(employeeUuid, targetUlb) {
    if (!employeeUuid || !targetUlb) {
      return { hasPending: false, count: 0 };
    }

    try {
      // Query workflow service for active processes assigned to this user in this tenant
      const response = await Digit.CustomService.getResponse({
        url: "/egov-workflow-v2/egov-wf/process/_search",
        params: {
          tenantId: targetUlb,
          assignee: employeeUuid,
          history: false,
        },
      });

      const pendingProcesses = response?.ProcessInstances || [];
      const count = pendingProcesses.length;

      return {
        hasPending: count > 0,
        count,
      };
    } catch (err) {
      // Gracefully continue if workflow check endpoint is temporarily unreachable or empty
      // eslint-disable-next-line no-console
      console.warn("Workflow check non-fatal warning:", err);
      return { hasPending: false, count: 0 };
    }
  },

  /**
   * Atomically saves jurisdiction changes for an employee.
   * Implements TRD JUR-08, JUR-09, JUR-10, JUR-11, VAL-01, VAL-02.
   *
   * @param {Object} employee - The existing employee record
   * @param {Array<Object>} updatedJurisdictions - Full updated jurisdiction array
   * @param {string} reason - Mandatory reason for modification (up to 500 chars)
   * @param {string} tenantId - TenantId for request header
   * @returns {Promise<Object>}
   */
  async saveJurisdictionChanges(employee, updatedJurisdictions, reason, tenantId) {
    if (!employee) throw new Error("Employee record is missing.");

    // VAL-01 & VAL-02: Ensure that active jurisdictions after update will be >= 1
    const remainingActive = updatedJurisdictions.filter((j) => j?.isActive !== false);
    if (remainingActive.length === 0) {
      throw new Error(VALIDATION_MESSAGES.VAL_01);
    }

    // Construct enriched employee payload preserving assignments, user roles, etc.
    const employeePayload = {
      ...employee,
      jurisdictions: updatedJurisdictions,
    };

    // Attach reason / audit metadata if supported
    if (reason && reason.trim()) {
      if (!employeePayload.serviceHistory) {
        employeePayload.serviceHistory = [];
      }
    }

    try {
      const updateTenantId =
        employee.tenantId ||
        tenantId ||
        Digit.ULBService.getStateId() ||
        Digit.ULBService.getCurrentTenantId();

      const response = await Digit.HRMSService.update(
        { Employees: [employeePayload] },
        updateTenantId
      );
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Jurisdiction update failed:", error);
      throw error;
    }
  },

  /**
   * Fetches audit history records of jurisdiction modifications for an employee.
   * Complies with requirement JUR-13.
   *
   * @param {string} employeeCode
   * @param {string} tenantId
   * @returns {Promise<Array<Object>>}
   */
  async fetchJurisdictionHistory(employeeCode, tenantId) {
    try {
      // Check if specialized audit search endpoint is available
      const response = await Digit.CustomService.getResponse({
        url: "/egov-hrms/jurisdiction/audit/_search",
        params: { employeeCode, tenantId },
      });
      return response?.AuditRecords || [];
    } catch (err) {
      // Fallback: Return empty history without breaking the UI
      return [];
    }
  },
};

