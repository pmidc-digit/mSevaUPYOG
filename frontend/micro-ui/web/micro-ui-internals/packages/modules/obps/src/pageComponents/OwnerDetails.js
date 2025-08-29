import React, { useEffect, useState } from "react";
import {
  FormStep,
  TextInput,
  CardLabel,
  RadioButtons,
  RadioOrSelect,
  LabelFieldPair,
  Dropdown,
  CheckBox,
  LinkButton,
  Loader,
  Toast,
  SearchIcon,
  DeleteIcon,
  UploadFile,
} from "@mseva/digit-ui-react-components";
import { stringReplaceAll, getPattern, convertDateTimeToEpoch, convertDateToEpoch, getDocumentforBPA } from "../utils";
import Timeline from "../components/Timeline";
import cloneDeep from "lodash/cloneDeep";

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{message}</div>;
};

// const OwnerDetails = ({ t, config, onSelect, userType, formData }) => {
//   console.log("formdatatstd", formData);

//   let validation = {};
//   sessionStorage.removeItem("currentPincode");

//   let isedittrade = window.location.href.includes("edit-application");
//   let isrenewtrade = window.location.href.includes("renew-trade");

//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   console.log(tenantId, "OWNER TENET ID");
//   const stateId = Digit.ULBService.getStateId();

//   const [canmovenext, setCanmovenext] = useState(isedittrade || isrenewtrade ? false : true);
//   const [ownershipCategoryList, setOwnershipCategoryList] = useState([]);
//   const [genderList, setGenderList] = useState([]);
//   const [documentUploadedFiles, setDocumentUploadedFiles] = useState({});
//   const [photoUploadedFiles, setPhotoUploadedFiles] = useState({});
//   const [authLetterUploadedFiles, setAuthLetterUploadedFiles] = useState({});

//   const [errors, setErrors] = useState({});

//   const setDocumentFile = (index, file) => {
//     const updatedFields = [...fields];
//     updatedFields[index].documentFile = file;
//     setFeilds(updatedFields);
//   };

//   const selectDocumentFile = (index) => (e) => {
//     const file = e.target.files[0];
//     if (file && file.size > 5 * 1024 * 1024) {
//       setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" });
//       return;
//     }
//     setDocumentFile(index, file);
//     setDocumentUploadedFiles((prev) => ({ ...prev, [index]: file }));
//     setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "" }));
//   };

//   const selectPhotoFile = (index) => (e) => {
//     const file = e.target.files[0];
//     if (file && file.size > 5 * 1024 * 1024) {
//       setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" });
//       return;
//     }
//     setOwnerPhoto(index, file);
//     setPhotoUploadedFiles((prev) => ({ ...prev, [index]: file }));
//     setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "" }));
//   };

//   const selectAuthLetterFile = (index) => (e) => {
//     const file = e.target.files[0];
//     if (file && file.size > 5 * 1024 * 1024) {
//       setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" });
//       return;
//     }
//     setAuthorizationLetter(index, file);
//     setAuthLetterUploadedFiles((prev) => ({ ...prev, [index]: file }));
//     setErrors((prev) => ({ ...prev, [`authLetter_${index}`]: "" }));
//   };

//   const setOwnerPhoto = (index, file) => {
//     const updatedFields = [...fields];
//     updatedFields[index].ownerPhoto = file;
//     setFeilds(updatedFields);
//   };

//   const setDateOfBirth = (index, e) => {
//     const updatedFields = [...fields];
//     updatedFields[index].dateOfBirth = e.target.value;
//     setFeilds(updatedFields);
//   };

//   const setAuthorizedPerson = (index, e) => {
//     const updatedFields = [...fields];
//     updatedFields[index].authorizedPerson = e.target.value;
//     setFeilds(updatedFields);
//   };

//   const setAuthorizationLetter = (index, file) => {
//     const updatedFields = [...fields];
//     updatedFields[index].authorizationLetter = file;
//     setFeilds(updatedFields);
//   };

//   const setOwnerAddress = (index, e) => {
//     const updatedFields = [...fields];
//     updatedFields[index].ownerAddress = e.target.value;
//     setFeilds(updatedFields);
//   };

//   const [documentTypes] = useState([
//     { code: "AADHAR", name: "Aadhar Card", i18nKey: "AADHAR_CARD" },
//     { code: "PAN", name: "Pan Card", i18nKey: "PAN_CARD" },
//     { code: "VOTER", name: "Voter ID", i18nKey: "VOTER_ID" },
//     { code: "DRIVING", name: "Driving License", i18nKey: "DRIVING_LICENSE" },
//   ]);

//   // Initialize with sessionStorage data first, then fall back to formData
//   const [ownershipCategory, setOwnershipCategory] = useState(() => {
//     const stored = sessionStorage.getItem("ownershipCategory");
//     return stored ? JSON.parse(stored) : formData?.owners?.ownershipCategory;
//   });

//   const [name, setName] = useState(() => {
//     return sessionStorage.getItem("ownerName") || formData?.owners?.name || "";
//   });

//   const [emailId, setEmail] = useState(() => {
//     return sessionStorage.getItem("ownerEmail") || formData?.owners?.emailId || "";
//   });

//   const [aadharNumber, setaadharNumber] = useState(() => {
//     return sessionStorage.getItem("ownerAadhar") || formData?.owners?.aadharNumber || "";
//   });

//   const [isPrimaryOwner, setisPrimaryOwner] = useState(false);

//   const [gender, setGender] = useState(() => {
//     const stored = sessionStorage.getItem("ownerGender");
//     return stored ? JSON.parse(stored) : formData?.owners?.gender;
//   });

//   const [mobileNumber, setMobileNumber] = useState(() => {
//     return sessionStorage.getItem("ownerMobileNumber") || formData?.owners?.mobileNumber || "";
//   });

//   const [showToast, setShowToast] = useState(null);
//   const [isDisable, setIsDisable] = useState(false);

//   let Webview = !Digit.Utils.browser.isMobile();

//   const ismultiple = ownershipCategory?.code?.includes("MULTIPLEOWNERS") ? true : false;

//   formData?.owners?.owners?.forEach((owner) => {
//     if (owner.isPrimaryOwner == "false") owner.isPrimaryOwner = false;
//   });

//   const [fields, setFeilds] = useState(() => {
//     const storedFields = sessionStorage.getItem("ownerFields");
//     if (storedFields) {
//       return JSON.parse(storedFields);
//     }
//     return (formData?.owners && formData?.owners?.owners) || [{ name: "", gender: "", mobileNumber: null, isPrimaryOwner: true }];
//   });

//   const user = Digit.UserService.getUser();
//   console.log("userrrr", user);

  

//   // Persist data to sessionStorage whenever state changes
//   useEffect(() => {
//     if (ownershipCategory) {
//       sessionStorage.setItem("ownershipCategory", JSON.stringify(ownershipCategory));
//     }
//   }, [ownershipCategory]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerName", name);
//   }, [name]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerEmail", emailId);
//   }, [emailId]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerAadhar", aadharNumber);
//   }, [aadharNumber]);

//   useEffect(() => {
//     if (gender) {
//       sessionStorage.setItem("ownerGender", JSON.stringify(gender));
//     }
//   }, [gender]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerMobileNumber", mobileNumber);
//   }, [mobileNumber]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerFields", JSON.stringify(fields));
//   }, [fields]);

//   useEffect(() => {
//     var flag = 0;
//     fields.map((ob) => {
//       if (ob?.isPrimaryOwner) flag = 1;
//       if (ob?.name && ob?.mobileNumber && ob?.gender) {
//         setCanmovenext(false);
//       } else {
//         setCanmovenext(true);
//       }
//     });
//     if (!canmovenext && ownershipCategory && !ownershipCategory?.code.includes("SINGLEOWNER")) {
//       if (flag == 1) setCanmovenext(false);
//       else setCanmovenext(true);
//     }
//   }, [fields]);

//   useEffect(() => {
//     const values = cloneDeep(fields);
//     if (ownershipCategory && !ismultiple && values?.length > 1) setFeilds([{ ...values[0], isPrimaryOwner: true }]);
//   }, [ownershipCategory]);

//   const { isLoading, data: ownerShipCategories } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["OwnerShipCategory"]);
//   const { data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

//   useEffect(() => {
//     const ownershipCategoryLists = ownerShipCategories?.["common-masters"]?.OwnerShipCategory;
//     if (ownershipCategoryLists && ownershipCategoryLists?.length > 0) {
//       const finalOwnershipCategoryList = ownershipCategoryLists.filter((data) => data?.code?.includes("INDIVIDUAL"));
//       finalOwnershipCategoryList.forEach((data) => {
//         data.i18nKey = `COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(data?.code, ".", "_")}`;
//       });
//       setOwnershipCategoryList(finalOwnershipCategoryList);
//     }
//   }, [ownerShipCategories]);

//   useEffect(() => {
//     const gendeTypeMenu = genderTypeData?.["common-masters"]?.GenderType || [];
//     if (gendeTypeMenu && gendeTypeMenu?.length > 0) {
//       const genderFilterTypeMenu = gendeTypeMenu.filter((data) => data.active);
//       genderFilterTypeMenu.forEach((data) => {
//         data.i18nKey = `COMMON_GENDER_${data.code}`;
//       });
//       setGenderList(genderFilterTypeMenu);
//     }
//   }, [genderTypeData]);

//   function selectedValue(value) {
//     setOwnershipCategory(value);
//   }

//   function handleAdd() {
//     const values = [...fields];
//     values.push({ name: "", gender: "", mobileNumber: null, isPrimaryOwner: false });
//     setFeilds(values);
//     setCanmovenext(true);
//   }

