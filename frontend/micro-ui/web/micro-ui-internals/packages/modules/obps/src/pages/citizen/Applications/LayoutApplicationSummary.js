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
  Toast,
  ConnectingCheckPoints,
  CheckPoint,
  MultiLink,
  DisplayPhotos,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import NOCDocument from "../../../../../noc/src/pageComponents/NOCDocument";
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData";
import NOCDocumentTableView from "../../../../../noc/src/pageComponents/NOCDocumentTableView";
import { useLayoutSearchApplication } from "@mseva/digit-ui-libraries/src/hooks/obps/useSearchApplication";
import LayoutFeeEstimationDetails from "../../../pageComponents/LayoutFeeEstimationDetails";
import LayoutDocumentView from "./LayoutDocumentView";
import { amountToWords } from "../../../utils/index";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import { LoaderNew } from "../../../components/LoaderNew";

// Component to render document link for owner documents
const DocumentLink = ({ fileStoreId, stateCode, t, label }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (fileStoreId) {
        try {
          const result = await Digit.UploadServices.Filefetch([fileStoreId], stateCode);
          if (result?.data?.fileStoreIds?.[0]?.url) {
            setUrl(result.data.fileStoreIds[0].url);
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };
    fetchUrl();
  }, [fileStoreId, stateCode]);

  if (!url) return <span>{t("CS_NA") || "NA"}</span>;

  return (
    <LinkButton
     
      label={t("View") || "View"}
      onClick={() => window.open(url, "_blank")}
    />
  );
};


const getTimelineCaptions = (checkpoint, index, arr, t) => {
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint
  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    time: checkpoint?.auditDetails?.timing,
    name: checkpoint?.assigner?.name,
    mobileNumber: checkpoint?.assigner?.mobileNumber,
    source: checkpoint?.assigner?.source,
  }

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
            const fullImage = thumbnailsToShow.fullImage?.[idx] || src
            Digit.Utils.zoomImage(fullImage)
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          <div>
            <NOCDocument value={{ workflowDocs: wfDocuments }} index={index} />
          </div>
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        {caption.time && <p>{caption.time}</p>}
        {caption.date && <p>{caption.date}</p>}
        {caption.name && <p>{caption.name}</p>}
        {caption.mobileNumber && <p>{caption.mobileNumber}</p>}
        {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
      </div>
    </div>
  )
}


const LayoutApplicationOverview = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const history = useHistory()
  const tenantId = window.localStorage.getItem("CITIZEN.CITY")
  const stateCode = Digit.ULBService.getStateId();
const [viewTimeline, setViewTimeline] = useState(false);
  const [displayData, setDisplayData] = useState({})
  const [loading, setLoading] = useState(false);
  const state = Digit.ULBService.getStateId()

