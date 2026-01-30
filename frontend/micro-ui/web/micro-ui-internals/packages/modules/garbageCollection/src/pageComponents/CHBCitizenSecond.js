import React, { use, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair, UploadFile, Toast } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";

import { parse, format } from "date-fns";

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const isCitizen = window.location.href.includes("citizen");
  const [getPropertyId, setPropertyId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [getPUnits, setPUnits] = useState([]);
  const [getActiveStatus, setActiveStatus] = useState(false);

  const { data: GCData = [], isLoading: GCLoading } = Digit.Hooks.useCustomMDMS(tenantId, "sw-services-calculation", [{ name: "PropertyUsageType" }]);
  const { data: WasteType = [], isLoading: WasteTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "gc-services-masters", [{ name: "TypeOfWaste" }]);
  const { data: FreqType = [], isLoading: FreqTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "gc-services-masters", [
    { name: "GarbageCollectionFrequency" },
  ]);
  const { data: connectionCategory = [], isLoading: connectionCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "gc-services-masters", [
    { name: "connectionCategory" },
  ]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      shouldUnregister: false,
      halls: [{ startDate: "", endDate: "", startTime: "", endTime: "" }], // predefine index 0
    },
  });

  const onSubmit = async (data) => {
    if (currentStepData?.venueDetails?.applicationNo || currentStepData?.apiResponseData?.applicationNo) {
      const ownerData = currentStepData?.ownerDetails;
      const updatedDatacheck = currentStepData?.venueDetails || currentStepData?.apiResponseData;
      const payload = {
        GarbageConnection: {
          ...updatedDatacheck,
          tenantId: tenantId,
          propertyId: data?.propertyId,
          frequency: data?.frequency?.name,
          typeOfWaste: data?.typeOfWaste?.name,
          propertyType: data?.propertyType?.name,
          plotSize: data?.plotSize,
          location: data?.location,
          connectionCategory: data?.connectionCategory?.name,
          connectionHolders: [
            {
              name: ownerData?.name,
              mobileNumber: ownerData?.mobileNumber,
              permanentAddress: ownerData?.address,
              emailId: ownerData?.emailId,
              type: "CITIZEN",
            },
          ],
          processInstance: {
            ...currentStepData?.venueDetails?.processInstance,
            action: "DRAFT",
          },
          additionalDetails: {
            connectionCategory: data?.connectionCategory?.name,
            locality: propertyDetailsFetch?.Properties?.[0]?.address?.locality?.code,
          },
        },
      };
      // return;
      // goNext(data);
      setLoader(true);
      try {
        const response = await Digit.GCService.update(payload);
        setLoader(false);
        goNext(response?.GarbageConnection?.[0]);
      } catch (error) {
        setLoader(false);
        setShowToast(true);
        setError(error.response.data?.Errors?.[0]?.message);
      }
    } else {
      setLoader(true);
      const ownerData = currentStepData?.ownerDetails;

      const payload = {
        GarbageConnection: {
          tenantId: tenantId,
          propertyId: data?.propertyId,
          frequency: data?.frequency?.name,
          typeOfWaste: data?.typeOfWaste?.name,
          propertyType: data?.propertyType?.name,
          connectionType: "Non Metered",
          plotSize: data?.plotSize,
          location: data?.location,
          applicationType: "NEW_GARBAGE_CONNECTION",
          connectionCategory: data?.connectionCategory?.name,
          unitId: data?.unitId?.id,
          connectionHolders: [
            {
              name: ownerData?.name,
              mobileNumber: ownerData?.mobileNumber,
              permanentAddress: ownerData?.address,
              emailId: ownerData?.emailId,
              type: "CITIZEN",
            },
          ],
          processInstance: {
            businessService: "NewGC",
            action: "INITIATE",
            moduleName: "gc-services",
          },
          additionalDetails: {
            connectionCategory: data?.connectionCategory?.name,
            locality: propertyDetailsFetch?.Properties?.[0]?.address?.locality?.code,
          },
        },
      };
      console.log("payload=====", payload);
      try {
        const response = await Digit.GCService.create(payload);
        setLoader(false);
        console.log("response", response);
        goNext(response?.GarbageConnection?.[0]);
      } catch (error) {
        setLoader(false);
        setShowToast(true);
        setError(error.response.data?.Errors?.[0]?.message);
      }
    }
    // GCService
  };

  const { isLoading, data: propertyDetailsFetch } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: getPropertyId }, tenantId: tenantId },
    {
      filters: { propertyIds: getPropertyId },
      tenantId: tenantId,
      enabled: getPropertyId ? true : false,
      privacy: Digit.Utils.getPrivacyObject(),
    }
  );

  const checkConnection = async (propertyId, unitId) => {
    setLoader(true);
    const filters = { propertyId: propertyId, unitId: unitId, tenantId };
    try {
      const responseData = await Digit.GCService.validateConnection({ tenantId, filters });
      setLoader(false);
      if (responseData?.canCreateConnection) {
        setActiveStatus(true);
      } else {
        setShowToast(true);
        setError(responseData?.message);
      }
    } catch (error) {
      setLoader(false);
      setActiveStatus(false);
      setShowToast(true);
      setError(error.response.data?.Errors?.[0]?.message);
    }
  };

  useEffect(() => {
    if (propertyDetailsFetch?.Properties[0]) {
      setPUnits(propertyDetailsFetch?.Properties[0]?.units);
      if (propertyDetailsFetch?.Properties || currentStepData?.venueDetails || currentStepData?.apiResponseData) {
        const backStepData = currentStepData?.venueDetails || currentStepData?.apiResponseData;
        const location =
          propertyDetailsFetch?.Properties?.[0]?.owners?.[0]?.permanentAddress ||
          backStepData?.location ||
          propertyDetailsFetch?.Properties?.[0]?.address?.locality?.name;
        const plotSize = propertyDetailsFetch?.Properties?.[0]?.landArea || backStepData?.plotSize;
        if (backStepData?.propertyId) setValue("propertyId", backStepData?.propertyId);
        setValue("location", location);
        setValue("plotSize", plotSize);
        const pTypeOptions = GCData?.["sw-services-calculation"]?.PropertyUsageType || [];
        const freqTypeOptions = FreqType?.["gc-services-masters"]?.GarbageCollectionFrequency || [];
        const wasteTypeOptions = WasteType?.["gc-services-masters"]?.TypeOfWaste || [];
        const connectionCatoptions = connectionCategory?.["gc-services-masters"]?.connectionCategory || [];
        const usage = propertyDetailsFetch?.Properties?.[0]?.usageCategory;
        const frequency = backStepData?.frequency;
        const typeOfWaste = backStepData?.typeOfWaste;
        const connetionType = backStepData?.connectionCategory;
        const pType = pTypeOptions?.find((item) => item?.code == usage);
        const freType = freqTypeOptions?.find((item) => item.name == frequency);
        const wasteType = wasteTypeOptions?.find((item) => item.name == typeOfWaste);
        const connectionCategoryType = connectionCatoptions?.find((item) => item.code == connetionType);
        setValue("propertyType", pType || null);
        setValue("frequency", freType || null);
        setValue("typeOfWaste", wasteType || null);
        setValue("connectionCategory", connectionCategoryType || null);
      }
    }
  }, [propertyDetailsFetch, GCData, setValue, currentStepData]);

  const searchProperty = async () => {
    const pId = watch("propertyId");
    setPropertyId(pId);
  };

  useEffect(() => {
    if (currentStepData?.apiResponseData || currentStepData?.venueDetails) {
      const propertyId = currentStepData?.venueDetails || currentStepData?.apiResponseData;
      if (propertyId) setValue("propertyId", propertyId?.propertyId);
      searchProperty();
    }
  }, [currentStepData]);

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const handleReset = () => {
    setValue("propertyType", null);
    setValue("plotSize", "");
    setValue("location", "");
    setValue("frequency", null);
    setValue("typeOfWaste", null);
    setValue("connectionCategory", null);
    setPropertyId(null); // prevent auto fetch
  };

  const uniqueFloors = React.useMemo(() => {
    if (!getPUnits?.length) return [];

    const map = new Map();

    getPUnits.forEach((item) => {
      if (!map.has(item.floorNo)) {
        map.set(item.floorNo, item);
      }
    });

    return Array.from(map.values()).sort((a, b) => a.floorNo - b.floorNo);
  }, [getPUnits]);

  const selectedFloorUnits = React.useMemo(() => {
    if (!watch("floorNo")) return [];

    return getPUnits.filter((unit) => unit.floorNo === watch("floorNo")?.floorNo);
  }, [watch("floorNo"), getPUnits]);

  const uniqueUsageCategories = React.useMemo(() => {
    if (!selectedFloorUnits?.length) return [];

    const map = new Map();

    selectedFloorUnits.forEach((unit) => {
      if (!map.has(unit.usageCategory)) {
        map.set(unit.usageCategory, unit);
      }
    });

    return Array.from(map.values());
  }, [selectedFloorUnits]);

  return (
    <React.Fragment>
      <form style={{ paddingBottom: "150px" }} onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* property id */}
          <LabelFieldPair style={{ marginBottom: "16px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NDC_MSG_PROPERTY_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
              <div style={{ display: "block", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="propertyId"
                    rules={{
                      required: `${t("NDC_MESSAGE_PROPERTY_ID")}`,
                    }}
                    render={(props) => (
                      <TextInput
                        style={{ marginBottom: 0 }}
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                          handleReset();
                        }}
                        t={t}
                      />
                    )}
                  />
                </div>
                <button className="submit-bar gcButton" type="button" onClick={searchProperty}>
                  {`${t("PT_SEARCH")}`}
                </button>
              </div>
              {errors?.propertyId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.propertyId.message}</p>}
            </div>
          </LabelFieldPair>
          {(propertyDetailsFetch?.Properties || currentStepData?.venueDetails || currentStepData?.apiResponseData) && (
            <div>
              {/* property type  */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("NDC_MSG_PROPERTY_TYPE_LABEL")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={"propertyType"}
                    rules={{ required: t("GC_PROPERTY_TYPE_REQUIRED") }}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                        }}
                        selected={props.value}
                        option={GCData?.["sw-services-calculation"]?.PropertyUsageType}
                        optionKey="name"
                      />
                    )}
                  />
                  {errors?.propertyType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.propertyType.message}</p>}
                </div>
              </LabelFieldPair>

              {/* plot size */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("PDF_STATIC_LABEL_WS_CONSOLIDATED_ACKNOWELDGMENT_PLOT_SIZE")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name="plotSize"
                    rules={{
                      required: `${t("GC_PLOT_SIZE_REQUIRED")}`,
                    }}
                    render={(props) => (
                      <TextInput
                        style={{ marginBottom: 0 }}
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        t={t}
                      />
                    )}
                  />
                  {errors?.plotSize && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.plotSize.message}</p>}
                </div>
              </LabelFieldPair>

              {/* location */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("GC_LOCATION")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name="location"
                    rules={{
                      required: `${t("GC_LOCATION_REQUIRED")}`,
                    }}
                    render={(props) => (
                      <TextInput
                        style={{ marginBottom: 0 }}
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        t={t}
                      />
                    )}
                  />
                  {errors?.location && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.location.message}</p>}
                </div>
              </LabelFieldPair>

              {/* frequency type  */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("GC_FREQUENCY")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={"frequency"}
                    rules={{ required: t("GC_FREQUENCY_REQUIRED") }}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                        }}
                        selected={props.value}
                        option={FreqType?.["gc-services-masters"]?.GarbageCollectionFrequency}
                        optionKey="name"
                      />
                    )}
                  />
                  {errors?.frequency && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.frequency.message}</p>}
                </div>
              </LabelFieldPair>

              {/* waste type  */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("GC_WASTE_TYPE")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={"typeOfWaste"}
                    rules={{ required: t("GC_WASTE_TYPE_REQUIRED") }}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                        }}
                        selected={props.value}
                        option={WasteType?.["gc-services-masters"]?.TypeOfWaste}
                        optionKey="name"
                      />
                    )}
                  />
                  {errors?.typeOfWaste && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.typeOfWaste.message}</p>}
                </div>
              </LabelFieldPair>

              {/* connectionCategory type  */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("GC_CONNECTION_TYPE")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={"connectionCategory"}
                    rules={{ required: t("GC_CONNECTION_TYPE_REQUIRED") }}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                        }}
                        selected={props.value}
                        option={connectionCategory?.["gc-services-masters"]?.connectionCategory}
                        optionKey="name"
                      />
                    )}
                  />
                  {errors?.connectionCategory && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.connectionCategory.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              {/* property units  */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={"floorNo"}
                    rules={{ required: t("units is required") }}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                        }}
                        selected={props.value}
                        option={uniqueFloors}
                        optionKey="floorNo"
                        t={t}
                      />
                    )}
                  />
                  {errors?.floorNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.floorNo.message}</p>}
                </div>
              </LabelFieldPair>

              {/* Select unit */}
              <LabelFieldPair style={{ marginBottom: "16px" }}>
                <CardLabel className="card-label-smaller">
                  {`${t("Select Unit")}`} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <div className="form-field">
                  <Controller
                    control={control}
                    name={"unitId"}
                    rules={{ required: t("Usage category is required") }}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                          const pID = propertyDetailsFetch?.Properties[0]?.propertyId;
                          checkConnection(pID, e?.id);
                        }}
                        selected={props.value}
                        option={uniqueUsageCategories}
                        optionKey="usageCategory"
                        t={t}
                      />
                    )}
                  />
                  {errors?.unitId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.unitId.message}</p>}
                </div>
              </LabelFieldPair>
            </div>
          )}
        </div>
        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" disabled={!getActiveStatus} />
        </ActionBar>
      </form>
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}

      {(loader || isLoading || GCLoading || WasteTypeLoading || FreqTypeLoading || connectionCategoryLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenSecond;
