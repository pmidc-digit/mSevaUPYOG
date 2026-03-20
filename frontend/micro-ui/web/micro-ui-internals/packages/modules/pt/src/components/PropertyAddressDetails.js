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
import { useLocation } from "react-router-dom";
import { UPDATE_PTNewApplication_FORM } from "../redux/action/PTNewApplicationActions";
import { Loader } from "../components/Loader";
import { useTranslation } from "react-i18next";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px", flexDirection: "column", alignItems: "stretch" };

const PropertyAddressDetails = ({ goNext }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation();
  const userType = window.location.href.includes("citizen") ? "citizen" : "employee";
  const [loader, setLoader] = useState(false);
  const tenants = Digit.Hooks.pt.useTenants();
  const isCitizen = window.location.href.includes("citizen");
  const getCity = localStorage.getItem("CITIZEN.CITY");
  const stateDataCheck = useSelector((state) => state.pt.PTNewApplicationFormReducer.formData?.propertyAddress);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [getLocality, setLocality] = useState([]);
  const [getYearCreation, setYearCreation] = useState([]);

  const { data: CreationYearData = [], isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "egf-master", [{ name: "FinancialYear" }]);

  console.log("location1", location?.state);

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

  useEffect(() => {
    console.log("stateDataCheck", stateDataCheck);
    if (location?.state || stateDataCheck) {
      const value = location?.state;
      const checkSurveyId = value?.surveyId || stateDataCheck?.surveyId;
      const checkHouseNo = value?.flatNo || stateDataCheck?.houseNo;
      const checkBuildingName = value?.buildingName || stateDataCheck?.buildingName;
      const checkLocality = getLocality?.find((item) => item?.code == stateDataCheck?.locality?.code);
      console.log("checkLocality", checkLocality);
      console.log("getLocality", getLocality);
      const checkYearOfCreation = getYearCreation?.find((item) => item?.code == stateDataCheck?.yearOfCreation?.code);
      setValue("surveyId", checkSurveyId);
      setValue("houseNo", checkHouseNo);
      setValue("buildingName", checkBuildingName);
      setValue("streetName", stateDataCheck?.streetName);
      setValue("pincode", stateDataCheck?.pincode);
      setValue("locality", checkLocality);
      setValue("yearOfCreation", checkYearOfCreation);
    }
  }, [location, stateDataCheck, getLocality, getYearCreation]);

  return (
    <form  onSubmit={handleSubmit(onSubmit)}>
      {/* Survey id - full width due to button */}
      <div style={twoColRow}>
      <LabelFieldPair style={colItem}>
        <CardLabel className="card-label-smaller">{t("PT_SURVEY_ID_LABEL")}</CardLabel>
        <div className="form-field" style={{ marginBottom: " 30px" }}>
          <Controller
            control={control}
            name="surveyId"
            render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} t={t} />}
          />
          {errors.surveyId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.surveyId?.message}</p>}
        </div>
      </LabelFieldPair>
      <div style={colItem}>
          <button
            className="submit-bar"
            type="button"
            style={{ color: "white", width: "100%", maxWidth: "100px" }}
            onClick={onGISMapClickScenarioTwo}
          >
            {`${t("Survey ID Map")}`}
          </button>
          </div>
      </div>
      {/* Row 1: City + House/Shop No */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
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
        <LabelFieldPair style={colItem}>
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
      </div>

      {/* Row 2: Building/Colony Name + Street Name */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
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
        <LabelFieldPair style={colItem}>
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
      </div>

      {/* Row 3: Locality/Mohalla + Pincode */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
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
        <LabelFieldPair style={colItem}>
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
      </div>
    <div style={twoColRow}>
      {/* year of creation of property shop no */}
      <LabelFieldPair style={colItem}>
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
      <div style={colItem}></div>
      </div>

      <ActionBar>
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {isLoading && <Loader page={true} />}
    </form>
  );
};

export default PropertyAddressDetails;
