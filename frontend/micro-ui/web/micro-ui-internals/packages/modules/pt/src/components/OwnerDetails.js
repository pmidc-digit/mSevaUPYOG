import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  TextInput,
  CardLabel,
  Dropdown,
  ActionBar,
  SubmitBar,
  CardLabelError,
  LabelFieldPair,
  CardSectionHeader,
  MobileNumber,
  TextArea,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_PTNewApplication_FORM } from "../redux/action/PTNewApplicationActions";
import { Loader } from "../components/Loader";
import { useTranslation } from "react-i18next";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px", flexDirection: "column", alignItems: "stretch" };
const singleCol = { flexDirection: "column", alignItems: "stretch" };

const owners = [
  {
    name: "Institutional - Government",
    code: "INSTITUTIONALGOVERNMENT",
    value: "INSTITUTIONALGOVERNMENT.OTHERGOVERNMENTINSTITUITION",
    active: true,
  },
  {
    name: "Institutional - Private",
    code: "INSTITUTIONALPRIVATE",
    value: "INSTITUTIONALPRIVATE.OTHERSPRIVATEINSTITUITION",
    active: true,
  },
  {
    name: "Multiple Owners",
    code: "INDIVIDUAL.MULTIPLEOWNERS",
    value: "INDIVIDUAL.MULTIPLEOWNERS",
    active: true,
  },
  {
    name: "Single Owner",
    code: "SINGLEOWNER",
    value: "INDIVIDUAL.SINGLEOWNER",
    active: true,
    ownerShipCategory: "INDIVIDUAL",
  },
];

const buildPropertyAddress = (address = {}) => {
  const parts = [
    address?.doorNo || address?.houseNo,
    address?.buildingName,
    address?.street || address?.streetName,
    address?.locality?.name || address?.locality,
    address?.pincode,
  ]
    .map((part) => (typeof part === "string" ? part.trim() : part))
    .filter((part) => part !== undefined && part !== null && part !== "");

  return parts.join(", ");
};

const PropertyAddressDetails = ({ goNext, onGoBack, isEditMode = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userType = window.location.href.includes("citizen") ? "citizen" : "employee";
  const [loader, setLoader] = useState(false);
  const tenants = Digit.Hooks.pt.useTenants();
  const stateDataCheck = useSelector((state) => state.pt.PTNewApplicationFormReducer.formData?.ownerDetails);
  const propertyAddress = useSelector((state) => {
    const formData = state.pt.PTNewApplicationFormReducer.formData || {};
    return formData?.propertyAddress?.address || formData?.propertyAddress || formData?.LocationDetails?.address || formData?.LocationDetails1?.address;
  });

  const isCitizen = window.location.href.includes("citizen");
  const getCity = localStorage.getItem("CITIZEN.CITY");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  // const [getInstType, setInstType] = useState([]);

  const { data: SubOwnerShipCategoryRaw, isLoading: SubOwnerShipCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "SubOwnerShipCategory" },
  ]);

  // Memoize to prevent new [] reference each render (was causing infinite loop)
  const SubOwnerShipCategory = useMemo(() => SubOwnerShipCategoryRaw || {}, [SubOwnerShipCategoryRaw]);

  const { data: ownerTypeDocumentRaw } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "OwnerTypeDocument" },
  ]);

  const ownerTypeDocuments = useMemo(
    () => ownerTypeDocumentRaw?.PropertyTax?.OwnerTypeDocument?.filter((d) => d.active) || [],
    [ownerTypeDocumentRaw]
  );

  const stateId = Digit.ULBService.getStateId();
  const { data: mdmsData } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", ["OwnerType"]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      owners: [
        {
          name: "",
          mobileNumber: "",
          emailId: "",
          address: "",
          designation: "",
          altContactNumber: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "owners",
  });

  const onSubmit = async (data) => {
    
    console.log("checkFinalData", data);
    console.log("ownersssss", data.owners);
    goNext(data);
  };

  // Track whether we've already restored data from Redux to prevent re-running
  const isRestoredRef = useRef(false);

  useEffect(() => {
    if (tenants) {
      const checkCity = tenants?.find((item) => item?.code == getCity);
      setValue("city", checkCity);
    }
  }, [tenants, getCity]);

  const ownerTypeCode = watch("ownerShip")?.code;
  const isMultiple = ownerTypeCode === "INDIVIDUAL.MULTIPLEOWNERS";

