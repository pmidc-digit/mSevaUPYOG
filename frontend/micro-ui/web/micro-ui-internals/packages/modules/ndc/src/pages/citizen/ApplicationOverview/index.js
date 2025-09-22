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
  ConnectingCheckPoints,
  CheckPoint,
  TLTimeLine,
  DisplayPhotos,
  StarRated,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";
import { businessServiceList, convertEpochToDate, stringReplaceAll } from "../../../utils";
import { format } from "date-fns";
import NDCDocument from "../../../pageComponents/NDCDocument";
import NDCDocumentTimline from "../../../components/NDCDocument";
import NDCModal from "../../../pageComponents/NDCModal";
import { set } from "lodash";
import getAcknowledgementData from "../../../getAcknowlegment";

const getTimelineCaptions = (checkpoint, index, arr, t) => {
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;

  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    name: checkpoint?.assigner?.name,
    // mobileNumber: checkpoint?.assigner?.mobileNumber,
    source: checkpoint?.assigner?.source,
  };

  return (
    <div>
      {comment?.length > 0 && (
        <div className="TLComments">
          <h3>{t("WF_COMMON_COMMENTS")}</h3>
          <p style={{ overflowX: "scroll" }}>{comment}</p>
        </div>
      )}

      {thumbnailsToShow?.thumbs?.length > 0 && (
        <DisplayPhotos
          srcs={thumbnailsToShow.thumbs}
          onClick={(src, idx) => {
            let fullImage = thumbnailsToShow.fullImage?.[idx] || src;
            Digit.Utils.zoomImage(fullImage);
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          {wfDocuments?.map((doc, index) => (
            <div key={index}>
              <NDCDocumentTimline value={wfDocuments} Code={doc?.documentType} index={index} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        {caption.date && <p>{caption.date}</p>}
        {caption.name && <p>{caption.name}</p>}
        {caption.mobileNumber && <p>{caption.mobileNumber}</p>}
        {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
      </div>
    </div>
  );
};

const CitizenApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const state = tenantId?.split(".")[0];
  const [appDetails, setAppDetails] = useState({});
  const [showToast, setShowToast] = useState(null);

  const [ndcDatils, setNdcDetails] = useState([]);
  const [displayData, setDisplayData] = useState({});

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();

  const { isLoading: nocDocsLoading, data: nocDocs } = Digit.Hooks.pt.usePropertyMDMS(state, "NDC", ["Documents"]);

  const { isLoading, data: applicationDetails } = Digit.Hooks.ndc.useSearchEmployeeApplication({ uuid: id }, tenantId);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "ndc-services",
  });

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
    if (ndcObject) {
      const applicantData = {
        name: ndcObject?.owners?.[0]?.name,
        mobile: ndcObject?.owners?.[0]?.mobileNumber,
        email: ndcObject?.owners?.[0]?.emailId,
        address: ndcObject?.NdcDetails?.[0]?.additionalDetails?.propertyAddress,
        // createdDate: ndcObject?.owners?.[0]?.createdtime ? format(new Date(ndcObject?.owners?.[0]?.createdtime), "dd/MM/yyyy") : "",
        applicationNo: ndcObject?.uuid,
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
    const tenantInfo = tenants?.find((tenant) => tenant?.code === Property?.tenantId);

    const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);

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

  if (isLoading || isDetailsLoading) {
    return <Loader />;
  }

  console.log("applicationDetails", applicationDetails);

  return (
    <div className={"employee-main-application-details"}>
      <div style={{ display: "flex", justifyContent: "end", alignItems: "center", padding: "16px" }}>
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
                const id = applicationDetails?.Applications?.[0]?.uuid;
                history.push(`/digit-ui/citizen/ndc/new-application/${id}`);
              }}
            />
          </ActionBar>
        )}
      </div>

      <Card className="ndc_card_main">
        <CardSubHeader className="ndc_label">{t("NDC_APPLICATION_DETAILS_OVERVIEW")}</CardSubHeader>
        <StatusTable>
          {displayData?.applicantData &&
            Object.entries(displayData?.applicantData)?.map(([key, value]) => (
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
        {displayData?.NdcDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NDC_BUSINESS_SERVICE")} text={t(`${detail.businessService}`) || detail.businessService} />
              <Row label={t("NDC_CONSUMER_CODE")} text={detail.consumerCode || "N/A"} />
              {/* <Row label={t("NDC_STATUS")} text={t(detail.status) || detail.status} /> */}
              <Row label={t("NDC_DUE_AMOUNT")} text={detail.dueAmount?.toString() || "0"} />
              <Row label={t("NDC_PROPERTY_TYPE")} text={t(detail.propertyType) || detail.propertyType} />
              {detail?.businessService == "NDC_PROPERTY_TAX" && propertyDetailsFetch?.Properties && (
                <>
                  <Row label={t("City")} text={propertyDetailsFetch?.Properties?.[0]?.address?.city} />
                  <Row label={t("House No")} text={propertyDetailsFetch?.Properties?.[0]?.address?.doorNo} />
                  <Row label={t("Colony Name")} text={propertyDetailsFetch?.Properties?.[0]?.address?.buildingName} />
                  <Row label={t("Street Name")} text={propertyDetailsFetch?.Properties?.[0]?.address?.street} />
                  {/* <Row label={t("Mohalla")} text={propertyDetailsFetch?.Properties?.[0]?.address?.city} /> */}
                  <Row label={t("Pincode")} text={propertyDetailsFetch?.Properties?.[0]?.address?.pincode || "N/A"} />
                  {/* <Row label={t("Existing Pid")} text={propertyDetailsFetch?.Properties?.[0]?.address?.city} /> */}
                  <Row label={t("Survey Id/UID")} text={propertyDetailsFetch?.Properties?.[0]?.surveyId} />
                  <Row label={t("Year of creation of Property")} text={propertyDetailsFetch?.Properties?.[0]?.additionalDetails?.yearConstruction} />
                </>
              )}
            </StatusTable>
          </div>
        ))}
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
        <div style={{ display: "flex", gap: "16px" }}>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NDCDocument value={{ workflowDocs: displayData?.Documents }} />
          ) : (
            <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>

      {workflowDetails?.data?.timeline && (
        <Card className="ndc_card_main">
          <CardSubHeader className="ndc_label">{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
          {workflowDetails?.data?.timeline.length === 1 ? (
            <CheckPoint isCompleted={true} label={t(workflowDetails?.data?.timeline[0]?.status)} />
          ) : (
            <ConnectingCheckPoints>
              {workflowDetails?.data?.timeline.map((checkpoint, index, arr) => (
                <CheckPoint
                  keyValue={index}
                  isCompleted={index === 0}
                  label={t(checkpoint.status)}
                  customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                />
              ))}
            </ConnectingCheckPoints>
          )}
        </Card>
      )}
    </div>
  );
};

export default CitizenApplicationOverview;