//   function handleRemove(index) {
//     const values = [...fields];
//     if (values.length != 1) {
//       values.splice(index, 1);
//       if (values.length == 1) {
//         values[0] = { ...values[0], isPrimaryOwner: true };
//       }
//       setFeilds(values);
//     }
//   }

//   function setOwnerName(i, e) {
//     let units = [...fields];
//     units[i].name = e.target.value;
//     setName(e.target.value);
//     setFeilds(units);
//     if (units[i].gender && units[i].mobileNumber && units[i].name) {
//       setCanmovenext(false);
//     }
//   }

//   function setGenderName(i, value) {
//     let units = [...fields];
//     units[i].gender = value;
//     setGender(value);
//     setFeilds(units);
//     if (units[i].gender && units[i].mobileNumber && units[i].name) {
//       setCanmovenext(false);
//     }
//   }
//   function setOwnerEmail(i, e) {
//     let units = [...fields];
//     units[i].emailId = e.target.value;
//     setEmail(e.target.value);
//     setFeilds(units);
//     if (units[i].gender && units[i].mobileNumber && units[i].name) {
//       setCanmovenext(false);
//     }
//   }
//   function setAadharNumber(i, e) {
//     let units = [...fields];
//     units[i].aadharNumber = e.target.value;
//     setaadharNumber(e.target.value);
//     setFeilds(units);
//     if (units[i].gender && units[i].mobileNumber && units[i].name) {
//       setCanmovenext(false);
//     }
//   }
//   function setMobileNo(i, e) {
//     let units = [...fields];
//     units[i].mobileNumber = e.target.value;
//     setMobileNumber(e.target.value);
//     setFeilds(units);
//     if (units[i].gender && units[i].mobileNumber && units[i].name) {
//       setCanmovenext(false);
//     }
//   }
//   function setPrimaryOwner(i, e) {
//     let units = [...fields];
//     units.map((units) => {
//       units.isPrimaryOwner = false;
//     });
//     units[i].isPrimaryOwner = ismultiple ? e.target.checked : true;
//     setisPrimaryOwner(e.target.checked);
//     setFeilds(units);
//   }
//   const [error, setError] = useState(null);

//   function getusageCategoryAPI(arr) {
//     let usageCat = "";
//     arr.map((ob, i) => {
//       usageCat = usageCat + (i !== 0 ? "," : "") + ob.code;
//     });
//     return usageCat;
//   }

//   function getUnitsForAPI(subOccupancyData) {
//     const ob = subOccupancyData?.subOccupancy;
//     const blocksDetails = subOccupancyData?.data?.edcrDetails?.planDetail?.blocks || [];
//     let units = [];
//     if (ob) {
//       let result = Object.entries(ob);
//       result.map((unit, index) => {
//         units.push({
//           blockIndex: index,
//           floorNo: unit[0].split("_")[1],
//           unitType: "Block",
//           occupancyType: blocksDetails?.[index]?.building?.occupancies?.[0]?.typeHelper?.type?.code || "A",
//           usageCategory: getusageCategoryAPI(unit[1]),
//         });
//       });
//     }
//     return units;
//   }

//   function getBlockIds(arr) {
//     let blockId = {};
//     arr.map((ob, ind) => {
//       blockId[`Block_${ob.floorNo}`] = ob.id;
//     });
//     return blockId;
//   }

//   const closeToast = () => {
//     setShowToast(null);
//   };

//   const getOwnerDetails = async (indexValue, eData) => {
//     const ownersCopy = cloneDeep(fields);
//     const ownerNo = ownersCopy?.[indexValue]?.mobileNumber || "";
//     setShowToast(null);

//     if (!ownerNo.match(getPattern("MobileNo"))) {
//       setShowToast({ key: "true", error: true, message: "ERR_MOBILE_NUMBER_INCORRECT" });
//       return;
//     }

//     if (ownerNo === ownersCopy?.[indexValue]?.userName && ownerRoleCheck?.code !== "BPA_ARCHITECT" && ownerRoleCheck?.code !== "BPA_SUPERVISOR") {
//       setShowToast({ key: "true", error: true, message: "ERR_OWNER_ALREADY_ADDED_TOGGLE_MSG" });
//       return;
//     }

//     const matchingOwnerIndex = ownersCopy.findIndex((item) => item.userName === ownerNo);

//     if (matchingOwnerIndex > -1 && ownerRoleCheck?.code !== "BPA_ARCHITECT" && ownerRoleCheck?.code !== "BPA_SUPERVISOR") {
//       setShowToast({ key: "true", error: true, message: "ERR_OWNER_ALREADY_ADDED" });
//       return;
//     } else {
//       const usersResponse = await Digit.UserService.userSearch(Digit.ULBService.getStateId(), { userName: fields?.[indexValue]?.mobileNumber }, {});
//       let found = usersResponse?.user?.[0]?.roles?.filter((el) => el.code === "BPA_ARCHITECT" || el.code === "BPA_SUPERVISOR")?.[0];
//       if (usersResponse?.user?.length === 0) {
//         setShowToast({ key: "true", warning: true, message: "ERR_MOBILE_NUMBER_NOT_REGISTERED" });
//         return;
//       } else {
//         const userData = usersResponse?.user?.[0];
//         userData.gender = userData.gender ? { code: userData.gender, active: true, i18nKey: `COMMON_GENDER_${userData.gender}` } : "";
//         if (userData?.dob) userData.dob = convertDateToEpoch(userData?.dob);
//         if (userData?.createdDate) {
//           userData.createdDate = convertDateTimeToEpoch(userData?.createdDate);
//           userData.lastModifiedDate = convertDateTimeToEpoch(userData?.lastModifiedDate);
//           userData.pwdExpiryDate = convertDateTimeToEpoch(userData?.pwdExpiryDate);
//         }

//         let values = [...ownersCopy];
//         if (values[indexValue]) {
//           values[indexValue] = userData;
//           values[indexValue].isPrimaryOwner = fields[indexValue]?.isPrimaryOwner || false;
//         }
//         setFeilds(values);
//         if (values[indexValue]?.mobileNumber && values[indexValue]?.name && values[indexValue]?.gender?.code) setCanmovenext(true);
//         else setCanmovenext(false);

//         if (found) {
//           setCanmovenext(false);
//           //setownerRoleCheck(found);
//           setShowToast({ key: "true", error: true, message: `BPA_OWNER_VALIDATION_${found?.code}` });
//           return;
//         }
//       }
//     }
//   };

//   const getUserData = async (data, tenant) => {
//     let flag = false;
//     let userresponse = [];
//     userresponse = fields?.map((ob, indexValue) => {
//       return Digit.UserService.userSearch(Digit.ULBService.getStateId(), { userName: fields?.[indexValue]?.mobileNumber }, {}).then((ob) => {
//         return ob;
//       });
//     });
//     //getting user data from citizen uuid
//     userresponse = await Promise.all(userresponse);
//     let foundMobileNo = [];
//     let found = false;
//     userresponse &&
//       userresponse?.length > 0 &&
//       userresponse.map((ob) => {
//         found = ob?.user?.[0]?.roles?.filter((el) => el.code === "BPA_ARCHITECT" || el.code === "BPA_SUPERVISOR")?.[0];
//         if (
//           fields.find(
//             (fi) =>
//               !(fi?.uuid && !found) &&
//               ((fi?.name === ob?.user?.[0]?.name && fi?.mobileNumber === ob?.user?.[0]?.mobileNumber) ||
//                 (fi?.mobileNumber === ob?.user?.[0]?.mobileNumber && found))
//           )
//         ) {
//           flag = true;
//           foundMobileNo.push(ob?.user?.[0]?.mobileNumber);
//         }
//       });

//     if (foundMobileNo?.length > 0)
//       setShowToast({
//         key: "true",
//         error: true,
//         message: `${t("BPA_OWNER_VALIDATION_1")} ${foundMobileNo?.join(", ")} ${t("BPA_OWNER_VALIDATION_2")}`,
//       });
//     if (flag == true) return false;
//     else return true;
//   };

//   console.log(formData, "FormDATA");
//   const goNext = async () => {
//     setError(null);
//     const moveforward = await getUserData();

//     if (!moveforward) return;

//     if (ismultiple === true && fields.length === 1) {
//       window.scrollTo(0, 0);
//       setError("BPA_ERROR_MULTIPLE_OWNER");
//       return;
//     }

//     let owner = formData.owners;
//     let ownerStep = { ...owner, owners: fields, ownershipCategory: ownershipCategory };

//     if (!formData?.id) {
//       setIsDisable(true);

//       let conversionOwners = [];
//       ownerStep?.owners?.map((owner) => {
//         conversionOwners.push({
//           ...owner,
//           active: true,
//           name: owner.name,
//           emailId: owner.emailId,
//           aadharNumber: owner.aadharNumber,
//           mobileNumber: owner.mobileNumber,
//           isPrimaryOwner: owner.isPrimaryOwner,
//           gender: owner.gender.code,
//           fatherOrHusbandName: "NAME",
//         });
//       });

//       let payload = {};
//       payload.edcrNumber = formData?.data?.scrutinyNumber?.edcrNumber;
//       payload.riskType = formData?.data?.riskType;
//       payload.applicationType = formData?.data?.applicationType;
//       payload.serviceType = formData?.data?.serviceType;

//       const userInfo = Digit.UserService.getUser();
//       const accountId = userInfo?.info?.uuid;