useEffect(() => {
  // Don't reset while restoring edit data
  if (isRestoredRef.current) return;

  const currentOwners = watch("owners") || [];

  // Single owner → keep first owner, don't wipe fields
  if (!isMultiple) {
    setValue("owners", [
      currentOwners[0] || {
        name: "",
        mobileNumber: "",
        emailId: "",
        address: "",
        designation: "",
        altContactNumber: "",
        gender: "",
        fatherOrHusbandName: "",
        relationship: "",
        ownerType: "",
        ownershipPercentage: "",
      },
    ]);
  }
}, [ownerTypeCode]);



  const instTypeOptions =
    SubOwnerShipCategory?.PropertyTax?.SubOwnerShipCategory?.filter((item) => item?.ownerShipCategory == watch("ownerShip")?.code) || [];

  const ownerTypesMenu = useMemo(
    () =>
      mdmsData?.PropertyTax?.OwnerType?.map?.((e) => ({
        i18nKey: `${e.code.replaceAll("PROPERTY", "COMMON_MASTERS").replaceAll(".", "_")}`,
        code: e.code,
      })) || [],
    [mdmsData]
  );

  useEffect(() => {
    if (stateDataCheck) {
      const checkOwners = owners.find((item) => item.code === stateDataCheck?.ownerShip?.code);

      setValue("ownerShip", checkOwners);
    }
  }, [stateDataCheck]);

  const ownerShip = watch("ownerShip");
  const isInstitution = ownerShip?.code === "INSTITUTIONALGOVERNMENT" || ownerShip?.code === "INSTITUTIONALPRIVATE";

useEffect(() => {
  if (!propertyAddress) return;

  const formattedAddress = buildPropertyAddress(propertyAddress);
  if (!formattedAddress) return;

  (getValues("owners") || []).forEach((owner, index) => {
    if (owner?.isSamePropertyAddress && owner?.address !== formattedAddress) {
      setValue(`owners.${index}.address`, formattedAddress);
    }
  });
}, [propertyAddress, getValues, setValue]);

