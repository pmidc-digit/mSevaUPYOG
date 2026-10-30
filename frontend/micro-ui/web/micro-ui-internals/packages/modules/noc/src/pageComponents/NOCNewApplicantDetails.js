import React, { useEffect, useState, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Controller } from "react-hook-form";
import {
  LabelFieldPair,
  CardLabel,
  Dropdown,
  CardLabelError,
  CardSectionHeader,
  Toast,
  DeleteIcon,
  Table,
  StatusTable,
  Row,
} from "@mseva/digit-ui-react-components";
import { Loader } from "../components/Loader";
import { PropertySearchModal } from "./PropertySearchModal";
import { PropertySearchBathinda } from "../components/PropertySearchBathinda";
import { PropertySearchLudhiana } from "../components/PropertySearchLudhiana";
import {
  UPDATE_NOCNewApplication_FORM,
  UPDATE_NOC_OwnerIds,
  UPDATE_NOC_OwnerPhotos,
} from "../redux/action/NOCNewApplicationActions";
import { formatDateForInput } from "../utils";

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#F47738">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
  </svg>
);

const ownerTypeOptions = [
  { i18nKey: "NOC_OWNER_TYPE_INDIVIDUAL", code: "Individual", value: "Individual", name: "Individual" },
  { i18nKey: "NOC_OWNER_TYPE_FIRM", code: "Firm", value: "Firm", name: "Firm" },
];

const findOwnerTypeOption = (val) => {
  if (!val) return ownerTypeOptions[0];
  const strVal = (typeof val === "string" ? val : val?.code || val?.name || "").toUpperCase();
  return ownerTypeOptions.find((opt) => opt.code.toUpperCase() === strVal || opt.name.toUpperCase() === strVal) || ownerTypeOptions[0];
};

