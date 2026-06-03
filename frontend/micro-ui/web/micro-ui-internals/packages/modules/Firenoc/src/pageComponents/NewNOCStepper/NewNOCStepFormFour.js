import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ActionBar, Toast, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import NOCSummary from "../NOCSummary";
const getRelationshipApiValue = (rel) => {
  if (!rel) return "";
  const code = (typeof rel === "object" ? rel.code : rel) || "";
  const upper = code.toUpperCase();
  if (upper === "FATHER" || upper === "COMMON_RELATION_FATHER") return "Father";
  if (upper === "HUSBAND" || upper === "COMMON_RELATION_HUSBAND") return "Husband";
  return typeof rel === "object" ? (rel.code || rel.i18nKey || "") : rel;
};

const NewNOCStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const [showToast, setShowToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stateId = Digit.ULBService.getStateId();
  const { data: fireStationData } = Digit.Hooks.useCustomMDMS(stateId, "firenoc", [{ name: "FireStations" }], {
    select: (d) => d?.firenoc?.FireStations?.filter((s) => s.active) || [],
  });

  const currentStepData = useSelector((state) => state?.noc?.NOCNewApplicationFormReducer?.formData || {});

  const history = useHistory();

  let tenantId;
  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else tenantId = window.localStorage.getItem("Employee.tenant-id");

  const buildUpdatePayload = (formData) => {
    const fireNOCData = formData?.apiData?.FireNOCs?.[0];
    const site = formData?.siteDetails || {};
    const noc = formData?.nocDetails || {};
    const docsFromRedux = formData?.uploadedDocuments?.documents || [];

    /* ── resolve applicationTenantId based on selected/original firestationId ── */
    const selectedStationCode = site.fireStationId || fireNOCData?.fireNOCDetails?.firestationId || "";
    const selectedStationObj = fireStationData?.find(
      (s) => s.code === selectedStationCode || s.id === selectedStationCode
    );
    const applicationTenantId = selectedStationObj?.tenantId || selectedStationObj?.baseTenantId || tenantId;

    const convertedDocs = docsFromRedux.map((doc) => {
      let docType = doc.documentType || "";
      let dropdown = doc.dropdown ? { ...doc.dropdown } : null;

      if (
        docType.startsWith("OWNER.IDENTITYPROOF") ||
        doc.dropdown?.value?.startsWith("OWNER.IDENTITYPROOF") ||
        doc.dropdown?.code?.startsWith("OWNER.IDENTITYPROOF")
      ) {
        const fullSubtype =
          (docType !== "OWNER.IDENTITYPROOF" && docType.startsWith("OWNER.IDENTITYPROOF."))
            ? docType
            : (doc.dropdown?.value || doc.dropdown?.code || "OWNER.IDENTITYPROOF.AADHAAR");

        docType = "OWNER.IDENTITYPROOF";
        dropdown = { value: fullSubtype };
      } else {
        docType = doc.dropdown?.value || doc.dropdown?.code || doc.documentType;
      }

      return {
        tenantId: applicationTenantId,
        documentType: docType,
        fileStoreId: doc.filestoreId || doc.fileStoreId,
        ...(dropdown ? { dropdown } : {}),
      };
    });

    const originalStatus = fireNOCData?.fireNOCDetails?.status || fireNOCData?.status;
    const hasApplicationNo = fireNOCData?.applicationNumber || fireNOCData?.fireNOCDetails?.applicationNumber;
    const isCitizen = window.location.href.includes("citizen");
    const isEdit = window.location.href.includes("/edit-application/");
    const workflowAction = (isEdit || (isCitizen && (originalStatus === "CITIZENACTIONREQUIRED" || originalStatus === "SENDBACKTOCITIZEN" || originalStatus === "CITIZEN_ACTION_REQUIRED"))) ? "RESUBMIT" : "APPLY";

    /* ── buildings merging ── */
    const originalBuildings = fireNOCData?.fireNOCDetails?.buildings || [];
    const buildings = (site.buildings != null ? site.buildings : []).map((b, idx) => {
      const originalBuilding = originalBuildings[idx] || {};
      const floors = Number(b.noOfFloors?.code || b.noOfFloors || 0);
      const basements = Number(b.noOfBasements?.code || b.noOfBasements || 0);
      const height = Number(b.heightOfBuilding || 0);
      const builtUpArea = Number(b.groundFloorBuiltupArea || 0);

      const originalUoms = originalBuilding?.uoms || [];
      const newUoms = [
        { code: "HEIGHT_OF_BUILDING", value: height, isActiveUom: true, active: true },
        { code: "NO_OF_FLOORS", value: floors, isActiveUom: false, active: true },
        { code: "NO_OF_BASEMENTS", value: basements, isActiveUom: false, active: true },
        { code: "BUILTUP_AREA", value: builtUpArea, isActiveUom: false, active: true },
      ].map((uom) => {
        const match = originalUoms.find((ou) => ou.code === uom.code);
        return match ? { ...uom, id: match.id } : uom;
      });

      return {
        ...originalBuilding,
        name: b.buildingName || "",
        usageType: b.buildingUsageType?.code || b.buildingUsageType || "",
        usageSubType: b.buildingUsageSubType?.code || b.buildingUsageSubType || "",
        uomsMap: {
          NO_OF_FLOORS: String(floors),
          NO_OF_BASEMENTS: String(basements),
          HEIGHT_OF_BUILDING: String(height),
          BUILTUP_AREA: String(builtUpArea),
        },
        landArea: Number(b.landArea || 0),
        totalCoveredArea: Number(b.totalCoveredArea || 0),
        parkingArea: Number(b.parkingArea || 0),
        rightSurrounding: b.rightSurrounding || "",
        leftSurrounding: b.leftSurrounding || "",
        frontSurrounding: b.frontSurrounding || "",
        backSurrounding: b.backSurrounding || "",
        uoms: newUoms,
        applicationDocuments: originalBuilding.applicationDocuments || [],
      };
    });

    /* ── owners merging ── */
    const appDetails = formData?.applicationDetails || {};
    const ownerShipType = appDetails.applicantSubtype?.code || fireNOCData?.fireNOCDetails?.applicantDetails?.ownerShipType || "INDIVIDUAL.SINGLEOWNER";
    const majorType = ownerShipType.split(".")[0];
    const isIndividual = appDetails.applicantType?.code === "INDIVIDUAL" || majorType === "INDIVIDUAL";

    const originalOwners = fireNOCData?.fireNOCDetails?.applicantDetails?.owners || [];
    const owners = (appDetails.owners != null ? appDetails.owners : []).map((item, idx) => {
      const originalOwner = originalOwners[idx] || {};
      if (isIndividual) {
        return {
          ...originalOwner,
          mobileNumber: item.mobileNumber || "",
          name: item.name || "",
          dob: Digit.Utils.pt.convertDateToEpoch(item.dateOfBirth || ""),
          gender: item.gender?.code || item.gender || "",
          relationship: getRelationshipApiValue(item.relationship),
          fatherOrHusbandName: item.fatherOrHusbandName || "",
          correspondenceAddress: item.address || "",
          emailId: item.emailId || "",
          pan: item.panNo || item.pan || "",
        };
      }
      return {
        ...originalOwner,
        mobileNumber: item.mobileNumber || "",
        name: item.authorizedPersonName || "",
        gender: item.gender?.code || item.gender || "",
        emailId: item.emailId || "",
        correspondenceAddress: item.officialAddress || "",
        institutionName: item.institutionName || "",
        officialTelNo: item.officialTelNo || "",
        designation: item.designation || "",
        fatherOrHusbandName: item.fatherOrHusbandName || "",
        relationship: getRelationshipApiValue(item.relationship),
      };
    });

    const updatedFireNOC = {
      ...fireNOCData,
      tenantId: applicationTenantId,
      ...(noc.fireNOCType?.code === "NEW" && (noc.provisionalNocNumber || fireNOCData?.provisionFireNOCNumber) ? {
        provisionFireNOCNumber: noc.provisionalNocNumber || fireNOCData?.provisionFireNOCNumber,
        fireNOCNumber: noc.provisionalNocNumber || fireNOCData?.fireNOCNumber
      } : {}),
      fireNOCDetails: {
        ...fireNOCData?.fireNOCDetails,
        noOfBuildings: site.noOfBuildings || fireNOCData?.fireNOCDetails?.noOfBuildings || "SINGLE",
        fireNOCType: noc.fireNOCType?.code || fireNOCData?.fireNOCDetails?.fireNOCType || "NEW",
        provisionalNocNumber: noc.provisionalNocNumber || fireNOCData?.fireNOCDetails?.provisionalNocNumber || "",
        oldFireNocNumber: noc.oldFireNocNumber || fireNOCData?.fireNOCDetails?.oldFireNocNumber || "",
        firestationId: site.fireStationId || fireNOCData?.fireNOCDetails?.firestationId || "",
        action: workflowAction,
        propertyDetails: {
          ...fireNOCData?.fireNOCDetails?.propertyDetails,
          address: {
            ...fireNOCData?.fireNOCDetails?.propertyDetails?.address,
            areaType: site.areaType?.name || site.areaType?.code || fireNOCData?.fireNOCDetails?.propertyDetails?.address?.areaType || "",
            city: site.districtName?.code || site.districtName?.name || site.districtName || fireNOCData?.fireNOCDetails?.propertyDetails?.address?.city || tenantId,
            subDistrict: site.cityName?.code || fireNOCData?.fireNOCDetails?.propertyDetails?.address?.subDistrict || "",
            addressLine2: (site.areaType?.code === "RURAL" || site.areaType?.code === "Rural") ? (site.villageName || "") : (site.mohalla?.name || site.mohalla || ""),
            doorNo: site.plotSurveyNo || "",
            street: site.streetName || "",
            landmark: site.landmarkName || "",
            pincode: site.pincode || "",
            locality: site.mohalla ? { code: site.mohalla.code || site.mohalla } : (fireNOCData?.fireNOCDetails?.propertyDetails?.address?.locality || { code: "UNKNOWN" }),
            latitude: site.geoLocation?.latitude ? Number(site.geoLocation.latitude) : (fireNOCData?.fireNOCDetails?.propertyDetails?.address?.latitude || 0),
            longitude: site.geoLocation?.longitude ? Number(site.geoLocation.longitude) : (fireNOCData?.fireNOCDetails?.propertyDetails?.address?.longitude || 0),
          },
          propertyId: site.propertyId || fireNOCData?.fireNOCDetails?.propertyDetails?.propertyId || "",
        },
        buildings,
        applicantDetails: {
          ...fireNOCData?.fireNOCDetails?.applicantDetails,
          ownerShipMajorType: majorType,
          ownerShipType,
          owners,
          additionalDetail: {
            ...fireNOCData?.fireNOCDetails?.applicantDetails?.additionalDetail,
            ownerAuditionalDetail: {
              ...fireNOCData?.fireNOCDetails?.applicantDetails?.additionalDetail?.ownerAuditionalDetail,
              documents: convertedDocs,
            },
          },
        },
        additionalDetail: {
          ...fireNOCData?.fireNOCDetails?.additionalDetail,
        },
        tenantId: applicationTenantId,
      },
    };

    return { FireNOCs: [updatedFireNOC] };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildUpdatePayload(currentStepData);

      const fireNOCData = currentStepData?.apiData?.FireNOCs?.[0];
      const site = currentStepData?.siteDetails || {};
      const selectedStationCode = site.fireStationId || fireNOCData?.fireNOCDetails?.firestationId || "";
      const selectedStationObj = fireStationData?.find(
        (s) => s.code === selectedStationCode || s.id === selectedStationCode
      );
      const applicationTenantId = selectedStationObj?.tenantId || selectedStationObj?.baseTenantId || tenantId;

      const response = await Digit.FIRENOCService.update({ tenantId: applicationTenantId, details: payload });

      if (response?.FireNOCs?.length > 0) {
        const applicationNo = response.FireNOCs[0]?.fireNOCDetails?.applicationNumber;
        if (window.location.href.includes("citizen")) {
          history.replace({
            pathname: `/digit-ui/citizen/firenoc/response/${applicationNo}`,
            state: { data: response },
          });
        } else {
          history.replace({
            pathname: `/digit-ui/employee/firenoc/response/${applicationNo}`,
            state: { data: response },
          });
        }
      } else {
        setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
      }
    } catch (error) {
      const errMsg = error?.Errors?.[0]?.message || error?.message || "COMMON_SOME_ERROR_OCCURRED_LABEL";
      setShowToast({ key: "true", error: true, message: errMsg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  function onGoBack() {
    onBackClick(config.key);
  }

  const closeToast = () => setShowToast(null);

  return (
    <React.Fragment>
      {isSubmitting && <Loader />}
      <NOCSummary currentStepData={currentStepData} t={t} />
      <ActionBar>
        <SubmitBar className="submit-bar-back" label={t("Back")} onSubmit={onGoBack} />
        <SubmitBar label={t("Submit")} onSubmit={handleSubmit} disabled={isSubmitting} />
      </ActionBar>
      {showToast && (
        <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />
      )}
    </React.Fragment>
  );
};

export default NewNOCStepFormFour;
