// import { Banner, Card, CardText, LinkButton, Loader, Row, StatusTable, SubmitBar } from "@mseva/digit-ui-react-components";
// import React, { useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";
// import { convertToNocObject, convertToBPAObject, stringReplaceAll } from "../../../utils/index";
// import getBPAAcknowledgement from "../../../../getBPAAcknowledgement";
// import { NOCService } from "../../../../../../libraries/src/services/elements/NOC";
// import { OBPSService } from "../../../../../../libraries/src/services/elements/OBPS";
// const GetActionMessage = (props) => {
//   const bpaData = props?.data?.BPA?.[0];
//   let bpaBusinessService = props?.data?.BPA?.[0]?.businessService ? props?.data?.BPA?.[0]?.businessService : "BPA";
//   let bpaStatus = bpaData?.status;
//   if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
//   let getAppAction = sessionStorage.getItem("BPA_SUBMIT_APP") ? JSON.parse(sessionStorage.getItem("BPA_SUBMIT_APP")) : null;

//   if (props.isSuccess) {
//     if (getAppAction == "BPA_SUBMIT_APP")
//       return !window.location.href.includes("editApplication")
//         ? props?.t(`BPA_SUBMIT_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`)
//         : props?.t(`BPA_SUBMIT_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`);
//     return !window.location.href.includes("editApplication")
//       ? props?.t(`BPA_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`)
//       : props?.t(`BPA_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`);
//   } else if (props.isLoading) {
//     return !window.location.href.includes("editApplication") ? props?.t("CS_BPA_APPLICATION_PENDING") : props?.t("CS_BPA_APPLICATION_PENDING");
//   } else if (!props.isSuccess) {
//     return !window.location.href.includes("editApplication") ? props?.t("CS_BPA_APPLICATION_FAILED") : props?.t("CS_BPA_APPLICATION_FAILED");
//   }
// };

// const getCardText = (t, props) => {
//   const bpaData = props?.BPA?.[0];
//   let bpaBusinessService = props?.BPA?.[0]?.businessService ? props?.BPA?.[0]?.businessService : "BPA";
//   let bpaStatus = bpaData?.status;
//   if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
//   let getAppAction = sessionStorage.getItem("BPA_SUBMIT_APP") ? JSON.parse(sessionStorage.getItem("BPA_SUBMIT_APP")) : null;
//   if (getAppAction == "BPA_SUBMIT_APP")
//     return t(
//       `BPA_SUBMIT_SUB_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${
//         bpaData?.additionalDetails?.typeOfArchitect ? bpaData?.additionalDetails?.typeOfArchitect : "ARCHITECT"
//       }_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`
//     );
//   return t(
//     `BPA_SUB_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${
//       bpaData?.additionalDetails?.typeOfArchitect ? bpaData?.additionalDetails?.typeOfArchitect : "ARCHITECT"
//     }_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`
//   );
// };

// const rowContainerStyle = {
//   padding: "4px 0px",
//   justifyContent: "space-between",
// };

// const getApplicationNoLabel = (props) => {
//   let bpaBusinessService = props?.BPA?.[0]?.businessService ? props?.BPA?.[0]?.businessService : "BPA";
//   if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
//   return bpaBusinessService == "BPA"
//     ? props?.t("BPA_PERMIT_APPLICATION_NUMBER_LABEL")
//     : props?.t("BPA_OCCUPANCY_CERTIFICATE_APPLICATION_NUMBER_LABEL");
// };

// const BannerPicker = (props) => {
//   return (
//     <Banner
//       message={GetActionMessage(props)}
//       applicationNumber={props.data?.BPA[0].applicationNo}
//       info={props.isSuccess ? getApplicationNoLabel(props) : ""}
//       successful={props.isSuccess}
//       headerStyles={{ fontSize: "32px" }}
//     />
//   );
// };

// const OBPSAcknowledgement = ({ data, onSuccess }) => {
//   const { t } = useTranslation();
//   //const isPropertyMutation = window.location.href.includes("property-mutation");
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const mutation = Digit.Hooks.obps.useObpsAPI(data?.address?.city ? data.address?.city?.code : tenantId, true);
//   const mutation1 = Digit.Hooks.obps.useObpsAPI(data?.address?.city ? data.address?.city?.code : tenantId, false);

//   console.log(mutation, "Mutation ");
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};

