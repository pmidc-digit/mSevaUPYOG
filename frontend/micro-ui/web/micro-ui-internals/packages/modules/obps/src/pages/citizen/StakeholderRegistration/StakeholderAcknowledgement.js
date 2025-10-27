import { BackButton, Banner, Card, CardText, LinkButton, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Link, useHistory } from "react-router-dom";
import { convertToStakeholderObject } from "../../../utils/index";
import getAcknowledgementData from "../../../../getAcknowlegment";



// const GetActionMessage = (props) => {
//   const LicenseType = props?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
//   const { t } = useTranslation();
//   if (props.isSuccess) {
//     return !window.location.href.includes("edit-application")
//       ? `${t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${t(`CS_STAKEHOLDER_APPLICATION_SUCCESS`)}`
//       : t("CS_PROPERTY_UPDATE_APPLICATION_SUCCESS");
//   } else if (props.isLoading) {
//     return !window.location.href.includes("edit-application") ? t("CS_STAKEHOLDER_APPLICATION_PENDING") : t("CS_PROPERTY_UPDATE_APPLICATION_PENDING");
//   } else if (!props.isSuccess) {
//     return !window.location.href.includes("edit-application") ? t("CS_STAKEHOLDER_APPLICATION_FAILED") : t("CS_PROPERTY_UPDATE_APPLICATION_FAILED");
//   }
// };

// const rowContainerStyle = {
//   padding: "4px 0px",
//   justifyContent: "space-between",
// };

// const BannerPicker = (props) => {
//   const LicenseType = props?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
//   return (
//     <Banner
//       message={GetActionMessage(props)}
//       applicationNumber={props.data?.Licenses[0].applicationNumber}
//       info={props.isSuccess ? `${props.t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${props.t("BPA_NEW_STAKEHOLDER_REGISTRATION_APP_LABEL")}` : ""}
//       successful={props.isSuccess}
//       style={{ padding: "10px" }}
//       headerStyles={{ fontSize: "32px" }}
//     />
//   );
// };

// const StakeholderAcknowledgementChild = ({mutation , applicationNumber, isOpenLinkFlow}) => {
//   const { t } = useTranslation();
//   const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};
//   const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: applicationNumber, tenantId }, {});
//   const licenseType = mutation?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";

//   const handleDownloadPdf = async () => {
//     try {
//       const Property = applicationDetails;
//       console.log("applicationDetails in StakeholderAck1", applicationDetails);

//       if (!Property) {
//         console.error("No application details found");
//         return;
//       }

//       // try to resolve tenantId safely
//       const propertyTenantId =
//         Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;

//       if (!propertyTenantId) {
//         console.error("No tenantId found in applicationDetails or sessionStorage");
//         return;
//       }

//       const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);

//       if (!tenantInfo) {
//         console.error("No tenantInfo found for tenantId:", propertyTenantId);
//         return;
//       }

//       const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
//       console.log(acknowledgementData, "ACKO");

//       Digit.Utils.pdf.generateBPAREG(acknowledgementData);
//     } catch (err) {
//       console.error("Error generating acknowledgement PDF", err);
//     }
//   };

//   // return !applicationDetails? <Loader /> :(
//   // <CHANGE> Use mutation data if available, otherwise wait for applicationDetails
// const dataToUse = mutationData || applicationDetails
// return !dataToUse ? <Loader /> : (
//     <Card>
//           <BannerPicker t={t} data={mutation.data} isSuccess={isStakeholderRegistered || mutation.isSuccess} isLoading={mutation.isIdle || mutation.isLoading} />
//           {mutation.isSuccess && <CardText>{`${t(`TRADELICENSE_TRADETYPE_${licenseType}`)}${t(`CS_FILE_STAKEHOLDER_RESPONSE`)}`}</CardText>}
//           {!mutation.isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}
//          {mutation.isSuccess &&
//             !isOpenLinkFlow &&
//             mutation?.data?.Licenses?.[0]?.action !== "RESUBMIT" && (
//               <Link
//                 to={{
//                   pathname: `/digit-ui/citizen/payment/collect/${mutation.data.Licenses[0].businessService}/${mutation.data.Licenses[0].applicationNumber}/${mutation.data.Licenses[0].tenantId}?tenantId=${mutation.data.Licenses[0].tenantId}`,
//                   state: { tenantId: mutation.data.Licenses[0].tenantId },
//                 }}
//               >
//                 <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
//               </Link>
//             )}

