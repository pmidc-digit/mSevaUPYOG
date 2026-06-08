import { CardLabel, CardLabelError, Dropdown, LabelFieldPair, MobileNumber, TextInput,Toast,CheckBox } from "@mseva/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { stringReplaceAll,CompareTwoObjects } from "../utils";

const createOwnerDetails = () => ({
  name: "",
  mobileNumber: "",
  fatherOrHusbandName: "",
  emailId: "",
  permanentAddress: "",
  relationship: "",
  ownerType: "",
  gender: "",
  isCorrespondenceAddress: false,
  institutionName: null,
  institutionType: null,
  key: Date.now(),
});

const PTEmployeeOwnershipDetails = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {
  const { t } = useTranslation();

console.log("formData tes test",formData);


  const { pathname } = useLocation();
  const isEditScreen = pathname.includes("/edit-application/") 
  const [owners, setOwners] = useState(formData?.owners || [createOwnerDetails()]);
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: mdmsData, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", [
    "UsageCategory",
    "OccupancyType",
    "Floor",
    "OwnerType",
    "OwnerShipCategory",
    "Documents",
    "SubOwnerShipCategory",
    "OwnerShipCategory",
  ]);

  const { data: Menu } = Digit.Hooks.pt.usePTGenderMDMS(stateId, "common-masters", "GenderType");

  let menu = [];

  Menu &&
    Menu.map((formGender) => {
      menu.push({ i18nKey: `PT_FORM3_${formGender.code}`, code: `${formGender.code}`, value: `${formGender.code}` });
    });

  const addNewOwner = () => {
    const newOwner = createOwnerDetails();
    setOwners((prev) => [...prev, newOwner]);
  };

  const removeOwner = (owner) => {
    setOwners((prev) => prev.filter((o) => o.key != owner.key));
  };

  useEffect(() => {
    onSelect(config?.key, owners);
  }, [owners]);

  useEffect(() => {
    console.log("formdata",formData)
    if (!formData?.owners) {
      setOwners([createOwnerDetails()]);
    }
  }, [formData?.ownershipCategory?.code]);

  const relationshipTypes = [{ i18nKey: "PT_FORM3_FATHER", code: "FATHER" }, { i18nKey: "PT_FORM3_MOTHER", code: "MOTHER" }   ,{ i18nKey: "PT_FORM3_HUSBAND", code: "HUSBAND" } ]

  const ownerTypesMenu = useMemo(
    () =>
      mdmsData?.PropertyTax?.OwnerType?.map?.((e) => ({
        i18nKey: `${e.code.replaceAll("PROPERTY", "COMMON_MASTERS").replaceAll(".", "_")}`,
        code: e.code,
      })) || [],
    [mdmsData]
  );

  const institutionTypeMenu = useMemo(() => {
    const code = formData?.ownershipCategory?.code;
    const arr = mdmsData?.PropertyTax?.SubOwnerShipCategory?.filter((e) => e?.ownerShipCategory?.includes(code));
    return arr?.map((e) => ({ ...e, i18nKey: `COMMON_MASTERS_OWNERSHIPCATEGORY_${e.code?.replaceAll(".", "_")}` }));
  }, [mdmsData, formData?.ownershipCategory]);

  useEffect(()=>{
    if(Menu && isEditScreen){
      let defaultOwners = formData?.owners?.map((owner,index) => {
        let { relationship, gender, ownerType } = owner;
        let institutionType = owner?.institutionType;
        // let institutionType = owner?.owner;
        if(!relationship?.code && relationship){
          relationship = relationshipTypes.find((val) => val.code === relationship?.toUpperCase());
        }
        if(!formData?.ownershipCategory?.code?.includes("INDIVIDUAL") && !institutionType?.code && institutionType){
          institutionType = institutionTypeMenu.find((val) => val.code === institutionType)
        }
        if(!gender?.code && gender){
          gender = menu.find((val) => val.code === gender);
        }
        if(!ownerType?.code && ownerType){
          ownerType = ownerTypesMenu.find((val) => val.code === ownerType);
        }


        return {
          ...owner,
          relationship,
          gender,
          ownerType,
          institutionType
        }
      })

      setOwners(defaultOwners || []);
      
    }
  },[Menu, isLoading])

  const commonProps = {
    focusIndex,
    allOwners: owners,
    setFocusIndex,
    removeOwner,
    formData,
    formState,
    setOwners,
    mdmsData,
    t,
    setError,
    clearErrors,
    config,
    menu,
    isEditScreen,
    relationshipTypes,
    ownerTypesMenu,
    institutionTypeMenu
  };

  // if (isEditScreen) {
  //   return <React.Fragment />;
  // }

  return formData?.ownershipCategory?.code ? (
    <React.Fragment>
      {owners.map((owner, index) => (
        <OwnerForm key={owner.key} index={index} owner={owner} {...commonProps} />
      ))}
      {!isEditScreen && formData?.ownershipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS" ? (
        <label onClick={addNewOwner} style={{ color: "orange", cursor: "pointer" }}>Add Owner</label>
      ) : null}
    </React.Fragment>
  ) : null;
};

