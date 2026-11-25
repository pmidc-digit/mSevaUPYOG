import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardLabel,
  Dropdown,
  TextInput,
  SubmitBar,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { isStateLevelUser } from "../utils/jurisdictionUtils";

/**
 * Filter Component for Employee Search per TRD JUR-01, JUR-02, JUR-03.
 *
 * JUR-02: For ULB user, pre-fill ULB filter with own ULB and lock it.
 * JUR-03: For Punjab user, show all ULBs; ULB selection is mandatory.
 */
const JurisdictionFilter = ({ onSearch, onReset, isSearching = false, initialValues = null }) => {
  const { t } = useTranslation();
  const currentUserTenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const isStateUser = isStateLevelUser(currentUserTenantId);

  // Fetch ULB tenant list
  const { data: ulbList = [] } = Digit.Hooks.useTenants();

  // Fetch MDMS data for Department and Designation
  const { data: commonMasters } = Digit.Hooks.useCommonMDMS(
    stateId,
    "common-masters",
    ["Department", "Designation"]
  );

  const departments = useMemo(() => {
    return (
      commonMasters?.["common-masters"]?.Department?.map((d) => ({
        code: d.code,
        name: t(`COMMON_MASTERS_DEPARTMENT_${d.code}`),
      })) || []
    );
  }, [commonMasters, t]);

  const designations = useMemo(() => {
    return (
      commonMasters?.["common-masters"]?.Designation?.map((d) => ({
        code: d.code,
        name: t(`COMMON_MASTERS_DESIGNATION_${d.code}`),
      })) || []
    );
  }, [commonMasters, t]);

  // Form states
  const [selectedULB, setSelectedULB] = useState(null);
  const [empCode, setEmpCode] = useState("");
  const [empName, setEmpName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [errors, setErrors] = useState({});

  // Default to own ULB on initial mount if not restored from cache
  const hasInitializedRef = React.useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && !initialValues?.selectedULB && currentUserTenantId && ulbList.length > 0) {
      const userUlb = ulbList.find(
        (u) => u.code?.toLowerCase() === currentUserTenantId?.toLowerCase()
      );
      if (userUlb) {
        setSelectedULB(userUlb);
        hasInitializedRef.current = true;
      }
    }
  }, [ulbList, currentUserTenantId, initialValues]);

  // Restore initial search filters if returning from details page
  useEffect(() => {
    if (initialValues) {
      if (initialValues.selectedULB && ulbList.length > 0) {
        const found = ulbList.find(
          (u) => u.code?.toLowerCase() === initialValues.selectedULB?.toLowerCase()
        );
        if (found) {
          setSelectedULB(found);
          hasInitializedRef.current = true;
        }
      }
      if (initialValues.codes) setEmpCode(initialValues.codes);
      if (initialValues.names) setEmpName(initialValues.names);
      if (initialValues.phone) setMobileNumber(initialValues.phone);
      if (initialValues.departments && departments.length > 0) {
        const dept = departments.find((d) => d.code === initialValues.departments);
        if (dept) setSelectedDepartment(dept);
      }
      if (initialValues.designations && designations.length > 0) {
        const desg = designations.find((d) => d.code === initialValues.designations);
        if (desg) setSelectedDesignation(desg);
      }
    }
  }, [initialValues, ulbList, departments, designations]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    // JUR-03: ULB is mandatory before search
    if (!selectedULB) {
      setErrors({ ulb: t("ERR_ULB_MANDATORY_BEFORE_SEARCH") });
      return;
    }

    setErrors({});
    onSearch({
      selectedULB: selectedULB.code,
      codes: empCode,
      names: empName,
      phone: mobileNumber,
      departments: selectedDepartment?.code,
      designations: selectedDesignation?.code,
    });
  };

  const handleReset = () => {
    setSelectedULB(null);
    setEmpCode("");
    setEmpName("");
    setMobileNumber("");
    setSelectedDepartment(null);
    setSelectedDesignation(null);
    setErrors({});
    onReset();
  };

  return (
    <Card
      className="jurisdiction-filter-card employeeCard-override"
      style={{
        marginBottom: "1.5rem",
        marginLeft: 0,
        marginRight: 0,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <form onSubmit={handleSearchSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {/* ULB Filter */}
          <div>
            <CardLabel>
              {t("HR_ULB_LABEL") || "ULB"} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Dropdown
              t={t}
              option={ulbList}
              selected={selectedULB}
              select={(val) => {
                setSelectedULB(val);
                if (errors.ulb) setErrors({});
              }}
              optionKey="name"
              disable={false}
              placeholder={t("ES_SELECT_ULB") || "Select ULB"}
            />
            {errors.ulb && <CardLabelError>{errors.ulb}</CardLabelError>}
          </div>

          {/* Employee Code */}
          <div>
            <CardLabel>{t("HR_EMPLOYEE_ID_LABEL") || "Employee Code"}</CardLabel>
            <TextInput
              t={t}
              type="text"
              name="empCode"
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
              placeholder={t("HR_ENTER_EMPLOYEE_ID") || "Enter Code"}
            />
          </div>

          {/* Employee Name */}
          <div>
            <CardLabel>{t("HR_NAME_LABEL") || "Employee Name"}</CardLabel>
            <TextInput
              t={t}
              type="text"
              name="empName"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              placeholder={t("HR_ENTER_NAME") || "Enter Name"}
            />
          </div>

          {/* Mobile Number */}
          <div>
            <CardLabel>{t("HR_MOB_NO_LABEL") || "Mobile Number"}</CardLabel>
            <TextInput
              t={t}
              type="text"
              name="mobileNumber"
              value={mobileNumber}
              maxLength={10}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              placeholder={t("HR_ENTER_MOBILE_NUMBER") || "Enter 10-digit Mobile"}
            />
          </div>

          {/* Department */}
          <div>
            <CardLabel>{t("HR_DEPT_LABEL") || "Department"}</CardLabel>
            <Dropdown
              t={t}
              option={departments}
              selected={selectedDepartment}
              select={setSelectedDepartment}
              optionKey="name"
              placeholder={t("HR_SELECT_DEPARTMENT") || "Select Department"}
            />
          </div>

          {/* Designation */}
          <div>
            <CardLabel>{t("HR_DESG_LABEL") || "Designation"}</CardLabel>
            <Dropdown
              t={t}
              option={designations}
              selected={selectedDesignation}
              select={setSelectedDesignation}
              optionKey="name"
              placeholder={t("HR_SELECT_DESIGNATION") || "Select Designation"}
            />
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1.25rem",
          }}
        >
          <button
            type="button"
            className="secondary-action"
            style={{
              padding: "8px 24px",
              cursor: "pointer",
              borderRadius: "4px",
              border: "1px solid #c84c0e",
              background: "#fff",
              color: "#c84c0e",
              fontWeight: 600,
            }}
            onClick={handleReset}
          >
            {t("ES_COMMON_CLEAR") || "Clear"}
          </button>
          <SubmitBar
            label={isSearching ? t("ES_SEARCHING") || "Searching..." : t("ES_COMMON_SEARCH") || "Search"}
            disabled={isSearching || !selectedULB}
            submit={true}
          />
        </div>
      </form>
    </Card>
  );
};

export default JurisdictionFilter;