//           {mutation.isSuccess && (
//             <div style={{ marginTop: "10px" }}>
//               <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
//             </div>
//           )}
//           {!isOpenLinkFlow && (
//             <Link to={`/digit-ui/citizen`}>
//               <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
//             </Link>
//           )}
//           {mutation.isSuccess && isOpenLinkFlow && (
//             <Link
//               to={{
//                 pathname: `/digit-ui/citizen`,
//               }}
//             >
//               <SubmitBar label={t("BPA_COMMON_PROCEED_NEXT")} />
//             </Link>
//           )}
//         </Card>
//   )
// }

// const StakeholderAcknowledgementChildNotMutation = ({mutation , applicationNumber, isOpenLinkFlow}) => {
//   const { t } = useTranslation();
//   const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};
//   const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: applicationNumber, tenantId }, {});
//   const licenseType = mutation?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";

//   const handleDownloadPdf = async () => {
//     try {
//       const Property = applicationDetails;
//       console.log("applicationDetails in StakeholderAck1", applicationDetails);

//       if (!Property) {
//         console.error("No application details found");
//         return;
//       }

//       // try to resolve tenantId safely
//       const propertyTenantId =
//         Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;

//       if (!propertyTenantId) {
//         console.error("No tenantId found in applicationDetails or sessionStorage");
//         return;
//       }

//       const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);

//       if (!tenantInfo) {
//         console.error("No tenantInfo found for tenantId:", propertyTenantId);
//         return;
//       }

//       const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
//       console.log(acknowledgementData, "ACKO");

//       Digit.Utils.pdf.generateBPAREG(acknowledgementData);
//     } catch (err) {
//       console.error("Error generating acknowledgement PDF", err);
//     }
//   };

//   const isStakeholderRegistered = sessionStorage.getItem("isStakeholderRegistered") || false;
//   const  mutationData = JSON.parse(sessionStorage.getItem("stakeholder.mutationData")) || {};

//   console.log("Mutationdata 2", mutation.data)

//   return !applicationDetails? <Loader /> :(
//     <Card>
//           <BannerPicker t={t} data={mutationData} isSuccess={isStakeholderRegistered}  />
//           {<CardText>{`${t(`TRADELICENSE_TRADETYPE_${licenseType}`)}${t(`CS_FILE_STAKEHOLDER_RESPONSE`)}`}</CardText>}
//           {!isOpenLinkFlow && mutationData.Licenses[0].action !== "RESUBMIT" && (
//             <Link
//               to={{
//                 pathname: `/digit-ui/citizen/payment/collect/${mutationData.Licenses[0].businessService}/${mutationData.Licenses[0].applicationNumber}/${mutationData.Licenses[0].tenantId}?tenantId=${mutationData.Licenses[0].tenantId}`,
//                 state: { tenantId: mutationData.Licenses[0].tenantId },
//               }}
//             >
//               <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
//             </Link>
//           )}
//           {(
//             <div style={{ marginTop: "10px" }}>
//               <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
//             </div>
//           )}
//           {!isOpenLinkFlow && (
//             <Link to={`/digit-ui/citizen`}>
//               <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
//             </Link>
//           )}
//           {mutation.isSuccess && isOpenLinkFlow && (
//             <Link
//               to={{
//                 pathname: `/digit-ui/citizen`,
//               }}
//             >
//               <SubmitBar label={t("BPA_COMMON_PROCEED_NEXT")} />
//             </Link>
//           )}
//         </Card>
//   )
// }