useEffect(() => {
  if (!ownerShip || !stateDataCheck) return;
  if (isRestoredRef.current) return;

  setValue("institutionName", stateDataCheck?.institutionName || "");

  const instOptions =
    SubOwnerShipCategory?.PropertyTax?.SubOwnerShipCategory?.filter(
      (item) => item.ownerShipCategory === ownerShip?.code
    ) || [];

  const checkInstitutionType = instOptions.find(
    (item) =>
      item.code === stateDataCheck?.institutionType?.code ||
      item.code === stateDataCheck?.institutionType
  );

  if (checkInstitutionType) {
    setValue("institutionType", checkInstitutionType);
  }

  if (stateDataCheck?.owners?.length > 0) {
    const hasUnresolvedDoc = stateDataCheck.owners.some(
      (o) => o.docIdType?.code && !o.docIdType?.ownerTypeCode
    );

    if (hasUnresolvedDoc && ownerTypeDocuments.length === 0) return;

    remove([...Array(fields.length).keys()]);

    stateDataCheck.owners.forEach((owner) => {
      const resolvedDocIdType =
        owner.docIdType?.code && !owner.docIdType?.ownerTypeCode
          ? ownerTypeDocuments.find((d) => d.code === owner.docIdType.code) ||
            owner.docIdType
          : owner.docIdType;
      const resolvedOwnerType = ownerTypesMenu?.find(
        (menuItem) => menuItem?.code === (owner?.ownerType?.code || owner?.ownerType)
      ) || owner?.ownerType;


      append({ ...owner, ownerType: resolvedOwnerType, docIdType: resolvedDocIdType });
    });

    trigger();
  }

  // FIX
  if (instOptions.length > 0) {
    isRestoredRef.current = true;
  }
}, [ownerShip, SubOwnerShipCategory, stateDataCheck, ownerTypeDocuments]);
  return (
    <form  onSubmit={handleSubmit(onSubmit)}>
      {/* city */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("Type of Ownership")} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="ownerShip"
            rules={{ required: t("Owner Ship is Required") }}
            render={(props) => (
              <Dropdown
                select={(e) => {
                  props.onChange(e);
                  // const findData = SubOwnerShipCategory?.PropertyTax?.SubOwnerShipCategory?.filter((item) => item?.ownerShipCategory == e?.code);
                  // setInstType(findData);
                }}
                selected={props.value}
                option={owners}
                optionKey="name"
                t={t}
                disable={isEditMode}
              />
            )}
          />
          {errors.ownerShip && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.ownerShip?.message}</p>}
        </div>
      </LabelFieldPair>

      {isInstitution && (
        <React.Fragment>
          {/* Row: Institution Name + Institution Type */}
          <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {`${t("Institution Name")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="institutionName"
                defaultValue=""
                rules={{
                  required: "Institution Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    error={errors?.name?.message}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                    disable={isEditMode}
                  />
                )}
              />
              {errors?.institutionName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.institutionName.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Institution Type")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="institutionType"
                rules={{ required: t("Institution Type is Required") }}
                render={(props) => <Dropdown select={props.onChange} selected={props.value} option={instTypeOptions} optionKey="name" t={t} disable={isEditMode} />}
              />
              {errors.institutionType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.institutionType?.message}</p>}
            </div>
          </LabelFieldPair>
          </div>
        </React.Fragment>
      )}

      {ownerShip && (
        <React.Fragment>
          {fields.map((item, index) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                padding: "16px",
                marginBottom: "16px",
                borderRadius: "4px",
              }}
            >
              <CardSectionHeader>
                {t("Owner")} {index + 1}
              </CardSectionHeader>

              {/* Row: Mobile + Name */}
              <div style={twoColRow}>
                <LabelFieldPair style={colItem}>
                  <CardLabel className="card-label-smaller">{t("Mobile Number")}*</CardLabel>
                  <Controller
                    control={control}
                    name={`owners.${index}.mobileNumber`}
                    defaultValue={item?.mobileNumber || ""}
                    rules={{
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter valid number",
                      },
                    }}
                    render={(props) => <MobileNumber {...props} disable={isEditMode} />}
                  />
                  {errors?.owners?.[index]?.mobileNumber && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].mobileNumber.message}</p>
                  )}
                </LabelFieldPair>
                <LabelFieldPair style={colItem}>
                  <CardLabel className="card-label-smaller">{t("Name")}*</CardLabel>
                  <Controller
                    control={control}
                    name={`owners.${index}.name`}
                    defaultValue={item?.name || ""}
                    rules={{ required: "Name required" }}
                    render={(props) => <TextInput {...props} disable={isEditMode} />}
                  />
                  {errors?.owners?.[index]?.name && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].name.message}</p>
                  )}
                </LabelFieldPair>
              </div>

              {/* Designation + Landline Number (Institutional only) */}
              {(ownerShip?.code === "INSTITUTIONALGOVERNMENT" || ownerShip?.code === "INSTITUTIONALPRIVATE") && (
                <div style={twoColRow}>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Designation")}*</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.designation`}
                      rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
                      defaultValue={item?.designation || ""}
                      render={(props) => (
                        <TextInput
                          value={props.value}
                          onChange={(e) => props.onChange(e.target.value)}
                          disable={isEditMode}
                        />
                      )}
                    />
                    {errors?.owners?.[index]?.designation && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].designation.message}</p>
                   )}
                  </LabelFieldPair>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Landline Number")}*</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.altContactNumber`}
                      defaultValue={item?.altContactNumber || ""}
                      rules={{ 
                        required: t("CORE_COMMON_REQUIRED_ERRMSG") ,
                        validate: { 
                          pattern: (e) => (/^\d{10,11}$/.test(e) ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")) 
                        }
                      }}
                      render={(props) => (
                        <TextInput
                          value={props.value}
                          onChange={(e) => props.onChange(e.target.value)}
                          disable={isEditMode}
                        />
                      )}
                    />
                    {errors?.owners?.[index]?.altContactNumber && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].altContactNumber.message}</p>
                   )}
                  </LabelFieldPair>
                </div>
              )}

              {/* Email + Address */}
              <div style={twoColRow}>
              <LabelFieldPair style={colItem}>
                <CardLabel className="card-label-smaller">{t("Email")}</CardLabel>
                <Controller
                  control={control}
                  name={`owners.${index}.emailId`}
                  defaultValue={item?.emailId || ""}
                  rules={{
                    pattern: {
                      value: /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
                      message: "Invalid email",
                    },
                  }}
                  render={(props) => <TextInput {...props} disable={isEditMode} />}
                />
                {errors?.owners?.[index]?.emailId && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].emailId.message}</p>
                )}
              </LabelFieldPair>
              <LabelFieldPair style={colItem}>
                <CardLabel className="card-label-smaller">{t("Address")}*</CardLabel>
                <Controller
                  control={control}
                  name={`owners.${index}.address`}
                  rules={{required: t("CORE_COMMON_REQUIRED_ERRMSG")}}
                  defaultValue={item?.address || ""}
                  render={(props) => <TextInput {...props} disable={isEditMode} />}
                />
                {errors?.owners?.[index]?.address && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].address.message}</p>
                  )}
              </LabelFieldPair>
              </div>

              {/* Gender + Guardian Name (for individual owners) */}
              {(ownerShip?.code?.includes("INDIVIDUAL") || ownerShip?.code === "SINGLEOWNER") && (
                <div style={twoColRow}>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Gender")}*</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.gender`}
                      defaultValue={item?.gender || ""}
                      rules={{ required: "Gender is required" }}
                      render={(props) => (
                        <Dropdown
                          select={props.onChange}
                          selected={props.value}
                          option={[
                            { name: "Male", code: "MALE" },
                            { name: "Female", code: "FEMALE" },
                            { name: "Transgender", code: "TRANSGENDER" },
                            { name: "Others", code: "OTHERS" }
                          ]}
                          optionKey="name"
                          t={t}
                          disable={isEditMode}
                        />
                      )}
                    />
                    {errors?.owners?.[index]?.gender && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].gender.message}</p>
                    )}
                  </LabelFieldPair>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Guardian Name")}*</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.fatherOrHusbandName`}
                      defaultValue={item?.fatherOrHusbandName || ""}
                      rules={{ required: "Guardian name is required" }}
                      render={(props) => <TextInput {...props} disable={isEditMode} />}
                    />
                    {errors?.owners?.[index]?.fatherOrHusbandName && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].fatherOrHusbandName.message}</p>
                    )}
                  </LabelFieldPair>
                </div>
              )}

              {/* Relationship (for individual owners) */}
              {(ownerShip?.code?.includes("INDIVIDUAL") || ownerShip?.code === "SINGLEOWNER") && (
                <div style={twoColRow}>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Relationship")}*</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.relationship`}
                      defaultValue={item?.relationship || ""}
                      rules={{ required: "Relationship is required" }}
                      render={(props) => (
                        <Dropdown
                          select={props.onChange}
                          selected={props.value}
                          option={[
                            { name: "Father", code: "FATHER" },
                            { name: "Husband", code: "HUSBAND" }
                          ]}
                          optionKey="name"
                          t={t}
                          disable={isEditMode}
                        />
                      )}
                    />
                    {errors?.owners?.[index]?.relationship && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].relationship.message}</p>
                    )}
                  </LabelFieldPair>
                </div>
              )}

              {/* Special Category + conditional Document ID fields (for individual owners) */}
              {(ownerShip?.code?.includes("INDIVIDUAL") || ownerShip?.code === "SINGLEOWNER") && (() => {
                const ownerTypeVal = watch(`owners.${index}.ownerType`);
                const ownerTypeCode = ownerTypeVal?.code;
                const showDocFields = !!(ownerTypeCode && ownerTypeDocuments.some((d) => d.ownerTypeCode === ownerTypeCode));
                return (
                  <React.Fragment>
                    <div style={twoColRow}>
                      <LabelFieldPair style={colItem}>
                        <CardLabel className="card-label-smaller">{t("Special Category")}*</CardLabel>
                        <Controller
                          control={control}
                          name={`owners.${index}.ownerType`}
                          defaultValue={item?.ownerType || ""}
                          rules={{ required: "Special Category is required" }}
                          render={(props) => (
                            <Dropdown
                              select={(selectedType) => {
                                props.onChange(selectedType);
                                const code = selectedType?.code;
                                const matched = ownerTypeDocuments.find((d) => d.ownerTypeCode === code);
                                if (matched) {
                                  setValue(`owners.${index}.docIdType`, matched);
                                } else {
                                  setValue(`owners.${index}.docIdType`, null);
                                  setValue(`owners.${index}.docIdNo`, "");
                                }
                              }}
                              selected={props.value}
                              option={ownerTypesMenu}
                              optionKey="i18nKey"
                              t={t}
                              disable={isEditMode}
                            />
                          )}
                        />
                        {errors?.owners?.[index]?.ownerType && (
                          <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].ownerType.message}</p>
                        )}
                      </LabelFieldPair>
                    </div>
                    {showDocFields && (
                      <div style={twoColRow}>
                        <LabelFieldPair style={colItem}>
                          <CardLabel className="card-label-smaller">
                            {t("Document ID Type")} <span style={{ color: "red" }}>*</span>
                          </CardLabel>
                          <Controller
                            control={control}
                            name={`owners.${index}.docIdType`}
                            defaultValue={item?.docIdType || null}
                            rules={{ required: "Document ID Type is required" }}
                            render={(props) => (
                              <Dropdown
                                select={props.onChange}
                                selected={props.value}
                                option={ownerTypeDocuments}
                                optionKey="name"
                                t={t}
                                disable={isEditMode}
                              />
                            )}
                          />
                          {errors?.owners?.[index]?.docIdType && (
                            <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].docIdType.message}</p>
                          )}
                        </LabelFieldPair>
                        <LabelFieldPair style={colItem}>
                          <CardLabel className="card-label-smaller">
                            {t("Document ID no.")} <span style={{ color: "red" }}>*</span>
                          </CardLabel>
                          <Controller
                            control={control}
                            name={`owners.${index}.docIdNo`}
                            defaultValue={item?.docIdNo || ""}
                            rules={{ required: "Document ID no. is required" }}
                            render={(props) => (
                              <TextInput
                                value={props.value}
                                onChange={(e) => props.onChange(e.target.value)}
                                placeholder={t("Enter identification no.")}
                                disable={isEditMode}
                              />
                            )}
                          />
                          {errors?.owners?.[index]?.docIdNo && (
                            <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].docIdNo.message}</p>
                          )}
                        </LabelFieldPair>
                      </div>
                    )}
                  </React.Fragment>
                );
              })()}

              {/* Ownership Percentage (for individual owners) */}
              {(ownerShip?.code?.includes("INDIVIDUAL") || ownerShip?.code === "SINGLEOWNER") && (
                <div style={twoColRow}>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Ownership Percentage")}*</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.ownershipPercentage`}
                      defaultValue={item?.ownershipPercentage || ""}
                      rules={{
                        required: "Ownership percentage is required",
                        validate: {
                          maxHundred: (v) => !v || Number(v) <= 100 || "Ownership percentage cannot exceed 100%",
                          minZero: (v) => !v || Number(v) >= 0 || "Ownership percentage cannot be negative",
                          isNumber: (v) => !v || !isNaN(Number(v)) || "Must be a valid number",
                          checkPercentage: (v) => {
                            const ownershipType = getValues("ownerShip")?.code;
                            if (ownershipType === "SINGLEOWNER") {
                              return Number(v) === 100 || "Ownership percentage for single owner must be 100%";
                            }
                            if (ownershipType === "INDIVIDUAL.MULTIPLEOWNERS") {
                              const allOwners = getValues({ nest: true })?.owners || [];
                              const total = allOwners.reduce((sum, owner) => {
                                const val = String(owner.ownershipPercentage || "").trim();
                                const num = val ? Number(val) : 0;
                                return sum + (isNaN(num) ? 0 : num);
                              }, 0);
                              console.log("PT checkPercentage Debug:", {
                                allOwners,
                                total,
                                v,
                                isValid: total === 100
                              });
                              return total === 100 || `Sum of all ownership percentages must be 100%`;
                            }
                            return true;
                          }
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          value={props.value}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            props.onChange(val);
                            setTimeout(() => {
                              const allOwners = getValues({ nest: true })?.owners || [];
                              allOwners.forEach((_, idx) => {
                                trigger(`owners.${idx}.ownershipPercentage`);
                              });
                            }, 0);
                          }}
                          disable={isEditMode}
                          placeholder="0-100"
                        />
                      )}
                    />
                    {errors?.owners?.[index]?.ownershipPercentage && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.owners[index].ownershipPercentage.message}</p>
                    )}
                  </LabelFieldPair>
                </div>
              )}

              {/* checkBoxadress*/}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: " 20px" }}>
                <Controller
                  control={control}
                  name={`owners.${index}.isSamePropertyAddress`}
                  render={(props) => (
                    <input
                      id={`samePropAddr-${index}`}
                      type="checkbox"
                      checked={props.value || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        props.onChange(checked);
                        if (checked) {
                          const formattedAddress = buildPropertyAddress(propertyAddress);
                          if (getValues(`owners.${index}.address`) !== formattedAddress) {
                            setValue(`owners.${index}.address`, formattedAddress);
                          }
                        }
                      }}
                      style={{ width: "18px", height: "18px", cursor: isEditMode ? "not-allowed" : "pointer" }}
                      disabled={isEditMode}
                    />
                  )}
                />
                <label htmlFor={`samePropAddr-${index}`} style={{ cursor: "pointer", color: "#00bcd1", margin: 0 }}>
                  {t("Same as property address")}
                </label>
              </div>

              {/* Remove Button (only if multiple) */}
              {isMultiple && fields.length > 1 && !isEditMode && (
                <div style={{ textAlign: "right" }}>
                  <button type="button" onClick={() => remove(index)} style={{ color: "red", background: "none", border: "none" }}>
                    {t("Remove Owner")}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Button */}
          {isMultiple && !isEditMode && (
            <button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  mobileNumber: "",
                  emailId: "",
                  address: "",
                  gender: "",
                  fatherOrHusbandName: "",
                  relationship: "",
                  ownershipPercentage: "",
                  isSamePropertyAddress: false,
                })
              }
              style={{ color: "#00bcd1", background: "none", border: "none" }}
            >
              + {t("Add Owner")}
            </button>
          )}
        </React.Fragment>
      )}

      <ActionBar>
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {SubOwnerShipCategoryLoading && <Loader page={true} />}
    </form>
  );
};

export default PropertyAddressDetails;
