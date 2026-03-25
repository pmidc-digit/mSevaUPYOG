import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useTranslation } from "react-i18next";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import FireNOCApplicantDetails from "../FireNOCApplicantDetails";

const EmployeeNOCStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);

  const currentStepData = useSelector((state) => state.noc.NOCNewApplicationFormReducer.formData);

  const saved = currentStepData?.applicationDetails || {};

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    watch,
    reset,
    getValues,
  } = useForm({
    defaultValues: {
      applicantType: saved.applicantType || null,
      applicantSubtype: saved.applicantSubtype || null,
      owners: saved.owners || [
        {
          mobileNumber: "",
          name: "",
          gender: null,
          dateOfBirth: "",
          emailId: "",
          fatherOrHusbandName: "",
          relationship: null,
          panNo: "",
          address: "",
        },
      ],
    },
  });

  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const stateId = Digit.ULBService.getStateId();
  const { data: fireStationData } = Digit.Hooks.useCustomMDMS(stateId, "firenoc", [{ name: "FireStations" }], {
    select: (d) => d?.firenoc?.FireStations?.filter((s) => s.active) || [],
  });

  /* ─── Validation ─── */
  function checkValidation(data) {
    const owners = data?.owners != null ? data.owners : [];
    const uniqueMobiles = new Set(owners.map((o) => o.mobileNumber));
    if (uniqueMobiles.size !== owners.length) {
      setShowToast({ key: "true", error: true, message: t("DUPLICATE_OWNER_FOUND_LABEL") });
      setTimeout(() => setShowToast(null), 3000);
      return false;
    }
    return true;
  }

  /* ─── Submit ─── */
  const onSubmit = (data) => {
    if (!checkValidation(data)) return;

    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));

    if (currentStepData?.apiData?.FireNOCs?.[0]?.fireNOCDetails?.applicationNumber) {
      onGoNext();
    } else {
      callCreateAPI({ ...currentStepData, [config.key]: data });
    }
  };

  /* ─── Create API ─── */
  const callCreateAPI = async (formData) => {
    const appDetails = formData?.applicationDetails || {};
    const site = formData?.siteDetails || {};
    const noc = formData?.nocDetails || {};
    const isIndividual = appDetails.applicantType?.code === "INDIVIDUAL";

    /* ── resolve firestationId from selected city ── */
    const cityCode = site.cityName?.code || "";
    const matchedStation = fireStationData?.find((s) => s.baseTenantId === cityCode);
    const resolvedFirestationId = site.fireStationId || matchedStation?.code || "";

    /* ── ownerShipType mapping ── */
    const ownerShipType = appDetails.applicantSubtype?.code || "INDIVIDUAL.SINGLEOWNER";
    const majorType = ownerShipType.split(".")[0];

    /* ── buildings ── */
    const buildings = (site.buildings != null ? site.buildings : []).map((b) => {
      const floors = Number(b.noOfFloors?.code || b.noOfFloors || 0);
      const basements = Number(b.noOfBasements?.code || b.noOfBasements || 0);
      const height = Number(b.heightOfBuilding || 0);
      return {
        name: b.buildingName || "",
        usageType: b.buildingUsageType?.code || b.buildingUsageType || "",
        usageSubType: b.buildingUsageSubType?.code || b.buildingUsageSubType || "",
        uomsMap: {
          NO_OF_FLOORS: String(floors),
          NO_OF_BASEMENTS: String(basements),
          HEIGHT_OF_BUILDING: String(height),
        },
        landArea: Number(b.landArea || 0),
        totalCoveredArea: Number(b.totalCoveredArea || 0),
        parkingArea: Number(b.parkingArea || 0),
        uoms: [
          { code: "HEIGHT_OF_BUILDING", value: height, isActiveUom: true, active: true },
          { code: "NO_OF_FLOORS", value: floors, isActiveUom: false, active: true },
          { code: "NO_OF_BASEMENTS", value: basements, isActiveUom: false, active: true },
        ],
        applicationDocuments: [],
      };
    });

    /* ── owners ── */
    const owners = (appDetails.owners != null ? appDetails.owners : []).map((item) => {
      if (isIndividual) {
        return {
          mobileNumber: item.mobileNumber || "",
          name: item.name || "",
          dob: Digit.Utils.pt.convertDateToEpoch(item.dateOfBirth || ""),
          gender: item.gender?.code || "",
          relationship: item.relationship?.i18nKey || item.relationship?.code || "",
          fatherOrHusbandName: item.fatherOrHusbandName || "",
          correspondenceAddress: item.address || "",
        };
      }
      return {
        mobileNumber: item.mobileNumber || "",
        name: item.authorizedPersonName || "",
        emailId: item.emailId || "",
        correspondenceAddress: item.officialAddress || "",
        institutionName: item.institutionName || "",
        officialTelNo: item.officialTelNo || "",
        designation: item.designation || "",
      };
    });

    /* ── propertyDetails.address ── */
    const isRuralSite = site.areaType?.code === "RURAL";
    const address = {
      areaType: site.areaType?.name || site.areaType?.code || "",
      city: site.cityName?.code || tenantId,
      subDistrict: site.districtName?.name || site.districtName || "",
      addressLine2: isRuralSite ? (site.villageName || "") : (site.mohalla?.name || site.mohalla || ""),
    };

    const payload = {
      FireNOCs: [
        {
          fireNOCDetails: {
            noOfBuildings: site.noOfBuildings || "SINGLE",
            fireNOCType: noc.fireNOCType?.code || "NEW",
            propertyDetails: { address },
            firestationId: resolvedFirestationId,
            buildings,
            applicantDetails: {
              ownerShipMajorType: majorType,
              ownerShipType,
              owners,
              additionalDetail: {
                ownerAuditionalDetail: { documents: [] },
              },
            },
            action: "INITIATE",
            additionalDetail: { documents: [] },
            channel: "COUNTER",
            financialYear: "2019-20",
            tenantId,
          },
          tenantId,
          isLegacy: false,
        },
      ],
    };

    try {
      const response = await Digit.FIRENOCService.create({ tenantId, details: payload });
      if (response?.ResponseInfo?.status === "successful" && !response?.Errors?.length) {
        dispatch(UPDATE_NOCNewApplication_FORM("apiData", response));
        onGoNext();
      } else {
        const errMsg = response?.Errors?.[0]?.message || "COMMON_SOMETHING_WENT_WRONG_LABEL";
        setShowToast({ key: "true", error: true, message: errMsg });
      }
    } catch (err) {
      const errMsg = err?.Errors?.[0]?.message || err?.message || "COMMON_SOME_ERROR_OCCURRED_LABEL";
      setShowToast({ key: "true", error: true, message: errMsg });
    }
  };

  /* ─── Back ─── */
  const handleBack = () => {
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, getValues()));
    onBackClick();
  };

  const closeToast = () => setShowToast(null);

  const commonProps = { Controller, control, setValue, errors, trigger, reset, useFieldArray, watch, getValues, config };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FireNOCApplicantDetails t={t} currentStepData={currentStepData} {...commonProps} />
        <ActionBar>
          <SubmitBar className="submit-bar-back" label="Back" onSubmit={handleBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {showToast && <Toast error={showToast?.error} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default EmployeeNOCStepFormOne;
