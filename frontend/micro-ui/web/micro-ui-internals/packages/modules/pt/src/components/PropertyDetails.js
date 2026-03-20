import React, { useEffect, useState } from "react";
import {
  TextInput,
  CardLabel,
  Dropdown,
  ActionBar,
  SubmitBar,
  CardLabelError,
  LabelFieldPair,
  CardSectionHeader,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { UPDATE_PTNewApplication_FORM } from "../redux/action/PTNewApplicationActions";
import { Loader } from "../components/Loader";
import { useTranslation } from "react-i18next";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px", flexDirection: "column", alignItems: "stretch" };
const singleCol = { flexDirection: "column", alignItems: "stretch" };

const months = [
  { code: "1", name: "1" },
  { code: "2", name: "2" },
  { code: "3", name: "3" },
  { code: "4", name: "4" },
  { code: "5", name: "5" },
  { code: "6", name: "6" },
  { code: "7", name: "7" },
  { code: "8", name: "8" },
  { code: "9", name: "9" },
];

const floorsMan = [
  { code: "1", name: "1" },
  { code: "2", name: "2" },
  { code: "3", name: "3" },
  { code: "4", name: "4" },
  { code: "5", name: "5" },
  { code: "6", name: "6" },
  { code: "7", name: "7" },
  { code: "8", name: "8" },
  { code: "9", name: "9" },
  { code: "10", name: "10" },
  { code: "11", name: "11" },
  { code: "12", name: "12" },
  { code: "13", name: "13" },
  { code: "14", name: "14" },
  { code: "15", name: "15" },
  { code: "16", name: "16" },
  { code: "17", name: "17" },
  { code: "18", name: "18" },
  { code: "19", name: "19" },
  { code: "20", name: "20" },
  { code: "21", name: "21" },
  { code: "22", name: "22" },
  { code: "23", name: "23" },
  { code: "24", name: "24" },
  { code: "25", name: "25" },
  { code: "26", name: "26" },
  { code: "27", name: "27" },
  { code: "28", name: "28" },
  { code: "29", name: "29" },
  { code: "30", name: "30" },
];

const usageMonths = [
  { code: "UNOCCUPIED", name: "Un-Occupied" },
  { code: "SELFOCCUPIED", name: "Self Occupied" },
];

const PropertyDetails = ({ goNext, onGoBack }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const [loader, setLoader] = useState(false);
  const tenants = Digit.Hooks.pt.useTenants();
  const isCitizen = window.location.href.includes("citizen");
  const getCity = localStorage.getItem("CITIZEN.CITY");
  const stateDataCheck = useSelector((state) => state.pt.PTNewApplicationFormReducer.formData?.propertyDetails);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [getPropertyTypeData, setPropertyTypeData] = useState([]);
  const [getUsageData, setUsageData] = useState([]);
  const [getSubUsageData, setSubUsageData] = useState([]);
  const [isRestoring, setIsRestoring] = useState(false);

  console.log("stateDataCheck", stateDataCheck);

  const { data: UsageCategoryData = [], isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [{ name: "UsageCategoryMinor" }]);

  const { data: UsageCategoryDataMajor = [], isLoadingUsageCategoryMajor } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "UsageCategoryMajor" },
  ]);

  const { data: PropertyTypeData = [], isLoading: PropertyTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "PropertyType" },
  ]);

  const { data: OccupancyTypeData = [], isLoading: OccupancyTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "OccupancyType" },
  ]);

  const { data: FloorData = [], isLoading: FloorLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [{ name: "Floor" }]);

  const { data: UsageCategoryNewData = [], isLoading: UsageCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "UsageCategory" },
  ]);

  useEffect(() => {
    if (PropertyTypeData) {
      const checkPropertyTypeData = PropertyTypeData?.PropertyTax?.PropertyType?.filter((item) => item?.code != "BUILTUP");
      setPropertyTypeData(checkPropertyTypeData);
    }
  }, [PropertyTypeData]);

  console.log("location2", location?.state);

  useEffect(() => {
    const major = UsageCategoryData?.PropertyTax?.UsageCategoryMajor || [];
    const minor = UsageCategoryDataMajor?.PropertyTax?.UsageCategoryMinor || [];
    const combinedData = [...minor, ...major]?.filter((item) => item?.code != "NONRESIDENTIAL");
    setUsageData(combinedData);
  }, [UsageCategoryData, UsageCategoryDataMajor]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      unitDetails: [
        {
          unitUsageType: "",
          occupancy: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "unitDetails",
  });

  const onSubmit = async (data) => {
    goNext(data);
    // return;
  };

  const selectedPropertyType = watch("propertyType")?.code;
  const selectedpropertyUsageType = watch("propertyUsageType")?.code;
  const floorOptions = FloorData?.PropertyTax?.Floor || [];

  const tesFloorOptions = floorOptions?.sort((a, b) => {
    const aCode = Number(a.code);
    const bCode = Number(b.code);

    // If one is negative and the other is not
    if (aCode < 0 && bCode >= 0) return 1;
    if (aCode >= 0 && bCode < 0) return -1;

    // If both are positive or both are negative → sort normally
    return aCode - bCode;
  });

  console.log("tesFloorOptions", tesFloorOptions);

  useEffect(() => {
    if (location?.state || stateDataCheck) {
      setIsRestoring(true); // ✅ mark restore

      const value = location?.state;

      const getResident = getUsageData?.find((item) => item?.name == (value?.useType || stateDataCheck?.propertyUsageType?.name));

      const getPropertyType = getPropertyTypeData?.find((item) => item?.code == stateDataCheck?.propertyType?.code);
      const checkData = UsageCategoryNewData?.PropertyTax?.UsageCategory?.filter(
        (item) => item?.usageCategoryMinor == stateDataCheck?.propertyUsageType?.code
      );
      const checkFloors = floorOptions?.find((f) => f.code == stateDataCheck?.noOfFloors?.code);
      // defaultValue={floorOptions?.find((f) => f.code == item?.floor?.code || f.code == item?.floor) || null}

      setSubUsageData(checkData);
      setValue("propertyUsageType", getResident);
      setValue("propertyType", getPropertyType);
      setValue("businessName", stateDataCheck?.businessName);
      setValue("remarks", stateDataCheck?.remarks);
      setValue("flammable", stateDataCheck?.flammable);
      setValue("heightOfProperty", stateDataCheck?.heightOfProperty);
      setValue("plotSize", stateDataCheck?.plotSize);
      setValue("noOfFloors", checkFloors);

      if (stateDataCheck?.unitDetails?.length > 0) {
        remove([...Array(fields.length).keys()]);

        stateDataCheck.unitDetails.forEach((unit) => {
          append(unit);
        });

        // ✅ IMPORTANT
        trigger();
        setTimeout(() => setIsRestoring(false), 0);
      }
    }
  }, [location, getUsageData, stateDataCheck, getPropertyTypeData, UsageCategoryNewData]);

  const propertyType = watch("propertyType");

  useEffect(() => {
    if (stateDataCheck || floorOptions) {
      const checkFloors = floorsMan?.find((f) => f.code == stateDataCheck?.noOfFloors?.code);

      setValue("plotSize", stateDataCheck?.plotSize);
      setValue("noOfFloors", checkFloors);
    }
  }, [stateDataCheck, floorOptions, propertyType]);

  const selectedFloors = watch("noOfFloors")?.code;

  useEffect(() => {
    if (!selectedFloors || isRestoring) return;

    const floorCount = Number(selectedFloors);

    // Clear existing fields
    remove([...Array(fields.length).keys()]);

    const groundFloor = floorOptions?.find((f) => f.code == "0");

    const newUnits = Array.from({ length: floorCount }, (_, index) => ({
      unitUsageType: watch("propertyUsageType")?.name || "",
      occupancy: null,
      floor: index === 0 ? groundFloor : null, // ✅ First is Ground Floor
    }));

    append(newUnits);

    trigger(); // revalidate
  }, [selectedFloors]);

  return (
    <form  onSubmit={handleSubmit(onSubmit)}>
      {/* Row 1: Property Usage Type + Property Type */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Property Usage Type")}*</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="propertyUsageType"
              rules={{ required: t("Property Usage Type is Required") }}
              render={(props) => (
                <Dropdown
                  select={(e) => {
                    props.onChange(e);
                    const checkData = UsageCategoryNewData?.PropertyTax?.UsageCategory?.filter((item) => item?.usageCategoryMinor == e?.code);
                    setSubUsageData(checkData);
                  }}
                  selected={props.value}
                  option={getUsageData}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors.propertyUsageType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.propertyUsageType?.message}</p>}
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Property Type")}*</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="propertyType"
              rules={{ required: t("Property Type is required") }}
              render={(props) => <Dropdown select={props.onChange} selected={props.value} option={getPropertyTypeData} optionKey="name" t={t} />}
            />
            {errors.propertyType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.propertyType?.message}</p>}
          </div>
        </LabelFieldPair>
      </div>

      {/* Row 2: Business Name + Remarks */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Business Name")}*</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="businessName"
              rules={{ required: t("Business Name is required") }}
              render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
            />
            {errors.businessName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.businessName?.message}</p>}
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Remarks")}</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="remarks"
              render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
            />
            {errors.remarks && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.remarks?.message}</p>}
          </div>
        </LabelFieldPair>
      </div>

      {/* flammable*/}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: " 20px" }}>
        <Controller
          control={control}
          name="flammable"
          render={(props) => (
            <input
              id="flammable"
              type="checkbox"
              checked={props.value || false}
              onChange={(e) => {
                props.onChange(e.target.checked);
              }}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          )}
        />
        <label htmlFor="flammable" style={{ cursor: "pointer", color: "#00bcd1", margin: 0 }}>
          {t("Do you have any inflammable material stored in your property?")}
        </label>
      </div>

      {/* heightOfProperty*/}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <Controller
          control={control}
          name="heightOfProperty"
          render={(props) => (
            <input
              id="heightOfProperty"
              type="checkbox"
              checked={props.value || false}
              onChange={(e) => {
                props.onChange(e.target.checked);
              }}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          )}
        />
        <label htmlFor="heightOfProperty" style={{ cursor: "pointer", color: "#00bcd1", margin: 0 }}>
          {t("Height of property more than 36 feet?")}
        </label>
      </div>

      {/* Row: Plot Size + Select Floor (conditional) */}
      <div style={twoColRow}>
        {(selectedPropertyType == "BUILTUP.INDEPENDENTPROPERTY" || selectedPropertyType == "VACANT") && (
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Plot Size (sq yards)")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`plotSize`}
                rules={{ required: t("Plot Size is required") }}
                render={(props) => (
                  <TextInput
                    type={"number"}
                    value={props.value}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors.plotSize && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.plotSize?.message}</p>}
            </div>
          </LabelFieldPair>
        )}
        {selectedPropertyType == "BUILTUP.INDEPENDENTPROPERTY" && (
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Select Floor")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`noOfFloors`}
                rules={{ required: t("Floor is required") }}
                render={(props) => <Dropdown select={props.onChange} selected={props.value} option={floorsMan} optionKey="name" t={t} />}
              />
              {errors.noOfFloors && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.noOfFloors?.message}</p>}
            </div>
          </LabelFieldPair>
        )}
      </div>

      {(selectedPropertyType == "BUILTUP.SHAREDPROPERTY" || watch("noOfFloors")) && (
        <CardSectionHeader style={{ marginTop: "50px" }}>{t("Unit Details")}</CardSectionHeader>
      )}

      {(selectedPropertyType == "BUILTUP.SHAREDPROPERTY" || watch("noOfFloors")) &&
        selectedpropertyUsageType &&
        fields?.map((item, index) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #e0e0e0",
              padding: "16px",
              marginBottom: "16px",
              borderRadius: "4px",
            }}
          >
            {/* Row 1: Unit Usage Type + Sub Usage Type */}
            <div style={twoColRow}>
            <LabelFieldPair style={colItem}>
              <CardLabel className="card-label-smaller">{t("Unit Usage Type")}*</CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`unitDetails.${index}.unitUsageType`}
                  defaultValue={item?.unitUsageType || watch("propertyUsageType")?.name || ""}
                  rules={{ required: t("Unit Usage Type is required") }}
                  // defaultValue={watch("propertyUsageType")?.name}
                  render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} disabled={true} />}
                />
                {errors?.unitDetails?.[index]?.unitUsageType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].unitUsageType.message}</p>
                )}
              </div>
            </LabelFieldPair>
            <LabelFieldPair style={colItem}>
              <CardLabel className="card-label-smaller">{t("Sub Usage Type")}*</CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`unitDetails.${index}.subUsageType`}
                  defaultValue={getSubUsageData?.find((s) => s.code === item?.subUsageType?.code || s.code === item?.subUsageType) || null}
                  rules={{ required: t("Sub Usage Type is required") }}
                  render={(props) => <Dropdown select={props.onChange} selected={props.value} option={getSubUsageData} optionKey="name" t={t} />}
                />
                {errors?.unitDetails?.[index]?.subUsageType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].subUsageType.message}</p>
                )}
              </div>
            </LabelFieldPair>
            </div>

            {/* Row 2: Occupancy + Built-up area */}
            <div style={twoColRow}>
            <LabelFieldPair style={colItem}>
              <CardLabel className="card-label-smaller">{t("Occupancy")}*</CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`unitDetails.${index}.occupancy`}
                  defaultValue={
                    OccupancyTypeData?.PropertyTax?.OccupancyType?.find((o) => o.code === item?.occupancy?.code || o.code === item?.occupancy) || null
                  }
                  rules={{ required: t("Occupancy is required") }}
                  render={(props) => (
                    <Dropdown select={props.onChange} selected={props.value} option={FloorData?.PropertyTax?.OccupancyType} optionKey="name" t={t} />
                  )}
                />
                {errors?.unitDetails?.[index]?.occupancy && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].occupancy.message}</p>
                )}
              </div>
            </LabelFieldPair>
            <LabelFieldPair style={colItem}>
              <CardLabel className="card-label-smaller">{t("Built-up area (sq ft)")}*</CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`unitDetails.${index}.area`}
                  defaultValue={item?.area || ""}
                  rules={{ required: t("Area is required") }}
                  render={(props) => (
                    <TextInput
                      type={"number"}
                      value={props.value}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                    />
                  )}
                />
                {errors?.unitDetails?.[index]?.area && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].area.message}</p>
                )}
              </div>
            </LabelFieldPair>
            </div>

            {/* Select Floor + Usage for Pending Months */}
            {/* {selectedPropertyType != "VACANT" && ( */}
            <div style={twoColRow}>
            <LabelFieldPair style={colItem}>
              <CardLabel className="card-label-smaller">{t("Select Floor")}*</CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`unitDetails.${index}.floor`}
                  rules={{ required: t("Floor is required") }}
                  defaultValue={floorOptions?.find((f) => f.code == item?.floor?.code || f.code == item?.floor) || null}
                  // defaultValue={item?.floor || ""}
                  render={(props) => <Dropdown select={props.onChange} selected={props.value} option={tesFloorOptions} optionKey="name" t={t} />}
                />
                {errors?.unitDetails?.[index]?.floor && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].floor.message}</p>
                )}
              </div>
            </LabelFieldPair>
            {/* )} */}

            {/* Total rent collected + Months on Rent */}
            {(watch(`unitDetails.${index}.occupancy`)?.code == "PG" || watch(`unitDetails.${index}.occupancy`)?.code == "RENTED") && (
              <div style={twoColRow}>
              <LabelFieldPair style={colItem}>
                <CardLabel className="card-label-smaller">{t("Total Rent Collected")}*</CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={`unitDetails.${index}.totalRent`}
                    defaultValue={item?.totalRent || ""}
                    rules={{ required: t("Total Rent is required") }}
                    render={(props) => (
                      <TextInput
                        type={"number"}
                        value={props.value}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                          }
                        }}
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
                  {errors?.unitDetails?.[index]?.totalRent && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].totalRent.message}</p>
                  )}
                </div>
              </LabelFieldPair>
              <LabelFieldPair style={colItem}>
                <CardLabel className="card-label-smaller">{t("Months on Rent")}*</CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={`unitDetails.${index}.rentMonths`}
                    defaultValue={months?.find((m) => m.code === item?.rentMonths?.code || m.code === item?.rentMonths) || null}
                    rules={{ required: t("This field is required") }}
                    render={(props) => <Dropdown select={props.onChange} selected={props.value} option={months} optionKey="name" t={t} />}
                  />
                  {errors?.unitDetails?.[index]?.rentMonths && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].rentMonths.message}</p>
                  )}
                </div>
              </LabelFieldPair>
              </div>
            )}
            {(watch(`unitDetails.${index}.occupancy`)?.code == "PG" || watch(`unitDetails.${index}.occupancy`)?.code == "RENTED") && (
              <LabelFieldPair style={colItem}>
                <CardLabel className="card-label-smaller">{t("Usage for Pending Months")}*</CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={`unitDetails.${index}.pendingUsageMonths`}
                    defaultValue={usageMonths?.find((u) => u.code === item?.pendingUsageMonths?.code || u.code === item?.pendingUsageMonths) || null}
                    rules={{ required: t("This field is required") }}
                    render={(props) => <Dropdown select={props.onChange} selected={props.value} option={usageMonths} optionKey="name" t={t} />}
                  />
                  {errors?.unitDetails?.[index]?.pendingUsageMonths && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].pendingUsageMonths.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            )}
            {!(watch(`unitDetails.${index}.occupancy`)?.code == "PG" || watch(`unitDetails.${index}.occupancy`)?.code == "RENTED") && (
              <div style={colItem} />
            )}
            </div>

            {/* Remove button */}
            {fields.length > 1 && (
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d32f2f",
                    cursor: "pointer",
                  }}
                >
                  {t("Remove")}
                </button>
              </div>
            )}
          </div>
        ))}

      {/* Add more */}
      {selectedPropertyType == "BUILTUP.SHAREDPROPERTY" && (
        <button
          type="button"
          onClick={() =>
            append({
              unitUsageType: "",
              occupancy: null,
            })
          }
          style={{
            background: "none",
            border: "none",
            color: "#00bcd1",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          + {t("Add another unit")}
        </button>
      )}

      <ActionBar>
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {(UsageCategoryLoading ||
        loader ||
        PropertyTypeLoading ||
        isLoading ||
        isLoadingUsageCategoryMajor ||
        FloorLoading ||
        OccupancyTypeLoading) && <Loader page={true} />}
    </form>
  );
};

export default PropertyDetails;
