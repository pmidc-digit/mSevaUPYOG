// import cloneDeep from "lodash/cloneDeep";
// import { createPayloadOfWS, updatePayloadOfWS } from "./index";

// export const createAndUpdateWS = async (
//   data,
//   propertyDetails,
//   waterMutation,
//   sewerageMutation,
//   waterUpdateMutation,
//   sewerageUpdateMutation,
//   clearSessionFormData,
//   history,
//   waterAndSewerageBoth,
//   appDetails,
//   setIsEnableLoader,
//   setShowToast,
//   setAppDetails,
//   setWaterAndSewerageBoth,
//   closeToastOfError
// ) => {
//   console.log("Data WS new application onSubmit:\n", data);
//   if (!data?.cpt?.id && !propertyDetails?.Properties?.[0]) {
//     if (!data?.cpt?.details || !propertyDetails) {
//       setShowToast({ key: "error", message: "ERR_INVALID_PROPERTY_ID" });
//       return;
//     }
//   }

//   const errors = sessionStorage.getItem("FORMSTATE_ERRORS");
//   const formStateErros = typeof errors == "string" ? JSON.parse(errors) : {};

//   if (
//     Object.keys(formStateErros).length > 0 &&
//     !(
//       Object.keys(formStateErros).length == 1 &&
//       formStateErros?.["ConnectionHolderDetails"]?.type &&
//       Object.keys(formStateErros?.["ConnectionHolderDetails"]?.type)?.length == 1 &&
//       formStateErros["ConnectionHolderDetails"] &&
//       Object.values(formStateErros["ConnectionHolderDetails"].type).filter((ob) => ob.type === "required" && ob?.ref?.value !== "").length > 0
//     )
//   ) {
//     setShowToast({ warning: true, message: "PLEASE_FILL_MANDATORY_DETAILS" });
//     return;
//   } else {
//     if (!data?.cpt?.details) {
//       data.cpt = {
//         details: propertyDetails?.Properties?.[0],
//       };
//     }
//     const allDetails = cloneDeep(data);
//     const payload = await createPayloadOfWS(data);
//     let waterAndSewerageLoader = false,
//       waterLoader = false,
//       sewerageLoader = false;
//     if (payload?.water && payload?.sewerage) waterAndSewerageLoader = true;
//     if (payload?.water && !payload?.sewerage) waterLoader = true;
//     if (!payload?.water && payload?.sewerage) sewerageLoader = true;
//     let waterConnection = { WaterConnection: payload, disconnectRequest: false, reconnectRequest: false };
//     let sewerageConnection = { SewerageConnection: payload, disconnectRequest: false, reconnectRequest: false };

//     if (waterAndSewerageLoader) {
//       setWaterAndSewerageBoth(true);
//       sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(true));
//     } else {
//       sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(false));
//     }

