import { BackButton, Banner, Card, CardText, LinkButton, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import { Link, useHistory } from "react-router-dom";
import { convertToStakeholderObject } from "../../../utils/index";
import getAcknowledgementData from "../../../../getAcknowlegment";
import { LoaderNew } from "../../../components/LoaderNew";

const GetActionMessage = (props) => {
  // const LicenseType = props?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
  const { t } = useTranslation();
  const checkAction = props?.data?.action;

  if (checkAction == "APPLY") {
    return t(`CS_STAKEHOLDER_APPLICATION_SUCCESS`);
  } else {
    return t(`CS_PROPERTY_UPDATE_APPLICATION_SUCCESS`);
  }
  // if (props.isSuccess) {
  //   return !window.location.href.includes("edit-application")
  //     ? `${t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${t(`CS_STAKEHOLDER_APPLICATION_SUCCESS`)}`
  //     : t("CS_PROPERTY_UPDATE_APPLICATION_SUCCESS");
  // } else if (props.isLoading) {
  //   return !window.location.href.includes("edit-application") ? t("CS_STAKEHOLDER_APPLICATION_PENDING") : t("CS_PROPERTY_UPDATE_APPLICATION_PENDING");
  // } else if (!props.isSuccess) {
  //   return !window.location.href.includes("edit-application") ? t("CS_STAKEHOLDER_APPLICATION_FAILED") : t("CS_PROPERTY_UPDATE_APPLICATION_FAILED");
  // }
};

const BannerPicker = (props) => {
  console.log(props, "BannerPicker Props");
  const LicenseType = props?.data?.applicationData?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
  return (
    <Banner
      message={GetActionMessage(props)}
      applicationNumber={props?.data?.applicationNumber}
      info={props.isSuccess ? `${props.t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${props.t("BPA_NEW_STAKEHOLDER_REGISTRATION_APP_LABEL")}` : ""}
      successful={props.isSuccess}
      style={{ padding: "10px" }}
      headerStyles={{ fontSize: "32px" }}
    />
  );
};

const AcknowledgementContent = ({ mutation, applicationNumber, isOpenLinkFlow, mutationData, isAcknowledgementReady }) => {
  const { t } = useTranslation();
  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const [loader, setLoader] = useState(false);
  const checkData = useLocation();
  const dataVal = checkData.state;
  const finalDataBind = dataVal?.Licenses?.[0];

  const tradeType = finalDataBind?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType;
  const moduleCode = tradeType ? tradeType.split(".")[0] : null;

  const checkTenant = moduleCode == "ARCHITECT" ? "pb.punjab" : tenantId;

  console.log("dataVal", dataVal);
  console.log("moduleCode", moduleCode);
  const { tenants } = storeData || {};
  const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(
    checkTenant,
    { applicationNumber: finalDataBind?.applicationNumber, tenantId: checkTenant },
    {}
  );

  console.log("applicationDetails", applicationDetails);

  const dataToDisplay = mutationData || mutation.data || applicationDetails;
  const licenseType = dataToDisplay?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";

  const handleDownloadPdf = async () => {
    try {
      setLoader(true);
      const Property = applicationDetails;
      console.log("applicationDetails in StakeholderAck", applicationDetails);

      if (!Property) {
        console.error("No application details found");
        setLoader(false);
        return;
      }

      const propertyTenantId =
        Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;

      if (!propertyTenantId) {
        console.error("No tenantId found in applicationDetails or sessionStorage");
        setLoader(false);
        return;
      }

      const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);

      if (!tenantInfo) {
        console.error("No tenantInfo found for tenantId:", propertyTenantId);
        setLoader(false);
        return;
      }

      const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
      console.log(acknowledgementData, "ACKO");
      await Digit.Utils.pdf.generateBPAREG(acknowledgementData);
      setLoader(false);
    } catch (err) {
      console.error("Error generating acknowledgement PDF", err);
      setLoader(false);
    }
  };

  // const isSuccess = mutation.isSuccess || isAcknowledgementReady;
  // const isResubmit = dataToDisplay?.Licenses?.[0]?.action === "RESUBMIT";

  return (
    <Card>
      <BannerPicker t={t} data={finalDataBind} isLoading={mutation.isLoading} />
      {/* <CardText>{`${t(`TRADELICENSE_TRADETYPE_${licenseType}`)} ${t(`CS_FILE_STAKEHOLDER_RESPONSE`)}`}</CardText> */}
      {/* {!isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>} */}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {(finalDataBind?.action == "APPLY" && !(finalDataBind?.applicationType === "UPGRADE")) && (
          <Link
            to={{
              pathname: `/digit-ui/citizen/payment/collect/${finalDataBind?.businessService}/${finalDataBind?.applicationNumber}/${finalDataBind?.tenantId}?tenantId=${finalDataBind?.tenantId}`,
              state: { tenantId: finalDataBind?.tenantId },
            }}
          >
            <SubmitBar label="Make Payment" />
          </Link>
        )}

        {finalDataBind?.action == "APPLY" && <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />}

        {!isOpenLinkFlow && (
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        )}

        {isOpenLinkFlow && (
          <Link to={{ pathname: `/digit-ui/citizen` }}>
            <SubmitBar label={t("BPA_COMMON_PROCEED_NEXT")} />
          </Link>
        )}
      </div>
      {loader && <LoaderNew page={true} />}
    </Card>
  );
};

