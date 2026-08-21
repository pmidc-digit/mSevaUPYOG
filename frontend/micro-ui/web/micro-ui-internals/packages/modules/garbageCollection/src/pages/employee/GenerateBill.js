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
    try {
      const response = await Digit.GCService.schedulerCreate(payload);
      setLoader(false);
      setLable("Bill Generated Successfully");
      setError(false);
      setShowToast(true);
    } catch (error) {
      setLoader(false);
      if (error.response.data?.Errors?.[0]?.code == "GC_DUPLICATE_BILL_SCHEDULER") {
        setError(true);
        setShowToast(true);
        setLable("Bill has been already generated.");
      }
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
      setData(response?.TenantBoundary?.[0]?.boundary);
    } catch (error) {
      setLoader(false);
    }
  };

  const boundaryType = watch("batchOrLocality");

  return (
    <React.Fragment>
      <div className="gc-generate-bill">
      <CardSubHeader className="gc-style-3852417c9d gc-generate-bill__heading">{t("ACTION_TEST_GENERATE_BILL")}</CardSubHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          className="gc-style-287885dae7 gc-generate-bill__filters"
        >
          {/* boundaryType */}
          <div
            className="gc-style-af0f5324e8 gc-generate-bill__field"
          >
            <CardLabel>
              {`${t("Select Batch or Locality")}`} <span className="gc-style-31981a7d51">*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"batchOrLocality"}
              rules={{ required: t("This field is required") }}
              render={(props) => (
                <Dropdown

                  className="form-field gc-style-6b38c97cb9"
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
            {errors?.batchOrLocality && <p className="gc-style-31981a7d51">{errors.batchOrLocality.message}</p>}
          </div>

          {/* locality */}
          {boundaryType?.code == "Locality" && (
            <div
              className="gc-style-af0f5324e8 gc-generate-bill__field"
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

                    className="form-field gc-style-6b38c97cb9"
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
              {errors?.locality && <p className="gc-style-31981a7d51">{errors.locality.message}</p>}
            </div>
          )}

          {/* batch */}
          {boundaryType?.code == "Block" && (
            <div
              className="gc-style-af0f5324e8 gc-generate-bill__field"
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

                    className="form-field gc-style-6b38c97cb9"
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
              {errors?.batch && <p className="gc-style-31981a7d51">{errors.batch.message}</p>}
            </div>
          )}

          {/* frequency type  */}
          <div
            className="gc-style-af0f5324e8 gc-generate-bill__field"
          >
            <CardLabel>{`${t("GC_FREQUENCY")}`}*</CardLabel>
            <Controller
              control={control}
              name={"frequency"}
              rules={{ required: t("GC_FREQUENCY_REQUIRED") }}
              render={(props) => (
                <Dropdown

                  className="form-field gc-style-6b38c97cb9"
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
            {errors?.frequency && <p className="gc-style-31981a7d51">{errors.frequency.message}</p>}
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
        <ActionBar className="gc-generate-bill__actions">
          <SubmitBar className="gc-style-65b1b5e6ec" label="Search" submit="submit" />
          <SubmitBar label="Generate Bill" submit="submit" />
        </ActionBar>
      </form>
      </div>
      {showToast && <Toast isDleteBtn={true} error={error} label={getLable} onClose={closeToast} />}

      {(loader || FreqTypeLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default GenerateBill;
