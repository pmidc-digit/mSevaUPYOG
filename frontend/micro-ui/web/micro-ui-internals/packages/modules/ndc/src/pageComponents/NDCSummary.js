import React, { useEffect, useState, useRef } from "react";
import { Card, CardSubHeader, CardLabel, LabelFieldPair, StatusTable, ActionBar, SubmitBar, Menu } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNDCStep } from "../redux/actions/NDCFormActions";
import { useTranslation } from "react-i18next";
import NDCDocument from "../components/NDCDocument";

const NDCSummary = ({ formData, goNext, ...props }) => {
  const { pathname: url } = useLocation();
  const { t } = useTranslation();
  const history = useHistory();
  const menuRef = useRef();
  const dispatch = useDispatch();
  const mutateScreen = url.includes("/property-mutate/");
  let user = Digit.UserService.getUser();

  console.log("formData", formData);

  let docs = formData?.DocummentDetails?.documents?.documents;
  const uuid = formData?.apiData?.Applicant.uuid;

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const [getData, setData] = useState();
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const fetchCalculations = async () => {
    const payload = {
      CalculationCriteria: [
        {
          applicationNumber: formData?.apiData?.Applicant.uuid,
          tenantId: tenantId,
        },
      ],
    };
    const response = await Digit.NDCService.NDCCalculator({ tenantId, filters: { getCalculationOnly: true }, details: payload });
    console.log("response", response?.Calculation?.[0]?.totalAmount);
    setData(response?.Calculation?.[0]);
  };

  useEffect(() => {
    fetchCalculations();
  }, []);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: formData?.apiData?.Applicant.uuid,
    moduleCode: "NDC",
  });

  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  function onActionSelect(action) {
    goNext(action);
    // setShowModal(true);
    // setSelectedAction(action);
  }

  console.log("workflowDetails", workflowDetails?.data?.nextActions);

  return (
    <div className="application-summary">
      <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2>

      <div className="summary-section">
        {/* <div className="section-header">
          <h3>{t("Property Details")}</h3>
          <label onClick={() => dispatch(setNDCStep(1))}>{t("EDIT")}</label>
        </div> */}
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("First Name")}</CardLabel>
            <div>{formData?.NDCDetails?.PropertyDetails?.firstName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Last Name")}</CardLabel>
            <div>{formData?.NDCDetails?.PropertyDetails?.lastName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Mobile Number")}</CardLabel>
            <div>{formData?.NDCDetails?.PropertyDetails?.mobileNumber || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Email ID")}</CardLabel>
            <div>{formData?.NDCDetails?.PropertyDetails?.email || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Address")}</CardLabel>
            <div>{formData?.NDCDetails?.PropertyDetails?.address || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("NDC Reason")}</CardLabel>
            <div>{t(formData?.NDCDetails?.NDCReason?.i18nKey) || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Water Connection")}</CardLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {formData?.NDCDetails?.PropertyDetails?.waterConnection?.length > 0
                ? formData?.NDCDetails?.PropertyDetails?.waterConnection?.map((item, index) => (
                    <div key={item.connectionNo + index}>{item.connectionNo}</div>
                  ))
                : "NA"}
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Sewerage Connection")}</CardLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {formData?.NDCDetails?.PropertyDetails?.sewerageConnection?.length > 0
                ? formData?.NDCDetails?.PropertyDetails?.sewerageConnection?.map((item, index) => (
                    <div key={item.connectionNo + index}>{item.connectionNo}</div>
                  ))
                : "NA"}
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Property ID")}</CardLabel>
            <div>{formData?.NDCDetails?.cpt?.id || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Amount")}</CardLabel>
            <div>{getData?.totalAmount || "NA"}</div>
          </LabelFieldPair>
        </div>
      </div>

      <div className="summary-section">
        {/* <div className="section-header">
          <h3>{t("Documents")}</h3>
          <label onClick={() => dispatch(setNDCStep(2))}>{t("EDIT")}</label>
        </div> */}
        <div className="section-content">
          {/* {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
                <LabelFieldPair key={index}>
                  <CardLabel>{t("Document")}</CardLabel>
                  <div>{doc?.documentType || "NA"}</div>
                </LabelFieldPair>
              ))} */}
          <CardSubHeader style={{ fontSize: "24px" }}>{t("NDC_DOCUMENTS_DETAILS")}</CardSubHeader>
          <StatusTable>
            {docs?.map((doc, index) => (
              <NDCDocument value={docs} Code={doc?.documentType} index={index} formData={formData} />
            ))}
          </StatusTable>
        </div>
      </div>

      <ActionBar>
        {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
          <Menu
            localeKeyPrefix={`WF_EMPLOYEE_${"NDC"}`}
            options={actions}
            optionKey={"action"}
            t={t}
            onSelect={onActionSelect}
            // style={MenuStyle}
          />
        ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        {/* <SubmitBar label="Next" submit="submit" /> */}

        {/* <SubmitBar label={t("WF_TAKE_ACTION")} /> */}
      </ActionBar>
    </div>
  );
};

export default NDCSummary;
