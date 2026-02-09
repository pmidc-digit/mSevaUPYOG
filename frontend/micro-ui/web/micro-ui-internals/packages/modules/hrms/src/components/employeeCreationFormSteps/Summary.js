import React from 'react';
import { useSelector } from 'react-redux';
import { CardLabel, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const Summary = ({ config, formData: propsFormData, onSelect }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  
  // Fetch MDMS data for Department and Designation lookup
  const { data: mdmsData = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
  
  // Get formData from Redux to prevent data loss
  const reduxFormData = useSelector((state) => state.hrms.employeeForm.formData);
  const formData = reduxFormData || propsFormData || {};

  // Extract data from steps
  const employeeData = formData?.employeeDetails || {};
  const adminData = formData?.administrativeDetails || {};

  const renderLabel = (label, value) => (
    <div className="bpa-summary-label-field-pair">
      <CardLabel className="bpa-summary-bold-label" style={{width: "auto"}}>{label}</CardLabel>
      <div className="hrms-summary-value">{value || "N/A"}</div>
    </div>
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return "N/A";
    }
  };

  // Helper function to get value from either string or object
  const getValue = (data) => {
    if (!data) return "N/A";
    if (typeof data === 'string') return data;
    return data?.name || data?.code || "N/A";
  };

  // Helper function to format boundary string (remove state code prefix and capitalize)
  const formatBoundaryString = (boundary) => {
    if (!boundary || typeof boundary !== 'string') return boundary;
    // Remove state code prefix (e.g., "pb.abohar" -> "abohar")
    const parts = boundary.split('.');
    const cityName = parts.length > 1 ? parts[1] : parts[0];
    // Capitalize first letter
    return cityName.charAt(0).toUpperCase() + cityName.slice(1);
  };

  // Helper function to get boundary display
  const getBoundaryDisplay = (boundary) => {
    if (!boundary) return null;
    if (typeof boundary === 'string') {
      return formatBoundaryString(boundary);
    }
    if (Array.isArray(boundary) && boundary.length > 0) {
      return boundary.map(b => {
        if (typeof b === 'string') return formatBoundaryString(b);
        return b.name || b.code || '';
      }).filter(Boolean).join(", ");
    }
    return null;
  };

  // Helper function to get department name from code
  const getDepartmentName = (departmentCode) => {
    if (!departmentCode || !mdmsData?.MdmsRes) return departmentCode || "N/A";
    const departments = mdmsData?.MdmsRes?.["common-masters"]?.Department || [];
    const dept = departments.find(d => d.code === departmentCode);
    return dept?.name || departmentCode;
  };

  // Helper function to get designation name from code
  const getDesignationName = (designationCode) => {
    if (!designationCode || !mdmsData?.MdmsRes) return designationCode || "N/A";
    const designations = mdmsData?.MdmsRes?.["common-masters"]?.Designation || [];
    const desig = designations.find(d => d.code === designationCode);
    return desig?.name || designationCode;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bpa-summary-page">
      <h2 className="bpa-summary-heading">{t("HR_EMPLOYEE_SUMMARY") || "Employee Summary"}</h2>

      {/* Personal Details Section */}
      <h2 className="bpa-summary-heading">{t("HR_PERSONAL_DETAILS") || "Personal Details"}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("HR_NAME_LABEL") || "Name", employeeData?.SelectEmployeeName?.employeeName)}
        {renderLabel(t("HR_MOB_NO_LABEL") || "Mobile Number", employeeData?.SelectEmployeePhoneNumber?.mobileNumber)}
        {renderLabel(t("HR_EMAIL_LABEL") || "Email", employeeData?.SelectEmployeeEmailId?.emailId)}
        {renderLabel(t("HR_GUARDIAN_NAME_LABEL") || "Guardian's Name", employeeData?.SelectEmployeeGuardianName?.employeeGuardianName)}
        {renderLabel(t("HR_GUARDIAN_RELATIONSHIP_LABEL") || "Guardian Relationship", 
          employeeData?.SelectEmployeeGuardianRelationship?.name || employeeData?.SelectEmployeeGuardianRelationship?.code
        )}
        {renderLabel(t("CORE_COMMON_GENDER") || "Gender", 
          employeeData?.SelectEmployeeGender?.gender?.code || employeeData?.SelectEmployeeGender?.gender?.name
        )}
        {renderLabel(t("CORE_COMMON_DATE_OF_BIRTH") || "Date of Birth", 
          formatDate(employeeData?.SelectDateofBirthEmployment?.dob)
        )}
        {renderLabel(t("HR_ADDRESS_LABEL") || "Correspondence Address", 
          employeeData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress
        )}
      </div>

      {/* Professional Details Section */}
      <h2 className="bpa-summary-heading">{t("HR_PROFESSIONAL_DETAILS") || "Professional Details"}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("HR_EMP_ID_LABEL") || "Employee ID", employeeData?.SelectEmployeeId?.code)}
        {renderLabel(t("HR_DATE_OF_APPOINTMENT_LABEL") || "Date of Appointment", 
          formatDate(employeeData?.SelectDateofEmployment?.dateOfAppointment)
        )}
        {renderLabel(t("HR_EMPLOYEE_TYPE_LABEL") || "Employee Type", 
          employeeData?.SelectEmployeeType?.name || employeeData?.SelectEmployeeType?.code
        )}
        {renderLabel(t("HR_EMPLOYMENT_STATUS_LABEL") || "Employment Status", 
          employeeData?.SelectEmploymentStatus?.name || employeeData?.SelectEmploymentStatus?.code
        )}
      </div>

      {/* Jurisdictions Section */}
      <h2 className="bpa-summary-heading">{t("HR_JURISDICTION_LABEL") || "Jurisdictions"}</h2>
      {adminData?.Jurisdictions?.length > 0 ? (
        adminData.Jurisdictions.map((juris, index) => {
          const boundaryDisplay = getBoundaryDisplay(juris.boundary);
          return (
            <div key={index} className="bpa-summary-section">
              <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>#{index + 1}</div>
              {renderLabel(t("HR_HIERARCHY") || "Hierarchy", juris.hierarchy)}
              {renderLabel(t("HR_BOUNDARY_TYPE") || "Boundary Type", getValue(juris.boundaryType))}
              {boundaryDisplay && renderLabel(t("HR_BOUNDARY") || "Boundary", boundaryDisplay)}
              {renderLabel(t("HR_TENANT_ID") || "Tenant ID", juris.tenantId)}
              {Array.isArray(juris.roles) && juris.roles.length > 0 && 
                renderLabel(t("HR_ROLES") || "Roles", juris.roles.map(r => r.name || r.code).join(", "))
              }
            </div>
          );
        })
      ) : (
        <div className="bpa-summary-section">
          <div>{t("HR_NO_JURISDICTIONS") || "No jurisdictions added"}</div>
        </div>
      )}

      {/* Assignments Section */}
      <h2 className="bpa-summary-heading">{t("HR_ASSIGNMENT_LABEL") || "Assignments"}</h2>
      {adminData?.Assignments?.length > 0 ? (
        adminData.Assignments.map((assignment, index) => (
          <div key={index} className="bpa-summary-section">
            <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              #{index + 1}
              {/* {assignment.isCurrentAssignment && (
                <span style={{ 
                  marginLeft: "10px", 
                  padding: "2px 8px", 
                  backgroundColor: "#DBEAFE", 
                  color: "#1E40AF", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  {t("HR_CURRENT_ASSIGNMENT") || "Current Assignment"}
                </span>
              )} */}
            </div>
            {renderLabel(t("HR_DEPARTMENT") || "Department", getDepartmentName(assignment.department))}
            {renderLabel(t("HR_DESIGNATION") || "Designation", getDesignationName(assignment.designation))}
            {renderLabel(t("HR_FROM_DATE") || "From Date", formatDate(assignment.fromDate))}
            {renderLabel(t("HR_TO_DATE") || "To Date", assignment.toDate ? formatDate(assignment.toDate) : t("HR_ONGOING") || "Ongoing")}
          </div>
        ))
      ) : (
        <div className="bpa-summary-section">
          <div>{t("HR_NO_ASSIGNMENTS") || "No assignments added"}</div>
        </div>
      )}
    </div>
  );
};

export default Summary;