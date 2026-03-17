import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LinkButton } from "@mseva/digit-ui-react-components";

import { LOCALIZATION_KEY } from "../../constants/Localization";

import {
  Card,
  Header,
  CardSubHeader,
  StatusTable,
  Row,
  TextArea,
  SubmitBar,
  DisplayPhotos,
  ImageViewer,
  Loader,
  Toast,
} from "@mseva/digit-ui-react-components";

import TimeLine from "../../components/TimeLine";

const WorkflowComponent = ({ complaintDetails, id, getWorkFlow, zoomImage }) => {
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || complaintDetails.service.tenantId;
  let workFlowDetails = Digit.Hooks.useWorkflowDetails({ tenantId: tenantId, id, moduleCode: "SWACH" });
  // const { data: ComplainMaxIdleTime, isLoading: ComplainMaxIdleTimeLoading } = Digit.Hooks.swach.useMDMS.ComplainClosingTime(tenantId?.split(".")[0]);

  // useEffect(() => {
  //   getWorkFlow(workFlowDetails.data);
  // }, []);
  useEffect(() => {
    if (workFlowDetails) {
      const { data: { timeline: complaintTimelineData } = {} } = workFlowDetails;
      if (complaintTimelineData) {
        // const actionByCitizenOnComplaintCreation = complaintTimelineData;

        const { thumbnailsToShow } = complaintTimelineData?.[0];
        thumbnailsToShow ? getWorkFlow(thumbnailsToShow) : null;
      }
    }
  }, [workFlowDetails]);

  useEffect(() => {
    workFlowDetails.revalidate();
  }, []);

  return (
    !workFlowDetails.isLoading && (
      <TimeLine
        // isLoading={workFlowDetails.isLoading}
        data={workFlowDetails.data}
        serviceRequestId={id}
        complaintWorkflow={complaintDetails.workflow}
        rating={complaintDetails.audit.rating}
        zoomImage={zoomImage}
        complaintDetails={complaintDetails}
        // ComplainMaxIdleTime={ComplainMaxIdleTime}
      />
    )
  );
};

