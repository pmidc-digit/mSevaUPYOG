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

const PropertyAddressDetails = ({ goNext }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userType = window.location.href.includes("citizen") ? "citizen" : "employee";
  const [loader, setLoader] = useState(false);
  const tenants = Digit.Hooks.pt.useTenants();
  const isCitizen = window.location.href.includes("citizen");
  const getCity = localStorage.getItem("CITIZEN.CITY");
  const apiDataCheck = useSelector((state) => state.pt.PTNewApplicationFormReducer);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [getLocality, setLocality] = useState([]);
  const [getYearCreation, setYearCreation] = useState([]);

  const { data: CreationYearData = [], isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "egf-master", [{ name: "FinancialYear" }]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm();

  const onSubmit = async (data) => {
    goNext(data);
  };

  const batchType = async (tenant) => {
    const payload = {
      tenantId: tenant,
      // boundaryType: "Locality",
    };
    Digit.LocationService.getRevenueLocalities(tenant)
      .then((response) => {
        setLocality(response?.TenantBoundary?.[0]?.boundary);
      })
      .catch((err) => {
        return err;
      });
  };

  useEffect(() => {
    if (tenantId) batchType(tenantId);
  }, [tenantId]);

  useEffect(() => {
    if (tenants) {
      const checkCity = tenants?.find((item) => item?.code == getCity);
      setValue("city", checkCity);
    }
  }, [tenants, getCity]);

  useEffect(() => {
    if (CreationYearData?.["egf-master"]?.FinancialYear) {
      const filteredData = CreationYearData?.["egf-master"]?.FinancialYear?.filter((item) => item?.module == "PT").sort(
        (a, b) => a.startingDate - b.startingDate
      ); // 🔥 ASC order;
      setYearCreation(filteredData);
    }
  }, [CreationYearData]);

  const onGISMapClickScenarioTwo = () => {
    const surveyId = watch("surveyId");
    if (surveyId) {
      const url = `https://onemap.punjab.gov.in/map.aspx?surveyid=${surveyId}&usertype=${userType}`;
      window.location.href = url;
    } else {
      alert("Please a valid a survey ID before proceeding to the GIS map.");
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      {/* Survey id */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PT_SURVEY_ID_LABEL")}</CardLabel>
        <div className="form-field" style={{ marginBottom: " 30px" }}>
          <Controller
            control={control}
            name="surveyId"
            render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
          />
          {errors.surveyId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.surveyId?.message}</p>}
          <button
            className="submit-bar"
            type="button"
            style={{ color: "white", width: "100%", maxWidth: "100px" }}
            onClick={onGISMapClickScenarioTwo}
          >
            {`${t("Survey ID Map")}`}
          </button>
        </div>
      </LabelFieldPair>

      {/* city */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PT_PROPERTY_ADDRESS_CITY")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="city"
            rules={{ required: t("City is Required") }}
            render={(props) => (
              <Dropdown select={props.onChange} selected={props.value} option={tenants} optionKey="name" t={t} disable={isCitizen} />
            )}
          />
          {errors.city && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.city?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* house shop no */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("House/ Shop No.")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="houseNo"
            render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
          />
          {errors.houseNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.houseNo?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* building colony name*/}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PT_BUILDING_COLONY_NAME")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="buildingName"
            render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
          />
          {errors.buildingName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.buildingName?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* Street name */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PT_PROPERTY_ADDRESS_STREET_NAME")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="streetName"
            render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
          />
          {errors.streetName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.streetName?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* Locality mohalla */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PT_LOCALITY_LABEL")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="locality"
            rules={{ required: t("Locality is required") }}
            render={(props) => <Dropdown select={props.onChange} selected={props.value} option={getLocality} optionKey="name" t={t} />}
          />
          {errors.locality && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.locality?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* pin code */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("CHB_PINCODE")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="pincode"
            rules={{
              pattern: {
                value: /^[1-9][0-9]{5}$/,
                message: t("PTR_PINCODE_INVALID"),
              },
            }}
            render={({ value, onChange, onBlur }) => (
              <TextInput
                value={value}
                maxlength={6}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                onBlur={(e) => {
                  onBlur(e);
                  trigger("pincode");
                }}
                t={t}
              />
            )}
          />
          {errors.pincode && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.pincode?.message}</p>}
        </div>
      </LabelFieldPair>

      {/* year of creation of property shop no */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("Year of creation of property")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="yearOfCreation"
            rules={{ required: t("Year of creation of property is required") }}
            render={(props) => (
              <Dropdown
                select={props.onChange}
                selected={props.value}
                option={getYearCreation}
                optionKey="name"
                render={(props) => <Dropdown select={props.onChange} selected={props.value} option={[]} optionKey="name" t={t} />}
              />
            )}
          />
          {errors.yearOfCreation && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.yearOfCreation?.message}</p>}
        </div>
      </LabelFieldPair>

      <ActionBar>
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {isLoading && <Loader page={true} />}
    </form>
  );
};

export default PropertyAddressDetails;