// const StakeholderAcknowledgement = ({ data, onSuccess }) => {
//   const { t } = useTranslation();
//   // const { id } = useParams();
//   //const isPropertyMutation = window.location.href.includes("property-mutation");
//   // const tenantId = Digit.ULBService.getCurrentTenantId();
//   const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
//   const mutation = Digit.Hooks.obps.useStakeholderAPI(tenantId, true);
//   console.log(mutation, "Mutation in Ack");
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};
//   let isOpenLinkFlow = window.location.href.includes("openlink");
//   const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
//   const licenseType = mutation?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
//   // const applicationNumber = data?.result?.Licenses?.[0]?.applicationNumber || mutation?.data?.Licenses?.[0]?.applicationNumber;
//   const applicationNumber =
//     data?.result?.Licenses?.[0]?.applicationNumber ||
//     mutation?.data?.Licenses?.[0]?.applicationNumber ||
//     Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.applicationNumber;
  
//   const isStakeholderRegistered = sessionStorage.getItem("isStakeholderRegistered") || false;
//   // const isStakeholderRegistered = sessionStorage.getItem("isStakeholderRegistered") || false;
// // <CHANGE> Add state to trigger re-render when mutation succeeds
// const [isRegistered, setIsRegistered] = useState(sessionStorage.getItem("isStakeholderRegistered") === "true");

//   console.log(applicationNumber, "Application Number");
// useEffect(() => {
//   try {
//     let tenantId = data?.result?.Licenses[0]?.tenantId ? data?.result?.Licenses[0]?.tenantId : tenantId;
//     data.tenantId = tenantId;
//     let formdata = convertToStakeholderObject(data);
//     mutation.mutate(formdata, {
//       onSuccess: (responseData, variables, context) => {
//         // <CHANGE> Set sessionStorage and state to trigger re-render
//         sessionStorage.setItem("isStakeholderRegistered", "true");
//         sessionStorage.setItem("stakeholder.mutationData", JSON.stringify(responseData));
//         setIsRegistered(true);
        
//         // Call original onSuccess
//         if (onSuccess) {
//           onSuccess(responseData, variables, context);
//         }
//       },
//     });
//   } catch (err) {}
// }, []);
  
  
//   const state = tenantId?.split(".")[0];
//   const workflowDetails = Digit.Hooks.useWorkflowDetails({
//     tenantId: tenantId?.split(".")[0],
//     id: applicationNumber,
//     moduleCode: "BPAREG",
//   });
//   // console.log(id, "IDDD");
//   // const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: applicationNumber, tenantId }, {});

//   // const handleDownloadPdf = async () => {
//   //   const Property = applicationDetails;
//   //   console.log("applicationDetails in StakeholderAck1", applicationDetails);
//   //   console.log("tenants", tenants);
//   //   const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);

//   //   const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);

//   //   Digit.Utils.pdf.generate(acknowledgementData);
//   // };
//   // const handleDownloadPdf = async () => {
//   //   try {
//   //     const Property = applicationDetails;
//   //     console.log("applicationDetails in StakeholderAck1", applicationDetails);

//   //     if (!Property) {
//   //       console.error("No application details found");
//   //       return;
//   //     }

//   //     // try to resolve tenantId safely
//   //     const propertyTenantId =
//   //       Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;

//   //     if (!propertyTenantId) {
//   //       console.error("No tenantId found in applicationDetails or sessionStorage");
//   //       return;
//   //     }

//   //     const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);

//   //     if (!tenantInfo) {
//   //       console.error("No tenantInfo found for tenantId:", propertyTenantId);
//   //       return;
//   //     }

//   //     const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
//   //     console.log(acknowledgementData, "ACKO");

