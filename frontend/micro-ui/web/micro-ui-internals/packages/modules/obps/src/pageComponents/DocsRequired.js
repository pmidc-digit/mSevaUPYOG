import React, { Fragment, useEffect, useState } from "react";
import { Card, CardHeader, CardLabel, CardText, CitizenInfoLabel, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

const DocsRequired = ({ onSelect, onSkip, config }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateCode = Digit.ULBService.getStateId();
  const history = useHistory();
  const { applicationType: applicationType, serviceType: serviceType } = useParams();
  const [docsList, setDocsList] = useState([]);
  const [uiFlow, setUiFlow] = useState([]);
  const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", "DocumentTypes");
  const { isLoading: commonDocsLoading, data: commonDocs } = Digit.Hooks.obps.useMDMS(stateCode, "common-masters", ["DocumentType"]);
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["RiskTypeComputation"]);
  const userInfo = Digit.UserService.getUser();
  const queryObject = { 0: { tenantId: stateCode }, 1: { id: userInfo?.info?.id } };
  const { data: LicenseData, isLoading: LicenseDataLoading } = Digit.Hooks.obps.useBPAREGSearch(tenantId, queryObject);
  const checkingUrl = window.location.href.includes("ocbpa");
  sessionStorage.removeItem("clickOnBPAApplyAfterEDCR");

  const { data: homePageUrlLinks, isLoading: homePageUrlLinksLoading } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["homePageUrlLinks"]);
  console.log(docsList, "DOCS");
  const goNext = () => {
    if (JSON.parse(sessionStorage.getItem("BPAintermediateValue")) !== null) {
      let formData = JSON.parse(sessionStorage.getItem("BPAintermediateValue"));
      sessionStorage.setItem("BPAintermediateValue", null);
      onSelect("", formData);
    } else onSelect("uiFlow", uiFlow);
  };

  useEffect(() => {
    let architectName = "",
      stakeholderRegistrationNumber = "",
      stakeholderName = "",
      stakeholderAddress = "",
      isDone = true;
    let isSelfCertificationRequired;
    for (let i = 0; i < LicenseData?.Licenses?.length; i++) {
      if (LicenseData?.Licenses?.[i]?.status === "APPROVED" && isDone) {
        isDone = false;
        architectName = LicenseData?.Licenses?.[i]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
        stakeholderRegistrationNumber = LicenseData?.Licenses?.[i]?.applicationNumber;
        stakeholderName = LicenseData?.Licenses?.[i]?.tradeLicenseDetail?.owners[0]?.name;
        stakeholderAddress = LicenseData?.Licenses?.[i]?.tradeLicenseDetail?.owners[0]?.permanentAddress;
        sessionStorage.setItem("BPA_ARCHITECT_NAME", JSON.stringify(architectName));
        sessionStorage.setItem("BPA_STAKEHOLDER_REGISTRATION_NUMBER", JSON.stringify(stakeholderRegistrationNumber));
        sessionStorage.setItem("BPA_STAKEHOLDER_NAME", JSON.stringify(stakeholderName));
        sessionStorage.setItem("BPA_STAKEHOLDER_ADDRESS", JSON.stringify(stakeholderAddress));
        isSelfCertificationRequired = LicenseData?.Licenses?.[i]?.tradeLicenseDetail.additionalDetail.isSelfCertificationRequired;
        sessionStorage.setItem("isSelfCertificationRequired", JSON.stringify(isSelfCertificationRequired));
      }
    }
  }, [LicenseData]);


  useEffect(() => {
    if (!homePageUrlLinksLoading) {
      const windowUrl = window.location.href.split("/");
      const serviceType = windowUrl[windowUrl.length - 2];
      const applicationType = windowUrl[windowUrl.length - 3];
      homePageUrlLinks?.BPA?.homePageUrlLinks?.map((linkData) => {
        if (applicationType?.toUpperCase() === linkData?.applicationType && serviceType?.toUpperCase() === linkData?.serviceType) {
          setUiFlow({
            flow: linkData?.flow,
            applicationType: linkData?.applicationType,
            serviceType: linkData?.serviceType,
          });
        }
      });
    }
  }, [!homePageUrlLinksLoading]);

  useEffect(() => {
    if (!isLoading) {
      let unique = [],
        distinct = [],
        uniqueData = [],
        uniqueList = [];
      const windowUrl = window.location.href.split("/");
      const serviceType = windowUrl[windowUrl.length - 2];
      const applicationType = windowUrl[windowUrl.length - 3];
      for (let i = 0; i < data.length; i++) {
        if (!unique[data[i].applicationType] && !unique[data[i].ServiceType]) {
          distinct.push(data[i].applicationType);
          unique[data[i].applicationType] = data[i];
        }
      }
      Object.values(unique).map((indData) => {
        if (indData?.applicationType == applicationType?.toUpperCase() && indData?.ServiceType == serviceType?.toUpperCase()) {
          uniqueList.push(indData?.docTypes);
        }
        uniqueList?.[0]?.forEach((doc) => {
          let code = doc.code;
          doc.dropdownData = [];
          commonDocs?.["common-masters"]?.DocumentType?.forEach((value) => {
            let values = value.code.slice(0, code.length);
            if (code === values) {
              doc.hasDropdown = true;
              value.i18nKey = value.code;
              doc.dropdownData.push(value);
            }
          });
        });
        setDocsList(uniqueList);
      });
    }
  }, [!isLoading]);

  const codedDocs = [
    { code: "BPA_DOC_OWNERSHIP_DOCUMENT" },
    { code: "BPA_DOC_DETAILED_LOCATION_PLAN" },
    { code: "BPA_DOC_OWNER_SIGNED_UNDERTAKING" },
    { code: "BPA_DOC_FIRM_DOCUMENTS" },
    { code: "BPA_DOC_IMPROVEMENT_TRUST_NOC" },
    { code: "BPA_DOC_INDEMNITY_BOND_BASEMENT" },
    { code: "BPA_DOC_STRUCTURE_STABILITY_CERTIFICATE" },
    { code: "BPA_DOC_STRUCTURE_DRAWINGS" },
    { code: "BPA_DOC_SELF_DECLARATION_INDUSTRY" },
    { code: "BPA_DOC_NOC_NEIGHBOR_BASEMENT" },
    { code: "BPA_DOC_NOC_FIRE_DEPARTMENT" },
    { code: "BPA_DOC_NOC_NHAI_PWD" },
    { code: "BPA_DOC_NOC_AIRPORT_AUTHORITY" },
    { code: "BPA_DOC_NOC_GAS_AUTHORITY" },
    { code: "BPA_DOC_ANY_OTHER_NOC" },
    { code: "BPA_DOC_ANY_OTHER_SUPPORTING" },
    { code: "BPA_DOC_LAST_PROPERTY_TAX" },
    { code: "BPA_DOC_PHOTOGRAPH" },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Fragment>
      <Card>
        <CardHeader>{checkingUrl ? t(`BPA_OOCUPANCY_CERTIFICATE_APP_LABEL`) : t(`OBPS_NEW_BUILDING_PERMIT`)}</CardHeader>
        {/* TODO: Change text styles */}
        {/* <CitizenInfoLabel style={{margin:"0px"}} textStyle={{color:"#0B0C0C"}} text={t(`OBPS_DOCS_REQUIRED_TIME`)} showInfo={false} /> */}
        <CardText >
          {t(`OBPS_NEW_BUILDING_PERMIT_DESCRIPTION`)}
        </CardText>
        {isLoading ? (
          <Loader />
        ) : (
          <Fragment>
            {codedDocs.map((doc, index) => (
              <div key={index}>
                <div >
                  <div>{`${index + 1}.`}&nbsp;</div>
                  <div>{t(doc.code)}</div>
                </div>
              </div>
            ))}
          </Fragment>
        )}
        <SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={goNext} />
      </Card>
      <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t(`OBPS_DOCS_FILE_SIZE`)} className={"info-banner-wrap-citizen-override"} />
    </Fragment>
  );
};

export default DocsRequired;