const OwnerForm = (_props) => {
  const {
    owner,
    index,
    focusIndex,
    allOwners,
    setFocusIndex,
    removeOwner,
    setOwners,
    t,
    mdmsData,
    formData,
    config,
    setError,
    clearErrors,
    formState,
    menu,
    isEditScreen,
    relationshipTypes,
    ownerTypesMenu,
    institutionTypeMenu
  } = _props;
  const { originalData = {} } = formData;
  const { institution = {} } = originalData;
const [uuid, setUuid]= useState(null)
const [showToast, setShowToast] = useState(null);
  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger } = useForm();
  const formValue = watch();
  const { errors } = localFormState;
  console.log("institution",institution)
  console.log("owner",owner)
const formState2 = useSelector((state) => state.pt.PTNewApplicationForm);
console.log("man",formData?.ownerShipCategory)
const [isSamePropAddress,setIsSamePropAddress] = useState(false)
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // owner["institution"] = { name: owner?.institution?.name ? formValue?.institution?.name : institution?.name };
  // owner["institution"].type = {
  //   active: true,
  //   code: formValue?.institution?.type?.code || institution?.type?.code,
  //   // i18nKey: `COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(formValue?.institution?.type?.code || institution?.type || "")}`,
  //   // name: t(`COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(formValue?.institution?.type?.code || institution?.type || "")}`),
  //   i18nKey: `${stringReplaceAll(formValue?.institution?.type?.code || institution?.type || "")}`,
  //   name: t(`${stringReplaceAll(formValue?.institution?.type?.code || institution?.type || "")}`),
  // };
  // owner.designation = owner?.designation ? formValue?.designation : institution?.designation;
  const specialDocsMenu = useMemo(
    () =>
      mdmsData?.PropertyTax?.Documents?.filter((e) => e.code === "OWNER.SPECIALCATEGORYPROOF")?.[0]
        .dropdownData?.filter((e) => e.parentValue.includes(formValue?.ownerType?.code))
        .map?.((e) => ({
          i18nKey: e.code?.replaceAll(".", "_"),
          code: e.code,
        })) || [],
    [mdmsData, formValue]
  );

  // const ownerTypesMenu = useMemo(
  //   () =>
  //     mdmsData?.PropertyTax?.OwnerType?.map?.((e) => ({
  //       i18nKey: `${e.code.replaceAll("PROPERTY", "COMMON_MASTERS").replaceAll(".", "_")}`,
  //       code: e.code,
  //     })) || [],
  //   [mdmsData]
  // );

  if (ownerTypesMenu?.length > 0) {
    ownerTypesMenu ? ownerTypesMenu.sort((a, b) => a.code.localeCompare(b.code)) : "";
    ownerTypesMenu?.forEach((data, index) => {
      if (data.code == "NONE") data.order = 0
      else data.order = index + 1
    });
    ownerTypesMenu.sort(function (a, b) { return a.order - b.order; });
  }
  const isIndividualTypeOwner = useMemo(() => formData?.ownershipCategory?.code.includes("INDIVIDUAL"), [formData?.ownershipCategory?.code]);

  // const institutionTypeMenu = useMemo(() => {
  //   const code = formData?.ownershipCategory?.code;
  //   const arr = mdmsData?.PropertyTax?.SubOwnerShipCategory?.filter((e) => e?.ownerShipCategory?.includes(code));
  //   return arr?.map((e) => ({ ...e, i18nKey: `COMMON_MASTERS_OWNERSHIPCATEGORY_${e.code?.replaceAll(".", "_")}` }));
  // }, [mdmsData, formData?.ownershipCategory]);

  useEffect(() => {
    trigger();
  }, []);

  
  const [part, setPart] = React.useState({});

  useEffect(() => {    
    let _ownerType = isIndividualTypeOwner ? {} : { ownerType: { code: "NONE" } };

    if (!_.isEqual(part, formValue)) {
      setPart({...formValue});
      setOwners((prev) => prev.map((o) => (o.key && o.key === owner.key ? { ...o, ...formValue, ..._ownerType } : { ...o })));
      trigger();
    }
  }, [formValue]);

  useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) setError(config.key, { type: errors });
    else if (!Object.keys(errors).length && formState.errors[config.key]) clearErrors(config.key);
  }, [errors]);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  useEffect(() => {
    const getData = setTimeout(async () => {
      const propertyDetails = await Digit.PTService.search({ tenantId, filters: { documentNumbers: uuid } });
      if (propertyDetails?.Properties.length > 0) {
        setShowToast({
          error: true,label: `Please enter a valid document number`
        })
      }
      else {
        setShowToast({
          label: `Valid document number`
        })
      }
    }, 1000)
    return () => clearTimeout(getData)
  }, [uuid])


  function getAddressEmployee () {
    let str = "";
    str = formState2?.formData?.LocationDetails?.address?.doorNo? str + formState2?.formData?.LocationDetails?.address?.doorNo + ",": str
    str = formState2?.formData?.LocationDetails?.address?.buildingName? str + " " + formState2?.formData?.LocationDetails?.address?.buildingName + ",": str
    str = formState2?.formData?.LocationDetails?.address?.street? str + " " + formState2?.formData?.LocationDetails?.address?.street + ",": str
    str = formState2?.formData?.LocationDetails?.address?.locality?.name? str + " " + formState2?.formData?.LocationDetails?.address?.locality?.name + ",": str
    str = formState2?.formData?.LocationDetails?.address?.city?.name? str + " " + formState2?.formData?.LocationDetails?.address?.city?.name + ",": str
    str = formState2?.formData?.LocationDetails?.address?.pincode? str + " " + formState2?.formData?.LocationDetails?.address?.pincode  : str
    
    return str;
  }

  function getAddressCitizen () {
    let str = "";
    str = formState2?.formData?.PersonalDetails?.address?.doorNo? str + formState2?.formData?.PersonalDetails?.address?.doorNo + ",": str
    str = formState2?.formData?.PersonalDetails?.address?.buildingName? str + " " + formState2?.formData?.PersonalDetails?.address?.buildingName + ",": str
    str = formState2?.formData?.PersonalDetails?.address?.street? str + " " + formState2?.formData?.PersonalDetails?.address?.street + ",": str
    str = formState2?.formData?.PersonalDetails?.address?.locality?.name? str + " " + formState2?.formData?.PersonalDetails?.address?.locality?.name + ",": str
    str = formState2?.formData?.PersonalDetails?.address?.city?.name? str + " " + formState2?.formData?.PersonalDetails?.address?.city?.name + ",": str
    str = formState2?.formData?.PersonalDetails?.address?.pincode? str + " " + formState2?.formData?.PersonalDetails?.address?.pincode  : str
    
    return str;
  }


  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px" }}>
        <div className="label-field-pair">
          <h2 className="card-label card-label-smaller" style={{ color: "#505A5F" }}>
            {isIndividualTypeOwner
              ? `Owner ${formData?.ownershipCategory?.code?.includes("MULTIPLE") ? index + 1 : ""}`
              : "Authorised Person Details"}
          </h2>
        </div>
        <div style={{ border: "1px solid #E3E3E3", padding: "16px", marginTop: "8px" }}>
          {allOwners?.length > 2 ? (
            <div onClick={() => removeOwner(owner)} style={{ marginBottom: "16px", padding: "5px", cursor: "pointer", textAlign: "right" }}>
              X
            </div>
          ) : null}

          {!isIndividualTypeOwner ? (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_INSTITUTION_NAME")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"institutionName"}
                    defaultValue={owner?.institutionName ||  null}
                    rules={{
                      required: !isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false,
                      validate: {
                        pattern: (v) => (!isIndividualTypeOwner && v ? (/^[a-zA-Z_@./()#&+-\s]*$/.test(v) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) : true),
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        value={props.value}
                        disable={isEditScreen}
                        name={"institutionName"}
                        autoFocus={focusIndex.index === owner?.key && focusIndex.type === "institutionName"}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                          setFocusIndex({ index: owner.key, type: "institutionName" });
                        }}
                        onBlur={(e) => {
                          setFocusIndex({ index: -1 });
                          props.onBlur(e);
                        }}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.institutionName || (!isIndividualTypeOwner && !formValue?.institutionName)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.institutionName?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_INSTITUTION_TYPE")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <Controller
                  control={control}
                  name={"institutionType"}
                  defaultValue={owner?.institutionType ||  null}
                  rules={{ required: !isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      selected={owner?.institutionType || props.value}
                      name={"institutionType"}
                      autoFocus={focusIndex.index === owner?.key && focusIndex.type === "institutionType"}
                      select={(e) => {
                        props.onChange(e);
                        setFocusIndex({ index: owner.key, type: "institutionType" });
                      }}
                      onBlur={props.onBlur}
                      option={institutionTypeMenu}
                      optionKey="i18nKey"
                      disable={isEditScreen}
                      t={t}
                    />
                  )}
                />
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.institutionType || (!isIndividualTypeOwner && !formValue?.institutionType)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.institutionType?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
            </React.Fragment>
          ) : null}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("PT_OWNER_NAME")} <span style={{ color: 'red' }}>*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"name"}
                defaultValue={owner?.name}
                rules={{
                  required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    disable={isEditScreen}
                    autoFocus={focusIndex.index === owner?.key && focusIndex.type === "name"}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      setFocusIndex({ index: owner.key, type: "name" });
                    }}
                    onBlur={(e) => {
                      setFocusIndex({ index: -1 });
                      props.onBlur(e);
                    }}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {formState?.submitCount > 0 && (errors?.name || !formValue?.name) && (
            <CardLabelError style={errorStyle}>
              {errors?.name?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
            </CardLabelError>
          )}

          {isIndividualTypeOwner ? (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_FORM3_GENDER")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <Controller
                  control={control}
                  name={"gender"}
                  defaultValue={owner?.gender}              
                  rules={{ required: isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      selected={owner?.gender || props.value}
                      select={props.onChange}
                      onBlur={props.onBlur}
                      option={menu}
                      optionKey="i18nKey"
                      t={t}
                    />
                  )}
                />
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.gender || (isIndividualTypeOwner && !formValue?.gender)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.gender?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_LANDLINE_NUMBER_FLOATING_LABEL")} {isIndividualTypeOwner ? "" : <span style={{ color: 'red' }}>*</span>}</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"altContactNumber"}
                    defaultValue={owner?.altContactNumber}
                    rules={
                      isIndividualTypeOwner
                        ? {}
                        : {
                            required: !isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false,
                            validate: { pattern: (e) => (!isIndividualTypeOwner && e ? (/^[0-9]{11}$/i.test(e) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) : true) },
                          }
                    }
                    render={(props) => (
                      <MobileNumber
                        value={props.value}
                        hideSpan={true}
                        disable={isEditScreen}
                        maxLength={11}
                        autoFocus={focusIndex.index === owner?.key && focusIndex.type === "altContactNumber"}
                        onChange={(e) => {
                          props.onChange(e);
                          setFocusIndex({ index: owner.key, type: "altContactNumber" });
                        }}
                        labelStyle={{ marginTop: "unset" }}
                        onBlur={props.onBlur}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.altContactNumber || (!isIndividualTypeOwner && !formValue?.altContactNumber)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.altContactNumber?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
            </React.Fragment>
          )}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("PT_FORM3_MOBILE_NUMBER")} <span style={{ color: 'red' }}>*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"mobileNumber"}
                defaultValue={owner?.mobileNumber}
                rules={{
                  required: t("CORE_COMMON_REQUIRED_ERRMSG"),
                  validate: (v) => (/^[6789]\d{9}$/.test(v) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                }}
                render={(props) => (
                  <MobileNumber
                    value={props.value}
                    disable={isEditScreen}
                    autoFocus={focusIndex.index === owner?.key && focusIndex.type === "mobileNumber"}
                    onChange={(e) => {
                      props.onChange(e);
                      setFocusIndex({ index: owner.key, type: "mobileNumber" });
                    }}
                    labelStyle={{ marginTop: "unset" }}
                    onBlur={props.onBlur}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {formState?.submitCount > 0 && (errors?.mobileNumber || !formValue?.mobileNumber) && (
            <CardLabelError style={errorStyle}>
              {errors?.mobileNumber?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
            </CardLabelError>
          )}
          {isIndividualTypeOwner ? (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_SEARCHPROPERTY_TABEL_GUARDIANNAME")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"fatherOrHusbandName"}
                    defaultValue={owner?.fatherOrHusbandName}
                    rules={{
                      required: isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false,
                      validate: { pattern: (val) => (isIndividualTypeOwner && val ? (/^[a-zA-Z ]+$/.test(val) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) : true) },
                    }}
                    render={(props) => (
                      <TextInput
                        value={props.value}
                        disable={isEditScreen}
                        autoFocus={focusIndex.index === owner?.key && focusIndex.type === "fatherOrHusbandName"}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                          setFocusIndex({ index: owner.key, type: "fatherOrHusbandName" });
                        }}
                        onBlur={props.onBlur}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.fatherOrHusbandName || (isIndividualTypeOwner && !formValue?.fatherOrHusbandName)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.fatherOrHusbandName?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_FORM3_RELATIONSHIP")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <Controller
                  control={control}
                  name={"relationship"}
                  defaultValue={owner?.relationship}
                  rules={{ required: isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      selected={owner?.relationship || props.value}
                      select={props.onChange}
                      onBlur={props.onBlur}
                      disable={isEditScreen}
                      option={relationshipTypes}
                      optionKey="i18nKey"
                      t={t}
                    />
                  )}
                />
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.relationship || (isIndividualTypeOwner && !formValue?.relationship)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.relationship?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_FORM3_SPECIAL_CATEGORY")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <Controller
                  control={control}
                  name={"ownerType"}
                  defaultValue={owner?.ownerType}
                  rules={{ required: isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      selected={owner?.ownerType || props.value}
                      select={props.onChange}
                      onBlur={props.onBlur}
                      option={ownerTypesMenu}
                      disable={isEditScreen}
                      optionKey="i18nKey"
                      t={t}
                    />
                  )}
                />
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.ownerType || (isIndividualTypeOwner && !formValue?.ownerType)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.ownerType?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("TL_NEW_DESIG_OWNER_LABEL")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"designation"}
                    defaultValue={owner?.designation ||  null}
                    rules={{ required: !isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                    render={(props) => (
                      <TextInput
                        value={props.value}
                        disable={isEditScreen}
                        autoFocus={focusIndex.index === owner?.key && focusIndex.type === "designation"}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                          setFocusIndex({ index: owner.key, type: "designation" });
                        }}
                        onBlur={props.onBlur}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.designation || (!isIndividualTypeOwner && !formValue?.designation)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.designation?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
            </React.Fragment>
          )}

          {formValue.ownerType?.code && formValue.ownerType?.code !== "NONE" ? (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_OWNERSHIP_DOCUMENT_TYPE")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <Controller
                  control={control}
                  name={"documents.documentType"}
                  defaultValue={owner?.documents?.documentType}
                  rules={{ required: (isIndividualTypeOwner && formValue.ownerType?.code && formValue.ownerType?.code !== "NONE") ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      selected={props.value}
                      select={props.onChange}
                      disable={isEditScreen}
                      onBlur={props.onBlur}
                      option={specialDocsMenu}
                      optionKey="i18nKey"
                      t={t}
                    />
                  )}
                />
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.documents?.documentType || (isIndividualTypeOwner && formValue.ownerType?.code && formValue.ownerType?.code !== "NONE" && !formValue?.documents?.documentType)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.documents?.documentType?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("PT_OWNERSHIP_DOCUMENT_ID")} <span style={{ color: 'red' }}>*</span></CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"documents.documentUid"}
                    defaultValue={owner?.documents?.documentUid}
                    rules={{ required: (isIndividualTypeOwner && formValue.ownerType?.code && formValue.ownerType?.code !== "NONE") ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                    render={(props) => (
                      <TextInput
                        value={props.value}
                        disable={isEditScreen}
                        autoFocus={focusIndex.index === owner?.key && focusIndex.type === "documents.documentUid"}
                        onChange={(e) => {
                          setUuid(e.target.value)                    
                            props.onChange(e);
                            setFocusIndex({ index: owner.key, type: "documents.documentUid" });                        
                        }}
                        labelStyle={{ marginTop: "unset" }}
                        onBlur={props.onBlur}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {formState?.submitCount > 0 && (errors?.documents?.documentUid || (isIndividualTypeOwner && formValue.ownerType?.code && formValue.ownerType?.code !== "NONE" && !formValue?.documents?.documentUid)) && (
                <CardLabelError style={errorStyle}>
                  {errors?.documents?.documentUid?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
                </CardLabelError>
              )}
            </React.Fragment>
          ) : null}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("PT_OWNERSHIP_INFO_EMAIL_ID")}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"emailId"}
                defaultValue={owner?.emailId}
                rules={{ validate: (e) => ((e && /^[^\s@]+@[^\s@]+$/.test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    disable={isEditScreen}
                    autoFocus={focusIndex.index === owner?.key && focusIndex.type === "emailId"}
                    onChange={(e) => {
                      props.onChange(e);
                      setFocusIndex({ index: owner.key, type: "emailId" });
                    }}
                    labelStyle={{ marginTop: "unset" }}
                    onBlur={props.onBlur}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{localFormState.touched.emailId ? errors?.emailId?.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("PT_OWNERSHIP_INFO_CORR_ADDR")} {isIndividualTypeOwner ? "" : <span style={{ color: 'red' }}>*</span>}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"correspondenceAddress"}
                defaultValue={owner?.correspondenceAddress}
                rules={{ required: !isIndividualTypeOwner ? t("CORE_COMMON_REQUIRED_ERRMSG") : false }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    disable={isEditScreen}
                    autoFocus={focusIndex.index === owner?.key && focusIndex.type === "correspondenceAddress"}
                    onChange={(e) => {
                      props.onChange(e);
                      setFocusIndex({ index: owner.key, type: "correspondenceAddress" });
                    }}
                    onBlur={props.onBlur}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {formState?.submitCount > 0 && (errors?.correspondenceAddress || (!isIndividualTypeOwner && !formValue?.correspondenceAddress)) && (
            <CardLabelError style={errorStyle}>
              {errors?.correspondenceAddress?.message || t("CORE_COMMON_REQUIRED_ERRMSG")}
            </CardLabelError>
          )}
          <Controller
                control={control}
                name={"isSamePropAddress"}
                defaultValue={owner?.isSamePropAddress}
                // rules={isIndividualTypeOwner ? {} : { required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
                render={(props) => (
                  <CheckBox
                    onChange={(e) => {
                      setValue("correspondenceAddress", !owner?.isSamePropAddress? window.location.href.includes("employee")? getAddressEmployee() : getAddressCitizen() : "")
                      // setIsSamePropAddress(e.target.checked)
                      props.onChange(e.target.checked)
                    }}
                    checked={owner?.isSamePropAddress}
                    disable={isEditScreen}
                    label={t("Same as Property Address?")}
                    pageType={"employee"}
                    style={{ marginTop: "-5px" }}
                  />
                )}
          />
{(formState2?.formData?.ownerShipDetails?.ownershipCategory?.code==="INDIVIDUAL.MULTIPLEOWNERS" || formState2?.formData?.ownerShipDetails?.ownershipCategory?.code==="INDIVIDUAL.SINGLEOWNER") &&(
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("Ownership Percentage")} {isIndividualTypeOwner ? "" : <span style={{ color: 'red' }}>*</span>}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"ownershipPercentage"}
                defaultValue={owner?.ownershipPercentage}
                // rules={isIndividualTypeOwner ? {} : { required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    disable={isEditScreen}
                    autoFocus={focusIndex.index === owner?.key && focusIndex.type === "ownershipPercentage"}
                    onChange={(e) => {
                      props.onChange(e);
                      setFocusIndex({ index: owner.key, type: "ownershipPercentage" });
                    }}
                    onBlur={props.onBlur}
                    // isRequired={true}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
)}
{formData?.ownershipCategory?.code.includes("INDIVIDUAL") || formData?.ownershipCategory?.code.includes("SINGLE") &&(
          <CardLabelError style={errorStyle}>
            {localFormState.touched.ownershipPercentage ? errors?.ownershipPercentage?.message : ""}
          </CardLabelError>
)}
        </div>
      </div>
      {showToast?.label && (
        <Toast
          label={showToast?.label}
          onClose={(w) => {
            setShowToast((x) => null);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default PTEmployeeOwnershipDetails;
