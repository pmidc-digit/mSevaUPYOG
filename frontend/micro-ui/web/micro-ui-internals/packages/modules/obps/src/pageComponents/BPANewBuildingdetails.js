// import React, { useEffect, useState, Fragment } from "react";
// import { FormStep, TextInput, CardLabel, Dropdown, UploadFile, SearchIcon } from "@mseva/digit-ui-react-components";
// import Timeline from "../components/Timeline";
// import { useLocation, useRouteMatch } from "react-router-dom";
// import { Controller, useForm } from "react-hook-form";

// const BPANewBuildingdetails = ({ t, config, onSelect, formData }) => {
//   const { pathname: url } = useLocation();
//   const index = window.location.href.charAt(window.location.href.length - 1);
//   let validation = {};

//   const SESSION_STORAGE_KEY = "Digit.BUILDING_PERMIT";

//   const getSessionData = () => {
//     try {
//       const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         return parsed.value || {};
//       }
//     } catch (error) {
//       console.error("Error reading session storage:", error);
//     }
//     return {};
//   };

//   const sessionData = getSessionData();
//   console.log(sessionData, "SESSION DATA");
//   const cityData = sessionData.city || {};
//   console.log(cityData, "CITY DATA");
//   const dataObj = sessionData.data || {};
//   console.log(formData, "FORMDATA");
//   const [approvedColony, setapprovedColony] = useState(formData?.owners?.approvedColony || "");
//   const [masterPlan, setmasterPlan] = useState(formData?.owners?.masterPlan || "");
//   const [UlbName, setUlbName] = useState(formData?.address?.city?.name || "");
//   const [buildingStatus, setbuildingStatus] = useState(formData?.owners?.buildingStatus || "");
//   const [schemes, setschemes] = useState(formData?.owners?.schemes || "");
//   const [purchasedFAR, setpurchasedFAR] = useState(formData?.owners?.purchasedFAR || "");
//   const [greenbuilding, setgreenbuilding] = useState(formData?.owners?.greenbuilding || "");
//   const [restrictedArea, setrestrictedArea] = useState(formData?.owners?.restrictedArea || "");
//   const [District, setDistrict] = useState(formData?.address?.city?.districtName || "");
//   const [proposedSite, setproposedSite] = useState(formData?.owners?.proposedSite || "");
//   const [nameofApprovedcolony, setnameofApprovedcolony] = useState(formData?.owners?.nameofApprovedcolony || "");
//   const [NocNumber, setNocNumber] = useState(formData?.owners?.NocNumber || "");
//   const [schemesselection, setschemesselection] = useState(formData?.owners?.schemesselection || "");
//   const [schemeName, setschemeName] = useState(formData?.owners?.schemeName || "");
//   const [transferredscheme, settransferredscheme] = useState("Pre-Approved Standard Designs" || "");
//   const [rating, setrating] = useState(formData?.owners?.rating || "");
//   const [use, setUse] = useState(formData?.owners?.use || "");
//   const [Ulblisttype, setUlblisttype] = useState(
//     // formData?.owners?.Ulblisttype || (cityData.ulbType ? { code: cityData.ulbType, name: cityData.ulbType } : "")
//     formData?.address?.city?.type || (cityData.ulbType ? { code: cityData.ulbType, name: cityData.ulbType } : ""),
//   );
//   const [uploadedFile, setUploadedFile] = useState(formData?.owners?.uploadedFile);
//   const [greenuploadedFile, setGreenUploadedFile] = useState(formData?.owners?.greenuploadedFile);
//   console.log(formData?.address?.city?.name, "FORM DATA DATA");

//    const validateFields = () => {
//     const newErrors = {}

//     if (!UlbName) newErrors.UlbName = "ULB Name is required"
//     if (!District) newErrors.District = "District is required"
//     if (!Ulblisttype) newErrors.Ulblisttype = "ULB Type is required"
//     if (!approvedColony) newErrors.approvedColony = "Approved Colony is required"
//     if (!masterPlan) newErrors.masterPlan = "Master Plan is required"
//     if (!buildingStatus) newErrors.buildingStatus = "Building Status is required"
//     if (!purchasedFAR) newErrors.purchasedFAR = "Purchased FAR is required"
//     if (!greenbuilding) newErrors.greenbuilding = "Green Building is required"
//     if (!restrictedArea) newErrors.restrictedArea = "Restricted Area is required"
//     if (!proposedSite) newErrors.proposedSite = "Proposed Site Type is required"

//     // Conditional validations
//     if (approvedColony?.code === "YES" && !nameofApprovedcolony) {
//       newErrors.nameofApprovedcolony = "Approved Colony Name is required"
//     }

//     if (approvedColony?.code === "NO" && !NocNumber && !uploadedFile) {
//       newErrors.NocNumber = "NOC Number or NOC Document is required"
//     }

//     if (greenbuilding?.code === "YES") {
//       if (!greenuploadedFile) newErrors.greenuploadedFile = "Green Building Document is required"
//       if (!rating) newErrors.rating = "Rating is required"
//     }

