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
import { UPDATE_PTNewApplication_FORM } from "../redux/action/PTNewApplicationActions";
import { Loader } from "../components/Loader";
import { useTranslation } from "react-i18next";

const PropertyDetails = ({ goNext, onGoBack }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const tenants = Digit.Hooks.pt.useTenants();
  const isCitizen = window.location.href.includes("citizen");
  const getCity = localStorage.getItem("CITIZEN.CITY");
  const apiDataCheck = useSelector((state) => state.pt.PTNewApplicationFormReducer?.formData);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [getPropertyTypeData, setPropertyTypeData] = useState([]);

  const { data: UsageCategoryData = [], isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [{ name: "UsageCategory" }]);

  const { data: PropertyTypeData = [], isLoading: PropertyTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "PropertyType" },
  ]);

  useEffect(() => {
    if (PropertyTypeData) {
      // {
      //   "name": "Built Up",
      //   "code": "BUILTUP",
      //   "active": true
      // },
      const checkPropertyTypeData = PropertyTypeData?.PropertyTax?.PropertyType?.filter((item) => item?.code != "BUILTUP");
      console.log("checkPropertyTypeData", checkPropertyTypeData);
      setPropertyTypeData(checkPropertyTypeData);
    }
  }, [PropertyTypeData]);

  useEffect(() => {
    console.log("apiDataCheck", apiDataCheck);
    const UsageCategoryDataFin = UsageCategoryData?.PropertyTax?.UsageCategory;
    console.log("UsageCategoryDataFin", UsageCategoryDataFin);
    console.log("apiDataCheck?.propertyAddress?.yearOfCreation?.code", apiDataCheck?.propertyAddress?.yearOfCreation?.code);

    if (apiDataCheck?.propertyAddress) {
      const checkUsageData = UsageCategoryDataFin?.filter((item) => item?.fromFY == apiDataCheck?.propertyAddress?.yearOfCreation?.code);
      console.log("checkUsageData", checkUsageData);
    }
  }, [UsageCategoryData, apiDataCheck]);

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

  const occupancyOptions = [
    { name: "Self Occupied", code: "SELFOCCUPIED" },
    { name: "Rented", code: "RENTED" },
  ];

  const onSubmit = async (data) => {
    console.log("data", data);
    goNext(data);
    return;
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Property Usage Type */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("Property Usage Type")}*</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="propertyUsageType"
            rules={{ required: t("Property Usage Type is Required") }}
            render={(props) => (
              <Dropdown
                select={props.onChange}
                selected={props.value}
                option={UsageCategoryData?.PropertyTax?.UsageCategory}
                optionKey="name"
                t={t}
              />
            )}
          />
          {errors.propertyUsageType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.propertyUsageType?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* Property Type */}
      <LabelFieldPair>
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

      {/* Business name */}
      <LabelFieldPair>
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

      {/* Remarks */}
      <LabelFieldPair>
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

      <CardSectionHeader>{t("Unit Details")}</CardSectionHeader>

      {fields.map((item, index) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #e0e0e0",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "4px",
          }}
        >
          {/* Unit Usage Type */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("Unit Usage Type")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`unitDetails.${index}.unitUsageType`}
                rules={{ required: t("Unit Usage Type is required") }}
                render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
              />
              {errors?.unitDetails?.[index]?.unitUsageType && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].unitUsageType.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* sub usage type */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("Sub Usage Type")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`unitDetails.${index}.subUsageType`}
                rules={{ required: t("Sub Usage Type is required") }}
                render={(props) => <Dropdown select={props.onChange} selected={props.value} option={occupancyOptions} optionKey="name" t={t} />}
              />
              {errors?.unitDetails?.[index]?.subUsageType && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].subUsageType.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* Occupancy */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("Occupancy")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`unitDetails.${index}.occupancy`}
                rules={{ required: t("Occupancy is required") }}
                render={(props) => <Dropdown select={props.onChange} selected={props.value} option={occupancyOptions} optionKey="name" t={t} />}
              />
              {errors?.unitDetails?.[index]?.occupancy && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].occupancy.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* Built up area */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("Built-up area (sq ft)")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`unitDetails.${index}.area`}
                rules={{ required: t("Area is required") }}
                render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
              />
              {errors?.unitDetails?.[index]?.area && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].area.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* Select Floor */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("Select Floor")}*</CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name={`unitDetails.${index}.floor`}
                rules={{ required: t("Floor is required") }}
                render={(props) => <Dropdown select={props.onChange} selected={props.value} option={occupancyOptions} optionKey="name" t={t} />}
              />
              {errors?.unitDetails?.[index]?.floor && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitDetails[index].floor.message}</p>
              )}
            </div>
          </LabelFieldPair>

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

      <ActionBar>
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {(loader || PropertyTypeLoading || isLoading) && <Loader page={true} />}
    </form>
  );
};

export default PropertyDetails;