//       payload.tenantId = formData?.address?.city?.code;
//       payload.workflow = { action: "INITIATE", assignes: [userInfo?.info?.uuid] };
//       payload.accountId = accountId;
//       // payload.documents = null;
//       payload.documents = getDocumentforBPA(formData?.documents?.documents, formData?.PrevStateDocuments);
//       // payload.documents = documents && documents.length > 0 ? documents : [];

//       payload.additionalDetails = { GISPlaceName: formData?.address?.placeName };
//       payload.additionalDetails.boundaryWallLength = formData?.data?.boundaryWallLength || "NA";
//       payload.additionalDetails.area = formData?.data.edcrDetails.planDetail.planInformation.plotArea?.toString() || "NA";
//       payload.additionalDetails.height = formData?.data.edcrDetails.planDetail.blocks[0].building.buildingHeight?.toString() || "NA";
//       payload.additionalDetails.usage = formData?.data.occupancyType || "NA";
//       payload.additionalDetails.builtUpArea = formData?.data.edcrDetails.planDetail.blocks[0].building.totalBuitUpArea?.toString() || "NA";
//       payload.additionalDetails.ownerName = conversionOwners.map((obj) => obj.name).join(",");

//       if (formData?.data?.registrationDetails) payload.additionalDetails.registrationDetails = formData?.data?.registrationDetails;
//       if (formData?.data?.applicationType) payload.additionalDetails.applicationType = formData?.data?.applicationType;
//       if (formData?.data?.serviceType) payload.additionalDetails.serviceType = formData?.data?.serviceType;
//       if (formData?.data?.wardnumber) payload.additionalDetails.wardnumber = formData?.data?.wardnumber;
//       if (formData?.data?.zonenumber) payload.additionalDetails.zonenumber = formData?.data?.zonenumber;
//       if (formData?.data?.khasraNumber) payload.additionalDetails.khasraNumber = formData?.data?.khasraNumber;
//       if (formData?.data?.architectid) payload.additionalDetails.architectid = formData?.data?.architectid;
//       if (formData?.data?.propertyuid) payload.additionalDetails.propertyuid = formData?.data?.propertyuid;
//       if (formData?.data?.bathnumber) payload.additionalDetails.bathnumber = formData?.data?.bathnumber;
//       if (formData?.data?.kitchenNumber) payload.additionalDetails.kitchenNumber = formData?.data?.kitchenNumber;
//       if (formData?.data?.approxinhabitants) payload.additionalDetails.approxinhabitants = formData?.data?.approxinhabitants;
//       if (formData?.data?.materialusedinfloor) payload.additionalDetails.materialusedinfloor = formData?.data?.materialusedinfloor;
//       if (formData?.data?.distancefromsewer) payload.additionalDetails.distancefromsewer = formData?.data?.distancefromsewer;
//       if (formData?.data?.sourceofwater) payload.additionalDetails.sourceofwater = formData?.data?.sourceofwater;
//       if (formData?.data?.watercloset) payload.additionalDetails.watercloset = formData?.data?.watercloset;
//       if (formData?.data?.materialused) payload.additionalDetails.materialused = formData?.data?.materialused;
//       if (formData?.data?.materialusedinroofs) payload.additionalDetails.materialusedinroofs = formData?.data?.materialusedinroofs;
//       if (formData?.owners?.approvedColony?.code) payload.additionalDetails.approvedColony = formData?.owners?.approvedColony?.code;
//       if (formData?.owners?.buildingStatus?.code) payload.additionalDetails.buildingStatus = formData?.owners?.buildingStatus?.code;
//       if (formData?.owners?.greenbuilding?.code) payload.additionalDetails.greenbuilding = formData?.owners?.greenbuilding?.code;
//       if (formData?.owners?.masterPlan?.code) payload.additionalDetails.masterPlan = formData?.owners?.masterPlan?.code;
//       if (formData?.owners?.proposedSite?.code) payload.additionalDetails.proposedSite = formData?.owners?.proposedSite?.code;
//       if (formData?.owners?.purchasedFAR?.code) payload.additionalDetails.purchasedFAR = formData?.owners?.purchasedFAR?.code;
//       if (formData?.owners?.restrictedArea?.code) payload.additionalDetails.restrictedArea = formData?.owners?.restrictedArea?.code;
//       if (formData?.owners?.schemes?.i18nKey) payload.additionalDetails.schemes = formData?.owners?.schemes?.i18nKey;
//       if (formData?.owners?.UlbName?.code) {
//         payload.additionalDetails.UlbName = formData?.owners?.UlbName?.code.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
//       }
//       if (formData?.owners?.District?.code) payload.additionalDetails.District = formData?.owners?.District?.code;
//       if (formData?.owners?.nameofApprovedcolony) payload.additionalDetails.nameofApprovedcolony = formData?.owners?.nameofApprovedcolony;
//       if (formData?.owners?.NocNumber) payload.additionalDetails.NocNumber = formData?.owners?.NocNumber;
//       if (formData?.owners?.coreArea?.code) payload.additionalDetails.coreArea = formData?.owners?.coreArea?.code;
//       if (formData?.owners?.schemesselection?.i18nKey) payload.additionalDetails.schemesselection = formData?.owners?.schemesselection?.i18nKey;
//       if (formData?.owners?.schemeName) payload.additionalDetails.schemeName = formData?.owners?.schemeName;
//       if (formData?.owners?.transferredscheme) payload.additionalDetails.transferredscheme = formData?.owners?.transferredscheme;
//       if (formData?.owners?.Ulblisttype?.value) payload.additionalDetails.Ulblisttype = formData?.owners?.Ulblisttype?.value;
//       if (formData?.owners?.uploadedFile) payload.additionalDetails.uploadedFileNoc = formData?.owners?.uploadedFile;
//       if (formData?.owners?.rating?.code) payload.additionalDetails.rating = formData?.owners?.rating?.code;
//       if (formData?.owners?.greenuploadedFile) payload.additionalDetails.uploadedFileGreenBuilding = formData?.owners?.greenuploadedFile;
//       if (formData?.owners?.use?.code) payload.additionalDetails.use = formData?.owners?.use?.code;

//       if (user?.info?.name) payload.additionalDetails.architectName = user?.info?.name;
//       if (user?.info?.mobileNumber) payload.additionalDetails.architectMobileNumber = user?.info?.mobileNumber;

//       payload.landInfo = {};
//       payload.landInfo.address = {};

//       if (formData?.address?.city?.code) {
//         payload.landInfo.address.city = formData?.address?.city?.code;
//       }

//       if (formData?.address?.locality?.code) {
//         payload.landInfo.address.locality = { code: formData?.address?.locality?.code };
//       } else if (formData?.address?.city?.code) {
//         payload.landInfo.address.locality = { code: formData?.address?.city?.code };
//       } else {
//         setIsDisable(false);
//         setShowToast({ key: "true", error: true, message: "Locality is required to proceed." });
//         return;
//       }

//       if (formData?.address?.pincode) payload.landInfo.address.pincode = formData?.address?.pincode;
//       if (formData?.address?.landmark) payload.landInfo.address.landmark = formData?.address?.landmark;
//       if (formData?.address?.street) payload.landInfo.address.street = formData?.address?.street;
//       if (formData?.address?.geoLocation) payload.landInfo.address.geoLocation = formData?.address?.geoLocation;

//       payload.landInfo.owners = conversionOwners;
//       // payload.landInfo.ownershipCategory = ownershipCategory.code;
//       payload.landInfo.ownershipCategory = ownershipCategory?.code ?? ownershipCategory;
//       payload.landInfo.tenantId = formData?.address?.city?.code;

//       // Units
//       payload.landInfo.unit = getUnitsForAPI(formData);

//       // Architect info from session
//       let nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME");
//       let parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT";
//       payload.additionalDetails.typeOfArchitect = parsedArchitectName;
//       payload.additionalDetails.stakeholderName = JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_NAME"));
//       payload.additionalDetails.stakeholderRegistrationNumber = JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_REGISTRATION_NUMBER"));
//       payload.additionalDetails.stakeholderAddress = JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_ADDRESS"));

//       let isSelfCertificationRequired = sessionStorage.getItem("isSelfCertificationRequired");
//       if (isSelfCertificationRequired === "undefined" || isSelfCertificationRequired === null) {
//         isSelfCertificationRequired = "false";
//       }
//       payload.additionalDetails.isSelfCertificationRequired = isSelfCertificationRequired.toString();

//       Digit.OBPSService.create({ BPA: payload }, tenantId)
//         .then((result) => {
//           if (result?.BPA?.length > 0) {
//             result?.BPA?.[0]?.landInfo?.owners?.forEach((owner) => {
//               owner.gender = { code: owner.gender, active: true, i18nKey: `COMMON_GENDER_${owner.gender}` };
//             });
//             result.BPA[0].owners = { ...owner, owners: result?.BPA?.[0]?.landInfo?.owners, ownershipCategory: ownershipCategory };
//             result.BPA[0].address = result?.BPA?.[0]?.landInfo?.address;
//             result.BPA[0].address.city = formData.address.city;
//             result.BPA[0].address.locality = formData.address.locality;
//             result.BPA[0].placeName = formData?.address?.placeName;
//             result.BPA[0].data = formData.data;
//             result.BPA[0].BlockIds = getBlockIds(result.BPA[0].landInfo.unit);
//             result.BPA[0].subOccupancy = formData?.subOccupancy;
//             result.BPA[0].uiFlow = formData?.uiFlow;
//             setIsDisable(false);
//             onSelect("", result.BPA[0], "", true);
//           }
//         })
//         .catch((e) => {
//           setIsDisable(false);
//           setShowToast({ key: "true", error: true, message: e?.response?.data?.Errors?.[0]?.message || "Submission failed" });
//         });
//     } else {
//       // Editing case
//       onSelect(config.key, ownerStep);
//     }
//   };