//   //     Digit.Utils.pdf.generate(acknowledgementData);
//   //   } catch (err) {
//   //     console.error("Error generating acknowledgement PDF", err);
//   //   }
//   // };

//   // console.log("applicationDetails:", applicationDetails);
//   // console.log("tenants:", tenants);

//   return !isRegistered ? (
//   <Loader />
// ) : (
//     <div>
//       <div className={isOpenLinkFlow ? "OpenlinkContainer" : ""}>
//         {/* {isOpenLinkFlow &&<OpenLinkContainer />}
//     <div style={isOpenLinkFlow?{marginTop:"60px", width:isCitizenUrl?"100%":"70%", marginLeft:"auto",marginRight:"auto"}:{}}> */}
//         {isOpenLinkFlow && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
//         {/* <Card>
//           <BannerPicker t={t} data={mutation.data} isSuccess={mutation.isSuccess} isLoading={mutation.isIdle || mutation.isLoading} />
//           {mutation.isSuccess && <CardText>{`${t(`TRADELICENSE_TRADETYPE_${licenseType}`)}${t(`CS_FILE_STAKEHOLDER_RESPONSE`)}`}</CardText>}
//           {!mutation.isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}
//           {mutation.isSuccess && !isOpenLinkFlow && (
//             <Link
//               to={{
//                 pathname: `/digit-ui/citizen/payment/collect/${mutation.data.Licenses[0].businessService}/${mutation.data.Licenses[0].applicationNumber}/${mutation.data.Licenses[0].tenantId}?tenantId=${mutation.data.Licenses[0].tenantId}`,
//                 state: { tenantId: mutation.data.Licenses[0].tenantId },
//               }}
//             >
//               <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
//             </Link>
//           )}
//           {mutation.isSuccess && (
//             <div style={{ marginTop: "10px" }}>
//               <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
//             </div>
//           )}
//           {!isOpenLinkFlow && (
//             <Link to={`/digit-ui/citizen`}>
//               <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
//             </Link>
//           )}
//           {mutation.isSuccess && isOpenLinkFlow && (
//             <Link
//               to={{
//                 pathname: `/digit-ui/citizen`,
//               }}
//             >
//               <SubmitBar label={t("BPA_COMMON_PROCEED_NEXT")} />
//             </Link>
//           )}
//         </Card> */}
//       {isRegistered ? <StakeholderAcknowledgementChildNotMutation {...{applicationNumber, mutation, isOpenLinkFlow}} /> : <StakeholderAcknowledgementChild {...{applicationNumber, mutation, isOpenLinkFlow}} />}
//       </div>
//     </div>
//     // </div>
//   );
// };

// export default StakeholderAcknowledgement;



// const GetActionMessage = (props) => {
//   const LicenseType = props?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
//   const { t } = useTranslation();
//   if (props.isSuccess) {
//     return !window.location.href.includes("edit-application")
//       ? `${t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${t(`CS_STAKEHOLDER_APPLICATION_SUCCESS`)}`
//       : t("CS_PROPERTY_UPDATE_APPLICATION_SUCCESS");
//   } else if (props.isLoading) {
//     return !window.location.href.includes("edit-application") ? t("CS_STAKEHOLDER_APPLICATION_PENDING") : t("CS_PROPERTY_UPDATE_APPLICATION_PENDING");
//   } else if (!props.isSuccess) {
//     return !window.location.href.includes("edit-application") ? t("CS_STAKEHOLDER_APPLICATION_FAILED") : t("CS_PROPERTY_UPDATE_APPLICATION_FAILED");
//   }
// };

// const BannerPicker = (props) => {
//   const LicenseType = props?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";
//   return (
//     <Banner
//       message={GetActionMessage(props)}
//       applicationNumber={props.data?.Licenses[0].applicationNumber}
//       info={props.isSuccess ? `${props.t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${props.t("BPA_NEW_STAKEHOLDER_REGISTRATION_APP_LABEL")}` : ""}
//       successful={props.isSuccess}
//       style={{ padding: "10px" }}
//       headerStyles={{ fontSize: "32px" }}
//     />
//   );
// };

