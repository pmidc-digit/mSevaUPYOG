import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardSubHeader,
  Dropdown,
  Loader,
  Toast,
  RemoveableTag,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import {
  getActiveJurisdictions,
  canUserModifyJurisdictionRow,
  isStateLevelUser,
  resolveTenantDetails,
} from "../utils/jurisdictionUtils";
import { VALIDATION_MESSAGES, getLocalizedError } from "../constants";

/**
 * Robust Localization Helper:
 * If the key does not exist in MDMS translation tables, returns the human-readable fallback
 * rather than echoing the bare uppercase key (e.g. HR_JURISDICTION_SUBTITLE).
 */
const getI18n = (t, key, fallback) => {
  if (!key) return fallback || "";
  const translated = t(key);
  return !translated || translated === key ? fallback : translated;
};

/**
 * Dedicated Interactive Role Selector Dropdown
 * Updates selected roles in real time on checkbox click so that:
 * 1. Tags appear immediately below the input.
 * 2. Roles are always synchronized in state before save is clicked.
 */
const RoleSelectDropdown = ({ options = [], selected = [], onSelect, t, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const selectedCodeSet = useMemo(() => {
    return new Set((selected || []).map((r) => r.code));
  }, [selected]);

  const filteredOptions = useMemo(() => {
    if (!search || !search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.name?.toLowerCase().includes(q) ||
        opt.code?.toLowerCase().includes(q) ||
        (opt.labelKey && t(opt.labelKey)?.toLowerCase().includes(q))
    );
  }, [options, search, t]);

  const handleToggle = (role) => {
    let nextSelected;
    if (selectedCodeSet.has(role.code)) {
      nextSelected = selected.filter((r) => r.code !== role.code);
    } else {
      nextSelected = [...selected, role];
    }
    onSelect(nextSelected);
  };

  const displayText =
    selected.length > 0
      ? `${selected.length} ${getI18n(t, "SELECTED", "Selected")}`
      : getI18n(t, "HR_ROLE_PLACEHOLDER", "Select Roles");

  return (
    <div
      ref={dropdownRef}
      className="multi-select-dropdown-wrap"
      style={{ position: "relative", width: "100%", opacity: disabled ? 0.6 : 1 }}
    >
      <div
        className={`master${isOpen ? "-active" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          border: isOpen ? "1px solid #c84c0e" : "1px solid #757575",
          borderRadius: "4px",
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          minHeight: "40px",
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: "0.95rem", color: selected.length > 0 ? "#0b0c0c" : "#757575" }}>
          {displayText}
        </span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            color: "#505a5f",
            fontSize: "0.8rem",
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && !disabled && (
        <div
          className="server"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "#fff",
            border: "1px solid #d6d5d4",
            borderRadius: "4px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            maxHeight: "260px",
            overflowY: "auto",
            marginTop: "4px",
          }}
        >
          {options.length > 5 && (
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #e0e0e0" }}>
              <input
                type="text"
                placeholder={getI18n(t, "ES_COMMON_SEARCH", "Search roles...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #d6d5d4",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  boxSizing: "border-box",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div style={{ padding: "12px", color: "#757575", fontSize: "0.85rem", textAlign: "center" }}>
              {options.length === 0
                ? getI18n(t, "HR_SELECT_SERVICE_FIRST_FOR_ROLES", "Please select a Service to view roles.")
                : getI18n(t, "CS_COMMON_NO_RESULTS", "No roles found.")}
            </div>
          ) : (
            filteredOptions.map((role) => {
              const isChecked = selectedCodeSet.has(role.code);
              return (
                <div
                  key={role.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(role);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    backgroundColor: isChecked ? "#f0f7ff" : "#fff",
                    borderBottom: "1px solid #f5f5f5",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#c84c0e",
                    }}
                  />
                  <span style={{ fontSize: "0.9rem", color: "#0b0c0c", fontWeight: isChecked ? 600 : 400 }}>
                    {t(role.labelKey) || role.name || role.code}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/**
 * JurisdictionPanel:
 * - Proper horizontal spacing between label (fixed width) and input (flex: 1).
 * - Asterisk placed cleanly on the same line as label.
 * - Starts with nothing pre-selected (null).
 * - Immediate real-time role tags.
 * - No raw translation keys.
 */
const JurisdictionPanel = ({
  employee,
  allTenants = [],
  onInitiateGlobalSave,
  onClose,
  isUpdating = false,
  lastUpdated = 0,
}) => {
  const { t } = useTranslation();
  const currentUserTenantId = Digit.ULBService.getCurrentTenantId();
  const isStateUser = isStateLevelUser(currentUserTenantId);

  // MDMS Data for HRMS Roles, Designations, Boundaries, and Role Groups
  const { data: hrmsMdmsData = {} } =
    Digit.Hooks.hrms?.useHrmsMDMS?.(currentUserTenantId, "egov-hrms", "HRMSRolesandDesignation") || {};

  const { data: roleGroups = [] } =
    Digit.Hooks.useCustomMDMS?.(currentUserTenantId, "ACCESSCONTROL-ROLES", [{ name: "roleGroups" }]) || {};

  // Formatted City / Tenant list
  const allFormattedCities = useMemo(() => {
    const rawList =
      allTenants && allTenants.length > 0
        ? allTenants
        : (hrmsMdmsData?.MdmsRes?.tenant?.tenants || []).filter(
            (city) => city.code !== Digit.ULBService.getStateId()
          );

    return rawList.map((city) => ({
      ...city,
      i18text: Digit.Utils.locale.getCityLocale(city.code) || city.name || city.code,
    }));
  }, [allTenants, hrmsMdmsData]);

  // Hierarchies from MDMS (ADMIN, REVENUE, etc.)
  const hierarchylist = useMemo(() => {
    return hrmsMdmsData?.MdmsRes?.["egov-location"]?.["TenantBoundary"]?.map((ele) => ele.hierarchyType) || [];
  }, [hrmsMdmsData]);

  // Boundary Types helper based on hierarchy
  const getBoundaryTypesForHierarchy = (hierarchyCode) => {
    if (hierarchyCode && hrmsMdmsData?.MdmsRes?.["egov-location"]?.["TenantBoundary"]) {
      const types = hrmsMdmsData.MdmsRes["egov-location"]["TenantBoundary"]
        .filter((ele) => ele?.hierarchyType?.code === hierarchyCode)
        .map((item) => ({
          ...item.boundary,
          label: item.boundary.label,
          i18text: Digit.Utils.locale.convertToLocale(item.boundary.label, "EGOV_LOCATION_BOUNDARYTYPE"),
        }));
      if (types.length > 0) return types;
    }
    return [{ code: "City", label: "City", i18text: getI18n(t, "COMMON_MASTERS_BOUNDARYTYPE_CITY", "City") }];
  };

  // All system roles formatted from ACCESSCONTROL-ROLES MDMS
  const allAvailableRoles = useMemo(() => {
    const roles = hrmsMdmsData?.MdmsRes?.["ACCESSCONTROL-ROLES"]?.roles || [];
    return roles
      .filter((r) => r && r.code && r.code !== "CITIZEN")
      .map((r) => ({
        code: r.code,
        name: r.name || r.code,
        labelKey: "ACCESSCONTROL_ROLES_ROLES_" + r.code,
        description: r.description || "",
        groupId: r.groupId,
      }));
  }, [hrmsMdmsData]);

  // Service / Role Groups from MDMS with an "All Services" filter option
  const serviceOptions = useMemo(() => {
    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];
    return [
      { groupId: "ALL", groupName: getI18n(t, "HR_ALL_SERVICES", "All Services (Filter)") },
      ...groups,
    ];
  }, [roleGroups, t]);

  // Roles for a given selected Service, or all available roles if no service selected
  const getRolesForService = (service) => {
    if (!service || service.groupId === "ALL") {
      return allAvailableRoles;
    }
    return allAvailableRoles.filter((r) => r?.groupId === service.groupId);
  };

  // Active Jurisdictions list for this employee
  const activeJurisdictions = useMemo(() => {
    return getActiveJurisdictions(employee);
  }, [employee]);

  // Check if this ULB user already has an active jurisdiction for their own ULB
  const ulbHasExistingJurisdiction = useMemo(() => {
    if (isStateUser) return false;
    const userCode = currentUserTenantId?.toLowerCase();
    return activeJurisdictions.some((j) => {
      const jurCode = (j.boundary || j.tenantId)?.toLowerCase();
      return (
        jurCode === userCode ||
        userCode?.endsWith(`.${jurCode}`) ||
        jurCode?.endsWith(`.${userCode}`)
      );
    });
  }, [isStateUser, currentUserTenantId, activeJurisdictions]);

  // Lookup existing roles assigned to employee for a boundary
  const getRolesForBoundary = (boundaryCode) => {
    if (!boundaryCode || !employee?.user?.roles) return [];
    const bCode = boundaryCode.toLowerCase();
    return employee.user.roles.filter((r) => {
      const rTenant = (r.tenantId || "").toLowerCase();
      return rTenant === bCode || bCode.endsWith(`.${rTenant}`) || rTenant.endsWith(`.${bCode}`);
    });
  };

  // Staged removals (Set of keys/boundaries)
  const [stagedRemovals, setStagedRemovals] = useState(new Set());

  // Staged new jurisdictions (Array of jurisdiction builder objects)
  const [newJurisdictions, setNewJurisdictions] = useState([]);

  // Reset staged additions and removals immediately when save succeeds or employee reference updates
  useEffect(() => {
    if (lastUpdated > 0) {
      setNewJurisdictions([]);
      setStagedRemovals(new Set());
    }
  }, [lastUpdated]);

  // Toast state
  const [panelToast, setPanelToast] = useState(null);

  useEffect(() => {
    if (panelToast) {
      const timer = setTimeout(() => {
        setPanelToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [panelToast]);

  // Available cities for a new jurisdiction unit
  // ULB user: can ONLY choose their own ULB (e.g. Testing). Multiple services can be added under their own ULB!
  // State user: can choose any ULB in Punjab.
  const getAvailableCitiesForUnit = (unitKey) => {
    const userTenantCode = currentUserTenantId?.toLowerCase();

    if (!isStateUser) {
      const matched = (allTenants || []).find((u) => u?.code?.toLowerCase() === userTenantCode);
      const tenantInfo = resolveTenantDetails(currentUserTenantId, allTenants);
      return [
        {
          code: currentUserTenantId,
          name: matched?.name || tenantInfo.ulbName,
          i18text: matched?.name || tenantInfo.ulbName || currentUserTenantId,
        },
      ];
    }

    return allFormattedCities;
  };

  // Net active count calculation (VAL-02 guard)
  const netActiveCount = useMemo(() => {
    const remainingActive = activeJurisdictions.filter(
      (j) => !stagedRemovals.has(j.id || j.boundary || j.tenantId)
    ).length;
    return remainingActive + newJurisdictions.length;
  }, [activeJurisdictions, stagedRemovals, newJurisdictions]);

  const hasPendingChanges = stagedRemovals.size > 0 || newJurisdictions.length > 0;
  const canGlobalSave = hasPendingChanges && netActiveCount >= 1;

  // Toggle stage removal for an existing active jurisdiction
  const handleToggleStageRemoval = (itemKey) => {
    setStagedRemovals((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  // Default jurisdiction unit generator:
  // For ULB user (!isStateUser): prefill hierarchy (REVENUE), boundaryType (City), and boundary (own ULB)
  // For state user (isStateUser): starts unselected (null) so user can pick any ULB across Punjab
  const getDefaultJurisdictionUnit = useCallback(
    (nextKey) => {
      if (isStateUser) {
        return {
          key: nextKey,
          hierarchy: null,
          boundaryType: null,
          boundary: null,
          tenantId: null,
          service: null,
          roles: [],
        };
      }

      // 1. Hierarchy: match employee's active jurisdiction hierarchy, or default to REVENUE
      const existingHierarchy =
        activeJurisdictions[0]?.hierarchy ||
        employee?.jurisdictions?.[0]?.hierarchy ||
        "REVENUE";
      const hierarchyObj =
        (hierarchylist || []).find(
          (h) => (h?.code || h)?.toUpperCase() === existingHierarchy?.toUpperCase()
        ) ||
        (hierarchylist || []).find((h) => (h?.code || h)?.toUpperCase() === "REVENUE") ||
        hierarchylist[0] || { code: "REVENUE", name: "REVENUE" };

      const hierarchyCode = hierarchyObj?.code || hierarchyObj?.name || "REVENUE";

      // 2. Boundary Type: resolve for the hierarchy (City)
      const boundaryTypes = getBoundaryTypesForHierarchy(hierarchyCode);
      const existingBoundaryType =
        activeJurisdictions[0]?.boundaryType ||
        employee?.jurisdictions?.[0]?.boundaryType ||
        "City";
      const boundaryTypeObj =
        (boundaryTypes || []).find(
          (bt) =>
            (bt?.label || bt?.code || bt)?.toLowerCase() ===
            String(existingBoundaryType).toLowerCase()
        ) ||
        (boundaryTypes || []).find(
          (bt) => (bt?.label || bt?.code || bt)?.toLowerCase() === "city"
        ) ||
        boundaryTypes[0] || {
          code: "City",
          label: "City",
          i18text: getI18n(t, "COMMON_MASTERS_BOUNDARYTYPE_CITY", "City"),
        };

      // 3. Boundary (ULB): logged-in user's ULB
      const cities = getAvailableCitiesForUnit(nextKey);
      const cityObj = cities?.[0] || {
        code: currentUserTenantId,
        name: Digit.Utils.locale?.getCityLocale?.(currentUserTenantId) || currentUserTenantId,
        i18text: Digit.Utils.locale?.getCityLocale?.(currentUserTenantId) || currentUserTenantId,
      };

      return {
        key: nextKey,
        hierarchy: hierarchyObj,
        boundaryType: boundaryTypeObj,
        boundary: cityObj,
        tenantId: cityObj?.code || currentUserTenantId,
        service: null,
        roles: [],
      };
    },
    [
      isStateUser,
      activeJurisdictions,
      employee,
      hierarchylist,
      currentUserTenantId,
      allTenants,
      t,
    ]
  );

  // Add a new Jurisdiction builder card - Prefilled for ULB users, empty for state users
  const handleAddJurisdictionUnit = () => {
    setNewJurisdictions((prev) => {
      const nextKey = prev.length > 0 ? Math.max(...prev.map((j) => j.key || 0)) + 1 : 1;
      return [...prev, getDefaultJurisdictionUnit(nextKey)];
    });
  };

  // Remove a new Jurisdiction builder card
  const handleRemoveJurisdictionUnit = (unitKey) => {
    setNewJurisdictions((prev) => prev.filter((u) => u.key !== unitKey));
  };

  // Check if an existing jurisdiction row is currently being edited in staged cards
  const isRowBeingEdited = (jurisdiction) => {
    const targetUlb = jurisdiction.boundary || jurisdiction.tenantId;
    if (!targetUlb) return false;
    const tLower = targetUlb.toLowerCase();
    return newJurisdictions.some((u) => {
      const uCode = (u.editingBoundary || u.boundary?.code || u.tenantId)?.toLowerCase();
      return (
        (uCode === tLower || tLower.endsWith(`.${uCode}`) || uCode?.endsWith(`.${tLower}`)) &&
        u.isEdit
      );
    });
  };

  // Edit an existing jurisdiction row: prefills its hierarchy, boundary, service, and existing roles
  const handleEditJurisdictionRow = (jurisdiction) => {
    const targetUlb = jurisdiction.boundary || jurisdiction.tenantId;
    if (!targetUlb) return;

    const itemKey = jurisdiction.id || targetUlb;
    // If it was staged for removal, cancel the removal
    if (stagedRemovals.has(itemKey)) {
      setStagedRemovals((prev) => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }

    // If already being edited, smoothly scroll to the edit section
    if (isRowBeingEdited(jurisdiction)) {
      const detailsSection = document.getElementById("jurisdiction-details-section");
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // 1. Resolve Hierarchy
    const existingHierarchy = jurisdiction.hierarchy || "REVENUE";
    const hierarchyObj =
      (hierarchylist || []).find(
        (h) => (h?.code || h)?.toUpperCase() === existingHierarchy?.toUpperCase()
      ) ||
      (hierarchylist || []).find((h) => (h?.code || h)?.toUpperCase() === "REVENUE") ||
      hierarchylist[0] || { code: "REVENUE", name: "REVENUE" };

    const hierarchyCode = hierarchyObj?.code || hierarchyObj?.name || "REVENUE";

    // 2. Resolve Boundary Type
    const boundaryTypes = getBoundaryTypesForHierarchy(hierarchyCode);
    const existingBoundaryType = jurisdiction.boundaryType || "City";
    const boundaryTypeObj =
      (boundaryTypes || []).find(
        (bt) =>
          (bt?.label || bt?.code || bt)?.toLowerCase() ===
          String(existingBoundaryType).toLowerCase()
      ) ||
      (boundaryTypes || []).find(
        (bt) => (bt?.label || bt?.code || bt)?.toLowerCase() === "city"
      ) ||
      boundaryTypes[0] || {
        code: "City",
        label: "City",
        i18text: getI18n(t, "COMMON_MASTERS_BOUNDARYTYPE_CITY", "City"),
      };

    // 3. Resolve Boundary
    const tenantDetails = resolveTenantDetails(targetUlb, allTenants);
    const boundaryObj = {
      code: targetUlb,
      name: tenantDetails.ulbName || targetUlb,
      i18text: tenantDetails.ulbName || targetUlb,
    };

    // 4. Resolve Existing Roles for this boundary
    const existingRoles = getRolesForBoundary(targetUlb);

    const allMdmsRoles = hrmsMdmsData?.MdmsRes?.["ACCESSCONTROL-ROLES"]?.roles || [];

    // Map existing roles to include full role metadata (name, labelKey, groupId)
    const mappedExistingRoles = existingRoles.map((r) => {
      const mdmsR = allMdmsRoles.find((ar) => ar.code === r.code);
      return {
        code: r.code,
        name: r.name || mdmsR?.name || r.code,
        labelKey: "ACCESSCONTROL_ROLES_ROLES_" + r.code,
        description: mdmsR?.description || "",
        groupId: mdmsR?.groupId,
      };
    });

    // Detect if all existing roles belong to a single service group
    const distinctGroupIds = Array.from(
      new Set(mappedExistingRoles.map((r) => r.groupId).filter(Boolean))
    );
    const matchedService =
      distinctGroupIds.length === 1
        ? serviceOptions.find((s) => s.groupId === distinctGroupIds[0]) || null
        : null;

    // Create EXACTLY ONE single jurisdiction card showing ALL roles
    const newUnit = {
      key: 1,
      hierarchy: hierarchyObj,
      boundaryType: boundaryTypeObj,
      boundary: boundaryObj,
      tenantId: targetUlb,
      service: matchedService,
      roles: mappedExistingRoles,
      initialRoleCodes: mappedExistingRoles.map((r) => r.code),
      isEdit: true,
      editingBoundary: targetUlb,
    };

    setNewJurisdictions((prev) => {
      if (!isStateUser) {
        return [newUnit];
      }
      const tLower = targetUlb.toLowerCase();
      const filtered = prev.filter((u) => {
        const uCode = (u.editingBoundary || u.boundary?.code || u.tenantId)?.toLowerCase();
        return uCode !== tLower && !tLower.endsWith(`.${uCode}`) && !uCode?.endsWith(`.${tLower}`);
      });
      const nextKey = filtered.length > 0 ? Math.max(...filtered.map((j) => j.key || 0)) + 1 : 1;
      return [...filtered, { ...newUnit, key: nextKey }];
    });

    setTimeout(() => {
      const detailsSection = document.getElementById("jurisdiction-details-section");
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Hierarchy change: for ULB user, keep boundaryType and boundary prefilled for own ULB
  const handleHierarchyChange = (unitKey, value) => {
    const hierarchyCode = value?.code || value?.name || value;
    const boundaryTypes = getBoundaryTypesForHierarchy(hierarchyCode);
    const defaultBoundaryType = !isStateUser
      ? (boundaryTypes || []).find((bt) => (bt?.label || bt?.code || bt)?.toLowerCase() === "city") || boundaryTypes[0]
      : null;
    const defaultCity = !isStateUser ? getAvailableCitiesForUnit(unitKey)?.[0] : null;

    setNewJurisdictions((prev) =>
      prev.map((unit) => {
        if (unit.key === unitKey) {
          return {
            ...unit,
            hierarchy: value,
            boundaryType: defaultBoundaryType,
            boundary: defaultCity,
            tenantId: defaultCity?.code || null,
          };
        }
        return unit;
      })
    );
  };

  // Boundary Type change: for ULB user, keep boundary prefilled with own ULB
  const handleBoundaryTypeChange = (unitKey, value) => {
    const defaultCity = !isStateUser ? getAvailableCitiesForUnit(unitKey)?.[0] : null;
    setNewJurisdictions((prev) =>
      prev.map((unit) => {
        if (unit.key === unitKey) {
          return {
            ...unit,
            boundaryType: value,
            boundary: defaultCity,
            tenantId: defaultCity?.code || null,
          };
        }
        return unit;
      })
    );
  };

  // Boundary ULB change
  const handleBoundaryChange = (unitKey, value) => {
    const boundaryCode = value?.code || value;
    setNewJurisdictions((prev) =>
      prev.map((unit) => {
        if (unit.key === unitKey) {
          return {
            ...unit,
            boundary: value,
            tenantId: boundaryCode,
          };
        }
        return unit;
      })
    );
  };

  // Service change: filters available roles in dropdown without wiping already selected roles
  const handleServiceChange = (unitKey, value) => {
    setNewJurisdictions((prev) =>
      prev.map((unit) => {
        if (unit.key === unitKey) {
          return {
            ...unit,
            service: value,
          };
        }
        return unit;
      })
    );
  };

  // Role select: updates state in real-time
  const handleRoleSelect = (unitKey, newRoles) => {
    setNewJurisdictions((prev) =>
      prev.map((unit) => {
        if (unit.key === unitKey) {
          return {
            ...unit,
            roles: newRoles,
          };
        }
        return unit;
      })
    );
  };

  // Remove single role tag
  const handleRemoveRole = (unitKey, roleCode) => {
    setNewJurisdictions((prev) =>
      prev.map((unit) => {
        if (unit.key === unitKey) {
          return {
            ...unit,
            roles: unit.roles.filter((r) => r.code !== roleCode),
          };
        }
        return unit;
      })
    );
  };

  // Reset all staged changes
  const handleResetAllChanges = () => {
    setStagedRemovals(new Set());
    setNewJurisdictions([]);
  };

  // Submit Global Save with thorough validations
  const handleGlobalSaveSubmit = () => {
    if (netActiveCount < 1) {
      setPanelToast({ key: true, label: VALIDATION_MESSAGES.VAL_02 });
      return;
    }

    // Validate every newly added jurisdiction
    for (let i = 0; i < newJurisdictions.length; i++) {
      const unit = newJurisdictions[i];
      const prefix = `${getI18n(t, "HR_JURISDICTION", "Jurisdiction")} ${i + 1}: `;

      if (!unit.hierarchy) {
        setPanelToast({
          key: true,
          label: `${prefix}${getI18n(t, "ERR_SELECT_HIERARCHY", "Please select a hierarchy.")}`,
        });
        return;
      }

      if (!unit.boundaryType) {
        setPanelToast({
          key: true,
          label: `${prefix}${getI18n(t, "ERR_SELECT_BOUNDARY_TYPE", "Please select a boundary type.")}`,
        });
        return;
      }

      const boundaryCode = typeof unit.boundary === "object" ? unit.boundary?.code : unit.boundary;
      if (!boundaryCode) {
        setPanelToast({
          key: true,
          label: `${prefix}${getI18n(t, "ERR_SELECT_ULB_TO_ADD", "Please select a boundary ULB.")}`,
        });
        return;
      }

      if (!unit.roles || unit.roles.length === 0) {
        setPanelToast({
          key: true,
          label: `${prefix}${getI18n(t, "ERR_SELECT_ATLEAST_ONE_ROLE", "Please assign at least one role.")}`,
        });
        return;
      }
    }

    // Attach computed removedRoleCodes for each edit unit before sending
    const preparedAdditions = newJurisdictions.map((unit) => {
      if (unit.isEdit && Array.isArray(unit.initialRoleCodes)) {
        const currentRoleCodes = new Set((unit.roles || []).map((r) => r.code));
        const removed = unit.initialRoleCodes.filter((code) => !currentRoleCodes.has(code));
        return {
          ...unit,
          removedRoleCodes: removed,
        };
      }
      return unit;
    });

    onInitiateGlobalSave({
      additions: preparedAdditions,
      removals: Array.from(stagedRemovals),
      netActiveCount,
    });
  };

  return (
    <Card
      className="jurisdiction-panel-card employeeCard-override"
      style={{
        marginTop: "1rem",
        marginLeft: 0,
        marginRight: 0,
        border: "1px solid #d6d5d4",
        position: "relative",
        width: "100%",
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
        .jurisdiction-panel-card,
        .employeeCard-override {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
      {/* Saving / Updating Overlay Loader */}
      {isUpdating && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            borderRadius: "8px",
          }}
        >
          <Loader />
          <p
            style={{
              marginTop: "16px",
              fontWeight: 700,
              color: "#0b0c0c",
              fontSize: "1rem",
            }}
          >
            {getI18n(t, "JUR_SAVING_CHANGES", "Saving jurisdiction changes... Please wait.")}
          </p>
        </div>
      )}

      {/* Employee Details Summary Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "1rem",
          marginBottom: "1.25rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div>
          <CardSubHeader style={{ margin: 0, fontSize: "1.35rem", color: "#0b0c0c" }}>
            {employee?.user?.name || "N/A"}{" "}
            <span style={{ fontSize: "1rem", color: "#616161", fontWeight: "normal" }}>
              ({employee?.code})
            </span>
          </CardSubHeader>
        </div>

        {/* Right Side: Status, Mobile, Active Jurisdictions in place of Audit History */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem 1.5rem",
            fontSize: "0.95rem",
            color: "#505a5f",
          }}
        >
          <span>
            <strong>{getI18n(t, "HR_STATUS", "Status")}:</strong>{" "}
            <span
              style={{
                color: employee?.isActive !== false ? "#2e7d32" : "#c62828",
                fontWeight: 700,
              }}
            >
              {employee?.isActive !== false
                ? getI18n(t, "ACTIVE", "Active")
                : getI18n(t, "INACTIVE", "Inactive")}
            </span>
          </span>
          <span>
            <strong>{getI18n(t, "HR_MOB_NO_LABEL", "Mobile No.")}:</strong>{" "}
            <span style={{ color: "#0b0c0c", fontWeight: 600 }}>
              {employee?.user?.mobileNumber || "N/A"}
            </span>
          </span>
          <span>
            <strong>{getI18n(t, "JUR_TOTAL_ACTIVE", "Active Jurisdictions")}:</strong>{" "}
            <span style={{ color: "#c84c0e", fontWeight: 700 }}>
              {activeJurisdictions.length}
            </span>
          </span>
          {hasPendingChanges && (
            <span>
              <strong>{getI18n(t, "JUR_NET_AFTER_EDIT", "Net Active After Save")}:</strong>{" "}
              <strong style={{ color: netActiveCount >= 1 ? "#2e7d32" : "#c62828" }}>
                {netActiveCount}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Net Active Warning Banner */}
      {netActiveCount < 1 && (
        <div
          style={{
            backgroundColor: "#ffebee",
            borderLeft: "4px solid #c62828",
            padding: "10px 14px",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "#c62828",
            fontWeight: 700,
          }}
        >
          ⚠️ {getI18n(t, "ERR_CANNOT_REMOVE_LAST_JURISDICTION", "Cannot save. The employee must have at least one jurisdiction.")}
        </div>
      )}

      {/* SECTION 1: Active Jurisdictions List */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", color: "#0b0c0c" }}>
          {getI18n(t, "JUR_ACTIVE_JURISDICTIONS_LIST", "Active Jurisdictions")} ({activeJurisdictions.length})
        </h3>

        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
          }}
        >
          <table style={{ width: "100%", minWidth: "750px", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>#</th>
                <th style={{ padding: "10px 12px" }}>{getI18n(t, "HR_ULB_LABEL", "ULB")}</th>
                <th style={{ padding: "10px 12px" }}>{getI18n(t, "HR_DISTRICT_LABEL", "District")}</th>
                <th style={{ padding: "10px 12px" }}>{getI18n(t, "HR_HIERARCHY_LABEL", "Hierarchy")}</th>
                <th style={{ padding: "10px 12px" }}>{getI18n(t, "HR_BOUNDARY_TYPE_LABEL", "Boundary Type")}</th>
                <th style={{ padding: "10px 12px" }}>{getI18n(t, "HR_COMMON_TABLE_COL_ROLE", "Roles Assigned")}</th>
                <th style={{ padding: "10px 12px", textAlign: "center", minWidth: "170px" }}>{getI18n(t, "CS_COMMON_ACTIONS", "Action")}</th>
              </tr>
            </thead>
            <tbody>
              {activeJurisdictions.map((jurisdiction, idx) => {
                const targetUlb = jurisdiction.boundary || jurisdiction.tenantId;
                const tenantDetails = resolveTenantDetails(targetUlb, allTenants);
                const canModify = canUserModifyJurisdictionRow(currentUserTenantId, targetUlb);
                const isOnlyJurisdiction = activeJurisdictions.length === 1 && newJurisdictions.length === 0;
                const itemKey = jurisdiction.id || targetUlb;
                const isStagedForRemoval = stagedRemovals.has(itemKey);
                const assignedRoles = getRolesForBoundary(targetUlb);

                return (
                  <tr
                    key={itemKey || idx}
                    style={{
                      borderBottom: "1px solid #e0e0e0",
                      backgroundColor: isStagedForRemoval
                        ? "#ffebee"
                        : idx % 2 === 0
                        ? "#fff"
                        : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "10px 12px" }}>{idx + 1}</td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        textDecoration: isStagedForRemoval ? "line-through" : "none",
                        color: isStagedForRemoval ? "#757575" : "#000",
                      }}
                    >
                      {tenantDetails.ulbName}
                      {isStagedForRemoval && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "0.75rem",
                            backgroundColor: "#ffcdd2",
                            color: "#b71c1c",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          {getI18n(t, "JUR_TAG_MARKED_REMOVAL", "Marked for removal")}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>{tenantDetails.districtName}</td>
                    <td style={{ padding: "10px 12px" }}>{jurisdiction.hierarchy || "ADMIN"}</td>
                    <td style={{ padding: "10px 12px" }}>{jurisdiction.boundaryType || "City"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {assignedRoles.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {assignedRoles.map((r, rI) => (
                            <span
                              key={rI}
                              style={{
                                backgroundColor: "#e3f2fd",
                                color: "#1565c0",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {r.name || r.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "#9e9e9e", fontSize: "0.85rem", fontStyle: "italic" }}>
                          {getI18n(t, "HR_NO_ROLES_ASSIGNED", "None assigned")}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                      {!canModify ? (
                        <span style={{ color: "#757575", fontSize: "0.8rem", fontStyle: "italic" }}>
                          {getI18n(t, "JUR_READ_ONLY", "Read-only")}
                        </span>
                      ) : (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            justifyContent: "center",
                            flexWrap: "nowrap",
                          }}
                        >
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEditJurisdictionRow(jurisdiction)}
                            style={{
                              padding: "4px 12px",
                              borderRadius: "4px",
                              backgroundColor: isRowBeingEdited(jurisdiction) ? "#e3f2fd" : "#fff",
                              color: isRowBeingEdited(jurisdiction) ? "#0d47a1" : "#1976d2",
                              border: `1px solid ${isRowBeingEdited(jurisdiction) ? "#0d47a1" : "#1976d2"}`,
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            {isRowBeingEdited(jurisdiction)
                              ? getI18n(t, "JUR_EDITING", "Editing...")
                              : getI18n(t, "CS_COMMON_EDIT", "Edit")}
                          </button>

                          {/* Remove / Undo Button */}
                          {isOnlyJurisdiction && newJurisdictions.length === 0 ? (
                            <span
                              title={getI18n(
                                t,
                                "ERR_CANNOT_REMOVE_LAST_JURISDICTION",
                                "Cannot remove. The employee must have at least one jurisdiction."
                              )}
                              style={{
                                display: "inline-block",
                                cursor: "not-allowed",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                backgroundColor: "#eeeeee",
                                color: "#9e9e9e",
                                fontSize: "0.85rem",
                                border: "1px solid #dcdcdc",
                              }}
                            >
                              🚫 {getI18n(t, "CS_COMMON_REMOVE", "Remove")}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStageRemoval(itemKey)}
                              style={{
                                padding: "4px 12px",
                                borderRadius: "4px",
                                backgroundColor: isStagedForRemoval ? "#eeeeee" : "#fff",
                                color: isStagedForRemoval ? "#0b0c0c" : "#c62828",
                                border: `1px solid ${isStagedForRemoval ? "#757575" : "#c62828"}`,
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              {isStagedForRemoval
                                ? getI18n(t, "JUR_UNDO_REMOVE", "Undo")
                                : getI18n(t, "CS_COMMON_REMOVE", "Remove")}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Add Jurisdictions (Stacked vertically with clean label/field spacing) */}
      <div
        id="jurisdiction-details-section"
        style={{
          borderTop: "1px solid #e0e0e0",
          paddingTop: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px 0", color: "#0b0c0c" }}>
            {getI18n(t, "HR_JURISDICTION_DETAILS_HEADER", "Jurisdiction Details")}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#505a5f" }}>
            {getI18n(
              t,
              "HR_JURISDICTION_SUBTITLE",
              "Configure hierarchy, boundary, service, and roles for new assignments. Multiple jurisdictions can be added before saving."
            )}
          </p>
        </div>

        {/* List of New Jurisdiction Cards */}
        {newJurisdictions.map((unit, index) => (
          <div
            key={unit.key}
            style={{
              border: "1px solid #E3E3E3",
              padding: "20px 24px",
              marginTop: "16px",
              marginBottom: "16px",
              backgroundColor: "#ffffff",
              borderRadius: "4px",
            }}
          >
            {/* Unit Header & Delete Icon */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #E3E3E3",
                paddingBottom: "10px",
              }}
            >
              <h2
                style={{
                  color: "#0b0c0c",
                  margin: 0,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span>{getI18n(t, "HR_JURISDICTION", "Jurisdiction")} {index + 1}</span>
                {unit.isEdit && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ✏️ {getI18n(t, "JUR_EDITING_TAG", "Editing Existing")} ({unit.boundary?.name || unit.tenantId})
                  </span>
                )}
              </h2>
              <div
                onClick={() => handleRemoveJurisdictionUnit(unit.key)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: "#c62828",
                }}
                title={getI18n(t, "CS_COMMON_DELETE", "Delete")}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z"
                    fill="#c62828"
                  />
                </svg>
              </div>
            </div>

            {/* Hierarchy Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "220px",
                  minWidth: "220px",
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#0b0c0c",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{getI18n(t, "HR_HIERARCHY_LABEL", "Hierarchy")}</span>
                <span style={{ color: "#c62828", fontWeight: "bold" }}>*</span>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <Dropdown
                  className="form-field"
                  selected={unit.hierarchy}
                  disable={false}
                  isMandatory={true}
                  option={hierarchylist}
                  select={(val) => handleHierarchyChange(unit.key, val)}
                  optionKey="name"
                  placeholder={getI18n(t, "HR_HIERARCHY_PLACEHOLDER", "Select Hierarchy")}
                  t={t}
                />
              </div>
            </div>

            {/* Boundary Type Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "220px",
                  minWidth: "220px",
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#0b0c0c",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{getI18n(t, "HR_BOUNDARY_TYPE_LABEL", "Boundary Type")}</span>
                <span style={{ color: "#c62828", fontWeight: "bold" }}>*</span>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <Dropdown
                  className="form-field"
                  isMandatory={true}
                  selected={unit.boundaryType}
                  disable={!unit.hierarchy}
                  option={unit.hierarchy ? getBoundaryTypesForHierarchy(unit.hierarchy?.code) : []}
                  select={(val) => handleBoundaryTypeChange(unit.key, val)}
                  optionKey="i18text"
                  placeholder={getI18n(t, "HR_BOUNDARY_TYPE_PLACEHOLDER", "Select Boundary Type")}
                  t={t}
                />
              </div>
            </div>

            {/* Boundary ULB Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "220px",
                  minWidth: "220px",
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#0b0c0c",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{getI18n(t, "HR_BOUNDARY_LABEL", "Boundary (ULB)")}</span>
                <span style={{ color: "#c62828", fontWeight: "bold" }}>*</span>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <Dropdown
                  className="form-field"
                  isMandatory={true}
                  selected={unit.boundary}
                  disable={!unit.boundaryType}
                  option={unit.boundaryType ? getAvailableCitiesForUnit(unit.key) : []}
                  select={(val) => handleBoundaryChange(unit.key, val)}
                  optionKey="i18text"
                  placeholder={getI18n(t, "HR_BOUNDARY_PLACEHOLDER", "Select ULB Boundary")}
                  t={t}
                />
              </div>
            </div>

            {/* Select Service Field (Optional Filter) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "220px",
                  minWidth: "220px",
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#0b0c0c",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{getI18n(t, "HR_SERVICE_FILTER_LABEL", "Filter by Service (Optional)")}</span>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <Dropdown
                  className="form-field"
                  isMandatory={false}
                  selected={unit.service}
                  option={serviceOptions}
                  select={(val) => handleServiceChange(unit.key, val)}
                  optionKey="groupName"
                  placeholder={getI18n(t, "HR_SERVICE_FILTER_PLACEHOLDER", "All Services (Filter)")}
                  t={t}
                />
              </div>
            </div>

            {/* Roles Field */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "20px",
                width: "100%",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "220px",
                  minWidth: "220px",
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#0b0c0c",
                  paddingTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{getI18n(t, "HR_COMMON_TABLE_COL_ROLE", "Roles")}</span>
                <span style={{ color: "#c62828", fontWeight: "bold" }}>*</span>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <RoleSelectDropdown
                  options={getRolesForService(unit.service)}
                  selected={unit.roles}
                  onSelect={(newRoles) => handleRoleSelect(unit.key, newRoles)}
                  disabled={false}
                  t={t}
                />
                {/* Instant Real-Time Role Tags below the dropdown */}
                {unit.roles && unit.roles.length > 0 && (
                  <div
                    className="tag-container"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginTop: "10px",
                    }}
                  >
                    {unit.roles.map((role) => (
                      <RemoveableTag
                        key={role.code}
                        text={t(role.labelKey) || role.name || role.code}
                        onClick={() => handleRemoveRole(unit.key, role.code)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state when no new units added yet */}
        {newJurisdictions.length === 0 && (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              border: "1px dashed #d6d5d4",
              borderRadius: "4px",
              backgroundColor: "#fafafa",
              marginBottom: "1rem",
            }}
          >
            {ulbHasExistingJurisdiction ? (
              <p style={{ color: "#505a5f", margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
                {getI18n(
                  t,
                  "JUR_EXISTING_ULB_EDIT_PROMPT",
                  "This employee already has an active jurisdiction for this ULB. To add or remove roles, click 'Edit' in the Active Jurisdictions table above."
                )}
              </p>
            ) : (
              <>
                <p style={{ color: "#505a5f", margin: "0 0 12px 0", fontSize: "0.95rem" }}>
                  {getI18n(
                    t,
                    "JUR_NO_NEW_JURISDICTIONS_PROMPT",
                    "No additional jurisdictions staged. Click below to add one or more jurisdictions with roles."
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleAddJurisdictionUnit}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 18px",
                    backgroundColor: "#fff",
                    border: "1px solid #c84c0e",
                    color: "#c84c0e",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <span>+</span>
                  <span>{getI18n(t, "HR_ADD_JURISDICTION", "Add Jurisdiction")}</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Add Another Jurisdiction Button: Only State Users can add jurisdictions across multiple ULBs */}
        {newJurisdictions.length > 0 && isStateUser && (
          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={handleAddJurisdictionUnit}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                backgroundColor: "#fff",
                border: "1px solid #c84c0e",
                color: "#c84c0e",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              <span>+</span>
              <span>{getI18n(t, "HR_ADD_ANOTHER_JURISDICTION", "Add Another Jurisdiction")}</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: Bottom Global Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "2rem",
          paddingTop: "1.25rem",
          borderTop: "2px solid #e0e0e0",
        }}
      >
        <div style={{ fontSize: "0.9rem", color: "#505a5f" }}>
          <span>
            {getI18n(t, "JUR_STAGED_SUMMARY", "Pending Changes:")}{" "}
            <strong style={{ color: newJurisdictions.length > 0 ? "#2e7d32" : "#505a5f" }}>
              +{newJurisdictions.length} added
            </strong>
            {", "}
            <strong style={{ color: stagedRemovals.size > 0 ? "#c62828" : "#505a5f" }}>
              -{stagedRemovals.size} removed
            </strong>
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {hasPendingChanges && (
            <button
              type="button"
              onClick={handleResetAllChanges}
              style={{
                padding: "9px 20px",
                cursor: "pointer",
                borderRadius: "4px",
                border: "1px solid #757575",
                background: "#fff",
                color: "#616161",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {getI18n(t, "CS_COMMON_CANCEL", "Reset Changes")}
            </button>
          )}

          <SubmitBar
            label={getI18n(t, "HR_SAVE", "Save")}
            disabled={isUpdating || !canGlobalSave}
            onSubmit={handleGlobalSaveSubmit}
          />
        </div>
      </div>

      {panelToast && (
        <Toast
          error={panelToast.key}
          label={panelToast.key ? getLocalizedError(panelToast.label, t) : t(panelToast.label)}
          onClose={() => setPanelToast(null)}
        />
      )}
    </Card>
  );
};

export default JurisdictionPanel;