//   const onSkip = () => onSelect();

//   // if (isLoading) {
//   //     return <Loader />
//   // }

//   console.log(formData, "DATA++++++");
//   function getCanMoveNextMultiple() {
//     let flag = 0;
//     fields &&
//       fields?.map((ob) => {
//         if (flag !== 1 && (!ob?.name || !ob?.mobileNumber || !ob?.gender?.code)) flag = 1;
//       });
//     if (flag == 0) return false;
//     else return true;
//   }

//   return (
//     <div>
//       <Timeline currentStep={3} />
//       <FormStep
//         config={config}
//         onSelect={goNext}
//         onSkip={onSkip}
//         t={t}
//         isDisabled={canmovenext || getCanMoveNextMultiple() || !ownershipCategory || isDisable}
//         forcedError={t(error)}
//       >
//         {!isLoading ? (
//           <div style={{ marginBottom: "10px" }}>
//             <div>
//               <CardLabel>{`${t("BPA_TYPE_OF_OWNER_LABEL")} *`}</CardLabel>
//               <RadioButtons
//                 isMandatory={config.isMandatory}
//                 options={ownershipCategoryList}
//                 selectedOption={ownershipCategory}
//                 optionsKey="i18nKey"
//                 onSelect={selectedValue}
//                 value={ownershipCategory}
//                 labelKey="PT_OWNERSHIP"
//                 isDependent={true}
//               />
//             </div>
//             {fields.map((field, index) => {
//               return (
//                 <div key={`${field}-${index}`}>
//                   <div
//                     style={{
//                       border: "solid",
//                       borderRadius: "5px",
//                       padding: "10px",
//                       paddingTop: "20px",
//                       marginTop: "10px",
//                       borderColor: "#f3f3f3",
//                       background: "#FAFAFA",
//                     }}
//                   >
//                     <CardLabel style={{ marginBottom: "-15px" }}>{`${t("CORE_COMMON_MOBILE_NUMBER")} *`}</CardLabel>
//                     {ismultiple && (
//                       <LinkButton
//                         label={
//                           <DeleteIcon
//                             style={{ float: "right", position: "relative", bottom: "5px" }}
//                             fill={!(fields.length == 1) ? "#494848" : "#FAFAFA"}
//                           />
//                         }
//                         style={{ width: "100px", display: "inline", background: "black" }}
//                         onClick={(e) => handleRemove(index)}
//                       />
//                     )}
//                     <div style={{ marginTop: "30px" }}>
//                       <div className="field-container">
//                         <div
//                           style={{ position: "relative", zIndex: "100", left: "35px", marginTop: "-24.5px", marginLeft: Webview ? "-25px" : "-25px" }}
//                         >
//                           +91
//                         </div>
//                         <TextInput
//                           style={{ background: "#FAFAFA", padding: "0px 35px" }}
//                           type={"text"}
//                           t={t}
//                           isMandatory={false}
//                           optionKey="i18nKey"
//                           name="mobileNumber"
//                           value={field.mobileNumber}
//                           onChange={(e) => setMobileNo(index, e)}
//                           {...(validation = {
//                             isRequired: true,
//                             pattern: "[6-9]{1}[0-9]{9}",
//                             type: "tel",
//                             title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),
//                           })}
//                         />
//                         <div
//                           style={{ position: "relative", zIndex: "100", right: "35px", marginTop: "-24px", marginRight: Webview ? "-20px" : "-20px" }}
//                           onClick={(e) => getOwnerDetails(index, e)}
//                         >
//                           {" "}
//                           <SearchIcon />{" "}
//                         </div>
//                       </div>
//                     </div>
//                     <CardLabel>{`${t("CORE_COMMON_NAME")} *`}</CardLabel>
//                     <TextInput
//                       style={{ background: "#FAFAFA" }}
//                       t={t}
//                       type={"text"}
//                       isMandatory={false}
//                       optionKey="i18nKey"
//                       name="name"
//                       value={field.name}
//                       onChange={(e) => setOwnerName(index, e)}
//                       {...(validation = {
//                         isRequired: true,
//                         pattern: "^[a-zA-Z ]*$",
//                         type: "text",
//                         title: t("TL_NAME_ERROR_MESSAGE"),
//                       })}
//                     />
//                     <CardLabel>{`${t("BPA_APPLICANT_GENDER_LABEL")} *`}</CardLabel>
//                     <RadioOrSelect
//                       name="gender"
//                       options={genderList}
//                       selectedOption={field.gender}
//                       optionKey="i18nKey"
//                       onSelect={(e) => setGenderName(index, e)}
//                       t={t}
//                     />
//                     {/* <CardLabel>{`${t("BPA_AADHAAR_NUMBER_LABEL_NEW")}`}</CardLabel>
//                     <TextInput
//                       style={{ background: "#FAFAFA" }}
//                       t={t}
//                       type={"text"}
//                       isMandatory={false}
//                       optionKey="i18nKey"
//                       name="aadharNumber"
//                       value={field.aadharNumber}
//                       onChange={(e) => setAadharNumber(index, e)}
//                       {...(validation = {
//                         pattern: "^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$",
//                         type: "tel",
//                         title: t("INVALID_AADHAAR_NUMBER"),
//                       })}
//                     /> */}
//                     <CardLabel>{`${t("CORE_EMAIL_ID")}`}</CardLabel>
//                     <TextInput
//                       style={{ background: "#FAFAFA" }}
//                       t={t}
//                       type={"emailId"}
//                       isMandatory={false}
//                       optionKey="i18nKey"
//                       name="emailId"
//                       value={field.emailId}
//                       onChange={(e) => setOwnerEmail(index, e)}
//                       {...(validation = {
//                         //isRequired: true,
//                         pattern: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$",
//                         type: "emailId",
//                         title: t("TL_EMAIL_ID_ERROR_MESSAGE"),
//                       })}
//                       disabled={false}
//                       //disabled={true}
//                     />

//                     {/* <CardLabel>{`Document Type *`}</CardLabel>
//                     <Dropdown
//                       option={documentTypes}
//                       selected={field.documentType}
//                       optionKey="i18nKey"
//                       onSelect={(value) => setDocumentType(index, value)}
//                       t={t}
//                       placeholder="Select Document Type"
//                     />
//                     <ErrorMessage message={errors[`documentType_${index}`]} /> */}

//                     <CardLabel style={{ marginTop: "30px" }}>{`Upload Valid ID Copy (PAN/Voter ID/ Driving License) (PDF, Max 5MB) *`}</CardLabel>
//                     <UploadFile
//                       id={`document-upload-${index}`}
//                       onUpload={selectDocumentFile(index)}
//                       onDelete={() => {
//                         setDocumentFile(index, null);
//                         setDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }));
//                         setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "Document upload is required" }));
//                       }}
//                       message={documentUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
//                       error={errors[`documentFile_${index}`]}
//                       uploadMessage=""
//                       accept=".pdf"
//                     />
//                     <ErrorMessage message={errors[`documentFile_${index}`]} />

//                     <CardLabel style={{ marginTop: "30px" }}>{`Upload Owner Photo *`}</CardLabel>
//                     <UploadFile
//                       id={`photo-upload-${index}`}
//                       onUpload={selectPhotoFile(index)}
//                       onDelete={() => {
//                         setOwnerPhoto(index, null);
//                         setPhotoUploadedFiles((prev) => ({ ...prev, [index]: null }));
//                         setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "Owner photo is required" }));
//                       }}
//                       message={photoUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
//                       error={errors[`ownerPhoto_${index}`]}
//                       uploadMessage=""
//                       accept="image/*"
//                     />
//                     <ErrorMessage message={errors[`ownerPhoto_${index}`]} />

//                     <CardLabel style={{ marginTop: "30px" }}>{`Date of Birth *`}</CardLabel>
//                     <TextInput
//                       style={{ background: "#FAFAFA" }}
//                       t={t}
//                       type={"date"}
//                       isMandatory={false}
//                       name="dateOfBirth"
//                       value={field.dateOfBirth}
//                       onChange={(e) => setDateOfBirth(index, e)}
//                     />
//                     <ErrorMessage message={errors[`dob_${index}`]} />

//                     <CardLabel>{`Authorized Person (If Any)`}</CardLabel>
//                     <TextInput
//                       style={{ background: "#FAFAFA" }}
//                       t={t}
//                       type={"text"}
//                       isMandatory={false}
//                       name="authorizedPerson"
//                       value={field.authorizedPerson}
//                       onChange={(e) => setAuthorizedPerson(index, e)}
//                       {...(validation = {
//                         pattern: "^[a-zA-Z ]*$",
//                         type: "text",
//                         title: "Invalid name format",
//                       })}
//                     />

//                     {field.authorizedPerson && (
//                       <React.Fragment>
//                         <CardLabel>{`Authorization Letter (PDF, Max 5MB)`}</CardLabel>
//                         <UploadFile
//                           id={`auth-letter-${index}`}
//                           onUpload={selectAuthLetterFile(index)}
//                           onDelete={() => {
//                             setAuthorizationLetter(index, null);
//                             setAuthLetterUploadedFiles((prev) => ({ ...prev, [index]: null }));
//                             if (field.authorizedPerson) {
//                               setErrors((prev) => ({
//                                 ...prev,
//                                 [`authLetter_${index}`]: "Authorization letter is required when authorized person is specified",
//                               }));
//                             }
//                           }}
//                           message={authLetterUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
//                           uploadMessage=""
//                           accept=".pdf"
//                         />
//                         <ErrorMessage message={errors[`authLetter_${index}`]} />
//                       </React.Fragment>
//                     )}

