import React, { useEffect, useMemo, useState } from "react";
import { CardLabel, Dropdown, ActionBar, SubmitBar, Toast, LabelFieldPair, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import ADSAddressField from "./ADSAddressField";
import AvailabilityModal from "./ADSAvailibilityModal";
import CartModal from "./ADSCartModal";
import AdCard from "./ADSAdCard";
import { UPDATE_ADSNewApplication_FORM } from "../redux/action/ADSNewApplicationActions";
import { useDispatch } from "react-redux";

const ADSCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const stateId = Digit.ULBService.getStateId();
  const isCitizen = typeof window !== "undefined" && window.location?.href?.includes("citizen");
  const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");
  const [adsForLocation, setAdsForLocation] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const { data: mdmsAds = [] } = Digit.Hooks.ads.useADSAllMDMS(stateId);
  const { data: location = [] } = Digit.Hooks.ads.useADSLocationMDMS(stateId);
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

  const validateSchedule = ({ startDate, startTime, endDate, endTime }) => {
    if (!startDate || !startTime || !endDate || !endTime) {
      return "Start and end date/time are required.";
    }

    const now = new Date();
    const s = new Date(`${startDate}T${startTime}`);
    const e = new Date(`${endDate}T${endTime}`);

    if (s < now) {
      return "Start date/time cannot be in the past.";
    }

    if (e <= s) {
      return "End date/time must be later than start date/time.";
    }

    return null;
  };

  const showMore = () => setVisibleCount((v) => v + 6);

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
        // set 30‑minute expiry timestamp in Redux using existing action
        const expiry = Date.now() + 30 * 60 * 1000;
        dispatch(UPDATE_ADSNewApplication_FORM("reservationExpiry", expiry));
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
    const err = validateSchedule({ startDate, endDate, startTime, endTime });
    if (err) {
      setShowToast({ label: err, error: true });
      return;
    }

    const locationName = location.find((loc) => loc.code === ad?.locationCode);
    setSelectedAd({ ...ad, locationName, startDate, endDate });
    setDateRange({ startDate, endDate, startTime, endTime });
    setShowModal(true);
  };

  const handleAddToCart = (slots, ad) => {
    setCartSlots((prev) => {
      const existing = prev.find((item) => item.ad.id === ad.id);
      let updated;

      if (existing) {
        let updatedSlots = existing.slots;

        slots.forEach((slot) => {
          if (slot._remove) {
            updatedSlots = updatedSlots.filter((s) => s.bookingDate !== slot.bookingDate);
            setShowToast({ label: `Removed slot ${slot.bookingDate} from ${ad.name}`, error: true });
          } else if (!updatedSlots.some((s) => s.bookingDate === slot.bookingDate)) {
            // 👇 enrich slot with bookingStartDate and bookingEndDate
            const enrichedSlot = {
              ...slot,
              bookingStartDate: slot?.bookingDate,
              bookingEndDate: dateRange?.endDate,
              bookingFromTime: dateRange?.startTime,
              bookingToTime: dateRange?.endTime,
            };
            updatedSlots = [...updatedSlots, enrichedSlot];
            setShowToast({ label: `Added slot ${slot.bookingDate} to ${ad.name}`, error: false });
          }
        });

        updated = prev.map((item) => (item.ad.id === ad.id ? { ...item, slots: updatedSlots } : item));
      } else {
        const addSlots = slots
          .filter((s) => !s._remove)
          .map((s) => ({
            ...s,
            bookingStartDate: s?.bookingDate,
            bookingEndDate: dateRange?.endDate,
            bookingFromTime: dateRange?.startTime,
            bookingToTime: dateRange?.endTime,
          }));

        if (addSlots.length > 0) {
          setShowToast({ label: `Added ${addSlots.length} slot(s) to ${ad.name}`, error: false });
          updated = [...prev, { ad, slots: addSlots }];
        } else {
          updated = prev;
        }
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (ad, slotToRemove) => {
    setCartSlots((prev) =>
      prev
        .map((item) =>
          item.ad.id === ad.id
            ? {
                ...item,
                slots: item.slots.filter((s) => s.bookingDate !== slotToRemove.bookingDate),
              }
            : item
        )
        .filter((item) => item.slots.length > 0)
    );

    setShowToast({ label: `Removed slot ${slotToRemove.bookingDate} from ${ad.name}`, error: true });
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
        <LabelFieldPair>
          <CardLabel>
            {t("ADS_SITE_NAME_LABEL")} <span style={mandatoryStyle}>*</span>
          </CardLabel>
          <div>
            <style>
              {`
               .select-wrap{
        width:100% !important;
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
        </LabelFieldPair>
        {errors.siteId && <CardLabelError style={errorStyle}>{errors.siteId.message}</CardLabelError>}

        {/* Cards grid with see more */}
        {adsForLocation?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "12px" }}>
            {adsForLocation.slice(0, visibleCount).map((ad, idx) => {
              return (
                <AdCard
                  key={ad.id ?? idx}
                  ad={ad}
                  idx={idx}
                  control={control}
                  watch={watch}
                  cartSlots={cartSlots}
                  onViewAvailability={handleViewAvailability}
                  openCart={() => setShowCart(true)}
                  t={t}
                />
              );
            })}
          </div>
        )}

        {visibleCount < adsForLocation.length && (
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button
              type="button"
              onClick={showMore}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
            >
              {t("ADS_SHOW_MORE")}
            </button>
          </div>
        )}

        {/* Geo Location */}
        <LabelFieldPair>
          <CardLabel>{t("CS_COMPLAINT_DETAILS_GEO_LOCATION")}</CardLabel>
          <Controller
            control={control}
            name="geoLocation"
            // rules={{ required: "Geo Location is required" }}
            render={(props) => <ADSAddressField value={props.value} onChange={props.onChange} t={t} />}
          />
        </LabelFieldPair>
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