//     if (payload?.water && payload?.sewerage) {
//       if (waterMutation && sewerageMutation) {
//         setIsEnableLoader(true);
//         await waterMutation(waterConnection, {
//           onError: (error, variables) => {
//             setIsEnableLoader(false);
//             setShowToast({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
//             setTimeout(closeToastOfError, 5000);
//           },
//           onSuccess: async (waterData, variables) => {
//             let response = await updatePayloadOfWS(waterData?.WaterConnection?.[0], "WATER");
//             let waterConnectionUpdate = { WaterConnection: response, disconnectRequest: false, reconnectRequest: false };
//             waterUpdateMutation(waterConnectionUpdate, {
//               onError: (error, variables) => {
//                 setIsEnableLoader(false);
//                 setShowToast({
//                   key: "error",
//                   message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
//                 });
//                 setTimeout(closeToastOfError, 5000);
//               },
//               onSuccess: async (waterUpdateData, variables) => {
//                 setAppDetails({ ...appDetails, waterConnection: waterUpdateData?.WaterConnection?.[0] });
//                 await sewerageMutation(sewerageConnection, {
//                   onError: (error, variables) => {
//                     setIsEnableLoader(false);
//                     setShowToast({
//                       key: "error",
//                       message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
//                     });
//                     setTimeout(closeToastOfError, 5000);
//                   },
//                   onSuccess: async (sewerageData, variables) => {
//                     let response = await updatePayloadOfWS(sewerageData?.SewerageConnections?.[0], "SEWERAGE");
//                     let sewerageConnectionUpdate = { SewerageConnection: response, disconnectRequest: false, reconnectRequest: false };
//                     await sewerageUpdateMutation(sewerageConnectionUpdate, {
//                       onError: (error, variables) => {
//                         setIsEnableLoader(false);
//                         setShowToast({
//                           key: "error",
//                           message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
//                         });
//                         setTimeout(closeToastOfError, 5000);
//                       },
//                       onSuccess: async (sewerageUpdateData, variables) => {
//                         setAppDetails({ ...appDetails, sewerageConnection: sewerageUpdateData?.SewerageConnections?.[0] });
//                         clearSessionFormData();
//                         history.push(
//                           `/digit-ui/employee/ws/ws-response?applicationNumber=${waterUpdateData?.WaterConnection?.[0]?.applicationNo}&applicationNumber1=${sewerageUpdateData?.SewerageConnections?.[0]?.applicationNo}`
//                         );
//                         // window.location.href = `${window.location.origin}/digit-ui/employee/ws/ws-response?applicationNumber=${waterUpdateData?.WaterConnection?.[0]?.applicationNo}&applicationNumber1=${sewerageUpdateData?.SewerageConnections?.[0]?.applicationNo}`
//                       },
//                     });
//                   },
//                 });
//               },
//             });
//           },
//         });
//       }
//     } else if (payload?.water && !payload?.sewerage) {
//       if (waterMutation) {
//         setIsEnableLoader(true);
//         await waterMutation(waterConnection, {
//           onError: (error, variables) => {
//             setIsEnableLoader(false);
//             setShowToast({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
//             setTimeout(closeToastOfError, 5000);
//           },
//           onSuccess: async (data, variables) => {
//             let response = await updatePayloadOfWS(data?.WaterConnection?.[0], "WATER");
//             let waterConnectionUpdate = { WaterConnection: response };
//             waterUpdateMutation(waterConnectionUpdate, {
//               onError: (error, variables) => {
//                 setIsEnableLoader(false);
//                 setShowToast({
//                   key: "error",
//                   message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
//                 });
//                 setTimeout(closeToastOfError, 5000);
//               },
//               onSuccess: (data, variables) => {
//                 setAppDetails({ ...appDetails, waterConnection: data?.WaterConnection?.[0] });
//                 clearSessionFormData();
//                 history.push(`/digit-ui/employee/ws/ws-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`);
//                 // window.location.href = `${window.location.origin}/digit-ui/employee/ws/ws-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`;
//               },
//             });
//           },
//         });
//       }
//     } else if (payload?.sewerage && !payload?.water) {
//       if (sewerageMutation) {
//         setIsEnableLoader(true);
//         await sewerageMutation(sewerageConnection, {
//           onError: (error, variables) => {
//             setIsEnableLoader(false);
//             setShowToast({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
//             setTimeout(closeToastOfError, 5000);
//           },
//           onSuccess: async (data, variables) => {
//             let response = await updatePayloadOfWS(data?.SewerageConnections?.[0], "SEWERAGE");
//             let sewerageConnectionUpdate = { SewerageConnection: response };
//             await sewerageUpdateMutation(sewerageConnectionUpdate, {
//               onError: (error, variables) => {
//                 setIsEnableLoader(false);
//                 setShowToast({
//                   key: "error",
//                   message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
//                 });
//                 setTimeout(closeToastOfError, 5000);
//               },
//               onSuccess: (data, variables) => {
//                 setAppDetails({ ...appDetails, sewerageConnection: data?.SewerageConnections?.[0] });
//                 clearSessionFormData();
//                 history.push(`/digit-ui/employee/ws/ws-response?applicationNumber1=${data?.SewerageConnections?.[0]?.applicationNo}`);
//                 // window.location.href = `${window.location.origin}/digit-ui/employee/ws/ws-response?applicationNumber1=${data?.SewerageConnections?.[0]?.applicationNo}`;
//               },
//             });
//           },
//         });
//       }
//     }
//   }
// };