//   useEffect(() => {
//     try {
//       let tenantid = data?.address?.city ? data.address?.city?.code : tenantId;
//       data.tenantId = tenantid;
//       let formdata = {};
//       data?.nocDocuments?.NocDetails.map((noc) => {
//         formdata = convertToNocObject(noc, data);
//         mutation.mutate(formdata, {
//           onSuccess,
//         });
//       });
//       formdata = convertToBPAObject(data);
//       mutation1.mutate(formdata, {
//         onSuccess,
//       });
//       sessionStorage.removeItem("Malbafees");
//       sessionStorage.removeItem("WaterCharges");
//       sessionStorage.removeItem("GaushalaFees");
//       sessionStorage.removeItem("LabourCess");
//       sessionStorage.removeItem("otherCharges");
//       sessionStorage.removeItem("lessAdjusment");
//       sessionStorage.removeItem("development");
//     } catch (err) {}
//   }, []);
//   const handleDownloadPdf = async () => {
//     const Property = data;
//     const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
//     const acknowledgementData = await getBPAAcknowledgement(Property, tenantInfo, t);
//     Digit.Utils.pdf.generate(acknowledgementData);
//   };

//   return mutation1.isLoading || mutation1.isIdle ? (
//     <Loader />
//   ) : (
//     <Card>
//       <BannerPicker t={t} data={mutation1.data} isSuccess={mutation1.isSuccess} isLoading={mutation1.isIdle || mutation1.isLoading} />
//       {mutation1.isSuccess && <CardText>{getCardText(t, mutation1.data)}</CardText>}
//       {!mutation1.isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}
//       <Link
//         to={{
//           pathname: `/digit-ui/citizen`,
//         }}
//       >
//         <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
//       </Link>
//       {mutation1.isSuccess && (
//         <div style={{ marginTop: "10px" }}>
//           <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
//         </div>
//       )}
//     </Card>
//   );
// };

// export default OBPSAcknowledgement;
import { Banner, Card, CardText, LinkButton, Loader, Row, StatusTable, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { convertToNocObject, convertToBPAObject, stringReplaceAll } from "../../../utils/index";
import getBPAAcknowledgement from "../../../../getBPAAcknowledgement";
import { NOCService } from "../../../../../../libraries/src/services/elements/NOC";
import { OBPSService } from "../../../../../../libraries/src/services/elements/OBPS";

// const GetActionMessage = (props) => {
//   console.log(propTypes, "PROPS");

//   const bpaData = props?.data?.BPA?.[0];
//   console.log(bpaData, "bpaData");
//   let bpaBusinessService = props?.data?.BPA?.[0]?.businessService ? props?.data?.BPA?.[0]?.businessService : "BPA";
//   let bpaStatus = bpaData?.status;
//   if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
//   let getAppAction = sessionStorage.getItem("BPA_SUBMIT_APP") ? JSON.parse(sessionStorage.getItem("BPA_SUBMIT_APP")) : null;

//   if (props.isSuccess) {
//     if (getAppAction == "BPA_SUBMIT_APP")
//       return !window.location.href.includes("editApplication")
//         ? props?.t(`BPA_SUBMIT_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`)
//         : props?.t(`BPA_SUBMIT_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`);
//     return !window.location.href.includes("editApplication")
//       ? props?.t(`BPA_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`)
//       : props?.t(`BPA_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`);
//   } else if (props.isLoading) {
//     return !window.location.href.includes("editApplication") ? props?.t("CS_BPA_APPLICATION_PENDING") : props?.t("CS_BPA_APPLICATION_PENDING");
//   } else if (!props.isSuccess) {
//     return !window.location.href.includes("editApplication") ? props?.t("CS_BPA_APPLICATION_FAILED") : props?.t("CS_BPA_APPLICATION_FAILED");
//   }
// };

// const getCardText = (t, props) => {
//   const bpaData = props?.BPA?.[0];
//   console.log(props, "PROPS 2");
//   console.log(bpaData, "BPA DATA 2");
//   let bpaBusinessService = props?.BPA?.[0]?.businessService ? props?.BPA?.[0]?.businessService : "BPA";
//   let bpaStatus = bpaData?.status;
//   if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
//   let getAppAction = sessionStorage.getItem("BPA_SUBMIT_APP") ? JSON.parse(sessionStorage.getItem("BPA_SUBMIT_APP")) : null;
//   if (getAppAction == "BPA_SUBMIT_APP")
//     return t(
//       `BPA_SUBMIT_SUB_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${
//         bpaData?.additionalDetails?.typeOfArchitect ? bpaData?.additionalDetails?.typeOfArchitect : "ARCHITECT"
//       }_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`
//     );
//   return t(
//     `BPA_SUB_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${
//       bpaData?.additionalDetails?.typeOfArchitect ? bpaData?.additionalDetails?.typeOfArchitect : "ARCHITECT"
//     }_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`
//   );
// };

// const rowContainerStyle = {
//   padding: "4px 0px",
//   justifyContent: "space-between",
// };

// const getApplicationNoLabel = (props) => {
//   let bpaBusinessService = props?.BPA?.[0]?.businessService ? props?.BPA?.[0]?.businessService : "BPA";
//   if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
//   return bpaBusinessService == "BPA"
//     ? props?.t("BPA_PERMIT_APPLICATION_NUMBER_LABEL")
//     : props?.t("BPA_OCCUPANCY_CERTIFICATE_APPLICATION_NUMBER_LABEL");
// };

// <BannerPicker
//   t={t}
//   data={responseData}
//   isOCBPA={isOCBPA}
//   isSendToCitizen={isSendToCitizen}
//   isSuccess={mutation1.isSuccess}
//   isLoading={mutation1.isIdle || mutation1.isLoading}
// />;

// const BannerPicker = (props) => {
//   return (
//     <Banner
//       message={GetActionMessage(props)}
//       applicationNumber={props.data?.BPA[0].applicationNo}
//       info={props.isSuccess ? getApplicationNoLabel(props) : ""}
//       successful={props.isSuccess}
//       headerStyles={{ fontSize: "32px" }}
//     />
//   );
// };

// const OBPSAcknowledgement = ({ data, onSuccess }) => {
//   const { t } = useTranslation();
//   //const isPropertyMutation = window.location.href.includes("property-mutation");
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   // const mutation = Digit.Hooks.obps.useObpsAPI(data?.address?.locality ? data.address?.locality?.code : tenantId, true);
//   // const mutation1 = Digit.Hooks.obps.useObpsAPI(data?.address?.locality ? data.address?.locality?.code : tenantId, false);

//   const mutation = Digit.Hooks.obps.useObpsAPI(data.tenantId || tenantId, true);
//   // const mutation1 = Digit.Hooks.obps.useObpsAPI(data.tenantId || tenantId, false);

//   console.log(mutation, mutation1, "MUTATION");
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};

