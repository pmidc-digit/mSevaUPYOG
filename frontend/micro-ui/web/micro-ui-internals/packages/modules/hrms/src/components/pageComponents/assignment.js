import { CardLabel, CheckBox, DatePicker, Dropdown, LabelFieldPair, Loader, TextInput, LinkLabel, Toast } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import cleanup from "../Utils/cleanup";
import { convertEpochToDate } from "../Utils/index";

const Assignments = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
  const [currentassignemtDate, setCurrentAssiginmentDate] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [assignments, setassignments] = useState(
    formData?.Assignments || [
      {
        key: 1,
        fromDate: undefined,
        toDate: undefined,
        isCurrentAssignment: false,
        department: null,
        designation: null,
        reportingTo: "",
        isHOD: false,
      },
    ]
  );

  // Check ALL overlaps for a specific assignment
  const checkOverlapsForAssignment = (targetAssignment, allAssignments) => {
    if (!targetAssignment.fromDate) return { hasOverlap: false, conflicts: [] };

    const targetFrom = new Date(targetAssignment.fromDate).getTime();
    const targetTo = targetAssignment.toDate ? new Date(targetAssignment.toDate).getTime() : new Date().getTime();
    
    const conflicts = [];

    for (let i = 0; i < allAssignments.length; i++) {
      const assignment = allAssignments[i];
      
      // Skip comparing with itself
      if (assignment.key === targetAssignment.key) continue;
      
      // Skip if assignment doesn't have dates
      if (!assignment.fromDate) continue;

      const from = new Date(assignment.fromDate).getTime();
      const to = assignment.toDate ? new Date(assignment.toDate).getTime() : new Date().getTime();

      // Check for overlap
      const hasOverlap = 
        (targetFrom >= from && targetFrom < to) ||
        (targetTo > from && targetTo <= to) ||
        (targetFrom <= from && targetTo >= to);

      if (hasOverlap) {
        conflicts.push(i + 1); // Store assignment number (1-indexed)
      }
    }

    return {
      hasOverlap: conflicts.length > 0,
      conflicts: conflicts,
      message: conflicts.length > 0 
        ? `Assignment overlaps with: ${conflicts.map(num => `#${num}`).join(', ')}`
        : null
    };
  };
  const reviseIndexKeys = () => {
    setassignments((prev) => prev.map((unit, index) => ({ ...unit, key: index })));
  };

  const handleAddUnit = () => {
    setassignments((prev) => [
      ...prev,
      {
        key: prev.length + 1,
        fromDate: undefined,
        toDate: undefined,
        isCurrentAssignment: false,
        department: null,
        designation: null,
        reportingTo: "",
        isHOD: false
      },
    ]);
  };

  const handleRemoveUnit = (unit) => {
    setassignments((prev) => prev.filter((el) => el.key !== unit.key));
    if (FormData.errors?.Assignments?.type == unit.key) {
      clearErrors("Jurisdictions");
    }
    reviseIndexKeys();
  };

  useEffect(() => {
    var promises = assignments?.map((assignment) => {
      return assignment
        ? cleanup({
          id: assignment?.id,
          position: assignment?.position,
          govtOrderNumber: assignment?.govtOrderNumber,
          tenantid: assignment?.tenantid,
          auditDetails: assignment?.auditDetails,
          fromDate: assignment?.fromDate ? new Date(assignment?.fromDate).getTime() : undefined,
          toDate: assignment?.toDate ? new Date(assignment?.toDate).getTime() : undefined,
          isCurrentAssignment: assignment?.isCurrentAssignment,
          department: assignment?.department?.code,
          designation: assignment?.designation?.code,
          reportingTo: assignment?.reportingTo,
          isHOD: assignment?.isHOD
        })
        : [];
    });

    Promise.all(promises).then(function (results) {
      onSelect(
        config.key,
        results.filter((value) => Object.keys(value).length !== 0)
      );
    });

    assignments.map((ele) => {
      if (ele.isCurrentAssignment) {
        setCurrentAssiginmentDate(ele.fromDate);
      }
    });
  }, [assignments]);

  let department = [];
  let designation = [];
  const [focusIndex, setFocusIndex] = useState(-1);

  function getdepartmentdata() {
    return data?.MdmsRes?.["common-masters"]?.Department.map((ele) => {
      ele["i18key"] = t("COMMON_MASTERS_DEPARTMENT_" + ele.code);
      return ele;
    });
  }
  function getdesignationdata() {
    return data?.MdmsRes?.["common-masters"]?.Designation.map((ele) => {
      ele["i18key"] = t("COMMON_MASTERS_DESIGNATION_" + ele.code);
      return ele;
    });
  }
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      {showToast && (
        <Toast
          warning={true}
          label={t(showToast.label)}
          onClose={() => setShowToast(null)}
          isDleteBtn={true}
        />
      )}
      
      {assignments?.map((assignment, index) => (
        <Assignment
          t={t}
          key={index}
          keys={index.key}
          formData={formData}
          assignment={assignment}
          setassignments={setassignments}
          index={index}
          focusIndex={focusIndex}
          setFocusIndex={setFocusIndex}
          getdepartmentdata={getdepartmentdata}
          department={department}
          designation={designation}
          getdesignationdata={getdesignationdata}
          assignments={assignments}
          handleRemoveUnit={handleRemoveUnit}
          setCurrentAssiginmentDate={setCurrentAssiginmentDate}
          currentassignemtDate={currentassignemtDate}
          checkOverlapsForAssignment={checkOverlapsForAssignment}
          setShowToast={setShowToast}
        />
      ))}
      <LinkLabel
        style={{
          display: "inline-block",
          padding: "8px 16px",
          background: "linear-gradient(135deg, #2563eb, #1e40af)",
          color: "#FFFFFF",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          textDecoration: "none",
          marginTop: "16px",
          marginBottom: "8px",
          border: "none",
          transition: "background-color 0.2s ease",
        }}
        onClick={handleAddUnit}
      >
        {t("HR_ADD_ASSIGNMENT")}
      </LinkLabel>
    </div>
  );
};
function Assignment({
  t,
  assignment,
  assignments,
  setassignments,
  index,
  focusIndex,
  setFocusIndex,
  getdepartmentdata,
  department,
  formData,
  handleRemoveUnit,
  designation,
  getdesignationdata,
  setCurrentAssiginmentDate,
  currentassignemtDate,
  checkOverlapsForAssignment,
  setShowToast,
}) {
  // Validate and show all overlaps
  const validateOverlap = (updatedAssignment) => {
    setTimeout(() => {
      const overlapResult = checkOverlapsForAssignment(updatedAssignment, assignments);
      
      if (overlapResult.hasOverlap) {
        setShowToast({
          label: `HR_ASSIGNMENT_OVERLAP_WARNING: Assignment ${index + 1} ${overlapResult.message}`
        });
      }
    }, 100);
  };
  const selectDepartment = (value) => {
    setassignments((pre) => pre.map((item) => (item.key === assignment.key ? { ...item, department: value } : item)));
  };
  const selectDesignation = (value) => {
    setassignments((pre) => pre.map((item) => (item.key === assignment.key ? { ...item, designation: value } : item)));
  };

  const onAssignmentChange = (value) => {
    setassignments((pre) =>
      pre.map((item) => (item.key === assignment.key ? { ...item, isCurrentAssignment: value } : { ...item, isCurrentAssignment: false }))
    );
    if (value) {
      setassignments((pre) =>
        pre.map((item) =>
          item.key === assignment.key
            ? {
              ...item,
              toDate: null,
            }
            : item
        )
      );
      assignments.map((ele) => {
        if (ele.key == assignment.key) {
          setCurrentAssiginmentDate(ele.fromDate);
        }
      });
    } else {
      setCurrentAssiginmentDate(null);
    }
  };

  const handleReportingToChange=(value)=>{
    setassignments((pre) => pre.map((item) => (item.key === assignment.key ? { ...item, reportingTo: value } : item)));
  }

  const onIsHODchange = (value) => {
    setassignments((pre) => 
      pre.map((item) => 
        item.key === assignment.key 
          ? { 
              ...item, 
              isHOD: value,
              reportingTo: value ? "" : item.reportingTo
            } 
          : item
      )
    );
  };

  const ValidateDatePickers = (value) => {
    assignments;
  };
  return (
    <div key={index + 1} style={{ marginBottom: "16px" }}>
      <div style={{ border: "1px solid #E3E3E3", padding: "16px", marginTop: "8px" }}>
        <LabelFieldPair>
          <div className="label-field-pair" style={{ width: "100%" }}>
            <h2 className="card-label card-label-smaller" style={{ color: "#505A5F" }}>
              {t("HR_ASSIGNMENT")} {index + 1}
            </h2>
          </div>
          {assignments.length > 1 && !assignment?.id && !assignment?.isCurrentAssignment ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "16px",
                paddingRight: "8px",
              }}
            >
              <div
                onClick={() => handleRemoveUnit(assignment)}
                onMouseEnter={(e) => {
                  const svg = e.currentTarget.querySelector("svg");
                  const path = svg.querySelector("path");
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.opacity = "0.8";
                  path.style.fill = "#2341e9b2";
                }}
                onMouseLeave={(e) => {
                  const svg = e.currentTarget.querySelector("svg");
                  const path = svg.querySelector("path");
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "1";
                  path.style.fill = "#6b7280";
                }}
                style={{
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  backgroundColor: "transparent",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z" fill="#6b7280" />
                </svg>
              </div>
            </div>
          ) : null}
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className={assignment?.id ? "card-label-smaller disabled" : "card-label-smaller hrms-text-transform-none"}> {`${t("HR_ASMT_FROM_DATE_LABEL")}`}<span className="hrms-emp-mapping__required-asterisk"> * </span> </CardLabel>
          <div className="field">
            <DatePicker
              type="date"
              name="fromDate"
              max={currentassignemtDate ? currentassignemtDate : convertEpochToDate(new Date())}
              min={formData?.SelectDateofEmployment?.dateOfAppointment}
              disabled={assignment?.id ? true : false}
              onChange={(e) => {
                const updatedAssignment = { ...assignment, fromDate: e };
                setassignments((pre) => pre.map((item) => (item.key === assignment.key ? updatedAssignment : item)));
                setFocusIndex(index);
                validateOverlap(updatedAssignment);
              }}
              date={assignment?.fromDate}
              autoFocus={focusIndex === index}
            />
          </div>
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel className={assignment?.isCurrentAssignment ? "card-label-smaller disabled" : "card-label-smaller hrms-text-transform-none"}>
            {t("HR_ASMT_TO_DATE_LABEL")}
            {assignment?.isCurrentAssignment ? "" :  <span className="hrms-emp-mapping__required-asterisk"> * </span> }{" "}
          </CardLabel>
          <div className="field">
            <DatePicker
              type="date"
              name="toDate"
              min={assignment?.fromDate}
              max={currentassignemtDate ? currentassignemtDate : convertEpochToDate(new Date())}
              disabled={assignment?.isCurrentAssignment}
              onChange={(e) => {
                const updatedAssignment = { ...assignment, toDate: e };
                setassignments((pre) => pre.map((item) => (item.key === assignment.key ? updatedAssignment : item)));
                setFocusIndex(index);
                validateOverlap(updatedAssignment);
              }}
              date={assignment?.toDate}
              autoFocus={focusIndex === index}
            />
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller hrms-text-transform-none" style={{ color: "white" }}>
            .
          </CardLabel>
          <div className="field">
            <CheckBox
              onChange={(e) => onAssignmentChange(e.target.checked)}
              checked={assignment?.isCurrentAssignment}
              label={t("HR_CURRENTLY_ASSIGNED_HERE_SWITCH_LABEL")}
            />
          </div>
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel className={assignment?.id ? "card-label-smaller disabled" : "card-label-smaller hrms-text-transform-none"}> {`${t("HR_DEPT_LABEL")} `}<span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
          <Dropdown
            className="form-field"
            selected={assignment?.department}
            disable={assignment?.id ? true : false}
            optionKey={"i18key"}
            option={getdepartmentdata(department) || []}
            select={selectDepartment}
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className={assignment?.id ? "card-label-smaller disabled" : "card-label-smaller hrms-text-transform-none"}>{`${t("HR_DESG_LABEL")} `}<span className="hrms-emp-mapping__required-asterisk"> * </span> </CardLabel>
          <Dropdown
            className="form-field"
            selected={assignment?.designation}
            disable={assignment?.id ? true : false}
            option={getdesignationdata(designation) || []}
            select={selectDesignation}
            optionKey={"i18key"}
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className={assignment?.isHOD ? "card-label-smaller disabled" : "card-label-smaller hrms-text-transform-none"}>          
            {t("HR_REP_TO_LABEL")}
            {assignment?.isHOD ? "" :  <span className="hrms-emp-mapping__required-asterisk"> * </span> }
          </CardLabel>
          <div className="field">
            <TextInput
              value={assignment?.reportingTo}
              onChange={(e) => handleReportingToChange(e.target.value)}
              disable={assignment?.isHOD}
            />
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller hrms-text-transform-none" style={{ color: "white" }}>
            .
          </CardLabel>
          <div className="field">
            <CheckBox
              onChange={(e) => onIsHODchange(e.target.checked)}
              checked={assignment?.isHOD}
              label={t("HR_HOD_SWITCH_LABEL")}
            />
          </div>
        </LabelFieldPair>
      </div>
    </div>
  );
}

export default Assignments;
