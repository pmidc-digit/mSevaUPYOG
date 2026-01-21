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

import { getPattern } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import NOCCustomUploadFile from "./NOCCustomUploadFile";
import { PropertySearchModal } from "./PropertySearchModal";
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

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const dispatch = useDispatch();

  // const ownerIds = useSelector(function (state) {
  //   return state.noc.NOCNewApplicationFormReducer.ownerIds;
  // });

  // const ownerPhotos = useSelector(function (state) {
  //   return state.noc.NOCNewApplicationFormReducer.ownerPhotos;
  // });

  const [loader, setLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

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
      setLoader(false);
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
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    } finally {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
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

    const owners =
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
      owners,
    });
  }, [currentStepData, setValue, append, reset]);

  //For fetching user details
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => {
    setShowToast(null);
  };
  

  const getOwnerDetails = async (idx) => {
    const currentMobile = mobileAtIndex(idx);

    if (!/^[6-9]\d{9}$/.test(currentMobile)) {
      setShowToast({ key: "true", error: true, message: "INVALID_MOBILE_NUMBER" });
      return;
    }

    try {
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
    }
  };

  const handlePropertySelect = (property) => {
    console.log('property', property)
    if (currentIndex !== null && property?.propertyId) {
      const ownerNames = property?.owners?.map((o) => o?.name).filter(Boolean).join(", ") || "";
      setValue(`owners[${currentIndex}].propertyId`, property.propertyId, { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${currentIndex}].PropertyOwnerName`, ownerNames || "", { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${currentIndex}].PropertyOwnerMobileNumber`, property?.owners?.[0]?.mobileNumber || "", { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${currentIndex}].PropertyOwnerAddress`, property?.owners?.[0]?.permanentAddress || "", { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${currentIndex}].PropertyOwnerPlotArea`, property?.landArea || null, { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${currentIndex}].propertyVasikaNo`,  property?.additionalDetails?.vasikaNo || currentStepData?.applicationDetails?.owners?.[0]?.propertyVasikaNo || null, { shouldValidate: true, shouldDirty: true });
      setValue(`owners[${currentIndex}].propertyVasikaDate`, property?.additionalDetails?.vasikaDate || currentStepData?.applicationDetails?.owners?.[0]?.propertyVasikaDate || null, { shouldValidate: true, shouldDirty: true });
      dispatch(
        UPDATE_NOCNewApplication_FORM("applicationDetails", {
          ...currentStepData?.applicationDetails,
          owners: currentStepData?.applicationDetails?.owners?.map((o, i) =>
            i === currentIndex
              ? {
                  ...o,
                  propertyId: property.propertyId,
                  PropertyOwnerName: ownerNames,
                  PropertyOwnerMobileNumber: property?.owners?.[0]?.mobileNumber,
                  PropertyOwnerAddress: property?.owners?.[0]?.permanentAddress,
                  PropertyOwnerPlotArea: property?.landArea,
                  propertyVasikaNo: property?.additionalDetails?.vasikaNo,
                  propertyVasikaDate: property?.additionalDetails?.vasikaDate,
                }
              : o
          ),
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

  console.log("ownerIdList (local)==>", ownerIdList);
  console.log("ownerPhotoList (local)==>", ownerPhotoList);

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("NOC_APPLICANT_DETAILS")}</CardSectionHeader>
      <div>
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
              <LabelFieldPair style={{ position: "relative", zIndex: "101", marginBottom: "20px" }}>
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
                        disabled={isEdit}
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
                        disabled={isEdit}
                      />
                    )}
                  />
                  <div style={{ marginTop: "17px" }} className="search-icon" onClick={isEdit ? null : () => getOwnerDetails(index)}>
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
                      disabled={isEdit}
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
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
                      disabled={isEdit}
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
                      // disabled={isEdit}
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
                    />
                  )}
                />
                {errors?.owners?.[index]?.address && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].address.message}</p>
                )}
              </div>
            </LabelFieldPair>

            {index === 0 && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_PROPERTY_ID_LABEL")}`}</CardLabel>
                <div className="field">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {watch(`owners[${index}].propertyId`) && (
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
                            t={t}
                          />
                          <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={(e) => props.onBlur(e)} />
                        </>
                      )}
                    />

                    <button
                      type="button"
                      className="submit-bar"
                      style={{ marginBottom: "1rem", width: "100%" }}
                      onClick={() => {
                        setCurrentIndex(index);
                        setShowModal(true);
                      }}
                    >
                      {t("PT_SEARCH_PROPERTY")}
                    </button>

                    {/* Property Owner Name */}
                    <Controller
                      control={control}
                      name={`owners[${index}].PropertyOwnerName`}
                      rules={{
                        maxLength: {
                          value: 100,
                          message: t("MAX_100_CHARACTERS_ALLOWED"),
                        },
                      }}
                    />
                    {errors?.owners?.[index]?.PropertyOwnerName && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].PropertyOwnerName.message}</p>
                    )}

                    {/* Property Owner Mobile Number */}
                    <Controller
                      control={control}
                      name={`owners[${index}].PropertyOwnerMobileNumber`}
                      rules={{
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: t("INVALID_MOBILE_NUMBER"),
                        },
                      }}
                    />
                    {errors?.owners?.[index]?.PropertyOwnerMobileNumber && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].PropertyOwnerMobileNumber.message}</p>
                    )}

                    {/* Property Owner Address */}
                    <Controller
                      control={control}
                      name={`owners[${index}].PropertyOwnerAddress`}
                      rules={{
                        // minLength: {
                        //   value: 4,
                        //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                        // },
                        maxLength: {
                          value: 500,
                          message: t("MAX_500_CHARACTERS_ALLOWED"),
                        },
                      }}
                    />

                    {errors?.owners?.[index]?.PropertyOwnerAddress && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].PropertyOwnerAddress.message}</p>
                    )}

                    {/* Property Owner Plot Area */}
                    <Controller
                      control={control}
                      name={`owners[${index}].PropertyOwnerPlotArea`}
                      rules={{
                        pattern: {
                          value: /^[0-9]*\.?[0-9]+$/,
                          message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                        },
                        maxLength: {
                          value: 100,
                          message: t("MAX_100_CHARACTERS_ALLOWED"),
                        },
                      }}
                    />
                    {errors?.owners?.[index]?.PropertyOwnerPlotArea && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].PropertyOwnerPlotArea.message}</p>
                    )}
                    <Controller
                      control={control}
                      name={`owners[${index}].propertyVasikaNo`}
                     />
                    {errors?.owners?.[index]?.propertyVasikaNo && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].propertyVasikaNo.message}</p>
                    )}
                    <Controller
                      control={control}
                      name={`owners[${index}].propertyVasikaDate`}
                    />
                    {errors?.owners?.[index]?.propertyVasikaDate && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].propertyVasikaDate.message}</p>
                    )}
                  </div>
                </div>
              </LabelFieldPair>
            )}

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
                      disabled={isEdit}
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
                      disabled={isEdit}
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
                  disabled={isEdit}
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
                  disabled={isEdit}
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
