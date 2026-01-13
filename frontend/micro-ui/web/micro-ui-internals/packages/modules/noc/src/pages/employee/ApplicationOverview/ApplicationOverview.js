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
  DisplayPhotos,
  Toast,
  ConnectingCheckPoints,
  CheckPoint,
  Table,
  Modal
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef,useMemo  } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import NOCDocument from "../../../pageComponents/NOCDocument";
import NOCModal from "../../../pageComponents/NOCModal";
import NOCDocumentTableView from "../../../pageComponents/NOCDocumentTableView";
import NOCFeeEstimationDetails from "../../../pageComponents/NOCFeeEstimationDetails";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import NOCImageView from "../../../pageComponents/NOCImageView";
import { SiteInspection } from "../../../pageComponents/SiteInspection";
import CustomLocationSearch from "../../../components/CustomLocationSearch";


const getTimelineCaptions = (checkpoint, index, arr, t) => {
  console.log("checkpoint here", checkpoint);
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
  console.log("wfDocuments", wfDocuments);
  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    time: checkpoint?.auditDetails?.timing,
    name: checkpoint?.assigner?.name,
    mobileNumber: checkpoint?.assigner?.mobileNumber,
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
  );
};

const NOCEmployeeApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const history = useHistory();
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorToast, setShowErrorToastt] = useState(null);
  const [errorOne, setErrorOne] = useState(null);
  const [displayData, setDisplayData] = useState({});

  const [getEmployees, setEmployees] = useState([]);
  const [getLoader, setLoader] = useState(false);
  const [getWorkflowService, setWorkflowService] = useState([]);
  const [feeAdjustments, setFeeAdjustments] = useState([]);
  const { isLoading, data, refetch  } = Digit.Hooks.noc.useNOCSearchApplication({ applicationNo: id }, tenantId);
  const loading = isLoading || getLoader;
  const applicationDetails = data?.resData;
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const isMobile = window?.Digit?.Utils?.browser?.isMobile();
  const [siteImages, setSiteImages] = useState(applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.siteImages ? {
      documents: applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.siteImages
  } : {})

  console.log("applicationDetails here==>", applicationDetails);

  const businessServiceCode = applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.businessService ?? null;
   console.log("businessService here==>", businessServiceCode);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: businessServiceCode,//businessService
  });

  console.log("workflowDetails here=>", workflowDetails);

  const geoLocations = useMemo(() => {
    if (siteImages?.documents && siteImages?.documents.length > 0) {
      return siteImages?.documents?.map((img) => {
        return {
          latitude: img?.latitude || "",
          longitude: img?.longitude || "",
        }
      })
    }
  }, [siteImages]);

  
  const documentData = useMemo(() => siteImages?.documents?.map((value, index) => ({
    title: value?.documentType,
    fileStoreId: value?.filestoreId,
  })), [siteImages])

  const documentsColumnsSiteImage = [
    {
      Header: t("BPA_SITES"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t(" "),
      accessor: "fileStoreId",
      Cell: ({ value }) => {
        return value ? (
          <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeToImage(value)}
          />
        ) : (
          t("CS_NA")
        )
      },
    }
  ];

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

    const Close = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );

  const CloseBtn = (props) => {
    return (
      <div className="icon-bg-secondary" onClick={props.onClick}>
        <Close />
      </div>
    );
  };
  useEffect(() => {
      if (isLoading || !tenantId || !businessServiceCode) return;

      (async () => {
        try{
        setLoader(true);
        const wf = await Digit.WorkflowService.init(tenantId, businessServiceCode);
        console.log("wf=>", wf);
        setLoader(false);
        setWorkflowService(wf?.BusinessServices?.[0]?.states);
        }catch(e){
         console.error("Error Occurred", e);
        }finally{
          setLoader(false);
        }
      })();
  }, [tenantId, businessServiceCode, isLoading]);

 useEffect(() => {
  const latestCalc = applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.calculations?.find((c) => c.isLatest);
  const apiEstimates = data?.Calculation?.[0]?.taxHeadEstimates || [];
  if (apiEstimates.length === 0) return;

  setFeeAdjustments((prev = []) => {
    // build prev map
    const prevByTax = (prev || []).reduce((acc, it) => {
      if (it?.taxHeadCode) acc[it.taxHeadCode] = it;
      return acc;
    }, {});

    // build merged but keep prev edited rows
    const merged = apiEstimates.map((tax) => {
      const saved = latestCalc?.taxHeadEstimates?.find((c) => c.taxHeadCode === tax.taxHeadCode);
      const prevItem = prevByTax[tax.taxHeadCode] || {};
      const isEdited = !!prevItem.edited;

      return {
        taxHeadCode: tax.taxHeadCode,
        category: tax.category,
        adjustedAmount: isEdited ? prevItem.adjustedAmount : tax.estimateAmount ?? saved?.estimateAmount ?? 0,
        remark: isEdited ? prevItem.remark ?? "" : tax.remarks ?? saved?.remarks ?? "",
        filestoreId: prevItem?.filestoreId !== undefined ? prevItem.filestoreId : tax.filestoreId ?? saved?.filestoreId ?? null,
        onDocumentLoading: false,
        documentError: null,
        edited: prevItem.edited ?? false,
      };
    });

    return merged;
  });
}, [applicationDetails, data]);


  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewTimeline, setViewTimeline] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const closeToastOne = () => {
    setShowErrorToastt(null);
  };

  //   const { data: storeData } = Digit.Hooks.useStore.getInitData();
  //   const { tenants } = storeData || {};

  let user = Digit.UserService.getUser();
  const menuRef = useRef();

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);

  useEffect(() => {
    if (workflowDetails) {
      workflowDetails.revalidate();
    }

    if (data) {
      data.revalidate();
    }
  }, []);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("actions here", actions);

  useEffect(() => {
    const nocObject = applicationDetails?.Noc?.[0];

    if (nocObject) {
      const applicantDetails = nocObject?.nocDetails?.additionalDetails?.applicationDetails;

      const siteDetails = nocObject?.nocDetails?.additionalDetails?.siteDetails;

      const coordinates = nocObject?.nocDetails?.additionalDetails?.coordinates;

      const Documents = nocObject?.documents || [];

      const ownerPhotoList = nocObject?.nocDetails?.additionalDetails?.ownerPhotos || [];

      //console.log("applicantDetails",applicantDetails);
      //console.log("siteDetails", siteDetails);

      const finalDisplayData = {
        applicantDetails: applicantDetails ? [applicantDetails] : [],
        siteDetails: siteDetails ? [siteDetails] : [],
        coordinates: coordinates ? [coordinates] : [],
        Documents: Documents.length > 0 ? Documents : [],
        ownerPhotoList: ownerPhotoList,
      };

      setDisplayData(finalDisplayData);
      const siteImagesFromData = nocObject?.nocDetails?.additionalDetails?.siteImages

      setSiteImages(siteImagesFromData? { documents: siteImagesFromData } : {});
    }
  }, [applicationDetails?.Noc]);

  function routeToImage(filestoreId) {
    getUrlForDocumentView(filestoreId)
  }
  
  const getUrlForDocumentView = async (filestoreId) => {
    if (filestoreId?.length === 0) return;
    try {
      const result = await Digit.UploadServices.Filefetch([filestoreId], state);
      if (result?.data) {
        const fileUrl = result.data[filestoreId];
        if (fileUrl) {
          // window.open(fileUrl, "_blank");
          if(!isMobile){
            window.open(fileUrl, "_blank");
          }else{
            setShowImageModal(true);
            setImageUrl(fileUrl);            
          }         
        } else {
          // if (props?.setError) {
          //   props?.setError(t("CS_FILE_FETCH_ERROR"));
          // } else {
            console.error(t("CS_FILE_FETCH_ERROR"))
          // }
        }
      } else {
        // if (props?.setError) {
        //   props?.setError(t("CS_FILE_FETCH_ERROR"));
        // } else {
          console.error(t("CS_FILE_FETCH_ERROR"))
        // }
      }
    } catch (e) {
      // if (props?.setError) {
      //   props?.setError(t("CS_FILE_FETCH_ERROR"));
      // } else {
        console.error(t("CS_FILE_FETCH_ERROR"))
      // }
    }
  }

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageUrl(null);
  }
  function onActionSelect(action) {
    console.log("selected action", action);
    const appNo = applicationDetails?.Noc?.[0]?.applicationNo;

    const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);
    setEmployees(filterRoles?.[0]?.actions);

    const payload = {
      Licenses: [action],
    };

    if (action?.action == "EDIT") {
      history.push(`/digit-ui/employee/noc/edit-application/${appNo}`);
    } else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" });
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
    } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      history.push(`/digit-ui/employee/payment/collect/obpas_noc/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else {
      if(applicationDetails?.Noc?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" && action?.action == "FORWARD" && (!siteImages?.documents || siteImages?.documents?.length < 4)){
        setShowToast({ key: "true", error: true, message: "Please_Add_Site_Images_With_Geo_Location" });
        return;
      }
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const isFeeDisabled = applicationDetails?.Noc?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS";
  const submitAction = async (data) => {
    const payloadData = applicationDetails?.Noc?.[0] || {};

    if (!isFeeDisabled) {
    const hasNonZeroFee = (feeAdjustments || []).some((row) => (row.adjustedAmount ?? 0) > 0);   
    const allRemarksFilled = (feeAdjustments || []).every((row) => !row.edited || (row.remark && row.remark.trim() !== ""));
    if (!hasNonZeroFee) {
      setShowToast({ key: "true", error: true, message: "Please enter a fee amount before submission." });
      return;
    }

    if (!allRemarksFilled) {
      setShowToast({ key: "true", error: true, message: "Remarks are mandatory for all fee rows." });
      return;
    }
  }
    // console.log("data ==>", data);

    const newCalculation = {
      isLatest: true,
      updatedBy: Digit.UserService.getUser()?.info?.name,
      taxHeadEstimates: feeAdjustments
        .filter((row) => row.taxHeadCode !== "NOC_TOTAL") 
        .map((row) => ({
          taxHeadCode: row.taxHeadCode,
          estimateAmount: row.adjustedAmount ?? 0,          category: row.category,
          remarks: row.remark || null,
          filestoreId: row.filestoreId || null,
        })),
    };



    const oldCalculations = (payloadData?.nocDetails?.additionalDetails?.calculations || [])
    .map(c => ({ ...c, isLatest: false }));

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
      nocDetails: {
        ...payloadData.nocDetails,
        additionalDetails: { 
          ...payloadData.nocDetails.additionalDetails, 
          calculations: [...oldCalculations, newCalculation],
          siteImages: siteImages?.documents || []
         },
      },
    };

    const filtData = data?.Licenses?.[0];
    //console.log("filtData", filtData);

    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: filtData?.wfDocuments,
    };

    // console.log("updatedApplicant", updatedApplicant);

    const finalPayload = {
      Noc: { ...updatedApplicant },
    };

    console.log("final Payload ", finalPayload);

    try {
      const response = await Digit.NOCService.NOCUpdate({ tenantId, details: finalPayload });
      if (response?.ResponseInfo?.status === "successful") {
        if (filtData?.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
          setTimeout(() => {
            history.push("/digit-ui/employee/noc/inbox");
          }, 3000);
        } else if (filtData?.action === "APPLY" || filtData?.action === "RESUBMIT" || filtData?.action === "DRAFT") {
          //Else If case for "APPLY" or "RESUBMIT" or "DRAFT"
          console.log("We are calling employee response page");
          history.replace({
            pathname: `/digit-ui/employee/noc/response/${response?.Noc?.[0]?.applicationNo}`,
            state: { data: response },
          });
        } else {
          //Else case for "VERIFY" or "APPROVE" or "SENDBACKTOCITIZEN" or "SENDBACKTOVERIFIER"
          setShowToast({ key: "true", success: true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          workflowDetails.revalidate();
          refetch();
          setFeeAdjustments(prev => (prev || []).map(p => ({ ...p, edited: false })));
          setSelectedAction(null);
          setTimeout(() => {
            history.push("/digit-ui/employee/noc/inbox");
          }, 3000);
        }
      } else {
        setShowToast({ key: "true", warning: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
        setSelectedAction(null);
      }
    } catch (err) {
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    } finally {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
    }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  const getFloorLabel = (index) => {
    if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");

    const floorNumber = index;
    const lastDigit = floorNumber % 10;
    const lastTwoDigits = floorNumber % 100;

    let suffix = "th";
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      if (lastDigit === 1) suffix = "st";
      else if (lastDigit === 2) suffix = "nd";
      else if (lastDigit === 3) suffix = "rd";
    }

    return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`;
  };

  if (loading) {
    return <Loader />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };
  console.log("displayData here", displayData);

  return (
    <div className={"employee-main-application-details"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("NOC_APP_OVER_VIEW_HEADER")}</Header>
        <LinkButton  label={t("VIEW_TIMELINE")} onClick={handleViewTimeline} />
        
      </div>

      <Card>
        <CardSubHeader>{t("OWNER_OWNERPHOTO")}</CardSubHeader>
        <NOCImageView
          ownerFileStoreId={displayData?.ownerPhotoList?.[0]?.filestoreId}
          ownerName={displayData?.applicantDetails?.[0]?.owners?.[0]?.ownerOrFirmName}
        />
      </Card>

      {displayData?.applicantDetails?.[0]?.owners?.map((detail, index) => (
        <React.Fragment>
          <Card>
            <CardSubHeader>{index === 0 ? t("NOC_PRIMARY_OWNER") : `OWNER ${index + 1}`}</CardSubHeader>
            <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
              <StatusTable>
                <Row label={t("NOC_OWNER_TYPE_LABEL")} text={detail?.ownerType?.i18nKey ? t(detail?.ownerType?.i18nKey) : "N/A"} />
                <Row label={t("NOC_FIRM_OWNER_NAME_LABEL")} text={detail?.ownerOrFirmName || "N/A"} />
                <Row label={t("NOC_APPLICANT_EMAIL_LABEL")} text={detail?.emailId || "N/A"} />
                <Row label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={detail?.fatherOrHusbandName || "N/A"} />
                <Row label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} text={detail?.mobileNumber || "N/A"} />
                <Row label={t("NOC_APPLICANT_DOB_LABEL")} text={formatDate(detail?.dateOfBirth) || "N/A"} />
                <Row label={t("NOC_APPLICANT_GENDER_LABEL")} text={detail?.gender?.code || detail?.gender || "N/A"} />
                <Row label={t("NOC_APPLICANT_ADDRESS_LABEL")} text={detail?.address || "N/A"} />
                <Row label={t("NOC_APPLICANT_PROPERTY_ID_LABEL")} text={detail?.propertyId || "N/A"} />
              </StatusTable>
            </div>
          </Card>
        </React.Fragment>
      ))}

      {displayData?.applicantDetails?.some((detail) => detail?.professionalName?.trim()?.length > 0) &&
        displayData?.applicantDetails?.map((detail, index) => (
          <React.Fragment>
            <Card>
              <CardSubHeader>{t("NOC_PROFESSIONAL_DETAILS")}</CardSubHeader>
              <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
                <StatusTable>
                  <Row label={t("NOC_PROFESSIONAL_NAME_LABEL")} text={detail?.professionalName || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} text={detail?.professionalEmailId || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={detail?.professionalRegId || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} text={detail?.professionalMobileNumber || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} text={detail?.professionalAddress || "N/A"} />
                </StatusTable>
              </div>
            </Card>
          </React.Fragment>
        ))}

      <Card>
        <CardSubHeader>{t("NOC_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PLOT_NO_LABEL")} text={detail?.plotNo || "N/A"} />
              <Row label={t("NOC_PROPOSED_SITE_ADDRESS")} text={detail?.proposedSiteAddress || "N/A"} />
              <Row label={t("NOC_ULB_NAME_LABEL")} text={detail?.ulbName?.name || detail?.ulbName || "N/A"} />
              <Row label={t("NOC_ULB_TYPE_LABEL")} text={detail?.ulbType || "N/A"} />
              <Row label={t("NOC_KHASRA_NO_LABEL")} text={detail?.khasraNo || "N/A"} />
              <Row label={t("NOC_HADBAST_NO_LABEL")} text={detail?.hadbastNo || "N/A"} />
              <Row label={t("NOC_ROAD_TYPE_LABEL")} text={detail?.roadType?.name || detail?.roadType || "N/A"} />
              <Row label={t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={detail?.areaLeftForRoadWidening || "N/A"} />
              <Row label={t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={detail?.netPlotAreaAfterWidening || "N/A"} />
              <Row label={t("NOC_NET_TOTAL_AREA_LABEL")} text={detail?.netTotalArea || "N/A"} />
              <Row label={t("NOC_ROAD_WIDTH_AT_SITE_LABEL")} text={detail?.roadWidthAtSite || "N/A"} />
              <Row label={t("NOC_BUILDING_STATUS_LABEL")} text={detail?.buildingStatus?.name || detail?.buildingStatus || "N/A"} />

              {/* <Row label={t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")} text={detail?.isBasementAreaAvailable?.code || detail?.isBasementAreaAvailable || "N/A"} /> */}

              {detail?.isBasementAreaAvailable && (
                <Row
                  label={t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")}
                  text={detail?.isBasementAreaAvailable?.code || detail?.isBasementAreaAvailable || "N/A"}
                />
              )}

              {detail?.buildingStatus == "Built Up" && <Row label={t("NOC_BASEMENT_AREA_LABEL")} text={detail?.basementArea || "N/A"} />}

              {detail?.buildingStatus == "Built Up" &&
                detail?.floorArea?.map((floor, index) => <Row label={getFloorLabel(index)} text={floor.value || "N/A"} />)}

              {detail?.buildingStatus == "Built Up" && (
                <Row label={t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL")} text={detail?.totalFloorArea || "N/A"} />
              )}

              <Row label={t("NOC_DISTRICT_LABEL")} text={detail?.district?.name || detail?.district || "N/A"} />
              <Row label={t("NOC_ZONE_LABEL")} text={detail?.zone?.name || detail?.zone || "N/A"} />
              <Row label={t("NOC_SITE_WARD_NO_LABEL")} text={detail?.wardNo || "N/A"} />
              <Row label={t("NOC_SITE_VILLAGE_NAME_LABEL")} text={detail?.villageName || "N/A"} />

              <Row label={t("NOC_SITE_COLONY_NAME_LABEL")} text={detail?.colonyName || "N/A"} />
              <Row label={t("NOC_SITE_VASIKA_NO_LABEL")} text={detail?.vasikaNumber || "N/A"} />
              <Row label={t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")} text={detail?.khewatAndKhatuniNo || "N/A"} />
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
              <Row
                label={t("NOC_BUILDING_CATEGORY_LABEL")}
                text={detail?.specificationBuildingCategory?.name || detail?.specificationBuildingCategory || "N/A"}
              />

              <Row label={t("NOC_NOC_TYPE_LABEL")} text={detail?.specificationNocType?.name || detail?.specificationNocType || "N/A"} />
              <Row
                label={t("NOC_RESTRICTED_AREA_LABEL")}
                text={detail?.specificationRestrictedArea?.code || detail?.specificationRestrictedArea || "N/A"}
              />
              <Row
                label={t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")}
                text={detail?.specificationIsSiteUnderMasterPlan?.code || detail?.specificationIsSiteUnderMasterPlan || "N/A"}
              />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_SITE_COORDINATES_LABEL")}</CardSubHeader>
        {displayData?.coordinates?.map((detail, index) => {
          // Find matching documents for this coordinate block
          const sitePhotos = displayData?.Documents?.filter(
            (doc) => doc.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc.documentType === "OWNER.SITEPHOTOGRAPHTWO"
          );

          return (
            <div
              key={index}
              style={{
                marginBottom: "30px",
                background: "#FAFAFA",
                padding: "16px",
                borderRadius: "4px",
              }}
            >
              <StatusTable>
                <Row label={t("COMMON_LATITUDE1_LABEL")} text={detail?.Latitude1 || "N/A"} />
                <Row label={t("COMMON_LONGITUDE1_LABEL")} text={detail?.Longitude1 || "N/A"} />

                <Row label={t("COMMON_LATITUDE2_LABEL")} text={detail?.Latitude2 || "N/A"} />
                <Row label={t("COMMON_LONGITUDE2_LABEL")} text={detail?.Longitude2 || "N/A"} />
              </StatusTable>

              {/* Render images for site photographs */}
              {sitePhotos?.map((photo, idx) => (
                <div key={photo.uuid}>
                  <NOCImageView ownerFileStoreId={photo.documentAttachment} ownerName={photo.documentType || `Site Photo ${idx + 1}`} />
                </div>
              ))}
            </div>
          );
        })}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_UPLOADED_OWNER_ID")}</CardSubHeader>
        <StatusTable>
          {applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.ownerIds?.length > 0 && (
            <NOCDocumentTableView documents={applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.ownerIds} />
          )}
        </StatusTable>
      </Card>

      {/* <Card>
        <CardSubHeader>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <div style={{ display: "flex", gap: "16px" }}>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NOCDocument value={{ workflowDocs: displayData?.Documents }} />
          ) : (
            <div>{t("NOC_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card> */}

      <Card>
        <CardSubHeader>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <StatusTable>{displayData?.Documents?.length > 0 && <NOCDocumentTableView documents={displayData.Documents} />}</StatusTable>
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_FEE_DETAILS_LABEL")}</CardSubHeader>
        {applicationDetails?.Noc?.[0]?.nocDetails && (
          <NOCFeeEstimationDetails
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.siteDetails },
              calculations: applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.calculations || []
            }}
            feeAdjustments={feeAdjustments}
            setFeeAdjustments={setFeeAdjustments}
            disable={applicationDetails?.Noc?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS"}
          />
        )}
      </Card>

      {/* {workflowDetails?.data?.timeline && (
        <Card>
          <CardSubHeader>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
          {workflowDetails?.data?.timeline.length === 1 ? (
            <CheckPoint isCompleted={true} label={t(workflowDetails?.data?.timeline[0]?.status)} />
          ) : (
            <ConnectingCheckPoints>
              {workflowDetails?.data?.timeline.map((checkpoint, index, arr) => (
                <CheckPoint
                  keyValue={index}
                  isCompleted={index === 0}
                  label={t("NOC_STATUS_" + checkpoint.status)}
                  customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                />
              ))}
            </ConnectingCheckPoints>
          )}
        </Card>
      )} */}


      {
              applicationDetails?.Noc?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" && (user?.info?.roles.filter(role => role.code === "OBPAS_NOC_JE" || role.code === "OBPAS_NOC_BI")).length > 0 &&
              <Card>
                <div id="fieldInspection"></div>
                <SiteInspection siteImages={siteImages} setSiteImages={setSiteImages} geoLocations={geoLocations} customOpen={routeToImage} />
              </Card>
            }
            {
                applicationDetails?.Noc?.[0]?.applicationStatus !== "FIELDINSPECTION_INPROGRESS" && siteImages?.documents?.length > 0 && <Card>
                  <CardSectionHeader style={{ marginTop: "20px" }}>{t("BPA_FIELD_INSPECTION_UPLOADED_DOCUMENTS")}</CardSectionHeader>
                  <Table
                    className="customTable table-border-style"
                    t={t}
                    data={documentData}
                    columns={documentsColumnsSiteImage}
                    getCellProps={() => ({ style: {} })}
                    disableSort={false}
                    autoSort={true}
                    manualPagination={false}
                    isPaginationRequired={false}
                  />
                  {geoLocations?.length > 0 &&
                      <React.Fragment>
                      <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("SITE_INSPECTION_IMAGES_LOCATIONS")}</CardSectionHeader>
                      <CustomLocationSearch position={geoLocations}/>
                      </React.Fragment>
                  }
                </Card>
              }
      

      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />

      {actions?.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_${"NOC"}`}
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
              // style={MenuStyle}
            />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}


    {showImageModal && <Modal
        headerBarEnd={<CloseBtn onClick={closeImageModal} />}
      >
        {/* <img src={imageUrl} alt="Site Inspection" style={{ width: "100%", height: "100%" }} /> */}
        {imageUrl?.toLowerCase().endsWith(".pdf") ? (
          <a style={{ color: "blue" }} href={imageUrl} target="_blank" rel="noopener noreferrer">{t("CS_VIEW_DOCUMENT")}</a>
        ) : (
          <img
            src={imageUrl}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        )}
      </Modal>}

      {showModal ? (
        <NOCModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          getEmployees={getEmployees}
          id={id}
          applicationDetails={applicationDetails}
          applicationData={applicationDetails?.Noc}
          closeModal={closeModal}
          submitAction={submitAction}
          actionData={workflowDetails?.data?.timeline}
          workflowDetails={workflowDetails}
          showToast={showToast}
          setShowToast={setShowToast}
          closeToast={closeToast}
          errors={error}
          showErrorToast={showErrorToast}
          errorOne={errorOne}
          closeToastOne={closeToastOne}
        />
      ) : null}

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}

      {loading && <Loader />}
    </div>
  );
};

export default NOCEmployeeApplicationOverview;