// // <CHANGE> Simplified and consolidated acknowledgement content component
// const AcknowledgementContent = ({ mutation, applicationNumber, isOpenLinkFlow, mutationData }) => {
//   const { t } = useTranslation();
//   const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};
//   const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: applicationNumber, tenantId }, {});
  
//   // <CHANGE> Use mutation data if available, otherwise use fetched application details
//   const dataToDisplay = mutationData || applicationDetails;
//   const licenseType = dataToDisplay?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT";

//   const handleDownloadPdf = async () => {
//     try {
//       const Property = applicationDetails;
//       console.log("applicationDetails in StakeholderAck", applicationDetails);

//       if (!Property) {
//         console.error("No application details found");
//         return;
//       }

//       const propertyTenantId =
//         Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;

//       if (!propertyTenantId) {
//         console.error("No tenantId found in applicationDetails or sessionStorage");
//         return;
//       }

//       const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);

//       if (!tenantInfo) {
//         console.error("No tenantInfo found for tenantId:", propertyTenantId);
//         return;
//       }

//       const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
//       console.log(acknowledgementData, "ACKO");

//       Digit.Utils.pdf.generateBPAREG(acknowledgementData);
//     } catch (err) {
//       console.error("Error generating acknowledgement PDF", err);
//     }
//   };

//   // <CHANGE> Show loader only while fetching application details for PDF download
//   if (!dataToDisplay) {
//     return <Loader />;
//   }

//   const isSuccess = mutation.isSuccess || mutationData;
//   const isResubmit = dataToDisplay?.Licenses?.[0]?.action === "RESUBMIT";

//   return (
//     <Card>
//       <BannerPicker t={t} data={dataToDisplay} isSuccess={isSuccess} isLoading={mutation.isLoading} />
//       {isSuccess && <CardText>{`${t(`TRADELICENSE_TRADETYPE_${licenseType}`)}${t(`CS_FILE_STAKEHOLDER_RESPONSE`)}`}</CardText>}
//       {!isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}
      
//       {/* <CHANGE> Show payment button only for successful submissions that are not resubmits and not in openlink flow */}
//     <div style={{display:"flex", flexDirection:"row", gap:"10px", justifyContent:"space-between", alignItems:"center"}}>
//         {isSuccess && !isOpenLinkFlow && !isResubmit && dataToDisplay?.Licenses?.[0] && (
//         <Link
//           to={{
//             pathname: `/digit-ui/citizen/payment/collect/${dataToDisplay.Licenses[0].businessService}/${dataToDisplay.Licenses[0].applicationNumber}/${dataToDisplay.Licenses[0].tenantId}?tenantId=${dataToDisplay.Licenses[0].tenantId}`,
//             state: { tenantId: dataToDisplay.Licenses[0].tenantId },
//           }}
//         >
//           <SubmitBar label="Make Payment" />
//         </Link>
//       )}

//       {isSuccess && (
       
//           <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
   
//       )}
      
//       {!isOpenLinkFlow && (
//         <Link to={`/digit-ui/citizen`}>
//           <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
//         </Link>
//       )}
      
//       {isSuccess && isOpenLinkFlow && (
//         <Link to={{ pathname: `/digit-ui/citizen` }}>
//           <SubmitBar label={t("BPA_COMMON_PROCEED_NEXT")} />
//         </Link>
//       )}
//     </div>
//     </Card>
//   );
// };

// const StakeholderAcknowledgement = ({ data, onSuccess }) => {
//   const { t } = useTranslation();
//   const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
//   const mutation = Digit.Hooks.obps.useStakeholderAPI(tenantId, true);
//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};
//   const isOpenLinkFlow = window.location.href.includes("openlink");
//   const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;