//     if (masterPlan?.code === "YES" && !use) {
//       newErrors.use = "Use is required"
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const saveToSessionStorage = () => {
//     try {
//       const currentData = getSessionData();
//       const updatedData = {
//         ...currentData,
//         buildingDetails: {
//           approvedColony,
//           masterPlan,
//           UlbName,
//           buildingStatus,
//           schemes,
//           purchasedFAR,
//           greenbuilding,
//           restrictedArea,
//           District,
//           proposedSite,
//           nameofApprovedcolony,
//           NocNumber,
//           schemesselection,
//           schemeName,
//           transferredscheme,
//           rating,
//           use,
//           Ulblisttype,
//           uploadedFile,
//           greenuploadedFile,
//           lastUpdated: Date.now(),
//         },
//       };

//       const sessionStorageData = {
//         value: updatedData,
//         ttl: 86400,
//         expiry: Date.now() + 86400 * 1000,
//       };

//       sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionStorageData));
//     } catch (error) {
//       console.error("Error saving to session storage:", error);
//     }
//   };

//   useEffect(() => {
//     saveToSessionStorage();
//   }, [
//     approvedColony,
//     masterPlan,
//     UlbName,
//     buildingStatus,
//     schemes,
//     purchasedFAR,
//     greenbuilding,
//     restrictedArea,
//     District,
//     proposedSite,
//     nameofApprovedcolony,
//     NocNumber,
//     schemesselection,
//     schemeName,
//     transferredscheme,
//     rating,
//     use,
//     Ulblisttype,
//     uploadedFile,
//     greenuploadedFile,
//   ]);

//   const [files, setFiles] = useState();
//   const [file, setFile] = useState();
//   const [error, setError] = useState(null);
//   const [uploadMessage, setUploadMessage] = useState("");
//   const Webview = !Digit.Utils.browser.isMobile();
//   const acceptFormat = ".pdf";

//   useEffect(() => {
//     (async () => {
//       setError(null);
//       if (file && file?.type) {
//         if (!acceptFormat?.split(",")?.includes(`.${file?.type?.split("/")?.pop()}`)) {
//           setError(t("PT_UPLOAD_FORMAT_NOT_SUPPORTED"));
//         } else if (file.size >= 2000000) {
//           setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
//         } else {
//           try {
//             const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
//             if (response?.data?.files?.length > 0) {
//               setUploadedFile(response?.data?.files[0]?.fileStoreId);
//             } else {
//               setError(t("PT_FILE_UPLOAD_ERROR"));
//             }
//           } catch (err) {}
//         }
//       }
//     })();
//   }, [file]);

//   useEffect(() => {
//     (async () => {
//       setError(null);
//       if (files && files?.type) {
//         if (!acceptFormat?.split(",")?.includes(`.${files?.type?.split("/")?.pop()}`)) {
//           setError(t("PT_UPLOAD_FORMAT_NOT_SUPPORTED"));
//         } else if (files.size >= 2000000) {
//           setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
//         } else {
//           try {
//             const response = await Digit.UploadServices.Filestorage("property-upload", files, Digit.ULBService.getStateId());
//             if (response?.data?.files?.length > 0) {
//               setGreenUploadedFile(response?.data?.files[0]?.fileStoreId);
//             } else {
//               setError(t("PT_FILE_UPLOAD_ERROR"));
//             }
//           } catch (err) {}
//         }
//       }
//     })();
//   }, [files]);

//   const approvedcolonyStatus = [
//     {
//       code: "YES",
//       i18nKey: "YES",
//     },
//     {
//       code: "NO",
//       i18nKey: "NO",
//     },
//     {
//       code: "LAL_LAKEER",
//       i18nKey: "LAL LAKEER",
//     },
//   ];

//   const common = [
//     {
//       code: "YES",
//       i18nKey: "YES",
//     },
//     {
//       code: "NO",
//       i18nKey: "NO",
//     },
//   ];

//   const Typeofproposedsite = [
//     {
//       code: "PROPOSED",
//       i18nKey: "Proposed",
//     },
//   ];

//   const stateId = Digit.ULBService.getStateId();

//   const { data: ulbList } = Digit.Hooks.obps.useUlbType(stateId, "BPA", "UlbType");
//   const { data: districtMenu } = Digit.Hooks.obps.useDistricts(stateId, "BPA", "Districts");
//   const { data: ULB } = Digit.Hooks.obps.useULBList(stateId, "BPA", "Ulb");

//   const ulblists = [];
//   const menu = [];
//   const ulb = [];

//   ulbList &&
//     ulbList.map((ulbtypelist) => {
//       if (ulbtypelist?.Districts === UlbName?.code)
//         ulblists.push({ i18nKey: `${ulbtypelist.name}`, code: `${ulbtypelist.code}`, value: `${ulbtypelist.name}` });
//     });

//   districtMenu &&
//     districtMenu.map((districts) => {
//       menu.push({ i18nKey: `${districts.name}`, code: `${districts.code}`, value: `${districts.name}` });
//     });

//   ULB &&
//     ULB.map((ulblist) => {
//       if (ulblist.Districts == UlbName?.code) {
//         ulb.push({
//           i18nKey: `${ulblist.name}`,
//           code: `${ulblist.code}`,
//           value: `${ulblist.name}`,
//         });
//       }
//     });

//   const { data: commonBuilding } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "BuildingStatus" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["BuildingStatus"];
//       return formattedData;
//     },
//   });

//   const building_status = [];

//   commonBuilding &&
//     commonBuilding.map((selectBuilding) => {
//       building_status.push({
//         i18nKey: `BPA_${selectBuilding.code}`,
//         code: `${selectBuilding.code}`,
//         value: `${selectBuilding.name}`,
//       });
//     });

//   const { data: commonrating } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "RatingValue" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["RatingValue"];
//       return formattedData;
//     },
//   });

//   const selectRating = [];

//   commonrating &&
//     commonrating.map((selectRatings) => {
//       selectRating.push({
//         i18nKey: `BPA_${selectRatings.code}`,
//         code: `${selectRatings.code}`,
//         value: `${selectRatings.name}`,
//       });
//     });

//   const { data: commonmasterFields } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "MasterFields" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["MasterFields"];
//       return formattedData;
//     },
//   });

//   const selectmasterDrop = [];

//   commonmasterFields &&
//     commonmasterFields.map((selectMaster) => {
//       selectmasterDrop.push({
//         i18nKey: `BPA_${selectMaster.code}`,
//         code: `${selectMaster.code}`,
//         value: `${selectMaster.name}`,
//       });
//     });

//   const { data: commonScheme } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "Scheme" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["Scheme"];
//       return formattedData;
//     },
//   });

//   const selectscheme = [];

//   commonScheme &&
//     commonScheme.map((selectScheme) => {
//       selectscheme.push({
//         i18nKey: `BPA_${selectScheme.code}`,
//         code: `${selectScheme.code}`,
//         value: `${selectScheme.name}`,
//       });
//     });

//   const { data: commonSchemeType } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "SchemeType" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["SchemeType"];
//       return formattedData;
//     },
//   });

//   const selectschemetypes = [];

//   commonSchemeType &&
//     commonSchemeType.map((selectscheme) => {
//       selectschemetypes.push({
//         i18nKey: `BPA_${selectscheme.code}`,
//         code: `${selectscheme.code}`,
//         value: `${selectscheme.name}`,
//       });
//     });

//   const { control } = useForm();

//   function setApprovedColony(e) {
//     setapprovedColony(e.target.value);
//   }

//   function setMasterPlan(e) {
//     setmasterPlan(e.target.value);
//   }

//   function setRatings(e) {
//     setrating(e.target.value);
//   }

//   function setulbname(e) {
//     setUlbName(e.target.value);
//   }

//   function setulblisttype(e) {
//     setUlblisttype(e.target.value);
//   }

//   function setBuildingStatus(e) {
//     setbuildingStatus(e.target.value);
//   }

//   function setSchemes(e) {
//     setschemes(e.target.value);
//   }

//   function setSchemeselection(e) {
//     setschemesselection(e.target.value);
//   }

//   function setPurchasedFAR(e) {
//     setpurchasedFAR(e.target.value);
//   }

//   function setGreenbuilding(e) {
//     setgreenbuilding(e.target.value);
//   }

//   function setRestrictedArea(e) {
//     setrestrictedArea(e.target.value);
//   }

//   function setdistrict(e) {
//     setDistrict(e.target.value);
//   }

//   function setProposedSite(e) {
//     setproposedSite(e.target.value);
//   }

//   function setNameapprovedcolony(e) {
//     setnameofApprovedcolony(e.target.value);
//   }

//   function setnocNumber(e) {
//     setNocNumber(e.target.value);
//   }

//   function setSchemename(e) {
//     setschemeName(e.target.value);
//   }

//   function TransferredScheme(e) {
//     settransferredscheme(e.target.value);
//   }

//   function selectfile(e) {
//     setUploadedFile(e.target.files[0]);
//     setFile(e.target.files[0]);
//   }

//   function onClick(e) {
//     console.log("inside_NOC_search");
//   }

//   function selectfiles(e) {
//     setGreenUploadedFile(e.target.files[0]);
//     setFiles(e.target.files[0]);
//   }

//   function setuse(e) {
//     setUse(e.target.value);
//   }

//   const goNext = () => {
//     const owners = formData.owners && formData.owners[index];
//     const ownerStep = {
//       ...owners,
//       approvedColony,
//       use,
//       UlbName,
//       Ulblisttype,
//       District,
//       rating,
//       masterPlan,
//       buildingStatus,
//       schemes,
//       schemesselection,
//       purchasedFAR,
//       greenbuilding,
//       restrictedArea,
//       proposedSite,
//       nameofApprovedcolony,
//       schemeName,
//       transferredscheme,
//       NocNumber,
//       uploadedFile,
//       greenuploadedFile,
//     };
//     const updatedFormData = { ...formData };

//     // Check if owners array exists in formData if not, then it will add it
//     if (!updatedFormData.owners) {
//       updatedFormData.owners = [];
//     }
//     if (approvedColony?.code == "NO") {
//       if (NocNumber || uploadedFile || formData?.owners?.uploadedFile) {
//         if (greenbuilding?.code === "YES") {
//           if (greenuploadedFile || formData?.owners?.greenuploadedFile) {
//             onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index);
//           } else {
//             alert("Please Upload Document");
//           }
//         } else {
//           onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index);
//         }
//       } else {
//         alert("Please fill NOC number or Upload NOC Document");
//       }
//     } else {
//       if (greenbuilding?.code === "YES") {
//         if (greenuploadedFile || formData?.owners?.greenuploadedFile) {
//           onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index);
//         } else {
//           alert("Please Upload Document");
//         }
//       } else {
//         onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index);
//       }
//     }
//   };

//   const onSkip = () => onSelect();

//   const renderFields = () => {
//     switch (approvedColony?.code) {
//       case "YES":
//         return (
//           <>
//             <CardLabel>{`${t("BPA_APPROVED_COLONY_NAME")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="nameofApprovedcolony"
//               value={nameofApprovedcolony}
//               onChange={setNameapprovedcolony}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z ]*$",
//                 type: "text",
//                 title: t("TL_NAME_ERROR_MESSAGE"),
//               })}
//             />
//           </>
//         );
//       case "NO":
//         return (
//           <>
//             <CardLabel>{`${t("BPA_NOC_NUMBER")} *`}</CardLabel>
//             <div className="field-container">
//               <TextInput
//                 t={t}
//                 type={"text"}
//                 isMandatory={false}
//                 optionKey="i18nKey"
//                 defaultValue={formData?.owners?.NocNumber}
//                 name="NocNumber"
//                 value={NocNumber}
//                 onChange={setnocNumber}
//                 style={{ width: "86%" }}
//                 ValidationRequired={false}
//                 {...(validation = {
//                   pattern: "^[a-zA-Z0-9]*$",
//                   type: "text",
//                   title: t("TL_NAME_ERROR_MESSAGE"),
//                 })}
//               />
//               <div
//                 style={{
//                   position: "relative",
//                   zIndex: "100",
//                   right: "95px",
//                   marginTop: "-24px",
//                   marginRight: Webview ? "-20px" : "-20px",
//                 }}
//                 onClick={(e) => onClick(e)}
//               >
//                 {" "}
//                 <SearchIcon />{" "}
//               </div>
//             </div>
//             <div style={{ position: "relative", fontWeight: "bold", left: "20px" }}>OR</div>
//             <UploadFile
//               id={"noc-doc"}
//               style={{ width: "86%" }}
//               onUpload={selectfile}
//               onDelete={() => {
//                 setUploadedFile(null);
//                 setFile("");
//               }}
//               message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
//               error={error}
//               uploadMessage={uploadMessage}
//             />
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderGreenbuildingfields = () => {
//     switch (greenbuilding?.code) {
//       case "YES":
//         return (
//           <>
//             <UploadFile
//               id={"green-building-doc"}
//               onUpload={selectfiles}
//               onDelete={() => {
//                 setGreenUploadedFile(null);
//                 setFiles("");
//               }}
//               message={greenuploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
//               error={error}
//               uploadMessage={uploadMessage}
//             />
//             <br></br>

//             <CardLabel>{`${t("BPA_SELECT_RATINGS")} *`}</CardLabel>
//             <Controller
//               control={control}
//               name={"rating"}
//               defaultValue={rating}
//               rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//               render={(props) => (
//                 <Dropdown className="form-field" selected={rating} select={setrating} option={selectRating} optionKey="i18nKey" t={t} />
//               )}
//             />
//           </>
//         );
//       case "NO":
//         return null;
//       default:
//         return null;
//     }
//   };

//   const Master_plan_render_fields = () => {
//     switch (masterPlan?.code) {
//       case "YES":
//         return (
//           <>
//             <CardLabel>{`${t("BPA_USE")} *`}</CardLabel>
//             <Controller
//               control={control}
//               name={"use"}
//               defaultValue={use}
//               rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//               render={(props) => (
//                 <Dropdown className="form-field" selected={use} select={setUse} option={selectmasterDrop} optionKey="i18nKey" t={t} />
//               )}
//             />
//           </>
//         );
//       case "NO":
//         return null;
//       default:
//         return null;
//     }
//   };

//   const renderschemedropdown = () => {
//     switch (schemes?.code) {
//       case "SCHEME":
//         return (
//           <>
//             <CardLabel>{`${t("BPA_SCHEME_TYPE_LABEL")} *`}</CardLabel>
//             <Controller
//               control={control}
//               name={"schemesselection"}
//               defaultValue={schemesselection}
//               rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//               render={(props) => (
//                 <Dropdown
//                   className="form-field"
//                   selected={schemesselection}
//                   select={setschemesselection}
//                   option={selectschemetypes}
//                   optionKey="i18nKey"
//                   t={t}
//                 />
//               )}
//             />

//             <CardLabel>{`${t("BPA_SCHEME_NAME")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="schemeName"
//               value={schemeName}
//               onChange={setSchemename}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z-.`' ]*$",
//                 type: "text",
//                 title: t("PT_NAME_ERROR_MESSAGE"),
//               })}
//             />

//             <CardLabel>{`${t("BPA_TRANFERRED_SCHEME_LABEL")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="transferredscheme"
//               value={transferredscheme}
//               onChange={TransferredScheme}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z-.`' ]*$",
//                 type: "text",
//                 title: t("PT_NAME_ERROR_MESSAGE"),
//               })}
//             />
//           </>
//         );
//       case "NON_SCHEME":
//         return null;
//       default:
//         return null;
//     }
//   };

//   return (
//     <React.Fragment>
//       <Timeline currentStep={2} />
//       <FormStep
//         config={config}
//         onSelect={goNext}
//         onSkip={onSkip}
//         t={t}
//         isDisabled={
//           !approvedColony ||
//           !masterPlan ||
//           !Ulblisttype ||
//           !UlbName ||
//           !buildingStatus ||
//           // !schemes ||
//           !purchasedFAR ||
//           !greenbuilding ||
//           !restrictedArea ||
//           !proposedSite
//         }
//       >
//         <div>
//           <CardLabel>{`${t("BPA_APPROVED_COLONY")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"approvedColony"}
//             defaultValue={approvedColony}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={approvedColony}
//                 select={setapprovedColony}
//                 option={approvedcolonyStatus}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />

//           {renderFields()}

//           <CardLabel style={{ marginTop: "15px" }}>{`${t("BPA_MASTER_PLAN")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"masterPlan"}
//             defaultValue={masterPlan}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown className="form-field" selected={masterPlan} select={setmasterPlan} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />
//           {Master_plan_render_fields()}

//           <CardLabel>{`${t("BPA_ULB_NAME")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"UlbName"}
//             defaultValue={UlbName}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => <Dropdown className="form-field" selected={UlbName} select={setUlbName} option={menu} optionKey="i18nKey" t={t} />}
//           />

//           <CardLabel>{`${t("BPA_DISTRICT")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"District"}
//             defaultValue={District}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => <Dropdown className="form-field" selected={District} select={setDistrict} option={ulb} optionKey="i18nKey" t={t} />}
//           />

//           <CardLabel>{`${t("BPA_ULB_TYPE")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"Ulblisttype"}
//             defaultValue={Ulblisttype}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown className="form-field" selected={Ulblisttype} select={setUlblisttype} option={ulblists} optionKey="i18nKey" t={t} />
//             )}
//           />

//           <CardLabel>{`${t("BPA_BUILDING_STATUS")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"buildingStatus"}
//             defaultValue={buildingStatus}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={buildingStatus}
//                 select={setbuildingStatus}
//                 option={building_status}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />

//           <CardLabel>{`${t("BPA_SCHEMES")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"schemes"}
//             defaultValue={schemes}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown className="form-field" selected={schemes} select={setschemes} option={selectscheme} optionKey="i18nKey" t={t} />
//             )}
//           />
//           {renderschemedropdown()}

//           <CardLabel>{`${t("BPA_PURCHASED_FAR")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"purchasedFAR"}
//             defaultValue={purchasedFAR}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown className="form-field" selected={purchasedFAR} select={setpurchasedFAR} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />

//           <CardLabel>{`${t("BPA_GREEN_BUIDINGS")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"greenbuilding"}
//             defaultValue={greenbuilding}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown className="form-field" selected={greenbuilding} select={setgreenbuilding} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />
//           {renderGreenbuildingfields()}

//           <CardLabel>{`${t("BPA_RESTRICTED_AREA")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"restrictedArea"}
//             defaultValue={restrictedArea}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown className="form-field" selected={restrictedArea} select={setrestrictedArea} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />

//           <CardLabel>{`${t("BPA_PROPOSED_SITE_TYPE")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"proposedSite"}
//             defaultValue={proposedSite}
//             rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={proposedSite}
//                 select={setproposedSite}
//                 option={Typeofproposedsite}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//         </div>
//       </FormStep>
//     </React.Fragment>
//   );
// };

// export default BPANewBuildingdetails;

import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, Dropdown, UploadFile, SearchIcon } from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import { useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";

// const BPANewBuildingdetails = ({ t, config, onSelect, formData }) => {
//   const { pathname: url } = useLocation();
//   const index = window.location.href.charAt(window.location.href.length - 1);
//   let validation = {};

//   const SESSION_STORAGE_KEY = "Digit.BUILDING_PERMIT";

//   const getSessionData = () => {
//     try {
//       const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         return parsed.value || {};
//       }
//     } catch (error) {
//       console.error("Error reading session storage:", error);
//     }
//     return {};
//   };

//   const sessionData = getSessionData();
//   console.log(sessionData, "SESSION DATA");
//   const cityData = sessionData.city || {};
//   console.log(cityData, "CITY DATA");
//   const dataObj = sessionData.data || {};
//   console.log(formData, "FORMDATA");

//   const [UlbName, setUlbName] = useState(() => {
//     const cityName = formData?.address?.city?.name;
//     return cityName || "";
//   });

//   const [District, setDistrict] = useState(() => {
//     const districtName = formData?.address?.city?.city?.districtName;
//     return districtName || "";
//   });

//   const [Ulblisttype, setUlblisttype] = useState(() => {
//     const cityType = formData?.address?.city?.city?.ulbType;
//     return cityType || "";
//   });

//   const [errors, setErrors] = useState({});

//   const [approvedColony, setapprovedColony] = useState(formData?.owners?.approvedColony || "");
//   const [masterPlan, setmasterPlan] = useState(formData?.owners?.masterPlan || "");
//   const [buildingStatus, setbuildingStatus] = useState(formData?.owners?.buildingStatus || "");
//   const [purchasedFAR, setpurchasedFAR] = useState(formData?.owners?.purchasedFAR || "");
//   const [greenbuilding, setgreenbuilding] = useState(formData?.owners?.greenbuilding || "");
//   const [restrictedArea, setrestrictedArea] = useState(formData?.owners?.restrictedArea || "");
//   const [proposedSite, setproposedSite] = useState(formData?.owners?.proposedSite || "");
//   const [nameofApprovedcolony, setnameofApprovedcolony] = useState(formData?.owners?.nameofApprovedcolony || "");
//   const [NocNumber, setNocNumber] = useState(formData?.owners?.NocNumber || "");
//   const [schemesselection, setschemesselection] = useState(formData?.owners?.schemesselection || "");
//   const [schemeName, setschemeName] = useState(formData?.owners?.schemeName || "");
//   const [transferredscheme, settransferredscheme] = useState("Pre-Approved Standard Designs" || "");
//   const [rating, setrating] = useState(formData?.owners?.rating || "");
//   const [use, setUse] = useState(formData?.owners?.use || "");
//   const [uploadedFile, setUploadedFile] = useState(formData?.owners?.uploadedFile);
//   const [greenuploadedFile, setGreenUploadedFile] = useState(formData?.owners?.greenuploadedFile);

//   const [ecbcElectricalLoad, setEcbcElectricalLoad] = useState(formData?.owners?.ecbcElectricalLoad || "")
//   const [ecbcDemandLoad, setEcbcDemandLoad] = useState(formData?.owners?.ecbcDemandLoad || "")
//   const [ecbcAirConditioned, setEcbcAirConditioned] = useState(formData?.owners?.ecbcAirConditioned || "")

//   const [ecbcElectricalLoadFile, setEcbcElectricalLoadFile] = useState(formData?.owners?.ecbcElectricalLoadFile)
//   const [ecbcDemandLoadFile, setEcbcDemandLoadFile] = useState(formData?.owners?.ecbcDemandLoadFile)
//   const [ecbcAirConditionedFile, setEcbcAirConditionedFile] = useState(formData?.owners?.ecbcAirConditionedFile)

//   const [ecbcElectricalLoadFileObj, setEcbcElectricalLoadFileObj] = useState()
//   const [ecbcDemandLoadFileObj, setEcbcDemandLoadFileObj] = useState()
//   const [ecbcAirConditionedFileObj, setEcbcAirConditionedFileObj] = useState()

//   // const validateFields = () => {
//   //   const newErrors = {};

//   //   if (!UlbName) newErrors.UlbName = "ULB Name is required";
//   //   if (!District) newErrors.District = "District is required";
//   //   if (!Ulblisttype) newErrors.Ulblisttype = "ULB Type is required";
//   //   if (!approvedColony) newErrors.approvedColony = "Approved Colony is required";
//   //   if (!masterPlan) newErrors.masterPlan = "Master Plan is required";
//   //   if (!buildingStatus) newErrors.buildingStatus = "Building Status is required";
//   //   if (!purchasedFAR) newErrors.purchasedFAR = "Purchased FAR is required";
//   //   if (!greenbuilding) newErrors.greenbuilding = "Green Building is required";
//   //   if (!restrictedArea) newErrors.restrictedArea = "Restricted Area is required";
//   //   if (!proposedSite) newErrors.proposedSite = "Proposed Site Type is required";

//   //   // Conditional validations
//   //   if (approvedColony?.code === "YES" && !nameofApprovedcolony) {
//   //     newErrors.nameofApprovedcolony = "Approved Colony Name is required";
//   //   }

//   //   if (approvedColony?.code === "NO" && !NocNumber && !uploadedFile) {
//   //     newErrors.NocNumber = "NOC Number or NOC Document is required";
//   //   }

//   //   if (greenbuilding?.code === "YES") {
//   //     if (!greenuploadedFile) newErrors.greenuploadedFile = "Green Building Document is required";
//   //     if (!rating) newErrors.rating = "Rating is required";
//   //   }

//   //   if (masterPlan?.code === "YES" && !use) {
//   //     newErrors.use = "Use is required";
//   //   }

//   //   setErrors(newErrors);
//   //   return Object.keys(newErrors).length === 0;
//   // };

//   // const saveToSessionStorage = () => {
//   //   try {
//   //     const currentData = getSessionData();
//   //     const updatedData = {
//   //       ...currentData,
//   //       buildingDetails: {
//   //         approvedColony,
//   //         masterPlan,
//   //         UlbName,
//   //         buildingStatus,
//   //         purchasedFAR,
//   //         greenbuilding,
//   //         restrictedArea,
//   //         District,
//   //         proposedSite,
//   //         nameofApprovedcolony,
//   //         NocNumber,
//   //         schemesselection,
//   //         schemeName,
//   //         transferredscheme,
//   //         rating,
//   //         use,
//   //         Ulblisttype,
//   //         uploadedFile,
//   //         greenuploadedFile,
//   //         lastUpdated: Date.now(),
//   //       },
//   //     };

//   //     const sessionStorageData = {
//   //       value: updatedData,
//   //       ttl: 86400,
//   //       expiry: Date.now() + 86400 * 1000,
//   //     };

//   //     sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionStorageData));
//   //   } catch (error) {
//   //     console.error("Error saving to session storage:", error);
//   //   }
//   // };

//   // useEffect(() => {
//   //   saveToSessionStorage();
//   // }, [
//   //   approvedColony,
//   //   masterPlan,
//   //   UlbName,
//   //   buildingStatus,
//   //   purchasedFAR,
//   //   greenbuilding,
//   //   restrictedArea,
//   //   District,
//   //   proposedSite,
//   //   nameofApprovedcolony,
//   //   NocNumber,
//   //   schemesselection,
//   //   schemeName,
//   //   transferredscheme,
//   //   rating,
//   //   use,
//   //   Ulblisttype,
//   //   uploadedFile,
//   //   greenuploadedFile,
//   // ]);

//   const validateFields = () => {
//     const newErrors = {};

//     if (!UlbName) newErrors.UlbName = "ULB Name is required";
//     if (!District) newErrors.District = "District is required";
//     if (!Ulblisttype) newErrors.Ulblisttype = "ULB Type is required";
//     if (!approvedColony) newErrors.approvedColony = "Approved Colony is required";
//     if (!masterPlan) newErrors.masterPlan = "Master Plan is required";
//     if (!buildingStatus) newErrors.buildingStatus = "Building Status is required";
//     if (!purchasedFAR) newErrors.purchasedFAR = "Purchased FAR is required";
//     if (!greenbuilding) newErrors.greenbuilding = "Green Building is required";
//     if (!restrictedArea) newErrors.restrictedArea = "Restricted Area is required";
//     if (!proposedSite) newErrors.proposedSite = "Proposed Site Type is required";

//     // Conditional validations
//     if (approvedColony?.code === "YES" && !nameofApprovedcolony) {
//       newErrors.nameofApprovedcolony = "Approved Colony Name is required";
//     }

//     if (approvedColony?.code === "NO" && !NocNumber && !uploadedFile) {
//       newErrors.NocNumber = "NOC Number or NOC Document is required";
//     }

//     if (greenbuilding?.code === "YES") {
//       if (!greenuploadedFile) newErrors.greenuploadedFile = "Green Building Document is required";
//       if (!rating) newErrors.rating = "Rating is required";
//     }

//     if (masterPlan?.code === "YES" && !use) {
//       newErrors.use = "Use is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const saveToSessionStorage = () => {
//     try {
//       const currentData = getSessionData();
//       const updatedData = {
//         ...currentData,
//         buildingDetails: {
//           approvedColony,
//           masterPlan,
//           UlbName,
//           buildingStatus,
//           purchasedFAR,
//           greenbuilding,
//           restrictedArea,
//           District,
//           proposedSite,
//           nameofApprovedcolony,
//           NocNumber,
//           schemesselection,
//           schemeName,
//           transferredscheme,
//           rating,
//           use,
//           Ulblisttype,
//           uploadedFile,
//           greenuploadedFile,
//           lastUpdated: Date.now(),
//         },
//       };

//       const sessionStorageData = {
//         value: updatedData,
//         ttl: 86400,
//         expiry: Date.now() + 86400 * 1000,
//       };

//       sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionStorageData));
//     } catch (error) {
//       console.error("Error saving to session storage:", error);
//     }
//   };

//   useEffect(() => {
//     saveToSessionStorage();
//   }, [
//     approvedColony,
//     masterPlan,
//     UlbName,
//     buildingStatus,
//     purchasedFAR,
//     greenbuilding,
//     restrictedArea,
//     District,
//     proposedSite,
//     nameofApprovedcolony,
//     NocNumber,
//     schemesselection,
//     schemeName,
//     transferredscheme,
//     rating,
//     use,
//     Ulblisttype,
//     uploadedFile,
//     greenuploadedFile,
//   ]);

//   const [files, setFiles] = useState();
//   const [file, setFile] = useState();
//   const Webview = !Digit.Utils.browser.isMobile();
//   const acceptFormat = ".pdf";

//   useEffect(() => {
//     (async () => {
//       if (file && file?.type) {
//         if (!acceptFormat?.split(",")?.includes(`.${file?.type?.split("/")?.pop()}`)) {
//           setErrors((prev) => ({ ...prev, file: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }));
//         } else if (file.size >= 2000000) {
//           setErrors((prev) => ({ ...prev, file: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }));
//         } else {
//           try {
//             const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
//             if (response?.data?.files?.length > 0) {
//               setUploadedFile(response?.data?.files[0]?.fileStoreId);
//             } else {
//               setErrors((prev) => ({ ...prev, file: t("PT_FILE_UPLOAD_ERROR") }));
//             }
//           } catch (err) {}
//         }
//       }
//     })();
//   }, [file]);

//   useEffect(() => {
//     (async () => {
//       if (files && files?.type) {
//         if (!acceptFormat?.split(",")?.includes(`.${files?.type?.split("/")?.pop()}`)) {
//           setErrors((prev) => ({ ...prev, files: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }));
//         } else if (files.size >= 2000000) {
//           setErrors((prev) => ({ ...prev, files: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }));
//         } else {
//           try {
//             const response = await Digit.UploadServices.Filestorage("property-upload", files, Digit.ULBService.getStateId());
//             if (response?.data?.files?.length > 0) {
//               setGreenUploadedFile(response?.data?.files[0]?.fileStoreId);
//             } else {
//               setErrors((prev) => ({ ...prev, files: t("PT_FILE_UPLOAD_ERROR") }));
//             }
//           } catch (err) {}
//         }
//       }
//     })();
//   }, [files]);

//   const approvedcolonyStatus = [
//     {
//       code: "YES",
//       i18nKey: "YES",
//     },
//     {
//       code: "NO",
//       i18nKey: "NO",
//     },
//     {
//       code: "LAL_LAKEER",
//       i18nKey: "LAL LAKEER",
//     },
//   ];

//   const common = [
//     {
//       code: "YES",
//       i18nKey: "YES",
//     },
//     {
//       code: "NO",
//       i18nKey: "NO",
//     },
//   ];

//   const Typeofproposedsite = [
//     {
//       code: "PROPOSED",
//       i18nKey: "Proposed",
//     },
//   ];

//   const stateId = Digit.ULBService.getStateId();

//   const { data: ulbList } = Digit.Hooks.obps.useUlbType(stateId, "BPA", "UlbType");
//   const { data: districtMenu } = Digit.Hooks.obps.useDistricts(stateId, "BPA", "Districts");
//   const { data: ULB } = Digit.Hooks.obps.useULBList(stateId, "BPA", "Ulb");

//   const ulblists = [];
//   const menu = [];
//   const ulb = [];

//   ulbList &&
//     ulbList.map((ulbtypelist) => {
//       if (ulbtypelist?.Districts === District?.code || ulbtypelist?.Districts === District?.value)
//         ulblists.push({ i18nKey: `${ulbtypelist.name}`, code: `${ulbtypelist.code}`, value: `${ulbtypelist.name}` });
//     });

//   districtMenu &&
//     districtMenu.map((districts) => {
//       menu.push({ i18nKey: `${districts.name}`, code: `${districts.code}`, value: `${districts.name}` });
//     });

//   ULB &&
//     ULB.map((ulblist) => {
//       if (ulblist.Districts == District?.code || ulblist.Districts == District?.value) {
//         ulb.push({
//           i18nKey: `${ulblist.name}`,
//           code: `${ulblist.code}`,
//           value: `${ulblist.name}`,
//         });
//       }
//     });

//   const { data: commonBuilding } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "BuildingStatus" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["BuildingStatus"];
//       return formattedData;
//     },
//   });

//   const building_status = [];

//   commonBuilding &&
//     commonBuilding.map((selectBuilding) => {
//       building_status.push({
//         i18nKey: `BPA_${selectBuilding.code}`,
//         code: `${selectBuilding.code}`,
//         value: `${selectBuilding.name}`,
//       });
//     });

//   const { data: commonrating } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "RatingValue" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["RatingValue"];
//       return formattedData;
//     },
//   });

//   const selectRating = [];

//   commonrating &&
//     commonrating.map((selectRatings) => {
//       selectRating.push({
//         i18nKey: `BPA_${selectRatings.code}`,
//         code: `${selectRatings.code}`,
//         value: `${selectRatings.name}`,
//       });
//     });

//   const { data: commonmasterFields } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "BPA", [{ name: "MasterFields" }], {
//     select: (data) => {
//       const formattedData = data?.["BPA"]?.["MasterFields"];
//       return formattedData;
//     },
//   });

//   const selectmasterDrop = [];

//   commonmasterFields &&
//     commonmasterFields.map((selectMaster) => {
//       selectmasterDrop.push({
//         i18nKey: `BPA_${selectMaster.code}`,
//         code: `${selectMaster.code}`,
//         value: `${selectMaster.name}`,
//       });
//     });

//   const { control } = useForm();

//   function setdistrict(option) {
//     setDistrict(option);
//     setUlblisttype(""); // Reset ULB type when district changes
//     setErrors((prev) => ({ ...prev, District: "", Ulblisttype: "" }));
//   }

//   function setulbname(option) {
//     setUlbName(option);
//     setErrors((prev) => ({ ...prev, UlbName: "" }));
//   }

//   function setulblisttype(option) {
//     setUlblisttype(option);
//     setErrors((prev) => ({ ...prev, Ulblisttype: "" }));
//   }

//   function setApprovedColony(option) {
//     setapprovedColony(option);
//     setErrors((prev) => ({ ...prev, approvedColony: "" }));
//   }

//   function setMasterPlan(option) {
//     setmasterPlan(option);
//     setErrors((prev) => ({ ...prev, masterPlan: "" }));
//   }

//   function setBuildingStatus(option) {
//     setbuildingStatus(option);
//     setErrors((prev) => ({ ...prev, buildingStatus: "" }));
//   }

//   function setPurchasedFAR(option) {
//     setpurchasedFAR(option);
//     setErrors((prev) => ({ ...prev, purchasedFAR: "" }));
//   }

//   function setGreenbuilding(option) {
//     setgreenbuilding(option);
//     setErrors((prev) => ({ ...prev, greenbuilding: "" }));
//   }

//   function setRestrictedArea(option) {
//     setrestrictedArea(option);
//     setErrors((prev) => ({ ...prev, restrictedArea: "" }));
//   }

//   function setProposedSite(option) {
//     setproposedSite(option);
//     setErrors((prev) => ({ ...prev, proposedSite: "" }));
//   }

//   function setNameapprovedcolony(e) {
//     setnameofApprovedcolony(e.target.value);
//     setErrors((prev) => ({ ...prev, nameofApprovedcolony: "" }));
//   }

//   function setnocNumber(e) {
//     setNocNumber(e.target.value);
//     setErrors((prev) => ({ ...prev, NocNumber: "" }));
//   }

//   function selectfile(e) {
//     setUploadedFile(e.target.files[0]);
//     setFile(e.target.files[0]);
//     setErrors((prev) => ({ ...prev, file: "" }));
//   }

//   function onClick(e) {
//     console.log("inside_NOC_search");
//   }

//   function selectfiles(e) {
//     setGreenUploadedFile(e.target.files[0]);
//     setFiles(e.target.files[0]);
//     setErrors((prev) => ({ ...prev, files: "" }));
//   }

//   const goNext = () => {
//     if (!validateFields()) {
//       return;
//     }

//     const owners = formData.owners && formData.owners[index];
//     const ownerStep = {
//       ...owners,
//       approvedColony,
//       use,
//       UlbName,
//       Ulblisttype,
//       District,
//       rating,
//       masterPlan,
//       buildingStatus,
//       purchasedFAR,
//       greenbuilding,
//       restrictedArea,
//       proposedSite,
//       nameofApprovedcolony,
//       schemeName,
//       transferredscheme,
//       NocNumber,
//       uploadedFile,
//       greenuploadedFile,
//     };
//     const updatedFormData = { ...formData };

//     if (!updatedFormData.owners) {
//       updatedFormData.owners = [];
//     }

//     onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index);
//   };

//   const onSkip = () => onSelect();

//   const ErrorMessage = ({ error }) => {
//     if (!error) return null;
//     return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{error}</div>;
//   };

//   const renderFields = () => {
//     switch (approvedColony?.code) {
//       case "YES":
//         return (
//           <React.Fragment>
//             <CardLabel>{`${t("BPA_APPROVED_COLONY_NAME")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="nameofApprovedcolony"
//               value={nameofApprovedcolony}
//               onChange={setNameapprovedcolony}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z ]*$",
//                 type: "text",
//                 title: t("TL_NAME_ERROR_MESSAGE"),
//               })}
//             />
//           </React.Fragment>
//         );
//       case "NO":
//         return (
//           <React.Fragment>
//             <CardLabel>{`${t("BPA_NOC_NUMBER")} *`}</CardLabel>
//             <div className="field-container">
//               <TextInput
//                 t={t}
//                 type={"text"}
//                 isMandatory={false}
//                 optionKey="i18nKey"
//                 defaultValue={formData?.owners?.NocNumber}
//                 name="NocNumber"
//                 value={NocNumber}
//                 onChange={setnocNumber}
//                 style={{ width: "86%" }}
//                 ValidationRequired={false}
//                 {...(validation = {
//                   pattern: "^[a-zA-Z0-9]*$",
//                   type: "text",
//                   title: t("TL_NAME_ERROR_MESSAGE"),
//                 })}
//               />
//               <div
//                 style={{
//                   position: "relative",
//                   zIndex: "100",
//                   right: "95px",
//                   marginTop: "-24px",
//                   marginRight: Webview ? "-20px" : "-20px",
//                 }}
//                 onClick={(e) => onClick(e)}
//               >
//                 {" "}
//                 <SearchIcon />{" "}
//               </div>
//             </div>
//             <div style={{ position: "relative", fontWeight: "bold", left: "20px" }}>OR</div>
//             <UploadFile
//               id={"noc-doc"}
//               style={{ width: "86%" }}
//               onUpload={selectfile}
//               onDelete={() => {
//                 setUploadedFile(null);
//                 setFile("");
//               }}
//               message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
//               error={errors.file}
//               uploadMessage={""}
//             />
//           </React.Fragment>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderGreenbuildingfields = () => {
//     switch (greenbuilding?.code) {
//       case "YES":
//         return (
//           <React.Fragment>
//             <UploadFile
//               id={"green-building-doc"}
//               onUpload={selectfiles}
//               onDelete={() => {
//                 setGreenUploadedFile(null);
//                 setFiles("");
//               }}
//               message={greenuploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
//               error={errors.files}
//               uploadMessage={""}
//             />
//             <br></br>

//             <CardLabel>{`${t("BPA_SELECT_RATINGS")} *`}</CardLabel>
//             <Controller
//               control={control}
//               name={"rating"}
//               defaultValue={rating}
//               render={(props) => (
//                 <Dropdown className="form-field" selected={rating} select={setrating} option={selectRating} optionKey="i18nKey" t={t} />
//               )}
//             />
//           </React.Fragment>
//         );
//       case "NO":
//         return null;
//       default:
//         return null;
//     }
//   };

//   const Master_plan_render_fields = () => {
//     switch (masterPlan?.code) {
//       case "YES":
//         return (
//           <React.Fragment>
//             <CardLabel>{`${t("BPA_USE")} *`}</CardLabel>
//             <Controller
//               control={control}
//               name={"use"}
//               defaultValue={use}
//               render={(props) => (
//                 <Dropdown className="form-field" selected={use} select={setUse} option={selectmasterDrop} optionKey="i18nKey" t={t} />
//               )}
//             />
//           </React.Fragment>
//         );
//       case "NO":
//         return null;
//       default:
//         return null;
//     }
//   };

//   const renderschemedropdown = () => {
//     switch (schemesselection) {
//       case "SCHEME":
//         return (
//           <React.Fragment>
//             <CardLabel>{`${t("BPA_SCHEME_TYPE_LABEL")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="schemesselection"
//               value={schemesselection}
//               onChange={setschemesselection}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z-.`' ]*$",
//                 type: "text",
//                 title: t("PT_NAME_ERROR_MESSAGE"),
//               })}
//             />

//             <CardLabel>{`${t("BPA_SCHEME_NAME")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="schemeName"
//               value={schemeName}
//               onChange={setschemeName}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z-.`' ]*$",
//                 type: "text",
//                 title: t("PT_NAME_ERROR_MESSAGE"),
//               })}
//             />

//             <CardLabel>{`${t("BPA_TRANFERRED_SCHEME_LABEL")} *`}</CardLabel>
//             <TextInput
//               t={t}
//               type={"text"}
//               isMandatory={false}
//               optionKey="i18nKey"
//               name="transferredscheme"
//               value={transferredscheme}
//               onChange={settransferredscheme}
//               style={{ width: "86%" }}
//               ValidationRequired={false}
//               {...(validation = {
//                 isRequired: true,
//                 pattern: "^[a-zA-Z-.`' ]*$",
//                 type: "text",
//                 title: t("PT_NAME_ERROR_MESSAGE"),
//               })}
//             />
//           </React.Fragment>
//         );
//       case "NON_SCHEME":
//         return null;
//       default:
//         return null;
//     }
//   };

//   return (
//     <React.Fragment>
//       <Timeline currentStep={2} />
//       <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={false}>
//         <div>
//           {/* <CardLabel>{`${t("BPA_ULB_NAME")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"UlbName"}
//             defaultValue={UlbName}
//             render={(props) => <Dropdown className="form-field" selected={UlbName} select={setulbname} option={ulb} optionKey="i18nKey" t={t} />}
//           />
//           <ErrorMessage error={errors.UlbName} />

//           <CardLabel>{`${t("BPA_DISTRICT")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"District"}
//             defaultValue={District}
//             render={(props) => <Dropdown className="form-field" selected={District} select={setdistrict} option={menu} optionKey="i18nKey" t={t} />}
//           />
//           <ErrorMessage error={errors.District} />

//           <CardLabel>{`${t("BPA_ULB_TYPE")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"Ulblisttype"}
//             defaultValue={Ulblisttype}
//             render={(props) => (
//               <Dropdown className="form-field" selected={Ulblisttype} select={setulblisttype} option={ulblists} optionKey="i18nKey" t={t} />
//             )}
//           />
//           <ErrorMessage error={errors.Ulblisttype} /> */}

//           <CardLabel>{`${t("BPA_ULB_NAME")} *`}</CardLabel>
//           <TextInput
//             t={t}
//             type={"text"}
//             isMandatory={false}
//             optionKey="i18nKey"
//             name="UlbName"
//             value={UlbName}
//             onChange={() => {}} // No-op since it's disabled
//             style={{ width: "86%" }}
//             ValidationRequired={false}
//             disabled={true}
//           />
//           <ErrorMessage error={errors.UlbName} />

//           <CardLabel>{`${t("BPA_DISTRICT")} *`}</CardLabel>
//           <TextInput
//             t={t}
//             type={"text"}
//             isMandatory={false}
//             optionKey="i18nKey"
//             name="District"
//             value={District}
//             onChange={() => {}} // No-op since it's disabled
//             style={{ width: "86%" }}
//             ValidationRequired={false}
//             disabled={true}
//           />
//           <ErrorMessage error={errors.District} />

//           <CardLabel>{`${t("BPA_ULB_TYPE")} *`}</CardLabel>
//           <TextInput
//             t={t}
//             type={"text"}
//             isMandatory={false}
//             optionKey="i18nKey"
//             name="Ulblisttype"
//             value={Ulblisttype}
//             onChange={() => {}} // No-op since it's disabled
//             style={{ width: "86%" }}
//             ValidationRequired={false}
//             disabled={true}
//           />
//           <ErrorMessage error={errors.Ulblisttype} />

//           <CardLabel>{`${t("BPA_APPROVED_COLONY")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"approvedColony"}
//             defaultValue={approvedColony}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={approvedColony}
//                 select={setApprovedColony}
//                 option={approvedcolonyStatus}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//           <ErrorMessage error={errors.approvedColony} />

//           {renderFields()}
//           {errors.nameofApprovedcolony && <ErrorMessage error={errors.nameofApprovedcolony} />}
//           {errors.NocNumber && <ErrorMessage error={errors.NocNumber} />}

//           <CardLabel style={{ marginTop: "15px" }}>{`${t("BPA_MASTER_PLAN")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"masterPlan"}
//             defaultValue={masterPlan}
//             render={(props) => (
//               <Dropdown className="form-field" selected={masterPlan} select={setMasterPlan} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />
//           <ErrorMessage error={errors.masterPlan} />

//           {Master_plan_render_fields()}
//           {errors.use && <ErrorMessage error={errors.use} />}

//           <CardLabel>{`${t("BPA_BUILDING_STATUS")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"buildingStatus"}
//             defaultValue={buildingStatus}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={buildingStatus}
//                 select={setBuildingStatus}
//                 option={building_status}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//           <ErrorMessage error={errors.buildingStatus} />

//           <CardLabel>{`${t("BPA_PURCHASED_FAR")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"purchasedFAR"}
//             defaultValue={purchasedFAR}
//             render={(props) => (
//               <Dropdown className="form-field" selected={purchasedFAR} select={setPurchasedFAR} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />
//           <ErrorMessage error={errors.purchasedFAR} />

//           <CardLabel>{`${t("BPA_GREEN_BUIDINGS")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"greenbuilding"}
//             defaultValue={greenbuilding}
//             render={(props) => (
//               <Dropdown className="form-field" selected={greenbuilding} select={setGreenbuilding} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />
//           <ErrorMessage error={errors.greenbuilding} />

//           {renderGreenbuildingfields()}
//           {errors.greenuploadedFile && <ErrorMessage error={errors.greenuploadedFile} />}
//           {errors.rating && <ErrorMessage error={errors.rating} />}

//           <CardLabel>{`${t("BPA_RESTRICTED_AREA")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"restrictedArea"}
//             defaultValue={restrictedArea}
//             render={(props) => (
//               <Dropdown className="form-field" selected={restrictedArea} select={setRestrictedArea} option={common} optionKey="i18nKey" t={t} />
//             )}
//           />
//           <ErrorMessage error={errors.restrictedArea} />

//           <CardLabel>{`${t("BPA_PROPOSED_SITE_TYPE")} *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"proposedSite"}
//             defaultValue={proposedSite}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={proposedSite}
//                 select={setProposedSite}
//                 option={Typeofproposedsite}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//           <ErrorMessage error={errors.proposedSite} />

//             <CardLabel>{`ECBC - Proposed Connected Electrical Load is above 100 Kw *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"ecbcElectricalLoad"}
//             defaultValue={ecbcElectricalLoad}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={ecbcElectricalLoad}
//                 select={setEcbcElectricalLoadHandler}
//                 option={yesNoOptions}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//           <ErrorMessage error={errors.ecbcElectricalLoad} />
//           {renderEcbcElectricalLoadFile()}
//           {/* {errors.ecbcElectricalLoadFile && <ErrorMessage error={errors.ecbcElectricalLoadFile} />} */}

//           <CardLabel>{`ECBC - Proposed Demand of Electrical Load is above 120 Kw *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"ecbcDemandLoad"}
//             defaultValue={ecbcDemandLoad}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={ecbcDemandLoad}
//                 select={setEcbcDemandLoadHandler}
//                 option={yesNoOptions}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//           <ErrorMessage error={errors.ecbcDemandLoad} />
//           {renderEcbcDemandLoadFile()}
//           {/* {errors.ecbcDemandLoadFile && <ErrorMessage error={errors.ecbcDemandLoadFile} />} */}

//           <CardLabel>{`ECBC - Proposed Air Conditioned Area above 500 sq.mt *`}</CardLabel>
//           <Controller
//             control={control}
//             name={"ecbcAirConditioned"}
//             defaultValue={ecbcAirConditioned}
//             render={(props) => (
//               <Dropdown
//                 className="form-field"
//                 selected={ecbcAirConditioned}
//                 select={setEcbcAirConditionedHandler}
//                 option={yesNoOptions}
//                 optionKey="i18nKey"
//                 t={t}
//               />
//             )}
//           />
//           <ErrorMessage error={errors.ecbcAirConditioned} />
//           {renderEcbcAirConditionedFile()}
//           {/* {errors.ecbcAirConditionedFile && <ErrorMessage error={errors.ecbcAirConditionedFile} />} */}
//         </div>
//       </FormStep>
//     </React.Fragment>
//   );
// };

// export default BPANewBuildingdetails;

const BPANewBuildingdetails = ({ t, config, onSelect, formData }) => {
  const { pathname: url } = useLocation()
  const index = window.location.href.charAt(window.location.href.length - 1)
  let validation = {}

  const SESSION_STORAGE_KEY = "Digit.BUILDING_PERMIT"

  const getSessionData = () => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.value || {}
      }
    } catch (error) {
      console.error("Error reading session storage:", error)
    }
    return {}
  }

  const sessionData = getSessionData()
  console.log(sessionData, "SESSION DATA")
  const cityData = sessionData.city || {}
  console.log(cityData, "CITY DATA")
  const dataObj = sessionData.data || {}
  console.log(formData, "FORMDATA")

  const [UlbName, setUlbName] = useState(() => {
    const cityName = formData?.address?.city?.name
    return cityName || ""
  })

  const [District, setDistrict] = useState(() => {
    const districtName = formData?.address?.city?.city?.districtName
    return districtName || ""
  })

  const [Ulblisttype, setUlblisttype] = useState(() => {
    const cityType = formData?.address?.city?.city?.ulbType
    return cityType || ""
  })

  const [errors, setErrors] = useState({})

  const [approvedColony, setapprovedColony] = useState(formData?.owners?.approvedColony || "")
  const [masterPlan, setmasterPlan] = useState(formData?.owners?.masterPlan || "")
  const [buildingStatus, setbuildingStatus] = useState(formData?.owners?.buildingStatus || "")
  const [purchasedFAR, setpurchasedFAR] = useState(formData?.owners?.purchasedFAR || "")
  const [greenbuilding, setgreenbuilding] = useState(formData?.owners?.greenbuilding || "")
  const [restrictedArea, setrestrictedArea] = useState(formData?.owners?.restrictedArea || "")
  const [proposedSite, setproposedSite] = useState(formData?.owners?.proposedSite || "")
  const [nameofApprovedcolony, setnameofApprovedcolony] = useState(formData?.owners?.nameofApprovedcolony || "")
  const [NocNumber, setNocNumber] = useState(formData?.owners?.NocNumber || "")
  const [schemesselection, setschemesselection] = useState(formData?.owners?.schemesselection || "")
  const [schemeName, setschemeName] = useState(formData?.owners?.schemeName || "")
  const [transferredscheme, settransferredscheme] = useState("Pre-Approved Standard Designs" || "")
  const [rating, setrating] = useState(formData?.owners?.rating || "")
  const [use, setUse] = useState(formData?.owners?.use || "")
  const [uploadedFile, setUploadedFile] = useState(formData?.owners?.uploadedFile)
  const [greenuploadedFile, setGreenUploadedFile] = useState(formData?.owners?.greenuploadedFile)
  const [uploadMessage, setUploadMessage] = useState("")
  const [ecbcElectricalLoad, setEcbcElectricalLoad] = useState(formData?.owners?.ecbcElectricalLoad || "")
  const [ecbcDemandLoad, setEcbcDemandLoad] = useState(formData?.owners?.ecbcDemandLoad || "")
  const [ecbcAirConditioned, setEcbcAirConditioned] = useState(formData?.owners?.ecbcAirConditioned || "")

  const [ecbcElectricalLoadFile, setEcbcElectricalLoadFile] = useState(formData?.owners?.ecbcElectricalLoadFile)
  const [ecbcDemandLoadFile, setEcbcDemandLoadFile] = useState(formData?.owners?.ecbcDemandLoadFile)
  const [ecbcAirConditionedFile, setEcbcAirConditionedFile] = useState(formData?.owners?.ecbcAirConditionedFile)

  const [ecbcElectricalLoadFileObj, setEcbcElectricalLoadFileObj] = useState()
  const [ecbcDemandLoadFileObj, setEcbcDemandLoadFileObj] = useState()
  const [ecbcAirConditionedFileObj, setEcbcAirConditionedFileObj] = useState()

  const validateFields = () => {
    const newErrors = {}

    if (!UlbName) newErrors.UlbName = "ULB Name is required"
    if (!District) newErrors.District = "District is required"
    if (!Ulblisttype) newErrors.Ulblisttype = "ULB Type is required"
    if (!approvedColony) newErrors.approvedColony = "Approved Colony is required"
    if (!masterPlan) newErrors.masterPlan = "Master Plan is required"
    if (!buildingStatus) newErrors.buildingStatus = "Building Status is required"
    if (!purchasedFAR) newErrors.purchasedFAR = "Purchased FAR is required"
    if (!greenbuilding) newErrors.greenbuilding = "Green Building is required"
    if (!restrictedArea) newErrors.restrictedArea = "Restricted Area is required"
    if (!proposedSite) newErrors.proposedSite = "Proposed Site Type is required"

    if (!ecbcElectricalLoad) newErrors.ecbcElectricalLoad = "ECBC Electrical Load is required"
    if (!ecbcDemandLoad) newErrors.ecbcDemandLoad = "ECBC Demand Load is required"
    if (!ecbcAirConditioned) newErrors.ecbcAirConditioned = "ECBC Air Conditioned Area is required"

    // Conditional validations
    if (approvedColony?.code === "YES" && !nameofApprovedcolony) {
      newErrors.nameofApprovedcolony = "Approved Colony Name is required"
    }

    if (approvedColony?.code === "NO" && !NocNumber && !uploadedFile) {
      newErrors.NocNumber = "NOC Number or NOC Document is required"
    }

    if (greenbuilding?.code === "YES") {
      if (!greenuploadedFile) newErrors.greenuploadedFile = "Green Building Document is required"
      if (!rating) newErrors.rating = "Rating is required"
    }

    if (masterPlan?.code === "YES" && !use) {
      newErrors.use = "Use is required"
    }

    if (ecbcElectricalLoad?.code === "YES" && !ecbcElectricalLoadFile) {
      newErrors.ecbcElectricalLoadFile = "ECBC Electrical Load Certificate is required"
    }

    if (ecbcDemandLoad?.code === "YES" && !ecbcDemandLoadFile) {
      newErrors.ecbcDemandLoadFile = "ECBC Demand Load Certificate is required"
    }

    if (ecbcAirConditioned?.code === "YES" && !ecbcAirConditionedFile) {
      newErrors.ecbcAirConditionedFile = "ECBC Air Conditioned Area Certificate is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveToSessionStorage = () => {
    try {
      const currentData = getSessionData()
      const updatedData = {
        ...currentData,
        buildingDetails: {
          approvedColony,
          masterPlan,
          UlbName,
          buildingStatus,
          purchasedFAR,
          greenbuilding,
          restrictedArea,
          District,
          proposedSite,
          nameofApprovedcolony,
          NocNumber,
          schemesselection,
          schemeName,
          transferredscheme,
          rating,
          use,
          Ulblisttype,
          uploadedFile,
          greenuploadedFile,
          ecbcElectricalLoad,
          ecbcDemandLoad,
          ecbcAirConditioned,
          ecbcElectricalLoadFile,
          ecbcDemandLoadFile,
          ecbcAirConditionedFile,
          lastUpdated: Date.now(),
        },
      }

      const sessionStorageData = {
        value: updatedData,
        ttl: 86400,
        expiry: Date.now() + 86400 * 1000,
      }

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionStorageData))
    } catch (error) {
      console.error("Error saving to session storage:", error)
    }
  }

  useEffect(() => {
    saveToSessionStorage()
  }, [
    approvedColony,
    masterPlan,
    UlbName,
    buildingStatus,
    purchasedFAR,
    greenbuilding,
    restrictedArea,
    District,
    proposedSite,
    nameofApprovedcolony,
    NocNumber,
    schemesselection,
    schemeName,
    transferredscheme,
    rating,
    use,
    Ulblisttype,
    uploadedFile,
    greenuploadedFile,
    ecbcElectricalLoad,
    ecbcDemandLoad,
    ecbcAirConditioned,
    ecbcElectricalLoadFile,
    ecbcDemandLoadFile,
    ecbcAirConditionedFile,
  ])

  const [files, setFiles] = useState()
  const [file, setFile] = useState()
  const Webview = !Digit.Utils.browser.isMobile()
  const acceptFormat = ".pdf"

  useEffect(() => {
    ;(async () => {
      if (file && file?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${file?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, file: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (file.size >= 2000000) {
          setErrors((prev) => ({ ...prev, file: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              file,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, file: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [file])

  useEffect(() => {
    ;(async () => {
      if (files && files?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${files?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, files: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (files.size >= 2000000) {
          setErrors((prev) => ({ ...prev, files: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              files,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setGreenUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, files: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [files])

  useEffect(() => {
    ;(async () => {
      if (ecbcElectricalLoadFileObj && ecbcElectricalLoadFileObj?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${ecbcElectricalLoadFileObj?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (ecbcElectricalLoadFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcElectricalLoadFileObj,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setEcbcElectricalLoadFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [ecbcElectricalLoadFileObj])

  useEffect(() => {
    ;(async () => {
      if (ecbcDemandLoadFileObj && ecbcDemandLoadFileObj?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${ecbcDemandLoadFileObj?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (ecbcDemandLoadFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcDemandLoadFileObj,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setEcbcDemandLoadFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [ecbcDemandLoadFileObj])

  useEffect(() => {
    ;(async () => {
      if (ecbcAirConditionedFileObj && ecbcAirConditionedFileObj?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${ecbcAirConditionedFileObj?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (ecbcAirConditionedFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcAirConditionedFileObj,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setEcbcAirConditionedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [ecbcAirConditionedFileObj])

  const approvedcolonyStatus = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
    {
      code: "LAL_LAKEER",
      i18nKey: "LAL LAKEER",
    },
  ]

  const common = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ]

  const Typeofproposedsite = [
    {
      code: "PROPOSED",
      i18nKey: "Proposed",
    },
    {
      code: "Addition/Alteration",
      i18nKey: "Addition/Alteration",
    },
    {
      code: "Revised",
      i18nKey: "Revised",
    },
    {
      code: "Existing",
      i18nKey: "Existing",
    },
  ]

  const yesNoOptions = [
    { code: "YES", i18nKey: "YES" },
    { code: "NO", i18nKey: "NO" },
  ]

  const stateId = Digit.ULBService.getStateId()

  const { data: ulbList } = Digit.Hooks.obps.useUlbType(stateId, "BPA", "UlbType")
  const { data: districtMenu } = Digit.Hooks.obps.useDistricts(stateId, "BPA", "Districts")
  const { data: ULB } = Digit.Hooks.obps.useULBList(stateId, "BPA", "Ulb")

  const ulblists = []
  const menu = []
  const ulb = []

  ulbList &&
    ulbList.map((ulbtypelist) => {
      if (ulbtypelist?.Districts === District?.code || ulbtypelist?.Districts === District?.value)
        ulblists.push({ i18nKey: `${ulbtypelist.name}`, code: `${ulbtypelist.code}`, value: `${ulbtypelist.name}` })
    })

  districtMenu &&
    districtMenu.map((districts) => {
      menu.push({ i18nKey: `${districts.name}`, code: `${districts.code}`, value: `${districts.name}` })
    })

  ULB &&
    ULB.map((ulblist) => {
      if (ulblist.Districts == District?.code || ulblist.Districts == District?.value) {
        ulb.push({
          i18nKey: `${ulblist.name}`,
          code: `${ulblist.code}`,
          value: `${ulblist.name}`,
        })
      }
    })

  const { data: commonBuilding } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "BPA",
    [{ name: "BuildingStatus" }],
    {
      select: (data) => {
        const formattedData = data?.["BPA"]?.["BuildingStatus"]
        return formattedData
      },
    },
  )

  const building_status = []

  commonBuilding &&
    commonBuilding.map((selectBuilding) => {
      building_status.push({
        i18nKey: `BPA_${selectBuilding.code}`,
        code: `${selectBuilding.code}`,
        value: `${selectBuilding.name}`,
      })
    })

  const { data: commonrating } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "BPA",
    [{ name: "RatingValue" }],
    {
      select: (data) => {
        const formattedData = data?.["BPA"]?.["RatingValue"]
        return formattedData
      },
    },
  )

  const selectRating = []

  commonrating &&
    commonrating.map((selectRatings) => {
      selectRating.push({
        i18nKey: `BPA_${selectRatings.code}`,
        code: `${selectRatings.code}`,
        value: `${selectRatings.name}`,
      })
    })

  const { data: commonmasterFields } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "BPA",
    [{ name: "MasterFields" }],
    {
      select: (data) => {
        const formattedData = data?.["BPA"]?.["MasterFields"]
        return formattedData
      },
    },
  )

  const selectmasterDrop = []

  commonmasterFields &&
    commonmasterFields.map((selectMaster) => {
      selectmasterDrop.push({
        i18nKey: `BPA_${selectMaster.code}`,
        code: `${selectMaster.code}`,
        value: `${selectMaster.name}`,
      })
    })

  const { control } = useForm()

  function setdistrict(option) {
    setDistrict(option)
    setUlblisttype("") // Reset ULB type when district changes
    setErrors((prev) => ({ ...prev, District: "", Ulblisttype: "" }))
  }

  function setulbname(option) {
    setUlbName(option)
    setErrors((prev) => ({ ...prev, UlbName: "" }))
  }

  function setulblisttype(option) {
    setUlblisttype(option)
    setErrors((prev) => ({ ...prev, Ulblisttype: "" }))
  }

  function setApprovedColony(option) {
    setapprovedColony(option)
    setErrors((prev) => ({ ...prev, approvedColony: "" }))
  }

  function setMasterPlan(option) {
    setmasterPlan(option)
    setErrors((prev) => ({ ...prev, masterPlan: "" }))
  }

  function setBuildingStatus(option) {
    setbuildingStatus(option)
    setErrors((prev) => ({ ...prev, buildingStatus: "" }))
  }

  function setPurchasedFAR(option) {
    setpurchasedFAR(option)
    setErrors((prev) => ({ ...prev, purchasedFAR: "" }))
  }

  function setGreenbuilding(option) {
    setgreenbuilding(option)
    setErrors((prev) => ({ ...prev, greenbuilding: "" }))
  }

  function setRestrictedArea(option) {
    setrestrictedArea(option)
    setErrors((prev) => ({ ...prev, restrictedArea: "" }))
  }

  function setProposedSite(option) {
    setproposedSite(option)
    setErrors((prev) => ({ ...prev, proposedSite: "" }))
  }

  function setEcbcElectricalLoadHandler(option) {
    console.log("[v0] ECBC Electrical Load selected:", option)
    console.log("[v0] Option code:", option?.code)
    setEcbcElectricalLoad(option)
    setErrors((prev) => ({ ...prev, ecbcElectricalLoad: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("[v0] State after update:", option)
    }, 100)
  }

  function setEcbcDemandLoadHandler(option) {
    console.log("[v0] ECBC Demand Load selected:", option)
    console.log("[v0] Option code:", option?.code)
    setEcbcDemandLoad(option)
    setErrors((prev) => ({ ...prev, ecbcDemandLoad: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("[v0] State after update:", option)
    }, 100)
  }

  function setEcbcAirConditionedHandler(option) {
    console.log("[v0] ECBC Air Conditioned selected:", option)
    console.log("[v0] Option code:", option?.code)
    setEcbcAirConditioned(option)
    setErrors((prev) => ({ ...prev, ecbcAirConditioned: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("[v0] State after update:", option)
    }, 100)
  }

  function setNameapprovedcolony(e) {
    setnameofApprovedcolony(e.target.value)
    setErrors((prev) => ({ ...prev, nameofApprovedcolony: "" }))
  }

  function setnocNumber(e) {
    setNocNumber(e.target.value)
    setErrors((prev) => ({ ...prev, NocNumber: "" }))
  }

  function selectfile(e) {
    setUploadedFile(e.target.files[0])
    setFile(e.target.files[0])
    setErrors((prev) => ({ ...prev, file: "" }))
  }

  function onClick(e) {
    console.log("inside_NOC_search")
  }

  function selectfiles(e) {
    setGreenUploadedFile(e.target.files[0])
    setFiles(e.target.files[0])
    setErrors((prev) => ({ ...prev, files: "" }))
  }

  function selectEcbcElectricalLoadFile(e) {
    setEcbcElectricalLoadFile(e.target.files[0])
    setEcbcElectricalLoadFileObj(e.target.files[0])
    setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: "" }))
  }

  function selectEcbcDemandLoadFile(e) {
    setEcbcDemandLoadFile(e.target.files[0])
    setEcbcDemandLoadFileObj(e.target.files[0])
    setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: "" }))
  }

  function selectEcbcAirConditionedFile(e) {
    setEcbcAirConditionedFile(e.target.files[0])
    setEcbcAirConditionedFileObj(e.target.files[0])
    setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: "" }))
  }

  const goNext = () => {
    if (!validateFields()) {
      return
    }

    const owners = formData.owners && formData.owners[index]
    const ownerStep = {
      ...owners,
      approvedColony,
      use,
      UlbName,
      Ulblisttype,
      District,
      rating,
      masterPlan,
      buildingStatus,
      purchasedFAR,
      greenbuilding,
      restrictedArea,
      proposedSite,
      nameofApprovedcolony,
      schemeName,
      transferredscheme,
      NocNumber,
      uploadedFile,
      greenuploadedFile,
      ecbcElectricalLoad,
      ecbcDemandLoad,
      ecbcAirConditioned,
      ecbcElectricalLoadFile,
      ecbcDemandLoadFile,
      ecbcAirConditionedFile,
    }
    const updatedFormData = { ...formData }

    if (!updatedFormData.owners) {
      updatedFormData.owners = []
    }

    onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index)
  }

  const onSkip = () => onSelect()

  const ErrorMessage = ({ error }) => {
    if (!error) return null
    return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{error}</div>
  }

  return (
    <React.Fragment>
      <Timeline currentStep={2} />
      <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={false}>
        <div>
          <CardLabel>{`${t("BPA_ULB_NAME")} *`}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="UlbName"
            value={UlbName}
            onChange={() => {}} // No-op since it's disabled
            style={{ width: "86%" }}
            ValidationRequired={false}
            disabled={true}
          />
          <ErrorMessage error={errors.UlbName} />

          <CardLabel>{`${t("BPA_DISTRICT")} *`}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="District"
            value={District}
            onChange={() => {}} // No-op since it's disabled
            style={{ width: "86%" }}
            ValidationRequired={false}
            disabled={true}
          />
          <ErrorMessage error={errors.District} />

          <CardLabel>{`${t("BPA_ULB_TYPE")} *`}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="Ulblisttype"
            value={Ulblisttype}
            onChange={() => {}} // No-op since it's disabled
            style={{ width: "86%" }}
            ValidationRequired={false}
            disabled={true}
          />
          <ErrorMessage error={errors.Ulblisttype} />

          <CardLabel>{`${t("BPA_APPROVED_COLONY")} *`}</CardLabel>
          <Controller
            control={control}
            name={"approvedColony"}
            defaultValue={approvedColony}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={approvedColony}
                select={setApprovedColony}
                option={approvedcolonyStatus}
                placeholder="Select Colony"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.approvedColony} />

          {approvedColony?.code === "YES" && (
            <React.Fragment>
              <CardLabel>{`${t("BPA_APPROVED_COLONY_NAME")} *`}</CardLabel>
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="nameofApprovedcolony"
                value={nameofApprovedcolony}
                placeholder="Approved Colony Name"
                onChange={setNameapprovedcolony}
                style={{ width: "86%" }}
                ValidationRequired={false}
                {...(validation = {
                  isRequired: true,
                  pattern: "^[a-zA-Z ]*$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
              />
              {errors.nameofApprovedcolony && <ErrorMessage error={errors.nameofApprovedcolony} />}
            </React.Fragment>
          )}
          {approvedColony?.code === "NO" && (
            <React.Fragment>
              <CardLabel>{`${t("BPA_NOC_NUMBER")} *`}</CardLabel>
              <div className="field-container">
                <TextInput
                  t={t}
                  type={"text"}
                  isMandatory={false}
                  optionKey="i18nKey"
                  name="NocNumber"
                  placeholder="NOC Number"
                  value={NocNumber}
                  onChange={setnocNumber}
                  style={{ width: "86%" }}
                  ValidationRequired={false}
                  {...(validation = {
                    pattern: "^[a-zA-Z0-9]*$",
                    type: "text",
                    title: t("TL_NAME_ERROR_MESSAGE"),
                  })}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: "100",
                    right: "95px",
                    marginTop: "-24px",
                    marginRight: Webview ? "-20px" : "-20px",
                  }}
                  onClick={(e) => onClick(e)}
                >
                  {" "}
                  <SearchIcon />{" "}
                </div>
              </div>
              <div style={{ position: "relative", fontWeight: "bold", left: "20px" }}>OR</div>
              <UploadFile
                id={"noc-doc"}
                style={{ width: "86%" }}
                onUpload={selectfile}
                onDelete={() => {
                  setUploadedFile(null)
                  setFile("")
                }}
                message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                error={errors.file}
                // uploadMessage={""}
              />
              {errors.NocNumber && <ErrorMessage error={errors.NocNumber} />}
            </React.Fragment>
          )}

          <CardLabel style={{ marginTop: "15px" }}>{`${t("BPA_MASTER_PLAN")} *`}</CardLabel>
          <Controller
            control={control}
            name={"masterPlan"}
            defaultValue={masterPlan}
            render={(props) => (
              <Dropdown
                placeholder="Have Master Plan?"
                className="form-field"
                selected={masterPlan}
                select={setMasterPlan}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.masterPlan} />

          {masterPlan?.code === "YES" && (
            <React.Fragment>
              <CardLabel>{`${t("BPA_USE")} *`}</CardLabel>
              <Controller
                control={control}
                name={"use"}
                defaultValue={use}
                render={(props) => (
                  <Dropdown
                    placeholder="USE"
                    className="form-field"
                    selected={use}
                    select={setUse}
                    option={selectmasterDrop}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
              {errors.use && <ErrorMessage error={errors.use} />}
            </React.Fragment>
          )}

          <CardLabel>{`${t("BPA_BUILDING_STATUS")} *`}</CardLabel>
          <Controller
            control={control}
            name={"buildingStatus"}
            defaultValue={buildingStatus}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={buildingStatus}
                select={setBuildingStatus}
                option={building_status}
                placeholder="Building Status"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.buildingStatus} />

          <CardLabel>{`${t("BPA_PURCHASED_FAR")} *`}</CardLabel>
          <Controller
            control={control}
            name={"purchasedFAR"}
            defaultValue={purchasedFAR}
            render={(props) => (
              <Dropdown
                placeholder="Purchased FAR"
                className="form-field"
                selected={purchasedFAR}
                select={setPurchasedFAR}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.purchasedFAR} />

          <CardLabel>{`${t("BPA_GREEN_BUIDINGS")} *`}</CardLabel>
          <Controller
            control={control}
            name={"greenbuilding"}
            defaultValue={greenbuilding}
            render={(props) => (
              <Dropdown
                placeholder="Is Green Building?"
                className="form-field"
                selected={greenbuilding}
                select={setGreenbuilding}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.greenbuilding} />

          {greenbuilding?.code === "YES" && (
            <React.Fragment>
              <UploadFile
                id={"green-building-doc"}
                onUpload={selectfiles}
                onDelete={() => {
                  setGreenUploadedFile(null)
                  setFiles("")
                }}
                message={greenuploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                error={errors.files}
                // uploadMessage={""}
              />
              <br></br>

              <CardLabel>{`${t("BPA_SELECT_RATINGS")} *`}</CardLabel>
              <Controller
                control={control}
                name={"rating"}
                defaultValue={rating}
                render={(props) => (
                  <Dropdown
                    placeholder="Select Ratings"
                    className="form-field"
                    selected={rating}
                    select={setrating}
                    option={selectRating}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
              {errors.rating && <ErrorMessage error={errors.rating} />}
            </React.Fragment>
          )}

          <CardLabel>{`${t("BPA_RESTRICTED_AREA")} *`}</CardLabel>
          <Controller
            control={control}
            name={"restrictedArea"}
            defaultValue={restrictedArea}
            render={(props) => (
              <Dropdown
                placeholder="Is Restricted Area?"
                className="form-field"
                selected={restrictedArea}
                select={setRestrictedArea}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.restrictedArea} />

          <CardLabel>{`${t("BPA_PROPOSED_SITE_TYPE")} *`}</CardLabel>
          <Controller
            control={control}
            name={"proposedSite"}
            defaultValue={proposedSite}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={proposedSite}
                select={setProposedSite}
                option={Typeofproposedsite}
                placeholder="Proposed Site Type"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.proposedSite} />

          <CardLabel>{`ECBC - Proposed Connected Electrical Load is above 100 Kw *`}</CardLabel>
          <Controller
            control={control}
            name={"ecbcElectricalLoad"}
            defaultValue={ecbcElectricalLoad}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={ecbcElectricalLoad}
                select={setEcbcElectricalLoadHandler}
                option={yesNoOptions}
                placeholder="Electrical Load > 100Kw?"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.ecbcElectricalLoad} />

          <CardLabel>{`ECBC - Proposed Demand of Electrical Load is above 120 Kw *`}</CardLabel>
          <Controller
            control={control}
            name={"ecbcDemandLoad"}
            defaultValue={ecbcDemandLoad}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={ecbcDemandLoad}
                select={setEcbcDemandLoadHandler}
                option={yesNoOptions}
                placeholder="Electrical Load > 120Kw?"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.ecbcDemandLoad} />

          <CardLabel>{`ECBC - Proposed Air Conditioned Area above 500 sq.mt *`}</CardLabel>
          <Controller
            control={control}
            name={"ecbcAirConditioned"}
            defaultValue={ecbcAirConditioned}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={ecbcAirConditioned}
                select={setEcbcAirConditionedHandler}
                option={yesNoOptions}
                placeholder="Conditioned Area > 500 sq.mt?"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.ecbcAirConditioned} />

          {(ecbcElectricalLoad?.code === "YES" ||
            ecbcDemandLoad?.code === "YES" ||
            ecbcAirConditioned?.code === "YES") && (
            <div style={{ marginTop: "10px" }}>
              <UploadFile
                id={
                  ecbcElectricalLoad?.code === "YES"
                    ? "ecbc-electrical-load-doc"
                    : ecbcDemandLoad?.code === "YES"
                      ? "ecbc-demand-load-doc"
                      : "ecbc-air-conditioned-doc"
                }
                style={{ width: "86%" }}
                value={
                  ecbcElectricalLoad?.code === "YES"
                    ? ecbcElectricalLoadFile
                    : ecbcDemandLoad?.code === "YES"
                      ? ecbcDemandLoadFile
                      : ecbcAirConditionedFile
                }
                onUpload={(file) => {
                  // Clear other files so only one is kept at a time
                  setEcbcElectricalLoadFile(null)
                  setEcbcElectricalLoadFileObj("")
                  setEcbcDemandLoadFile(null)
                  setEcbcDemandLoadFileObj("")
                  setEcbcAirConditionedFile(null)
                  setEcbcAirConditionedFileObj("")

                  if (ecbcElectricalLoad?.code === "YES") {
                    selectEcbcElectricalLoadFile(file)
                  } else if (ecbcDemandLoad?.code === "YES") {
                    selectEcbcDemandLoadFile(file)
                  } else {
                    selectEcbcAirConditionedFile(file)
                  }
                }}
                onDelete={() => {
                  if (ecbcElectricalLoad?.code === "YES") {
                    setEcbcElectricalLoadFile(null)
                    setEcbcElectricalLoadFileObj("")
                  } else if (ecbcDemandLoad?.code === "YES") {
                    setEcbcDemandLoadFile(null)
                    setEcbcDemandLoadFileObj("")
                  } else {
                    setEcbcAirConditionedFile(null)
                    setEcbcAirConditionedFileObj("")
                  }
                }}
                message={
                  ecbcElectricalLoad?.code === "YES"
                    ? ecbcElectricalLoadFile
                      ? `1 ${t(`FILEUPLOADED`)}`
                      : t(`ES_NO_FILE_SELECTED_LABEL`)
                    : ecbcDemandLoad?.code === "YES"
                      ? ecbcDemandLoadFile
                        ? `1 ${t(`FILEUPLOADED`)}`
                        : t(`ES_NO_FILE_SELECTED_LABEL`)
                      : ecbcAirConditionedFile
                        ? `1 ${t(`FILEUPLOADED`)}`
                        : t(`ES_NO_FILE_SELECTED_LABEL`)
                }
                error={
                  ecbcElectricalLoad?.code === "YES"
                    ? errors.ecbcElectricalLoadFile
                    : ecbcDemandLoad?.code === "YES"
                      ? errors.ecbcDemandLoadFile
                      : errors.ecbcAirConditionedFile
                }
              />
              {errors.ecbcElectricalLoadFile || errors.ecbcDemandLoadFile || errors.ecbcAirConditionedFile ? (
                <ErrorMessage
                  error={
                    ecbcElectricalLoad?.code === "YES"
                      ? errors.ecbcElectricalLoadFile
                      : ecbcDemandLoad?.code === "YES"
                        ? errors.ecbcDemandLoadFile
                        : errors.ecbcAirConditionedFile
                  }
                />
              ) : null}
            </div>
          )}
        </div>
      </FormStep>
    </React.Fragment>
  )
}

export default BPANewBuildingdetails