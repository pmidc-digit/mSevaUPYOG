import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  CardLabelError,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  RadioButtons,
  SearchIcon,
  Toast,
  CardSectionSubText,
  CardSubHeader
} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";
import CustomUploadFile from "../components/CustomUploadFile";
import { UPDATE_OBPS_FORM, UPDATE_OBPS_OwnerIds, UPDATE_OBPS_OwnerPhotos } from "../redux/actions/OBPSActions";
import { useDispatch, useSelector } from "react-redux";
import { composeInitialProps } from "react-i18next";
import _ from "lodash";

const CLUApplicantDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, reset, useFieldArray, watch, getValues, config, ownerIdList, setOwnerIdList, ownerPhotoList, setOwnerPhotoList } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const dispatch = useDispatch();

  const ownerIds = useSelector(function (state) {
      return state?.obps?.OBPSFormReducer?.ownerIds;
  }) ?? {};

  const ownerPhotos = useSelector(function (state) {
      return state?.obps?.OBPSFormReducer?.ownerPhotos;
  }) || {};

  const [loader, setLoader] = useState(false);

  const selectOwnerIdFile = (index) => async (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      setTimeout(()=>{
        setShowToast(null);
      },3000);
      return;
    }
    try {
      setLoader(true)
      const response = await Digit.UploadServices.Filestorage("CLU", file, stateId)
      setLoader(false)
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setOwnerIdList((prev)=>{
           const next = [...prev];
           const newItem = { 
            filestoreId: fileId,
            fileName: file.name,
            documentType: index === 0 ? "Primary Owner Id": `Owner${index+1} Id`,
            documentUid: fileId
          };

           if(index <= next?.length){
             next[index] = newItem;
           }else{
             next.push(newItem)
           }

           return next;
         });
        setShowToast({ key: "true", success: true, message: t("FILE_UPLOAD_SUCCESS") });
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
      }
    } catch (err) {
      setLoader(false)
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
    }finally{
      setTimeout(()=>{
        setShowToast(null);
      },3000);
    }
  }

  const deleteOwnerPhoto = (index) => {
    const filteredPhotoList= ownerPhotoList?.filter((item, idx)=> idx !== index);
    setOwnerPhotoList(filteredPhotoList);
  };

  const deleteOwnerId = (index) => {
    const filteredIdList= ownerIdList?.filter((item, idx)=> idx !== index);
    setOwnerIdList(filteredIdList);
  };

  const selectOwnerPhotoFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      setTimeout(()=>{
        setShowToast(null);
      },3000);
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("CLU", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
         setOwnerPhotoList((prev)=>{
           const next = [...prev];
           const newItem = { 
            filestoreId: fileId,
            fileName: file.name,
            documentType: index === 0 ? "Primary Owner Photo": `Owner${index+1} Photo`,
            documentUid: fileId
          };
           if(index <= next?.length){
             next[index] = newItem;
           }else{
             next.push(newItem)
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
    }finally{
      setTimeout(()=>{
        setShowToast(null);
      },3000);
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
    gender: null,
    dateOfBirth: "",
    address: "",
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
            gender: findGenderOption(o.gender),
            dateOfBirth: o.dateOfBirth || o.dob || "",
            address: o.address || o.permanentAddress || "",
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
    const userResponse = await Digit.UserService.userSearch(
      stateId,
      { userName: currentMobile },
      {}
    );

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



  const isEdit = window.location.pathname.includes("edit");

  const removeOwner=(index)=>{
    
    deleteOwnerId(index);
    deleteOwnerPhoto(index);
 
    const filteredOwners = currentStepData?.applicationDetails?.owners?.filter((item, idx)=> idx !== index);

    // if(filteredOwners?.length > 0){

    // dispatch(UPDATE_OBPS_FORM("applicationDetails",
    // {
    //  ...currentStepData?.applicationDetails,
    //  owners:filteredOwners
    // }));
    // }
     remove(index);
    
  }

  console.log("ownerIdList (local)==>", ownerIdList);
  console.log("ownerPhotoList (local)==>", ownerPhotoList);

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_APPLICANT_DETAILS")}</CardSectionHeader>
      <div style={{ marginTop: "20px" }}>
        {isEdit && (
          <CardSectionSubText style={{ color: "red", margin: "10px 0px" }}>
            {" "}
            To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section
          </CardSectionSubText>
        )}

        {fields.map((field, index) => (
          <div key={field.id} style={{ border: "1px solid #ddd", padding: "16px", marginBottom: "12px" }}>
            <CardSubHeader >
             {index === 0 ? t("BPA_PRIMARY_OWNER") : `${t("Owner")} ${index + 1}`}
            </CardSubHeader>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 , cursor: "pointer"}}
               onClick={()=>removeOwner(index)}
            >
              {!isEdit && fields.length > 1 && `❌`}
            </div>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_MOBILE_NO_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
              <p style={errorStyle}>{errors?.owners?.[index]?.mobileNumber?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_FIRM_OWNER_NAME_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                <p style={errorStyle}>{errors?.owners?.[index]?.ownerOrFirmName?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_EMAIL_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                <p style={errorStyle}>{errors?.owners?.[index]?.emailId?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
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
                 <p style={errorStyle}>{errors?.owners?.[index]?.fatherOrHusbandName?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_ADDRESS_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                 <p style={errorStyle}>{errors?.owners?.[index]?.address?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
               <p style={errorStyle}>{errors?.owners?.[index]?.dateOfBirth?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                 <p style={errorStyle}>{errors?.owners?.[index]?.gender?.message}</p>
              </div>
            </LabelFieldPair>

            <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
              <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_PASSPORT_PHOTO")}<span className="requiredField">*</span></CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <CustomUploadFile
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
              <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_ID_PROOF")}<span className="requiredField">*</span></CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <CustomUploadFile
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
        <button type="button" onClick={() => append(defaultOwner()) } style={{cursor: "pointer"}}>
          {!isEdit && `➕ Add Owner`}
        </button>
      </div>

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
    </React.Fragment>
  );
};

export default CLUApplicantDetails;
