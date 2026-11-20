import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { Header, Card, Loader, Toast } from "@mseva/digit-ui-react-components";
import JurisdictionPanel from "../../components/JurisdictionPanel";
import RemoveConfirmationModal from "../../components/RemoveConfirmationModal";
import { resolveTenantDetails } from "../../utils/jurisdictionUtils";
import { VALIDATION_MESSAGES, getLocalizedError } from "../../constants";

const getI18n = (t, key, fallback) => {
  if (!t || !key) return fallback || "";
  const val = t(key);
  return !val || val === key ? fallback || key : val;
};

/**
 * Dedicated Full-Page Jurisdiction Details View
 * Opens on a distinct route when an employee is selected from the search results table.
 * Provides clean back-and-forth navigation, avoids page overcrowding and excessive scrolling.
 */
const JurisdictionDetails = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { tenantId, code } = useParams();

  const { data: allTenants = [] } = Digit.Hooks.useTenants();

  // Initial employee from router location state (instant display) or null
  const [employee, setEmployee] = useState(location.state?.employee || null);
  const [isLoading, setIsLoading] = useState(!location.state?.employee);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals & Staged Global Save State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stagedGlobalData, setStagedGlobalData] = useState(null); // { additions: [], removals: [] }
  const [workflowPendingCount, setWorkflowPendingCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(0);

  // Toast state with auto-dismissal
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch or re-fetch employee details
  const fetchEmployeeData = useCallback(async (targetTenant, employeeCode, isBackground = false) => {
    if (!employeeCode) return;
    if (!isBackground) {
      setIsLoading(true);
    }
    try {
      const tenantToSearch = targetTenant || Digit.ULBService.getStateId();
      let fetchedEmp = null;

      // 1. Try targeted tenant search first (fastest)
      try {
        const response = await Digit.HRMSService.search(
          tenantToSearch,
          null,
          { codes: employeeCode }
        );
        fetchedEmp = response?.Employees?.[0];
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Target tenant search failed, falling back to stateId", e);
      }

      // 2. Fallback to stateId search if needed
      if (!fetchedEmp && tenantToSearch !== Digit.ULBService.getStateId()) {
        try {
          const stateRes = await Digit.HRMSService.search(
            Digit.ULBService.getStateId(),
            null,
            { codes: employeeCode }
          );
          fetchedEmp = stateRes?.Employees?.[0];
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("State-level search fallback failed", e);
        }
      }

      if (fetchedEmp) {
        setEmployee(fetchedEmp);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load employee:", err);
      if (!isBackground) {
        setToast({
          key: true,
          label: err?.message || "ERR_FETCHING_EMPLOYEES",
        });
      }
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }, []);

  // On mount: if employee already passed via location.state, load in background (0ms load time!)
  useEffect(() => {
    if (code) {
      fetchEmployeeData(tenantId, code, !!location.state?.employee);
    }
  }, [code, tenantId, fetchEmployeeData, location.state]);

  // Back button navigation
  const handleBackToSearch = () => {
    history.push("/digit-ui/employee/transferAppointment/jurisdiction");
  };

  // Global Save Submission execution
  const handleExecuteGlobalSave = useCallback(
    async ({ additions = [], removals = [], reason = "" }) => {
      if (!employee) return;
      setIsUpdating(true);

      try {
        const stateId = Digit.ULBService.getStateId();

        // 1. Fetch fresh DB employee to obtain 100% of existing DB jurisdictions & IDs
        let latestDbEmp = null;
        try {
          const freshRes = await Digit.HRMSService.search(
            employee.tenantId || tenantId || stateId,
            null,
            { codes: employee.code || code }
          );
          latestDbEmp = freshRes?.Employees?.[0];
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Fresh tenant search fallback", e);
        }

        if (!latestDbEmp && (employee.tenantId || tenantId) !== stateId) {
          try {
            const fallbackRes = await Digit.HRMSService.search(
              stateId,
              null,
              { codes: employee.code || code }
            );
            latestDbEmp = fallbackRes?.Employees?.[0];
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Fresh state search fallback", e);
          }
        }

        const baseEmployee = latestDbEmp || employee;
        const removalSet = new Set(removals);

        // 2. Preserve 100% of existing DB jurisdictions to satisfy ERR_HRMS_UPDATE_JURISDICTION_INCOSISTENT
        // For jurisdictions marked for removal: set isActive: false, isdeleted: true
        // For jurisdictions retained: set isActive: true, isdeleted: false
        const existingDbJurisdictions = baseEmployee.jurisdictions || [];
        const updatedJurisdictionsList = existingDbJurisdictions.map((j) => {
          const key = j.id || j.boundary || j.tenantId;
          const isMarkedForRemoval =
            removalSet.has(key) ||
            removalSet.has(j.boundary) ||
            removalSet.has(j.tenantId) ||
            (j.id && removalSet.has(j.id));

          if (isMarkedForRemoval) {
            return {
              ...j,
              isActive: false,
              isdeleted: true,
              auditDetails: {
                ...(j.auditDetails || {}),
                lastModifiedDate: new Date().getTime(),
              },
            };
          }

          return {
            ...j,
            isActive: j.isActive !== false,
            isdeleted: false,
          };
        });

        // 3. Process additions & collect newly assigned jurisdictions and roles
        const newlyConfiguredRoles = [];

        additions.forEach((unit) => {
          const boundaryCode = typeof unit.boundary === "object" ? unit.boundary?.code : unit.boundary || unit.tenantId;
          const hierarchyCode =
            typeof unit.hierarchy === "object"
              ? unit.hierarchy?.code || unit.hierarchy?.name
              : unit.hierarchy || "REVENUE";
          const boundaryTypeLabel =
            typeof unit.boundaryType === "object"
              ? unit.boundaryType?.label || unit.boundaryType?.code
              : unit.boundaryType || "City";

          // Format roles for this unit with tenantId set to boundary
          const rolesForUnit = (unit.roles || []).map((r) => ({
            code: r.code,
            name: r.name || r.code,
            tenantId: boundaryCode,
          }));

          newlyConfiguredRoles.push(...rolesForUnit);

          const existingIdx = updatedJurisdictionsList.findIndex(
            (j) => (j?.boundary || j?.tenantId) === boundaryCode
          );

          if (existingIdx !== -1) {
            // Reactivate previously existing DB jurisdiction in place, preserving its DB ID
            updatedJurisdictionsList[existingIdx] = {
              ...updatedJurisdictionsList[existingIdx],
              hierarchy: hierarchyCode,
              boundaryType: boundaryTypeLabel,
              boundary: boundaryCode,
              tenantId: boundaryCode,
              isActive: true,
              isdeleted: false,
              auditDetails: {
                ...(updatedJurisdictionsList[existingIdx].auditDetails || {}),
                lastModifiedDate: new Date().getTime(),
              },
            };
          } else {
            // Append brand new jurisdiction (no id, backend creates new row)
            updatedJurisdictionsList.push({
              hierarchy: hierarchyCode,
              boundaryType: boundaryTypeLabel,
              boundary: boundaryCode,
              tenantId: boundaryCode,
              isActive: true,
              isdeleted: false,
            });
          }
        });

        // 4. Synchronize user.roles with additions & removals
        // Collect all boundaries that are actively being configured in Section 2 (additions/edits)
        const editedBoundaries = new Set();
        additions.forEach((unit) => {
          const bCode = (
            typeof unit.boundary === "object"
              ? unit.boundary?.code
              : unit.boundary || unit.tenantId || unit.editingBoundary
          );
          if (bCode) {
            const bLower = String(bCode).toLowerCase();
            editedBoundaries.add(bLower);
            if (bLower.includes(".")) {
              editedBoundaries.add(bLower.split(".").slice(1).join("."));
            }
          }
        });

        // Compute boundaries marked for removal
        const removalBoundaries = new Set();
        removals.forEach((r) => {
          if (!r) return;
          const rLower = String(r).toLowerCase();
          removalBoundaries.add(rLower);
          if (rLower.includes(".")) {
            removalBoundaries.add(rLower.split(".").slice(1).join("."));
          }
          const match = existingDbJurisdictions.find(
            (j) => j.id === r || j.boundary === r || j.tenantId === r
          );
          if (match) {
            if (match.boundary) {
              const mb = String(match.boundary).toLowerCase();
              removalBoundaries.add(mb);
              if (mb.includes(".")) removalBoundaries.add(mb.split(".").slice(1).join("."));
            }
            if (match.tenantId) {
              const mt = String(match.tenantId).toLowerCase();
              removalBoundaries.add(mt);
              if (mt.includes(".")) removalBoundaries.add(mt.split(".").slice(1).join("."));
            }
          }
        });

        const uniqueRoleMap = new Map();

        // 4a. Add all roles for the staged/edited jurisdictions (user's exact selection from MDMS)
        newlyConfiguredRoles.forEach((r) => {
          if (r && r.code && r.tenantId) {
            uniqueRoleMap.set(`${r.tenantId}:${r.code}`, {
              code: r.code,
              name: r.name || r.code,
              tenantId: r.tenantId,
            });
          }
        });

        // 4b. For existing roles in baseEmployee.user.roles:
        // Retain roles for jurisdictions NOT being edited AND NOT being removed
        // Always retain state-level roles (e.g. tenantId === "pb")
        (baseEmployee.user?.roles || []).forEach((r) => {
          if (!r || !r.code) return;
          const roleTenant = (r.tenantId || baseEmployee.tenantId || "").toLowerCase();
          const stateTenant = (stateId || "pb").toLowerCase();

          if (roleTenant === stateTenant || roleTenant === "pb") {
            uniqueRoleMap.set(`${r.tenantId || stateId}:${r.code}`, {
              code: r.code,
              name: r.name || r.code,
              tenantId: r.tenantId || stateId,
            });
            return;
          }

          const isEdited = Array.from(editedBoundaries).some(
            (b) => b === roleTenant || roleTenant.endsWith(`.${b}`) || b.endsWith(`.${roleTenant}`)
          );

          const isRemoved = Array.from(removalBoundaries).some(
            (b) => b === roleTenant || roleTenant.endsWith(`.${b}`) || b.endsWith(`.${roleTenant}`)
          );

          if (!isEdited && !isRemoved) {
            uniqueRoleMap.set(`${r.tenantId}:${r.code}`, {
              code: r.code,
              name: r.name || r.code,
              tenantId: r.tenantId,
            });
          }
        });

        // 4c. Safety fallback: If uniqueRoleMap is empty, preserve baseEmployee.user.roles
        if (uniqueRoleMap.size === 0 && Array.isArray(baseEmployee.user?.roles)) {
          baseEmployee.user.roles.forEach((r) => {
            if (r && r.code) {
              uniqueRoleMap.set(`${r.tenantId || baseEmployee.tenantId || stateId}:${r.code}`, {
                code: r.code,
                name: r.name || r.code,
                tenantId: r.tenantId || baseEmployee.tenantId || stateId,
              });
            }
          });
        }

        const combinedUserRoles = Array.from(uniqueRoleMap.values());

        // 5. Sanitize jurisdictions to clean up any nested objects
        const sanitizedJurisdictions = updatedJurisdictionsList.map((j) => {
          const clean = {
            hierarchy:
              typeof j.hierarchy === "object" ? j.hierarchy?.code || j.hierarchy?.name : j.hierarchy,
            boundaryType:
              typeof j.boundaryType === "object" ? j.boundaryType?.label || j.boundaryType?.code : j.boundaryType,
            boundary: typeof j.boundary === "object" ? j.boundary?.code : j.boundary,
            tenantId: typeof j.tenantId === "object" ? j.tenantId?.code : (j.tenantId || j.boundary),
            isActive: j.isActive !== false,
          };
          if (j.id) clean.id = j.id;
          if (j.auditDetails) clean.auditDetails = j.auditDetails;
          return clean;
        });

        // 6. Construct enriched employee payload preserving assignments & user metadata
        const employeePayload = {
          ...baseEmployee,
          jurisdictions: sanitizedJurisdictions,
          user: {
            ...baseEmployee.user,
            roles: combinedUserRoles,
          },
        };

        // 7. Update via HRMSService.update with employee's base tenant or stateId
        const updateTenantId =
          baseEmployee.tenantId ||
          stateId ||
          Digit.ULBService.getCurrentTenantId();

        const updateRes = await Digit.HRMSService.update(
          { Employees: [employeePayload] },
          updateTenantId
        );

        const updatedEmp = updateRes?.Employees?.[0];

        // 8. Immediately reflect updated employee in local state
        if (updatedEmp) {
          setEmployee({ ...updatedEmp });
        }

        // 9. Signal successful save to reset staged inputs in JurisdictionPanel
        setLastUpdated(Date.now());

        // 10. Invalidate HRMS cache & sync search cache
        Digit.SessionStorage.set("isupdate", Math.floor(100000 + Math.random() * 900000));
        const searchCache = Digit.SessionStorage.get("JUR_SEARCH_CACHE");
        if (searchCache && Array.isArray(searchCache.employees) && updatedEmp) {
          const updatedList = searchCache.employees.map((e) =>
            e.code === updatedEmp.code ? updatedEmp : e
          );
          Digit.SessionStorage.set("JUR_SEARCH_CACHE", {
            ...searchCache,
            employees: updatedList,
          });
        }

        const hasEdits = additions.some((u) => u.isEdit);
        setToast({
          key: false,
          label:
            hasEdits
              ? getI18n(t, "JUR_EDIT_SUCCESS", "Jurisdiction and roles updated successfully.")
              : additions.length > 0 && removals.length > 0
              ? getI18n(t, "JUR_BATCH_UPDATE_SUCCESS", "All jurisdiction changes saved successfully.")
              : additions.length > 0
              ? getI18n(t, "JUR_ADD_SUCCESS", "Jurisdictions and roles assigned successfully.")
              : getI18n(t, "JUR_REMOVE_SUCCESS", "Jurisdiction removed successfully."),
        });

        setShowConfirmModal(false);
        setStagedGlobalData(null);

        // Fallback background refresh if needed
        if (!updatedEmp) {
          await fetchEmployeeData(tenantId, code, true);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Jurisdiction update failed:", err);
        const errMsg =
          err?.response?.data?.Errors?.[0]?.message ||
          err?.response?.data?.Errors?.[0]?.code ||
          String(err?.message || "");

        if (errMsg.includes("stale") || errMsg.includes("version") || errMsg.includes("changed by another user")) {
          setToast({ key: true, label: VALIDATION_MESSAGES.VAL_07 });
        } else {
          setToast({ key: true, label: errMsg || "ERR_JURISDICTION_UPDATE_FAILED" });
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [employee, tenantId, code, fetchEmployeeData, t]
  );

  // Global Save Trigger (Opens confirmation modal immediately if removals present, or saves directly)
  const handleInitiateGlobalSave = useCallback(
    async ({ additions = [], removals = [], netActiveCount }) => {
      if (!employee) return;

      if (netActiveCount < 1) {
        setToast({ key: true, label: VALIDATION_MESSAGES.VAL_02 });
        return;
      }

      setStagedGlobalData({ additions, removals });

      // If any existing jurisdiction is marked for removal, open confirmation modal immediately without blocking loader
      if (removals.length > 0) {
        setShowConfirmModal(true);
      } else {
        // Additions only: proceed directly to atomic save
        await handleExecuteGlobalSave({
          additions,
          removals: [],
          reason: "Jurisdiction(s) assigned with roles",
        });
      }
    },
    [employee, handleExecuteGlobalSave]
  );

  // Primary removal ULB code for modal header display
  const primaryRemovalKey = stagedGlobalData?.removals?.[0];
  const foundPrimaryJur = (employee?.jurisdictions || []).find(
    (j) => j.id === primaryRemovalKey || j.boundary === primaryRemovalKey || j.tenantId === primaryRemovalKey
  );
  const primaryBoundaryCode = foundPrimaryJur?.boundary || foundPrimaryJur?.tenantId || (String(primaryRemovalKey).startsWith("pb") ? primaryRemovalKey : "");
  const targetUlbName = primaryBoundaryCode
    ? resolveTenantDetails(primaryBoundaryCode, allTenants).ulbName
    : "";

  return (
    <div
      className="ground-container"
      style={{
        padding: "1rem 1.5rem",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .ground-container .employeeCard,
        .ground-container .card,
        div.employeeCard.jurisdiction-panel-card,
        div.card.jurisdiction-panel-card,
        .employeeCard.jurisdiction-panel-card,
        .jurisdiction-panel-card.employeeCard,
        .jurisdiction-panel-card.card,
        .jurisdiction-panel-card,
        .employeeCard-override {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
      <Header>
        {getI18n(t, "JUR_DETAILS_PAGE_HEADER", "Jurisdiction Management Details")}
      </Header>

      {/* Loading state when fetching employee */}
      {isLoading && (
        <Card
          className="employeeCard-override"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3.5rem 1.5rem",
            marginTop: "1rem",
            marginLeft: 0,
            marginRight: 0,
            width: "100%",
            textAlign: "center",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <Loader />
          <p
            style={{
              marginTop: "1.25rem",
              color: "#505a5f",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {getI18n(t, "JUR_LOADING_EMPLOYEE_DETAILS", "Loading employee jurisdiction details... Please wait.")}
          </p>
        </Card>
      )}

      {/* When employee not found */}
      {!isLoading && !employee && (
        <Card
          className="employeeCard-override"
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            marginTop: "1rem",
            marginLeft: 0,
            marginRight: 0,
            width: "100%",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#c62828" }}>
            {getI18n(t, "ERR_EMPLOYEE_NOT_FOUND", "Employee record not found.")}
          </h2>
          <p style={{ color: "#505a5f", marginTop: "0.5rem" }}>
            {getI18n(t, "ERR_EMPLOYEE_NOT_FOUND_DESC", "Could not retrieve details for employee ID: ")}
            <strong>{code}</strong>
          </p>
          <button
            type="button"
            onClick={handleBackToSearch}
            style={{
              marginTop: "1.5rem",
              padding: "8px 20px",
              backgroundColor: "#c84c0e",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {getI18n(t, "CS_COMMON_BACK_TO_SEARCH", "Back to Search")}
          </button>
        </Card>
      )}

      {/* Dedicated Jurisdiction Panel */}
      {!isLoading && employee && (
        <JurisdictionPanel
          employee={employee}
          allTenants={allTenants}
          onInitiateGlobalSave={handleInitiateGlobalSave}
          onClose={handleBackToSearch}
          isUpdating={isUpdating}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Removal Confirmation & Reason Modal */}
      <RemoveConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setStagedGlobalData(null);
        }}
        onConfirm={(reason) =>
          handleExecuteGlobalSave({
            additions: stagedGlobalData?.additions || [],
            removals: stagedGlobalData?.removals || [],
            reason,
          })
        }
        employee={employee}
        targetUlb={primaryRemovalKey}
        targetUlbName={targetUlbName}
        batchDetails={stagedGlobalData}
        allTenants={allTenants}
        isSubmitting={isUpdating}
        workflowPendingCount={workflowPendingCount}
      />

      {/* Auto-dismissing Toast notification */}
      {toast && (
        <Toast
          error={toast.key}
          label={toast.key ? getLocalizedError(toast.label, t) : t(toast.label)}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default JurisdictionDetails;
