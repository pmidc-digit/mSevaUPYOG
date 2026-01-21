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
import { Controller, useForm } from "react-hook-form";
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

  const { data: UsageCategoryData = [], isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [{ name: "UsageCategory" }]);

  const { data: PropertyTypeData = [], isLoading: PropertyTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [
    { name: "PropertyType" },
  ]);

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
  } = useForm();

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
            render={(props) => (
              <Dropdown select={props.onChange} selected={props.value} option={PropertyTypeData?.PropertyTax?.PropertyType} optionKey="name" t={t} />
            )}
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

      <ActionBar>
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {(loader || PropertyTypeLoading || isLoading) && <Loader page={true} />}
    </form>
  );
};

export default PropertyDetails;