//    const [isAcknowledgementReady, setIsAcknowledgementReady] = useState(false)
//   const [isStakeholderRegistered, setIsStakeholderRegistered] = useState(false)
  
//   const applicationNumber =
//     data?.result?.Licenses?.[0]?.applicationNumber ||
//     mutation?.data?.Licenses?.[0]?.applicationNumber ||
//     Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.applicationNumber;

//   // <CHANGE> Track mutation completion with local state instead of sessionStorage
//   const [mutationData, setMutationData] = useState(null);
//   const [hasMutated, setHasMutated] = useState(false);

//   console.log("[v0] Mutation state:", { 
//     isLoading: mutation.isLoading, 
//     isSuccess: mutation.isSuccess, 
//     isError: mutation.isError,
//     hasMutated,
//     mutationData: mutationData ? "present" : "null"
//   });

//   useEffect(() => {
//     const workflowActionCompleted = sessionStorage.getItem("workflowActionCompleted")
//     const workflowActionType = sessionStorage.getItem("workflowActionType")

//     if (workflowActionCompleted === "true") {
//       console.log("[v0] Workflow action already completed:", workflowActionType)
//       const storedMutationData = sessionStorage.getItem("stakeholder.mutationData")
//       if (storedMutationData) {
//         const parsedData = JSON.parse(storedMutationData)
//         setMutationData(parsedData)
//         setIsStakeholderRegistered(true)
//       }
//       return // Exit early - do not call mutation.mutate()
//     }

//     const isStakeholderRegistered = sessionStorage.getItem("isStakeholderRegistered")

//     if (isStakeholderRegistered === "true") {
//       return
//     }

//     if (data) {
//       try {
//         console.log("[v0] Starting mutation...")
//         const tenantId = data?.result?.Licenses[0]?.tenantId || window?.localStorage?.getItem("CITIZEN.CITY")
//         data.tenantId = tenantId
//         const formdata = convertToStakeholderObject(data)

//         mutation.mutate(formdata, {
//           onSuccess: (responseData, variables, context) => {
//             console.log("[v0] Mutation successful:", responseData)
//             sessionStorage.setItem("isStakeholderRegistered", "true")
//             sessionStorage.setItem("stakeholder.mutationData", JSON.stringify(responseData))
//             setMutationData(responseData)
//             setIsStakeholderRegistered(true)

//             if (onSuccess) {
//               onSuccess(responseData, variables, context)
//             }
//           },
//           onError: (error) => {
//             console.error("[v0] Mutation failed:", error)
//           },
//         })
//       } catch (err) {
//         console.error("[v0] Error in mutation setup:", err)
//       }
//     }
//   }, [data])

//   // <CHANGE> Show loader only while mutation is in progress
//   // const isLoading = mutation.isLoading || (!hasMutated && !mutationData);

//     if (mutation.isLoading || (!isAcknowledgementReady && !mutation.isSuccess)) {
//     return <Loader />
//   }


//   return (
//     <div>
//       <div className={isOpenLinkFlow ? "OpenlinkContainer" : ""}>
//         {isOpenLinkFlow && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        
//         {isLoading ? (
//           <Loader />
//         ) : (
//           <AcknowledgementContent 
//             mutation={mutation} 
//             applicationNumber={applicationNumber} 
//             isOpenLinkFlow={isOpenLinkFlow}
//             mutationData={mutationData}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default StakeholderAcknowledgement;