//   const resolvedTenantId = data?.tenantId || tenantId;
//   const mutation1 = resolvedTenantId ? Digit.Hooks.obps.useObpsAPI(resolvedTenantId, false) : null;

//   const responseData = mutation1.data;

//   const isOCBPA = responseData?.BPA?.[0]?.businessService?.toUpperCase()?.includes("OC");

//   const isSendToCitizen = responseData?.BPA?.[0]?.workflow?.action?.toUpperCase() === "SEND_TO_CITIZEN";

//   // useEffect(() => {
//   //   try {
//   //     let tenantid = data?.address?.city ? data.address?.city?.code : tenantId;
//   //     data.tenantId = tenantid;
//   //     let formdata = {};
//   //     data?.nocDocuments?.NocDetails.map((noc) => {
//   //       formdata = convertToNocObject(noc, data);
//   //       mutation.mutate(formdata, {
//   //         onSuccess,
//   //       });
//   //     });
//   //     formdata = convertToBPAObject(data);
//   //     mutation1.mutate(formdata, {
//   //       onSuccess,
//   //     });
//   //     sessionStorage.removeItem("Malbafees");
//   //     sessionStorage.removeItem("WaterCharges");
//   //     sessionStorage.removeItem("GaushalaFees");
//   //     sessionStorage.removeItem("LabourCess");
//   //     sessionStorage.removeItem("otherCharges");
//   //     sessionStorage.removeItem("lessAdjusment");
//   //     sessionStorage.removeItem("development");
//   //   } catch (err) {}
//   // }, []);

//   useEffect(() => {
//     try {
//       console.log("Input data:", data);

//       // Use the existing tenantId from data, don't try to extract from undefined city
//       let tenantid = data.tenantId || tenantId;

//       console.log("Using tenantId:", tenantid);

//       // Restructure data to match what convertToBPAObject expects
//       const restructuredData = {
//         ...data,
//         // landInfo: {
//         //   owners: data.owners || [],
//         //   address: data.address,
//         // },
//         landInfo: {
//           owners: Array.isArray(data.owners) ? data.owners : [data.owners],
//           address: data.address || {},
//         },
//       };

//       let formdata = convertToBPAObject(restructuredData);
//       console.log("convertToBPAObject result:", formdata);

//       if (formdata) {
//         mutation1.mutate(formdata, {
//           onSuccess: (response) => {
//             console.log("Mutation success:", response);
//             onSuccess(response);
//           },
//           onError: (error) => {
//             console.error("Mutation error:", error);
//           },
//         });
//       }
//     } catch (err) {
//       console.error("Error in useEffect:", err);
//     }
//   }, [data]);

