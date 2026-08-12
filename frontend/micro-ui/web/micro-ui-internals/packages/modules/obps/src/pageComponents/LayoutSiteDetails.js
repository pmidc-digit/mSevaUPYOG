

import React, { useEffect, useState, useRef } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  Dropdown,
  TextArea,
  BreakLine,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  UploadFile,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import CustomUploadFile from "../components/CustomUploadFile";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import CustomDatePicker from "./CustomDatePicker";

const LayoutSiteDetails = (_props) => {
  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }

  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, useFieldArray, watch, cluValidationRef, getValues, clearErrors } = _props;
  const applicationNo = currentStepData?.applicationNo || currentStepData?.apiData?.applicationNo || currentStepData?.apiData?.Layout?.[0]?.applicationNo || watch("applicationNo");
  //console.log(applicationNo, getValues("vasikaDate"), "applicationNo in layout site details");
  const isEditMode = !!applicationNo || window.location.pathname.includes("edit");
  const [netArea, setNetArea] = useState("0.00");
  const AreaLeftForRoadWidening = watch("areaLeftForRoadWidening"); // A = Total Plot Area
  const NetPlotArea = watch("netPlotAreaAfterWidening"); // B = Net Plot Area After Widening
  const EWSArea = watch("areaUnderEWS"); // C = Area Under EWS

  const [areaMismatchError, setAreaMismatchError] = useState(null);
  const [totalAreaPercentage, setTotalAreaPercentage] = useState("0.00");
  const [isCluRequired, setIsCluRequired] = useState(null);
  const [cluType, setCluType] = useState(null);
  const [buildingCategoryMain, setBuildingCategoryMain] = useState(null);
  const [cluDocumentUploadedFile, setCluDocumentUploadedFile] = useState(null);
  const [cluDocumentLoader, setCluDocumentLoader] = useState(false);
  const [cluDocumentError, setCluDocumentError] = useState(null);
  const [cluValidationLoading, setCluValidationLoading] = useState(false);
  const [cluValidationError, setCluValidationError] = useState(null);
  const [isCluValidated, setIsCluValidated] = useState(false);
  const isInitialized = useRef(false);
  const cluNumberVal = watch("cluNumber");
  const [retrievedClu, setRetrievedClu] = useState(null);
  const [retrievedCluDocs, setRetrievedCluDocs] = useState([]);
  const validatedCluNumberRef = useRef(currentStepData?.siteDetails?.cluNumber || "");

  const updateValidatedCluNumber = (val) => {
    validatedCluNumberRef.current = val;
  };

  const updateCluValidated = (val) => {
    setIsCluValidated(val);
    if (val && clearErrors) {
      clearErrors("cluNumber");
    }
  };

  const isCluRequiredVal = watch("isCluRequired");
  const cluTypeVal = watch("cluType");

  const getCode = (obj) => (typeof obj === "string" ? obj : obj?.code || obj?.name || "");

  const resetCluSubFields = () => {
    setValue("cluNumber", "");
    setValue("cluNumberOffline", "");
    setValue("cluApprovalDate", "");
    setValue("cluDocumentUpload", null);
    setCluDocumentUploadedFile(null);
    setRetrievedClu(null);
    setRetrievedCluDocs([]);
    setCluValidationError(null);
    setCluDocumentError(null);
    updateCluValidated(false);
    updateValidatedCluNumber("");
  };

  const prevIsCluRequiredRef = useRef(isCluRequiredVal);

  // Reset all dependent CLU fields when isCluRequired changes
  useEffect(() => {
    const prevCode = getCode(prevIsCluRequiredRef.current);
    const currentCode = getCode(isCluRequiredVal);
    if (prevCode && prevCode !== currentCode) {
      setValue("cluType", null);
      setCluType(null);
      resetCluSubFields();
    }
    prevIsCluRequiredRef.current = isCluRequiredVal;
  }, [isCluRequiredVal]);

  const prevCluTypeRef = useRef(cluTypeVal);

  // Reset all dependent CLU fields when cluType changes
  useEffect(() => {
    const prevCode = getCode(prevCluTypeRef.current);
    const currentCode = getCode(cluTypeVal);
    if (prevCode && prevCode !== currentCode) {
      resetCluSubFields();
    }
    prevCluTypeRef.current = cluTypeVal;
  }, [cluTypeVal]);

  // In EDIT mode, if existing CLU number is present, auto-validate and search on initial load
  useEffect(() => {
    const isEditPage = window.location.pathname.includes("edit") || !!currentStepData?.applicationNo || !!currentStepData?.apiData?.applicationNo || !!currentStepData?.apiData?.Layout?.[0]?.applicationNo;
    const existingClu = currentStepData?.siteDetails?.cluNumber || cluNumberVal;
    if (isEditPage && existingClu && !isInitialized.current) {
      isInitialized.current = true;
      handleValidateClu(existingClu);
    }
  }, [currentStepData]);

  useEffect(() => {
    const currentValStr = (typeof cluNumberVal === "string" ? cluNumberVal : (cluNumberVal?.code || cluNumberVal?.name || ""))?.trim()?.toLowerCase();
    const validatedStr = (validatedCluNumberRef.current || "")?.trim()?.toLowerCase();
    if (isCluValidated && validatedStr && currentValStr && currentValStr !== validatedStr) {
      updateCluValidated(false);
      setRetrievedCluDocs([]);
      setRetrievedClu(null);
      setCluValidationError(null);
      setValue("cluDocumentUpload", null);
    }
  }, [cluNumberVal, isCluValidated]);

  const handleViewDocument = async (doc) => {
    let fileUrl = doc?.url;
    const docId = doc?.fileStoreId || (typeof watch("cluDocumentUpload") === "string" ? watch("cluDocumentUpload") : watch("cluDocumentUpload")?.fileStoreId);

    if (!fileUrl && docId) {
      const fetchTenant = retrievedClu?.tenantId || stateId || Digit.ULBService.getStateId();
      try {
        const fetchRes = await Digit.UploadServices.Filefetch([docId], fetchTenant);
        if (fetchRes?.data?.fileStoreIds?.[0]?.url) {
          fileUrl = fetchRes.data.fileStoreIds[0].url;
        } else if (fetchRes?.data?.[docId]) {
          fileUrl = fetchRes.data[docId];
        } else {
          const fileStore = await Digit.PaymentService.printReciept(fetchTenant, { fileStoreIds: docId });
          if (fileStore?.[docId]) {
            fileUrl = fileStore[docId];
          }
        }
      } catch (err) {
        console.error("Error fetching CLU document URL:", err);
      }
    }

    if (fileUrl) {
      const finalUrl = typeof fileUrl === "string" ? fileUrl.split(",")?.[0] : fileUrl;
      window.open(finalUrl, "_blank");
    } else {
      console.error("No URL found for CLU document", doc);
    }
  };

  const handleValidateClu = async (cluNum) => {
    const rawNum = typeof cluNum === "string" ? cluNum : (typeof cluNumberVal === "string" ? cluNumberVal : (cluNumberVal?.code || cluNumberVal?.name || getValues("cluNumber")?.code || getValues("cluNumber") || ""));
    const numToSearch = (typeof rawNum === "string" ? rawNum : "")?.trim();
    if (!numToSearch) {
      setCluValidationError("Please enter CLU Number");
      return;
    }

    const cluRegex = /^PB-CLU-.*-\d+$/i;
    if (!cluRegex.test(numToSearch)) {
      setCluValidationError("Invalid CLU Number format.");
      updateCluValidated(false);
      updateValidatedCluNumber("");
      setRetrievedClu(null);
      setRetrievedCluDocs([]);
      setValue("cluDocumentUpload", null);
      return;
    }

    setCluValidationLoading(true);
    setCluValidationError(null);

    try {
      let searchTenantId = tenantId;
      const parts = numToSearch.split("-");
      if (parts.length >= 4 && parts[3]) {
        searchTenantId = `pb.${parts[3].toLowerCase()}`;
      }

      let result = await Digit.OBPSService.CLUSearch({
        filters: { applicationNo: numToSearch },
        tenantId: searchTenantId,
      });


      const cluApp = result?.Clu?.[0];
      if (cluApp) {
        setRetrievedClu(cluApp);
        const fileStoreIds = [];

        const sanctionLetterFilestoreId =
          cluApp?.cluDetails?.additionalDetails?.sanctionLetterFilestoreId ||
          cluApp?.additionalDetails?.sanctionLetterFilestoreId;

        if (sanctionLetterFilestoreId) {
          fileStoreIds.push(sanctionLetterFilestoreId);
        } else {
          const docs = cluApp?.documents || cluApp?.cluDetails?.documents || [];

          docs.forEach((d) => {
            const fid = d.fileStoreId;

            if (fid && !fileStoreIds.includes(fid)) {
              fileStoreIds.push(fid);
            }
          });
        }


        if (fileStoreIds.length > 0) {
          let mappedDocs = [];
          const fetchTenant = cluApp?.tenantId || searchTenantId;
          try {
            const fileFetchResponse = await Digit.UploadServices.Filefetch(fileStoreIds, fetchTenant);
            const pdfFiles = fileFetchResponse?.data || {};

            mappedDocs = fileStoreIds.map((fid) => {
              let rawUrl = "";
              if (pdfFiles?.fileStoreIds && Array.isArray(pdfFiles.fileStoreIds)) {
                const foundFile = pdfFiles.fileStoreIds.find((f) => f?.id === fid || f?.fileStoreId === fid);
                rawUrl = foundFile?.url || "";
              } else if (pdfFiles && typeof pdfFiles === "object") {
                rawUrl = pdfFiles[fid] || "";
              }
              const fileUrl = (typeof rawUrl === "string" ? rawUrl.split(",")?.[0] : "") || rawUrl || "";
              return {
                url: fileUrl,
                fileStoreId: fid,
              };
            });
          } catch (err) {
            console.error("Error fetching fileStoreIds during validation:", err);
            mappedDocs = fileStoreIds.map((fid) => ({
              fileStoreId: fid,
            }));
          }

          setRetrievedCluDocs(mappedDocs);
          setValue("cluDocumentUpload", fileStoreIds[0]);
        } else {
          setRetrievedCluDocs([]);
        }

        if (sanctionLetterFilestoreId) {
          updateValidatedCluNumber(numToSearch);
          updateCluValidated(true);
          setCluValidationError(null);
        } else {
          updateValidatedCluNumber("");
          updateCluValidated(false);
          setCluValidationError("Approved CLU Document not found for this CLU Number.");
        }
      } else {
        setCluValidationError("CLU Number not found. Please check and try again.");
        updateCluValidated(false);
        updateValidatedCluNumber("");
        setRetrievedClu(null);
        setRetrievedCluDocs([]);
      }
    } catch (error) {
      console.error("CLU Validation Error:", error);
      if (currentStepData?.siteDetails?.cluNumber === numToSearch && currentStepData?.siteDetails?.cluDocumentUpload) {
        updateValidatedCluNumber(numToSearch);
        updateCluValidated(true);
        setCluValidationError(null);
      } else {
        setCluValidationError("Error validating CLU. Please try again.");
        updateCluValidated(false);
        updateValidatedCluNumber("");
      }
    } finally {
      setCluValidationLoading(false);
    }
  };

  const [totalPlotArea, setTotalPlotArea] = useState("0.00");
  const [areaLeftforRoadWidning, setAreaLeftforRoadWidning] = useState("0.00");

  // Update parent ref when CLU validation status changes
  useEffect(() => {
    if (cluValidationRef) {
      cluValidationRef.current.isCluValidated = isCluValidated;
      cluValidationRef.current.isCluRequired = isCluRequired;
    }
  }, [isCluValidated, isCluRequired, cluValidationRef]);

  useEffect(() => {
    const roadwidningArea = getValues("netPlotAreaAfterWidening");
    const tpArea = getValues("areaLeftForRoadWidening");
    if (roadwidningArea) setAreaLeftforRoadWidning(roadwidningArea)
    if (tpArea) setTotalPlotArea(tpArea)
  }, [currentStepData])

  // Restore CLU document from edit data
  useEffect(() => {
    if (currentStepData?.siteDetails?.cluDocumentUpload && !cluDocumentUploadedFile) {
      setCluDocumentUploadedFile({
        fileStoreId: currentStepData.siteDetails.cluDocumentUpload,
        fileName: currentStepData.siteDetails.cluDocumentUploadFileName || "CLU Document"
      });
    }
  }, [currentStepData?.siteDetails?.cluDocumentUpload]);

  // Sync cluDocumentUpload form field with cluDocumentUploadedFile state
  useEffect(() => {
    if (cluDocumentUploadedFile?.fileStoreId) {
      //console.log("Syncing cluDocumentUpload field with fileStoreId:", cluDocumentUploadedFile.fileStoreId);
      setValue("cluDocumentUpload", cluDocumentUploadedFile.fileStoreId, { shouldValidate: true });
    }
  }, [cluDocumentUploadedFile, setValue]);

  //console.log("STEPERDFATA", currentStepData);
  //console.log(isEditMode, "LOOK EDIT");

  /**Start - Floor Area Calculation Logic */
  const [totalArea, setTotalArea] = useState("0.00");
  const [floorAreaExceedsError, setFloorAreaExceedsError] = useState(null);

  const { fields: areaFields, append: addFloor, remove: removeFloor } = useFieldArray({
    control,
    name: "floorArea",
  });

  const floorAreaValues = watch("floorArea");
  const basementAreaValues = watch("basementArea");
  //console.log(currentStepData, "DTATA TO BE MAPPED", getValues("isCluRequired"), isCluRequired);

  // Watch percentage fields to display calculated values
  const watchedEWSPct = watch("areaUnderEWSInPct");
  const watchedResidentialPct = watch("areaUnderResidentialUseInPct");
  const watchedCommercialPct = watch("areaUnderCommercialUseInPct");
  const watchedInstitutionalPct = watch("areaUnderInstutionalUseInPct");
  const watchedIndustrialPct = watch("areaUnderIndustrialUseInPct");
  const watchedCommunityCenterPct = watch("areaUnderCommunityCenterInPct");
  const watchedParkPct = watch("areaUnderParkInPct");
  const watchedRoadPct = watch("areaUnderRoadInPct");
  const watchedParkingPct = watch("areaUnderParkingInPct");
  const watchedOtherAmenitiesPct = watch("areaUnderOtherAmenitiesInPct");

  // Watch area distribution fields for Total Site Area calculation
  const watchedResidentialArea = watch("areaUnderResidentialUseInSqM");
  const watchedCommercialArea = watch("areaUnderCommercialUseInSqM");
  const watchedInstitutionalArea = watch("areaUnderInstutionalUseInSqM");
  const watchedIndustrialArea = watch("areaUnderIndustrialUseInSqM");
  const watchedCommunityCenterArea = watch("areaUnderCommunityCenterInSqM");
  const watchedParkArea = watch("areaUnderParkInSqM");
  const watchedRoadArea = watch("areaUnderRoadInSqM");
  const watchedParkingArea = watch("areaUnderParkingInSqM");
  const watchedOtherAmenitiesArea = watch("areaUnderOtherAmenitiesInSqM");

  // State for Total Site Area and mismatch
  const [totalSiteArea, setTotalSiteArea] = useState("0.00");
  const [areaMismatchNotification, setAreaMismatchNotification] = useState(null);

  useEffect(() => {
    const sum = floorAreaValues?.reduce((acc, item) => {
      const numericValue = Number.parseFloat(item?.value);
      return acc + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    const numericBasementArea = isNaN(basementAreaValues) ? 0 : basementAreaValues;
    const finalSum = (sum + Number.parseFloat(numericBasementArea)).toFixed(2);
    const balanceArea = parseFloat(netArea) || 0;

    setTotalArea(finalSum);
    setValue("totalFloorArea", finalSum);

    // Check if any floor exceeds balance area
    const hasExceeding = floorAreaValues?.some(floor => {
      const floorValue = parseFloat(floor?.value) || 0;
      return floorValue > balanceArea;
    });

    if (hasExceeding) {
      setFloorAreaExceedsError("At least one floor exceeds the balance area");
    } else {
      setFloorAreaExceedsError(null);
    }
  }, [floorAreaValues, basementAreaValues, setValue, netArea]);

  /**Start - ULB Name and Type caculation logic */

  const [ulbName, setUlbName] = useState(currentStepData?.siteDetails?.ulbName || null);
  const [ulbType, setUlbType] = useState(currentStepData?.siteDetails?.ulbType || "");
  // const [buildingStatus, setBuildingStatus] = useState(currentStepData?.siteDetails?.buildingStatus || null);

  const { data: buildingType, isLoading: isBuildingTypeLoading } = Digit.Hooks.obps.useLayoutBuildingType(stateId);
  const { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.obps.useLayoutRoadType(stateId);
  //console.log(roadType, buildingType, "RRRRRRR");

  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants();

  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  useEffect(() => {
    const a = parseFloat(AreaLeftForRoadWidening); // A = Total Plot Area
    const b = parseFloat(NetPlotArea); // B = Net Plot Area After Widening
    const c = parseFloat(EWSArea) || 0; // C = Area Under EWS

    // Formula: A - (B + C) = Balance Area
    const sum = ((isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b) - c).toFixed(2);

    setNetArea(sum);
    setValue("netTotalArea", sum);//totalSiteArea //netTotalArea
    // setNetArea(sum-totalSiteArea)
  }, [NetPlotArea, AreaLeftForRoadWidening, totalSiteArea, EWSArea, setValue]);

  useEffect(() => {
    if (ulbName) {
      const ulbTypeFormatted = ulbName?.city?.ulbType;
      setUlbType(ulbTypeFormatted);
      setValue("ulbType", ulbTypeFormatted);
    }
  }, [ulbName, setValue]);

  // Auto-select ULB Name based on login tenantId (same as CLU)
  useEffect(() => {
    if (tenantId && ulbList?.length > 0) {
      const defaultULB = ulbList.find((city) => city.code === tenantId);
      if (defaultULB) {
        setUlbName(defaultULB);
        setValue("ulbName", defaultULB);
      }
    }
  }, [tenantId, ulbList, setValue]);

  /**Start - District and Zone caculation logic */
  const [isBasementAreaAvailable, setIsBasementAreaAvailable] = useState(currentStepData?.siteDetails?.isBasementAreaAvailable || null);

  const options = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  const allCities = Digit.Hooks.obps.useTenants();
  const [cities, setcitiesopetions] = useState(allCities);
  const [selectedCity, setSelectedCity] = useState(currentStepData?.siteDetails?.district || null);
  const [localities, setLocalities] = useState([]);
  const [isDistrictInitialized, setIsDistrictInitialized] = useState(false);

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity?.code,
    },
    t
  );

  useEffect(() => {
    if (fetchedLocalities?.length > 0) {
      setLocalities(fetchedLocalities);
    }
  }, [fetchedLocalities]);

  // Only clear localities when user manually changes district (not on initial load)
  const prevSelectedCityRef = useRef(selectedCity);
  useEffect(() => {
    if (isDistrictInitialized && prevSelectedCityRef.current?.code !== selectedCity?.code) {
      setLocalities([]);
      // setValue("zone", null);
    }
    prevSelectedCityRef.current = selectedCity;
  }, [selectedCity, setValue, isDistrictInitialized]);

  // Auto-select district based on login tenantId (not ULB)
  useEffect(() => {
    // Skip if already initialized or if currentStepData has district
    if (isDistrictInitialized) return;

    // First priority: restore from currentStepData
    if (currentStepData?.siteDetails?.district) {
      setSelectedCity(currentStepData.siteDetails.district);
      // Use trigger to validate and update the field
      setTimeout(() => {
        setValue("district", currentStepData.siteDetails.district, { shouldValidate: true });
      }, 0);
      setIsDistrictInitialized(true);
      return;
    }

    // Second priority: auto-select based on tenantId
    if (tenantId && allCities?.length > 0) {
      const defaultCity = allCities.find((city) => city.code === tenantId);
      //console.log(defaultCity, "DDDDD");
      if (defaultCity) {
        setSelectedCity(defaultCity);
        // Use trigger to validate and update the field
        setTimeout(() => {
          setValue("district", defaultCity, { shouldValidate: true });
        }, 0);
        setIsDistrictInitialized(true);
      }
    }
  }, [tenantId, allCities, currentStepData, isDistrictInitialized, setValue]);

  const { data: buildingCategory, isLoading: isBuildingCategoryLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);
  const { data: mdmsData, isLoading: mdmsLoading } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);

  const areaTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];
  const nonSchemeTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.nonSchemeType || [];
  const schemeTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.schemeType || [
    { code: "PAPRA", name: "PAPRA", i18nKey: "PAPRA" },
    { code: "TOWN_PLANNING", name: "Town Planning", i18nKey: "Town Planning" },
    { code: "AFFORDABLE", name: "Affordable", i18nKey: "Affordable" },
    { code: "DEVELOPMENT", name: "Development", i18nKey: "Development" },
    { code: "EWS", name: "EWS", i18nKey: "EWS" },
  ];

  // Zone mapping logic (same as CLU)
  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [{ name: "zoneMaster", filter: `$.[?(@.tanentId == '${tenantId}')]` }]);
  const zoneOptions = zoneList?.tenant?.zoneMaster?.[0]?.zones || [];

  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState(currentStepData?.siteDetails?.buildingCategory || null);

  // Map zone object to match zoneOptions format
  // useEffect(() => {
  //   if (zoneOptions?.length > 0 && currentStepData?.siteDetails?.zone) {
  //     const zoneName = currentStepData?.siteDetails?.zone?.name || currentStepData?.siteDetails?.zone;
  //     const matchedZone = zoneOptions?.find((zone) => zone.name === zoneName);

  //     if (matchedZone) {
  //       setValue("zone", matchedZone);
  //     }
  //   }
  // }, [zoneOptions, currentStepData?.siteDetails?.zone, setValue]);

  useEffect(() => {
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key !== "floorArea" && key !== "district") {
          setValue(key, value);
        }
      });

      // Set state variables to ensure dropdowns are pre-filled
      // if (formattedData.buildingStatus) {
      //   setBuildingStatus(formattedData.buildingStatus);
      // }
      if (formattedData.buildingCategory) {
        setSelectedBuildingCategory(formattedData.buildingCategory);
      }
      if (formattedData.isCluRequired) {
        setIsCluRequired(formattedData.isCluRequired);
      }
      if (formattedData.ulbName) {
        setUlbName(formattedData.ulbName);
      }
      if (formattedData.isBasementAreaAvailable) {
        setIsBasementAreaAvailable(formattedData.isBasementAreaAvailable);
      }
      if (formattedData.district) {
        setSelectedCity(formattedData.district);
        // Set district field with proper object for validation
        setValue("district", formattedData.district, { shouldValidate: true });
      }

      if (Array.isArray(formattedData.floorArea) && formattedData.floorArea.length > 0) {
        for (let i = areaFields.length - 1; i >= 0; i--) {
          removeFloor(i);
        }
        formattedData.floorArea.forEach((item) => {
          addFloor({ value: item.value || item || "" });
        });
      }
    }
  }, []);

  const getSelectedCategoryCode = () => {
    const cat = selectedBuildingCategory || buildingCategoryMain || (getValues && getValues("buildingCategory"));
    const code = typeof cat === "string" ? cat : cat?.code || cat?.name || "";
    return code.toUpperCase();
  };

  const currentCategoryCode = getSelectedCategoryCode();
  const isResidential = currentCategoryCode.includes("RESIDENTIAL");
  const isCommercial = currentCategoryCode.includes("COMMERCIAL");
  const isInstitutional = currentCategoryCode.includes("INSTITUTIONAL");
  const isIndustrial = currentCategoryCode.includes("INDUSTRIAL") || currentCategoryCode.includes("WAREHOUSE");

  // Calculate Total Site Area (sum of all distribution areas)
  useEffect(() => {
    const residential = isResidential ? parseFloat(watchedResidentialArea) || 0 : 0;
    const commercial = isCommercial ? parseFloat(watchedCommercialArea) || 0 : 0;
    const institutional = isInstitutional ? parseFloat(watchedInstitutionalArea) || 0 : 0;
    const industrial = isIndustrial ? parseFloat(watchedIndustrialArea) || 0 : 0;
    const communityCenter = parseFloat(watchedCommunityCenterArea) || 0;
    const park = parseFloat(watchedParkArea) || 0;
    const road = parseFloat(watchedRoadArea) || 0;
    const parking = parseFloat(watchedParkingArea) || 0;
    const otherAmenities = parseFloat(watchedOtherAmenitiesArea) || 0;

    const total = (residential + commercial + institutional + industrial + communityCenter + park + road + parking + otherAmenities).toFixed(2);
    setTotalSiteArea(total);

    // Check if Total Site Area matches Net Area
    const balanceArea = parseFloat(netArea) || 0;
    const totalSiteAreaNum = parseFloat(total) || 0;
    const tolerance = 0.01; // Allow small rounding differences

    if (Math.abs(balanceArea - totalSiteAreaNum) > tolerance) {
      setAreaMismatchNotification(
        `Area Mismatch: Total Site Area (${total} Sq M) does not match Net Site Area (${netArea} Sq M)`
      );
    } else {
      setAreaMismatchNotification(null);
    }
  }, [
    watchedResidentialArea,
    watchedCommercialArea,
    watchedInstitutionalArea,
    watchedIndustrialArea,
    watchedCommunityCenterArea,
    watchedParkArea,
    watchedRoadArea,
    watchedParkingArea,
    watchedOtherAmenitiesArea,
    netArea,
    selectedBuildingCategory,
    buildingCategoryMain,
    isResidential,
    isCommercial,
    isInstitutional,
    isIndustrial,
  ]);

  // Watch all SqM fields for auto-calculation of percentages
  const areaUnderEWSInSqM = watch("areaUnderEWSInSqM");
  const areaUnderResidentialUseInSqM = watch("areaUnderResidentialUseInSqM");
  const areaUnderCommercialUseInSqM = watch("areaUnderCommercialUseInSqM");
  const areaUnderInstutionalUseInSqM = watch("areaUnderInstutionalUseInSqM");
  const areaUnderIndustrialUseInSqM = watch("areaUnderIndustrialUseInSqM");
  const areaUnderCommunityCenterInSqM = watch("areaUnderCommunityCenterInSqM");
  const areaUnderParkInSqM = watch("areaUnderParkInSqM");
  const areaUnderRoadInSqM = watch("areaUnderRoadInSqM");
  const areaUnderParkingInSqM = watch("areaUnderParkingInSqM");
  const areaUnderOtherAmenitiesInSqM = watch("areaUnderOtherAmenitiesInSqM");
  const watchedNetArea = watch("netTotalArea");

  // Auto-calculate percentage fields from SqM fields and netSiteArea sum
  useEffect(() => {
    const netArea = parseFloat(watchedNetArea) || 0;

    const ews = parseFloat(areaUnderEWSInSqM) || 0;
    const residential = isResidential ? parseFloat(areaUnderResidentialUseInSqM) || 0 : 0;
    const commercial = isCommercial ? parseFloat(areaUnderCommercialUseInSqM) || 0 : 0;
    const institutional = isInstitutional ? parseFloat(areaUnderInstutionalUseInSqM) || 0 : 0;
    const industrial = isIndustrial ? parseFloat(areaUnderIndustrialUseInSqM) || 0 : 0;
    const communityCenter = parseFloat(areaUnderCommunityCenterInSqM) || 0;
    const park = parseFloat(areaUnderParkInSqM) || 0;
    const road = parseFloat(areaUnderRoadInSqM) || 0;
    const parking = parseFloat(areaUnderParkingInSqM) || 0;
    const otherAmenities = parseFloat(areaUnderOtherAmenitiesInSqM) || 0;

    const totalUsedArea = ews + residential + commercial + institutional + industrial + communityCenter + park + road + parking + otherAmenities;

    const balance = (netArea - totalUsedArea).toFixed(2);

    // 🔴 Area mismatch validation
    if (netArea > 0 && Math.abs(balance) > 0.01) {
      setAreaMismatchError(`Area mismatch: Used Area = ${totalUsedArea.toFixed(2)} SqM, Balance = ${balance} SqM`);
    } else {
      setAreaMismatchError(null);
    }

    // Percentage calculation
    const calcPct = (val) => (netArea > 0 ? ((val / netArea) * 100).toFixed(2) : "0.00");

    setValue("areaUnderEWSInPct", calcPct(ews));
    setValue("areaUnderResidentialUseInPct", isResidential ? calcPct(residential) : "");
    setValue("areaUnderCommercialUseInPct", isCommercial ? calcPct(commercial) : "");
    setValue("areaUnderInstutionalUseInPct", isInstitutional ? calcPct(institutional) : "");
    setValue("areaUnderIndustrialUseInPct", isIndustrial ? calcPct(industrial) : "");
    setValue("areaUnderCommunityCenterInPct", calcPct(communityCenter));
    setValue("areaUnderParkInPct", calcPct(park));
    setValue("areaUnderRoadInPct", calcPct(road));
    setValue("areaUnderParkingInPct", calcPct(parking));
    setValue("areaUnderOtherAmenitiesInPct", calcPct(otherAmenities));

    // ✅ Total percentage
    const totalPct = calcPct(totalUsedArea);
    setTotalAreaPercentage(totalPct);
  }, [
    areaUnderEWSInSqM,
    areaUnderResidentialUseInSqM,
    areaUnderCommercialUseInSqM,
    areaUnderInstutionalUseInSqM,
    areaUnderIndustrialUseInSqM,
    areaUnderCommunityCenterInSqM,
    areaUnderParkInSqM,
    areaUnderRoadInSqM,
    areaUnderParkingInSqM,
    areaUnderOtherAmenitiesInSqM,
    watchedNetArea,
    setValue,
    selectedBuildingCategory,
    buildingCategoryMain,
    isResidential,
    isCommercial,
    isInstitutional,
    isIndustrial,
  ]);

  return (
    <React.Fragment>
      <div className="obps-page-components-layout-site-details--style-1">
        <div>

          {/* ===== SECTION: CLU (Comprehensive Layout Undertaking) ===== */}
          <CardSectionHeader>CLU Details</CardSectionHeader>

          {/* Is CLU Required? - Yes/No Dropdown */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`Is CLU Required?`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"isCluRequired"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                      setIsCluRequired(e.code);
                    }}
                    selected={props.value}
                    option={options}
                    optionKey="i18nKey"
                    t={t}
                    // disable={isEditMode}
                  />
                )}
              />
               {errors?.isCluRequired && (
              <p className="obps-page-components-layout-site-details--style-2"> {errors.isCluRequired.message}</p>
            )}
            </div>
          </LabelFieldPair>


          {/* ===== CLU Details Section (when isCluRequired = NO) ===== */}
          {getValues("isCluRequired") === "NO" || getValues("isCluRequired")?.code === "NO" || isCluRequired?.code === "NO" || isCluRequired === "NO" ? (
            <React.Fragment>
              {/* CLU Type - Online/Offline */}
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`CLU Type`} <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"cluType"}
                    rules={{
                      required: t("REQUIRED_FIELD"),
                    }}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        select={(e) => {
                          props.onChange(e);
                          setCluType(e.code);
                        }}
                        selected={props.value}
                        option={[
                          { code: "ONLINE", i18nKey: "Online" },
                          { code: "OFFLINE", i18nKey: "Offline" },
                        ]}
                        optionKey="i18nKey"
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {errors?.cluType && (
                <p className="obps-page-components-layout-site-details--style-3"> {errors.cluType.message}</p>
              )}

              {/* ===== Online CLU Section ===== */}
              {(cluType?.code === "ONLINE" || cluType === "ONLINE" || getValues("cluType")?.code === "ONLINE" || getValues("cluType") === "ONLINE") ? (
                <React.Fragment>
                  {/* CLU Number - Online */}
                  <LabelFieldPair>
                    <CardLabel className="card-label-smaller">
                      {`CLU Number`} <span className="requiredField">*</span>
                    </CardLabel>
                    <div className="field">
                      <Controller
                        control={control}
                        name="cluNumber"
                        defaultValue=""
                        rules={{
                          required: t("REQUIRED_FIELD"),
                          maxLength: {
                            value: 50,
                            message: "Max 50 characters allowed",
                          },
                        }}
                        render={(props) => (
                          <TextInput
                            value={props.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              props.onChange(val);
                              if (isCluValidated && validatedCluNumberRef.current && val !== validatedCluNumberRef.current) {
                                updateCluValidated(false);
                                setRetrievedClu(null);
                                setRetrievedCluDocs([]);
                                setValue("cluDocumentUpload", null);
                              }
                            }}
                            onBlur={(e) => {
                              props.onBlur(e);
                            }}
                          />
                        )}
                      />
                    </div>
                    {errors?.cluNumber && (
                      <p className="obps-page-components-layout-site-details--style-4"> {errors.cluNumber.message}</p>
                    )}
                  </LabelFieldPair>


                  {/* Validate Button for Online CLU */}
                  <LabelFieldPair className="obps-page-components-layout-site-details--style-5">
                    <CardLabel className="card-label-smaller obps-page-components-layout-site-details--style-6" >
                      Placeholder
                    </CardLabel>
                    <div className="field obps-page-components-layout-site-details--style-7" >
                      {isCluValidated && (
                        <span className="obps-page-components-layout-site-details--style-8">✓ CLU Validated</span>
                      )}
                      <button
                        type="button"
                        style={{
                          padding: "8px 16px",
                          background: "transparent",
                          color: "#a82227",
                          border: "1.5px solid #a82227",
                          borderRadius: "4px",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: (cluValidationLoading || !watch("cluNumber")) ? "not-allowed" : "pointer",
                          opacity: (cluValidationLoading || !watch("cluNumber")) ? 0.5 : 1,
                          minWidth: "120px"
                        }}
                        disabled={cluValidationLoading || !watch("cluNumber")}
                        onClick={() => handleValidateClu()}
                      >
                        {cluValidationLoading ? "Searching..." : "Validate CLU"}
                      </button>
                    </div>
                  </LabelFieldPair>

                  {cluValidationError && (
                    <p className="obps-page-components-layout-site-details--style-9">{cluValidationError}</p>
                  )}

                  {(isCluValidated || (retrievedCluDocs && retrievedCluDocs.length > 0)) && (
                    <LabelFieldPair>
                      <CardLabel className="card-label-smaller">{t("BPA_CLU_DOCUMENT_LABEL") || "CLU Document"}</CardLabel>
                      <div className="field">
                         {retrievedCluDocs.map((doc, idx) => (
                    <div key={idx} className="obps-page-components-layout-site-details--style-10">

                      <button
                        type="button"
                        className="obps-page-components-layout-site-details--style-11"
                        onClick={() => handleViewDocument(doc)}
                      >
                        VIEW DOCUMENT
                      </button>
                    </div>
                  ))}
                      </div>
                    </LabelFieldPair>
                  )}
                </React.Fragment>
              ) : null}

              {/* ===== Offline CLU Section ===== */}
              {getValues("cluType") === "OFFLINE" || getValues("cluType")?.code === "OFFLINE" || cluType?.code === "OFFLINE" || cluType === "OFFLINE" ? (
                <React.Fragment>
                  {/* CLU Document Upload - Offline */}
                  <LabelFieldPair className="upload-label-field-pair">
                    <CardLabel className="card-label-smaller">
                      {`Upload Approved CLU Copy`} <span className="requiredField">*</span>
                    </CardLabel>
                    <div className="field">
                      <CustomUploadFile
                        onUpload={async (event) => {
                          try {
                            // Extract file from event object
                            const file = event?.target?.files?.[0];
                            if (!file) return;

                            // Validate file size (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              setCluDocumentError("File size exceeds 5MB limit");
                              return;
                            }

                            // Validate file type
                            if ( !["application/pdf","image/jpeg","image/png","image/jpg"].includes(file.type)) {
                              setCluDocumentError("Only .pdf, .png, .jpeg, .jpg files are allowed");
                              return;
                            }

                            setCluDocumentLoader(true);
                            setCluDocumentError(null);

                            const response = await Digit.UploadServices.Filestorage("Layout", file, stateId);
                            setCluDocumentLoader(false);

                            if (response?.data?.files?.length > 0) {
                              const fileStoreId = response.data.files[0].fileStoreId;
                              //console.log("✅ CLU Document uploaded successfully:", fileStoreId);
                              setCluDocumentUploadedFile({
                                fileStoreId: fileStoreId,
                                fileName: file.name
                              });
                              //console.log("✅ State updated - cluDocumentUploadedFile set to:", { fileStoreId, fileName: file.name });
                            } else {
                              console.error("❌ File upload failed - no fileStoreId in response");
                              setCluDocumentError("File upload failed");
                            }
                          } catch (err) {
                            setCluDocumentLoader(false);
                            console.error("CLU upload error:", err);
                            setCluDocumentError("File upload failed: " + (err?.message || "Unknown error"));
                          }
                        }}
                        onDelete={() => {
                          setCluDocumentUploadedFile(null);
                          setCluDocumentError(null);
                        }}
                        uploadedFile={cluDocumentUploadedFile?.fileStoreId || null}
                        error={cluDocumentError}
                        iserror={cluDocumentError}
                        loading={cluDocumentLoader}
                        uploadMessage="Invalid File Format"
                        accept=".pdf, .png, .jpeg, .jpg"
                        maxFileSize={5} // MB
                      />
                          <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
                    </div>
                  </LabelFieldPair>

                  {/* CLU Number - Offline */}
                  <LabelFieldPair>
                    <CardLabel className="card-label-smaller">
                      {`CLU Number`} <span className="requiredField">*</span>
                    </CardLabel>
                    <div className="field">
                      <Controller
                        control={control}
                        name="cluNumberOffline"
                        defaultValue=""
                        rules={{
                          required: t("REQUIRED_FIELD"),
                          maxLength: {
                            value: 50,
                            message: "Max 50 characters allowed",
                          },
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
                      {errors?.cluNumberOffline && (
                        <p className="obps-page-components-layout-site-details--style-12"> {errors.cluNumberOffline.message}</p>
                      )}
                    </div>
                  </LabelFieldPair>

                  {/* CLU Approval Date - Offline */}
                  <LabelFieldPair>
                    <CardLabel className="card-label-smaller">
                      {`CLU Approval Date`} <span className="requiredField">*</span>
                    </CardLabel>
                    <div className="field">
                      <Controller
                        control={control}
                        name="cluApprovalDate"
                        defaultValue=""
                        rules={{
                          required: t("REQUIRED_FIELD"),
                          validate: (value) => {
                            if (!value) return true;
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (selectedDate > today) {
                              return "CLU approval date cannot be a future date";
                            }
                            return true;
                          },
                        }}
                        render={(props) => (
                          <CustomDatePicker
                            value={props.value}
                            onChange={(e) => {
                              props.onChange(e.target.value);
                            }}
                            onBlur={(e) => {
                              props.onBlur(e);
                            }}
                            max={new Date().toISOString().split("T")[0]}
                          />
                        )}
                      />
                      {errors?.cluApprovalDate && (
                        <p className="obps-page-components-layout-site-details--style-13"> {errors.cluApprovalDate.message}</p>
                      )}
                    </div>
                  </LabelFieldPair>

                  {/* Hidden field to store CLU Document in form data */}
                  <Controller
                    control={control}
                    name="cluDocumentUpload"
                    defaultValue=""
                    rules={{
                      // Only required when OFFLINE CLU is selected
                      validate: (value) => {
                        if (cluType?.code === "OFFLINE" || cluType === "OFFLINE") {
                          return cluDocumentUploadedFile ? true : "CLU Document must be uploaded";
                        }
                        return true; // Not required for other cases
                      }
                    }}
                    render={(props) => (
                      <input
                        type="hidden"
                        value={cluDocumentUploadedFile?.fileStoreId || ""}
                        onChange={() => props.onChange(cluDocumentUploadedFile)}
                      />
                    )}
                  />
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : null}

          {/* ===== Application Applied Under Section (when isCluRequired = YES) ===== */}
          {/* {isCluRequired?.code === "YES" || isCluRequired === "YES" ? ( */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`Application Applied Under`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"applicationAppliedUnder"}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={[
                        { code: "PAPRA", name: "PAPRA", i18nKey: "PAPRA" },
                        { code: "TOWN_PLANNING", name: "TOWN PLANNING", i18nKey: "Town Planning" },
                        { code: "AFFORDABLE", name: "AFFORDABLE", i18nKey: "Affordable" },
                        { code: "DEVELOPMENT", name: "DEVELOPMENT", i18nKey: "Development" },

                      ]}
                      optionKey="name"
                      t={t}
                    />
                  )}
                />
                {errors?.applicationAppliedUnder && (
                <p className="obps-page-components-layout-site-details--style-14"> {errors.applicationAppliedUnder.message}</p>
              )}
              </div>
            </LabelFieldPair>
          {/* ) : null} */}
          {/* ===== TYPE OF APPLICATION ===== */}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              Type Of Application <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="typeOfApplication"
                defaultValue=""
                rules={{
                  required: "Type of Application is required",
                }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={props.onChange}
                    selected={props.value}
                    option={[
                      { code: "PROPOSED", name: "Proposed" },
                      { code: "REVISED", name: "Revised" },
                    ]}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors?.typeOfApplication && <p className="obps-page-components-layout-site-details--style-15">{errors.typeOfApplication.message}</p>}
            </div>
          </LabelFieldPair>

          {/* <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_PLOT_NO_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="plotNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 200,
                    message: t("MAX_200_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
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
              {errors?.plotNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.plotNo.message}</p>}
            </div>
          </LabelFieldPair> */}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("BPA_PROPOSED_SITE_ADDRESS")} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="proposedSiteAddress"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 200,
                    message: t("MAX_200_CHARACTERS_ALLOWED"),
                  },
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
              {errors?.proposedSiteAddress && (
                <p className="obps-page-components-layout-site-details--style-16">{errors.proposedSiteAddress.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* ===== SECTION 2: Location & Locality Information ===== */}
          <CardSectionHeader>{t("BPA_LOCATION_LABEL")}</CardSectionHeader>

          {/* District, ULB, Zone, Village grouped together */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_ULB_NAME_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            {!isUlbListLoading && (
              <div className="field">
                <Controller
                  control={control}
                  name={"ulbName"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  defaultValue={ulbName}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={ulbListOptions}
                      optionKey="name"
                      t={t}
                      disable="true"
                    />
                  )}
                />
              </div>
            )}
            {errors?.ulbName && <p className="obps-page-components-layout-site-details--style-17">{errors.ulbName.message}</p>}
          </LabelFieldPair>

          {/* ULB Type */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ULB_TYPE_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="ulbType"
                defaultValue={ulbType || ""}
                render={(props) => (
                  <TextInput
                    value={ulbType || props.value || ""}
                    disabled={true}
                    onChange={(e) => props.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          </LabelFieldPair>

          {/* District - Non-editable, auto-fetched from tenantId */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_DISTRICT_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"district"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    // Validate that district is an object or has required properties
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                      return t("REQUIRED_FIELD");
                    }
                    return true;
                  }
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={selectedCity?.city?.districtName || selectedCity?.districtName || selectedCity}
                    onChange={(e) => {
                      // Don't actually change the value on text input since it's disabled
                      // Just use the selectedCity object
                    }}
                    onBlur={(e) => {
                      // Ensure the form field has the district object
                      if (selectedCity) {
                        props.onChange(selectedCity);
                      }
                    }}
                    disable="true"
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {errors?.district && <p className="obps-page-components-layout-site-details--style-18"> {errors.district.message}</p>}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_ZONE_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"zone"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={props.onChange}
                    selected={props.value}
                    option={zoneOptions}
                    optionKey="code"
                    t={t}
                  />
                )}
              />
              {errors?.zone && <p className="obps-page-components-layout-site-details--style-19"> {errors.zone.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("Village Name")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="villageName"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
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
              {errors?.villageName && <p className="obps-page-components-layout-site-details--style-20"> {errors.villageName.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Ward Number */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_SITE_WARD_NO_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="wardNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
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
              {errors?.wardNo && <p className="obps-page-components-layout-site-details--style-21"> {errors.wardNo.message}</p>}
            </div>
          </LabelFieldPair>

          {/* ===== SECTION 3: Land Records & Documentation ===== */}
          <CardSectionHeader>Land Records</CardSectionHeader>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("Khatuni No")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="khanutiNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Khatuni number should be numeric only",
                  },
                  maxLength: {
                    value: 50,
                    message: "Max 50 digits allowed",
                  },
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
              {errors?.khanutiNo && <p className="obps-page-components-layout-site-details--style-22"> {errors.khanutiNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_KHASRA_NO_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="khasraNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 500,
                    message: "Max 500 characters allowed",
                  },
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
              {errors?.khasraNo && <p className="obps-page-components-layout-site-details--style-23"> {errors.khasraNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_HADBAST_NO_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="hadbastNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Hadbast number should be numeric only",
                  },
                  maxLength: {
                    value: 50,
                    message: "Max 50 digits allowed",
                  },
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
              {errors?.hadbastNo && <p className="obps-page-components-layout-site-details--style-24"> {errors.hadbastNo.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Vasika Information */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_VASIKA_NUMBER_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="vasikaNumber"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
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
                    disabled={isEditMode}
                  />
                )}
              />
              {errors?.vasikaNumber && <p className="obps-page-components-layout-site-details--style-25"> {errors.vasikaNumber.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_VASIKA_DATE_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="vasikaDate"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    if (!value) return true;
                    const selectedDate = new Date(value);
                    if (isNaN(selectedDate.getTime())) return t("Invalid Date Format");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate > today) {
                      return "Vasika date cannot be a future date";
                    }
                    return true;
                  },
                }}
                render={(props) => (
                  <CustomDatePicker
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isEditMode}
                  />
                )}
              />
              {errors?.vasikaDate && <p className="obps-page-components-layout-site-details--style-26"> {errors.vasikaDate.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Road & Site Information */}
          <CardSectionHeader>Road & Site Information</CardSectionHeader>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_ROAD_TYPE_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              {!isRoadTypeLoading && (
                <Controller
                  control={control}
                  name={"roadType"}
                  defaultValue={
                    currentStepData?.siteDetails?.roadType || currentStepData?.apiData?.layoutDetails?.additionalDetails?.siteDetails?.roadType || ""
                  }
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => (
                    <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" t={t} />
                  )}
                />
              )}
              {errors?.roadType && <p className="obps-page-components-layout-site-details--style-27"> {errors.roadType.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Is Area Under Master Plan - Yes/No Dropdown */}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"isAreaUnderMasterPlan"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={options} optionKey="i18nKey" t={t} />
                )}
              />
              {errors?.isAreaUnderMasterPlan && (
              <p className="obps-page-components-layout-site-details--style-28"> {errors.isAreaUnderMasterPlan.message}</p>
            )}
            </div>

          </LabelFieldPair>





          {/* SECTION: Area Calculation (A-B-C) */}
          <CardSectionHeader>{t("BPA_AREA_CALCULATION_LABEL")}</CardSectionHeader>



          {/* Add Area Left For Road Widening field (A) */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaLeftForRoadWidening"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      setTotalPlotArea(e.target.value)
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable={currentStepData?.apiData?.applicationNo ? true : false}
                  />
                )}
              />

              {errors?.areaLeftForRoadWidening && (
                <p className="obps-page-components-layout-site-details--style-29"> {errors.areaLeftForRoadWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* Add Net Plot Area After Widening field (B) */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netPlotAreaAfterWidening"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      setAreaLeftforRoadWidning(e.target.value)
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable={currentStepData?.apiData?.applicationNo ? true : false}
                  />
                )}
              />

              {errors?.netPlotAreaAfterWidening && (
                <p className="obps-page-components-layout-site-details--style-30"> {errors.netPlotAreaAfterWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BALANCE_AREA_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              {/* <Controller
                control={control}
                name="balanceArea"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => ( */}
              <TextInput className="form-field" value={parseFloat(totalPlotArea - areaLeftforRoadWidning).toFixed(2) || "0.00"} disable="true" />
              {/* )}
               /> */}
            </div>
          </LabelFieldPair>

          {/* Add Area Under EWS field (C) - Input and Percentage */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL")}<span className="requiredField">*</span>
            </CardLabel>

            {/* EWS Area Input */}
            <div className="field">
              <Controller
                control={control}
                name="areaUnderEWS"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  validate: (value) => {
                    const ewsArea = parseFloat(value) || 0;
                    const totalArea = parseFloat(totalPlotArea - areaLeftforRoadWidning) || 0;
                    const ewsPercentage = totalArea > 0 ? (ewsArea / totalArea) * 100 : 0;

                    if (ewsPercentage < 5 && ewsArea > 0) {
                      return "EWS Area must be at least 5% of total area";
                    }
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    // placeholder="Sq M"
                    disable={currentStepData?.apiData?.applicationNo ? true : false}
                  />
                )}
              />
              {errors?.areaUnderEWS && <p className="obps-page-components-layout-site-details--style-31">{errors.areaUnderEWS.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>



            <div className="field">
              <Controller
                control={control}
                name="areaUnderEWSInPct"
                defaultValue=""
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={
                      parseFloat(AreaLeftForRoadWidening) > 0
                        ? ((parseFloat(EWSArea || 0) / parseFloat(totalPlotArea - areaLeftforRoadWidning)) * 100).toFixed(2)
                        : "0.00"
                    }
                    disabled={true}
                    placeholder="%"
                  />)}
              />
            </div>
          </LabelFieldPair>

          {/* Add Net Total Area field (A-B-C) - disabled/readonly */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netTotalArea"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                defaultValue={netArea}
                render={(props) => (
                  <TextInput
                    value={netArea}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disabled="true"
                  />
                )}
              />

              {errors?.netTotalArea && <p className="obps-page-components-layout-site-details--style-32"> {errors.netTotalArea.message}</p>}
            </div>
          </LabelFieldPair>

          {errors?.areaLeftForRoadWidening && (
            <p className="obps-page-components-layout-site-details--style-33"> {errors.areaLeftForRoadWidening.message}</p>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_ROAD_WIDTH_AT_SITE_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="roadWidthAtSite"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
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

              {errors?.roadWidthAtSite && <p className="obps-page-components-layout-site-details--style-34">{errors.roadWidthAtSite.message}</p>}
            </div>
          </LabelFieldPair>

          {/* <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_BUILDING_STATUS_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              {!isBuildingTypeLoading && (
                <Controller
                  control={control}
                  name={"buildingStatus"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  defaultValue={currentStepData?.siteDetails?.layoutNonSchemeType || null}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        setBuildingStatus(e);
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={buildingType}
                      optionKey="name"
                      disable={isEditMode}
                      t={t}
                    />
                  )}
                />
              )}
              {errors?.buildingStatus && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.buildingStatus.message}</p>}
            </div>
          </LabelFieldPair> */}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_BUILDING_CATEGORY_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"buildingCategory"}
                rules={{ required: t("REQUIRED_FIELD") }}
                defaultValue={
                  currentStepData?.siteDetails?.buildingCategory ||
                  currentStepData?.apiData?.layoutDetails?.additionalDetails?.siteDetails?.buildingCategory ||
                  ""
                }
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      setBuildingCategoryMain(e);
                      setSelectedBuildingCategory(e);
                      props.onChange(e);

                      const catCode = (e?.code || e?.name || "").toUpperCase();
                      const isRes = catCode.includes("RESIDENTIAL");
                      const isComm = catCode.includes("COMMERCIAL");
                      const isInst = catCode.includes("INSTITUTIONAL");
                      const isInd = catCode.includes("INDUSTRIAL") || catCode.includes("WAREHOUSE");

                      // Reset all dependent fields on building category change
                      if (!isRes) {
                        setValue("areaUnderResidentialUseInSqM", "");
                        setValue("areaUnderResidentialUseInPct", "");
                        setValue("residentialType", "");
                      }
                      if (!isComm) {
                        setValue("areaUnderCommercialUseInSqM", "");
                        setValue("areaUnderCommercialUseInPct", "");
                      }
                      if (!isInst) {
                        setValue("areaUnderInstutionalUseInSqM", "");
                        setValue("areaUnderInstutionalUseInPct", "");
                      }
                      if (!isInd) {
                        setValue("areaUnderIndustrialUseInSqM", "");
                        setValue("areaUnderIndustrialUseInPct", "");
                      }

                      setValue("specificationBuildingCategory", e?.name || e?.code || "");

                      if (clearErrors) {
                        clearErrors([
                          "areaUnderResidentialUseInSqM",
                          "areaUnderResidentialUseInPct",
                          "areaUnderCommercialUseInSqM",
                          "areaUnderCommercialUseInPct",
                          "areaUnderInstutionalUseInSqM",
                          "areaUnderInstutionalUseInPct",
                          "areaUnderIndustrialUseInSqM",
                          "areaUnderIndustrialUseInPct",
                          "residentialType",
                        ]);
                      }
                    }}
                    selected={props.value}
                    option={[
                      { code: "RESIDENTIAL", name: "Residential" },
                      { code: "COMMERCIAL", name: "Commercial" },
                      { code: "INDUSTRIAL_WAREHOUSE", name: "Industrial-Warehouse" },
                      { code: "INSTITUTIONAL", name: "Institutional" },
                    ]}
                    optionKey="name"
                    t={t}
                    disable={currentStepData?.apiData?.Clu?.applicationNo ? true : false}
                  />
                )}
              />
              {errors?.buildingCategory && <p className="obps-page-components-layout-site-details--style-35"> {errors.buildingCategory.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Sub-category for Residential */}
          {isResidential && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("BPA_BUILDING_CATEGORY_LABEL_TYPE")} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"residentialType"}
                  rules={{ required: "Residential Type is required" }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={props.onChange}
                      selected={props.value}
                      option={[
                        { code: "RESIDENTIAL_PLOTTED", name: "Residential Plotted" },
                        { code: "AFFORDABLE", name: "Affordable Housing" },
                        { code: "EWS", name: "EWS Housing" },
                      ]}
                      optionKey="name"
                      t={t}
                    />
                  )}
                />
                {errors?.residentialType && <p className="obps-page-components-layout-site-details--style-36">{errors.residentialType.message}</p>}
              </div>
            </LabelFieldPair>
          )}

          {/* Sub-category for Commercial */}
          {isCommercial && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("BPA_BUILDING_CATEGORY_LABEL_TYPE")}</CardLabel>
              <div className="field">
                <TextInput value="Commercial" disabled={true} />
              </div>
            </LabelFieldPair>
          )}

          {/* Sub-category for Industrial-Warehouse */}
          {isIndustrial && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("BPA_BUILDING_CATEGORY_LABEL_TYPE")}</CardLabel>
              <div className="field">
                <TextInput value="Industrial Warehouse" disabled={true} />
              </div>
            </LabelFieldPair>
          )}

          {/* Sub-category for Institutional */}
          {isInstitutional && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("BPA_BUILDING_CATEGORY_LABEL_TYPE")}</CardLabel>
              <div className="field">
                <TextInput value="Institutional" disabled={true} />
              </div>
            </LabelFieldPair>
          )}

          {isResidential && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL")}`}
                  <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderResidentialUseInSqM"
                    defaultValue=""
                    rules={{
                      required: isResidential ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !isResidential || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
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

                  {errors?.areaUnderResidentialUseInSqM && (
                    <p className="obps-page-components-layout-site-details--style-37"> {errors.areaUnderResidentialUseInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL")}`}
                  <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderResidentialUseInPct"
                    rules={{
                      required: isResidential ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !isResidential || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedResidentialPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        readOnly={true}
                        disabled={true}
                      />
                    )}
                  />

                  {errors?.areaUnderResidentialUseInPct && (
                    <p className="obps-page-components-layout-site-details--style-38"> {errors.areaUnderResidentialUseInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          {isCommercial && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL")}`}
                  <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommercialUseInSqM"
                    defaultValue=""
                    rules={{
                      required: isCommercial ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !isCommercial || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
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

                  {errors?.areaUnderCommercialUseInSqM && (
                    <p className="obps-page-components-layout-site-details--style-39"> {errors.areaUnderCommercialUseInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL")}`}
                  <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommercialUseInPct"
                    rules={{
                      required: isCommercial ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !isCommercial || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedCommercialPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        readOnly={true}
                        disabled={true}
                      />
                    )}
                  />

                  {errors?.areaUnderCommercialUseInPct && (
                    <p className="obps-page-components-layout-site-details--style-40"> {errors.areaUnderCommercialUseInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          {isInstitutional && (
              <React.Fragment>
                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    {t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL")}
                    <span className="requiredField">*</span>
                  </CardLabel>
                  <div className="field">
                    <Controller
                      control={control}
                      name="areaUnderInstutionalUseInSqM"
                      defaultValue=""
                      rules={{
                        required: t("REQUIRED_FIELD"),
                        validate: (value) => {
                          if (!value) return t("REQUIRED_FIELD");
                          const regex = /^\d+(\.\d{1,2})?$/;
                          return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          className="form-field"
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

                    {errors?.areaUnderInstutionalUseInSqM && (
                      <p className="obps-page-components-layout-site-details--style-41"> {errors.areaUnderInstutionalUseInSqM.message}</p>
                    )}
                  </div>
                </LabelFieldPair>

                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    {t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL")}
                    <span className="requiredField">*</span>
                  </CardLabel>

                  <div className="field">
                    <Controller
                      control={control}
                      name="areaUnderInstutionalUseInPct"
                      rules={{
                        required: t("REQUIRED_FIELD"),
                        validate: (value) => {
                          if (!value) return t("REQUIRED_FIELD");
                          const regex = /^\d+(\.\d{1,2})?$/;
                          const isValidFormat = regex.test(value);
                          const isWithinRange = Number.parseFloat(value) <= 100;
                          if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                          if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                          return true;
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          className="form-field"
                          value={watchedInstitutionalPct || ""}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                          readOnly={true}
                          disabled={true}
                        />
                      )}
                    />

                    {errors?.areaUnderInstutionalUseInPct && (
                      <p className="obps-page-components-layout-site-details--style-42"> {errors.areaUnderInstutionalUseInPct.message}</p>
                    )}
                  </div>
                </LabelFieldPair>
              </React.Fragment>
            )}

          {selectedBuildingCategory?.name?.toLowerCase().includes("industrial") && (
              <React.Fragment>
                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    {t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_SQ_M_LABEL")}
                    <span className="requiredField">*</span>
                  </CardLabel>
                  <div className="field">
                    <Controller
                      control={control}
                      name="areaUnderIndustrialUseInSqM"
                      defaultValue=""
                      rules={{
                        required: t("REQUIRED_FIELD"),
                        validate: (value) => {
                          if (!value) return t("REQUIRED_FIELD");
                          const regex = /^\d+(\.\d{1,2})?$/;
                          return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          className="form-field"
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

                    {errors?.areaUnderIndustrialUseInSqM && (
                      <p className="obps-page-components-layout-site-details--style-43"> {errors.areaUnderIndustrialUseInSqM.message}</p>
                    )}
                  </div>
                </LabelFieldPair>

                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    {t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_PCT_LABEL")}
                    <span className="requiredField">*</span>
                  </CardLabel>

                  <div className="field">
                    <Controller
                      control={control}
                      name="areaUnderIndustrialUseInPct"
                      rules={{
                        required: t("REQUIRED_FIELD"),
                        validate: (value) => {
                          if (!value) return t("REQUIRED_FIELD");
                          const regex = /^\d+(\.\d{1,2})?$/;
                          const isValidFormat = regex.test(value);
                          const isWithinRange = Number.parseFloat(value) <= 100;
                          if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                          if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                          return true;
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          className="form-field"
                          value={watchedIndustrialPct || ""}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                          readOnly={true}
                          disabled={true}
                        />
                      )}
                    />

                    {errors?.areaUnderIndustrialUseInPct && (
                      <p className="obps-page-components-layout-site-details--style-44"> {errors.areaUnderIndustrialUseInPct.message}</p>
                    )}
                  </div>
                </LabelFieldPair>
              </React.Fragment>
            )}

          {/* {buildingStatus?.code === "BUILTUP" && isBasementAreaAvailable?.code === "YES" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("BPA_BASEMENT_AREA_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="basementArea"
                  defaultValue=""
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    pattern: {
                      value: /^[0-9]*\.?[0-9]+$/,
                      message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                    },
                    maxLength: {
                      value: 100,
                      message: t("MAX_100_CHARACTERS_ALLOWED"),
                    },
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
                {errors?.basementArea && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.basementArea.message}</p>}
              </div>
            </LabelFieldPair>
          )} */}

          {/* SECTION: Floor Details */}
          {/* {buildingStatus?.code === "BUILTUP" && <CardSectionHeader>{t("BPA_FLOOR_DETAILS_LABEL")}</CardSectionHeader>} */}

          {/* {buildingStatus?.code === "BUILTUP" &&
            areaFields.map((field, index) => (
              <div key={field.id} style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <CardLabel className="card-label-smaller">
                  {index === 0 ? "Ground" : `${index}st`} Floor (IN SQ MT) <span className="requiredField">*</span>
                </CardLabel>
                <div className="field" style={{ display: "flex", gap: "10px" }}>
                  <Controller
                    control={control}
                    name={`floorArea.${index}.value`}
                    defaultValue={field.value}
                    rules={{
                      required: t("REQUIRED_FIELD"),
                      pattern: {
                        value: /^[0-9]*\.?[0-9]+$/,
                        message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                      },
                      maxLength: {
                        value: 100,
                        message: t("MAX_100_CHARACTERS_ALLOWED"),
                      },
                      validate: (value) => {
                        const floorValue = parseFloat(value) || 0;
                        const balanceArea = parseFloat(netArea) || 0;
                        const floorName = index === 0 ? "Ground" : `${index}`;
                        if (floorValue > balanceArea) {
                          return `${floorName} floor area (${floorValue.toFixed(2)} Sq M) cannot exceed balance area (${balanceArea.toFixed(
                            2
                          )} Sq M)`;
                        }
                        return true;
                      },
                    }}
                    render={(props) => (
                      <React.Fragment>
                        <TextInput
                          value={props.value}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                        />

                        {errors?.floorArea?.[index]?.value && (
                          <CardLabelError className={errorStyle}>{errors.floorArea[index].value.message}</CardLabelError>
                        )}
                      </React.Fragment>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeFloor(index)}
                    style={{
                      marginTop: "-12px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))} */}

          {/* {buildingStatus?.code === "BUILTUP" && (
            <button
              type="button"
              onClick={() => addFloor({ value: "" })}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Add Floor
            </button>
          )} */}

          {/* SECTION: Area Distribution across 9 Categories */}
          <CardSectionHeader>{t("BPA_AREA_DISTRIBUTION_LABEL")}</CardSectionHeader>

          {(selectedBuildingCategory?.name?.toLowerCase().includes("community") || !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL")}`}</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommunityCenterInSqM"
                    defaultValue=""
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
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

                  {errors?.areaUnderCommunityCenterInSqM && (
                    <p className="obps-page-components-layout-site-details--style-45"> {errors.areaUnderCommunityCenterInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL")}`}</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommunityCenterInPct"
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedCommunityCenterPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        readOnly={true}
                        disabled={true}
                      />
                    )}
                  />

                  {errors?.areaUnderCommunityCenterInPct && (
                    <p className="obps-page-components-layout-site-details--style-46"> {errors.areaUnderCommunityCenterInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
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

              {errors?.areaUnderParkInSqM && (
                <p className="obps-page-components-layout-site-details--style-47"> {errors.areaUnderParkInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedParkPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    readOnly={true}
                    disabled={true}
                  />
                )}
              />

              {errors?.areaUnderParkInPct && (
                <p className="obps-page-components-layout-site-details--style-48"> {errors.areaUnderParkInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
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

              {errors?.areaUnderRoadInSqM && (
                <p className="obps-page-components-layout-site-details--style-49"> {errors.areaUnderRoadInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedRoadPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    readOnly={true}
                    disabled={true}
                  />
                )}
              />

              {errors?.areaUnderRoadInPct && (
                <p className="obps-page-components-layout-site-details--style-50"> {errors.areaUnderRoadInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkingInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
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

              {errors?.areaUnderParkingInSqM && (
                <p className="obps-page-components-layout-site-details--style-51"> {errors.areaUnderParkingInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkingInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedParkingPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    readOnly={true}
                    disabled={true}

                  />
                )}
              />

              {errors?.areaUnderParkingInPct && (
                <p className="obps-page-components-layout-site-details--style-52"> {errors.areaUnderParkingInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderOtherAmenitiesInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
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

              {errors?.areaUnderOtherAmenitiesInSqM && (
                <p className="obps-page-components-layout-site-details--style-53"> {errors.areaUnderOtherAmenitiesInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderOtherAmenitiesInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedOtherAmenitiesPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    readOnly={true}
                    disabled={true}
                  />
                )}
              />

              {errors?.areaUnderOtherAmenitiesInPct && (
                <p className="obps-page-components-layout-site-details--style-54"> {errors.areaUnderOtherAmenitiesInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* Total Site Area - Sum of all distribution areas */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">Total Site Area(sqm)</CardLabel>
            <div className="field">
              <TextInput className="form-field" value={parseFloat(totalSiteArea).toFixed(2) || "0.00"} disabled={true} />
            </div>
          </LabelFieldPair>

          {/* Area Mismatch Notification */}
          {areaMismatchNotification && (
            <div className="obps-page-components-layout-site-details--style-55">
              <p className="obps-page-components-layout-site-details--style-56">
                <strong>⚠️ Warning:</strong> {areaMismatchNotification}
              </p>
            </div>
          )}

          {/* <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BALANCE_AREA_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <TextInput className="form-field" value={parseFloat(netArea-totalSiteArea).toFixed(2) || "0.00"} disable="true" />
            </div>
          </LabelFieldPair> */}
        </div>
        <BreakLine />
        { }
      </div>
    </React.Fragment>
  );
};

// Validation function to check if CLU is validated when required
LayoutSiteDetails.validateCLU = (isCluRequired, isCluValidated) => {
  if (isCluRequired && !isCluValidated) {
    return false;
  }
  return true;
};

export default LayoutSiteDetails;
