import React, { useEffect, useMemo, useState } from "react";
import { CardLabel, Dropdown, ActionBar, SubmitBar, Toast, LabelFieldPair, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import ADSAddressField from "./ADSAddressField";
import AvailabilityModal from "./ADSAvailibilityModal";
import CartModal from "./ADSCartModal";
import AdCard from "./ADSAdCard";
import { UPDATE_ADSNewApplication_FORM } from "../redux/action/ADSNewApplicationActions";
import { useDispatch } from "react-redux";
import { getScheduleMessage, validateSchedule } from "../utils";

const ADSCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const isCitizen = typeof window !== "undefined" && window.location?.href?.includes("citizen");
  const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");
  const [adsForLocation, setAdsForLocation] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const { data: mdmsAds = [] } = Digit.Hooks.ads.useADSAllMDMS(tenantId);
  const { data: location = [] } = Digit.Hooks.ads.useADSLocationMDMS(tenantId);
  const { data: scheduleType = [] } = Digit.Hooks.ads.useADSScheduleTypeMDMS(tenantId);
  const [cartSlots, setCartSlots] = useState([]);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteId: null, // Dropdown selected object: { code, name }
      geoLocation: null, // ADSAddressField normalized object
      ads: [], // per-card schedule array
    },
  });

  const locationOptions = useMemo(() => {
    if (!mdmsAds || !location) return [];

    const locationMap = new Map();
    location.forEach((loc) => {
      if (loc?.code) {
        locationMap.set(loc.code, loc); // full object: name, geo_tag, etc.
      }
    });

    const uniqueCodes = new Set(mdmsAds.map((a) => a.locationCode).filter(Boolean));

    return Array.from(uniqueCodes)
      .map((code) => locationMap.get(code))
      .filter(Boolean);
  }, [mdmsAds, location]);

  // When ads list changes (site change), reset visible paging
  useEffect(() => {
    setVisibleCount(6);
  }, [adsForLocation.length]);

  const filterAds = (selected) => {
    const filtered = mdmsAds.filter((ad) => String(ad.locationCode) === String(selected.code));
    setAdsForLocation(filtered);
    setValue("ads", []);
    // auto geo from MDMS location
    const locObj = (Array.isArray(location) && location.find((l) => String(l.code) === String(selected.code))) || null;
    if (locObj?.geo_tag?.latitude && locObj?.geo_tag?.longitude) {
      setValue("geoLocation", {
        formattedAddress: locObj.name || selected.code,
        latitude: locObj.geo_tag.latitude,
        longitude: locObj.geo_tag.longitude,
        lat: locObj.geo_tag.latitude,
        lng: locObj.geo_tag.longitude,
        placeId: locObj.locationCode,
      });
    }
  };

  const areCartSlotsEqual = (a = [], b = []) => {
    if (a.length !== b.length) return false;

    // sort by ad.id for stable comparison
    const sortByAd = (arr) => [...arr].sort((x, y) => String(x.ad.id).localeCompare(String(y.ad.id)));

    const sortedA = sortByAd(a);
    const sortedB = sortByAd(b);

    return sortedA.every((item, idx) => {
      const other = sortedB[idx];
      if (String(item.ad.id) !== String(other.ad.id)) return false;

      // compare slots by bookingDate (or any unique key)
      const slotsA = item.slots.map((s) => s.bookingDate).sort();
      const slotsB = other.slots.map((s) => s.bookingDate).sort();

      if (slotsA.length !== slotsB.length) return false;
      return slotsA.every((date, i) => date === slotsB[i]);
    });
  };

  const onSubmit = async (data) => {
    if (cartSlots?.length === 0) {
      setShowToast({ label: t("ADS_ONE_AD_ATLEAST"), error: true });
      return;
    }

    // Only check if Redux has ads
    if (currentStepData?.ads?.length > 0) {
      const unchanged = areCartSlotsEqual(cartSlots, currentStepData?.ads);
      if (unchanged) {
        goNext(cartSlots);
        return;
      }
    }

    const enrichedSlots =
      cartSlots?.flatMap((item) =>
        item.slots.map((slot) => ({
          ...slot,
          isTimerRequired: true,
        }))
      ) ?? [];

    const payload = { advertisementSlotSearchCriteria: enrichedSlots };

    try {
      const response = await Digit.ADSServices.slot_search(payload, tenantId);
      if (response) {
        // ✅ Store creation time
        const createTime = Date.now();
        dispatch(UPDATE_ADSNewApplication_FORM("reservationExpiry", createTime));

        goNext(cartSlots);
      } else {
        setShowToast({ label: t("COMMON_SOMETHING_WENT_WRONG_LABEL"), error: true });
      }
    } catch (error) {
      setShowToast({ label: t("COMMON_SOMETHING_WENT_WRONG_LABEL"), error: true });
    }
  };

  useEffect(() => {
    const seeded = adsForLocation.map(() => ({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    }));
    setValue("ads", seeded, { shouldValidate: false, shouldDirty: false });
  }, [adsForLocation, setValue]);

  // Auto close toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleViewAvailability = (ad, { startDate, endDate, startTime, endTime }) => {
    const err = validateSchedule({ startDate, endDate, startTime, endTime, scheduleType });
    if (err) {
      setShowToast({ label: err, error: true });
      return;
    }

    const locationName = location.find((loc) => loc.code === ad?.locationCode);
    setSelectedAd({ ...ad, locationName, startDate, endDate });
    setDateRange({ startDate, endDate, startTime, endTime });
    setShowModal(true);
  };

  const handleRemoveFromCart = (ad) => {
    setCartSlots((prev) => prev.filter((item) => item.ad.id !== ad.id));
    setShowToast({ label: `Removed all slots for ${ad.name}`, error: true });
  };

  const handleAddToCart = (slots, ad) => {
    setCartSlots((prev) => {
      const enrichedSlots = slots.map((s) => ({
        ...s,
        bookingStartDate: s?.bookingDate,
        bookingEndDate: dateRange?.endDate,
        bookingFromTime: dateRange?.startTime,
        bookingToTime: dateRange?.endTime,
      }));

      const existing = prev.find((item) => item.ad.id === ad.id);

      let updated;
      if (existing) {
        // Replace slots for this ad
        updated = prev.map((item) => (item.ad.id === ad.id ? { ...item, slots: enrichedSlots } : item));
        setShowToast({
          label: `Updated ${enrichedSlots.length} slot(s) for ${ad.name}`,
          error: false,
        });
      } else {
        // Add new ad entry
        updated = [...prev, { ad, slots: enrichedSlots }];
        setShowToast({
          label: `Added ${enrichedSlots.length} slot(s) to ${ad.name}`,
          error: false,
        });
      }
      return updated;
    });
  };

  useEffect(() => {
    if (currentStepData?.ads?.length > 0) {
      setCartSlots(currentStepData.ads);

      const locationCode = currentStepData.ads[0]?.ad?.locationCode;
      const matchedOption = locationOptions?.find((opt) => opt.code === locationCode);

      if (matchedOption) {
        setValue("siteId", matchedOption); // 👈 set full object, not just name
        filterAds(matchedOption); // 👈 trigger adsForLocation immediately
      }

      // If you also want geoLocation prefilled:
      if (matchedOption?.geo_tag?.latitude && matchedOption?.geo_tag?.longitude) {
        setValue("geoLocation", {
          formattedAddress: matchedOption.name,
          latitude: matchedOption.geo_tag.latitude,
          longitude: matchedOption.geo_tag.longitude,
          lat: matchedOption.geo_tag.latitude,
          lng: matchedOption.geo_tag.longitude,
          placeId: matchedOption.code,
        });
      }
    }
  }, [currentStepData, locationOptions]);

  const errorStyle = { marginTop: "-18px", color: "red" };
  const mandatoryStyle = { color: "red" };

  const guidance = getScheduleMessage(scheduleType, t);

  return (
    <React.Fragment>
      {cartSlots?.length > 0 && (
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button
            style={{
              marginLeft: "12px",
              padding: "8px 16px",
              background: "#2947a3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => setShowCart(true)}
          >
            <span style={{ marginRight: 6 }}>🛒</span>
            {t("ADS_VIEW_CART")} ({cartSlots?.length})
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <LabelFieldPair> */}
        <CardLabel>
          {t("ADS_SITE_NAME_LABEL")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div style={{width:"100%"}}>
          {isCitizen && (
            <style>
              {`
      .form-field {
        width: 100% !important;
      }
      .select-wrap {
        width: 100% !important;
      }
      .select {
        border: 1px solid #b4b4b4 !important;
        border-radius: 8px !important;
        height: 2.9rem !important;
      }
      .select-active {
        border: 1px solid #2947a3 !important;
        border-radius: 8px !important;
      }
    `}
            </style>
          )}

          <Controller
            control={control}
            name="siteId"
            rules={{ required: t("ADS_SITE_NAME_REQUIRED") }} // ✅ validation rule
            render={(props) => (
              <Dropdown
                className="form-field"
                option={locationOptions}
                optionKey="name"
                selected={props.value}
                select={(e) => {
                  props.onChange(e);
                  filterAds(e);
                }}
              />
            )}
          />
        </div>
        {/* </LabelFieldPair> */}
        {errors.siteId && <CardLabelError style={errorStyle}>{errors.siteId.message}</CardLabelError>}

        {guidance && adsForLocation?.length > 0 && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffeeba",
              color: "#856404",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "14px",
              marginBottom: "8px",
              width: "100%",
              maxWidth: "545px",
            }}
          >
            ⚠️ {guidance}
          </div>
        )}
        {/* Cards grid with see more */}
        {adsForLocation?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {adsForLocation?.slice(0, visibleCount)?.map((ad, idx) => (
              <AdCard
                key={ad.id || idx}
                ad={ad}
                idx={idx}
                control={control}
                watch={watch}
                cartSlots={cartSlots}
                onViewAvailability={handleViewAvailability}
                openCart={() => setShowCart(true)}
                t={t}
                scheduleType={scheduleType}
              />
            ))}
          </div>
        )}

        {adsForLocation?.length > 6 && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            {visibleCount < adsForLocation.length ? (
              <button
                type="button"
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                onClick={() => setVisibleCount((v) => v + 6)}
              >
                {t("ADS_SHOW_MORE")}
              </button>
            ) : (
              <button
                type="button"
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                onClick={() => setVisibleCount(6)}
              >
                {t("SHOW_LESS")}
              </button>
            )}
          </div>
        )}

        {/* Geo Location */}
        {/* <LabelFieldPair> */}
        <CardLabel>{t("CS_COMPLAINT_DETAILS_GEO_LOCATION")}</CardLabel>
        <Controller
          control={control}
          name="geoLocation"
          // rules={{ required: "Geo Location is required" }}
          render={(props) => <ADSAddressField value={props.value} onChange={props.onChange} t={t} />}
        />
        {/* </LabelFieldPair> */}
        {/* {errors.geoLocation && <CardLabelError style={errorStyle}>{errors.geoLocation.message}</CardLabelError>} */}

        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>

        {showModal && (
          <AvailabilityModal
            ad={selectedAd}
            tenantId={tenantId}
            onClose={() => setShowModal(false)}
            onSelectSlot={handleAddToCart}
            cartSlots={cartSlots}
            t={t}
            dateRange={dateRange}
          />
        )}

        {showCart && <CartModal cartSlots={cartSlots} onClose={() => setShowCart(false)} onRemoveSlot={handleRemoveFromCart} t={t} />}

        {showToast && (
          <Toast
            error={showToast.error} // true for removal, false for success
            label={t ? t(showToast.label) : showToast.label}
            onClose={() => setShowToast(null)}
            isDleteBtn={true}
          />
        )}
      </form>
    </React.Fragment>
  );
};

export default ADSCitizenSecond;
