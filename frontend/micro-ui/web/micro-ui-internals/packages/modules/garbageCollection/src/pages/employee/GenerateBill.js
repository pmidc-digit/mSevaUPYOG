import React, { useState } from "react";
import { CardLabel, ActionBar, SubmitBar, CardSubHeader, Dropdown, Toast } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "../../components/Loader";

const GenerateBill = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const [loader, setLoader] = useState(false);
  const [getData, setData] = useState();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [getLable, setLable] = useState(false);

  const { data: FreqType = [], isLoading: FreqTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "gc-services-masters", [
    { name: "GarbageCollectionFrequency" },
  ]);

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
    setLoader(true);
    const payload = {
      billScheduler: {
        tenantId: tenantId,
        locality: data?.batch?.code || data?.locality?.code,
        billingcycleStartdate: 0,
        transactionType: data?.frequency?.name,
        billingcycleEnddate: 0,
        isBatch: data?.batchOrLocality?.name == "Batch" ? true : false,
        isGroup: false,
      },
    };
    // console.log("payload===", payload);
    // return;
    try {
      const response = await Digit.GCService.schedulerCreate(payload);
      setLoader(false);
      setLable("Bill Generated Successfully");
      setError(false);
      setShowToast(true);
      console.log("response", response);
    } catch (error) {
      setLoader(false);
      // setShowToast(true);
      // setError(error.response.data?.Errors?.[0]?.message);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const batchLocality = [
    { name: "Batch", code: "Block" },
    { name: "Locality", code: "Locality" },
  ];

  const handleApiData = async (val) => {
    setLoader(true);
    const filters = {};
    filters.hierarchyTypeCode = "REVENUE";
    filters.boundaryType = val?.code;
    try {
      const response = await Digit.GCService.location({ tenantId, filters });
      setLoader(false);
      console.log("response==", response?.TenantBoundary?.[0]?.boundary);
      setData(response?.TenantBoundary?.[0]?.boundary);
    } catch (error) {
      setLoader(false);
      console.log("error==", error);
      // setLoader(false);
    }
  };

  const boundaryType = watch("batchOrLocality");

  return (
    <React.Fragment>
      <CardSubHeader style={{ fontSize: "24px", margin: "30px 0 40px" }}>{t("ACTION_TEST_GENERATE_BILL")}</CardSubHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* boundaryType */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>
              {`${t("Select Batch or Locality")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"batchOrLocality"}
              rules={{ required: t("This field is required") }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0, width: "100%" }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    handleApiData(e);
                  }}
                  selected={props.value}
                  option={batchLocality}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors?.batchOrLocality && <p style={{ color: "red" }}>{errors.batchOrLocality.message}</p>}
          </div>

          {/* locality */}
          {boundaryType?.code == "Locality" && (
            <div
              style={{
                flex: "0 0 20%", // 2 items per row
                maxWidth: "20%",
              }}
            >
              <CardLabel>
                {`${t("CS_SWACH_LOCALITY")}`}
                {/* <span style={{ color: "red" }}>*</span> */}
              </CardLabel>
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
                    option={getData}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors?.locality && <p style={{ color: "red" }}>{errors.locality.message}</p>}
            </div>
          )}

          {/* batch */}
          {boundaryType?.code == "Block" && (
            <div
              style={{
                flex: "0 0 20%", // 2 items per row
                maxWidth: "20%",
              }}
            >
              <CardLabel>
                {`${t("Batch")}`}
                {/* <span style={{ color: "red" }}>*</span> */}
              </CardLabel>
              <Controller
                control={control}
                name={"batch"}
                render={(props) => (
                  <Dropdown
                    style={{ marginBottom: 0, width: "100%" }}
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={getData}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors?.batch && <p style={{ color: "red" }}>{errors.batch.message}</p>}
            </div>
          )}

          {/* frequency type  */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("GC_FREQUENCY")}`}*</CardLabel>
            <Controller
              control={control}
              name={"frequency"}
              rules={{ required: t("GC_FREQUENCY_REQUIRED") }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0, width: "100%" }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={FreqType?.["gc-services-masters"]?.GarbageCollectionFrequency}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors?.frequency && <p style={{ color: "red" }}>{errors.frequency.message}</p>}
          </div>

          {/* group */}
          {/* <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>
              {`${t("Group")}`}
            </CardLabel>
            <Controller
              control={control}
              name={"group"}
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
            {errors?.group && <p style={{ color: "red" }}>{errors.group.message}</p>}
          </div> */}
        </div>
        <ActionBar>
          <SubmitBar style={{ background: "#eee", color: "black", border: "1px solid" }} label="Search" submit="submit" />
          <SubmitBar label="Generate Bill" submit="submit" />
        </ActionBar>
      </form>
      {showToast && <Toast isDleteBtn={true} error={error} label={getLable} onClose={closeToast} />}

      {(loader || FreqTypeLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default GenerateBill;
