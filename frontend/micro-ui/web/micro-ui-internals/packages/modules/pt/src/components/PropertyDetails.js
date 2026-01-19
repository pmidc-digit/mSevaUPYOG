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

const PropertyDetails = ({ goNext }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const tenants = Digit.Hooks.pt.useTenants();
  const isCitizen = window.location.href.includes("citizen");
  const getCity = localStorage.getItem("CITIZEN.CITY");
  const apiDataCheck = useSelector((state) => state.pt.PTNewApplicationFormReducer);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

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
      {/* city */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PT_PROPERTY_ADDRESS_CITY")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="city"
            rules={{ required: t("City is Required") }}
            render={(props) => <Dropdown select={props.onChange} selected={props.value} option={[]} optionKey="name" t={t} />}
          />
          {errors.city && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.city?.message}</p>}
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
            render={(props) => <Dropdown select={props.onChange} selected={props.value} option={[]} optionKey="name" t={t} />}
          />
          {errors.locality && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.locality?.message}</p>}
        </div>
      </LabelFieldPair>

      <ActionBar>
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {loader && <Loader page={true} />}
    </form>
  );
};

export default PropertyDetails;
