import React, { useEffect, useRef } from "react";
import { TextInput, CardLabel, MobileNumber, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm, useWatch } from "react-hook-form";
import ADSAddress from "./ADSAddress";
import { UPDATE_ADSNewApplication_FORM } from "../redux/action/ADSNewApplicationActions";
import { useDispatch } from "react-redux";

const ADSCitizenDetailsNew = ({ t, goNext, currentStepData, configKey, onGoBack, onChange = () => {} }) => {
  const isEmployee = typeof window !== "undefined" && window.location?.pathname?.includes("/employee");
  const formStorageKey = `ads_form_${isEmployee ? "employee" : "citizen"}`;
  const dispatch = useDispatch();
  const userInfo = Digit.UserService.getUser();
  const { mobileNumber, emailId, name } = userInfo?.info;
  const isCitizen = window.location.href.includes("citizen");
  const [firstName, lastName] = [(name || "").trim().split(" ").slice(0, -1).join(" "), (name || "").trim().split(" ").slice(-1).join(" ")];
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: isCitizen ? firstName || "" : "",
      lastName: isCitizen ? lastName || "" : "",
      emailId: isCitizen ? emailId || "" : "",
      mobileNumber: isCitizen ? mobileNumber || "" : "",
      SGST: "",
      selfDeclaration: false,
      clientName: "",
      address: {
        pincode: "",
        streetName: "",
        houseNo: "",
        landmark: "",
        addressline1: "",
        addressline2: "",
        houseName: "",
        doorNo: "",
        addressId: "",
        city: null,
        locality: null,
      },
    },
  });


  // Prefill from Redux state
  // Prefill from Redux state
  // Prefill from Redux state
  if (typeof window !== "undefined") window.__ADS_FORM_DRAFT = window.__ADS_FORM_DRAFT || {};

  useEffect(() => {
    console.log("ADSCitizenDetailsNew: useEffect for currentStepData triggered");
    console.log("ADSCitizenDetailsNew: currentStepData:", currentStepData);

    console.log("currentStepData:", currentStepData);
    const base = currentStepData?.ownerDetails;
    if (!base) return;
    console.log("ADSCitizenDetailsNew: base.address:", base?.address);

    // Only reset if data has actually changed to avoid unnecessary resets
    const currentAddress = getValues("address");
    const newAddress = base.address;
    const addressChanged = JSON.stringify(currentAddress) !== JSON.stringify(newAddress);

    if (addressChanged) {
      Object.entries(base).forEach(([k, v]) => {
        if (k !== "address" && k !== "addressdetails") setValue(k, v);
      });
      if (newAddress) setValue("address", newAddress);
    }

    // Check for address in both base (ownerDetails) and root level
  }, [currentStepData, setValue, getValues]);

  useEffect(() => {
    // 1) Prefer in-memory draft (survives SPA remounts, cleared on hard reload)
    try {
      const mem = window.__ADS_FORM_DRAFT?.[formStorageKey];
      if (mem && typeof mem === "object") {
        reset(mem);
        console.info("[ADS] rehydrated form from in-memory draft");
        return;
      }
    } catch (e) {
      console.warn("[ADS] failed to rehydrate from in-memory", e);
    }
    // 2) OPTIONAL: sessionStorage fallback to survive a hard reload.
    // Uncomment if you *want* reload persistence.
    /*
  try {
    const raw = sessionStorage.getItem(formStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        reset(parsed);
        console.info("[ADS] rehydrated form from sessionStorage:", formStorageKey);
      }
    }
  } catch (e) {
    console.warn("[ADS] failed to rehydrate form (corrupt JSON?)", e);
  }
  */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Watch address field for live Redux updates

  const safeOnChange = (addr) => {
    try {
      onChange(addr);
    } catch (error) {
      console.error("Error on address change:", error);
    }
  };

  const onSubmit = async (data) => {
    // clear in-memory draft
    try {
      if (window.__ADS_FORM_DRAFT) delete window.__ADS_FORM_DRAFT[formStorageKey];
    } catch (e) {
      /* ignore */
    }

    // Prefer pets.cartDetails (per your payload shape), then fallbacks
    const cartDetailsFromState =
      currentStepData?.pets?.cartDetails ||
      currentStepData?.cartDetails ||
      currentStepData?.siteDetails?.cartDetails ||
      currentStepData?.siteDetails ||
      [];

    const bookingFromTimeFromState = currentStepData?.pets?.bookingFromTime ?? currentStepData?.bookingFromTime ?? "";
    const bookingToTimeFromState = currentStepData?.pets?.bookingToTime ?? currentStepData?.bookingToTime ?? "";
    const cartAddressFromState = currentStepData?.pets?.cartAddress ?? currentStepData?.cartAddress ?? "";

    const isCitizen = typeof window !== "undefined" && window.location?.href?.includes("citizen");

    const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");

    const applicationDate = Date.now();

    const rawAddress = data.address || {};
    const pickedAddress = {
      addressLine1: rawAddress.addressline1 || rawAddress.addressLine1 || "",
      addressLine2: rawAddress.addressline2 || "",
      city: rawAddress.city?.name || rawAddress.city || "",
      cityCode: rawAddress.cityCode || rawAddress.city?.code || "",
      houseNo: rawAddress.houseNo || "",
      houseName: rawAddress.houseName || "",
      landmark: rawAddress.landmark || "",
      locality: rawAddress.locality?.code || rawAddress.locality || "",
      localityCode: rawAddress.localityCode || rawAddress.locality?.code || "",
      pincode: rawAddress.pincode || "",
      streetName: rawAddress.streetName || "",
      doorNo: rawAddress?.doorNo || "",
    };

    const formData = {
      tenantId,
      applicationDate,
      bookingStatus: "BOOKING_CREATED",
      businessService: "ADV",
      address: pickedAddress,
      applicantDetail: {
        applicantName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        applicantEmailId: data.emailId || "",
        applicantMobileNo: data.mobileNumber || "",
        selfDeclaration: typeof data.selfDeclaration !== "undefined" ? data.selfDeclaration : true,
        applicantDetailId: "",
        SGST: data.SGST || "",
      },
      additional_details: "sgst, endDate, selfDeclaration",
      // attach cartDetails we received earlier from the other step
      cartDetails: Array.isArray(cartDetailsFromState) ? cartDetailsFromState : [],
      // optionally include the booking times / cartAddress if available
      bookingFromTime: bookingFromTimeFromState,
      bookingToTime: bookingToTimeFromState,
      cartAddress: cartAddressFromState,
      documents: [],
      workflow: {
        action: "INITIATE",
        comments: "Initial application submitted",
        status: "INITIATED",
        nextState: "",
      },
    };

    try {
      const payload = { bookingApplication: formData };
      const response = await Digit.ADSServices.create(payload, tenantId);

      const status = response?.ResponseInfo?.status;
      const isSuccess = typeof status === "string" && status.toLowerCase() === "successful";

      if (isSuccess) {
        // if API returns bookingApplication array, prefer the first item (same as ADSCitizenSecond)
        const appData = Array.isArray(response?.bookingApplication) ? response.bookingApplication[0] : response?.bookingApplication;

        
        // save created response into Redux under the same key ADSCitizenSecond used
        // dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", appData || response));
        // dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { ...(appData || response), address: { ...(appData?.address || response?.address), houseName: payload?.houseName || "", doorNo: payload?.doorNo ||"" }, applicantDetail: { ...(appData?.applicantDetail || response?.applicantDetail), selfDeclaration: payload?.selfDeclaration?"Yes":"NO" } }));
        const base = appData || response || {};
        dispatch(
          UPDATE_ADSNewApplication_FORM("CreatedResponse", {
            ...base,
            address: {
              ...(base.address || {}),
              houseName: payload?.houseName ?? "",
              doorNo: payload?.doorNo ?? "",
            },
            applicantDetail: {
              ...(base.applicantDetail || {}),
              selfDeclaration: payload?.selfDeclaration ? "Yes" : "NO",
            },
          })
        );

        // forward the full response to parent (so parent can also store/navigate)
        goNext(formData);
      } else {
        console.error("ADS create failed (ADSCitizenDetailsNew) - saving draft", response);
        console.log("formDataNotResponse", formData);
        // store draft under same CreatedResponse key so later update uses it
        dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { draft: true, bookingApplication: formData }));
        goNext({ draft: true, bookingApplication: formData });
      }
    } catch (err) {
      console.error("ADS create error (ADSCitizenDetailsNew) - saving draft", err);
      console.log("formDataInCatch", formData);
      dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { draft: true, bookingApplication: formData }));
      goNext({ draft: true, bookingApplication: formData });
    }
  };

  const watchedAll = useWatch({ control }); // watches entire form
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        // Light guard: avoid writing enormous drafts
        const str = JSON.stringify(watchedAll);
        if (str.length < 300 * 1024) {
          // ~300KB threshold, tweak if needed
          window.__ADS_FORM_DRAFT[formStorageKey] = watchedAll;
        } else {
          console.warn("[ADS] draft too large, skipping in-memory persist");
        }

        // OPTIONAL: if you want to survive hard reloads, uncomment:
        // sessionStorage.setItem(formStorageKey, str);
      } catch (e) {
        console.warn("[ADS] failed to persist form to in-memory", e);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [watchedAll, formStorageKey]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <CardLabel>
          {t("NDC_FIRST_NAME")}
          <span style={{ color: "red" }}>*</span>{" "}
        </CardLabel>
        <Controller
          control={control}
          name="firstName"
          rules={{
            required: "This field is required",
            pattern: {
              value: /^(?=.*[A-Za-z])[A-Za-z\s'-]+$/,
              message: "Only letters, spaces, apostrophes and hyphens allowed, must include at least one letter",
            },
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 100, message: "Maximum 100 characters" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.firstName && <p style={{ color: "red", marginTop: "-18px" }}>{errors.firstName.message}</p>}

        <CardLabel>
          {t("NDC_LAST_NAME")}
          <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="lastName"
          rules={{
            required: "This field is required",
            pattern: {
              value: /^(?=.*[A-Za-z])[A-Za-z\s'-]+$/,
              message: "Only letters, spaces, apostrophes and hyphens allowed, must include at least one letter",
            },
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 100, message: "Maximum 100 characters" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.lastName && <p style={{ color: "red", marginTop: "-18px" }}>{errors.lastName.message}</p>}

        <CardLabel>
          {t("NOC_APPLICANT_EMAIL_LABEL")}
          <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="emailId"
          rules={{
            required: "This field is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.emailId && <p style={{ color: "red", marginTop: "-18px" }}>{errors.emailId.message}</p>}

        <CardLabel>
          {t("NOC_APPLICANT_MOBILE_NO_LABEL")}
          <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="mobileNumber"
          rules={{
            required: "This field is required",
            minLength: { value: 10, message: "Enter at least 10 digits" },
            pattern: { value: /^[6-9]\d{9}$/, message: "Must start with 9, 8, 7, or 6 and be 10 digits long" },
          }}
          render={({ value, onChange, onBlur }) => <MobileNumber value={value} onChange={onChange} onBlur={onBlur} t={t} />}
        />
        {errors.mobileNumber && <p style={{ color: "red", marginTop: "-18px" }}>{errors.mobileNumber.message}</p>}

        <CardLabel>{t("ADVT_CHALLAN_UNDER_SECTION_122_123_SGST")}</CardLabel>
        <Controller
          control={control}
          name="SGST"
          rules={{
            validate: (value) => !value || /^\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z\d]$/.test(value) || "Enter a valid SGST",
          }}
          render={({ value, onChange, onBlur }) => (
            <TextInput
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => {
                const trimmed = e.target.value;
                onChange(trimmed);
                onBlur(e);
              }}
              t={t}
            />
          )}
        />
        {errors.SGST && <p style={{ color: "red", marginTop: "-18px" }}>{errors.SGST.message}</p>}

        {/* <CardLabel>{t("PT_COMMON_COL_ADDRESS")}</CardLabel> */}
        <Controller
          control={control}
          name="address"
          rules={{
            validate: (addr) => {
              const requiredFields = ["houseNo", "houseName", "streetName", "addressline1", "landmark", "city", "locality", "pincode"];

              const missing = requiredFields.filter((f) => {
                const v = addr?.[f];
                if (f === "pincode") return !(v && String(v).length === 6); // require 6-digit pincode
                if (f === "city" || f === "locality") return !v; // objects expected
                return !(v && String(v));
              });

              if (missing.length) {
                // create readable list (you can tweak labels)
                return `Address missing: ${missing.join(", ")}`;
              }
              return true;
            },
          }}
          render={({ value, onChange, onBlur }) => (
            <div>
              <ADSAddress
                t={t}
                value={value || {}}
                onChange={onChange}
                onSelect={(_, addr = {}) => safeOnChange(addr)}
                onBlur={onBlur} // pass through if ADSAddress later supports blur
                errorsP={errors}
              />
              {/* show a single combined address error under the address component */}
              {/* {errors.address && <p style={{ color: "red", marginTop: "6px" }}>{errors.address.message}</p>} */}
            </div>
          )}
        />

        <div style={{ marginTop: "20px" }}>
          <Controller
            control={control}
            name="selfDeclaration"
            rules={{ required: "This field is required" }}
            render={({ value, onChange, onBlur }) => (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <input
                  type="checkbox"
                  id="selfDeclaration"
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="selfDeclaration" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                  {t("BILLAMENDMENT_SELFDECLARATION_LABEL")}
                </label>
                <span style={{ color: "red", marginTop: "-18px" }}>*</span>
              </div>
            )}
          />
          {errors.selfDeclaration && <p style={{ color: "red" }}>{errors.selfDeclaration.message}</p>}

          <CardLabel>
            Client Name <span style={{ color: "red" }}>*</span>
          </CardLabel>

          <Controller
            control={control}
            name="clientName"
            rules={{
              required: "This field is required",
              pattern: {
                value: /^(?=.*[A-Za-z])[A-Za-z\s'-]+$/,
                message: "Only letters, spaces, apostrophes and hyphens allowed , atleast include one letter",
              },
              minLength: { value: 2, message: "Minimum 2 characters" },
              maxLength: { value: 100, message: "Maximum 100 characters" },
            }}
            render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={props.onBlur} t={t} />}
          />
          {errors.clientName && <p style={{ color: "red", marginTop: "-18px" }}>{errors.clientName.message}</p>}
        </div>
      </div>

      <ActionBar>
        <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />

        <SubmitBar label="Next" submit="submit" />
      </ActionBar>
    </form>
  );
};

export default ADSCitizenDetailsNew;
