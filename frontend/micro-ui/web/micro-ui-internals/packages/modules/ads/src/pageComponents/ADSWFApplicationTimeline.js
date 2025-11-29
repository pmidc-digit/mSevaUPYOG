import { CardSectionHeader, CheckPoint, ConnectingCheckPoints, Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import ADSWFCaption from "./ADSWFCaption";
import ApplicationTimeline from "../../../templates/ApplicationDetails/components/ApplicationTimeline";

const ADSWFApplicationTimeline = (props) => {
  const { t } = useTranslation();
  const businessService = props?.application?.workflow?.businessService;

  const { isLoading, data } = Digit.Hooks.useWorkflowDetails({
    tenantId: props.application?.tenantId,
    id: props.id || props.application?.applicationNumber || props.application?.bookingNo,
    moduleCode: "advandhoarding-services",
  });


  function OpenImage(imageSource, index, thumbnailsToShow) {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  }

  const getTimelineCaptions = (checkpoint) => {
    if (checkpoint.state === "OPEN") {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        source: props.application?.channel || "",
      };
      return <ADSWFCaption data={caption} />;
    } else if (checkpoint.state) {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        name: checkpoint?.assignes?.[0]?.name,
        mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber,
        comment: t(checkpoint?.comment),
        wfComment: checkpoint.wfComment,
        thumbnailsToShow: checkpoint?.thumbnailsToShow,
      };
      return <ADSWFCaption data={caption} OpenImage={OpenImage} />;
    } else {
      const caption = {
        date: Digit.DateUtils.ConvertTimestampToDate(props.application?.auditDetails.lastModified),
        name: checkpoint?.assigner?.name,
        comment: t(checkpoint?.comment),
      };
      return <ADSWFCaption data={caption} />;
    }
  };

  if (isLoading) return <Loader />;

  return (
    <React.Fragment>
      {data?.timeline?.length > 0 && (
        <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSectionHeader>
      )}

      {/* {data?.timeline && data?.timeline?.length === 1 ? (
        <CheckPoint
          isCompleted={true}
          label={t((data?.timeline[0]?.state && `WF_${businessService}_${data.timeline[0].state}`) || "NA")}
          customChild={getTimelineCaptions(data?.timeline[0])}
        />
      ) : (
        <ConnectingCheckPoints>
          {data?.timeline &&
            data?.timeline.map((checkpoint, index) => {
              let timelineStatusPostfix = "";
              if (window.location.href.includes("/obps/")) {
                const prevState = data?.timeline?.[index - 1]?.state;
                if (prevState && (prevState.includes("BACK_FROM") || prevState.includes("SEND_TO_CITIZEN"))) {
                  timelineStatusPostfix = `_NOT_DONE`;
                } else if (checkpoint?.performedAction === "SEND_TO_ARCHITECT") {
                  timelineStatusPostfix = `_BY_ARCHITECT_DONE`;
                } else {
                  timelineStatusPostfix = index === 0 ? "" : `_DONE`;
                }
              }

              return (
                <React.Fragment key={index}>
                  <CheckPoint
                    keyValue={index}
                    isCompleted={index === 0}
                    label={t(`ES_ADS_COMMON_STATUS_${data?.processInstances[index].state?.["state"]}${timelineStatusPostfix}`)}
                    customChild={getTimelineCaptions(checkpoint)}
                  />
                </React.Fragment>
              );
            })}
        </ConnectingCheckPoints>
      )} */}

      <ApplicationTimeline workflowDetails={data} t={t} />
    </React.Fragment>
  );
};

export default ADSWFApplicationTimeline;
