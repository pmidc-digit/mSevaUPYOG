import React, { Fragment, useEffect, useState, useRef, useCallback } from "react";
import {
  TextInput,
  CardLabel,
  Dropdown,
  TextArea,
  ActionBar,
  SubmitBar,
  Toast,
  CardSectionHeader,
  LabelFieldPair,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { UPDATE_ADSNewApplication_FORM, RESET_ADS_NEW_APPLICATION_FORM } from "../redux/action/ADSNewApplicationActions";
import ADSAddressField from "./ADSAddressField";
const ADSCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const stateId = Digit.ULBService.getStateId();
  const { data: location, isLocationLoading } = Digit.Hooks.ads.useADSLocationMDMS(stateId);
  const { data: mdmsAds = [], isLoading: isMdmsLoading } = Digit.Hooks.ads.useADSAllMDMS(stateId);
  const [mdmsCards, setMdmsCards] = useState([]);
  const [adsForLocation, setAdsForLocation] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [adsScheduleMap, setAdsScheduleMap] = useState({});
  const dispatch = useDispatch();

  const [placeNameState, setPlaceNameState] = useState("");
  const [adsList, setAdsList] = useState([]);
  const [adsScheduleErrors, setAdsScheduleErrors] = useState({});
  const [showToast, setShowToast] = useState(null);

  const [editingIndex, setEditingIndex] = useState(null);

  const findLocationByCode = (code) => {
    if (!code || !Array.isArray(location)) return null;
    return location.find((l) => String(l.locationCode) === String(code) || String(l.code) === String(code)) || null;
  };
  const [globalScheduleEnabled, setGlobalScheduleEnabled] = useState(false);
  const adsScheduleBackupRef = useRef(null);
  const skipPersistRef = useRef(false);

  const normalizeLocationToGeo = (loc) => {
    if (!loc || !loc.geo_tag || !loc.geo_tag.latitude || !loc.geo_tag.longitude) return null;
    return {
      formattedAddress: loc.name || loc.label || "",
      latitude: loc.geo_tag.latitude,
      longitude: loc.geo_tag.longitude,
      lat: loc.geo_tag.latitude,
      lng: loc.geo_tag.longitude,
      placeId: loc.locationCode || loc.code || "",
      raw: loc,
    };
  };
  const formatDisplay = (dt) => {
    if (!dt) return "";
    const [datePart, timePart] = String(dt).split("T");
    if (!datePart) return "";
    const [y, m, d] = datePart.split("-");
    return `${m}/${d}/${y}${timePart ? " " + timePart : ""}`;
  };

  const validateScheduleForAdd = (startDt, endDt) => {
    if (!startDt || !endDt) return "Please choose both start and end date/time.";
    const [sDate, sTime = ""] = startDt.split("T");
    const [eDate, eTime = ""] = endDt.split("T");
    if (sDate < tomorrowStr || eDate < tomorrowStr) return `Dates must be ${tomorrowStr} (tomorrow) or later.`;
    if (sDate === eDate && eTime <= sTime) return "End time must be later than start time when same day.";
    return null;
  };

  const showMore = () => setVisibleCount((v) => v + 6);
  useEffect(() => setVisibleCount(6), [adsForLocation]);

  const locationOptions = Array.from(
    new Map(mdmsAds.filter((a) => a.locationCode).map((a) => [a.locationCode, { code: a.locationCode, label: a.locationCode }])).values()
  );

  const clearSiteIdInput = () => {
    setValue("siteId", "");
    setSiteIdKey((k) => k + 1);
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const nowHM = now.toISOString().slice(11, 16);
  const isCitizen = window.location.href.includes("citizen");
  const [siteIdKey, setSiteIdKey] = useState(0);

  const PERSIST_KEY_PREFIX = "ADS:site:";

  const saveForSite = (siteId, payload) => {
    if (!siteId) return;
    try {
      localStorage.setItem(`${PERSIST_KEY_PREFIX}${siteId}`, JSON.stringify({ ...payload, savedAt: Date.now() }));
    } catch (e) {
      console.warn("ADS persistence failed", e);
    }
  };

  const loadForSite = (siteId) => {
    if (!siteId) return null;
    try {
      const raw = localStorage.getItem(`${PERSIST_KEY_PREFIX}${siteId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("ADS load failed", e);
      return null;
    }
  };

  const validateAdSchedule = (adId, overrideEntry) => {
    const entry = overrideEntry || (adsScheduleMap && (adsScheduleMap[adId] || adsScheduleMap[String(adId)])) || {};
    const sDate = entry.startDate || "";
    const sTime = entry.startTime || "";
    const eDate = entry.endDate || "";
    const eTime = entry.endTime || "";

    if (!sDate || !sTime || !eDate || !eTime) {
      setAdsScheduleErrors((prev) => {
        if (!prev[adId]) return prev;
        const copy = { ...prev };
        delete copy[adId];
        return copy;
      });
      return true;
    }

    if (sDate < tomorrowStr || eDate < tomorrowStr) {
      setAdsScheduleErrors((prev) => ({ ...prev, [adId]: `Dates must be from ${tomorrowStr} or later.` }));
      return false;
    }

    const start = new Date(`${sDate}T${sTime}`);
    const end = new Date(`${eDate}T${eTime}`);

    if (end <= start) {
      setAdsScheduleErrors((prev) => ({ ...prev, [adId]: "End date/time must be after start date/time." }));
      return false;
    }

    setAdsScheduleErrors((prev) => {
      if (!prev[adId]) return prev;
      const copy = { ...prev };
      delete copy[adId];
      return copy;
    });
    return true;
  };

  const clearPersistenceForSite = (siteId) => {
    if (!siteId) return;
    try {
      localStorage.removeItem(`${PERSIST_KEY_PREFIX}${siteId}`);
    } catch (e) {}
  };

  const loadAllSavedSites = () => {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(PERSIST_KEY_PREFIX)) continue;
        const siteId = key.slice(PERSIST_KEY_PREFIX.length);
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          out.push({ siteId, ...parsed });
        } catch (e) {
          console.warn("ADS: parse saved site failed for", key, e);
        }
      }
    } catch (e) {
      console.warn("ADS: loadAllSavedSites failed", e);
    }
    return out;
  };

  const updateAllSavedSitesForGlobal = (enable, globalTimes = {}) => {
    try {
      const savedSites = loadAllSavedSites() || [];
      savedSites.forEach((site) => {
        if (!site || !site.siteId) return;
        const siteKey = String(site.siteId);

        // Defensive copy
        const toSave = {
          mdmsCards: Array.isArray(site.mdmsCards) ? site.mdmsCards : site.mdmsCards || [],
          adsList: Array.isArray(site.adsList) ? site.adsList : site.adsList || [],
          adsScheduleMap: site.adsScheduleMap ? { ...site.adsScheduleMap } : {},
          placeNameState: site.placeNameState || "",
          globalScheduleEnabled: !!enable,
          startDate: site.startDate || "",
          endDate: site.endDate || "",
          bookingFromTime: site.bookingFromTime || "",
          bookingToTime: site.bookingToTime || "",
        };

        if (enable) {
          // Apply global times to each ad key present in mdmsCards or existing map
          const { startDate: sd = "", startTime: st = "", endDate: ed = "", endTime: et = "" } = globalTimes;
          (toSave.mdmsCards || []).forEach((c) => {
            const key = c.mdmsId ?? c.id;
            if (!key) return;
            toSave.adsScheduleMap[key] = { startDate: sd, startTime: st, endDate: ed, endTime: et };
          });
        } else {
          // Disable global: remove map entries that exactly match the globalTimes
          const { startDate: sd = "", startTime: st = "", endDate: ed = "", endTime: et = "" } = globalTimes;
          Object.keys(toSave.adsScheduleMap || {}).forEach((k) => {
            const e = toSave.adsScheduleMap[k] || {};
            if (sd && st && ed && et) {
              if (e.startDate === sd && e.startTime === st && e.endDate === ed && e.endTime === et) {
                // they were using the global times — remove to force per-site manual entry
                delete toSave.adsScheduleMap[k];
              }
            } else {
              // if no reliable global times supplied, be conservative: clear any empty/invalid schedule entries
              if (!e.startDate && !e.startTime && !e.endDate && !e.endTime) delete toSave.adsScheduleMap[k];
            }
          });
        }

        // persist to localStorage (fallback to sessionStorage)
        try {
          localStorage.setItem(`${PERSIST_KEY_PREFIX}${siteKey}`, JSON.stringify({ ...toSave, savedAt: Date.now() }));
        } catch (err) {
          try {
            sessionStorage.setItem(`ADS:session:${siteKey}`, JSON.stringify({ ...toSave, savedAt: Date.now() }));
          } catch (e) {
            console.warn("updateAllSavedSitesForGlobal persist failed for", siteKey, e);
          }
        }
      });
    } catch (e) {
      console.warn("updateAllSavedSitesForGlobal failed", e);
    }
  };

  const convertSavedToCartDetails = (saved) => {
    if (!saved) return [];
    const { mdmsCards = [], adsList = [] } = saved;
    const mdmsConverted = mdmsCards.flatMap((c) =>
      (c.schedules || []).map((s) => {
        const [sDate, sTime = nowHM] = (s.startDatetime || "").split("T");
        const [eDate, eTime = nowHM] = (s.endDatetime || "").split("T");
        return {
          addType: c.adType || "",
          bookingDate: sDate || "",
          endDate: eDate || "",
          bookingFromTime: sTime || nowHM,
          bookingToTime: eTime || nowHM,
          advertisementId: c.mdmsId?.toString() || "",
          cartId: c.mdmsId?.toString() || "",
          cartAddress: c.name || "",
          geoLocation: c.geoLocation || c.geoLocation || "",
          faceArea: `${c.width || ""}x${c.height || ""}`,
          location: c.locationCode || "",
          status: "BOOKING_CREATED",
          availabilityStatus: c.available === false ? "UNAVAILABLE" : "AVAILABLE",
          amount: c.amount || "",
          nightLight: c.nightLight || "",
        };
      })
    );

    const manualConverted = (adsList || []).map((d) => ({
      addType: d.advertisementType?.code || d.advertisementType || d.addType || "",
      bookingDate: d.bookingDate || d.startDate || "",
      endDate: d.endDate || d.endDate || "",
      bookingFromTime: d.bookingFromTime || "",
      bookingToTime: d.bookingToTime || "",
      advertisementId: d.advertisementId || d.siteId || d.mdmsId?.toString() || "",
      cartId: d.cartId || d.siteId || d.mdmsId?.toString() || "",
      cartAddress: d.cartAddress || d.name || "",
      geoLocation: d.geoLocation || (d.geoLocation?.code ? d.geoLocation.code : "") || "",
      faceArea: d.faceArea || (d.size?.code ? d.size.code : "") || "",
      location: d.location || d.locationCode || d.siteId || (d.siteName?.code ? d.siteName.code : "") || "",
      status: "BOOKING_CREATED",
      availabilityStatus: d.availabilityStatus || (d.available === false ? "UNAVAILABLE" : "AVAILABLE") || "",
      rate: d.amount || "",
      nightLight: d.nightLight || "",
    }));

    return [...manualConverted, ...mdmsConverted];
  };

  const PERSIST_GLOBAL_KEY = "ADS:global";
  const saveGlobal = (payload) => {
    try {
      const out = { ...(payload || {}), savedAt: Date.now() };
      localStorage.setItem(PERSIST_GLOBAL_KEY, JSON.stringify(out));
    } catch (e) {
      console.warn("saveGlobal failed", e);
    }
  };
  const loadGlobal = () => {
    try {
      const raw = localStorage.getItem(PERSIST_GLOBAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };
  const applyGlobalToAll = () => {
    const sd = getValues("startDate") || tomorrowStr;
    const ed = getValues("endDate") || sd;
    const st = getValues("bookingFromTime") || nowHM;
    const et = getValues("bookingToTime") || nowHM;

    const newMap = { ...(adsScheduleMap || {}) };
    (adsForLocation || []).forEach((ad) => {
      newMap[ad.id] = {
        ...(newMap[ad.id] || {}),
        startDate: sd,
        startTime: st,
        endDate: ed,
        endTime: et,
      };
    });
    setAdsScheduleMap(newMap);
  };

  const initialFormDefaults = {
    siteId: "",
    // siteName: "",
    geoLocation: null,
    cartAddress: "",
    size: "",
    advertisementType: "",
    startDate: "",
    endDate: "",
    bookingFromTime: nowHM,
    bookingToTime: nowHM,
    availabilityStatus: "",
    nightLight: "",
    // gstApplicable: false, // boolean
    // cowCessApplicable: false, // boolean
    amount: "",
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
    getValues,
    trigger,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: initialFormDefaults,
  });

  const setGlobalSchedule = useCallback(
    (enable) => {
      // grab current form/global times
      const sd = getValues("startDate") || "";
      const ed = getValues("endDate") || sd || "";
      const st = getValues("bookingFromTime") || nowHM || "";
      const et = getValues("bookingToTime") || nowHM || "";

      if (enable) {
        // Backup current per-site map (so disabling later restores current site's map)
        adsScheduleBackupRef.current = adsScheduleMap || {};

        // Build new map applying global times to visible ads (preserves existing unrelated keys)
        setAdsScheduleMap((prev) => {
          const newMap = { ...(prev || {}) };
          (adsForLocation || []).forEach((ad) => {
            const key = ad.mdmsId ?? ad.id;
            newMap[key] = { startDate: sd, startTime: st, endDate: ed, endTime: et };
          });
          return newMap;
        });

        setGlobalScheduleEnabled(true);

        // persist global flag + times
        saveGlobal({ globalScheduleEnabled: true, startDate: sd, endDate: ed, bookingFromTime: st, bookingToTime: et });

        // ALSO update all saved sites so other sites reflect the new global state immediately
        updateAllSavedSitesForGlobal(true, { startDate: sd, startTime: st, endDate: ed, endTime: et });
      } else {
        // disable: restore backup for current site (if any) so user returns to per-site values
        setGlobalScheduleEnabled(false);

        // Restore in-memory map for the current site from backup (if it exists)
        setAdsScheduleMap(adsScheduleBackupRef.current || {});
        adsScheduleBackupRef.current = null;

        // persist global disabled
        const curGlobal = loadGlobal() || {};
        saveGlobal({ ...curGlobal, globalScheduleEnabled: false });

        // Update all saved sites: unset their per-site global flag and remove entries that exactly matched global times
        updateAllSavedSitesForGlobal(false, { startDate: sd, startTime: st, endDate: ed, endTime: et });
      }

      // Notify parent / Redux of updated UI snapshot (optimistic)
      try {
        dispatch(
          UPDATE_ADSNewApplication_FORM("savedUI", {
            mdmsCards,
            adsList,
            adsScheduleMap: enable
              ? (() => {
                  const optimisticMap = { ...(adsScheduleMap || {}) };
                  (adsForLocation || []).forEach((ad) => {
                    const key = ad.mdmsId ?? ad.id;
                    optimisticMap[key] = { startDate: sd, startTime: st, endDate: ed, endTime: et };
                  });
                  return optimisticMap;
                })()
              : adsScheduleBackupRef.current || adsScheduleMap || {},
            placeNameState,
            globalScheduleEnabled: !!enable,
            startDate: sd,
            endDate: ed,
            bookingFromTime: st,
            bookingToTime: et,
            siteId: getValues("siteId"),
            geolocation: getValues("geoLocation"),
          })
        );
      } catch (e) {
        console.warn("dispatch update on setGlobalSchedule failed", e);
      }
    },
    [adsForLocation, adsScheduleMap, mdmsCards, adsList, placeNameState, dispatch, getValues]
  );
  // ---- E1: init / restore (run once) ----
  useEffect(() => {
    // if parent provided savedUI, prefer it
    const parentUI = currentStepData?.savedUI;
    if (parentUI) {
      if (Array.isArray(parentUI.mdmsCards)) setMdmsCards(parentUI.mdmsCards);
      if (Array.isArray(parentUI.adsList)) setAdsList(parentUI.adsList);
      if (parentUI.adsScheduleMap) setAdsScheduleMap(parentUI.adsScheduleMap);
      if (typeof parentUI.placeNameState === "string") setPlaceNameState(parentUI.placeNameState || "");
      if (typeof parentUI.globalScheduleEnabled !== "undefined") {
        setGlobalScheduleEnabled(!!parentUI.globalScheduleEnabled);
        if (parentUI.startDate) setValue("startDate", parentUI.startDate, { shouldValidate: false });
        if (parentUI.endDate) setValue("endDate", parentUI.endDate, { shouldValidate: false });
        if (parentUI.bookingFromTime) setValue("bookingFromTime", parentUI.bookingFromTime, { shouldValidate: false });
        if (parentUI.bookingToTime) setValue("bookingToTime", parentUI.bookingToTime, { shouldValidate: false });
        if (parentUI.globalScheduleEnabled) applyGlobalToAll();
      }

      if (parentUI.siteId) {
        setValue("siteId", parentUI.siteId, { shouldValidate: false, shouldDirty: true });
        setAdsForLocation(mdmsAds.filter((a) => String(a.locationCode) === String(parentUI.siteId)));
      }
      if (parentUI.geoLocation) {
        setValue("geoLocation", parentUI.geoLocation, { shouldValidate: false, shouldDirty: true });
        setPlaceNameState(parentUI.geoLocation?.formattedAddress || "");
      }
      return;
    }

    const global = loadGlobal();
    if (global && global.globalScheduleEnabled) {
      setGlobalScheduleEnabled(true);
      if (global.startDate) setValue("startDate", global.startDate, { shouldValidate: false });
      if (global.endDate) setValue("endDate", global.endDate, { shouldValidate: false });
      if (global.bookingFromTime) setValue("bookingFromTime", global.bookingFromTime, { shouldValidate: false });
      if (global.bookingToTime) setValue("bookingToTime", global.bookingToTime, { shouldValidate: false });
      applyGlobalToAll();
      return;
    }

    const savedSites = loadAllSavedSites();
    if (savedSites && savedSites.length) {
      savedSites.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      const chosen = savedSites[0];
      if (chosen) {
        const chosenSiteId = String(chosen.siteId || "");
        setValue("siteId", chosenSiteId, { shouldValidate: false, shouldDirty: true });
        setSiteIdKey((k) => k + 1);
        setAdsForLocation(mdmsAds.filter((a) => String(a.locationCode) === chosenSiteId));
        setMdmsCards(Array.isArray(chosen.mdmsCards) ? chosen.mdmsCards : []);
        setAdsList(Array.isArray(chosen.adsList) ? chosen.adsList : []);
        setAdsScheduleMap(chosen.adsScheduleMap || {});
        setPlaceNameState(chosen.placeNameState || "");
        if (chosen.geoLocation) setValue("geoLocation", chosen.geoLocation, { shouldValidate: false, shouldDirty: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siteIdValue = watch("siteId");

  const globalReset = useCallback(
    () => {
      const curSite = getValues?.("siteId") || (watch && watch("siteId"));

      try {
        reset(initialFormDefaults);
      } catch (e) {
        console.warn("form reset failed", e);
      }

      try {
        setMdmsCards([]);
        setAdsList([]);
        setAdsScheduleMap({});
        setPlaceNameState("");
        setGlobalScheduleEnabled(false);
        adsScheduleBackupRef.current = null;
        setSiteIdKey((k) => k + 1);
      } catch (e) {
        console.warn("local state clear failed", e);
      }

      try {
        if (curSite) {
          try {
            localStorage.removeItem(`${PERSIST_KEY_PREFIX}${String(curSite)}`);
          } catch (err) {}
        }

        try {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(PERSIST_KEY_PREFIX)) keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch (err) {}

        try {
          localStorage.removeItem(PERSIST_GLOBAL_KEY);
        } catch (err) {}
      } catch (e) {
        console.warn("persistence clear failed", e);
      }

      // 4) update/clear Redux UI snapshot so parent sees reset state
      try {
        dispatch(
          UPDATE_ADSNewApplication_FORM("savedUI", {
            mdmsCards: [],
            adsList: [],
            adsScheduleMap: {},
            placeNameState: "",
            globalScheduleEnabled: false,
            startDate: "",
            endDate: "",
            bookingFromTime: "",
            bookingToTime: "",
            siteId: "", // ensure parent sees empty siteId
            geoLocation: null, // ensure parent sees geo cleared
          })
        );
      } catch (e) {
        console.warn("redux notify failed", e);
      }

      // 5) blur active element so controlled inputs apply reset values immediately
      try {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      } catch (e) {}
    },
    /* eslint-disable-next-line */ [reset, dispatch, setSiteIdKey, getValues, watch]
  );

  // ---------- intercept Ctrl/Cmd+R and run globalReset (capture phase) ----------
  useEffect(() => {
    const clearADSData = () => {
      // prevent immediate re-persist while we clear
      skipPersistRef.current = true;

      // 1) Clear ADS localStorage keys (case-insensitive)
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && String(k).toUpperCase().startsWith("ADS:")) {
            localStorage.removeItem(k);
          }
        }
      } catch (err) {
        console.warn("clear ADS localStorage failed", err);
      }

      // 2) Clear ADS sessionStorage fallback keys
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && String(k).startsWith("ADS:session:")) {
            sessionStorage.removeItem(k);
          }
        }
        sessionStorage.removeItem("ADS:session:last");
      } catch (err) {
        console.warn("clear ADS sessionStorage failed", err);
      }

      // 3) Dispatch Redux reset
      try {
        dispatch(RESET_ADS_NEW_APPLICATION_FORM());
      } catch (err) {
        console.warn("dispatch reset failed", err);
      }

      try {
        globalReset();
      } catch (err) {
        console.warn("globalReset threw", err);
      }
    };

    const keyHandler = (e) => {
      if (((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R" || e.code === "KeyR")) || e.code === "F5") {
        e.preventDefault();
        clearADSData();
        setTimeout(() => {
          skipPersistRef.current = false;
          window.location.reload();
        }, 60);
      }
    };

    // Handle ANY reload (reload button, F5, Ctrl+R, etc.)
    const beforeUnloadHandler = () => {
      clearADSData();
      // No need to call reload here — browser is already reloading
    };

    window.addEventListener("keydown", keyHandler, true);
    window.addEventListener("beforeunload", beforeUnloadHandler);

    return () => {
      window.removeEventListener("keydown", keyHandler, true);
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [dispatch, globalReset]);

  useEffect(() => {
    const site = siteIdValue;
    if (!site) return;

    // populate visible ads for that site
    setAdsForLocation(mdmsAds.filter((a) => String(a.locationCode) === String(site)));

    const global = loadGlobal();
    const isGlobalActive = global && global.globalScheduleEnabled;
    if (isGlobalActive) {
      setGlobalScheduleEnabled(true);
      if (global.startDate) setValue("startDate", global.startDate, { shouldValidate: false });
      if (global.endDate) setValue("endDate", global.endDate, { shouldValidate: false });
      if (global.bookingFromTime) setValue("bookingFromTime", global.bookingFromTime, { shouldValidate: false });
      if (global.bookingToTime) setValue("bookingToTime", global.bookingToTime, { shouldValidate: false });
      // apply to adsScheduleMap so individual inputs show global values
      applyGlobalToAll();
      // NOTE: no `return` here — continue to restore per-site cards below
    }

    // load per-site saved (localStorage) then session fallback
    const saved = loadForSite(String(site));
    let effectiveSaved = saved;
    if (!effectiveSaved) {
      try {
        const sessKeyById = `ADS:session:${String(site)}`;
        const sessKeyLast = `ADS:session:last`;
        const raw = sessionStorage.getItem(sessKeyById) || sessionStorage.getItem(sessKeyLast);
        if (raw) effectiveSaved = JSON.parse(raw);
      } catch (e) {
        // ignore parse/session errors
      }
    }

    if (effectiveSaved) {
      // if global is active we must make sure the saved mdmsCards' schedules reflect the global times
      const mdmsFromSaved = Array.isArray(effectiveSaved.mdmsCards) ? effectiveSaved.mdmsCards : [];
      const adsListFromSaved = Array.isArray(effectiveSaved.adsList) ? effectiveSaved.adsList : [];
      let mdmsToSet = mdmsFromSaved;

      if (isGlobalActive) {
        // prefer current form values (they were set above from global), fallback to global object
        const sd = getValues("startDate") || (global && global.startDate) || "";
        const st = getValues("bookingFromTime") || (global && global.bookingFromTime) || "";
        const ed = getValues("endDate") || (global && global.endDate) || "";
        const et = getValues("bookingToTime") || (global && global.bookingToTime) || "";

        // map saved cards to have schedules set to global values
        mdmsToSet = mdmsFromSaved.map((c) => {
          const startDatetime = sd && st ? `${sd}T${st}` : c.schedules?.[0]?.startDatetime || "";
          const endDatetime = ed && et ? `${ed}T${et}` : c.schedules?.[0]?.endDatetime || "";
          return { ...c, schedules: [{ startDatetime, endDatetime }] };
        });

        // also build/ensure adsScheduleMap has entries for these cards so the UI uses global values
        const newMap = { ...(adsScheduleMap || {}) };
        (mdmsToSet || []).forEach((c) => {
          const key = c.mdmsId ?? c.id;
          newMap[key] = {
            startDate: sd,
            startTime: st,
            endDate: ed,
            endTime: et,
          };
        });
        setAdsScheduleMap((prev) => ({ ...(prev || {}), ...(newMap || {}) }));
      } else {
        // if no global, prefer saved adsScheduleMap if any
        if (effectiveSaved.adsScheduleMap) setAdsScheduleMap(effectiveSaved.adsScheduleMap || {});
      }

      setMdmsCards(mdmsToSet);
      setAdsList(adsListFromSaved);
      setPlaceNameState(effectiveSaved.placeNameState || "");

      // restore form fields if present (already done for global above, but keep fallback)
      if (effectiveSaved.startDate) setValue("startDate", effectiveSaved.startDate, { shouldValidate: false });
      if (effectiveSaved.endDate) setValue("endDate", effectiveSaved.endDate, { shouldValidate: false });
      if (effectiveSaved.bookingFromTime) setValue("bookingFromTime", effectiveSaved.bookingFromTime, { shouldValidate: false });
      if (effectiveSaved.bookingToTime) setValue("bookingToTime", effectiveSaved.bookingToTime, { shouldValidate: false });

      // ensure global toggle remains correct if saved UI had it
      if (typeof effectiveSaved.globalScheduleEnabled !== "undefined") {
        // If a globally-persisted schedule is active, prefer that over the per-site saved flag.
        if (!isGlobalActive) {
          setGlobalScheduleEnabled(!!effectiveSaved.globalScheduleEnabled);
          if (effectiveSaved.globalScheduleEnabled) {
            // if per-site had it enabled, ensure UI shows those values
            applyGlobalToAll();
          }
        } else {
          // A global persisted schedule exists -> make sure form fields reflect global (defensive)
          if (global.startDate) setValue("startDate", global.startDate, { shouldValidate: false });
          if (global.endDate) setValue("endDate", global.endDate, { shouldValidate: false });
          if (global.bookingFromTime) setValue("bookingFromTime", global.bookingFromTime, { shouldValidate: false });
          if (global.bookingToTime) setValue("bookingToTime", global.bookingToTime, { shouldValidate: false });
          setGlobalScheduleEnabled(true);
          applyGlobalToAll();
        }
      }
    } else {
      // clear UI for new site
      setMdmsCards([]);
      setAdsList([]);
      setAdsScheduleMap({});
      setPlaceNameState("");
    }

    // populate geoLocation from MDMS location record if not present
    const locObj = findLocationByCode(site);
    const normalized = normalizeLocationToGeo(locObj);
    if (normalized) {
      setValue("geoLocation", normalized, { shouldValidate: false, shouldDirty: true });
      setPlaceNameState(normalized.formattedAddress);
      if (!watch("cartAddress")) setValue("cartAddress", normalized.formattedAddress);
    } else {
      // if location record has no geo_tag, clear geoLocation so user must pick it manually
      setValue("geoLocation", null, { shouldValidate: false });
      setPlaceNameState("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteIdValue, mdmsAds]);

  useEffect(() => {
    // don't spam — small debounce
    let timer = null;
    const snapshot = () => {
      try {
        const savedUI = {
          mdmsCards,
          adsList,
          adsScheduleMap,
          placeNameState,
          globalScheduleEnabled: !!globalScheduleEnabled,
          startDate: getValues("startDate") || "",
          endDate: getValues("endDate") || "",
          bookingFromTime: getValues("bookingFromTime") || "",
          bookingToTime: getValues("bookingToTime") || "",
          siteId: getValues("siteId") || "",
          geoLocation: getValues("geoLocation") || null,
        };

        dispatch(UPDATE_ADSNewApplication_FORM("savedUI", savedUI));

        try {
          sessionStorage.setItem(`ADS:session:${getValues("siteId") || "last"}`, JSON.stringify(savedUI));
        } catch (e) {
          // ignore session storage failures
        }
      } catch (e) {
        console.warn("sync savedUI failed", e);
      }
    };

    timer = setTimeout(snapshot, 120);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [mdmsCards, adsList, adsScheduleMap, placeNameState, globalScheduleEnabled, /* small deps only */ dispatch, getValues]);

  useEffect(() => {
    return () => {
      try {
        const savedUI = {
          mdmsCards,
          adsList,
          adsScheduleMap,
          placeNameState,
          globalScheduleEnabled: !!globalScheduleEnabled,
          startDate: getValues("startDate") || "",
          endDate: getValues("endDate") || "",
          bookingFromTime: getValues("bookingFromTime") || "",
          bookingToTime: getValues("bookingToTime") || "",
          siteId: getValues("siteId") || "",
          geoLocation: getValues("geoLocation") || null,
        };
        dispatch(UPDATE_ADSNewApplication_FORM("savedUI", savedUI));
        try {
          sessionStorage.setItem(`ADS:session:${getValues("siteId") || "last"}`, JSON.stringify(savedUI));
        } catch (e) {}
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  const startDateValue = watch("startDate");
  const endDateValue = watch("endDate");
  const fromTimeValue = watch("bookingFromTime");

  const toTimeValue = watch("bookingToTime");
  const currentlySelectedSiteId = watch("siteId");

  useEffect(() => {
    if (skipPersistRef.current) {
      return;
    }

    if (currentlySelectedSiteId) {
      saveForSite(currentlySelectedSiteId, {
        mdmsCards,
        adsList,
        adsScheduleMap,
        placeNameState,
        globalScheduleEnabled: !!globalScheduleEnabled,
        startDate: startDateValue || "",
        endDate: endDateValue || "",
        bookingFromTime: fromTimeValue || "",
        bookingToTime: toTimeValue || "",
      });
    }

    // global persistence (if global enabled or if user changed global fields)
    if (globalScheduleEnabled) {
      saveGlobal({
        globalScheduleEnabled: !!globalScheduleEnabled,
        startDate: startDateValue || "",
        endDate: endDateValue || "",
        bookingFromTime: fromTimeValue || "",
        bookingToTime: toTimeValue || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mdmsCards,
    adsList,
    adsScheduleMap,
    placeNameState,
    currentlySelectedSiteId,
    globalScheduleEnabled,
    startDateValue,
    endDateValue,
    fromTimeValue,
    toTimeValue,
  ]);

  // intercept Ctrl/Cmd+R and run globalReset (capture phase so we get the event before the browser)

  // ---------- global persistence helpers ----------

  const today = new Date();
  const applicationDate = today.getTime();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  today.setDate(today.getDate() + 1);
  const editAdvertisement = (idx) => {
    const ad = adsList[idx];
    if (!ad) return;
    reset({
      ...initialFormDefaults,
      ...ad,
      bookingFromTime: ad.bookingFromTime || nowHM,
      bookingToTime: ad.bookingToTime || nowHM,
    });
    setEditingIndex(idx);
    setPlaceNameState(ad.geoLocation?.formattedAddress || "");
  };
  const getLocalTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  const tomorrowStr = getLocalTodayStr();
  const defaultDt = `${tomorrowStr}T${nowHM}`;

  const isSameDaySelected = startDateValue && endDateValue && startDateValue === endDateValue;
  const endDateMinSafe = startDateValue || tomorrowStr;

  let endDateMin;
  if (startDateValue) {
    const d = new Date(startDateValue);
    d.setDate(d.getDate());
    endDateMin = d.toISOString().slice(0, 10);
  }

  const addAdvertisement = handleSubmit((data) => {
    if (editingIndex !== null && editingIndex >= 0) {
      setAdsList((prev) => prev.map((it, i) => (i === editingIndex ? data : it)));
      setEditingIndex(null);
    } else {
      setAdsList((prev) => [...prev, data]);
    }

    // reset form and restore time defaults
    reset({ ...initialFormDefaults, bookingFromTime: nowHM, bookingToTime: nowHM });
    setPlaceNameState("");
  });

  const removeAdvertisement = (idx) => {
    setAdsList((prev) => prev.filter((_, i) => i !== idx));
    // if the currently edited item was removed, clear editing state & reset form
    if (editingIndex === idx) {
      setEditingIndex(null);
      reset({ ...initialFormDefaults, bookingFromTime: nowHM, bookingToTime: nowHM });
      setPlaceNameState("");
    } else if (editingIndex !== null && editingIndex > idx) {
      // if we removed an earlier item, shift editing index left by one
      setEditingIndex((old) => (old !== null ? old - 1 : null));
    }
  };

  const onSubmit = handleSubmit((data) => {
    if (Object.keys(adsScheduleErrors).length > 0) {
      setShowToast({
        key: true, // or whatever truthy value your Toast expects for `error`
        label: "Please fix all schedule errors before proceeding.",
      });
      // setError("siteSelection", {
      //   type: "manual",
      //   message: "Please fix all schedule errors before proceeding.",
      // });
      return;
    }

    // NEW VALIDATION: Require at least one selected site
    // if ((mdmsCards?.length || 0) === 0 && (adsList?.length || 0) === 0) {
    //   // setShowToast({
    //   //   key: true,
    //   //   label: "Please select at least one site before proceeding.",
    //   // });
    //   setError("siteSelection", {
    //     type: "manual",
    //     message: "Please select at least one site before proceeding.",
    //   });
    //   return;
    // }

    if ((mdmsCards?.length || 0) === 0 && (adsList?.length || 0) === 0) {
      setError("siteSelection", {
        type: "manual",
        message: "Please select at least one site before proceeding.",
      });
      return;
    }

    // current site's mdms -> cartDetails
    const mdmsCartDetails = mdmsCards.flatMap((c) =>
      (c.schedules || []).map((s) => {
        const [sDate, sTime = nowHM] = (s.startDatetime || "").split("T");
        const [eDate, eTime = nowHM] = (s.endDatetime || "").split("T");
        return {
          addType: c.adType || "",
          bookingDate: sDate || "",
          endDate: eDate || "",
          bookingFromTime: sTime || nowHM,
          bookingToTime: eTime || nowHM,
          advertisementId: c.mdmsId?.toString() || "",
          cartId: c.mdmsId?.toString() || "",
          cartAddress: c.name || "",
          geoLocation: c.geoLocation || normalizeLocationToGeo(findLocationByCode(c.locationCode)) || "",
          faceArea: `${c.width || ""}x${c.height || ""}`,
          location: c.locationCode || "",
          status: "BOOKING_CREATED",
          availabilityStatus: c.available === false ? "UNAVAILABLE" : "AVAILABLE",
          amount: c.amount || "",
        };
      })
    );

    // current manual ads
    const adsToSubmit = [...adsList, ...mdmsCartDetails];

    // current normalized cartDetails
    const cartDetails = adsToSubmit.map((d) => ({
      addType: d.advertisementType?.code || d.advertisementType || d.addType || "",
      bookingDate: d.bookingDate || d.startDate || "",
      endDate: d.endDate || d.endDate || "",
      bookingFromTime: d.bookingFromTime || "",
      bookingToTime: d.bookingToTime || "",
      advertisementId: d.advertisementId || d.siteId || d.mdmsId?.toString() || "",
      cartId: d.cartId || d.cartId || d.siteId || d.mdmsId?.toString() || "",
      cartAddress: d.cartAddress || d.name || "",
      geoLocation: d.geoLocation || (d.geoLocation?.code ? d.geoLocation.code : "") || "",
      faceArea: d.faceArea || (d.size?.code ? d.size.code : "") || "",
      location: d.location || d.locationCode || d.siteId || (d.siteName?.code ? d.siteName.code : "") || "",
      status: "BOOKING_CREATED",
      availabilityStatus: d.availabilityStatus || (d.available === false ? "UNAVAILABLE" : "AVAILABLE") || "",
      rate: d.amount || "",
      light: d.nightLight || "",
    }));

    // --- NEW: collect other saved sites (excluding current site) ---
    const allSaved = loadAllSavedSites(); // now defined by helper above
    let otherCartDetails = [];
    const currentSite = watch("siteId") || getValues("siteId");

    allSaved.forEach((s) => {
      if (!s || !s.siteId) return;
      if (String(s.siteId) === String(currentSite)) return; // skip current site (already in cartDetails)
      otherCartDetails = otherCartDetails.concat(convertSavedToCartDetails(s));
    });

    // dedupe (simple key: adId::cartId::bookingDate)
    const dedupeMap = new Map();
    const pushDeduped = (entry) => {
      const key = `${entry.advertisementId || ""}::${entry.cartId || ""}::${entry.bookingDate || ""}`;
      if (!dedupeMap.has(key)) {
        dedupeMap.set(key, true);
        return true;
      }
      return false;
    };

    const finalCartDetails = [];
    cartDetails.forEach((c) => {
      if (pushDeduped(c)) finalCartDetails.push(c);
    });
    otherCartDetails.forEach((c) => {
      if (pushDeduped(c)) finalCartDetails.push(c);
    });

    // minimal payload we forward to parent (parent will save it into Redux)
    const payload = {
      cartDetails: finalCartDetails,
      cartAddress: data.cartAddress,

      // --- save UI state so Next -> Back can restore exact global checkbox & per-site UI ---
      savedUI: {
        mdmsCards,
        adsList,
        adsScheduleMap,
        placeNameState,
        globalScheduleEnabled,
        // <-- add global form values here so Redux has them when we come back
        startDate: getValues("startDate") || "",
        endDate: getValues("endDate") || "",
        bookingFromTime: getValues("bookingFromTime") || "",
        bookingToTime: getValues("bookingToTime") || "",
        siteId: getValues("siteId") || "",
        geoLocation: getValues("geoLocation") || null,
      },
    };
    if (currentSite) {
      saveForSite(currentSite, {
        mdmsCards,
        adsList,
        adsScheduleMap,
        placeNameState,
        globalScheduleEnabled: !!globalScheduleEnabled,
        startDate: getValues("startDate") || "",
        endDate: getValues("endDate") || "",
        bookingFromTime: getValues("bookingFromTime") || "",
        bookingToTime: getValues("bookingToTime") || "",
        geoLocation: getValues("geoLocation"),
      });
    }
    // Save to Redux immediately so parent/currentStepData has the global values
    dispatch(UPDATE_ADSNewApplication_FORM("savedUI", payload.savedUI));

    // forward to parent (NewADSStepFormTwo.goNext will handle navigation)
    goNext(payload);
  });

  useEffect(() => {
    if (!adsScheduleMap || mdmsCards.length === 0) return;

    setMdmsCards((prev) =>
      prev.map((card) => {
        const key = card.mdmsId ?? card.id;
        const entry = adsScheduleMap[key] || adsScheduleMap[String(key)];
        if (!entry) return card;

        const start = entry.startDate && entry.startTime ? `${entry.startDate}T${entry.startTime}` : card.schedules?.[0]?.startDatetime || "";
        const end = entry.endDate && entry.endTime ? `${entry.endDate}T${entry.endTime}` : card.schedules?.[0]?.endDatetime || "";

        // if nothing changed, return original object (avoid re-renders)
        const prevStart = card.schedules?.[0]?.startDatetime || "";
        const prevEnd = card.schedules?.[0]?.endDatetime || "";
        if (prevStart === start && prevEnd === end) return card;

        return { ...card, schedules: [{ startDatetime: start, endDatetime: end }] };
      })
    );
  }, [adsScheduleMap]);

<<<<<<< Updated upstream
  console.log("errors", errors);

  useEffect(() => {
    if ((mdmsCards?.length || 0) > 0 || (adsList?.length || 0) > 0) {
      clearErrors("siteSelection");
    }
  }, [mdmsCards, adsList, clearErrors]);

=======
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };
>>>>>>> Stashed changes

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              Search By site id <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="siteId"
              rules={{
                validate: (val) => {
                  if ((mdmsCards?.length || 0) === 0 && (adsList?.length || 0) === 0) {
                    if (!val || String(val).trim() === "") return "This field is required";
                  }
                  if (val && String(val).length > 100) return "Maximum 100 characters";
                  return true;
                },
              }}
              render={(props) => {
                if (isMdmsLoading) {
                  return <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={props.onBlur} />;
                }

                const options = locationOptions.map((o) => ({ ...o, label: o.label }));

                const selectedOption = options.find((o) => String(o.code) === String(props.value)) || null;

                return (
                  <Dropdown
                    key={siteIdKey}
                    className="form-field"
                    option={options.map((opt) => ({
                      ...opt,
                      label: t(opt.label),
                    }))}
                    optionKey="label"
                    selected={selectedOption}
                    select={(val) => {
                      if (!val) return;
                      // store locationCode string in siteId
                      // props.onChange(String(val.code || ""));
                      const chosenSite = String(val.code || "");
                      props.onChange(chosenSite);

                      // show ads for that location
                      const filtered = mdmsAds.filter((a) => String(a.locationCode) === String(val.code));
                      setAdsForLocation(filtered || []);

                      // load persisted data for this site if present
                      const saved = loadForSite(chosenSite);
                      const global = loadGlobal();
                      const isGlobalActive = global && global.globalScheduleEnabled;

                      if (saved) {
                        // restore arrays/objects
                        setMdmsCards(Array.isArray(saved.mdmsCards) ? saved.mdmsCards : []);
                        setAdsList(Array.isArray(saved.adsList) ? saved.adsList : []);
                        setAdsScheduleMap(saved.adsScheduleMap || {});
                        if (saved && typeof saved.globalScheduleEnabled !== "undefined") {
                          // Do NOT let per-site saved global flag override a globally-persisted schedule.
                          if (!isGlobalActive) {
                            setGlobalScheduleEnabled(!!saved.globalScheduleEnabled);

                            if (saved.startDate) setValue("startDate", saved.startDate, { shouldValidate: false });
                            if (saved.endDate) setValue("endDate", saved.endDate, { shouldValidate: false });
                            if (saved.bookingFromTime) setValue("bookingFromTime", saved.bookingFromTime, { shouldValidate: false });
                            if (saved.bookingToTime) setValue("bookingToTime", saved.bookingToTime, { shouldValidate: false });

                            if (saved.globalScheduleEnabled) {
                              applyGlobalToAll();
                            }
                          } else {
                            // A global persisted schedule exists: apply global values instead of per-site ones.
                            if (global.startDate) setValue("startDate", global.startDate, { shouldValidate: false });
                            if (global.endDate) setValue("endDate", global.endDate, { shouldValidate: false });
                            if (global.bookingFromTime) setValue("bookingFromTime", global.bookingFromTime, { shouldValidate: false });
                            if (global.bookingToTime) setValue("bookingToTime", global.bookingToTime, { shouldValidate: false });
                            setGlobalScheduleEnabled(true);
                            applyGlobalToAll();
                          }
                        }
                      } else {
                        setMdmsCards([]);
                        setAdsList([]);
                        setAdsScheduleMap({});
                      }
<<<<<<< Updated upstream
                    } else {
                      setMdmsCards([]);
                      setAdsList([]);
                      setAdsScheduleMap({});
                    }
                    const locObj = findLocationByCode(val.code);
                    const normalized = normalizeLocationToGeo(locObj);
                    if (normalized) {
                      setValue("geoLocation", normalized, { shouldValidate: true, shouldDirty: true });
                      setPlaceNameState(normalized.formattedAddress);
                      if (!watch("cartAddress")) setValue("cartAddress", normalized.formattedAddress);
                    } else {
                      // if location record has no geo_tag, clear geoLocation so user must pick it manually
                      setValue("geoLocation", null, { shouldValidate: false });
                      setPlaceNameState("");
                    }
                  }}
                />
              );
            }}
          />
          {errors.siteSelection && <p style={{ color: "red", marginTop: "4px" }}>{errors.siteSelection.message}</p>}
=======
                      const locObj = findLocationByCode(val.code);
                      const normalized = normalizeLocationToGeo(locObj);
                      if (normalized) {
                        setValue("geoLocation", normalized, { shouldValidate: true, shouldDirty: true });
                        setPlaceNameState(normalized.formattedAddress);
                        if (!watch("cartAddress")) setValue("cartAddress", normalized.formattedAddress);
                      } else {
                        // if location record has no geo_tag, clear geoLocation so user must pick it manually
                        setValue("geoLocation", null, { shouldValidate: false });
                        setPlaceNameState("");
                      }
                    }}
                  />
                );
              }}
            />
          </LabelFieldPair>
          {errors.siteId && <CardLabelError style={errorStyle}>{errors.siteId.message}</CardLabelError>}
>>>>>>> Stashed changes

          <div className="field" style={{ margin: "12px 0", padding: 8, border: "1px solid #eee", borderRadius: 6, width: "80%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>
                <input type="checkbox" checked={globalScheduleEnabled} onChange={(e) => setGlobalSchedule(e.target.checked)} />{" "}
                {t ? t("USE_SAME_BOOKING_DATETIME_FOR_ALL_ADS") : "Use same booking date/time for all ads"}
              </label>
              {globalScheduleEnabled && <div style={{ color: "#666", fontSize: 12 }}>Global schedule applied — individual times disabled</div>}
            </div>

            {/* GLOBAL Start */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">Global Start Date & Time</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="startDate"
                  rules={{ required: globalScheduleEnabled ? "This field is required" : false }}
                  render={(props) => {
                    const timeVal = watch("bookingFromTime") || nowHM;
                    const datetimeVal = props.value ? `${props.value}T${timeVal}` : ""; // leave empty so placeholder shows

                    const placeholderVal = formatDisplay("", "");
                    return (
                      <input
                        type="datetime-local"
                        min={`${tomorrowStr}T00:00`}
                        value={datetimeVal}
                        placeholder={placeholderVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) {
                            props.onChange("");
                            setValue("bookingFromTime", "");
                            return;
                          }
                          const [datePart, timePart] = v.split("T");
                          props.onChange(datePart);
                          setValue("bookingFromTime", timePart);
                          // when global is enabled, propagate to all ads immediately
                          if (globalScheduleEnabled) applyGlobalToAll();
                        }}
                        onBlur={(e) => props.onBlur(e)}
                      />
                    );
                  }}
                />
              </div>
            </LabelFieldPair>
            {errors.startDate && <CardLabelError style={errorStyle}>{errors.startDate.message}</CardLabelError>}

            {/* GLOBAL End */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">Global End Date & Time</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="endDate"
                  rules={{ required: globalScheduleEnabled ? "This field is required" : false }}
                  render={(props) => {
                    const timeVal = watch("bookingToTime") || nowHM;
                    const minDate = watch("startDate") || tomorrowStr;
                    const datetimeVal = props.value ? `${props.value}T${timeVal}` : "";

                    const placeholderVal = formatDisplay("", "");
                    return (
                      <input
                        type="datetime-local"
                        min={`${minDate}T00:00`}
                        value={datetimeVal}
                        placeholder={placeholderVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) {
                            props.onChange("");
                            setValue("bookingToTime", "");
                            return;
                          }
                          const [datePart, timePart] = v.split("T");
                          props.onChange(datePart);
                          setValue("bookingToTime", timePart);
                          if (globalScheduleEnabled) applyGlobalToAll();
                        }}
                        onBlur={(e) => props.onBlur(e)}
                      />
                    );
                  }}
                />
              </div>
            </LabelFieldPair>
            {errors.endDate && <CardLabelError style={errorStyle}>{errors.endDate.message}</CardLabelError>}

            <Controller
              control={control}
              name="bookingFromTime"
              rules={{
                required: globalScheduleEnabled ? "Start time is required" : false,
              }}
              render={(props) => (
                <input type="hidden" value={props.value || ""} onChange={(e) => props.onChange(e.target.value)} onBlur={props.onBlur} />
              )}
            />

            <Controller
              control={control}
              name="bookingToTime"
              rules={{
                required: globalScheduleEnabled ? "End time is required" : false,
                validate: (toTime) => {
                  if (!globalScheduleEnabled) return true; // only validate when global is enabled

                  const fromDate = getValues("startDate") || "";
                  const toDate = getValues("endDate") || "";
                  const fromTime = getValues("bookingFromTime") || "";
                  const bookingFrom = fromDate && fromTime ? `${fromDate}T${fromTime}` : "";
                  const bookingTo = toDate && toTime ? `${toDate}T${toTime}` : "";

                  const err = validateScheduleForAdd(bookingFrom, bookingTo);
                  return err ? err : true;
                },
              }}
              render={(props) => (
                <input
                  type="hidden"
                  value={props.value || ""}
                  onChange={(e) => props.onChange(e.target.value)}
                  onBlur={(e) => {
                    props.onBlur(e);
                    if (globalScheduleEnabled) trigger("bookingToTime");
                  }}
                />
              )}
            />
<<<<<<< Updated upstream
=======
            {errors.bookingToTime && <p style={errorStyle}>{errors.bookingToTime.message}</p>}
>>>>>>> Stashed changes
          </div>

          {adsForLocation.length > 0 && (
            <div style={{ margin: "12px 0" }}>
              {errors.bookingToTime && <p style={{ color: "red" }}>{errors.bookingToTime.message}</p>}
              {errors.scheduleValidation && <p style={{ color: "red", marginTop: "4px" }}>{errors.scheduleValidation.message}</p>}
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{t ? t("ADS_IN_SELECTED_LOCATION") : "Advertisements in selected location"}</div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {adsForLocation.slice(0, visibleCount).map((ad, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 280,
                      border: "1px solid #eee",
                      borderRadius: 8,
                      padding: 8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      background: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {/* image on top */}
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                      {ad.imageSrc ? (
                        <img
                          src={ad.imageSrc}
                          alt={ad.name}
                          loading="lazy"
                          style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: 140, background: "#f5f5f5", borderRadius: 6 }} />
                      )}
                    </div>

                    {/* title & meta */}
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: "1.1" }}>{ad.name || `Ad ${ad.id}`}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#666", display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 8px" }}>
                        <div style={{ fontWeight: 600 }}>ID:</div>
                        <div>{ad.id}</div>
                        <div style={{ fontWeight: 600 }}>Pole No:</div>
                        <div>{ad.poleNo}</div>
                        <div style={{ fontWeight: 600 }}>Type:</div>
                        <div>{ad.adType}</div>
                        <div style={{ fontWeight: 600 }}>Size:</div>
                        <div>
                          {ad.width} x {ad.height}
                        </div>
                        <div style={{ fontWeight: 600 }}>NightLight:</div>
                        <div>{ad.light}</div>
                        <div style={{ fontWeight: 600 }}>Amount:</div>
                        <div>₹{ad.amount}</div>
                        <div style={{ fontWeight: 600 }}>Available:</div>
                        <div>{String(ad.available)}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontSize: 11, color: "#666" }}>Start</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="date"
                          min={tomorrowStr}
                          value={adsScheduleMap[ad.id]?.startDate || (globalScheduleEnabled ? getValues("startDate") || "" : "")}
                          onChange={(e) => {
                            if (globalScheduleEnabled) return;
                            const newStart = e.target.value;
                            const prevEntry = adsScheduleMap[ad.id] || {};
                            const prevEndDate = prevEntry.endDate;
                            const adjustedEndDate = prevEndDate && prevEndDate < newStart ? newStart : prevEndDate;
                            const newEntry = { ...(prevEntry || {}), startDate: newStart, endDate: adjustedEndDate };
                            setAdsScheduleMap((prev) => ({ ...prev, [ad.id]: newEntry }));
                            validateAdSchedule(ad.id, newEntry);
                          }}
                          disabled={globalScheduleEnabled}
                          style={{ flex: 1, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                        />
                        <input
                          type="time"
                          value={adsScheduleMap[ad.id]?.startTime || (globalScheduleEnabled ? getValues("bookingFromTime") || "" : "")}
                          onChange={(e) => {
                            if (globalScheduleEnabled) return;
                            const newStartTime = e.target.value;
                            const prevEntry = adsScheduleMap[ad.id] || {};
                            const newEntry = { ...(prevEntry || {}), startTime: newStartTime };
                            setAdsScheduleMap((prev) => ({ ...prev, [ad.id]: newEntry }));
                            validateAdSchedule(ad.id, newEntry);
                          }}
                          disabled={globalScheduleEnabled}
                          style={{ width: 100, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                        />
                      </div>

                      <div style={{ height: 8 }} />
                      {/* {errors.siteSelection && <p style={{ color: "red", marginTop: "0.5rem" }}>{errors.siteSelection.message}</p>} */}

                      <div style={{ fontSize: 11, color: "#666" }}>End</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="date"
                          min={globalScheduleEnabled ? getValues("startDate") || tomorrowStr : adsScheduleMap[ad.id]?.startDate || tomorrowStr}
                          value={adsScheduleMap[ad.id]?.endDate || (globalScheduleEnabled ? getValues("endDate") || "" : "")}
                          onChange={(e) => {
                            if (globalScheduleEnabled) return;
                            const newEnd = e.target.value;
                            const prevEntry = adsScheduleMap[ad.id] || {};
                            const safeEnd = prevEntry.startDate && newEnd < prevEntry.startDate ? prevEntry.startDate : newEnd;
                            const newEntry = { ...(prevEntry || {}), endDate: safeEnd };
                            setAdsScheduleMap((prev) => ({ ...prev, [ad.id]: newEntry }));
                            validateAdSchedule(ad.id, newEntry);
                          }}
                          disabled={globalScheduleEnabled}
                          style={{ flex: 1, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                        />
                        <input
                          type="time"
                          value={adsScheduleMap[ad.id]?.endTime || (globalScheduleEnabled ? getValues("bookingToTime") || "" : "")}
                          onChange={(e) => {
                            if (globalScheduleEnabled) return;
                            const newEndTime = e.target.value;
                            const prevEntry = adsScheduleMap[ad.id] || {};
                            const newEntry = { ...(prevEntry || {}), endTime: newEndTime };
                            setAdsScheduleMap((prev) => ({ ...prev, [ad.id]: newEntry }));
                            validateAdSchedule(ad.id, newEntry);
                          }}
                          disabled={globalScheduleEnabled}
                          style={{ width: 100, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Hint: pick date & time (min: tomorrow)</div>
                      {adsScheduleErrors[ad.id] && <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>{adsScheduleErrors[ad.id]}</div>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <div>
                        {mdmsCards.find((p) => String(p.mdmsId) === String(ad.id)) ? (
                          <button
                            type="button"
                            onClick={() => setMdmsCards((prev) => prev.filter((p) => String(p.mdmsId) !== String(ad.id)))}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #d0d0d0",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            {t ? t("Remove") : "Remove"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const effective = globalScheduleEnabled
                                ? {
                                    startDate: getValues("startDate") || "",
                                    startTime: getValues("bookingFromTime") || "",
                                    endDate: getValues("endDate") || "",
                                    endTime: getValues("bookingToTime") || "",
                                  }
                                : adsScheduleMap[ad.id] || {};

                              const start = effective.startDate && effective.startTime ? `${effective.startDate}T${effective.startTime}` : "";
                              const end = effective.endDate && effective.endTime ? `${effective.endDate}T${effective.endTime}` : "";

                              // if (!start || !end) {
                              //   // alert("Please fill both start and end date & time before adding.");
                              //   setShowToast({
                              //     key: true,
                              //     label: "Please fill both start and end date & time before adding.",
                              //   });
                              //   return;
                              // }
                              // if (typeof tomorrowStr !== "undefined" && (effective.startDate < tomorrowStr || effective.endDate < tomorrowStr)) {
                              //   // alert(`Dates must be from ${tomorrowStr} or later.`);
                              //   setShowToast({
                              //     key: true,
                              //     label: `Dates must be from ${tomorrowStr} or later.`,
                              //   });
                              //   return;
                              // }

                              if (!start || !end) {
                                setError("scheduleValidation", {
                                  type: "manual",
                                  message: "Please fill both start and end date & time before adding.",
                                });
                                return false;
                              }

                              if (typeof tomorrowStr !== "undefined" && (effective.startDate < tomorrowStr || effective.endDate < tomorrowStr)) {
                                setError("scheduleValidation", {
                                  type: "manual",
                                  message: `Dates must be from ${tomorrowStr} or later.`,
                                });
                                return false;
                              }
                              const startDt = new Date(start);
                              const endDt = new Date(end);
                              if (endDt <= startDt) {
                                // alert("End date/time must be after start date/time.");
                                setShowToast({
                                  key: true,
                                  label: "End date/time must be after start date/time.",
                                });
                                return;
                              }

                              if (adsScheduleErrors[ad.id]) {
                                // alert(adsScheduleErrors[ad.id]);
                                setShowToast({
                                  key: true,
                                  label: adsScheduleErrors[ad.id],
                                });
                                return;
                              }

                              clearErrors("scheduleValidation");

                              const locForAd = findLocationByCode ? findLocationByCode(ad.locationCode) : null;
                              const normalizedGeoForAd =
                                typeof normalizeLocationToGeo === "function" && locForAd ? normalizeLocationToGeo(locForAd) : ad.locationCode;
                              const card = {
                                mdmsId: ad.id,
                                poleNo: ad.poleNo,
                                name: ad.name,
                                adType: ad.adType,
                                width: ad.width,
                                height: ad.height,
                                amount: ad.amount,
                                available: ad.available,
                                nightLight: ad.light,
                                locationCode: ad.locationCode,
                                geoLocation: normalizedGeoForAd,
                                schedules: [{ startDatetime: start, endDatetime: end }],
                                addedByUser: true,
                              };
                              setMdmsCards((prev) => [...prev, card]);
                            }}
                            disabled={!!adsScheduleErrors[ad.id]}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "none",
                              background: !!adsScheduleErrors[ad.id] ? "#ccc" : "#2947a3",
                              color: "#fff",
                              cursor: !!adsScheduleErrors[ad.id] ? "not-allowed" : "pointer",
                            }}
                          >
                            {t ? t("Add") : "Add"}
                          </button>
                        )}
                      </div>

                      <div>
                        {mdmsCards.find((p) => String(p.mdmsId) === String(ad.id)) && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "green", fontWeight: 700 }}>
                            <span style={{ fontSize: 14 }}>✔</span>
                            <span>{t ? t("Added") : "Added"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {mdmsCards.find((p) => String(p.mdmsId) === String(ad.id))?.schedules?.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#333" }}>
                        {(mdmsCards.find((p) => String(p.mdmsId) === String(ad.id))?.schedules || []).map((s, si) => (
                          <div key={si} style={{ color: "#666" }}>
                            <strong>{si === 0 ? "Schedule" : `Schedule ${si + 1}`}</strong>: {formatDisplay(s.startDatetime)} →{" "}
                            {formatDisplay(s.endDatetime)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {visibleCount < adsForLocation.length && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <button
                    onClick={showMore}
                    type="button"
                    style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                  >
                    {t ? t("Show more") : "Show more"}
                  </button>
                </div>
              )}
            </div>
          )}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              Geo Location <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="field">
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
            </div>
          </LabelFieldPair>
          {errors.geoLocation && <CardLabelError style={errorStyle}>{errors.geoLocation.message}</CardLabelError>}
        </div>

        <ActionBar>
          {/* <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} /> */}
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
        {/* <button type="submit">submit</button> */}
        {showToast && (
          <Toast
            error={showToast.key}
            label={t(showToast.label)}
            style={{ bottom: "0px" }}
            onClose={() => {
              setShowToast(null);
            }}
            isDleteBtn={true}
          />
        )}
      </form>
    </React.Fragment>
  );
};

export default ADSCitizenSecond;
