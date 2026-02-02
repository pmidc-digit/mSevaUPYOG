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
  TLTimeLine,
  DisplayPhotos,
  StarRated,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import { businessServiceList, convertEpochToDate, stringReplaceAll } from "../../../utils";
import { format } from "date-fns";
import NDCDocument from "../../../pageComponents/NDCDocument";
import NDCModal from "../../../pageComponents/NDCModal";
import { set } from "lodash";
import getAcknowledgementData from "../../../getAcknowlegment";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";

const CitizenApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const state = tenantId?.split(".")[0];
  const [appDetails, setAppDetails] = useState({});
  const [showToast, setShowToast] = useState(null);
  const [approver, setApprover] = useState(null);

  const [ndcDatils, setNdcDetails] = useState([]);
  const [displayData, setDisplayData] = useState({});

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();

  const { isLoading: nocDocsLoading, data: nocDocs } = Digit.Hooks.pt.usePropertyMDMS(state, "NDC", ["Documents"]);

  const { isLoading, data: applicationDetails } = Digit.Hooks.ndc.useSearchEmployeeApplication({ applicationNo: id }, tenantId);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "ndc-services",
  });

  useEffect(() => {
    if (workflowDetails) {
      console.log("workflowDetails here", workflowDetails);
      const approveInstance = workflowDetails?.data?.processInstances?.find((pi) => pi?.action === "APPROVE");

      const name = approveInstance?.assigner?.name || "NA";

      setApprover(name);
    }
  }, [workflowDetails]);

  console.log("approver for ndc", approver);

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  let user = Digit.UserService.getUser();
  const menuRef = useRef();

  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);
  const removeDuplicatesByUUID = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item.uuid)) {
        return false;
      } else {
        seen.add(item.uuid);
        return true;
      }
    });
  };

  useEffect(() => {
    const ndcObject = applicationDetails?.Applications?.[0];
    console.log("ndcObject", ndcObject);
    if (ndcObject) {
      const primaryOwner = ndcObject?.owners?.find((owner) => owner?.isPrimaryOwner) || ndcObject?.owners?.[0]; // fallback if none marked

      const applicantData = {
        name: primaryOwner?.name,
        mobile: primaryOwner?.mobileNumber,
        email: primaryOwner?.emailId,
        address: primaryOwner?.permanentAddress,
        // createdDate: ndcObject?.owners?.[0]?.createdtime ? format(new Date(ndcObject?.owners?.[0]?.createdtime), "dd/MM/yyyy") : "",
        applicationNo: ndcObject?.applicationNo,
      };
      const Documents = removeDuplicatesByUUID(ndcObject?.Documents || []);
      const NdcDetails = removeDuplicatesByUUID(ndcObject?.NdcDetails || [])?.map((item) => ({
        businessService:
          item?.businessService === "WS"
            ? "NDC_WATER_SERVICE_CONNECTION"
            : item?.businessService === "SW"
            ? "NDC_SEWERAGE_SERVICE_CONNECTION"
            : item?.businessService === "PT"
            ? "NDC_PROPERTY_TAX"
            : item?.businessService,
        consumerCode: item?.consumerCode || "",
        status: item?.status || "",
        dueAmount: item?.dueAmount || 0,
        propertyType: item?.additionalDetails?.propertyType || "",
      }));

      setDisplayData({ applicantData, Documents, NdcDetails });
    }
  }, [applicationDetails?.Applications]);

  useEffect(() => {
    if (applicationDetails) {
      setIsDetailsLoading(true);
      const { Applicant: details } = applicationDetails?.Applications?.[0];
      setAppDetails({ ...applicationDetails, applicationDetails: [{ title: "NOC_DETAILS_SUMMARY_LABEL" }] });
      setIsDetailsLoading(false);
    }
  }, [applicationDetails]);

  const handleDownloadPdf = async () => {
    const Property = applicationDetails;
    const owners = propertyDetailsFetch?.Properties?.[0]?.owners || [];
    const propertyOwnerNames = owners.map((owner) => owner?.name).filter(Boolean);

    Property.propertyOwnerNames = propertyOwnerNames;

    console.log("propertyOwnerNames", propertyOwnerNames);
    const tenantInfo = tenants?.find((tenant) => tenant?.code === Property?.Applications?.[0]?.tenantId);
    console.log("tenantInfo", tenantInfo);
    const ulbType = tenantInfo?.city?.ulbType;
    const acknowledgementData = await getAcknowledgementData(Property, formattedAddress, tenantInfo, t, approver, ulbType);

    console.log("acknowledgementData", acknowledgementData);
    Digit.Utils.pdf.generateNDC(acknowledgementData);
  };

  const [getPropertyId, setPropertyId] = useState(null);

  useEffect(() => {
    if (displayData) {
      console.log("here");
      const checkProperty = displayData?.NdcDetails?.filter((item) => item?.businessService == "NDC_PROPERTY_TAX");
      console.log("checkProperty", checkProperty);
      setPropertyId(checkProperty?.[0]?.consumerCode);
    }
  }, [displayData]);

  const { isLoading: checkLoading, isError, error: checkError, data: propertyDetailsFetch } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: getPropertyId }, tenantId: tenantId },
    {
      filters: { propertyIds: getPropertyId },
      tenantId: tenantId,
      enabled: getPropertyId ? true : false,
      privacy: Digit.Utils.getPrivacyObject(),
    }
  );

  let address, formattedAddress;

  if (!checkLoading && propertyDetailsFetch?.Properties?.length > 0) {
    address = propertyDetailsFetch.Properties[0].address;
    formattedAddress = [
      address?.doorNo,
      address?.buildingName, // colony/building
      address?.street,
      address?.locality?.name, // locality name
      address?.city,
    ]
      .filter(Boolean)
      .join(", ");
  }
  if (isLoading || isDetailsLoading) {
    return <Loader />;
  }

  console.log("propertyDetailsFetch", propertyDetailsFetch);

  console.log("displayData?.applicantData", displayData);

  const ownerForName = propertyDetailsFetch?.Properties?.[0]?.owners || [];
  const ownerNames = ownerForName
    ?.map((owner) => owner?.name)
    ?.filter(Boolean)
    ?.join(", ");

  console.log("applicationDetails?.[0]", applicationDetails?.Applications?.[0]);

  return (
    <div className={"employee-main-application-details"}>
      <div className="ndc-application-overview">
        {/* <Header styles={{ fontSize: "32px" }}>{t("NDC_APP_OVER_VIEW_HEADER")}</Header> */}

        {applicationDetails?.Applications?.[0]?.applicationStatus === "APPROVED" && (
          <LinkButton className="downLoadButton" label={t("DOWNLOAD_CERTIFICATE")} onClick={handleDownloadPdf}></LinkButton>
        )}
        {(applicationDetails?.Applications?.[0]?.applicationStatus == "INITIATED" ||
          applicationDetails?.Applications?.[0]?.applicationStatus == "CITIZENACTIONREQUIRED") && (
          <ActionBar>
            <SubmitBar
              label={t("COMMON_EDIT")}
              onSubmit={() => {
                const id = applicationDetails?.Applications?.[0]?.applicationNo;
                history.push(`/digit-ui/citizen/ndc/new-application/${id}`);
              }}
            />
          </ActionBar>
        )}
      </div>

      <Card className="ndc_card_main">
        <CardSubHeader className="ndc_label">{t("NDC_APPLICATION_DETAILS_OVERVIEW")}</CardSubHeader>
        <StatusTable>
          <Row label={t(`Name`)} text={ownerNames} />
          {displayData?.applicantData &&
            Object.entries(displayData?.applicantData)
              ?.filter(([key]) => key !== "name")
              ?.map(([key, value]) => (
                <Row
                  key={key}
                  label={t(`${key?.toUpperCase()}`)}
                  text={
                    Array.isArray(value)
                      ? value.map((item) => (typeof item === "object" ? t(item?.code || "N/A") : t(item || "N/A"))).join(", ")
                      : typeof value === "object"
                      ? t(value?.code || "N/A")
                      : t(value || "N/A")
                  }
                />
              ))}
        </StatusTable>
      </Card>

      <Card className="ndc_card_main">
        <CardSubHeader className="ndc_label">{t("NDC_APPLICATION_NDC_DETAILS_OVERVIEW")}</CardSubHeader>
        {displayData?.NdcDetails?.map((detail, index) => {
          console.log("detail", detail);
          const isRed = detail.dueAmount > 0;
          return (
            <div className="ndc-application-overview-table" key={index}>
              <StatusTable>
                <Row
                  label={t("CHB_DISCOUNT_REASON")}
                  text={t(
                    `${
                      applicationDetails?.Applications?.[0]?.reason == "OTHERS"
                        ? applicationDetails?.Applications?.[0]?.NdcDetails?.[0]?.additionalDetails?.reason
                        : applicationDetails?.Applications?.[0]?.reason
                    }`
                  )}
                />

                <Row label={t("NDC_BUSINESS_SERVICE")} text={t(`${detail.businessService}`) || detail.businessService} />
                {/* <Row label={t("Name")} text={t(`${detail.businessService}`) || detail.businessService} /> */}
                <Row label={t("NDC_CONSUMER_CODE")} text={detail.consumerCode || "N/A"} />
                {/* <Row label={t("NDC_STATUS")} text={t(detail.status) || detail.status} /> */}
                <div
                  style={{
                    background: isRed ? "red" : "none",
                    color: isRed ? "white" : "black",
                    paddingTop: isRed ? "8px" : "0",
                    paddingLeft: isRed ? "10px" : "0",
                  }}
                >
                  <Row
                    rowContainerStyle={{
                      backgroundColor: isRed ? "red" : "none",
                    }}
                    label={t("NDC_DUE_AMOUNT")}
                    text={detail.dueAmount?.toString() || "0"}
                  />
                </div>
                <Row label={t("NDC_PROPERTY_TYPE")} text={t(detail.propertyType) || detail.propertyType} />
                {detail?.businessService == "NDC_PROPERTY_TAX" && propertyDetailsFetch?.Properties && (
                  <>
                    <Row label={t("City")} text={propertyDetailsFetch?.Properties?.[0]?.address?.city || "N/A"} />
                    <Row label={t("House No")} text={propertyDetailsFetch?.Properties?.[0]?.address?.doorNo || "N/A"} />
                    <Row label={t("Colony Name")} text={propertyDetailsFetch?.Properties?.[0]?.address?.buildingName || "N/A"} />
                    <Row label={t("Street Name")} text={propertyDetailsFetch?.Properties?.[0]?.address?.street || "N/A"} />
                    {/* <Row label={t("Mohalla")} text={propertyDetailsFetch?.Properties?.[0]?.address?.city} /> */}
                    <Row label={t("Pincode")} text={propertyDetailsFetch?.Properties?.[0]?.address?.pincode || "N/A"} />
                    {/* <Row label={t("Existing Pid")} text={propertyDetailsFetch?.Properties?.[0]?.address?.city} /> */}
                    <Row label={t("Survey Id/UID")} text={propertyDetailsFetch?.Properties?.[0]?.surveyId || "N/A"} />
                    <Row
                      label={t("Year of creation of Property")}
                      text={propertyDetailsFetch?.Properties?.[0]?.additionalDetails?.yearConstruction}
                    />
                    <Row label={t("Remarks")} text={applicationDetails?.Applications?.[0]?.NdcDetails?.[0]?.additionalDetails?.remarks || "N/A"} />
                  </>
                )}
              </StatusTable>
            </div>
          );
        })}
      </Card>

      {/* <Card>
        <CardSubHeader>{t("NDC_APPLICATION_NDC_DETAILS_OVERVIEW")}</CardSubHeader>
        <div style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
          <StatusTable>
            <Row label={t("CANCEL_COMMENT_LABEL ")} text={applicationDetails?.Applications?.[0]?.workflow?.comment} />
          </StatusTable>
        </div>
      </Card> */}

      <Card className="ndc_card_main">
        <CardSubHeader className="ndc_label">{t("NDC_APPLICATION_DOCUMENTS_OVERVIEW")}</CardSubHeader>
        <div>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NDCDocument value={{ workflowDocs: displayData?.Documents }} />
          ) : (
            <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>
      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
    </div>
  );
};

export default CitizenApplicationOverview;
