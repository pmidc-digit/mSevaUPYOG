import { ActionBar, Card, CardSubHeader, DocumentSVG, Header, Loader, Menu, Row, StatusTable, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import ActionModal from "../components/Modal";
import { convertEpochFormateToDate, pdfDownloadLink } from "../components/Utils";
import { getLatestDeactivation } from "../utils/employeeUtils";

const Details = () => {
  const activeworkflowActions = ["DEACTIVATE_EMPLOYEE_HEAD", "COMMON_EDIT_EMPLOYEE_HEADER"];
  const deactiveworkflowActions = ["ACTIVATE_EMPLOYEE_HEAD"];
  const { t } = useTranslation();
  const history = useHistory();
  const { id: employeeId, tenantId } = useParams();
  const isupdate = Digit.SessionStorage.get("isupdate");
  const { isLoading, isError, data } = Digit.Hooks.hrms.useHRMSSearch({ codes: employeeId }, tenantId, null, isupdate);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);
  const [mutationHappened, setMutationHappened] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [, , clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  function onActionSelect(action) {
    setSelectedAction(action);
    setDisplayMenu(false);
  }

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  useEffect(() => {
    switch (selectedAction) {
      case "DEACTIVATE_EMPLOYEE_HEAD":
      case "ACTIVATE_EMPLOYEE_HEAD":
        return setShowModal(true);
      case "COMMON_EDIT_EMPLOYEE_HEADER":
        return history.push(`/digit-ui/employee/hrms/edit/${tenantId}/${employeeId}`);
      default:
        break;
    }
  }, [selectedAction]);

  const handleDownload = async (document) => {
    const res = await Digit.UploadServices.Filefetch([document?.documentId], Digit.ULBService.getStateId());
    const documentLink = pdfDownloadLink(res.data, document?.documentId);
    if (documentLink) {
      window.open(documentLink, "_blank");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const employee = data?.Employees?.[0];
  const latestDeactivation = getLatestDeactivation(employee?.deactivationDetails);
  const jurisdictions = employee?.jurisdictions || [];
  const assignments = employee?.assignments || [];

  return (
    <React.Fragment>
      <div className="hrms-header-wrapper hrms-header-wrapper--error">
        <Header>{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</Header>
      </div>
      {isError || !employee ? (
        <div className="hrms-emp-mapping__no-data">
          <p>{t("HR_NO_EMPLOYEE_FOUND")}</p>
        </div>
      ) : (
        <div>
          <Card>
            <StatusTable>
              <Row
                label={<CardSubHeader className="card-section-header">{t("HR_EMP_STATUS_LABEL")} </CardSubHeader>}
                text={employee.isActive ? <div className="sla-cell-success"> {t("ACTIVE")} </div> : <div className="sla-cell-error text-body-l">{t("INACTIVE")}</div>}
                textStyle={{ fontWeight: "bold", maxWidth: "6.5rem" }}
              />
            </StatusTable>
            <CardSubHeader className="card-section-header">{t("HR_PERSONAL_DETAILS_FORM_HEADER")} </CardSubHeader>
            <StatusTable>
              <Row label={t("HR_NAME_LABEL")} text={employee.user?.name || "NA"} textStyle={{ whiteSpace: "pre" }} />
              <Row label={t("HR_MOB_NO_LABEL")} text={employee.user?.mobileNumber || "NA"} textStyle={{ whiteSpace: "pre" }} />
              <Row label={t("HR_GENDER_LABEL")} text={t(employee.user?.gender) || "NA"} />
              <Row label={t("HR_EMAIL_LABEL")} text={employee.user?.emailId || "NA"} />
              <Row label={t("HR_CORRESPONDENCE_ADDRESS_LABEL")} text={employee.user?.correspondenceAddress || "NA"} />
            </StatusTable>
            <CardSubHeader className="card-section-header">{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("HR_EMPLOYMENT_TYPE_LABEL")}
                text={t(employee.employeeType ? `EGOV_HRMS_EMPLOYEETYPE_${employee.employeeType}` : "NA")}
                textStyle={{ whiteSpace: "pre" }}
              />
              <Row
                label={t("HR_APPOINTMENT_DATE_LABEL")}
                text={convertEpochFormateToDate(employee.dateOfAppointment) || "NA"}
                textStyle={{ whiteSpace: "pre" }}
              />
              <Row label={t("HR_EMPLOYEE_ID_LABEL")} text={employee.code} />
            </StatusTable>
            {employee.isActive === false ? (
              <StatusTable>
                <Row label={t("HR_EFFECTIVE_DATE")} text={convertEpochFormateToDate(latestDeactivation?.effectiveFrom) || "NA"} />
                <Row
                  label={t("HR_DEACTIVATION_REASON")}
                  text={t("EGOV_HRMS_DEACTIVATIONREASON_" + latestDeactivation?.reasonForDeactivation) || "NA"}
                />
                <Row label={t("HR_REMARKS")} text={latestDeactivation?.remarks || "NA"} />
                <Row label={t("HR_ORDER_NO")} text={latestDeactivation?.orderNo || "NA"} />
              </StatusTable>
            ) : null}

            {employee.documents ? (
              <StatusTable className="hrms-mb-xl hrms-spacing--documents">
                <Row label={t("TL_APPROVAL_UPLOAD_HEAD")} text={""} />
                <div className="hrms-flex hrms-flex-wrap">
                  {employee.documents.map((document, index) => {
                    return (
                      <a onClick={() => handleDownload(document)} role="button" tabIndex={0} className="hrms-document-link" key={index}>
                        <DocumentSVG width={85} height={100} className="hrms-document-svg" />
                        <p className="hrms-document-name">{document.documentName}</p>
                      </a>
                    );
                  })}
                </div>
              </StatusTable>
            ) : null}

            {jurisdictions.length > 0 ? <CardSubHeader className="card-section-header">{t("HR_JURIS_DET_HEADER")}</CardSubHeader> : null}
            {jurisdictions.map((element, index) => (
              <StatusTable key={index} className="hrms-jurisdiction-status-table">
                <div className="hrms-section-title"> </div>
                <Row label={t("HR_HIERARCHY_LABEL")} text={t(element?.hierarchy ? `EGOV_LOCATION_TENANTBOUNDARY_${element?.hierarchy}` : "NA")} textStyle={{ whiteSpace: "pre" }} />
                <Row label={t("HR_BOUNDARY_TYPE_LABEL")} text={t(Digit.Utils.locale.convertToLocale(element?.boundaryType, "EGOV_LOCATION_BOUNDARYTYPE"))} textStyle={{ whiteSpace: "pre" }} />
                <Row label={t("HR_BOUNDARY_LABEL")} text={t(element?.boundary)} />
                <Row
                  label={t("HR_ROLE_LABEL")}
                  text={(employee.user?.roles || [])
                    .filter((ele) => ele.tenantId == element?.boundary)
                    .map((ele) => t(`ACCESSCONTROL_ROLES_ROLES_` + ele?.code))}
                />
              </StatusTable>
            ))}

            {assignments.length > 0 ? <CardSubHeader className="card-section-header">{t("HR_ASSIGN_DET_HEADER")}</CardSubHeader> : null}
            {assignments.map((element, index) => (
              <StatusTable key={index} className="hrms-jurisdiction-status-table">
                <div className="hrms-section-title"></div>
                <Row label={t("HR_ASMT_FROM_DATE_LABEL")} text={convertEpochFormateToDate(element?.fromDate)} textStyle={{ whiteSpace: "pre" }} />
                <Row
                  label={t("HR_ASMT_TO_DATE_LABEL")}
                  text={element?.isCurrentAssignment ? "Currently Working Here" : convertEpochFormateToDate(element?.toDate)}
                  textStyle={{ whiteSpace: "pre" }}
                />
                <Row label={t("HR_DEPT_LABEL")} text={t("COMMON_MASTERS_DEPARTMENT_" + element?.department)} />
                <Row label={t("HR_DESG_LABEL")} text={t("COMMON_MASTERS_DESIGNATION_" + element?.designation)} />
              </StatusTable>
            ))}
          </Card>
        </div>
      )}
      {showModal ? (
        <ActionModal t={t} action={selectedAction} tenantId={tenantId} applicationData={data} closeModal={closeModal} submitAction={() => {}} />
      ) : null}
      <ActionBar>
        {displayMenu && data ? (
          <Menu
            localeKeyPrefix="HR"
            options={employee?.isActive ? activeworkflowActions : deactiveworkflowActions}
            t={t}
            onSelect={onActionSelect}
          />
        ) : null}
        <SubmitBar label={t("HR_COMMON_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
    </React.Fragment>
  );
};

export default Details;