//   console.log(tenants, "CD");
//   const handleDownloadPdf = async () => {
//     // const Property = data;
//     // const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
//     // const acknowledgementData = await getBPAAcknowledgement(Property, tenantInfo, t);
//     // Digit.Utils.pdf.generate(acknowledgementData);
//   };

//   return mutation1.isLoading || mutation1.isIdle ? (
//     <Loader />
//   ) : (
//     <Card>
//       <BannerPicker t={t} data={mutation1.data} isSuccess={mutation1.isSuccess} isLoading={mutation1.isIdle || mutation1.isLoading} />
//       {mutation1.isSuccess && <CardText>{getCardText(t, mutation1.data)}</CardText>}
//       {!mutation1.isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}
//       <Link
//         to={{
//           pathname: `/digit-ui/citizen`,
//         }}
//       >
//         <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
//       </Link>
//       {mutation1.isSuccess && (
//         <div style={{ marginTop: "10px" }}>
//           <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
//         </div>
//       )}
//     </Card>
//   );
// };

// export default OBPSAcknowledgement;

const GetActionMessage = (props) => {
  console.log(props, "PROPS");
  const bpaData = props?.data?.BPA?.[0];
  console.log(bpaData, "bpaData");
  let bpaBusinessService = props?.data?.BPA?.[0]?.businessService ? props?.data?.BPA?.[0]?.businessService : "BPA";
  const bpaStatus = bpaData?.status;
  if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
  const getAppAction = sessionStorage.getItem("BPA_SUBMIT_APP") ? JSON.parse(sessionStorage.getItem("BPA_SUBMIT_APP")) : null;

  if (props.isSuccess) {
    if (getAppAction == "BPA_SUBMIT_APP")
      return !window.location.href.includes("editApplication")
        ? props?.t(`BPA_SUBMIT_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`)
        : props?.t(`BPA_SUBMIT_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`);
    return !window.location.href.includes("editApplication")
      ? props?.t(`BPA_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`)
      : props?.t(`BPA_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`);
  } else if (props.isLoading) {
    return !window.location.href.includes("editApplication") ? props?.t("CS_BPA_APPLICATION_PENDING") : props?.t("CS_BPA_APPLICATION_PENDING");
  } else if (!props.isSuccess) {
    return !window.location.href.includes("editApplication") ? props?.t("CS_BPA_APPLICATION_FAILED") : props?.t("CS_BPA_APPLICATION_FAILED");
  }
};

const getCardText = (t, props) => {
  const bpaData = props?.BPA?.[0];
  console.log(props, "PROPS 2");
  console.log(bpaData, "BPA DATA 2");
  let bpaBusinessService = props?.BPA?.[0]?.businessService ? props?.BPA?.[0]?.businessService : "BPA";
  const bpaStatus = bpaData?.status;
  if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
  const getAppAction = sessionStorage.getItem("BPA_SUBMIT_APP") ? JSON.parse(sessionStorage.getItem("BPA_SUBMIT_APP")) : null;

  if (getAppAction == "BPA_SUBMIT_APP")
    return t(
      `BPA_SUBMIT_SUB_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${
        bpaData?.additionalDetails?.typeOfArchitect ? bpaData?.additionalDetails?.typeOfArchitect : "ARCHITECT"
      }_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`
    );
  return t(
    `BPA_SUB_HEADER_${bpaBusinessService}_${bpaData?.workflow?.action}_${
      bpaData?.additionalDetails?.typeOfArchitect ? bpaData?.additionalDetails?.typeOfArchitect : "ARCHITECT"
    }_${stringReplaceAll(bpaStatus, " ", "_").toUpperCase()}`
  );
};

const rowContainerStyle = {
  padding: "4px 0px",
  justifyContent: "space-between",
};

const getApplicationNoLabel = (props) => {
  let bpaBusinessService = props?.BPA?.[0]?.businessService ? props?.BPA?.[0]?.businessService : "BPA";
  if (bpaBusinessService == "BPA_LOW") bpaBusinessService = "BPA";
  return bpaBusinessService == "BPA"
    ? props?.t("BPA_PERMIT_APPLICATION_NUMBER_LABEL")
    : props?.t("BPA_OCCUPANCY_CERTIFICATE_APPLICATION_NUMBER_LABEL");
};

