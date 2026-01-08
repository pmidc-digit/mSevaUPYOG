import React, { Fragment, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { UPDATE_ADSNewApplication_FORM } from "../redux/action/ADSNewApplicationActions";
// Add this import at the top
import ADSAddressField from "./ADSAddressField";
const Availability_Options = [
  { i18nKey: "ADS_AVAILABLE", code: "AVAILABLE", name: "Available" },
  { i18nKey: "ADS_UNAVAILABLE", code: "UNAVAILABLE", name: "Unavailable" },
];

const ADSSiteMaster = ({ onGoBack, goNext, currentStepData, t }) => {
  // const tenantId = window.localStorage.getItem("Citizen.tenant-id");
  const stateId = Digit.ULBService.getStateId();
  const { data: mdmsdata = [] } = Digit.Hooks.ads.useADSAllMDMS(stateId);

  // const { data: locationData, isLoading: locationLoading } = Digit.hooks.ads.useADSLocationMDMS(stateId, "Advertisement", "Location");
  // const { data: faceAreaData, isLoading: faceAreaLoading } = Digit.hooks.ads.useADSFaceAreaMDMS(stateId, "Advertisement", "FaceArea");

  // const adTypeOptions = !adTypeLoading ? adTypeData?.filter(item => item.active === true) || [] : [];
  // const locationOptions = !locationLoading ? locationData?.filter(item => item.active === true) || [] : [];
  // const faceAreaOptions = !faceAreaLoading ? faceAreaData?.filter(item => item.active === true) || [] : [];
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const nowHM = now.toISOString().slice(11, 16);
  const isCitizen = window.location.href.includes("citizen");

  const initialFormDefaults = {
    siteId: "",
    siteName: "",
    geoLocation: null,
    cartAddress: "",
    size: "",
    advertisementType: "",
    // startDate: "",
    // endDate: "",
    availabilityStatus: "", // will hold selected option (object or code)
    gstApplicable: false, // boolean
    cowCessApplicable: false, // boolean
    rate: "",
    // bookingId: "",
    // mode_payment: "",
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialFormDefaults,
  });
  const today = new Date();
  const applicationDate = today.getTime();
  //   today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  //   today.setDate(today.getDate() + 1);
  const editAdvertisement = (idx) => {
    const ad = adsList[idx];
    if (!ad) return;
    reset({
      ...initialFormDefaults,
      ...ad,
    });
    setEditingIndex(idx);
    setPlaceNameState(ad.geoLocation?.formattedAddress || "");
  };
  //   const getLocalTodayStr = () => {
  //     const d = new Date();
  //     d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  //     d.setDate(d.getDate() + 1);
  //     return d.toISOString().slice(0, 10);
  //   };
  //   const tomorrowStr = getLocalTodayStr();

  //   const startDateValue = watch("startDate");
  //   const endDateValue = watch("endDate");
  //   const fromTimeValue = watch("bookingFromTime");

  //   const isSameDaySelected = startDateValue && endDateValue && startDateValue === endDateValue;
  //   const endDateMinSafe = startDateValue || tomorrowStr;

  //   let endDateMin;
  //   if (startDateValue) {
  //     const d = new Date(startDateValue);
  //     d.setDate(d.getDate());
  //     endDateMin = d.toISOString().slice(0, 10);
  //   }

  const dispatch = useDispatch();
  const [placeNameState, setPlaceNameState] = useState("");
  const [adsList, setAdsList] = useState([]);

  // index of the ad being edited (null when adding a new one)
  const [editingIndex, setEditingIndex] = useState(null);

  // add current form values to adsList (validates via handleSubmit)
  // if editingIndex is not null -> update that index, otherwise append
  const addAdvertisement = handleSubmit((data) => {
    if (editingIndex !== null && editingIndex >= 0) {
      setAdsList((prev) => prev.map((it, i) => (i === editingIndex ? data : it)));
      setEditingIndex(null);
    } else {
      setAdsList((prev) => [...prev, data]);
    }
    const editAdvertisement = (idx) => {
      const ad = adsList[idx];
      if (!ad) return;
      // populate the form with the ad values; preserve time defaults if missing
      reset({
        ...initialFormDefaults,
        ...ad,
      });
      setEditingIndex(idx);
      setPlaceNameState(ad.geoLocation?.formattedAddress || "");
    };
    // reset form and restore time defaults
    reset({ ...initialFormDefaults });
    setPlaceNameState("");
  });

  const removeAdvertisement = (idx) => {
    setAdsList((prev) => prev.filter((_, i) => i !== idx));
    // if the currently edited item was removed, clear editing state & reset form
    if (editingIndex === idx) {
      setEditingIndex(null);
      reset({ ...initialFormDefaults });
      setPlaceNameState("");
    } else if (editingIndex !== null && editingIndex > idx) {
      // if we removed an earlier item, shift editing index left by one
      setEditingIndex((old) => (old !== null ? old - 1 : null));
    }
  };
  const onSubmit = async (data) => {
    const tenantId = isCitizen ? "pb.amritsar" : "pb.testing";

    // const tenantId = "pb.amritsar";

    // const tenantId = "pb.testing";
    const rawAddress = currentStepData?.ownerDetails?.address || {};
    const adsToSubmit = [...adsList, data];
    const pickedAddress = {
      addressLine1: rawAddress.addressline1 || rawAddress.addressLine1 || "",
      city: rawAddress.city?.name || rawAddress.city || "",
      cityCode: rawAddress.cityCode || rawAddress.city?.code || "",
      houseNo: rawAddress.houseNo || "",
      landmark: rawAddress.landmark || "",
      locality: rawAddress.locality?.code || rawAddress.locality || "",
      localityCode: rawAddress.localityCode || rawAddress.locality?.code || "",
      pincode: rawAddress.pincode || "",
      streetName: rawAddress.streetName || "",
    };

    const formData = {
      tenantId: tenantId, //had to add because api was not taking auto generated "pb"
      applicationDate: applicationDate,
      bookingStatus: "BOOKING_CREATED",
      address: pickedAddress,
      applicantDetail:
        {
          applicantName: `${currentStepData?.ownerDetails?.firstName || ""} ${currentStepData?.ownerDetails?.lastName || ""}`,

          // lastName: currentStepData?.ownerDetails?.lastName || "",
          applicantEmailId: currentStepData?.ownerDetails?.emailId || "",
          applicantMobileNo: currentStepData?.ownerDetails?.mobileNumber || "",
          selfDeclaration: currentStepData?.ownerDetails?.selfDeclaration || true, //not caught coz schema has no field for it
          applicantDetailId: "",
          SGST: currentStepData?.ownerDetails?.SGST || "", //not caught coz schema has no field for it
        } || {},
      additional_details: "geolocation , siteName, SGST, selfDeclaration , endDate ,",

      cartDetails: adsToSubmit.map((d) => ({
        addType: d.advertisementType?.code || d.advertisementType,
        bookingDate: d.startDate,
        endDate: d.endDate,
        bookingFromTime: "06:00",
        bookingToTime: "05:59",
        advertisementId: d.siteId || "",
        cartId: d.siteId || "",
        cartAddress: d.cartAddress || "",
        geoLocation: d.geoLocation?.code || d.geoLocation,
        faceArea: d.size?.code || d.size,
        location: d.siteName?.code || d.siteName || "",
        status: "BOOKING_CREATED",
        availabilityStatus: d.availabilityStatus?.code || d.availabilityStatus || "",
        rate: d.rate || "",
      })),
      documents: [],
      workflow: {
        action: "INITIATE",
        comments: "Initial application submitted",
        status: "INITIATED",
        nextState: "",
      },
    };

    // build a flat siteDetails object that matches your form field names

    dispatch(UPDATE_ADSNewApplication_FORM("applicantDetail", formData.applicantDetail));
    dispatch(UPDATE_ADSNewApplication_FORM("cartDetails", formData.cartDetails));
    dispatch(UPDATE_ADSNewApplication_FORM("cartAddress", data.cartAddress));
    dispatch(UPDATE_ADSNewApplication_FORM("siteDetails", data));
    dispatch(UPDATE_ADSNewApplication_FORM("siteId", data.siteId));
    dispatch(UPDATE_ADSNewApplication_FORM("siteName", data.siteName));
    // dispatch(UPDATE_ADSNewApplication_FORM("bookingId", data.bookingId));
    // dispatch(UPDATE_ADSNewApplication_FORM("mode_payment", data.mode_payment));

    const fallbackData = {
      draft: true,
      bookingApplication: formData,
    };

    try {
      const payload = {
        bookingApplication: formData,
      };

      const response = await Digit.ADSServices.create(payload, tenantId);

      const status = response?.ResponseInfo?.status;
      const isSuccess = typeof status === "string" && status.toLowerCase() === "successful";

      if (isSuccess) {
        const appData = Array.isArray(response?.bookingApplication) ? response.bookingApplication[0] : response?.bookingApplication;

        dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", appData || response));
        setAdsList([]);
        setEditingIndex(null);
        reset({ ...initialFormDefaults });
        goNext(response);
      } else {
        console.error("ADS create failed:", response);
        dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { draft: true, bookingApplication: formData }));
        goNext({ ...fallbackData, draft: true });
      }
    } catch (err) {
      console.error("ADS create error:", err);
      dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { draft: true, bookingApplication: formData }));

      goNext({ ...fallbackData, draft: true });
    }
  };

  useEffect(() => {
    const formattedData = currentStepData?.siteDetails || currentStepData;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    const currentSite = watch("siteName");
    if (currentSite && currentSite.geo_tag && (!watch("geoLocation") || !watch("geoLocation")?.latitude)) {
      const normalized = {
        formattedAddress: currentSite.name,
        latitude: currentSite.geo_tag.latitude,
        longitude: currentSite.geo_tag.longitude,
        lat: currentSite.geo_tag.latitude,
        lng: currentSite.geo_tag.longitude,
        placeId: currentSite.code,
        raw: currentSite,
      };
      setValue("geoLocation", normalized, { shouldValidate: false });
      setPlaceNameState(currentSite.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("siteName")]);

  return (
    <React.Fragment>
      {/* Added advertisements preview */}
      {adsList.length > 0 && (
        <div style={{ margin: "12px 0", padding: 8, border: "1px dashed #ddd", borderRadius: 6 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{t ? t("Added Advertisements") : "Added Advertisements"}</div>
          {adsList.map((ad, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
                padding: "6px 0",
                borderBottom: i < adsList.length - 1 ? "1px solid #eee" : "none",
                cursor: "pointer",
                background: editingIndex === i ? "#fafafa" : "transparent",
                paddingRight: 12,
              }}
            >
              <div onClick={() => editAdvertisement(i)} style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{ad.siteName?.name || ad.siteId || `Ad ${i + 1}`}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {ad.cartAddress ||
                    ad.geoLocation?.formattedAddress ||
                    (ad.geoLocation?.latitude ? `${ad.geoLocation.latitude}, ${ad.geoLocation.longitude}` : "")}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => editAdvertisement(i)}
                  style={{ background: "#fff", border: "1px solid #ccc", padding: "6px 8px", borderRadius: 4, cursor: "pointer" }}
                >
                  {t ? t("Edit") : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => removeAdvertisement(i)}
                  style={{ background: "transparent", border: "1px solid #ccc", padding: "6px 8px", borderRadius: 4, cursor: "pointer" }}
                >
                  {t ? t("Remove") : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <CardLabel>
            Enter site id <span style={{ color: "red" }}>*</span>
          </CardLabel>

          <Controller
            control={control}
            name="siteId"
            rules={{
              required: "This field is required",
              pattern: {
                value: /^[a-zA-Z0-9]+$/,
                message: "Only letters and numbers allowed",
              },
              maxLength: { value: 100, message: "Maximum 100 characters" },
              minLength: { value: 2, message: "Minimum 2 characters" },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
              />
            )}
          />
          {errors.siteId && <p style={{ color: "red" }}>{errors.siteId.message}</p>}

          <CardLabel>
            Site Name <span style={{ color: "red" }}>*</span>
          </CardLabel>

          <Controller
            control={control}
            name={"siteName"}
            rules={{
              required: "This field is required",
              pattern: {
                value: /^[a-zA-Z0-9]+$/,
                message: "Only letters and numbers allowed",
              },
              maxLength: { value: 100, message: "Maximum 100 characters" },
              minLength: { value: 2, message: "Minimum 2 characters" },
            }}
            render={(props) => (
              <TextInput
                className="form-field"
                // when an option is selected, props.onChange gets the full object (with geo_tag)
                select={(val) => {
                  props.onChange(val);
                  // if MDMS returned geo_tag, populate form's geoLocation
                  if (val && val.geo_tag && val.geo_tag.latitude && val.geo_tag.longitude) {
                    const normalized = {
                      formattedAddress: val.name,
                      latitude: val.geo_tag.latitude,
                      longitude: val.geo_tag.longitude,
                      lat: val.geo_tag.latitude,
                      lng: val.geo_tag.longitude,
                      placeId: val.code,
                      raw: val,
                    };
                    setValue("geoLocation", normalized, { shouldValidate: true, shouldDirty: true });
                    setPlaceNameState(val.name);
                    // optional: set cartAddress so a human-readable address is present
                    if (!watch("cartAddress")) setValue("cartAddress", val.name);
                  }
                }}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                //   selected={props.value}
                //   option={location}
                //   optionKey="name"
              />
            )}
          />

          {errors.siteName && <p style={{ color: "red" }}>{errors.siteName.message}</p>}

          <CardLabel>
            Geo Location <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name="geoLocation"
            rules={{
              required: "This field is required",
              validate: (val) => (val && (val.latitude || val.lat) && (val.longitude || val.lng)) || "Please pick a location",
            }}
            render={(props) => (
              <ADSAddressField
                value={props.value}
                onChange={(normalized) => {
                  props.onChange(normalized);
                  setPlaceNameState(normalized?.formattedAddress || "");
                }}
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
          {errors.geoLocation && <p style={{ color: "red" }}>{errors.geoLocation.message}</p>}

          {/* <CardLabel>{`${t("PT_COMMON_COL_ADDRESS")}`}</CardLabel> */}
          <CardLabel>
            Address <span style={{ color: "red" }}>*</span>
          </CardLabel>

          <Controller
            control={control}
            name="cartAddress"
            rules={{
              required: "This field is required",
              pattern: {
                value: /^(?=.*[a-zA-Z]).*$/,
                message: "Enter valid address , atleast one letter must be present",
              },
              maxLength: { value: 500, message: "Maximum 500 characters" },
              minLength: { value: 5, message: "Minimum 5 characters" },
            }}
            render={(props) => (
              <TextArea
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
              />
            )}
          />
          {errors.cartAddress && <p style={{ color: "red" }}>{errors.cartAddress.message}</p>}

          <CardLabel>
            Size <span style={{ color: "red" }}>*</span>
          </CardLabel>

          {/* Height Dropdown */}

          <Controller
            control={control}
            name="height"
            rules={{ required: "Height is required" }}
            render={({ field }) => (
              <Dropdown
                className="form-field"
                select={field.onChange}
                selected={field.value}
                option={mdmsdata} // or mdmsdataHeight if you have separate data
                optionKey="height" // key in your data for height
              />
            )}
          />

          {errors.height && <p style={{ color: "red" }}>{errors.height.message}</p>}

          {/* Width Dropdown */}

          <Controller
            control={control}
            name="width"
            rules={{ required: "Width is required" }}
            render={({ field }) => (
              <Dropdown
                className="form-field"
                select={field.onChange}
                selected={field.value}
                option={mdmsdata} // or mdmsdataWidth if you have separate data
                optionKey="width" // key in your data for width
              />
            )}
          />

          {errors.width && <p style={{ color: "red" }}>{errors.width.message}</p>}

          <CardLabel>
            Advertisement Type <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name={"advertisementType"}
            rules={{ required: "This field is required" }}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={mdmsdata} optionKey="adType" />
            )}
          />

          {errors.advertisementType && <p style={{ color: "red" }}>{errors.advertisementType.message}</p>}

          <CardLabel style={{ marginTop: "12px" }}>
            Rate / Price of the site (₹) <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name="rate"
            rules={{
              pattern: { value: /^(?!.*[eE])[0-9]+(\.[0-9]{1,2})?$/, message: "Enter a valid amount" },
              maxLength: { value: 12, message: "Maximum 12 characters" },
              required: "This field is required",
            }}
            render={(props) => (
              <TextInput
                type="number"
                step="0.01"
                min="0"
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={(e) => props.onBlur(e)}
              />
            )}
          />
          {errors.rate && <p style={{ color: "red" }}>{errors.rate.message}</p>}

          <CardLabel>
            Availability Status <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name="availabilityStatus"
            rules={{ required: "This field is required" }}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Availability_Options} optionKey="i18nKey" />
            )}
          />
          {errors.availabilityStatus && <p style={{ color: "red" }}>{errors.availabilityStatus.message}</p>}

          <CardLabel style={{ marginTop: "12px" }}>
            GST Applicable <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name="gstApplicable"
            rules={{ required: "This field is required" }}
            render={(props) => (
              <div>
                <input type="checkbox" checked={!!props.value} onChange={(e) => props.onChange(e.target.checked)} id="gstApplicable" />
                <label htmlFor="gstApplicable" style={{ marginLeft: 8 }}>
                  Yes
                </label>
              </div>
            )}
          />
          {errors.availabilityStatus && <p style={{ color: "red" }}>{errors.gstApplicable.message}</p>}

          <CardLabel style={{ marginTop: "12px" }}>
            Cow Cess Applicable <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name="cowCessApplicable"
            rules={{ required: "This field is required" }}
            render={(props) => (
              <div>
                <input type="checkbox" checked={!!props.value} onChange={(e) => props.onChange(e.target.checked)} id="cowCessApplicable" />
                <label htmlFor="cowCessApplicable" style={{ marginLeft: 8 }}>
                  Yes
                </label>
              </div>
            )}
          />
          {errors.cowCessApplicable && <p style={{ color: "red" }}>{errors.cowCessApplicable.message}</p>}
        </div>
        <div style={{ margin: "12px 0" }}>
          <button
            type="button"
            onClick={addAdvertisement}
            style={{ background: "#f1f1f1", border: "1px solid #ccc", padding: "8px 12px", borderRadius: 4, cursor: "pointer" }}
          >
            {editingIndex !== null ? (t ? t("Save Site") : "Save Site") : t ? t("Add Site") : "Add Site"}
          </button>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default ADSSiteMaster;