const ComplaintDetailsPage = (props) => {
  let { t } = useTranslation();
  let { id } = useParams();

  let tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId(); // ToDo: fetch from state
  const { isLoading, error, isError, complaintDetails, revalidate } = Digit.Hooks.swach.useComplaintDetails({ tenantId, id });

  const [imageShownBelowComplaintDetails, setImageToShowBelowComplaintDetails] = useState({});

  const [imageZoom, setImageZoom] = useState(null);

  const [comment, setComment] = useState("");

  const [toast, setToast] = useState(false);

  const [commentError, setCommentError] = useState(null);

  const [disableComment, setDisableComment] = useState(true);

  const [loader, setLoader] = useState(false);
  const [viewTimeline, setViewTimeline] = useState(false);
  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);
  const localityCode = complaintDetails?.details?.ES_CREATECOMPLAINT_ADDRESS?.locality?.code;
  const localityObj = localities?.find((loc) => loc?.code == localityCode);
  const localityName = localityObj?.name || "";
  const city = complaintDetails?.details?.ES_CREATECOMPLAINT_ADDRESS?.city || "";
  const pincode = complaintDetails?.details?.ES_CREATECOMPLAINT_ADDRESS?.pincode || "";

  const addressText = [localityName, city, pincode]?.filter(Boolean).join(", ");
  // useEffect(()=>{
  //   console.log("imageShownBelowComplaintDetails",imageShownBelowComplaintDetails);
  // },[imageShownBelowComplaintDetails])

  useEffect(() => {
    (async () => {
      if (complaintDetails) {
        setLoader(true);
        await revalidate();
        setLoader(false);
      }
    })();
  }, []);

  function zoomImage(imageSource, index) {
    setImageZoom(imageSource);
  }
  function zoomImageWrapper(imageSource, index) {
    zoomImage(imageShownBelowComplaintDetails?.fullImage[index]);
  }

  function onCloseImageZoom() {
    setImageZoom(null);
  }

  const handleViewTimeline = () => {
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth" });
    }
    setViewTimeline(true);
  };
  // const onWorkFlowChange = (data) => {
  //   let timeline = data?.timeline;
  //   timeline && timeline[0].timeLineActions?.filter((e) => e === "COMMENT").length ? setDisableComment(false) : setDisableComment(true);
  //   if (timeline) {
  //     const actionByCitizenOnComplaintCreation = timeline.find((e) => e?.performedAction === "APPLY");
  //     if(actionByCitizenOnComplaintCreation){
  //       const { thumbnailsToShow } = actionByCitizenOnComplaintCreation;
  //       setImageToShowBelowComplaintDetails(thumbnailsToShow);
  //     }
  //   }
  // };

  const submitComment = async () => {
    let detailsToSend = { ...complaintDetails };
    delete detailsToSend.audit;
    delete detailsToSend.details;
    detailsToSend.workflow = { action: "COMMENT", comments: comment };
    let tenantId = Digit.ULBService.getCurrentTenantId();
    try {
      setCommentError(null);
      const res = await Digit.SwachService.update(detailsToSend, tenantId);
      if (res.ServiceWrappers.length) setComment("");
      else throw true;
    } catch (er) {
      setCommentError(true);
    }
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 30000);
  };

  if (isLoading || loader) {
    return <Loader />;
  }

  if (isError) {
    return <h2>Error</h2>;
  }

  return (
    <React.Fragment>
      <div className="complaint-summary">
        <div className="swach-comp-detils-citizen-header">
          <Header>{t(`${LOCALIZATION_KEY.CS_HEADER}_COMPLAINT_SUMMARY`)}</Header>
          <div>
            <LinkButton label={t("VIEW_TIMELINE")} onClick={handleViewTimeline}></LinkButton>
          </div>
        </div>
        {Object.keys(complaintDetails).length > 0 ? (
          <React.Fragment>
            <Card>
              <CardSubHeader>{t(`SERVICEDEFS.${complaintDetails.audit.serviceCode.toUpperCase()}`)}</CardSubHeader>
              <StatusTable>
                {Object.keys(complaintDetails.details)
                  .filter((k) => k !== "ES_CREATECOMPLAINT_ADDRESS")
                  .map((flag, index, arr) => (
                    <Row
                      key={index}
                      label={t(flag)}
                      text={
                        Array.isArray(complaintDetails.details[flag])
                          ? complaintDetails.details[flag].map((val) => (typeof val === "object" ? t(val?.code) : t(val)))
                          : t(complaintDetails.details[flag]) || "N/A"
                      }
                      // last={index === arr.length - 1}
                    />
                  ))}
                <Row label={t("ES_CREATECOMPLAINT_ADDRESS")} text={addressText} />
              </StatusTable>
              <h1 className="swach-comp-detils-maps-link">
                <a
                  href={`https://www.google.com/maps?q=${complaintDetails?.service?.address?.geoLocation?.latitude},${complaintDetails?.service?.address?.geoLocation?.longitude}`}
                  rel="noopener noreferrer"
                >
                  View Location on Google Maps
                </a>
              </h1>
              {imageShownBelowComplaintDetails?.thumbs ? (
                <DisplayPhotos srcs={imageShownBelowComplaintDetails?.thumbs} onClick={(source, index) => zoomImageWrapper(source, index)} />
              ) : null}
              {imageZoom ? <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} /> : null}
            </Card>
            <Card>
              <div id="timeline">
                {complaintDetails?.service && (
                  // <WorkflowComponent getWorkFlow={onWorkFlowChange} complaintDetails={complaintDetails} id={id} zoomImage={zoomImage} />
                  <WorkflowComponent
                    getWorkFlow={setImageToShowBelowComplaintDetails}
                    complaintDetails={complaintDetails}
                    id={id}
                    zoomImage={zoomImage}
                  />
                )}
              </div>
            </Card>
            {/* <Card>
      <CardSubHeader>{t(`${LOCALIZATION_KEY.CS_COMMON}_COMMENTS`)}</CardSubHeader>
      <TextArea value={comment} onChange={(e) => setComment(e.target.value)} name="" />
      <SubmitBar disabled={disableComment || comment.length < 1} onSubmit={submitComment} label={t("CS_PGR_SEND_COMMENT")} />
    </Card> */}
            {toast && (
              <Toast
                error={commentError}
                label={!commentError ? t(`CS_COMPLAINT_COMMENT_SUCCESS`) : t(`CS_COMPLAINT_COMMENT_ERROR`)}
                onClose={() => setToast(false)}
              />
            )}{" "}
          </React.Fragment>
        ) : (
          <Loader />
        )}
      </div>
    </React.Fragment>
  );
};

export default ComplaintDetailsPage;