// Move BannerPicker definition before it's used
const BannerPicker = (props) => {
  return (
    <Banner
      message={GetActionMessage(props)}
      applicationNumber={props.data?.BPA[0].applicationNo}
      info={props.isSuccess ? getApplicationNoLabel(props) : ""}
      successful={props.isSuccess}
      headerStyles={{ fontSize: "32px" }}
    />
  );
};

const OBPSAcknowledgement = ({ data, onSuccess }) => {
  const { t } = useTranslation();

  // Safely access Digit and user
  const user = typeof window !== "undefined" && window.Digit?.UserService?.getUser ? window.Digit.UserService.getUser() : null;
  const tenantId =
    typeof window !== "undefined" && window.Digit?.ULBService?.getCurrentTenantId ? window.Digit.ULBService.getCurrentTenantId() : null;

  const { data: storeData } =
    typeof window !== "undefined" && window.Digit?.Hooks?.useStore?.getInitData ? window.Digit.Hooks.useStore.getInitData() : { data: null };
  const { tenants } = storeData || {};

  const resolvedTenantId = data?.tenantId || tenantId;
  const tenantid = useMemo(() => {
    return (
      data?.address?.city?.code ||
      data?.tenantId ||
      user?.info?.permanentCity ||
      (typeof window !== "undefined" && window.Digit?.ULBService?.getCurrentTenantId ? window.Digit.ULBService.getCurrentTenantId() : null)
    );
  }, [data?.address?.city?.code, data?.tenantId, user?.info?.permanentCity]);

  const mutation = window.Digit?.Hooks?.obps?.useObpsAPI(data.tenantId || tenantId, true);
  const mutation1 = window.Digit?.Hooks?.obps?.useObpsAPI(resolvedTenantId, false);

  console.log("MUTATION");

  const hasCalledAPI = useRef(false);

  useEffect(() => {
    try {
      let tenantid = data?.address?.city ? data.address?.city?.code : tenantId;
      data.tenantId = tenantid;
      let formdata = {};
      data?.nocDocuments?.NocDetails.map((noc) => {
        formdata = convertToNocObject(noc, data);
        mutation.mutate(formdata, {
          onSuccess,
        });
      });
      formdata = convertToBPAObject(data);
      mutation1.mutate(formdata, {
        onSuccess,
      });
      sessionStorage.removeItem("Malbafees");
      sessionStorage.removeItem("WaterCharges");
      sessionStorage.removeItem("GaushalaFees");
      sessionStorage.removeItem("LabourCess");
      sessionStorage.removeItem("otherCharges");
      sessionStorage.removeItem("lessAdjusment");
      sessionStorage.removeItem("development");
    } catch (err) {}
  }, []);

  useEffect(() => {
    try {
      console.log("Input data:", data);

      // Use the existing tenantId from data, don't try to extract from undefined city
      let tenantid = data.tenantId || tenantId;

      console.log("Using tenantId:", tenantid);

      // Restructure data to match what convertToBPAObject expects
      const restructuredData = {
        ...data,
        // landInfo: {
        //   owners: data.owners || [],
        //   address: data.address,
        // },
        landInfo: {
          owners: Array.isArray(data.owners) ? data.owners : [data.owners],
          address: data.address || {},
        },
      };

      let formdata = convertToBPAObject(restructuredData);
      console.log("convertToBPAObject result:", formdata);

      if (formdata) {
        mutation1.mutate(formdata, {
          onSuccess: (response) => {
            console.log("Mutation success:", response);
            onSuccess(response);
          },
          onError: (error) => {
            console.error("Mutation error:", error);
          },
        });
      }
    } catch (err) {
      console.error("Error in useEffect:", err);
    }
  }, [data]);
  console.log(tenants, "CD");

  const handleDownloadPdf = async () => {
    const Property = data;
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getBPAAcknowledgement(Property, tenantInfo, t);
    Digit.Utils.pdf.generate(acknowledgementData);
  };

  if (!mutation1) {
    return <Loader />;
  }

  return mutation1.isLoading || mutation1.isIdle ? (
    <Loader />
  ) : (
    <Card>
      <BannerPicker t={t} data={mutation1.data} isSuccess={mutation1.isSuccess} isLoading={mutation1.isIdle || mutation1.isLoading} />
      {mutation1.isSuccess && <CardText>{getCardText(t, mutation1.data)}</CardText>}
      {!mutation1.isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}
      <Link
        to={{
          pathname: `/digit-ui/citizen`,
        }}
      >
        <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
      </Link>
      {mutation1.isSuccess && (
        <div style={{ marginTop: "10px" }}>
          <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
        </div>
      )}
    </Card>
  );
};

export default OBPSAcknowledgement;