const GetActionMessage = (props) => {
  const LicenseType =
    props?.data?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT"
  const { t } = useTranslation()
  if (props.isSuccess) {
    return !window.location.href.includes("edit-application")
      ? `${t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${t(`CS_STAKEHOLDER_APPLICATION_SUCCESS`)}`
      : t("CS_PROPERTY_UPDATE_APPLICATION_SUCCESS")
  } else if (props.isLoading) {
    return !window.location.href.includes("edit-application")
      ? t("CS_STAKEHOLDER_APPLICATION_PENDING")
      : t("CS_PROPERTY_UPDATE_APPLICATION_PENDING")
  } else if (!props.isSuccess) {
    return !window.location.href.includes("edit-application")
      ? t("CS_STAKEHOLDER_APPLICATION_FAILED")
      : t("CS_PROPERTY_UPDATE_APPLICATION_FAILED")
  }
}

const BannerPicker = (props) => {

  console.log(props, "BannerPicker Props");
  const LicenseType =
    props?.data?.applicationData?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT"
  return (
    <Banner
      message={GetActionMessage(props)}
      applicationNumber={props.data?.Licenses[0].applicationNumber || props.data?.applicationData?.applicationNumber}
      info={
        props.isSuccess
          ? `${props.t(`TRADELICENSE_TRADETYPE_${LicenseType}`)} ${props.t("BPA_NEW_STAKEHOLDER_REGISTRATION_APP_LABEL")}`
          : ""
      }
      successful={props.isSuccess}
      style={{ padding: "10px" }}
      headerStyles={{ fontSize: "32px" }}
    />
  )
}