// const { isLoading, data } = Digit.Hooks.noc.useNOCSearchApplication({ applicationNo: id }, tenantId, );
  const { isLoading, data } = Digit.Hooks.obps.useLayoutSearchApplication({ applicationNo: id }, tenantId, { cacheTime: 0 })
  const applicationDetails = data?.resData
  const layoutDocuments = applicationDetails?.Layout?.[0]?.documents || [];

  // Helper function to find document by type and owner index
  // Searches in both API documents (documents array) and owner's additionalDetails
  const findOwnerDocument = (ownerIndex, docType) => {
    // First try to find from documents array
    if (layoutDocuments && layoutDocuments.length > 0) {
      let documentTypeKey = "";
      if (ownerIndex === 0) {
        documentTypeKey = `OWNER.${docType}`;
      } else {
        documentTypeKey = `OWNER.${docType}_${ownerIndex}`;
      }
      
      const doc = layoutDocuments.find((d) => d.documentType === documentTypeKey);
      if (doc?.uuid || doc?.fileStoreId) {
        return doc?.uuid || doc?.fileStoreId;
      }
    }

    // Then check owner's additionalDetails (same keys as LayoutSummary.js)
    const owners = applicationDetails?.Layout?.[0]?.owners || [];
    if (owners && owners[ownerIndex]?.additionalDetails) {
      if (docType === "OWNERPHOTO" && owners[ownerIndex]?.additionalDetails?.ownerPhoto) {
        return owners[ownerIndex]?.additionalDetails?.ownerPhoto;
      }
      if (docType === "OWNERVALIDID" && owners[ownerIndex]?.additionalDetails?.documentFile) {
        return owners[ownerIndex]?.additionalDetails?.documentFile;
      }
    }

    return null;
  };

  console.log("=== LayoutApplicationSummary Debug ===")
  console.log("Raw data from hook:", data)
  console.log("applicationDetails (data?.resData):", applicationDetails)
  console.log("Layout array:", applicationDetails?.Layout)
  console.log("First Layout object:", applicationDetails?.Layout?.[0])
  console.log("Owners array:", applicationDetails?.Layout?.[0]?.owners)
  console.log("Owners count:", applicationDetails?.Layout?.[0]?.owners?.length)
  console.log("=== End Debug ===")
  const usage = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.buildingCategory?.name

  const { data: storeData } = Digit.Hooks.useStore.getInitData()
  const { tenants } = storeData || {}

  let user = Digit.UserService.getUser()

  if (window.location.href.includes("/obps") || window.location.href.includes("/layout")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject")
    const userInfo = userInfos ? JSON.parse(userInfos) : {}
    user = userInfo?.value
  }

  const userRoles = user?.info?.roles?.map((e) => e.code)

  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const Property = applicationDetails?.Layout?.[0];
      const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
      const ulbType = tenantInfo?.city?.ulbType;
      const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo, ulbType, t);
      await Digit.Utils.pdf.generateFormatted(acknowledgementData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const layoutObject = applicationDetails?.Layout?.[0]

    console.log("=== useEffect for displayData ===")
    console.log("layoutObject:", layoutObject)
    console.log("layoutObject?.documents:", layoutObject?.documents)

    if (layoutObject) {
      const applicantDetails = layoutObject?.layoutDetails?.additionalDetails?.applicationDetails
      const siteDetails = layoutObject?.layoutDetails?.additionalDetails?.siteDetails
      const coordinates = layoutObject?.layoutDetails?.additionalDetails?.coordinates
      const Documents = layoutObject?.documents || []

      console.log("Documents array:", Documents)
      console.log("Documents length:", Documents.length)

      const finalDisplayData = {
        applicantDetails: applicantDetails ? [applicantDetails] : [],
        siteDetails: siteDetails ? [siteDetails] : [],
        coordinates: coordinates ? [coordinates] : [],
        Documents: Documents.length > 0 ? Documents : [],
      }

      console.log("finalDisplayData:", finalDisplayData)
      setDisplayData(finalDisplayData)
    }
  }, [applicationDetails?.Layout])

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "layout", // Changed from Layout_mcUp to LAYOUT to match employee side
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false },
  )

  const amountPaid = reciept_data?.Payments?.[0]?.totalAmountPaid

    const downloadSanctionLetter = async () => {
    const application = applicationDetails?.Layout?.[0];
    try {
      if (!application) {
        throw new Error("Layout Application data is missing");
      }
      //we will add sanctionLetter also
      //await getNOCSanctionLetter(application, t, amountPaid);
    } catch (error) {
      console.error("Sanction Letter download error:", error);
    }
  };


  const dowloadOptions = []
  if (applicationDetails?.Layout?.[0]?.applicationStatus === "APPROVED") {

    dowloadOptions.push({
      label: t("DOWNLOAD_CERTIFICATE"),
      onClick: handleDownloadPdf,
    });

    if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
      dowloadOptions.push({
        label: t("CHB_FEE_RECEIPT"),
        onClick: () => getRecieptSearch({ tenantId: state, payments: reciept_data?.Payments[0] }),
      });
    }
  }

  const getFloorLabel = (index) => {
    if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL")

    const floorNumber = index
    const lastDigit = floorNumber % 10
    const lastTwoDigits = floorNumber % 100

    let suffix = "th"
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      if (lastDigit === 1) suffix = "st"
      else if (lastDigit === 2) suffix = "nd"
      else if (lastDigit === 3) suffix = "rd"
    }

    return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`
  }

  const [showToast, setShowToast] = useState(null)
  const [displayMenu, setDisplayMenu] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [showOptions, setShowOptions] = useState(false)

  const menuRef = useRef()

  const closeToast = () => {
    setShowToast(null)
  }

  const closeMenu = () => {
    setDisplayMenu(false)
  }

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu)
  const businessServiceCode = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService || "";

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: businessServiceCode,
  })

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions]

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState =
      workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {}
    workflowDetails.data.actionState = { ...workflowDetails.data }
  }

  useEffect(() => {
    if (workflowDetails) {
      workflowDetails.revalidate()
    }

    if (data) {
      data.revalidate()
    }
  }, [])

  const actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles
    })

  function onActionSelect(action) {
    const appNo = applicationDetails?.Layout?.[0]?.applicationNo

    const payload = {
      Licenses: [action],
    }

    if (action?.action == "EDIT") {
      history.push(`/digit-ui/citizen/obps/layout/edit-application/${appNo}`)
    } else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" })
    } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload)
    } else if (action?.action == "PAY") {
      history.push(`/digit-ui/citizen/payment/collect/layout/${appNo}/${tenantId}?tenantId=${tenantId}`) // Changed from Layout_mcUp to LAYOUT
    } else {
      setSelectedAction(action)
    }
  }

  const submitAction = async (data) => {
    const payloadData = applicationDetails?.Layout?.[0] || {}
    console.log("payload data======> ",payloadData);



    const updatedApplicant = {
      ...payloadData,
      
      workflow: {},
    }

    const filtData = data?.Licenses?.[0]

    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: filtData?.wfDocuments,
    }

    const finalPayload = {
      Layout: { ...updatedApplicant },
    }

    try {
      const response = await Digit.OBPSService.LayoutUpdate({ tenantId, ...finalPayload })

      if (response?.ResponseInfo?.status === "successful") {
        if (filtData?.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" })
          workflowDetails.revalidate()
          setSelectedAction(null)
        } else {
          history.replace({
            pathname: `/digit-ui/citizen/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
            state: { data: response },
          })
        }
      } else {
        setShowToast({ key: "true", warning: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" })
        setSelectedAction(null)
      }
    } catch (err) {
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" })
    }
  }

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    try {
      setLoading(true);
      let response = null;
      const fee = payments?.totalAmountPaid;
      console.log("fee here here", fee);
      const amountinwords = amountToWords(fee);
      if (payments?.fileStoreId) {
        response = { filestoreIds: [payments?.fileStoreId] };
      } else {
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, amountinwords, usage }] }, "layout-receipt");
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response?.filestoreIds[0]], "_blank");
    } catch (error) {
      console.error("Sanction Letter download error:", error);
    } finally {
      setLoading(false);
    }
  }

  const getTimelineCaptions = (checkpoint, index, arr) => {
    const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint
    const caption = {
      date: checkpoint?.auditDetails?.lastModified,
      time: checkpoint?.auditDetails?.timing,
      name: checkpoint?.assigner?.name,
      mobileNumber: checkpoint?.assigner?.mobileNumber,
      source: checkpoint?.assigner?.source,
    }

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
              const fullImage = thumbnailsToShow.fullImage?.[idx] || src
              Digit.Utils.zoomImage(fullImage)
            }}
          />
        )}

        {wfDocuments?.length > 0 && (
          <div>
            <div>
              <NOCDocument value={{ workflowDocs: wfDocuments }} index={index} />
            </div>
          </div>
        )}

        <div style={{ marginTop: "8px" }}>
          {caption.time && <p>{caption.time}</p>}
          {caption.date && <p>{caption.date}</p>}
          {caption.name && <p>{caption.name}</p>}
          {caption.mobileNumber && <p>{caption.mobileNumber}</p>}
          {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
        </div>
      </div>
    )
  }


    const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };

  const RenderRow = ({ label, value }) => {
  if (!value) return null;
  return <Row label={label} text={value} />;
};


  if (isLoading || loading) {
    return <LoaderNew page={true} />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("Application Overview")}</Header>
         <LinkButton  label={t("VIEW_TIMELINE")} onClick={handleViewTimeline} />
        {loading && <Loader />}
        {dowloadOptions && dowloadOptions.length > 0 && (
          <div>

          <MultiLink
            className="multilinkWrapper"
            onHeadClick={() => setShowOptions(!showOptions)}
            displayOptions={showOptions}
            options={dowloadOptions}
          />

           </div>
        )}
      </div>
       

    {/* -------------------- APPLICANTS/OWNERS DETAILS -------------------- */}
    {applicationDetails?.Layout?.[0]?.owners && applicationDetails?.Layout?.[0]?.owners?.length > 0 && (
      <Card>
        <CardSubHeader>{t("Owners Details") || "Owners Details"}</CardSubHeader>
        {applicationDetails?.Layout?.[0]?.owners?.map((applicant, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <RenderRow label={`${index === 0 ? t("PRIMARY_OWNER") || "Primary Owner" : t("ADDITIONAL_OWNER") || "Additional Owner"} - ${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`} value={applicant?.name} />
              <RenderRow label={t("NOC_APPLICANT_EMAIL_LABEL")} value={applicant?.emailId} />
              <RenderRow label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} value={applicant?.fatherOrHusbandName} />
              <RenderRow label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} value={applicant?.mobileNumber} />
              <RenderRow label={t("NOC_APPLICANT_DOB_LABEL")} value={applicant?.dob ? new Date(applicant?.dob).toLocaleDateString() : ""} />
              <RenderRow label={t("NOC_APPLICANT_GENDER_LABEL")} value={applicant?.gender} />
              <RenderRow label={t("NOC_APPLICANT_ADDRESS_LABEL")} value={applicant?.permanentAddress} />
              <Row label={t("Photo") || "Photo"} text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERPHOTO")} stateCode={stateCode} t={t} />} />
              <Row label={t("ID Proof") || "ID Proof"} text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERVALIDID")} stateCode={stateCode} t={t} />} />
            </StatusTable>
          </div>
        ))}
      </Card>
    )}

 {/* -------------------- APPLICANT DETAILS -------------------- */}
    <Card>
      <CardSubHeader>{t("LAYOUT_APPLICANT_DETAILS")}</CardSubHeader>
      {displayData?.applicantDetails?.map((detail, index) => (
        <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
          <StatusTable>

            <RenderRow label={t("NOC_FIRM_OWNER_NAME_LABEL")} value={detail?.applicantOwnerOrFirmName} />
            <RenderRow label={t("NOC_APPLICANT_EMAIL_LABEL")} value={detail?.applicantEmailId} />
            <RenderRow label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} value={detail?.applicantFatherHusbandName} />
            <RenderRow label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} value={detail?.applicantMobileNumber} />
            <RenderRow label={t("NOC_APPLICANT_DOB_LABEL")} value={detail?.applicantDateOfBirth} />
            <RenderRow label={t("NOC_APPLICANT_GENDER_LABEL")} value={detail?.applicantGender?.code || detail?.applicantGender} />
            <RenderRow label={t("NOC_APPLICANT_ADDRESS_LABEL")} value={detail?.applicantAddress} />
            <RenderRow label={t("NOC_APPLICANT_PROPERTY_ID_LABEL")} value={detail?.applicantPropertyId} />

          </StatusTable>
        </div>
      ))}
    </Card>

    {/* -------------------- PROFESSIONAL DETAILS -------------------- */}
    {displayData?.applicantDetails?.[0]?.professionalName &&
      displayData?.applicantDetails?.map((detail, index) => (
        <Card key={index}>
          <CardSubHeader>{t("LAYOUT_PROFESSIONAL_DETAILS")}</CardSubHeader>
          <div style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>

              <RenderRow label={t("NOC_PROFESSIONAL_NAME_LABEL")} value={detail?.professionalName} />
              <RenderRow label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} value={detail?.professionalEmailId} />
              <RenderRow label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} value={detail?.professionalRegId} />
              <RenderRow label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} value={detail?.professionalMobileNumber} />
              <RenderRow label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} value={detail?.professionalAddress} />
              <RenderRow label={t("Registration Date")} value={detail?.professionalRegistrationValidity} />

            </StatusTable>
          </div>
        </Card>
      ))}

    {/* -------------------- SITE DETAILS -------------------- */}
    <Card>
      <CardSubHeader>{t("LAYOUT_SITE_DETAILS")}</CardSubHeader>
      {displayData?.siteDetails?.map((detail, index) => (
        <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
          <StatusTable>

            <RenderRow label={t("NOC_PLOT_NO_LABEL")} value={detail?.plotNo} />
            <RenderRow label={t("NOC_PROPOSED_SITE_ADDRESS")} value={detail?.proposedSiteAddress} />
            <RenderRow label={t("NOC_ULB_NAME_LABEL")} value={detail?.ulbName?.name || detail?.ulbName} />
            <RenderRow label={t("NOC_ULB_TYPE_LABEL")} value={detail?.ulbType} />
            <RenderRow label={t("NOC_KHASRA_NO_LABEL")} value={detail?.khasraNo} />
            <RenderRow label={t("NOC_HADBAST_NO_LABEL")} value={detail?.hadbastNo} />
            <RenderRow label={t("NOC_ROAD_TYPE_LABEL")} value={detail?.roadType?.name || detail?.roadType} />
            <RenderRow label={t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} value={detail?.areaLeftForRoadWidening} />
            <RenderRow label={t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} value={detail?.netPlotAreaAfterWidening} />
            <RenderRow label={t("NOC_NET_TOTAL_AREA_LABEL")} value={detail?.netTotalArea} />
            <RenderRow label={t("NOC_ROAD_WIDTH_AT_SITE_LABEL")} value={detail?.roadWidthAtSite} />

            {/* Building Status */}
            <RenderRow label={t("NOC_BUILDING_STATUS_LABEL")} value={detail?.buildingStatus?.name || detail?.buildingStatus} />

            {/* Basement Availability */}
            <RenderRow label={t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")} value={detail?.isBasementAreaAvailable?.code || detail?.isBasementAreaAvailable} />

            {/* Basement Area */}
            {detail?.buildingStatus === "Built Up" && (
              <RenderRow label={t("NOC_BASEMENT_AREA_LABEL")} value={detail?.basementArea} />
            )}

            {/* Floor Areas */}
            {detail?.buildingStatus === "Built Up" &&
              detail?.floorArea?.map((floor, idx) => (
                <RenderRow key={idx} label={getFloorLabel(idx)} value={floor?.value} />
              ))}

            {/* Total Floor Area */}
            {detail?.buildingStatus === "Built Up" && (
              <RenderRow label={t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL")} value={detail?.totalFloorArea} />
            )}

            <RenderRow label={t("NOC_DISTRICT_LABEL")} value={detail?.district?.name || detail?.district} />
            <RenderRow label={t("NOC_ZONE_LABEL")} value={detail?.zone?.name || detail?.zone} />
            <RenderRow label={t("NOC_SITE_WARD_NO_LABEL")} value={detail?.wardNo} />
            <RenderRow label={t("NOC_SITE_VILLAGE_NAME_LABEL")} value={detail?.villageName} />
            <RenderRow label={t("NOC_SITE_COLONY_NAME_LABEL")} value={detail?.colonyName} />
            <RenderRow label={t("NOC_SITE_VASIKA_NO_LABEL")} value={detail?.vasikaNumber} />
            <RenderRow label={t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")} value={detail?.khewatAndKhatuniNo} />

          </StatusTable>
        </div>
      ))}
    </Card>

    {/* -------------------- SPECIFICATIONS -------------------- */}
    <Card>
      <CardSubHeader>{t("LAYOUT_SPECIFICATION_DETAILS")}</CardSubHeader>
      {displayData?.siteDetails?.map((detail, index) => (
        <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
          <StatusTable>

            <RenderRow label={t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")} value={detail?.specificationPlotArea} />
            <RenderRow label={t("NOC_BUILDING_CATEGORY_LABEL")} value={detail?.specificationBuildingCategory?.name || detail?.specificationBuildingCategory} />
            <RenderRow label={t("LAYOUT_TYPE_LABEL")} value={detail?.specificationLayoutType?.name || detail?.specificationLayoutType} />
            <RenderRow label={t("NOC_RESTRICTED_AREA_LABEL")} value={detail?.specificationRestrictedArea?.code || detail?.specificationRestrictedArea} />
            <RenderRow label={t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")} value={detail?.specificationIsSiteUnderMasterPlan?.code || detail?.specificationIsSiteUnderMasterPlan} />

          </StatusTable>
        </div>
      ))}
    </Card>

        {/* 1️⃣ SITE COORDINATES CARD */}
        {displayData?.coordinates && displayData.coordinates.length > 0 && (
          <Card>
            <CardSubHeader>{t("LAYOUT_SITE_COORDINATES_LABEL")}</CardSubHeader>

            {displayData.coordinates.map((detail, index) => (
              <div
                key={index}
                style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}
              >
                <StatusTable>
                  <RenderRow label={t("COMMON_LATITUDE1_LABEL")} value={detail?.Latitude1} />
                  <RenderRow label={t("COMMON_LONGITUDE1_LABEL")} value={detail?.Longitude1} />
                  <RenderRow label={t("COMMON_LATITUDE2_LABEL")} value={detail?.Latitude2} />
                  <RenderRow label={t("COMMON_LONGITUDE2_LABEL")} value={detail?.Longitude2} />
                  <RenderRow label={t("COMMON_LATITUDE3_LABEL")} value={detail?.Latitude3} />
                  <RenderRow label={t("COMMON_LONGITUDE3_LABEL")} value={detail?.Longitude3} />
                  <RenderRow label={t("COMMON_LATITUDE4_LABEL")} value={detail?.Latitude4} />
                  <RenderRow label={t("COMMON_LONGITUDE4_LABEL")} value={detail?.Longitude4} />
                </StatusTable>
              </div>
            ))}
          </Card>
        )}

        {/* 2️⃣ DOCUMENTS CARD */}
        {displayData?.Documents && displayData.Documents.length > 0 && (
          <Card>
            <CardSubHeader>{t("LAYOUT_DOCUMENTS_UPLOADED")}</CardSubHeader>
            <StatusTable>
              <LayoutDocumentView documents={displayData.Documents} />
            </StatusTable>
          </Card>
        )}

        {/* 3️⃣ FEE DETAILS CARD */}
        {applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails && (
          <Card>
            <CardSubHeader>{t("LAYOUT_FEE_DETAILS_LABEL")}</CardSubHeader>

            <LayoutFeeEstimationDetails
              formData={{
                apiData: { ...applicationDetails },
                applicationDetails: {
                  ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails,
                },
                siteDetails: {
                  ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails,
                },
              }}
            />
          </Card>
        )}


      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />

      {actions && actions.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_${"LAYOUT"}`}
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
            />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}

      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          isDleteBtn={true}
          onClose={closeToast}
        />
      )}
    </div>
  )
}

export default LayoutApplicationOverview