const getFileId = (file) => {
  if (!file) return null;
  if (typeof file === "object") {
    return file.filestoreId || file.fileStoreId || file.documentUid || file.id || null;
  }
  return file;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const areApplicantsEqual = (arr1, arr2) => {
  if (!arr1 && !arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;

  return arr1.every((item, index) => {
    const target = arr2[index];
    if (!target) return false;
    return (
      (item.uuid || null) === (target.uuid || null) &&
      (item.name || "") === (target.name || "") &&
      (item.mobileNumber || "") === (target.mobileNumber || "") &&
      (item.emailId || "") === (target.emailId || "") &&
      (item.status !== undefined ? item.status : true) === (target.status !== undefined ? target.status : true) &&
      (item.isPrimaryOwner || null) === (target.isPrimaryOwner || null) &&
      (item.panNumber || item.pan || "") === (target.panNumber || target.pan || "")
    );
  });
};

const NOCNewApplicantDetails = (_props) => {
  const dispatch = useDispatch();
  const { t, currentStepData, Controller, control, setValue, errors, errorStyle, clearErrors } = _props;

  const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const stateId = Digit.ULBService.getStateId();

  const LUDHIANA_TENANT = "pb.ludhiana";
  const BATHINDA_TENANT = "pb.bathinda";
  const { data: menuList, isLoading: isMenuListLoading } = Digit.Hooks.useCustomMDMS(tenantId, "egov-location", [{ name: "TenantBoundary" }]);

  const [loader, setLoader] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [isPropertyAvailable, setIsPropertyAvailable] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(null);

  const [selectedOwners, setSelectedOwners] = useState([]);
  const [editingOwner, setEditingOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const closeToast = () => setShowToast(null);

  const convertSquareYardsToMeters = (yards) => (yards ? parseFloat((yards * 0.836127).toFixed(2)) : null);

  // Restore initial data
  useEffect(() => {
    const reduxApplicants = currentStepData?.applicants || [];
    const stepOwners = currentStepData?.applicationDetails?.owners || [];
    const apiOwners = currentStepData?.apiData?.Noc?.[0]?.owners;

    // Restore property availability
    const savedPropAvail =
      currentStepData?.applicationDetails?.isPropertyAvailable ||
      (currentStepData?.applicationDetails?.propertyId ? { code: "YES", i18nKey: "YES", value: true } : null);
    if (savedPropAvail && isPropertyAvailable === null) {
      setIsPropertyAvailable(savedPropAvail);
      setValue("isPropertyAvailable", savedPropAvail);
    }

    // Restore property details card
    const savedPropDetails = currentStepData?.applicationDetails;
    if (savedPropDetails?.propertyId && !propertyDetails) {
      setPropertyDetails({
        propertyId: savedPropDetails.propertyId,
        PropertyOwnerName: savedPropDetails.PropertyOwnerName || savedPropDetails.owners?.[0]?.PropertyOwnerName || "",
        PropertyOwnerMobileNumber: savedPropDetails.PropertyOwnerMobileNumber || savedPropDetails.owners?.[0]?.PropertyOwnerMobileNumber || "",
        PropertyOwnerAddress: savedPropDetails.PropertyOwnerAddress || savedPropDetails.owners?.[0]?.PropertyOwnerAddress || "",
        PropertyOwnerPlotArea: savedPropDetails.PropertyOwnerPlotArea || savedPropDetails.owners?.[0]?.PropertyOwnerPlotArea || "",
        propertyVasikaNo: savedPropDetails.propertyVasikaNo || savedPropDetails.owners?.[0]?.propertyVasikaNo || "",
        propertyVasikaDate: savedPropDetails.propertyVasikaDate || savedPropDetails.owners?.[0]?.propertyVasikaDate || "",
      });
    }

    if (isInitialized && areApplicantsEqual(reduxApplicants, selectedOwners)) {
      return;
    }

    let restoredOwners = [];
    if (reduxApplicants.length > 0) {
      restoredOwners = reduxApplicants.map((a) => ({
        ...a,
        name: a.name || a.ownerOrFirmName || "",
        mobileNumber: a.mobileNumber || "",
        emailId: a.emailId || "",
        fatherOrHusbandName: a.fatherOrHusbandName || "",
        permanentAddress: a.permanentAddress || a.address || "",
        dob: a.dob || a.dateOfBirth || "",
        gender: a.gender || "",
        panNumber: a.panNumber || a.pan || "",
        photoUploadedFiles: getFileId(a.photoUploadedFiles) || getFileId(a.additionalDetails?.ownerPhoto) || null,
        documentUploadedFiles: getFileId(a.documentUploadedFiles) || getFileId(a.additionalDetails?.documentFile) || null,
        panDocumentUploadedFiles: getFileId(a.panDocumentUploadedFiles) || getFileId(a.additionalDetails?.panDocument) || null,
        aplicantType: a.aplicantType || a.additionalDetails?.aplicantType || null,
        authorisedPerson: a.authorisedPerson || a.additionalDetails?.authorisedPerson || null,
        isPrimaryOwner: a.isPrimaryOwner,
        uuid: a.uuid !== undefined ? a.uuid : null,
        status: a.status !== undefined ? a.status : true,
      }));
      setSelectedOwners(restoredOwners);
    } else if (stepOwners.length > 0) {
      restoredOwners = stepOwners.map((a, idx) => ({
        ...a,
        name: a.name || a.ownerOrFirmName || "",
        mobileNumber: a.mobileNumber || "",
        emailId: a.emailId || "",
        fatherOrHusbandName: a.fatherOrHusbandName || "",
        permanentAddress: a.permanentAddress || a.address || "",
        dob: a.dob || a.dateOfBirth || "",
        gender: a.gender || "",
        panNumber: a.panNumber || a.pan || "",
        photoUploadedFiles: getFileId(a.photoUploadedFiles) || getFileId(a.additionalDetails?.ownerPhoto) || null,
        documentUploadedFiles: getFileId(a.documentUploadedFiles) || getFileId(a.additionalDetails?.documentFile) || null,
        panDocumentUploadedFiles: getFileId(a.panDocumentUploadedFiles) || getFileId(a.additionalDetails?.panDocument) || null,
        aplicantType: a.aplicantType || a.additionalDetails?.aplicantType || null,
        authorisedPerson: a.authorisedPerson || a.additionalDetails?.authorisedPerson || null,
        isPrimaryOwner: a.isPrimaryOwner !== undefined ? a.isPrimaryOwner : idx === 0,
        uuid: a.uuid !== undefined ? a.uuid : null,
        status: a.status !== undefined ? a.status : true,
      }));
      setSelectedOwners(restoredOwners);
    } else if (apiOwners && apiOwners.length > 0) {
      restoredOwners = apiOwners.map((a, idx) => {
        let formattedDob = "";
        if (a?.dob) {
          const d = new Date(a.dob);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            formattedDob = `${y}-${m}-${day}`;
          }
        }
        return {
          ...a,
          name: a.name || a.ownerOrFirmName || "",
          mobileNumber: a.mobileNumber || "",
          emailId: a.emailId || "",
          fatherOrHusbandName: a.fatherOrHusbandName || "",
          permanentAddress: a.permanentAddress || a.address || "",
          dob: formattedDob || a.dateOfBirth || "",
          gender: a.gender || "",
          panNumber: a.panNumber || a.pan || "",
          photoUploadedFiles: getFileId(a.photoUploadedFiles) || getFileId(a.additionalDetails?.ownerPhoto) || null,
          documentUploadedFiles: getFileId(a.documentUploadedFiles) || getFileId(a.additionalDetails?.documentFile) || null,
          panDocumentUploadedFiles: getFileId(a.panDocumentUploadedFiles) || getFileId(a.additionalDetails?.panDocument) || null,
          aplicantType: a.aplicantType || a.additionalDetails?.aplicantType || null,
          authorisedPerson: a.authorisedPerson || a.additionalDetails?.authorisedPerson || null,
          isPrimaryOwner: a.isPrimaryOwner !== undefined ? a.isPrimaryOwner : idx === 0,
          uuid: a.uuid !== undefined ? a.uuid : null,
          status: a.status !== undefined ? a.status : true,
        };
      });
      setSelectedOwners(restoredOwners);
    }

    // Inferred owner type & firm name from legacy data if aplicantType is missing
    const rawType = currentStepData?.applicationDetails?.ownerType || currentStepData?.applicationDetails?.owners?.[0]?.ownerType;
    const savedFirm = currentStepData?.applicationDetails?.firmName || currentStepData?.applicationDetails?.owners?.[0]?.firmName || "";
    if (restoredOwners.length > 0) {
      const first = restoredOwners[0];
      if (!first.aplicantType && rawType) {
        const isFirmRaw = String(rawType?.code || rawType || "").toUpperCase() === "FIRM";
        first.aplicantType = { name: isFirmRaw ? "Firm" : "Individual", code: isFirmRaw ? "FIRM" : "INDIVIDUAL" };
      }
      if (!first.authorisedPerson && savedFirm) {
        first.authorisedPerson = savedFirm;
      }
    }

    setIsInitialized(true);
  }, [currentStepData]);

  // Sync to Redux whenever selectedOwners or propertyDetails update
  useEffect(() => {
    if (!isInitialized) return;

    const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
    const inactive = selectedOwners.filter((o) => o?.status === false || o?.status === "false");

    let primaryIdx = active.findIndex((o) => o?.isPrimaryOwner === true || o?.isPrimaryOwner === "true");
    if (primaryIdx === -1 && active.length > 0) {
      primaryIdx = 0;
    }

    const updatedActive = active.map((owner, idx) => {
      const isPrimary = idx === primaryIdx;
      return {
        ...owner,
        isPrimaryOwner: isPrimary ? true : null,
      };
    });

    if (primaryIdx > 0) {
      const [primaryObj] = updatedActive.splice(primaryIdx, 1);
      updatedActive.unshift(primaryObj);
    }

    const primaryOwner = updatedActive[0];
    const primaryAppType = primaryOwner?.aplicantType || primaryOwner?.additionalDetails?.aplicantType;
    const appTypeCode = String(primaryAppType?.code || primaryAppType?.name || primaryOwner?.ownerType?.code || "").toUpperCase();
    const isFirm = appTypeCode === "FIRM";
    const derivedFirmName = isFirm
      ? primaryOwner?.authorisedPerson || primaryOwner?.additionalDetails?.authorisedPerson || primaryOwner?.firmName || ""
      : "";
    const derivedOwnerType = isFirm
      ? { i18nKey: "NOC_OWNER_TYPE_FIRM", code: "Firm", value: "Firm", name: "Firm" }
      : { i18nKey: "NOC_OWNER_TYPE_INDIVIDUAL", code: "Individual", value: "Individual", name: "Individual" };

    const updatedInactive = inactive.map((owner) => ({
      ...owner,
      isPrimaryOwner: null,
    }));

    const orderedSelectedOwners = [...updatedActive, ...updatedInactive];

    const applicantsArray = orderedSelectedOwners.map((owner, idx) => {
      const photoId = getFileId(owner.photoUploadedFiles) || getFileId(owner.additionalDetails?.ownerPhoto) || null;
      const docId = getFileId(owner.documentUploadedFiles) || getFileId(owner.additionalDetails?.documentFile) || null;
      const panDocId = getFileId(owner.panDocumentUploadedFiles) || getFileId(owner.additionalDetails?.panDocument) || null;
      const isOwnerPrimary = owner.isPrimaryOwner === true || owner.isPrimaryOwner === "true";

      return {
        ...owner,
        actualIndex: idx,
        name: owner.name || "",
        ownerOrFirmName: isFirm ? (derivedFirmName || owner.name || "") : (owner.name || ""),
        mobileNumber: owner.mobileNumber || "",
        emailId: owner.emailId || "",
        fatherOrHusbandName: owner.fatherOrHusbandName || "",
        address: owner.permanentAddress || owner.address || "",
        dob: owner.dob || "",
        gender: owner.gender || null,
        panNumber: owner.panNumber || owner.pan || "",
        isPrimaryOwner: owner.isPrimaryOwner,
        photoUploadedFiles: photoId,
        documentUploadedFiles: docId,
        panDocumentUploadedFiles: panDocId,
        aplicantType: isOwnerPrimary
          ? owner.aplicantType || { code: isFirm ? "FIRM" : "INDIVIDUAL", name: isFirm ? "Firm" : "Individual" }
          : null,
        authorisedPerson: isFirm && isOwnerPrimary ? derivedFirmName : null,
        propertyId: propertyDetails?.propertyId || owner.propertyId || "",
        PropertyOwnerName: propertyDetails?.PropertyOwnerName || owner.PropertyOwnerName || "",
        PropertyOwnerMobileNumber: propertyDetails?.PropertyOwnerMobileNumber || owner.PropertyOwnerMobileNumber || "",
        PropertyOwnerAddress: propertyDetails?.PropertyOwnerAddress || owner.PropertyOwnerAddress || "",
        PropertyOwnerPlotArea: propertyDetails?.PropertyOwnerPlotArea || owner.PropertyOwnerPlotArea || null,
        propertyVasikaNo: propertyDetails?.propertyVasikaNo || owner.propertyVasikaNo || null,
        propertyVasikaDate: propertyDetails?.propertyVasikaDate || owner.propertyVasikaDate || null,
        localityAreaType: propertyDetails?.localityAreaType || owner.localityAreaType || null,
        additionalDetails: {
          ...owner.additionalDetails,
          ownerPhoto: photoId,
          documentFile: docId,
          panDocument: panDocId,
          ownerType: derivedOwnerType,
          firmName: isFirm ? derivedFirmName : "",
          aplicantType: isOwnerPrimary
            ? owner.aplicantType || { code: isFirm ? "FIRM" : "INDIVIDUAL", name: isFirm ? "Firm" : "Individual" }
            : null,
          authorisedPerson: isFirm && isOwnerPrimary ? derivedFirmName : null,
        },
        uuid: owner.uuid !== undefined ? owner.uuid : null,
        status: owner.status !== undefined ? owner.status : true,
      };
    });

    const activeFormattedOwners = applicantsArray
      .filter((o) => o?.status !== false && o?.status !== "false")
      .map((owner) => {
        const genderObj =
          typeof owner.gender === "object" && owner.gender !== null
            ? owner.gender
            : owner.gender
            ? { code: owner.gender, value: owner.gender, name: owner.gender }
            : null;

        const photoId = getFileId(owner.photoUploadedFiles) || getFileId(owner.additionalDetails?.ownerPhoto) || null;
        const docId = getFileId(owner.documentUploadedFiles) || getFileId(owner.additionalDetails?.documentFile) || null;
        const panDocId = getFileId(owner.panDocumentUploadedFiles) || getFileId(owner.additionalDetails?.panDocument) || null;
        const isOwnerPrimary = owner.isPrimaryOwner === true || owner.isPrimaryOwner === "true";

        return {
          ...owner,
          name: owner.name || "",
          ownerOrFirmName: isFirm ? (derivedFirmName || owner.name || "") : (owner.name || ""),
          firmName: isFirm ? derivedFirmName : "",
          ownerType: derivedOwnerType,
          emailId: owner.emailId || "",
          mobileNumber: owner.mobileNumber || "",
          userName: owner.mobileNumber || "",
          fatherOrHusbandName: owner.fatherOrHusbandName || "",
          permanentAddress: owner.permanentAddress || owner.address || "",
          address: owner.permanentAddress || owner.address || "",
          dob: owner.dob || "",
          dateOfBirth: owner.dob || "",
          gender: genderObj,
          pan: owner.panNumber || owner.pan || null,
          panNumber: owner.panNumber || owner.pan || null,
          isPrimaryOwner: owner.isPrimaryOwner,
          aplicantType: isOwnerPrimary
            ? owner.aplicantType || { code: isFirm ? "FIRM" : "INDIVIDUAL", name: isFirm ? "Firm" : "Individual" }
            : null,
          authorisedPerson: isFirm && isOwnerPrimary ? derivedFirmName : null,
          propertyId: propertyDetails?.propertyId || owner.propertyId || "",
          PropertyOwnerName: propertyDetails?.PropertyOwnerName || owner.PropertyOwnerName || "",
          PropertyOwnerMobileNumber: propertyDetails?.PropertyOwnerMobileNumber || owner.PropertyOwnerMobileNumber || "",
          PropertyOwnerAddress: propertyDetails?.PropertyOwnerAddress || owner.PropertyOwnerAddress || "",
          PropertyOwnerPlotArea: propertyDetails?.PropertyOwnerPlotArea || owner.PropertyOwnerPlotArea || null,
          propertyVasikaNo: propertyDetails?.propertyVasikaNo || owner.propertyVasikaNo || null,
          propertyVasikaDate: propertyDetails?.propertyVasikaDate || owner.propertyVasikaDate || null,
          localityAreaType: propertyDetails?.localityAreaType || owner.localityAreaType || null,
          additionalDetails: {
            ...(owner.additionalDetails || {}),
            ownerPhoto: photoId,
            documentFile: docId,
            panDocument: panDocId,
            ownerType: derivedOwnerType,
            firmName: isFirm ? derivedFirmName : "",
            aplicantType: isOwnerPrimary
              ? owner.aplicantType || { code: isFirm ? "FIRM" : "INDIVIDUAL", name: isFirm ? "Firm" : "Individual" }
              : null,
            authorisedPerson: isFirm && isOwnerPrimary ? derivedFirmName : null,
          },
        };
      });

    // Update Redux form data
    const updatedDetails = {
      ...currentStepData?.applicationDetails,
      isPropertyAvailable: isPropertyAvailable,
      ownerType: derivedOwnerType,
      firmName: isFirm ? derivedFirmName : "",
      propertyId: propertyDetails?.propertyId || "",
      PropertyOwnerName: propertyDetails?.PropertyOwnerName || "",
      PropertyOwnerMobileNumber: propertyDetails?.PropertyOwnerMobileNumber || "",
      PropertyOwnerAddress: propertyDetails?.PropertyOwnerAddress || "",
      PropertyOwnerPlotArea: propertyDetails?.PropertyOwnerPlotArea || null,
      propertyVasikaNo: propertyDetails?.propertyVasikaNo || null,
      propertyVasikaDate: propertyDetails?.propertyVasikaDate || null,
      localityAreaType: propertyDetails?.localityAreaType || null,
      owners: activeFormattedOwners,
    };

    dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", updatedDetails));
    dispatch(UPDATE_NOCNewApplication_FORM("applicants", applicantsArray));

    // Update photo and ID lists
    const photoList = [];
    const idList = [];
    orderedSelectedOwners
      .filter((o) => o?.status !== false && o?.status !== "false")
      .forEach((owner, i) => {
        const photoId = getFileId(owner.photoUploadedFiles) || getFileId(owner.additionalDetails?.ownerPhoto) || null;
        const docId = getFileId(owner.documentUploadedFiles) || getFileId(owner.additionalDetails?.documentFile) || null;

        if (photoId) {
          photoList.push({
            filestoreId: photoId,
            fileName: i === 0 ? "Primary Owner Photo" : `Owner ${i + 1} Photo`,
            documentType: i === 0 ? "Primary Owner Photo" : `Owner${i + 1} Photo`,
            documentUid: photoId,
          });
        }
        if (docId) {
          idList.push({
            filestoreId: docId,
            fileName: i === 0 ? "Primary Owner ID" : `Owner ${i + 1} ID`,
            documentType: i === 0 ? "Primary Owner ID" : `Owner${i + 1} ID`,
            documentUid: docId,
          });
        }
      });

    dispatch(UPDATE_NOC_OwnerPhotos("ownerPhotoList", photoList));
    dispatch(UPDATE_NOC_OwnerIds("ownerIdList", idList));

    if (typeof _props.setOwnerPhotoList === "function") _props.setOwnerPhotoList(photoList);
    if (typeof _props.setOwnerIdList === "function") _props.setOwnerIdList(idList);
  }, [selectedOwners, isPropertyAvailable, propertyDetails, isInitialized, dispatch]);

  // Handle Property Selection from Modal
  const handlePropertySelect = (property) => {
    if (isPropertyAvailable?.value === false) return;

    if (property?.propertyId) {
      const propOwners = Array.isArray(property?.owners) && property.owners.length > 0 ? property.owners : [];
      const allOwnerNames = propOwners.map((o) => o?.name).filter(Boolean).join(", ");
      const allOwnerMobiles = propOwners.map((o) => o?.mobileNumber).filter(Boolean).join(", ");
      const plotArea = convertSquareYardsToMeters(property?.landArea);
      const vasikaNo = property?.additionalDetails?.vasikaNo || null;
      const vasikaDate = property?.additionalDetails?.vasikaDate || null;
      const locality = property?.address?.locality || null;
      const proposedAddress = propOwners[0]?.permanentAddress || property?.address?.doorNo || "";

      const newPropDetails = {
        propertyId: property.propertyId,
        PropertyOwnerName: allOwnerNames || propOwners[0]?.name || "",
        PropertyOwnerMobileNumber: allOwnerMobiles || propOwners[0]?.mobileNumber || "",
        PropertyOwnerAddress: propOwners[0]?.permanentAddress || proposedAddress,
        PropertyOwnerPlotArea: plotArea,
        propertyVasikaNo: vasikaNo,
        propertyVasikaDate: vasikaDate,
        localityAreaType: locality,
      };

      setPropertyDetails(newPropDetails);

      // Close Property Search Modal
      setShowPropertyModal(false);

      // Update Redux siteDetails
      dispatch(
        UPDATE_NOCNewApplication_FORM("siteDetails", {
          ...currentStepData?.siteDetails,
          vasikaNumber: vasikaNo,
          vasikaDate: formatDateForInput(vasikaDate),
          netTotalArea: plotArea,
          proposedSiteAddress: proposedAddress,
          localityAreaType: locality,
        })
      );

      // Populate details on the OWNER ADDITIONAL DETAILS modal (Step 2)
      // so the user can upload missing docs/photos/PAN and save
      if (propOwners.length > 0) {
        const po = propOwners[0];
        const ownerToComplete = {
          ...po,
          name: po?.name || allOwnerNames || "",
          mobileNumber: po?.mobileNumber || allOwnerMobiles || "",
          fatherOrHusbandName: po?.fatherOrHusbandName || "",
          emailId: po?.emailId || "",
          permanentAddress: po?.permanentAddress || proposedAddress,
          address: po?.permanentAddress || proposedAddress,
          dob: po?.dob || po?.dateOfBirth || "",
          gender: po?.gender || null,
          isPrimaryOwner: true,
          propertyId: property.propertyId,
          PropertyOwnerName: allOwnerNames || po?.name || "",
          PropertyOwnerMobileNumber: allOwnerMobiles || po?.mobileNumber || "",
          PropertyOwnerAddress: po?.permanentAddress || proposedAddress,
          PropertyOwnerPlotArea: plotArea,
          propertyVasikaNo: vasikaNo,
          propertyVasikaDate: vasikaDate,
          localityAreaType: locality,
          status: true,
        };

        setEditingOwner(ownerToComplete);
        setShowOwnerModal(true);
      }
    }
  };

  const handleSelectUserFromModal = (newUserData) => {
    if (editingOwner) {
      const existsInList = selectedOwners.some(
        (owner) =>
          (editingOwner.uuid && owner.uuid === editingOwner.uuid) ||
          (editingOwner.mobileNumber && owner.mobileNumber === editingOwner.mobileNumber)
      );

      if (existsInList) {
        setSelectedOwners((prev) =>
          prev.map((owner) => {
            const isMatch =
              (editingOwner.uuid && owner.uuid === editingOwner.uuid) ||
              (editingOwner.mobileNumber && owner.mobileNumber === editingOwner.mobileNumber);
            if (isMatch) {
              return {
                ...owner,
                ...editingOwner,
                ...newUserData,
                isPrimaryOwner: editingOwner.isPrimaryOwner !== undefined ? editingOwner.isPrimaryOwner : owner.isPrimaryOwner,
                status: true,
              };
            }
            return owner;
          })
        );
      } else {
        const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
        const isFirst = active.length === 0;
        const newOwner = {
          ...editingOwner,
          ...newUserData,
          isPrimaryOwner: editingOwner.isPrimaryOwner !== undefined ? editingOwner.isPrimaryOwner : isFirst,
          status: true,
        };
        setSelectedOwners((prev) => [...prev, newOwner]);
      }
      setEditingOwner(null);
    } else {
      const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
      const isFirst = active.length === 0;

      const newOwner = {
        ...newUserData,
        isPrimaryOwner: isFirst ? true : null,
        status: true,
      };

      const existingIndex = selectedOwners.findIndex(
        (o) => (newOwner.uuid && o.uuid === newOwner.uuid) || (newOwner.mobileNumber && o.mobileNumber === newOwner.mobileNumber)
      );

      if (existingIndex > -1) {
        setSelectedOwners((prev) => {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...newOwner,
            status: true,
          };
          return updated;
        });
      } else {
        setSelectedOwners((prev) => [...prev, newOwner]);
      }
    }

    setShowOwnerModal(false);
  };

  const handleEditOwner = (owner) => {
    setEditingOwner(owner);
    setShowOwnerModal(true);
  };

  const handleRemoveOwner = (ownerToRemove) => {
    const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
    if (active.length <= 1) {
      setShowToast({
        warning: true,
        message: "At least one owner is required.",
      });
      return;
    }

    setSelectedOwners((prev) =>
      prev.map((owner) => {
        const isMatch = (ownerToRemove.uuid && owner.uuid === ownerToRemove.uuid) || owner.mobileNumber === ownerToRemove.mobileNumber;
        if (isMatch) {
          return {
            ...owner,
            status: false,
          };
        }
        return owner;
      })
    );
  };

  const handleSetPrimary = (primaryOwner) => {
    setSelectedOwners((prev) =>
      prev.map((owner) => {
        const isTarget =
          (primaryOwner.uuid && owner.uuid === primaryOwner.uuid) ||
          (owner.name === primaryOwner.name && owner.mobileNumber === primaryOwner.mobileNumber) ||
          (!owner.uuid && !primaryOwner.uuid && owner.mobileNumber === primaryOwner.mobileNumber);
        return {
          ...owner,
          isPrimaryOwner: isTarget ? true : null,
        };
      })
    );
  };

  const activeOwners = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");

  const LayoutOwnerSearchModal = Digit?.ComponentRegistryService?.getComponent("LayoutOwnerSearchModal");

  const tableColumns = [
    {
      Header: t("S.NO"),
      accessor: "sno",
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: t("PRIMARY OWNER"),
      accessor: "isPrimaryOwner",
      Cell: ({ row }) => {
        const isPrimary = row.original?.isPrimaryOwner === true || row.original?.isPrimaryOwner === "true";
        return (
          <input
            type="radio"
            name="primaryOwnerGroup"
            checked={isPrimary}
            onChange={() => handleSetPrimary(row.original)}
            style={{ cursor: "pointer", width: "16px", height: "16px" }}
          />
        );
      },
    },
    {
      Header: t("APPLICANT NAME"),
      accessor: "name",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("MOBILE NO"),
      accessor: "mobileNumber",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("EMAIL ID"),
      accessor: "emailId",
      Cell: ({ value }) => (value ? <span className="obps-page-components-layout-new-applicant-details--style-1">{value}</span> : t("CS_NA")),
    },
    {
      Header: t("DOB"),
      accessor: "dob",
      Cell: ({ value }) => (value ? formatDate(value) : t("CS_NA")),
    },
    {
      Header: t("GUARDIAN NAME"),
      accessor: "fatherOrHusbandName",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("ADDRESS"),
      accessor: "permanentAddress",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("GENDER"),
      accessor: "gender",
      Cell: ({ value }) => (typeof value === "object" ? t(value?.i18nKey || value?.code) : t(value) || t("CS_NA")),
    },
    {
      Header: t("ACTIONS"),
      accessor: "actions",
      Cell: ({ row }) => (
        <div className="obps-page-components-layout-new-applicant-details--style-2">
          <span
            onClick={() => handleEditOwner(row.original)}
            className="obps-page-components-layout-new-applicant-details--style-3"
            title={t("Edit Owner")}
          >
            <EditIcon />
          </span>
          <span
            onClick={() => handleRemoveOwner(row.original)}
            className="obps-page-components-layout-new-applicant-details--style-4"
            title={t("Remove Owner")}
          >
            <DeleteIcon fill="#a82227" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("NOC_APPLICANT_DETAILS")}</CardSectionHeader>
      <div>
        {(loader || isMenuListLoading) && <Loader page={true} />}

        {/* 1. Property Tax Availability Section */}
        <div>
          <LabelFieldPair>
            <CardLabel>
              {`${t("BPA_IS_PROPERTY_AVAILABLE_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="isPropertyAvailable"
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    placeholder={t("IS_PROPERTY_AVAILABLE")}
                    selected={props.value || isPropertyAvailable}
                    select={(e) => {
                      props.onChange(e);
                      setIsPropertyAvailable(e);

                      if (e?.value === false) {
                        setPropertyDetails(null);
                        dispatch(UPDATE_NOCNewApplication_FORM("cpt", null));
                        dispatch(
                          UPDATE_NOCNewApplication_FORM("siteDetails", {
                            ...currentStepData?.siteDetails,
                            vasikaNumber: "",
                            vasikaDate: null,
                            netTotalArea: null,
                            proposedSiteAddress: "",
                            localityAreaType: null,
                          })
                        );
                      }
                    }}
                    option={[
                      { code: "YES", i18nKey: "YES", value: true },
                      { code: "NO", i18nKey: "NO", value: false },
                    ]}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {errors?.isPropertyAvailable && (
            <CardLabelError style={errorStyle}>{errors.isPropertyAvailable.message}</CardLabelError>
          )}

          {isPropertyAvailable?.value === false && (
            <CardLabelError className="noc-page-components-nocapplicant-details--style-5">
              {t("NO_PROPERTY_AVAILABLE_DISCLAIMER")}
            </CardLabelError>
          )}

          {/* Property Tax Search Buttons for Ludhiana / Bathinda / Other ULBs */}
          {tenantId === LUDHIANA_TENANT && isPropertyAvailable?.value && (
            <PropertySearchLudhiana formData={currentStepData} setApiLoading={setLoader} menuList={menuList} />
          )}
          {tenantId === BATHINDA_TENANT && isPropertyAvailable?.value && (
            <PropertySearchBathinda formData={currentStepData} setApiLoading={setLoader} menuList={menuList} />
          )}
          {tenantId !== LUDHIANA_TENANT && tenantId !== BATHINDA_TENANT && isPropertyAvailable?.value && (
            <button
              type="button"
              className="submit-bar"
              style={{ marginBottom: "1rem" }}
              onClick={() => setShowPropertyModal(true)}
            >
              {t("PT_SEARCH_PROPERTY")}
            </button>
          )}

          {/* Property Details Status Table */}
          {propertyDetails?.propertyId && (
            <div className="field" style={{ marginBottom: "20px" }}>
              <StatusTable className="noc-page-components-nocapplicant-details--style-7">
                <Row className="border-none" label={t("PROPERTY_ID")} text={propertyDetails.propertyId} />
                <Row label={t("PROPERTY_OWNER_NAME")} text={propertyDetails.PropertyOwnerName} />
                <Row label={t("PROPERTY_OWNER_MOBILE_NUMBER")} text={propertyDetails.PropertyOwnerMobileNumber} />
                <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={propertyDetails.PropertyOwnerAddress} />
                <Row
                  label={t("PROPERTY_PLOT_AREA")}
                  text={propertyDetails.PropertyOwnerPlotArea ? `${propertyDetails.PropertyOwnerPlotArea} SQ.MT.` : t("CS_NA")}
                />
                <Row label={t("Vasika Number")} text={propertyDetails.propertyVasikaNo || t("CS_NA")} />
                <Row label={t("Vasika Date")} text={propertyDetails.propertyVasikaDate || t("CS_NA")} />
              </StatusTable>
            </div>
          )}
        </div>

        {/* 2. Selected Owners Table */}
        {activeOwners.length > 0 && (
          <div className="obps-page-components-layout-new-applicant-details--style-7">
            <CardSectionHeader className="card-section-header obps-page-components-layout-new-applicant-details--style-8">
              {t("SELECTED OWNERS DETAILS")}
            </CardSectionHeader>
            <StatusTable>
              <Table
                className="customTable table-border-style"
                t={t}
                data={activeOwners}
                columns={tableColumns}
                getCellProps={() => ({ style: {} })}
                disableSort={true}
                autoSort={false}
                manualPagination={false}
                isPaginationRequired={false}
              />
            </StatusTable>
          </div>
        )}

        {/* Validation Errors for Owners */}
        {activeOwners.length === 0 && (
          <CardLabelError className="obps-page-components-layout-new-applicant-details--style-9">
            {t("AT LEAST ONE OWNER REQUIRED")}
          </CardLabelError>
        )}

        {/* 4. Add Owner Button */}
        <div className="obps-page-components-layout-new-applicant-details--style-11">
          <div
            onClick={() => {
              if (activeOwners.length === 0 && propertyDetails?.propertyId) {
                const propOwnerObj = {
                  name: propertyDetails.PropertyOwnerName || "",
                  mobileNumber: propertyDetails.PropertyOwnerMobileNumber || "",
                  permanentAddress: propertyDetails.PropertyOwnerAddress || "",
                  address: propertyDetails.PropertyOwnerAddress || "",
                  propertyId: propertyDetails.propertyId,
                  PropertyOwnerName: propertyDetails.PropertyOwnerName || "",
                  PropertyOwnerMobileNumber: propertyDetails.PropertyOwnerMobileNumber || "",
                  PropertyOwnerAddress: propertyDetails.PropertyOwnerAddress || "",
                  PropertyOwnerPlotArea: propertyDetails.PropertyOwnerPlotArea || null,
                  propertyVasikaNo: propertyDetails.propertyVasikaNo || null,
                  propertyVasikaDate: propertyDetails.propertyVasikaDate || null,
                  localityAreaType: propertyDetails.localityAreaType || null,
                  isPrimaryOwner: true,
                  status: true,
                };
                setEditingOwner(propOwnerObj);
              } else {
                setEditingOwner(null);
              }
              setShowOwnerModal(true);
            }}
            className="obps-page-components-layout-new-applicant-details--style-12"
          >
            + {t("Add Owner")}
          </div>
        </div>

        {/* 5. Modals */}
        {showOwnerModal && LayoutOwnerSearchModal && (
          <LayoutOwnerSearchModal
            closeModal={() => {
              setShowOwnerModal(false);
              setEditingOwner(null);
            }}
            onSelectUser={handleSelectUserFromModal}
            initialMobileNumber={editingOwner?.mobileNumber}
            editingOwner={editingOwner}
            isPrimaryOwner={
              editingOwner
                ? editingOwner.isPrimaryOwner === true || editingOwner.isPrimaryOwner === "true"
                : activeOwners.length === 0
            }
            uploadModule="NOC"
            showOwnershipShare={false}
          />
        )}

        {showPropertyModal && (
          <PropertySearchModal
            closeModal={() => setShowPropertyModal(false)}
            onPropertySelect={handlePropertySelect}
            formData={currentStepData}
            setApiLoading={setLoader}
            tenantId={tenantId}
          />
        )}
      </div>

      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          onClose={closeToast}
          isDleteBtn={true}
        />
      )}
    </React.Fragment>
  );
};

export default NOCNewApplicantDetails;
