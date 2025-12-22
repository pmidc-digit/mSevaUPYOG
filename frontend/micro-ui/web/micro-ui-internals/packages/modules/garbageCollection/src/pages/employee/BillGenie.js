import React, { useState } from "react";
import { CardLabel, ActionBar, SubmitBar, CardSubHeader, Dropdown, MobileNumber, TextInput } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "../../components/Loader";

const BillGenie = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const [loader, setLoader] = useState(false);
  const [getData, setData] = useState();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    watch,
    clearErrors,
  } = useForm();

  const onSubmit = async (data) => {
    console.log("data===", data);
  };

  return (
    <React.Fragment>
      <CardSubHeader style={{ fontSize: "24px", margin: "30px 0 40px" }}>{t("ACTION_TEST_GARBAGE_COLLECTION_BILL_GENIE")}</CardSubHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* ULB */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("ULB")}`}</CardLabel>
            <Controller
              control={control}
              name={"locality"}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0, width: "100%" }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={[]}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors?.locality && <p style={{ color: "red" }}>{errors.locality.message}</p>}
          </div>

          {/*Service Category */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("Service Category")}`}</CardLabel>
            <Controller
              control={control}
              name={"locality"}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0, width: "100%" }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={[]}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors?.locality && <p style={{ color: "red" }}>{errors.locality.message}</p>}
          </div>

          {/*Property Tax Unique ID */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>
              {`${t("NDC_MSG_PROPERTY_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="propertyId"
              // rules={{
              //   required: "Name is required",
              //   minLength: { value: 2, message: "Name must be at least 2 characters" },
              // }}
              render={(props) => (
                <TextInput
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  error={errors?.name?.message}
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
          </div>

          {/*Bill No. */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>
              {`${t("Bill No.")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="billNo"
              render={(props) => (
                <TextInput
                  style={{ marginBottom: 0 }}
                  value={props.value}
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
          </div>

          {/*Mobile No. */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}</CardLabel>
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              }}
              render={(props) => (
                <MobileNumber
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  onChange={(e) => {
                    props.onChange(e);
                  }}
                  onBlur={props.onBlur}
                  t={t}
                />
              )}
            />
          </div>
        </div>
        <ActionBar>
          <SubmitBar style={{ background: "#eee", color: "black", border: "1px solid" }} label="Reset" submit="submit" />
          <SubmitBar label="Search" submit="submit" />
        </ActionBar>
      </form>
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default BillGenie;