const AcknowledgementContent = ({
  mutation,
  applicationNumber,
  isOpenLinkFlow,
  mutationData,
  isAcknowledgementReady,
}) => {
  const { t } = useTranslation()
  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY")
  const { data: storeData } = Digit.Hooks.useStore.getInitData()
  const { tenants } = storeData || {}
  const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(
    tenantId,
    { applicationNumber: applicationNumber, tenantId },
    {},
  )

  const dataToDisplay = mutationData || mutation.data || applicationDetails
  const licenseType =
    dataToDisplay?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] || "ARCHITECT"

  const handleDownloadPdf = async () => {
    try {
      const Property = applicationDetails
      console.log("applicationDetails in StakeholderAck", applicationDetails)

      if (!Property) {
        console.error("No application details found")
        return
      }

      const propertyTenantId =
        Property?.tenantId ||
        Property?.Licenses?.[0]?.tenantId ||
        Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId

      if (!propertyTenantId) {
        console.error("No tenantId found in applicationDetails or sessionStorage")
        return
      }

      const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId)

      if (!tenantInfo) {
        console.error("No tenantInfo found for tenantId:", propertyTenantId)
        return
      }

      const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t)
      console.log(acknowledgementData, "ACKO")

      Digit.Utils.pdf.generateBPAREG(acknowledgementData)
    } catch (err) {
      console.error("Error generating acknowledgement PDF", err)
    }
  }

  if (!dataToDisplay) {
    return <Loader />
  }

  const isSuccess = mutation.isSuccess || isAcknowledgementReady
  const isResubmit = dataToDisplay?.Licenses?.[0]?.action === "RESUBMIT"

  return (
    <Card>
      <BannerPicker t={t} data={dataToDisplay} isSuccess={isSuccess} isLoading={mutation.isLoading} />
      {isSuccess && (
        <CardText>{`${t(`TRADELICENSE_TRADETYPE_${licenseType}`)}${t(`CS_FILE_STAKEHOLDER_RESPONSE`)}`}</CardText>
      )}
      {!isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}</CardText>}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isSuccess && !isOpenLinkFlow && !isResubmit && dataToDisplay?.Licenses?.[0] && (
          <Link
            to={{
              pathname: `/digit-ui/citizen/payment/collect/${dataToDisplay.Licenses[0].businessService}/${dataToDisplay.Licenses[0].applicationNumber}/${dataToDisplay.Licenses[0].tenantId}?tenantId=${dataToDisplay.Licenses[0].tenantId}`,
              state: { tenantId: dataToDisplay.Licenses[0].tenantId },
            }}
          >
            <SubmitBar label="Make Payment" />
          </Link>
        )}

        {isSuccess && <SubmitBar label={t("CS_COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />}

        {!isOpenLinkFlow && (
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        )}

        {isSuccess && isOpenLinkFlow && (
          <Link to={{ pathname: `/digit-ui/citizen` }}>
            <SubmitBar label={t("BPA_COMMON_PROCEED_NEXT")} />
          </Link>
        )}
      </div>
    </Card>
  )
}

const StakeholderAcknowledgement = ({ data, onSuccess }) => {
  const { t } = useTranslation()
  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY")
  const mutation = Digit.Hooks.obps.useStakeholderAPI(tenantId, true)
  const { data: storeData } = Digit.Hooks.useStore.getInitData()
  const { tenants } = storeData || {}
  const isOpenLinkFlow = window.location.href.includes("openlink")

  const applicationNumber =
    data?.result?.Licenses?.[0]?.applicationNumber ||
    mutation?.data?.Licenses?.[0]?.applicationNumber ||
    Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.applicationNumber

  const [mutationData, setMutationData] = useState(null)
  const [hasMutated, setHasMutated] = useState(false)
  const [isAcknowledgementReady, setIsAcknowledgementReady] = useState(false)

  useEffect(() => {
    const workflowActionCompleted = sessionStorage.getItem("workflowActionCompleted")
    const workflowActionType = sessionStorage.getItem("workflowActionType")

    console.log("[v0] Mutation state:", {
      isLoading: mutation.isLoading,
      isSuccess: mutation.isSuccess,
      isError: mutation.isError,
      hasMutated,
      mutationData: JSON.stringify(mutation.data),
      isAcknowledgementReady,
    })

    if (workflowActionCompleted === "true") {
      console.log("[v0] Workflow action already completed:", workflowActionType)

      setIsAcknowledgementReady(true)

      const storedMutationData = sessionStorage.getItem("mutationData")
      if (storedMutationData) {
        console.log("[v0] Retrieved stored mutation data")
      } else {
        console.log("[v0] No stored mutation data found, setting acknowledgement ready anyway")
      }

      return 
    }

    const isStakeholderRegistered = sessionStorage.getItem("isStakeholderRegistered")

    if (isStakeholderRegistered === "true" || hasMutated) {
      console.log("[v0] Already registered or mutated, skipping")
      return
    }

    if (!hasMutated && data) {
      try {
        console.log("[v0] Starting mutation...")
        const tenantId = data?.result?.Licenses[0]?.tenantId || window?.localStorage?.getItem("CITIZEN.CITY")
        data.tenantId = tenantId
        const formdata = convertToStakeholderObject(data)

        setHasMutated(true)

        mutation.mutate(formdata, {
          onSuccess: (responseData, variables, context) => {
            console.log("[v0] Mutation successful:", responseData)
            sessionStorage.setItem("isStakeholderRegistered", "true")
            sessionStorage.setItem("mutationData", JSON.stringify(responseData))
            setMutationData(responseData)
            setIsAcknowledgementReady(true)

            if (onSuccess) {
              onSuccess(responseData, variables, context)
            }
          },
          onError: (error) => {
            console.error("[v0] Mutation failed:", error)
          },
        })
      } catch (err) {
        console.error("[v0] Error in mutation setup:", err)
      }
    }
  }, []) 

  const isLoading = mutation.isLoading && !isAcknowledgementReady

  return (
    <div>
      <div className={isOpenLinkFlow ? "OpenlinkContainer" : ""}>
        {isOpenLinkFlow && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}

        {isLoading ? (
          <Loader />
        ) : (
          <AcknowledgementContent
            mutation={mutation}
            applicationNumber={applicationNumber}
            isOpenLinkFlow={isOpenLinkFlow}
            mutationData={mutationData}
            isAcknowledgementReady={isAcknowledgementReady}
          />
        )}
      </div>
    </div>
  )
}

export default StakeholderAcknowledgement