//                     <CardLabel>{`Owner's Address *`}</CardLabel>
//                     <textarea
//                       style={{
//                         background: "#FAFAFA",
//                         width: "100%",
//                         minHeight: "80px",
//                         padding: "8px",
//                         border: "1px solid #ccc",
//                         borderRadius: "4px",
//                         resize: "vertical",
//                       }}
//                       placeholder="Enter complete address"
//                       value={field.ownerAddress}
//                       onChange={(e) => setOwnerAddress(index, e)}
//                     />
//                     <ErrorMessage message={errors[`address_${index}`]} />

//                     {ismultiple && (
//                       <CheckBox
//                         label={t("BPA_IS_PRIMARY_OWNER_LABEL")}
//                         onChange={(e) => setPrimaryOwner(index, e)}
//                         value={field.isPrimaryOwner}
//                         checked={field.isPrimaryOwner}
//                         style={{ paddingTop: "10px" }}
//                       />
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//             {ismultiple ? (
//               <div>
//                 <div style={{ display: "flex", paddingBottom: "15px", color: "#FF8C00" }}>
//                   <button type="button" style={{ paddingTop: "10px" }} onClick={() => handleAdd()}>
//                     {t("BPA_ADD_OWNER")}
//                   </button>
//                 </div>
//               </div>
//             ) : null}
//           </div>
//         ) : (
//           <Loader />
//         )}
//       </FormStep>
//       {showToast && (
//         <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
//       )}
//     </div>
//   );
// };

// export default OwnerDetails;


