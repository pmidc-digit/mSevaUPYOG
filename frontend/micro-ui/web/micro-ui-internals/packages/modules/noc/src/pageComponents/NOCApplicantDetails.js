import React, { useEffect, useState, Fragment  } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  RadioButtons,
  SearchIcon,
  Toast,
  CardSectionSubText,
  CardSubHeader,
  Row,
  StatusTable,
  CardLabelError
} from "@mseva/digit-ui-react-components";
import { Loader } from "../components/Loader";

import { getPattern } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import NOCCustomUploadFile from "./NOCCustomUploadFile";
import { PropertySearchModal } from "./PropertySearchModal";
import { PropertySearchBathinda } from "../components/PropertySearchBathinda";
import { PropertySearchLudhiana } from "../components/PropertySearchLudhiana";
import { UPDATE_NOCNewApplication_FORM} from "../redux/action/NOCNewApplicationActions";
import { formatDateForInput } from "../utils";
const ownerTypeOptions = [
  { i18nKey: "NOC_OWNER_TYPE_INDIVIDUAL", code: "Individual", value: "Individual" },
  { i18nKey: "NOC_OWNER_TYPE_FIRM", code: "Firm", value: "Firm" },
];


const NOCApplicantDetails = (_props) => {
  const {
    t,
    goNext,
    currentStepData,
    Controller,
    control,
    setValue,
    errors,
    errorStyle,
    reset,
    useFieldArray,
    watch,
    getValues,
    config,
    ownerIdList,
    setOwnerIdList,
    ownerPhotoList,
    setOwnerPhotoList,
  } = _props;

  const tenantId = Digit.ULBService.getCitizenCurrentTenant();

  const stateId = Digit.ULBService.getStateId();
  const dispatch = useDispatch();

  const nocCpt = useSelector(state => state.noc?.NOCNewApplicationFormReducer?.formData?.cpt);

  // const ownerIds = useSelector(function (state) {
  //   return state.noc.NOCNewApplicationFormReducer.ownerIds;
  // });

  // const ownerPhotos = useSelector(function (state) {
  //   return state.noc.NOCNewApplicationFormReducer.ownerPhotos;
  // });

  const [loader, setLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const LUDHIANA_TENANT = "pb.ludhiana";
  const BATHINDA_TENANT = "pb.bathinda";
  const { data: menuList, isLoading: isMenuListLoading } = Digit.Hooks.useCustomMDMS(tenantId, "egov-location", [{ name: "TenantBoundary" }]);
  const [isPropertyAvailable, setIsPropertyAvailable] = useState({});

  const selectOwnerIdFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("CLU", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setOwnerIdList((prev) => {
          const next = [...prev];
          const newItem = {
            filestoreId: fileId,
            fileName: file.name,
            documentType: index === 0 ? "Primary Owner Id" : `Owner${index + 1} Id`,
            documentUid: fileId,
          };

          if (index <= next?.length) {
            next[index] = newItem;
          } else {
            next.push(newItem);
          }

          return next;
        });
        setShowToast({ key: "true", success: true, message: t("FILE_UPLOAD_SUCCESS") });
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    } finally {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
    }
  };

  const deleteOwnerPhoto = (index) => {
    const filteredPhotoList = ownerPhotoList?.filter((item, idx) => idx !== index);
    setOwnerPhotoList(filteredPhotoList);
  };

  const deleteOwnerId = (index) => {
    const filteredIdList = ownerIdList?.filter((item, idx) => idx !== index);
    setOwnerIdList(filteredIdList);
  };

  const selectOwnerPhotoFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("NOC", file, stateId);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setOwnerPhotoList((prev) => {
          const next = [...prev];
          const newItem = {
            filestoreId: fileId,
            fileName: file.name,
            documentType: index === 0 ? "Primary Owner Photo" : `Owner${index + 1} Photo`,
            documentUid: fileId,
          };
          if (index <= next?.length) {
            next[index] = newItem;
          } else {
            next.push(newItem);
          }

          return next;
        });
        setShowToast({ key: "true", success: true, message: t("FILE_UPLOAD_SUCCESS") });
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    } finally {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      setLoader(false);
    }
  };

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  const findGenderOption = (val) => {
    if (!val) return null;
    const code = typeof val === "string" ? val : val?.code;
    return menu.find((g) => g.code === code) || null;
  };

  const cptObj  = nocCpt?.details?.Properties?.[0]?.Properties?.[0]?.Properties?.[0]
  // default owner object
  const defaultOwner = () => ({
    mobileNumber: "",
    ownerOrFirmName: "",
    emailId: "",
    fatherOrHusbandName: "",
    propertyId: "",
    PropertyOwnerName: "",
    PropertyOwnerMobileNumber: "",
    PropertyOwnerAddress: "",
    PropertyOwnerPlotArea: null,
    gender: null,
    dateOfBirth: "",
    address: "",
    ownerType: null,
    propertyVasikaNo: "",
    propertyVasikaDate: ""
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "owners",
  });

  const mobileAtIndex = (idx) => watch(`owners[${idx}].mobileNumber`) ?? "";


 useEffect(() => {
    console.log("currentStepData1", currentStepData);
    const formattedData = currentStepData?.applicationDetails;



  if (!formattedData) return;







  let owners =
    Array.isArray(formattedData.owners) && formattedData.owners.length
        ? formattedData.owners.map((o) => ({
            mobileNumber: o.mobileNumber || "",
            ownerOrFirmName: o.ownerOrFirmName || o.name || "",



            emailId: o.emailId || "",
            fatherOrHusbandName: o.fatherOrHusbandName || "",
            propertyId: o.propertyId || "",
            PropertyOwnerName: o.PropertyOwnerName || "",
            PropertyOwnerMobileNumber: o.PropertyOwnerMobileNumber || "",
            PropertyOwnerAddress: o.PropertyOwnerAddress || "",
            PropertyOwnerPlotArea: o.PropertyOwnerPlotArea || null,
            propertyVasikaNo: o.propertyVasikaNo || null,
            propertyVasikaDate: o.propertyVasikaDate || null,
            gender: findGenderOption(o.gender),
            dateOfBirth: o.dateOfBirth || o.dob || "",
            address: o.address || o.permanentAddress || "",
            ownerType: o.ownerType ? ownerTypeOptions.find((opt) => opt?.code === o?.ownerType?.code) : null,
          }))

      : [defaultOwner()];

   

  reset({
    ...formattedData,
      isPropertyAvailable: formattedData?.isPropertyAvailable || isPropertyAvailable,
    owners,
  });
  }, [currentStepData, setValue, append, reset, tenantId]);



  // Clear property-related fields when propertyId is deleted
  // useEffect(() => {
  //    console.log("useffect 12");
  //   const propertyId = watch(`owners[0].propertyId`);
  //   if (!propertyId) {
  //     setValue(`owners[0].PropertyOwnerName`, "", { shouldValidate: true, shouldDirty: true });
  //     setValue(`owners[0].PropertyOwnerMobileNumber`, "", { shouldValidate: true, shouldDirty: true });
  //     setValue(`owners[0].PropertyOwnerAddress`, "", { shouldValidate: true, shouldDirty: true });
  //     setValue(`owners[0].PropertyOwnerPlotArea`, null, { shouldValidate: true, shouldDirty: true });
  //     setValue(`owners[0].propertyVasikaNo`, null, { shouldValidate: true, shouldDirty: true });
  //     setValue(`owners[0].propertyVasikaDate`, null, { shouldValidate: true, shouldDirty: true });
  //   }
  // }, [watch(`owners[0].propertyId`), setValue]);

  useEffect(() => {
    
  if (typeof isPropertyAvailable === "boolean") {
     console.log("useffect 13");
    const plan = [
      { code: "YES", i18nKey: "YES", value: true },
      { code: "NO", i18nKey: "NO", value: false }
    ].find((item) =>
      // {
      //   if(typeof isPropertyAvailable === "boolean"){
      //     return item?.value === isPropertyAvailable
      //   }else{
      //     return item?.value === isPropertyAvailable?.value
      //   }
      // } 
      item.value === isPropertyAvailable
    );

    if (plan) {
      setIsPropertyAvailable(plan);
      // console.log('plan and ispropertyavailable', plan, isPropertyAvailable)
      // setValue("isPropertyAvailable", plan, { shouldValidate: true, shouldDirty: true });
    }

    // if (plan?.value === false) {
      
    //   dispatch(UPDATE_NOCNewApplication_FORM("cpt", null));
    //   dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", null));
    //   reset({
    //     owners: [defaultOwner()],
    //     isPropertyAvailable: plan,
    //   });
    // }
  }
  // else if(isPropertyAvailable?.code){
  //   if(isPropertyAvailable?.value === false){
  //     dispatch(UPDATE_NOCNewApplication_FORM("cpt", null));
  //     dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", null));
  //     dispatch(
  //     UPDATE_NOCNewApplication_FORM("siteDetails", {
  //       ...currentStepData?.siteDetails,
  //       vasikaNumber: "",
  //       vasikaDate: null,
  //       netTotalArea: null,
  //     })
  //   );
  //     reset({
  //       owners: [defaultOwner()],
  //       isPropertyAvailable: isPropertyAvailable,
  //     });
  //   }
  // }
  else if (isPropertyAvailable === null) {
    if (currentStepData?.applicationDetails?.isPropertyAvailable) {
      setIsPropertyAvailable(currentStepData?.applicationDetails?.isPropertyAvailable);
      setValue("isPropertyAvailable", currentStepData?.applicationDetails?.isPropertyAvailable, { shouldValidate: true, shouldDirty: true });
    }
  }
}, [isPropertyAvailable, currentStepData?.applicationDetails?.isPropertyAvailable]);

   // Fetch property data from cpt and overwrite applicant details
 useEffect(() => {

  // if (isPropertyAvailable?.value === false ) {
  //   // Clear Redux nocCpt and form state together
  //   dispatch(UPDATE_NOCNewApplication_FORM("cpt", null));
  //   dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", null));

  //   reset({
  //     owners: [defaultOwner()],
  //     isPropertyAvailable: { code: "NO", i18nKey: "NO", value: false },
  //   });
  // }

  if (isPropertyAvailable?.value === true && nocCpt?.details?.owners?.[0]) {
    console.log("useffect 14");
    console.log('nocCpt', nocCpt);

    // Get current owner data

    // Update the owner object with property data
    setValue('owners[0].ownerOrFirmName', nocCpt.details.owners[0]?.name || "", { shouldValidate: true, shouldDirty: true });
    setValue('owners[0].mobileNumber', nocCpt.details.owners[0]?.mobileNumber || "", { shouldValidate: true, shouldDirty: true });
    setValue('owners[0].address', nocCpt.details?.address?.doorNo || nocCpt.details?.address?.street || "", { shouldValidate: true, shouldDirty: true });
    setValue('owners[0].fatherOrHusbandName', nocCpt.details.owners[0]?.fatherOrHusbandName || "", { shouldValidate: true, shouldDirty: true });
    setValue('owners[0].propertyId', nocCpt.details?.propertyId || "", { shouldValidate: true, shouldDirty: true });
  // console.log(getValues(), "values ludhiana")

    // Update Redux applicationDetails
    // Use update function from useFieldArray to update the owner

    // Hydrate only if property is available AND nocCpt exists

  }
}, [nocCpt, isPropertyAvailable?.value]);

  //For fetching user details
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => {
    setShowToast(null);
  };
  

  const getOwnerDetails = async (idx) => {
    
    setLoader(true);

    try {
      console.log('get owner details firing???')
      const currentMobile = mobileAtIndex(idx);

    if (!/^[6-9]\d{9}$/.test(currentMobile)) {
      setShowToast({ key: "true", error: true, message: "INVALID_MOBILE_NUMBER" });
      return;
    }
      const userResponse = await Digit.UserService.userSearch(stateId, { userName: currentMobile }, {});

      const users = userResponse?.user ?? [];
      if (!users.length) {
        setShowToast({ key: "true", warning: true, message: "ERR_MOBILE_NUMBER_NOT_REGISTERED" });
        return;
      }

      const u = users[0];

      // Write EVERYTHING into RHF state
      setValue(`owners[${idx}].ownerOrFirmName`, u.name ?? "", { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${idx}].emailId`, u.emailId ?? "", { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${idx}].fatherOrHusbandName`, u.fatherOrHusbandName ?? "", { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${idx}].address`, u.permanentAddress ?? "", { shouldValidate: true, shouldDirty: true });

      // Normalize DOB to YYYY-MM-DD for <input type="date">
      const dobStr = typeof u.dob === "string" ? u.dob : "";
      const yyyyMmDd = dobStr ? dobStr.slice(0, 10) : ""; // handles "YYYY-MM-DDTHH:mm:ss"
      setValue(`owners[${idx}].dateOfBirth`, yyyyMmDd, { shouldValidate: true, shouldDirty: true });

      // Gender must be the option object the RadioButtons expects
      const genderOption = findGenderOption(u.gender);
      setValue(`owners[${idx}].gender`, genderOption, { shouldValidate: true, shouldDirty: true });
    } catch (err) {
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    }finally{
      setLoader(false);
    }
  };

  const handlePropertySelect = (property) => {
  console.log('property', property);

  // 🚨 Guard: do nothing if property is not available
  if (isPropertyAvailable?.value === false) {
    return;
  }

  if (currentIndex !== null && property?.propertyId) {
    // const ownerNames = property?.owners?.map((o) => o?.name).filter(Boolean).join(", ") || "";

    // Update RHF form state
    setValue(`owners[${currentIndex}].propertyId`, property.propertyId, { shouldValidate: true, shouldDirty: true });
    setValue(`owners[${currentIndex}].PropertyOwnerName`, property?.owners?.[0]?.name || "", { shouldValidate: true, shouldDirty: true });
    setValue(`owners[${currentIndex}].PropertyOwnerMobileNumber`, property?.owners?.[0]?.mobileNumber || "", { shouldValidate: true, shouldDirty: true });
    setValue(`owners[${currentIndex}].PropertyOwnerAddress`, property?.owners?.[0]?.permanentAddress || "", { shouldValidate: true, shouldDirty: true });
    setValue(`owners[${currentIndex}].PropertyOwnerPlotArea`, property?.landArea || null, { shouldValidate: true, shouldDirty: true });
    setValue(`owners[${currentIndex}].propertyVasikaNo`, property?.additionalDetails?.vasikaNo || null, { shouldValidate: true, shouldDirty: true });
    setValue(`owners[${currentIndex}].propertyVasikaDate`, property?.additionalDetails?.vasikaDate || null, { shouldValidate: true, shouldDirty: true });

    // Override applicant details with property owner details if present
    if (currentIndex === 0) {
      if (property?.owners?.[0]?.name) {
        setValue(`owners[${currentIndex}].ownerOrFirmName`, property.owners[0].name, { shouldValidate: true, shouldDirty: true });
      }
      if (property?.owners?.[0]?.mobileNumber) {
        setValue(`owners[${currentIndex}].mobileNumber`, property.owners[0].mobileNumber, { shouldValidate: true, shouldDirty: true });
      }
      if (property?.owners?.[0]?.permanentAddress) {
        setValue(`owners[${currentIndex}].address`, property.owners[0].permanentAddress, { shouldValidate: true, shouldDirty: true });
      }
    }

    // Get current form values to preserve user-filled data
    const currentOwners = watch('owners');

    // Update Redux applicationDetails
    dispatch(
      UPDATE_NOCNewApplication_FORM("applicationDetails", {
        ...currentStepData?.applicationDetails,
        isPropertyAvailable: isPropertyAvailable,  // Ensure flag persists
        owners: currentOwners?.map((o, i) =>
          i === currentIndex
            ? {
                ...o,
                propertyId: property?.propertyId,
                PropertyOwnerName: property?.owners?.[0]?.name,
                PropertyOwnerMobileNumber: property?.owners?.[0]?.mobileNumber,
                PropertyOwnerAddress: property?.owners?.[0]?.permanentAddress,
                PropertyOwnerPlotArea: property?.landArea,
                propertyVasikaNo: property?.additionalDetails?.vasikaNo,
                propertyVasikaDate: property?.additionalDetails?.vasikaDate,
                ...(currentIndex === 0 && {
                  ownerOrFirmName: property?.owners?.[0]?.name || o.ownerOrFirmName,
                  mobileNumber: property?.owners?.[0]?.mobileNumber || o.mobileNumber,
                  address: property?.owners?.[0]?.permanentAddress || o.address,
                }),
              }
            : o
        ),
      })
    );

    // Update Redux siteDetails
    dispatch(
      UPDATE_NOCNewApplication_FORM("siteDetails", {
        ...currentStepData?.siteDetails,
        vasikaNumber: property?.additionalDetails?.vasikaNo,
        vasikaDate: formatDateForInput(property?.additionalDetails?.vasikaDate),
        netTotalArea: property?.landArea,
      })
    );
  }
};


  const isEdit = window.location.pathname.includes("edit");

  const removeOwner = (index) => {
    deleteOwnerId(index);
    deleteOwnerPhoto(index);

    const filteredOwners = currentStepData?.applicationDetails?.owners?.filter((item, idx) => idx !== index);

    // if(filteredOwners?.length > 0){

    // dispatch(UPDATE_OBPS_FORM("applicationDetails",
    // {
    //  ...currentStepData?.applicationDetails,
    //  owners:filteredOwners
    // }));
    // }
    remove(index);
  };

 
  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("NOC_APPLICANT_DETAILS")}</CardSectionHeader>
      <div>
        {(loader || isMenuListLoading) && <Loader page={true} />}
        {isEdit && (
          <CardSectionSubText style={{ color: "red", margin: "10px 0px" }}>
            {" "}
            To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section
          </CardSectionSubText>
        )}

        {fields.map((field, index) => (
          <div key={field.id}>
            <CardSubHeader>{index === 0 ? t("NOC_PRIMARY_OWNER") : `${t("Owner")} ${index + 1}`}</CardSubHeader>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, cursor: "pointer" }} onClick={() => removeOwner(index)}>
              {!isEdit && fields.length > 1 && `❌`}
            </div>

            {index === 0 && (
              <div>
                <LabelFieldPair>
                  <CardLabel>{`${t("BPA_IS_PROPERTY_AVAILABLE_LABEL")} *`}</CardLabel>
                  <div className="field">
                    <Controller
                      control={control}
                      name="isPropertyAvailable"
                      rules={{ required: t("REQUIRED_FIELD") }}
                      render={(props) => (
                        <Dropdown
                          placeholder={t("IS_PROPERTY_AVAILABLE")}
                          selected={props.value}
                          select={(e) => {
                            props.onChange(e);
                            if (e) {
                              dispatch(UPDATE_NOCNewApplication_FORM("cpt", null));
                              dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", null));
                              dispatch(
                                UPDATE_NOCNewApplication_FORM("siteDetails", {
                                  ...currentStepData?.siteDetails,
                                  vasikaNumber: "",
                                  vasikaDate: null,
                                  netTotalArea: null,
                                })
                              );
                              reset({
                                owners: [defaultOwner()],
                                isPropertyAvailable: e,
                              });
                            }
                            setIsPropertyAvailable(e);
                          }}
                          option={[
                            { code: "YES", i18nKey: "YES", value: true },
                            { code: "NO", i18nKey: "NO", value: false },
                          ]}
                          optionKey="i18nKey"
                          t={t}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`owners[${index}].propertyId`}
                      rules={{
                        maxLength: {
                          value: 100,
                          message: t("MAX_100_CHARACTERS_ALLOWED"),
                        },
                      }}
                      render={(props) => (
                        <>
                          <TextInput
                            style={{ display: "none" }}
                            value={props.value}
                            onChange={(e) => props.onChange(e.target.value)}
                            onBlur={(e) => props.onBlur(e)}
                            disabled={true}
                          />
                        </>
                      )}
                    />
                  </div>
                </LabelFieldPair>
                {errors.isPropertyAvailable && (
                  <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors.isPropertyAvailable.message}</CardLabelError>
                )}
                {isPropertyAvailable?.value === false && (
                  <CardLabelError style={{ fontSize: "12px", color: "black" }}>{t("NO_PROPERTY_AVAILABLE_DISCLAIMER")}</CardLabelError>
                )}

                {tenantId === LUDHIANA_TENANT && isPropertyAvailable?.value && (
                  <PropertySearchLudhiana formData={currentStepData} setApiLoading={setLoader} menuList={menuList} />
                )}
                {tenantId === BATHINDA_TENANT && isPropertyAvailable?.value && (
                  <PropertySearchBathinda formData={currentStepData} setApiLoading={setLoader} menuList={menuList} />
                )}
                {tenantId !== LUDHIANA_TENANT && tenantId !== BATHINDA_TENANT && isPropertyAvailable?.value && (
                  <button
                    type="button"
                    className="submit-bar"
                    // style={{ marginBottom: "1rem", width: "100%" }}
                    onClick={() => {
                      setCurrentIndex(index);
                      setShowModal(true);
                    }}
                  >
                    {t("PT_SEARCH_PROPERTY")}
                  </button>
                )}

                {/* Property Owner Name */}
                <Controller control={control} name={`owners[${index}].PropertyOwnerName`} />

                {/* Property Owner Mobile Number */}
                <Controller control={control} name={`owners[${index}].PropertyOwnerMobileNumber`} />

                {/* Property Owner Address */}
                <Controller control={control} name={`owners[${index}].PropertyOwnerAddress`} />

                {/* Property Owner Plot Area */}
                <Controller control={control} name={`owners[${index}].PropertyOwnerPlotArea`} />

                <Controller control={control} name={`owners[${index}].propertyVasikaNo`} />

                <Controller control={control} name={`owners[${index}].propertyVasikaDate`} />

                {/* <div className="field">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {watch(`owners[${index}].PropertyOwnerName`) && (
                      <StatusTable style={{ marginBottom: "1rem" }}>
                        <Row className="border-none" label={t(`PROPERTY_ID`)} text={watch(`owners[${index}].propertyId`)} />
                        <Row label={t("PROPERTY_OWNER_NAME")} text={watch(`owners[${index}].PropertyOwnerName`)} />{" "}
                        <Row label={t("PROPERTY_OWNER_MOBILE_NUMBER")} text={watch(`owners[${index}].PropertyOwnerMobileNumber`)} />{" "}
                        <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={watch(`owners[${index}].PropertyOwnerAddress`)} />{" "}
                        <Row label={t("PROPERTY_PLOT_AREA")} text={watch(`owners[${index}].PropertyOwnerPlotArea`)} />
                        <Row label={t("Vasika Number")} text={watch(`owners[${index}].propertyVasikaNo`)} />
                        <Row label={t("Vasika Date")} text={watch(`owners[${index}].propertyVasikaDate`)} />
                      </StatusTable>
                    )}

                    
                  </div>
                </div> */}
              </div>
            )}

            {index === 0 && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("NOC_OWNER_TYPE_LABEL")}`}
                  <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={`owners[${index}].ownerType`}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    render={(props) => (
                      <Dropdown
                        t={t}
                        option={ownerTypeOptions}
                        optionKey="i18nKey"
                        select={(e) => {
                          props.onChange(e);
                        }}
                        selected={props.value}
                      />
                    )}
                  />

                  {errors?.owners?.[index]?.ownerType && (
                    <p style={{ color: "red", marginBottom: "0" }}>{errors?.owners?.[index]?.ownerType?.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            )}

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <div style={{ display: "flex" }}>
                  <Controller
                    control={control}
                    name={`owners[${index}].mobileNumber`}
                    rules={{
                      required: t("REQUIRED_FIELD"),
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: t("INVALID_MOBILE_NUMBER"),
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        t={t}
                        disabled={Boolean(nocCpt?.details?.owners?.[0]?.mobileNumber) || Boolean(cptObj?.owners?.[0]?.mobileNumber) || Boolean(currentStepData?.applicationDetails?.owners?.[0]?.PropertyOwnerMobileNumber)}
                      />
                    )}
                  />
                  <div
                    style={{ marginTop: "17px" }}
                    className="search-icon"
                    onClick={
                      Boolean(nocCpt?.details?.owners?.[0]?.mobileNumber) || Boolean(cptObj?.owners?.[0]?.mobileNumber) || Boolean(currentStepData?.applicationDetails?.owners?.[0]?.PropertyOwnerMobileNumber)
                        ? null
                        : () => getOwnerDetails(index)
                    }
                  >
                    {" "}
                    <SearchIcon />{" "}
                  </div>
                </div>
                {errors?.owners?.[index]?.mobileNumber && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].mobileNumber.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_FIRM_OWNER_NAME_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={`owners[${index}].ownerOrFirmName`}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    maxLength: {
                      value: 100,
                      message: t("MAX_100_CHARACTERS_ALLOWED"),
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      t={t}
                      disabled={Boolean(nocCpt?.details?.owners?.[0]?.name) || Boolean(cptObj?.owners?.[0]?.name) || Boolean(currentStepData?.applicationDetails?.owners?.[0]?.PropertyOwnerName)}
                    />
                  )}
                />
                {errors?.owners?.[index]?.ownerOrFirmName && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].ownerOrFirmName.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_APPLICANT_EMAIL_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={`owners[${index}].emailId`}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    pattern: {
                      value: /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+\.[A-Za-z]{2,}$/,
                      message: t("INVALID_EMAIL_FORMAT"),
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      t={t}
                    />
                  )}
                />
                {errors?.owners?.[index]?.emailId && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].emailId.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={`owners[${index}].fatherOrHusbandName`}
                  rules={{
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: t("ONLY_ENGLISH_LETTERS_ALLOWED"),
                    },
                    maxLength: {
                      value: 100,
                      message: t("MAX_100_CHARACTERS_ALLOWED"),
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      t={t}
                      disabled={Boolean(nocCpt?.details?.owners?.[0]?.fatherOrHusbandName) || Boolean(cptObj?.owners?.[0]?.fatherOrHusbandName)}
                    />
                  )}
                />
                {errors?.owners?.[index]?.fatherOrHusbandName && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].fatherOrHusbandName.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_APPLICANT_ADDRESS_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={`owners[${index}].address`}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    // minLength: {
                    //   value: 4,
                    //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                    // },
                    maxLength: {
                      value: 100,
                      message: t("MAX_100_CHARACTERS_ALLOWED"),
                    },
                  }}
                  render={(props) => (
                    <TextArea
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      t={t}
                      disabled={
                        Boolean(nocCpt?.details?.address?.doorNo || nocCpt?.details?.address?.street) ||
                        Boolean(cptObj?.address?.doorNo || cptObj?.address?.street) || Boolean(currentStepData?.applicationDetails?.owners?.[0]?.PropertyOwnerAddress)
                      }
                    />
                  )}
                />
                {errors?.owners?.[index]?.address && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].address.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_APPLICANT_DOB_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={`owners[${index}].dateOfBirth`}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    validate: (value) => {
                      const today = new Date();
                      const dob = new Date(value);
                      const age = today.getFullYear() - dob.getFullYear();
                      const m = today.getMonth() - dob.getMonth();
                      const d = today.getDate() - dob.getDate();

                      const is18OrOlder = age >= 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                      return is18OrOlder || t("DOB_MUST_BE_18_YEARS_OLD");
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      type="date"
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      min="1900-01-01"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  )}
                />
                {errors?.owners?.[index]?.dateOfBirth && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].dateOfBirth.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_APPLICANT_GENDER_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={`owners[${index}].gender`}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <RadioButtons
                      t={t}
                      options={menu}
                      optionsKey="code"
                      value={props.value}
                      selectedOption={props.value}
                      onSelect={(e) => {
                        props.onChange(e);
                      }}
                      isDependent={true}
                    />
                  )}
                />
                {errors?.owners?.[index]?.gender && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].gender.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
              <CardLabel className="card-label-smaller">
                {t("NOC_APPLICANT_PASSPORT_PHOTO")}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <NOCCustomUploadFile
                  id={`passport-photo-${index}`}
                  onUpload={selectOwnerPhotoFile(index)}
                  onDelete={() => {
                    deleteOwnerPhoto(index);
                  }}
                  uploadedFile={ownerPhotoList?.[index]?.filestoreId}
                  message={ownerPhotoList?.[index]?.filestoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                  uploadMessage=""
                  accept="image/*"
                />
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
              <CardLabel className="card-label-smaller">
                {t("NOC_APPLICANT_ID_PROOF")}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <NOCCustomUploadFile
                  id={`id-proof-${index}`}
                  onUpload={selectOwnerIdFile(index)}
                  onDelete={() => {
                    deleteOwnerId(index);
                  }}
                  uploadedFile={ownerIdList?.[index]?.filestoreId}
                  message={ownerIdList?.[index]?.filestoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                  uploadMessage=""
                  accept=".pdf"
                />
              </div>
            </LabelFieldPair>
          </div>
        ))}
      </div>

      <div>
        <button type="button" onClick={() => append(defaultOwner())} style={{ cursor: "pointer" }}>
          {!isEdit && `➕ Add Owner`}
        </button>
      </div>

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
      {showModal && (
        <PropertySearchModal
          closeModal={() => setShowModal(false)}
          onPropertySelect={handlePropertySelect}
          formData={currentStepData}
          setApiLoading={setLoader}
          tenantId={tenantId}
        />
      )}
    </React.Fragment>
  );
};

export default NOCApplicantDetails;
