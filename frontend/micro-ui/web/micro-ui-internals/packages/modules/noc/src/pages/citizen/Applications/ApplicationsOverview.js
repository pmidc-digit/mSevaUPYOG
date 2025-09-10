import {
  CardSectionHeader,
  Header,
  MultiUploadWrapper,
  PDFSvg,
  Row,
  StatusTable,
  LabelFieldPair,
  CardLabel,
  Loader,
  Card,
  CardSubHeader,
  ActionBar,
  SubmitBar,
  Menu,
  LinkButton,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import NOCDocument from "../../../pageComponents/NOCDocument";
import { getNOCAcknowledgementData } from "../../../utils/getNOCAcknowledgementData";

const CitizenApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const [displayData, setDisplayData] = useState({});

  const { isLoading, data: applicationDetails } = Digit.Hooks.noc.useNOCSearchApplication({ applicationNo: id }, tenantId);

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  let user = Digit.UserService.getUser();

  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);

  // const removeDuplicatesByUUID = (arr) => {
  //   const seen = new Set();
  //   return arr.filter((item) => {
  //     if (seen.has(item.uuid)) {
  //       return false;
  //     } else {
  //       seen.add(item.uuid);
  //       return true;
  //     }
  //   });
  // };

  useEffect(()=>{
    const nocObject = applicationDetails?.Applications?.[0];

    if(nocObject){
      const applicantDetails = nocObject?.nocDetails?.additionalDetails?.applicationDetails;

      const siteDetails = nocObject?.nocDetails?.additionalDetails?.siteDetails;
      
      console.log("applicantDetails",applicantDetails);
      console.log("siteDetails", siteDetails);
      setDisplayData({applicantDetails, siteDetails});
    }

  },[applicationDetails?.Applications])



  const handleDownloadPdf = async () => {
    const Property = applicationDetails;
    console.log("applicationDetails in NOC", applicationDetails);
    console.log("tenants", tenants);
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);

    const acknowledgementData = await getNOCAcknowledgementData(Property, tenantInfo, t);

    console.log("acknowledgementData", acknowledgementData);
    Digit.Utils.pdf.generate(acknowledgementData);
  };

  const getFloorLabel = (index) => {
  if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");
  const suffixes = ["st", "nd", "rd"];
  const suffix = suffixes[(index - 1) % 10 - 1] || "th";
  return `${index}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`; // e.g., "1st Floor"
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("NDC_APP_OVER_VIEW_HEADER")}</Header>

        {applicationDetails?.Applications?.[0]?.applicationStatus === "APPROVED" && (
          <LinkButton label={t("DOWNLOAD_CERTIFICATE")} style={{ color: "#A52A2A" }} onClick={handleDownloadPdf}></LinkButton>
        )}
      </div>

      /**If no applicants then show MSG as per PGR */

      <Card>
        <CardSubHeader>{t("NOC_APPLICANT_DETAILS")}</CardSubHeader>
        {displayData?.applicantDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_FIRM_OWNER_NAME_LABEL")} text={detail?.applicantOwnerOrFirmName || "N/A"} />
              <Row label={t("NOC_APPLICANT_EMAIL_LABEL")} text={detail?.applicantEmailId || "N/A"} />
              <Row label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={detail?.applicantFatherHusbandName || "N/A"} />
              <Row label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} text={detail?.applicantMobileNumber} />
              <Row label={t("NOC_APPLICANT_DOB_LABEL")} text={detail?.applicantDateOfBirth || "N/A"} />
              <Row label={t("NOC_APPLICANT_GENDER_LABEL")} text={detail?.applicantGender?.code || "N/A"} />
              <Row label={t("NOC_APPLICANT_ADDRESS_LABEL")} text={detail?.applicantAddress || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_PROFESSIONAL_DETAILS")}</CardSubHeader>
        {displayData?.applicantDetails?.professionalName && displayData?.applicantDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PROFESSIONAL_NAME_LABEL")} text={detail?.professionalName || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} text={detail?.professionalEmailId || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={detail?.professionalRegId || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} text={detail?.professionalMobileNumber} />
              <Row label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} text={detail?.professionalAddress || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PLOT_NO_LABEL")} text={detail?.plotNo || "N/A"} />
              <Row label={t("NOC_PROPOSED_SITE_ADDRESS")} text={detail?.proposedSiteAddress || "N/A"} />
              <Row label={t("NOC_ULB_NAME_LABEL")} text={detail?.ulbName?.name || "N/A"} />
              <Row label={t("NOC_ULB_TYPE_LABEL")} text={detail?.ulbType || "N/A"} />
              <Row label={t("NOC_KHASRA_NO_LABEL")} text={detail?.khasraNo || "N/A"} />
              <Row label={t("NOC_HADBAST_NO_LABEL")} text={detail?.hadbastNo || "N/A"} />
              <Row label={t("NOC_ROAD_TYPE_LABEL")} text={detail?.roadType?.name || "N/A"} />
              <Row label={t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={detail?.areaLeftForRoadWidening || "N/A"} />
              <Row label={t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={detail?.netPlotAreaAfterWidening || "N/A"} />
              <Row label={t("NOC_ROAD_WIDTH_AT_SITE_LABEL")} text={detail?.roadWidthAtSite || "N/A"} />
              <Row label={t("NOC_BUILDING_STATUS_LABEL")} text={detail?.buildingStatus?.name || "N/A"} />


              <Row label={t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")} text={detail?.isBasementAreaAvailable?.code || "N/A"} />

              {detail?.buildingStatus?.code == "BUILTUP" && 
               <Row label={t("NOC_BASEMENT_AREA_LABEL")} text={detail.basementArea || "N/A"}/>
              }

              {detail?.buildingStatus?.code == "BUILTUP" && detail?.floorArea?.map((floor, index)=>{
               <Row label={getFloorLabel(index)} text={floor.value || "N/A"}/>
              })}

              {detail?.buildingStatus?.code == "BUILTUP" && 
               <Row label={t("NOC_TOTAL_FLOOR_AREA_LABEL")} text={detail.totalFloorArea || "N/A"}/>
              }

              <Row label={t("NOC_DISTRICT_LABEL")} text={detail?.district?.name || "N/A"} />
              <Row label={t("NOC_ZONE_LABEL")} text={detail?.zone?.name || "N/A"} />
              <Row label={t("NOC_SITE_WARD_NO_LABEL")} text={detail?.wardNo || "N/A"} />
              <Row label={t("NOC_SITE_VILLAGE_NAME_LABEL")} text={detail?.villageName || "N/A"} />
             
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_SPECIFICATION_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")} text={detail?.specificationPlotArea || "N/A"} />
              <Row label={t("NOC_BUILDING_CATEGORY_LABEL")} text={detail?.specificationBuildingCategory?.name || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <div style={{ display: "flex", gap: "16px" }}>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NOCDocument value={{ workflowDocs: displayData?.Documents }} />
          ) : (
            <div>{t("NOC_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CitizenApplicationOverview;