const OwnerDetails = ({ t, config, onSelect, userType, formData }) => {
  console.log("formdatatstd", formData)

  let validation = {}
  sessionStorage.removeItem("currentPincode")

  const isedittrade = window.location.href.includes("edit-application")
  const isrenewtrade = window.location.href.includes("renew-trade")

  const tenantId = Digit.ULBService.getCurrentTenantId()
  console.log(tenantId, "OWNER TENET ID")
  const stateId = Digit.ULBService.getStateId()

  const [canmovenext, setCanmovenext] = useState(isedittrade || isrenewtrade ? false : true)
  const [ownershipCategoryList, setOwnershipCategoryList] = useState([])
  const [genderList, setGenderList] = useState([])
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({})
  const [photoUploadedFiles, setPhotoUploadedFiles] = useState({})
  const [authLetterUploadedFiles, setAuthLetterUploadedFiles] = useState({})

  const [errors, setErrors] = useState({})
  const [ownerRoleCheck, setOwnerRoleCheck] = useState(null) // Declare ownerRoleCheck variable

  const setDocumentFile = (index, file) => {
    const updatedFields = [...fields]
    updatedFields[index].documentFile = file
    setFeilds(updatedFields)
  }

  const selectDocumentFile = (index) => (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" })
      return
    }
    setDocumentFile(index, file)
    setDocumentUploadedFiles((prev) => ({ ...prev, [index]: file }))
    setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "" }))
  }

  const selectPhotoFile = (index) => (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" })
      return
    }
    setOwnerPhoto(index, file)
    setPhotoUploadedFiles((prev) => ({ ...prev, [index]: file }))
    setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "" }))
  }

  const selectAuthLetterFile = (index) => (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" })
      return
    }
    setAuthorizationLetter(index, file)
    setAuthLetterUploadedFiles((prev) => ({ ...prev, [index]: file }))
    setErrors((prev) => ({ ...prev, [`authLetter_${index}`]: "" }))
  }

  const setOwnerPhoto = (index, file) => {
    const updatedFields = [...fields]
    updatedFields[index].ownerPhoto = file
    setFeilds(updatedFields)
  }

  const setDateOfBirth = (index, e) => {
    const updatedFields = [...fields]
    updatedFields[index].dateOfBirth = e.target.value
    setFeilds(updatedFields)
  }

  const setAuthorizedPerson = (index, e) => {
    const updatedFields = [...fields]
    updatedFields[index].authorizedPerson = e.target.value
    setFeilds(updatedFields)
  }

  const setAuthorizationLetter = (index, file) => {
    const updatedFields = [...fields]
    updatedFields[index].authorizationLetter = file
    setFeilds(updatedFields)
  }

  const setOwnerAddress = (index, e) => {
    const updatedFields = [...fields]
    updatedFields[index].ownerAddress = e.target.value
    setFeilds(updatedFields)
  }

  const [documentTypes] = useState([
    { code: "AADHAR", name: "Aadhar Card", i18nKey: "AADHAR_CARD" },
    { code: "PAN", name: "Pan Card", i18nKey: "PAN_CARD" },
    { code: "VOTER", name: "Voter ID", i18nKey: "VOTER_ID" },
    { code: "DRIVING", name: "Driving License", i18nKey: "DRIVING_LICENSE" },
  ])

  // Initialize with sessionStorage data first, then fall back to formData
  const [ownershipCategory, setOwnershipCategory] = useState(() => {
    const stored = sessionStorage.getItem("ownershipCategory")
    return stored ? JSON.parse(stored) : formData?.owners?.ownershipCategory
  })

  const [name, setName] = useState(() => {
    return sessionStorage.getItem("ownerName") || formData?.owners?.name || ""
  })

  const [emailId, setEmail] = useState(() => {
    return sessionStorage.getItem("ownerEmail") || formData?.owners?.emailId || ""
  })

  const [aadharNumber, setaadharNumber] = useState(() => {
    return sessionStorage.getItem("ownerAadhar") || formData?.owners?.aadharNumber || ""
  })

  const [isPrimaryOwner, setisPrimaryOwner] = useState(false)

  const [gender, setGender] = useState(() => {
    const stored = sessionStorage.getItem("ownerGender")
    return stored ? JSON.parse(stored) : formData?.owners?.gender
  })

  const [mobileNumber, setMobileNumber] = useState(() => {
    return sessionStorage.getItem("ownerMobileNumber") || formData?.owners?.mobileNumber || ""
  })

  const [showToast, setShowToast] = useState(null)
  const [isDisable, setIsDisable] = useState(false)

  const Webview = !Digit.Utils.browser.isMobile()

  const ismultiple = ownershipCategory?.code?.includes("MULTIPLEOWNERS") ? true : false

  formData?.owners?.owners?.forEach((owner) => {
    if (owner.isPrimaryOwner == "false") owner.isPrimaryOwner = false
  })

  const [fields, setFeilds] = useState(() => {
    const storedFields = sessionStorage.getItem("ownerFields")
    if (storedFields) {
      return JSON.parse(storedFields)
    }
    return (
      (formData?.owners && formData?.owners?.owners) || [
        { name: "", gender: "", mobileNumber: null, isPrimaryOwner: true },
      ]
    )
  })

  const user = Digit.UserService.getUser()
  console.log("userrrr", user)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("Digit.BUILDING_PERMIT")
      if (!raw) return
      const parsed = JSON.parse(raw)
      const applicantName = parsed?.value?.data?.applicantName ?? parsed?.data?.applicantName ?? parsed?.applicantName

      if (!applicantName || typeof applicantName !== "string") return

      // update single-name state
      setName(applicantName)

      // update first owner's name in fields so the input shows it directly
      setFeilds((prev) => {
        const base =
          Array.isArray(prev) && prev.length
            ? [...prev]
            : [{ name: "", gender: "", mobileNumber: null, isPrimaryOwner: true }]
        base[0] = { ...base[0], name: applicantName }
        return base
      })
    } catch (err) {
      console.log("[v0] Failed reading applicantName from sessionStorage:", err)
    }
  }, [])

  // Persist data to sessionStorage whenever state changes
  useEffect(() => {
    if (ownershipCategory) {
      sessionStorage.setItem("ownershipCategory", JSON.stringify(ownershipCategory))
    }
  }, [ownershipCategory])

  useEffect(() => {
    sessionStorage.setItem("ownerName", name)
  }, [name])

  useEffect(() => {
    sessionStorage.setItem("ownerEmail", emailId)
  }, [emailId])

  useEffect(() => {
    sessionStorage.setItem("ownerAadhar", aadharNumber)
  }, [aadharNumber])

  useEffect(() => {
    if (gender) {
      sessionStorage.setItem("ownerGender", JSON.stringify(gender))
    }
  }, [gender])

  useEffect(() => {
    sessionStorage.setItem("ownerMobileNumber", mobileNumber)
  }, [mobileNumber])

  useEffect(() => {
    sessionStorage.setItem("ownerFields", JSON.stringify(fields))
  }, [fields])

  useEffect(() => {
    var flag = 0
    fields.map((ob) => {
      if (ob?.isPrimaryOwner) flag = 1
      if (ob?.name && ob?.mobileNumber && ob?.gender) {
        setCanmovenext(false)
      } else {
        setCanmovenext(true)
      }
    })
    if (!canmovenext && ownershipCategory && !ownershipCategory?.code.includes("SINGLEOWNER")) {
      if (flag == 1) setCanmovenext(false)
      else setCanmovenext(true)
    }
  }, [fields])

  useEffect(() => {
    const values = cloneDeep(fields)
    if (ownershipCategory && !ismultiple && values?.length > 1) setFeilds([{ ...values[0], isPrimaryOwner: true }])
  }, [ownershipCategory])

  const { isLoading, data: ownerShipCategories } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", [
    "OwnerShipCategory",
  ])
  const { data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"])

  useEffect(() => {
    const ownershipCategoryLists = ownerShipCategories?.["common-masters"]?.OwnerShipCategory
    if (ownershipCategoryLists && ownershipCategoryLists?.length > 0) {
      const finalOwnershipCategoryList = ownershipCategoryLists.filter((data) => data?.code?.includes("INDIVIDUAL"))
      finalOwnershipCategoryList.forEach((data) => {
        data.i18nKey = `COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(data?.code, ".", "_")}`
      })
      setOwnershipCategoryList(finalOwnershipCategoryList)
    }
  }, [ownerShipCategories])

  useEffect(() => {
    const gendeTypeMenu = genderTypeData?.["common-masters"]?.GenderType || []
    if (gendeTypeMenu && gendeTypeMenu?.length > 0) {
      const genderFilterTypeMenu = gendeTypeMenu.filter((data) => data.active)
      genderFilterTypeMenu.forEach((data) => {
        data.i18nKey = `COMMON_GENDER_${data.code}`
      })
      setGenderList(genderFilterTypeMenu)
    }
  }, [genderTypeData])

  function selectedValue(value) {
    setOwnershipCategory(value)
  }

  function handleAdd() {
    const values = [...fields]
    values.push({ name: "", gender: "", mobileNumber: null, isPrimaryOwner: false })
    setFeilds(values)
    setCanmovenext(true)
  }

  function handleRemove(index) {
    const values = [...fields]
    if (values.length != 1) {
      values.splice(index, 1)
      if (values.length == 1) {
        values[0] = { ...values[0], isPrimaryOwner: true }
      }
      setFeilds(values)
    }
  }

  function setOwnerName(i, e) {
    const units = [...fields]
    units[i].name = e.target.value
    setName(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }

  function setGenderName(i, value) {
    const units = [...fields]
    units[i].gender = value
    setGender(value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setOwnerEmail(i, e) {
    const units = [...fields]
    units[i].emailId = e.target.value
    setEmail(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setAadharNumber(i, e) {
    const units = [...fields]
    units[i].aadharNumber = e.target.value
    setaadharNumber(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setMobileNo(i, e) {
    const units = [...fields]
    units[i].mobileNumber = e.target.value
    setMobileNumber(e.target.value)
    setFeilds(units)
    if (units[i].gender && units[i].mobileNumber && units[i].name) {
      setCanmovenext(false)
    }
  }
  function setPrimaryOwner(i, e) {
    const units = [...fields]
    units.map((units) => {
      units.isPrimaryOwner = false
    })
    units[i].isPrimaryOwner = ismultiple ? e.target.checked : true
    setisPrimaryOwner(e.target.checked)
    setFeilds(units)
  }
  const [error, setError] = useState(null)

  function getusageCategoryAPI(arr) {
    let usageCat = ""
    arr.map((ob, i) => {
      usageCat = usageCat + (i !== 0 ? "," : "") + ob.code
    })
    return usageCat
  }

  function getUnitsForAPI(subOccupancyData) {
    const ob = subOccupancyData?.subOccupancy
    const blocksDetails = subOccupancyData?.data?.edcrDetails?.planDetail?.blocks || []
    const units = []
    if (ob) {
      const result = Object.entries(ob)
      result.map((unit, index) => {
        units.push({
          blockIndex: index,
          floorNo: unit[0].split("_")[1],
          unitType: "Block",
          occupancyType: blocksDetails?.[index]?.building?.occupancies?.[0]?.typeHelper?.type?.code || "A",
          usageCategory: getusageCategoryAPI(unit[1]),
        })
      })
    }
    return units
  }

  function getBlockIds(arr) {
    const blockId = {}
    arr.map((ob, ind) => {
      blockId[`Block_${ob.floorNo}`] = ob.id
    })
    return blockId
  }

  const closeToast = () => {
    setShowToast(null)
  }

  const getOwnerDetails = async (indexValue, eData) => {
    const ownersCopy = cloneDeep(fields)
    const ownerNo = ownersCopy?.[indexValue]?.mobileNumber || ""
    setShowToast(null)

    if (!ownerNo.match(getPattern("MobileNo"))) {
      setShowToast({ key: "true", error: true, message: "ERR_MOBILE_NUMBER_INCORRECT" })
      return
    }

    if (
      ownerNo === ownersCopy?.[indexValue]?.userName &&
      ownerRoleCheck?.code !== "BPA_ARCHITECT" &&
      ownerRoleCheck?.code !== "BPA_SUPERVISOR"
    ) {
      setShowToast({ key: "true", error: true, message: "ERR_OWNER_ALREADY_ADDED_TOGGLE_MSG" })
      return
    }

    const matchingOwnerIndex = ownersCopy.findIndex((item) => item.userName === ownerNo)

    if (
      matchingOwnerIndex > -1 &&
      ownerRoleCheck?.code !== "BPA_ARCHITECT" &&
      ownerRoleCheck?.code !== "BPA_SUPERVISOR"
    ) {
      setShowToast({ key: "true", error: true, message: "ERR_OWNER_ALREADY_ADDED" })
      return
    } else {
      const usersResponse = await Digit.UserService.userSearch(
        Digit.ULBService.getStateId(),
        { userName: fields?.[indexValue]?.mobileNumber },
        {},
      )
      const found = usersResponse?.user?.[0]?.roles?.filter(
        (el) => el.code === "BPA_ARCHITECT" || el.code === "BPA_SUPERVISOR",
      )?.[0]
      if (usersResponse?.user?.length === 0) {
        setShowToast({ key: "true", warning: true, message: "ERR_MOBILE_NUMBER_NOT_REGISTERED" })
        return
      } else {
        const userData = usersResponse?.user?.[0]
        userData.gender = userData.gender
          ? { code: userData.gender, active: true, i18nKey: `COMMON_GENDER_${userData.gender}` }
          : ""
        if (userData?.dob) userData.dob = convertDateToEpoch(userData?.dob)
        if (userData?.createdDate) {
          userData.createdDate = convertDateTimeToEpoch(userData?.createdDate)
          userData.lastModifiedDate = convertDateTimeToEpoch(userData?.lastModifiedDate)
          userData.pwdExpiryDate = convertDateTimeToEpoch(userData?.pwdExpiryDate)
        }

        const values = [...ownersCopy]
        if (values[indexValue]) {
          values[indexValue] = userData
          values[indexValue].isPrimaryOwner = fields[indexValue]?.isPrimaryOwner || false
        }
        setFeilds(values)
        if (values[indexValue]?.mobileNumber && values[indexValue]?.name && values[indexValue]?.gender?.code)
          setCanmovenext(true)
        else setCanmovenext(false)

        if (found) {
          setCanmovenext(false)
          //setownerRoleCheck(found);
          setShowToast({ key: "true", error: true, message: `BPA_OWNER_VALIDATION_${found?.code}` })
          return
        }
      }
    }
  }

  const getUserData = async (data, tenant) => {
    let flag = false
    let userresponse = []
    userresponse = fields?.map((ob, indexValue) => {
      return Digit.UserService.userSearch(
        Digit.ULBService.getStateId(),
        { userName: fields?.[indexValue]?.mobileNumber },
        {},
      ).then((ob) => {
        return ob
      })
    })
    //getting user data from citizen uuid
    userresponse = await Promise.all(userresponse)
    const foundMobileNo = []
    let found = false
    userresponse &&
      userresponse?.length > 0 &&
      userresponse.map((ob) => {
        found = ob?.user?.[0]?.roles?.filter((el) => el.code === "BPA_ARCHITECT" || el.code === "BPA_SUPERVISOR")?.[0]
        if (
          fields.find(
            (fi) =>
              !(fi?.uuid && !found) &&
              ((fi?.name === ob?.user?.[0]?.name && fi?.mobileNumber === ob?.user?.[0]?.mobileNumber) ||
                (fi?.mobileNumber === ob?.user?.[0]?.mobileNumber && found)),
          )
        ) {
          flag = true
          foundMobileNo.push(ob?.user?.[0]?.mobileNumber)
        }
      })

    if (foundMobileNo?.length > 0)
      setShowToast({
        key: "true",
        error: true,
        message: `${t("BPA_OWNER_VALIDATION_1")} ${foundMobileNo?.join(", ")} ${t("BPA_OWNER_VALIDATION_2")}`,
      })
    if (flag == true) return false
    else return true
  }

  console.log(formData, "FormDATA")
  const goNext = async () => {
    setError(null)
    const moveforward = await getUserData()

    if (!moveforward) return

    if (ismultiple === true && fields.length === 1) {
      window.scrollTo(0, 0)
      setError("BPA_ERROR_MULTIPLE_OWNER")
      return
    }

    const owner = formData.owners
    const ownerStep = { ...owner, owners: fields, ownershipCategory: ownershipCategory }

    if (!formData?.id) {
      setIsDisable(true)

      const conversionOwners = []
      ownerStep?.owners?.map((owner) => {
        conversionOwners.push({
          ...owner,
          active: true,
          name: owner.name,
          emailId: owner.emailId,
          aadharNumber: owner.aadharNumber,
          mobileNumber: owner.mobileNumber,
          isPrimaryOwner: owner.isPrimaryOwner,
          gender: owner.gender.code,
          fatherOrHusbandName: "NAME",
        })
      })

      const payload = {}
      payload.edcrNumber = formData?.data?.scrutinyNumber?.edcrNumber
      payload.riskType = formData?.data?.riskType
      payload.applicationType = formData?.data?.applicationType
      payload.serviceType = formData?.data?.serviceType

      const userInfo = Digit.UserService.getUser()
      const accountId = userInfo?.info?.uuid

      payload.tenantId = formData?.address?.city?.code
      payload.workflow = { action: "INITIATE", assignes: [userInfo?.info?.uuid] }
      payload.accountId = accountId
      // payload.documents = null;
      payload.documents = getDocumentforBPA(formData?.documents?.documents, formData?.PrevStateDocuments)
      // payload.documents = documents && documents.length > 0 ? documents : [];

      payload.additionalDetails = { GISPlaceName: formData?.address?.placeName }
      payload.additionalDetails.boundaryWallLength = formData?.data?.boundaryWallLength || "NA"
      payload.additionalDetails.area =
        formData?.data.edcrDetails.planDetail.planInformation.plotArea?.toString() || "NA"
      payload.additionalDetails.height =
        formData?.data.edcrDetails.planDetail.blocks[0].building.buildingHeight?.toString() || "NA"
      payload.additionalDetails.usage = formData?.data.occupancyType || "NA"
      payload.additionalDetails.builtUpArea =
        formData?.data.edcrDetails.planDetail.blocks[0].building.totalBuitUpArea?.toString() || "NA"
      payload.additionalDetails.ownerName = conversionOwners.map((obj) => obj.name).join(",")

      if (formData?.data?.registrationDetails)
        payload.additionalDetails.registrationDetails = formData?.data?.registrationDetails
      if (formData?.data?.applicationType) payload.additionalDetails.applicationType = formData?.data?.applicationType
      if (formData?.data?.serviceType) payload.additionalDetails.serviceType = formData?.data?.serviceType
      if (formData?.data?.wardnumber) payload.additionalDetails.wardnumber = formData?.data?.wardnumber
      if (formData?.data?.zonenumber) payload.additionalDetails.zonenumber = formData?.data?.zonenumber
      if (formData?.data?.khasraNumber) payload.additionalDetails.khasraNumber = formData?.data?.khasraNumber
      if (formData?.data?.architectid) payload.additionalDetails.architectid = formData?.data?.architectid
      if (formData?.data?.propertyuid) payload.additionalDetails.propertyuid = formData?.data?.propertyuid
      if (formData?.data?.bathnumber) payload.additionalDetails.bathnumber = formData?.data?.bathnumber
      if (formData?.data?.kitchenNumber) payload.additionalDetails.kitchenNumber = formData?.data?.kitchenNumber
      if (formData?.data?.approxinhabitants)
        payload.additionalDetails.approxinhabitants = formData?.data?.approxinhabitants
      if (formData?.data?.materialusedinfloor)
        payload.additionalDetails.materialusedinfloor = formData?.data?.materialusedinfloor
      if (formData?.data?.distancefromsewer)
        payload.additionalDetails.distancefromsewer = formData?.data?.distancefromsewer
      if (formData?.data?.sourceofwater) payload.additionalDetails.sourceofwater = formData?.data?.sourceofwater
      if (formData?.data?.watercloset) payload.additionalDetails.watercloset = formData?.data?.watercloset
      if (formData?.data?.materialused) payload.additionalDetails.materialused = formData?.data?.materialused
      if (formData?.data?.materialusedinroofs)
        payload.additionalDetails.materialusedinroofs = formData?.data?.materialusedinroofs
      if (formData?.owners?.approvedColony?.code)
        payload.additionalDetails.approvedColony = formData?.owners?.approvedColony?.code
      if (formData?.owners?.buildingStatus?.code)
        payload.additionalDetails.buildingStatus = formData?.owners?.buildingStatus?.code
      if (formData?.owners?.greenbuilding?.code)
        payload.additionalDetails.greenbuilding = formData?.owners?.greenbuilding?.code
      if (formData?.owners?.masterPlan?.code) payload.additionalDetails.masterPlan = formData?.owners?.masterPlan?.code
      if (formData?.owners?.proposedSite?.code)
        payload.additionalDetails.proposedSite = formData?.owners?.proposedSite?.code
      if (formData?.owners?.purchasedFAR?.code)
        payload.additionalDetails.purchasedFAR = formData?.owners?.purchasedFAR?.code
      if (formData?.owners?.restrictedArea?.code)
        payload.additionalDetails.restrictedArea = formData?.owners?.restrictedArea?.code
      if (formData?.owners?.schemes?.i18nKey) payload.additionalDetails.schemes = formData?.owners?.schemes?.i18nKey
      if (formData?.owners?.UlbName?.code) {
        payload.additionalDetails.UlbName = formData?.owners?.UlbName?.code
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase())
      }
      if (formData?.owners?.District?.code) payload.additionalDetails.District = formData?.owners?.District?.code
      if (formData?.owners?.nameofApprovedcolony)
        payload.additionalDetails.nameofApprovedcolony = formData?.owners?.nameofApprovedcolony
      if (formData?.owners?.NocNumber) payload.additionalDetails.NocNumber = formData?.owners?.NocNumber
      if (formData?.owners?.coreArea?.code) payload.additionalDetails.coreArea = formData?.owners?.coreArea?.code
      if (formData?.owners?.schemesselection?.i18nKey)
        payload.additionalDetails.schemesselection = formData?.owners?.schemesselection?.i18nKey
      if (formData?.owners?.schemeName) payload.additionalDetails.schemeName = formData?.owners?.schemeName
      if (formData?.owners?.transferredscheme)
        payload.additionalDetails.transferredscheme = formData?.owners?.transferredscheme
      if (formData?.owners?.Ulblisttype?.value)
        payload.additionalDetails.Ulblisttype = formData?.owners?.Ulblisttype?.value
      if (formData?.owners?.uploadedFile) payload.additionalDetails.uploadedFileNoc = formData?.owners?.uploadedFile
      if (formData?.owners?.rating?.code) payload.additionalDetails.rating = formData?.owners?.rating?.code
      if (formData?.owners?.greenuploadedFile)
        payload.additionalDetails.uploadedFileGreenBuilding = formData?.owners?.greenuploadedFile
      if (formData?.owners?.use?.code) payload.additionalDetails.use = formData?.owners?.use?.code

      if (user?.info?.name) payload.additionalDetails.architectName = user?.info?.name
      if (user?.info?.mobileNumber) payload.additionalDetails.architectMobileNumber = user?.info?.mobileNumber

      payload.landInfo = {}
      payload.landInfo.address = {}

      if (formData?.address?.city?.code) {
        payload.landInfo.address.city = formData?.address?.city?.code
      }

      if (formData?.address?.locality?.code) {
        payload.landInfo.address.locality = { code: formData?.address?.locality?.code }
      } else if (formData?.address?.city?.code) {
        payload.landInfo.address.locality = { code: formData?.address?.city?.code }
      } else {
        setIsDisable(false)
        setShowToast({ key: "true", error: true, message: "Locality is required to proceed." })
        return
      }

      if (formData?.address?.pincode) payload.landInfo.address.pincode = formData?.address?.pincode
      if (formData?.address?.landmark) payload.landInfo.address.landmark = formData?.address?.landmark
      if (formData?.address?.street) payload.landInfo.address.street = formData?.address?.street
      if (formData?.address?.geoLocation) payload.landInfo.address.geoLocation = formData?.address?.geoLocation

      payload.landInfo.owners = conversionOwners
      // payload.landInfo.ownershipCategory = ownershipCategory.code;
      payload.landInfo.ownershipCategory = ownershipCategory?.code ?? ownershipCategory
      payload.landInfo.tenantId = formData?.address?.city?.code

      // Units
      payload.landInfo.unit = getUnitsForAPI(formData)

      // Architect info from session
      const nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME")
      const parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT"
      payload.additionalDetails.typeOfArchitect = parsedArchitectName
      payload.additionalDetails.stakeholderName = JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_NAME"))
      payload.additionalDetails.stakeholderRegistrationNumber = JSON.parse(
        sessionStorage.getItem("BPA_STAKEHOLDER_REGISTRATION_NUMBER"),
      )
      payload.additionalDetails.stakeholderAddress = JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_ADDRESS"))

      let isSelfCertificationRequired = sessionStorage.getItem("isSelfCertificationRequired")
      if (isSelfCertificationRequired === "undefined" || isSelfCertificationRequired === null) {
        isSelfCertificationRequired = "false"
      }
      payload.additionalDetails.isSelfCertificationRequired = isSelfCertificationRequired.toString()

      Digit.OBPSService.create({ BPA: payload }, tenantId)
        .then((result) => {
          if (result?.BPA?.length > 0) {
            result?.BPA?.[0]?.landInfo?.owners?.forEach((owner) => {
              owner.gender = { code: owner.gender, active: true, i18nKey: `COMMON_GENDER_${owner.gender}` }
            })
            result.BPA[0].owners = {
              ...owner,
              owners: result?.BPA?.[0]?.landInfo?.owners,
              ownershipCategory: ownershipCategory,
            }
            result.BPA[0].address = result?.BPA?.[0]?.landInfo?.address
            result.BPA[0].address.city = formData.address.city
            result.BPA[0].address.locality = formData.address.locality
            result.BPA[0].placeName = formData?.address?.placeName
            result.BPA[0].data = formData.data
            result.BPA[0].BlockIds = getBlockIds(result.BPA[0].landInfo.unit)
            result.BPA[0].subOccupancy = formData?.subOccupancy
            result.BPA[0].uiFlow = formData?.uiFlow
            setIsDisable(false)
            onSelect("", result.BPA[0], "", true)
          }
        })
        .catch((e) => {
          setIsDisable(false)
          setShowToast({
            key: "true",
            error: true,
            message: e?.response?.data?.Errors?.[0]?.message || "Submission failed",
          })
        })
    } else {
      // Editing case
      onSelect(config.key, ownerStep)
    }
  }

  const onSkip = () => onSelect()

  // if (isLoading) {
  //     return <Loader />
  // }

  console.log(formData, "DATA++++++")
  function getCanMoveNextMultiple() {
    let flag = 0
    fields &&
      fields?.map((ob) => {
        if (flag !== 1 && (!ob?.name || !ob?.mobileNumber || !ob?.gender?.code)) flag = 1
      })
    if (flag == 0) return false
    else return true
  }

  return (
    <div>
      <Timeline currentStep={3} />
      <FormStep
        config={config}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={canmovenext || getCanMoveNextMultiple() || !ownershipCategory || isDisable}
        forcedError={t(error)}
      >
        {!isLoading ? (
          <div style={{ marginBottom: "10px" }}>
            <div>
              <CardLabel>{`${t("BPA_TYPE_OF_OWNER_LABEL")} *`}</CardLabel>
              <RadioButtons
                isMandatory={config.isMandatory}
                options={ownershipCategoryList}
                selectedOption={ownershipCategory}
                optionsKey="i18nKey"
                onSelect={selectedValue}
                value={ownershipCategory}
                labelKey="PT_OWNERSHIP"
                isDependent={true}
              />
            </div>
            {fields.map((field, index) => {
              return (
                <div key={`${field}-${index}`}>
                  <div
                    style={{
                      border: "solid",
                      borderRadius: "5px",
                      padding: "10px",
                      paddingTop: "20px",
                      marginTop: "10px",
                      borderColor: "#f3f3f3",
                      background: "#FAFAFA",
                    }}
                  >
                    <CardLabel style={{ marginBottom: "-15px" }}>{`${t("CORE_COMMON_MOBILE_NUMBER")} *`}</CardLabel>
                    {ismultiple && (
                      <LinkButton
                        label={
                          <DeleteIcon
                            style={{ float: "right", position: "relative", bottom: "5px" }}
                            fill={!(fields.length == 1) ? "#494848" : "#FAFAFA"}
                          />
                        }
                        style={{ width: "100px", display: "inline", background: "black" }}
                        onClick={(e) => handleRemove(index)}
                      />
                    )}
                    <div style={{ marginTop: "30px" }}>
                      <div className="field-container">
                        <div
                          style={{
                            position: "relative",
                            zIndex: "100",
                            left: "35px",
                            marginTop: "-24.5px",
                            marginLeft: Webview ? "-25px" : "-25px",
                          }}
                        >
                          +91
                        </div>
                        <TextInput
                          style={{ background: "#FAFAFA", padding: "0px 35px" }}
                          type={"text"}
                          t={t}
                          isMandatory={false}
                          optionKey="i18nKey"
                          name="mobileNumber"
                          value={field.mobileNumber}
                          onChange={(e) => setMobileNo(index, e)}
                          {...(validation = {
                            isRequired: true,
                            pattern: "[6-9]{1}[0-9]{9}",
                            type: "tel",
                            title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),
                          })}
                        />
                        <div
                          style={{
                            position: "relative",
                            zIndex: "100",
                            right: "35px",
                            marginTop: "-24px",
                            marginRight: Webview ? "-20px" : "-20px",
                          }}
                          onClick={(e) => getOwnerDetails(index, e)}
                        >
                          {" "}
                          <SearchIcon />{" "}
                        </div>
                      </div>
                    </div>
                    <CardLabel>{`${t("CORE_COMMON_NAME")} *`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="name"
                      value={field.name}
                      onChange={(e) => setOwnerName(index, e)}
                      {...(validation = {
                        isRequired: true,
                        pattern: "^[a-zA-Z ]*$",
                        type: "text",
                        title: t("TL_NAME_ERROR_MESSAGE"),
                      })}
                    />
                    <CardLabel>{`${t("BPA_APPLICANT_GENDER_LABEL")} *`}</CardLabel>
                    <RadioOrSelect
                      name="gender"
                      options={genderList}
                      selectedOption={field.gender}
                      optionKey="i18nKey"
                      onSelect={(e) => setGenderName(index, e)}
                      t={t}
                    />
                    {/* <CardLabel>{`${t("BPA_AADHAAR_NUMBER_LABEL_NEW")}`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="aadharNumber"
                      value={field.aadharNumber}
                      onChange={(e) => setAadharNumber(index, e)}
                      {...(validation = {
                        pattern: "^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$",
                        type: "tel",
                        title: t("INVALID_AADHAAR_NUMBER"),
                      })}
                    /> */}
                    <CardLabel>{`${t("CORE_EMAIL_ID")}`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"emailId"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="emailId"
                      value={field.emailId}
                      onChange={(e) => setOwnerEmail(index, e)}
                      {...(validation = {
                        //isRequired: true,
                        pattern: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$",
                        type: "emailId",
                        title: t("TL_EMAIL_ID_ERROR_MESSAGE"),
                      })}
                      disabled={false}
                      //disabled={true}
                    />

                    {/* <CardLabel>{`Document Type *`}</CardLabel>
                    <Dropdown
                      option={documentTypes}
                      selected={field.documentType}
                      optionKey="i18nKey"
                      onSelect={(value) => setDocumentType(index, value)}
                      t={t}
                      placeholder="Select Document Type"
                    />
                    <ErrorMessage message={errors[`documentType_${index}`]} /> */}

                    <CardLabel
                      style={{ marginTop: "30px" }}
                    >{`Upload Valid ID Copy (PAN/Voter ID/ Driving License) (PDF, Max 5MB) *`}</CardLabel>
                    <UploadFile
                      id={`document-upload-${index}`}
                      onUpload={selectDocumentFile(index)}
                      onDelete={() => {
                        setDocumentFile(index, null)
                        setDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }))
                        setErrors((prev) => ({ ...prev, [`documentFile_${index}`]: "Document upload is required" }))
                      }}
                      message={documentUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      error={errors[`documentFile_${index}`]}
                      uploadMessage=""
                      accept=".pdf"
                    />
                    <ErrorMessage message={errors[`documentFile_${index}`]} />

                    <CardLabel style={{ marginTop: "30px" }}>{`Upload Owner Photo *`}</CardLabel>
                    <UploadFile
                      id={`photo-upload-${index}`}
                      onUpload={selectPhotoFile(index)}
                      onDelete={() => {
                        setOwnerPhoto(index, null)
                        setPhotoUploadedFiles((prev) => ({ ...prev, [index]: null }))
                        setErrors((prev) => ({ ...prev, [`ownerPhoto_${index}`]: "Owner photo is required" }))
                      }}
                      message={photoUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      error={errors[`ownerPhoto_${index}`]}
                      uploadMessage=""
                      accept="image/*"
                    />
                    <ErrorMessage message={errors[`ownerPhoto_${index}`]} />

                    <CardLabel style={{ marginTop: "30px" }}>{`Date of Birth *`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"date"}
                      isMandatory={false}
                      name="dateOfBirth"
                      value={field.dateOfBirth}
                      onChange={(e) => setDateOfBirth(index, e)}
                    />
                    <ErrorMessage message={errors[`dob_${index}`]} />

                    <CardLabel>{`Authorized Person (If Any)`}</CardLabel>
                    <TextInput
                      style={{ background: "#FAFAFA" }}
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      name="authorizedPerson"
                      value={field.authorizedPerson}
                      onChange={(e) => setAuthorizedPerson(index, e)}
                      {...(validation = {
                        pattern: "^[a-zA-Z ]*$",
                        type: "text",
                        title: "Invalid name format",
                      })}
                    />

                    {field.authorizedPerson && (
                      <React.Fragment>
                        <CardLabel>{`Authorization Letter (PDF, Max 5MB)`}</CardLabel>
                        <UploadFile
                          id={`auth-letter-${index}`}
                          onUpload={selectAuthLetterFile(index)}
                          onDelete={() => {
                            setAuthorizationLetter(index, null)
                            setAuthLetterUploadedFiles((prev) => ({ ...prev, [index]: null }))
                            if (field.authorizedPerson) {
                              setErrors((prev) => ({
                                ...prev,
                                [`authLetter_${index}`]:
                                  "Authorization letter is required when authorized person is specified",
                              }))
                            }
                          }}
                          message={
                            authLetterUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")
                          }
                          uploadMessage=""
                          accept=".pdf"
                        />
                        <ErrorMessage message={errors[`authLetter_${index}`]} />
                      </React.Fragment>
                    )}

                    <CardLabel>{`Owner's Address *`}</CardLabel>
                    <textarea
                      style={{
                        background: "#FAFAFA",
                        width: "100%",
                        minHeight: "80px",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        resize: "vertical",
                      }}
                      placeholder="Enter complete address"
                      value={field.ownerAddress}
                      onChange={(e) => setOwnerAddress(index, e)}
                    />
                    <ErrorMessage message={errors[`address_${index}`]} />

                    {ismultiple && (
                      <CheckBox
                        label={t("BPA_IS_PRIMARY_OWNER_LABEL")}
                        onChange={(e) => setPrimaryOwner(index, e)}
                        value={field.isPrimaryOwner}
                        checked={field.isPrimaryOwner}
                        style={{ paddingTop: "10px" }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            {ismultiple ? (
              <div>
                <div style={{ display: "flex", paddingBottom: "15px", color: "#FF8C00" }}>
                  <button type="button" style={{ paddingTop: "10px" }} onClick={() => handleAdd()}>
                    {t("BPA_ADD_OWNER")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Loader />
        )}
      </FormStep>
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

export default OwnerDetails