const StakeholderAcknowledgement = ({ data, onSuccess }) => {
  const { t } = useTranslation();
  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
  const mutation = Digit.Hooks.obps.useStakeholderAPI(tenantId, true);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const { action } = useParams();
  const location = useLocation();
  const checkData = useLocation();
  const dataVal = checkData.state;
  const finalDataBind = dataVal?.Licenses?.[0];
  // const params = new URLSearchParams(location.search);
  // const getAction = params.get("action");
  // console.log("params", params);
  // console.log("getAction", getAction);
  const isOpenLinkFlow = window.location.href.includes("openlink");

  const applicationNumber =
    data?.result?.Licenses?.[0]?.applicationNumber ||
    mutation?.data?.Licenses?.[0]?.applicationNumber ||
    Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.applicationNumber;

  const [mutationData, setMutationData] = useState(null);
  const [hasMutated, setHasMutated] = useState(false);
  const [isAcknowledgementReady, setIsAcknowledgementReady] = useState(false);

  // useEffect(() => {
  //   const workflowActionCompleted = sessionStorage.getItem("workflowActionCompleted");
  //   const workflowActionType = sessionStorage.getItem("workflowActionType");

  //   console.log("  Mutation state:", {
  //     isLoading: mutation.isLoading,
  //     isSuccess: mutation.isSuccess,
  //     isError: mutation.isError,
  //     hasMutated,
  //     mutationData: JSON.stringify(mutation.data),
  //     isAcknowledgementReady,
  //   });

  //   if (workflowActionCompleted === "true") {
  //     console.log("  Workflow action already completed:", workflowActionType);

  //     setIsAcknowledgementReady(true);

  //     const storedMutationData = sessionStorage.getItem("mutationData");
  //     if (storedMutationData) {
  //       console.log("  Retrieved stored mutation data");
  //     } else {
  //       console.log("  No stored mutation data found, setting acknowledgement ready anyway");
  //     }

  //     return;
  //   }

  //   // const isStakeholderRegistered = sessionStorage.getItem("isStakeholderRegistered");

  //   // if (isStakeholderRegistered === "true" || hasMutated) {
  //   //   console.log("  Already registered or mutated, skipping");
  //   //   return;
  //   // }

  //   if (!hasMutated && data) {
  //     try {
  //       console.log("Starting mutation...");
  //       const tenantId = data?.result?.Licenses[0]?.tenantId || window?.localStorage?.getItem("CITIZEN.CITY");
  //       data.tenantId = tenantId;
  //       // const formdata = convertToStakeholderObject(data);
  //       const getDocs = JSON.parse(sessionStorage.getItem("FinalDataDoc"));
  //       const finalDoc = getDocs?.result?.Licenses?.[0];
  //       const checkAction = finalDoc?.action;

  //       console.log("checkAction", checkAction);
  //       console.log("finalDoc", finalDoc);
  //       console.log("action", action);
  //       const payload = {
  //         Licenses: [
  //           {
  //             ...finalDoc,
  //             action: getAction,
  //           },
  //         ],
  //       };
  //       setHasMutated(true);

  //       mutation.mutate(payload, {
  //         onSuccess: (responseData, variables, context) => {
  //           console.log("  Mutation successful:", responseData);
  //           sessionStorage.setItem("isStakeholderRegistered", "true");
  //           sessionStorage.setItem("mutationData", JSON.stringify(responseData));
  //           setMutationData(responseData);
  //           setIsAcknowledgementReady(true);

  //           if (onSuccess) {
  //             onSuccess(responseData, variables, context);
  //           }
  //         },
  //         onError: (error) => {
  //           console.error("  Mutation failed:", error);
  //         },
  //       });
  //     } catch (err) {
  //       console.error("  Error in mutation setup:", err);
  //     }
  //   }
  // }, []);

  return (
    <div>
      <div className={isOpenLinkFlow ? "OpenlinkContainer" : ""}>
        {isOpenLinkFlow && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}

        <AcknowledgementContent
          mutation={mutation}
          applicationNumber={finalDataBind?.applicationNumber}
          isOpenLinkFlow={isOpenLinkFlow}
          mutationData={mutationData}
          isAcknowledgementReady={isAcknowledgementReady}
        />
      </div>
    </div>
  );
};

export default StakeholderAcknowledgement;
