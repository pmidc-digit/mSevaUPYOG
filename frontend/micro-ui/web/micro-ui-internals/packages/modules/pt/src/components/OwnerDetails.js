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

      append({ ...owner, docIdType: resolvedDocIdType });
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
                    <CardLabel className="card-label-smaller">{t("Designation")}</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.designation`}
                      defaultValue={item?.designation || ""}
                      render={(props) => (
                        <TextInput
                          value={props.value}
                          onChange={(e) => props.onChange(e.target.value)}
                          disable={isEditMode}
                        />
                      )}
                    />
                  </LabelFieldPair>
                  <LabelFieldPair style={colItem}>
                    <CardLabel className="card-label-smaller">{t("Landline Number")}</CardLabel>
                    <Controller
                      control={control}
                      name={`owners.${index}.altContactNumber`}
                      defaultValue={item?.altContactNumber || ""}
                      render={(props) => (
                        <TextInput
                          value={props.value}
                          onChange={(e) => props.onChange(e.target.value)}
                          disable={isEditMode}
                        />
                      )}
                    />
                  </LabelFieldPair>
                </div>
              )}

              {/* Email + Address */}
              <div style={twoColRow}>
              <LabelFieldPair style={colItem}>
                <CardLabel className="card-label-smaller">{t("Email")}*</CardLabel>
                <Controller
                  control={control}
                  name={`owners.${index}.emailId`}
                  defaultValue={item?.emailId || ""}
                  rules={{
                    required: "Email required",
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
                <CardLabel className="card-label-smaller">{t("Address")}</CardLabel>
                <Controller
                  control={control}
                  name={`owners.${index}.address`}
                  defaultValue={item?.address || ""}
                  render={(props) => <TextInput {...props} />}
                />
              </LabelFieldPair>
              </div>

              {/* checkBoxadress*/}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: " 20px" }}>
                <Controller
                  control={control}
                  name={`owners.${index}.checkBoxadress`}
                  render={(props) => (
                    <input
                      id={`flammable-${index}`}
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
                <label htmlFor={`flammable-${index}`} style={{ cursor: "pointer", color: "#00bcd1", margin: 0 }}>
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
