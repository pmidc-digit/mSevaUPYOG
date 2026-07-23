import React, { useEffect, useState, useMemo } from "react";
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
import {deduplicateUsageOptions} from "../utils";

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
  { code: "10", name: "10" },
  { code: "11", name: "11" },
  { code: "12", name: "12" },
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
  const surveyData = useSelector((state) => state.pt.PTNewApplicationFormReducer.formData?.propertyAddress?.surveyData);
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
    { name: "UsageCategorySubMinor" },
    { name: "UsageCategoryDetail" }
  ]);



  useEffect(() => {
    if (PropertyTypeData) {
      const checkPropertyTypeData = PropertyTypeData?.PropertyTax?.PropertyType?.filter((item) => item?.code != "BUILTUP");
      setPropertyTypeData(checkPropertyTypeData);
    }
  }, [PropertyTypeData]);

  console.log("location2", location?.state);

  useEffect(() => {
    // const major = UsageCategoryData?.PropertyTax?.UsageCategoryMajor || [];
    // const minor = UsageCategoryDataMajor?.PropertyTax?.UsageCategoryMinor || [];
    const minor = UsageCategoryData?.PropertyTax?.UsageCategoryMinor || [];
    const major = UsageCategoryDataMajor?.PropertyTax?.UsageCategoryMajor || [];
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

  const { fields, append, remove, insert  } = useFieldArray({
    control,
    name: "unitDetails",
  });
  const buildFullUsageCode = (code, subMinor, detail) => {
    if (!code || code.includes(".")) return code;
    const d = detail?.find((x) => x.code === code);
    const sm = subMinor?.find((x) => x.code === (d?.usageCategorySubMinor ?? code));
    return sm ? `NONRESIDENTIAL.${sm.usageCategoryMinor}.${sm.code}${d ? `.${code}` : ""}` : code;
};

  // Resolves a stored full code ("NONRESIDENTIAL.COMMERCIAL.RETAIL.MALLS") back to its MDMS object ({ code: "MALLS", name: "Malls" })
  const resolveSubUsageType = (sub) => {
    if (!sub) return null;
    const leafCode = (sub?.code || sub)?.split(".").pop();
    const { subMinor = [], detail = [] } = allUsageOptions;
    return [...detail, ...subMinor]?.find((o) => o?.code === leafCode) || sub;
  };

  const onSubmit = async (data) => {
    if (data?.vasikaDate && data?.allotmentDate && new Date(data?.allotmentDate) < new Date(data?.vasikaDate)) {
      alert(t("PT_ALLOTMENT_DATE_ERROR"));
      return;
    }
    if (data?.propertyType?.code === "BUILTUP.INDEPENDENTPROPERTY") {
      const hasGroundFloor = data?.unitDetails?.some((unit) => unit?.floor?.code === "0" || unit?.floor === "0");
      if (!hasGroundFloor) {
        alert(t("An Independent Property must include a Ground Floor."));
        return;
      }
    }
    const { subMinor, detail } = allUsageOptions;
    goNext({
      ...data,
    unitDetails: data?.unitDetails?.map((unit) => ({
      ...unit,
      ...(unit?.subUsageType?.code && {
        subUsageType: { ...unit.subUsageType, code: buildFullUsageCode(unit.subUsageType.code, subMinor, detail) },
      }),
    })),
   });
    // return;
  };

  const selectedPropertyType = watch("propertyType")?.code;
  const selectedpropertyUsageType = watch("propertyUsageType")?.code;
  console.log("selectedpropertyUsageType", watch("propertyUsageType")?.name);
  console.log("selectedPropertyType", selectedPropertyType);
  const isBusinessNameRequired = selectedPropertyType && selectedpropertyUsageType && (selectedpropertyUsageType !== "RESIDENTIAL" && selectedPropertyType !== "VACANT")
  const selectedFloors = watch("noOfFloors")?.code;
  const isResidentialFlat = selectedpropertyUsageType === "RESIDENTIAL" && selectedPropertyType === "BUILTUP.SHAREDPROPERTY";
  const hideSubUsageType =
    isResidentialFlat ||
    (selectedpropertyUsageType === "RESIDENTIAL" &&
      selectedPropertyType === "BUILTUP.INDEPENDENTPROPERTY");
      
  const allUsageOptions = useMemo(() => {
      return {
        subMinor: UsageCategoryNewData?.PropertyTax?.UsageCategorySubMinor || [],
        detail: UsageCategoryNewData?.PropertyTax?.UsageCategoryDetail || []
      };
    }, [UsageCategoryNewData]);  
  const today = new Date().toISOString().split("T")[0];

  // Memoize floorOptions to prevent new [] reference each render (was causing infinite loop)
  const floorOptionsRaw = FloorData?.PropertyTax?.Floor;
  const floorOptions = useMemo(() => floorOptionsRaw || [], [floorOptionsRaw]);

  const getFloorTotalSqFt = (unitDetails, index, currentValue) => {
    const floorCode = unitDetails[index]?.floor?.code || unitDetails[index]?.floor;
    const getFloor = (unit) => unit?.floor?.code || unit?.floor;
    const othersSqFt = unitDetails?.reduce((sum, unit, idx) => {
      if (idx === index || getFloor(unit) !== floorCode) return sum;
      return sum + parseFloat(unit?.area || 0);
    }, 0);
    return { totalSqFt: othersSqFt + parseFloat(currentValue || 0), othersSqFt };
};

  const getUsageOptionsByCode = (usageCode) => {
      if (!usageCode) return [];
      const { subMinor = [], detail = [] } = allUsageOptions;
      if (usageCode === "MIXED") return deduplicateUsageOptions(subMinor);

      // 1. Get sub-minors matching this minor category (e.g. COMMERCIAL)
      const filteredSubMinors = subMinor?.filter((sm) => sm?.usageCategoryMinor === usageCode);

      // 2. Filter details under these sub-minors (e.g., MALLS, Pharmacy)
      const filteredDetails = detail?.filter((d) => filteredSubMinors?.some((sm) => sm.code === d.usageCategorySubMinor));

      // 3. Exclude parent sub-minors if they have child details in the master list
      const finalSubMinors = filteredSubMinors?.filter((sm) => !detail?.some((d) => d.usageCategorySubMinor === sm.code));

    return deduplicateUsageOptions([...finalSubMinors, ...filteredDetails]);
  };




  const tesFloorOptions = useMemo(() => {
    return [...floorOptions]?.sort((a, b) => {
      return Number(a?.code) - Number(b?.code);
    });
  }, [floorOptions]);

  useEffect(() => {
    if (!(location?.state || stateDataCheck)) return;
    if (!getUsageData?.length || !getPropertyTypeData?.length || !allUsageOptions?.subMinor?.length) return; // wait for MDMS

    setIsRestoring(true);

    const value = location?.state;

    const storedUsageCode = stateDataCheck?.propertyUsageType?.code;
    const getResident = getUsageData?.find((item) =>
      item?.code == storedUsageCode
      || item?.code == storedUsageCode?.split(".")?.[1]
      || item?.name == (value?.useType || stateDataCheck?.propertyUsageType?.name)
    );

    const getPropertyType = getPropertyTypeData?.find((item) => item?.code == stateDataCheck?.propertyType?.code);
    // Use the resolved MDMS minor code (e.g. "INDUSTRIAL") so the filter matches segments in sub-usage codes
    var restoredCode = (getResident && getResident.code) || (stateDataCheck && stateDataCheck.propertyUsageType && stateDataCheck.propertyUsageType.code);
    var checkData = getUsageOptionsByCode(restoredCode);
    const checkFloors = floorOptions?.find((f) => f.code == stateDataCheck?.noOfFloors?.code);

    setSubUsageData(checkData);
    setValue("propertyUsageType", getResident);
    setValue("propertyType", getPropertyType);
    setValue("businessName", stateDataCheck?.businessName);
    setValue("remarks", stateDataCheck?.remarks);
    setValue("flammable", stateDataCheck?.flammable);
    setValue("heightOfProperty", stateDataCheck?.heightOfProperty);
    setValue("plotSize", stateDataCheck?.plotSize);
    setValue("noOfFloors", checkFloors);
    setValue("vasikaNo", stateDataCheck?.vasikaNo || "");
    setValue("vasikaDate", stateDataCheck?.vasikaDate || "");
    setValue("allotmentNo", stateDataCheck?.allotmentNo || "");
    setValue("allotmentDate", stateDataCheck?.allotmentDate || "");

    if (stateDataCheck?.unitDetails?.length > 0) {
      remove([...Array(fields.length).keys()]);

      stateDataCheck.unitDetails.forEach((unit) => {
        append({
          ...unit,
          subUsageType: resolveSubUsageType(unit?.subUsageType) || null,
        });
      });

      trigger();
    }
    setTimeout(() => setIsRestoring(false), 0);
  }, [location, getUsageData, stateDataCheck, getPropertyTypeData, allUsageOptions, floorOptions]);

  const propertyType = watch("propertyType");

  useEffect(() => {
    if (surveyData) {
      if (surveyData?.useType && !watch("propertyUsageType")) {
        const matchingUsage = getUsageData?.find(
          (u) => u.name.toLowerCase() === surveyData?.useType.toLowerCase()
        );
        if (matchingUsage) setValue("propertyUsageType", matchingUsage);
      }

      if (surveyData.floor && !watch("noOfFloors")) {
        const floorCount = surveyData?.floor === "G+1" ? "2" : "1";
        const matchingFloor = tesFloorOptions?.find((f) => f.code === floorCount);
        if (matchingFloor) setValue("noOfFloors", matchingFloor);
      }

      if (surveyData.area) {
        setValue("unitDetails.0.area", surveyData.area);
      }
    }
  }, [surveyData, getUsageData, tesFloorOptions]);

  useEffect(() => {
    if (!stateDataCheck || !propertyType) return;
    const checkFloors = floorsMan?.find((f) => f.code == stateDataCheck?.noOfFloors?.code);

    setValue("plotSize", stateDataCheck?.plotSize);
    setValue("noOfFloors", checkFloors);
  }, [stateDataCheck, propertyType]);

  useEffect(() => {
  if (!selectedFloors || isRestoring) return;

  const floorCount = Number(selectedFloors);
  const groundFloor = floorOptions?.find((f) => f.code == "0");
  const baseUnits = fields?.map((f, i) => ({ ...f, _idx: i }))?.filter(f => !f?.isAddedUnit);
  const currentCount = baseUnits?.length;

  if (floorCount > currentCount) {
    append(Array.from({ length: floorCount - currentCount }, (_, i) => ({
      unitUsageType: (watch("propertyUsageType")?.name === "Mixed" && watch("propertyType")?.code === "BUILTUP.SHAREDPROPERTY")
        ? "" : watch("propertyUsageType")?.code || "",
      occupancy: null,
      floor: (currentCount + i) === 0 ? groundFloor : null,
    })));
  } else if (floorCount < currentCount) {
    const firstToRemove = baseUnits[floorCount]?._idx;
    if (firstToRemove !== undefined) {
      remove(Array.from({ length: fields?.length - firstToRemove }, (_, i) => fields?.length - 1 - i));
    }
  }

}, [selectedFloors]);


  const vasikaDateWatch = watch("vasikaDate");
  useEffect(() => {
    if (vasikaDateWatch && watch("allotmentDate")) {
      trigger("allotmentDate");
    }
  }, [vasikaDateWatch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                    var selectedCode = e && e.code;
                    var checkData = getUsageOptionsByCode(selectedCode);
                    setSubUsageData(checkData);
                    fields?.forEach((_, idx) => {
                      setValue(`unitDetails.${idx}.unitUsageType`, selectedCode === "MIXED" ? "" : e);
                      setValue(`unitDetails.${idx}.subUsageType`, null);
                    });
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
              render={(props) => <Dropdown select={(val)=>{
                if(watch("propertyType") && watch("propertyType")?.code !== val?.code && watch("unitDetails")?.length > 1){
                  if(window.confirm(t("Do you want to clear all the added units?"))){  
                    setValue("unitDetails", [{ unitUsageType: "", occupancy: null }]);
                  } else {
                    return;
                  }
                } 
                props?.onChange(val); 
              }} 
              selected={props.value} 
              option={getPropertyTypeData} 
              optionKey="name" 
              t={t} 
              />
            }
            />
            {errors.propertyType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.propertyType?.message}</p>}
          </div>
        </LabelFieldPair>
      </div>

      {/* Row: Vasika No + Vasika Date */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Vasika No")}</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="vasikaNo"
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />
              )}
            />
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Vasika Date")}</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="vasikaDate"
              render={(props) => (
                <TextInput
                  type="date"
                  value={props.value}
                  max={today}
                  onChange={(e) => props.onChange(e.target.value)}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
      </div>

      {/* Row: Allotment No + Allotment Date */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Allotment No")}</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="allotmentNo"
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />
              )}
            />
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Allotment Date")}</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="allotmentDate"
              render={(props) => (
                <TextInput
                  type="date"
                  value={props.value}
                  max={today}
                  onChange={(e) => props.onChange(e.target.value)}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
      </div>

      {/* Row 2: Business Name + Remarks */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Business Name")}{isBusinessNameRequired && '*'}</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="businessName"
              rules={{ required: isBusinessNameRequired ? t("Business Name is required") : false }}
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
                rules={{
                  required: t("Plot Size is required"),
                  validate: (value) => parseFloat(value) >= 1.0 || t("Land Area cannot be lesser than minimum value : 1.0 sq yard")
                }}
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
              marginLeft: item.isAddedUnit ? "40px" : "0px",
              borderLeft: item.isAddedUnit ? "4px solid #F47738" : "1px solid #e0e0e0",
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
                    defaultValue={
                      (watch("propertyUsageType") && watch("propertyUsageType").code === "MIXED")
                        ? (item && item.unitUsageType) || ""
                        : (item && item.unitUsageType) || (watch("propertyUsageType") && watch("propertyUsageType").code) || ""
                    }
                    rules={{ required: t("Unit Usage Type is required") }}
                    render={function (props) {
                      if (
                        (selectedpropertyUsageType &&
                        selectedpropertyUsageType === "MIXED")
                      ) {
                        // Show dropdown — look up full MDMS object so Dropdown can display name correctly
                        return (
                          <Dropdown
                            select={(val) => {
                              props.onChange(val);
                              setValue(`unitDetails.${index}.subUsageType`, null);
                            }}
                            selected={getUsageData?.find((u) => u.code === (props.value?.code || props.value)) || props.value}
                            option={getUsageData?.filter((o) => o.code !== "MIXED")}
                            optionKey="name"
                            t={t}
                          />
                        );
                      } else {
                        // Show disabled input — display the resolved usage name, not the raw stored code
                        return (
                          <TextInput
                            value={watch("propertyUsageType")?.name || props.value}
                            onChange={function (e) { props.onChange(e.target.value); }}
                            t={t}
                            disabled={true}
                          />
                        );
                      }
                    }}
                  />


                  {errors?.unitDetails?.[index]?.unitUsageType && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].unitUsageType.message}</p>
                  )}
                </div>
              </LabelFieldPair>
              {(!hideSubUsageType && (watch(`unitDetails.${index}.unitUsageType`)?.code !== "RESIDENTIAL" && watch(`unitDetails.${index}.unitUsageType`) !== "RESIDENTIAL")) && 
               (
                <LabelFieldPair style={colItem}>
                  <CardLabel className="card-label-smaller">{t("Sub Usage Type")}*</CardLabel>
                  <div className="form-field">
                    <Controller
                      control={control}
                      name={`unitDetails.${index}.subUsageType`}
                      defaultValue={item?.subUsageType || null}
                      rules={{ required: t("Sub Usage Type is required") }}
                      render={(props) => {
                        var unitUsageVal = watch("unitDetails." + index + ".unitUsageType");
                        var unitCode = unitUsageVal && typeof unitUsageVal === "object" ? unitUsageVal.code : unitUsageVal;
                        console.log(unitCode, "unitCode");
                        
                        var rowOptions = unitCode
                          ? getUsageOptionsByCode(unitCode)
                          : getSubUsageData;
                        console.log("rowOptions", rowOptions)
                        var selectedCode = props.value?.code || props.value;
                        var selectedValue = rowOptions?.find((o) => o.code === selectedCode) || props.value;
                        // Look up full MDMS object so Dropdown can display name correctly
                        return <Dropdown key={unitCode} select={props.onChange} selected={selectedValue} option={rowOptions} optionKey="name" t={t} />;
                      }}
                    />
                    {errors?.unitDetails?.[index]?.subUsageType && (
                      <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].subUsageType.message}</p>
                    )}
                  </div>
                </LabelFieldPair>
              )}
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
                <CardLabel className="card-label-smaller">{isResidentialFlat ? t("Total Super Built-up Area (sq ft)") : t("Built-up area (sq ft)")}*</CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={`unitDetails.${index}.area`}
                    defaultValue={item?.area || ""}
                    rules={{
                      required: t("Area is required"),
                      validate: {
                        minArea: (value) => parseFloat(value) >= 1 || t("BuiltUpArea cannot be lesser than minimum values of : 1 sq ft"),
                        lessThanPlotSize: (value) => {
                          const plotSize = watch("plotSize");
                          if (!plotSize) return true;
                          const { totalSqFt, othersSqFt } = getFloorTotalSqFt(watch("unitDetails") || [], index, value);
                          const totalYard = totalSqFt / 9;
                          if (othersSqFt / 9 <= parseFloat(plotSize) && totalYard > parseFloat(plotSize)) {
                            return `Floor cumulative area (${totalSqFt} sq ft = ${totalYard.toFixed(2)} Yards) cannot exceed plot size (${plotSize} Yards)`;
                          }
                          return true;
                        }
                      }
                    }}
                    render={(props) => (
                      <TextInput
                        type={"text"}
                        value={props.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            props.onChange(val);
                          }
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
                    defaultValue={floorOptions?.find((f) => f.code == item?.floor?.code || f.code == item?.floor) || (index === 0 ? tesFloorOptions?.find(f => f?.code === "0")  : null)}
                    // defaultValue={item?.floor || ""}
                    render={(props) => {
                      // const isLockedGroundFloorUnit =
                      //   selectedPropertyType === "BUILTUP.INDEPENDENTPROPERTY" &&
                      //   index === 0 &&
                      //   (props.value?.code === "0" || props.value === "0");

                      return (
                        <Dropdown
                          select={(val) => {
                            props.onChange(val);
                            // Propagate floor change to all consecutive sub-units that follow this base unit
                            let nextIdx = index + 1;
                            while (nextIdx < fields?.length && fields[nextIdx]?.isAddedUnit) {
                              setValue(`unitDetails.${nextIdx}.floor`, val);
                              nextIdx++;
                            }
                          }}
                          selected={props.value}
                          option={
                            index === 0 || item?.isAddedUnit || selectedPropertyType === "BUILTUP.SHAREDPROPERTY"
                              ? tesFloorOptions
                              : tesFloorOptions?.filter((f) => {
                                  const previousFloorCode = watch(`unitDetails.${index - 1}.floor`)?.code;
                                  return !previousFloorCode || f?.code !== previousFloorCode;
                                })
                          }
                          optionKey="name"
                          t={t}
                          disable={ item?.isAddedUnit}
                        />
                      );
                    }}
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
            <div className="pt-application-download-btn primary-label-btn">
              
              {/* Add Unit Button (For Independent Property) */}
              {selectedPropertyType === "BUILTUP.INDEPENDENTPROPERTY" && watch(`unitDetails.${index}.floor`) && (
                <button
                  type="button"
                  onClick={() => {
                    insert(index + 1,{
                      unitUsageType: watch(`unitDetails.${index}.unitUsageType`),
                      occupancy: null,
                      floor: watch(`unitDetails.${index}.floor`),
                      area: "",
                      subUsageType: null,
                      isAddedUnit: true
                    });
                  }}
                  className="download-button"
                >
                  + {t("Add Unit to this Floor")}
                </button>
              )}
              {fields?.length > 1 && !isResidentialFlat && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="download-button"
                >
                  - {t("Remove Unit")}
                </button>
              )}
            </div>
          </div>
        ))}

      {/* Add more */}
      {selectedPropertyType == "BUILTUP.SHAREDPROPERTY" && !isResidentialFlat && (
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
