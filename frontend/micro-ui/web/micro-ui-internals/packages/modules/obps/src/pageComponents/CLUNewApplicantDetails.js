import React, { useEffect, useState } from "react";
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
} from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM, UPDATE_OBPS_OwnerIds, UPDATE_OBPS_OwnerPhotos } from "../redux/actions/OBPSActions";
import LayoutOwnerSearchModal from "./LayoutOwnerSearchModal";
import { formatDate } from "../utils";

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#F47738">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
  </svg>
);

const ownerTypeOptions = [
  { name: "Individual", code: "INDIVIDUAL" },
  { name: "Multiple", code: "MULTIPLE" },
];

const findOwnerTypeOption = (val) => {
  if (!val) return null;
  const strVal = (typeof val === "string" ? val : val?.code || val?.name || "").toUpperCase();
  return ownerTypeOptions.find((opt) => opt.code.toUpperCase() === strVal || opt.name.toUpperCase() === strVal) || null;
};

const defaultPrimaryApplicantType = { name: "Individual", code: "INDIVIDUAL" };

const findApplicantTypeOrIndividual = (val) => {
  if (!val) return defaultPrimaryApplicantType;
  if (typeof val === "object" && (val.code || val.name)) {
    const code = (val.code || val.name).toUpperCase();
    if (code === "FIRM") return { name: "Firm", code: "FIRM" };
    return defaultPrimaryApplicantType;
  }
  const strVal = String(val).toUpperCase();
  if (strVal === "FIRM") return { name: "Firm", code: "FIRM" };
  return defaultPrimaryApplicantType;
};

const getFileId = (file) => {
  if (!file) return null;
  if (typeof file === "object") {
    return file.filestoreId || file.fileStoreId || file.documentUid || file.id || null;
  }
  return file;
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
      (item.panNumber || item.pan || "") === (target.panNumber || target.pan || "") &&
      String(item.ownershipInPct || "") === String(target.ownershipInPct || "")
    );
  });
};

const CLUNewApplicantDetails = (_props) => {
  const dispatch = useDispatch();
  const { t, currentStepData, Controller, control, setValue, errors, errorStyle, clearErrors } = _props;

  const [ownerType, setOwnerType] = useState(ownerTypeOptions[0]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [editingOwner, setEditingOwner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const closeToast = () => setShowToast(null);

  // Restore initial data from currentStepData.applicants, currentStepData.applicationDetails.owners, or edit mode apiData
  useEffect(() => {
    const reduxApplicants = currentStepData?.applicants || [];
    const stepOwners = currentStepData?.applicationDetails?.owners || [];
    const apiOwners = currentStepData?.apiData?.Clu?.[0]?.owners;

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
        ownershipInPct: a.ownershipInPct !== undefined && a.ownershipInPct !== null ? String(a.ownershipInPct) : "",
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
        ownershipInPct: a.ownershipInPct !== undefined && a.ownershipInPct !== null ? String(a.ownershipInPct) : "",
        photoUploadedFiles: getFileId(a.photoUploadedFiles) || getFileId(a.additionalDetails?.ownerPhoto) || null,
        documentUploadedFiles: getFileId(a.documentUploadedFiles) || getFileId(a.additionalDetails?.documentFile) || null,
        panDocumentUploadedFiles: getFileId(a.panDocumentUploadedFiles) || getFileId(a.additionalDetails?.panDocument) || null,
        aplicantType: a.aplicantType || a.additionalDetails?.aplicantType || null,
        authorisedPerson: a.authorisedPerson || a.additionalDetails?.authorisedPerson || null,
        isPrimaryOwner: a.isPrimaryOwner !== undefined ? a.isPrimaryOwner : (idx === 0),
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
          ownershipInPct: a.ownershipInPct !== undefined && a.ownershipInPct !== null ? String(a.ownershipInPct) : "",
          photoUploadedFiles: getFileId(a.photoUploadedFiles) || getFileId(a.additionalDetails?.ownerPhoto) || null,
          documentUploadedFiles: getFileId(a.documentUploadedFiles) || getFileId(a.additionalDetails?.documentFile) || null,
          panDocumentUploadedFiles: getFileId(a.panDocumentUploadedFiles) || getFileId(a.additionalDetails?.panDocument) || null,
          aplicantType: a.aplicantType || a.additionalDetails?.aplicantType || null,
          authorisedPerson: a.authorisedPerson || a.additionalDetails?.authorisedPerson || null,
          isPrimaryOwner: a.isPrimaryOwner !== undefined ? a.isPrimaryOwner : (idx === 0),
          uuid: a.uuid !== undefined ? a.uuid : null,
          status: a.status !== undefined ? a.status : true,
        };
      });
      setSelectedOwners(restoredOwners);
    }

    // Inferred owner type
    const formattedData = currentStepData?.applicationDetails;
    const rawType = formattedData?.aplicantType || currentStepData?.applicants?.[0]?.aplicantType;
    let inferredType = null;

    if (rawType) {
      inferredType = findOwnerTypeOption(rawType);
    }

    if (!inferredType) {
      const activeRestored = restoredOwners.filter((o) => o?.status !== false && o?.status !== "false");
      if (activeRestored.length > 1) {
        inferredType = ownerTypeOptions[1]; // Multiple
      } else {
        inferredType = ownerTypeOptions[0]; // Individual
      }
    }

    setOwnerType(inferredType);
    setValue("aplicantType", inferredType);
    setIsInitialized(true);
  }, [currentStepData]);

  // Sync to Redux whenever selectedOwners or ownerType updates
  useEffect(() => {
    if (!isInitialized) return;

    const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
    const inactive = selectedOwners.filter((o) => o?.status === false || o?.status === "false");

    let primaryIdx = active.findIndex((o) => o?.isPrimaryOwner === true || o?.isPrimaryOwner === "true");
    if (primaryIdx === -1 && active.length > 0) {
      primaryIdx = 0;
    }

    const isIndividual = ownerType?.code === "INDIVIDUAL";

    const updatedActive = active.map((owner, idx) => {
      const isPrimary = idx === primaryIdx;
      const rawAppType = owner.aplicantType || owner.additionalDetails?.aplicantType;
      const appType = isPrimary ? findApplicantTypeOrIndividual(rawAppType) : null;
      const authPerson = isPrimary && appType?.code === "FIRM" ? owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null : null;
      const share = isIndividual ? "100" : (owner.ownershipInPct || "");

      return {
        ...owner,
        isPrimaryOwner: isPrimary ? true : null,
        aplicantType: appType,
        authorisedPerson: authPerson,
        ownershipInPct: share,
        additionalDetails: {
          ...owner.additionalDetails,
          aplicantType: appType,
          authorisedPerson: authPerson,
          ownershipInPct: share,
        },
      };
    });

    if (primaryIdx > 0) {
      const [primaryObj] = updatedActive.splice(primaryIdx, 1);
      updatedActive.unshift(primaryObj);
    }

    const updatedInactive = inactive.map((owner) => ({
      ...owner,
      isPrimaryOwner: null,
    }));

    const orderedSelectedOwners = [...updatedActive, ...updatedInactive];

    const applicantsArray = orderedSelectedOwners.map((owner, idx) => {
      const photoId = getFileId(owner.photoUploadedFiles) || getFileId(owner.additionalDetails?.ownerPhoto) || null;
      const docId = getFileId(owner.documentUploadedFiles) || getFileId(owner.additionalDetails?.documentFile) || null;
      const panDocId = getFileId(owner.panDocumentUploadedFiles) || getFileId(owner.additionalDetails?.panDocument) || null;

      return {
        ...owner,
        actualIndex: idx,
        name: owner.name || "",
        mobileNumber: owner.mobileNumber || "",
        emailId: owner.emailId || "",
        fatherOrHusbandName: owner.fatherOrHusbandName || "",
        address: owner.permanentAddress || owner.address || "",
        dob: owner.dob || "",
        gender: owner.gender || null,
        panNumber: owner.panNumber || owner.pan || "",
        isPrimaryOwner: owner.isPrimaryOwner,
        ownershipInPct: owner.ownershipInPct,
        photoUploadedFiles: photoId,
        documentUploadedFiles: docId,
        panDocumentUploadedFiles: panDocId,
        aplicantType: owner.aplicantType || owner.additionalDetails?.aplicantType || null,
        authorisedPerson: owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null,
        additionalDetails: {
          ...owner.additionalDetails,
          ownerPhoto: photoId,
          documentFile: docId,
          panDocument: panDocId,
          aplicantType: owner.aplicantType || owner.additionalDetails?.aplicantType || null,
          authorisedPerson: owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null,
          ownershipInPct: owner.ownershipInPct,
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
        const isFirm = (owner.aplicantType?.code === "FIRM" || owner.additionalDetails?.aplicantType?.code === "FIRM");

        return {
          ...owner,
          name: owner.name || "",
          ownerOrFirmName: owner.name || "",
          firmName: isFirm ? owner.name : (owner.firmName || ""),
          ownerType: ownerType,
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
          ownershipInPct: owner.ownershipInPct,
          additionalDetails: {
            ...(owner.additionalDetails || {}),
            ownerPhoto: photoId,
            documentFile: docId,
            panDocument: panDocId,
            ownershipInPct: owner.ownershipInPct,
            aplicantType: owner.aplicantType || owner.additionalDetails?.aplicantType || null,
            authorisedPerson: owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null,
          },
        };
      });

    // Update Redux form data
    const updatedDetails = {
      ...currentStepData?.applicationDetails,
      aplicantType: ownerType,
      owners: activeFormattedOwners,
    };

    dispatch(UPDATE_OBPS_FORM("applicationDetails", updatedDetails));
    dispatch(UPDATE_OBPS_FORM("applicants", applicantsArray));

    // Update photo and ID lists for downstream CLUStepFormTwo and CLUSummary
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

    dispatch(UPDATE_OBPS_OwnerPhotos("ownerPhotoList", photoList));
    dispatch(UPDATE_OBPS_OwnerIds("ownerIdList", idList));

    if (typeof _props.setOwnerPhotoList === "function") _props.setOwnerPhotoList(photoList);
    if (typeof _props.setOwnerIdList === "function") _props.setOwnerIdList(idList);
  }, [selectedOwners, ownerType, isInitialized, dispatch]);

  const handleOwnerTypeChange = (selectedType) => {
    setOwnerType(selectedType);
    setValue("aplicantType", selectedType);
    clearErrors("aplicantType");

    if (selectedType?.code === "INDIVIDUAL") {
      const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
      if (active.length > 1) {
        setShowToast({
          warning: true,
          message: "Individual owner type can have only one owner. Keeping primary owner and marking others inactive.",
        });
        setSelectedOwners((prev) =>
          prev.map((owner, idx) => {
            const isPrimary = owner.isPrimaryOwner === true || owner.isPrimaryOwner === "true" || idx === 0;
            return {
              ...owner,
              ownershipInPct: "100",
              status: isPrimary ? true : false,
            };
          })
        );
      } else if (active.length === 1) {
        setSelectedOwners((prev) =>
          prev.map((owner) => ({
            ...owner,
            ownershipInPct: "100",
          }))
        );
      }
    }
  };

  const handleSelectUserFromModal = (newUserData) => {
    const isIndividual = ownerType?.code === "INDIVIDUAL";
    const shareToSet = isIndividual ? "100" : (newUserData.ownershipInPct || "");

    const enrichedUser = {
      ...newUserData,
      ownershipInPct: shareToSet,
    };

    if (editingOwner) {
      setSelectedOwners((prev) =>
        prev.map((owner) => {
          const isMatch = (editingOwner.uuid && owner.uuid === editingOwner.uuid) || owner.mobileNumber === editingOwner.mobileNumber;
          if (isMatch) {
            return {
              ...owner,
              ...enrichedUser,
              isPrimaryOwner: editingOwner.isPrimaryOwner,
              status: true,
            };
          }
          return owner;
        })
      );
      setEditingOwner(null);
    } else {
      const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
      const isFirst = active.length === 0;

      const newOwner = {
        ...enrichedUser,
        isPrimaryOwner: isFirst ? true : null,
        status: true,
      };

      const existingIndex = selectedOwners.findIndex(
        (o) => (newOwner.uuid && o.uuid === newOwner.uuid) || o.mobileNumber === newOwner.mobileNumber
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

    setShowModal(false);
  };

  const handleEditOwner = (owner) => {
    setEditingOwner(owner);
    setShowModal(true);
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
        const isTarget = (primaryOwner.uuid && owner.uuid === primaryOwner.uuid) || owner.mobileNumber === primaryOwner.mobileNumber;
        return {
          ...owner,
          isPrimaryOwner: isTarget ? true : null,
        };
      })
    );
  };

  const activeOwners = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
  const isMultiple = ownerType?.code === "MULTIPLE";
  const hideAddOwnerButton = !isMultiple && activeOwners.length >= 1;

  const totalOwnershipSum = activeOwners.reduce((acc, curr) => acc + (parseFloat(curr?.ownershipInPct) || 0), 0);

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
      Header: t("BPA_OWNERSHIP_IN_PCT_LABEL"),
      accessor: "ownershipInPct",
      Cell: ({ row, value }) => {
        if (!isMultiple) return "100%";
        return value ? `${value}%` : t("CS_NA");
      },
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
      <div>
        <CardSectionHeader className="card-section-header obps-page-components-layout-new-applicant-details--style-5">
          {t("BPA_APPLICANT_DETAILS")}
        </CardSectionHeader>

        {/* Owner Type Dropdown */}
        <LabelFieldPair className="obps-page-components-layout-new-applicant-details--style-6">
          <CardLabel className="card-label-smaller">
            {`${t("CLU_OWNER_TYPE_LABEL")}`} <span className="requiredField">*</span>
          </CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="aplicantType"
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    handleOwnerTypeChange(e);
                  }}
                  selected={findOwnerTypeOption(props.value) || ownerType}
                  option={ownerTypeOptions}
                  optionKey="name"
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.aplicantType?.message || ""}</CardLabelError>

        {/* Selected Owners Table */}
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

            {/* Total Ownership Share Display for Multiple Owners */}
            {isMultiple && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "10px 16px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: Math.round(totalOwnershipSum) === 100 ? "#00703c" : "#d4351c",
                  }}
                >
                  {t("TOTAL_OWNERSHIP_SHARE")}: {totalOwnershipSum}% {Math.round(totalOwnershipSum) === 100 ? "✓ (100%)" : "(Must be 100%)"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Validation Errors for Owners */}
        {activeOwners.length === 0 && (
          <CardLabelError className="obps-page-components-layout-new-applicant-details--style-9">
            {t("AT LEAST ONE OWNER REQUIRED")}
          </CardLabelError>
        )}

        {isMultiple && activeOwners.length === 1 && (
          <CardLabelError className="obps-page-components-layout-new-applicant-details--style-10">
            {t("MULTIPLE OWNER TYPE REQUIRES MORE THAN ONE OWNER")}
          </CardLabelError>
        )}

        {/* Add Owner Button */}
        {!hideAddOwnerButton && (
          <div className="obps-page-components-layout-new-applicant-details--style-11">
            <div
              onClick={() => {
                setEditingOwner(null);
                setShowModal(true);
              }}
              className="obps-page-components-layout-new-applicant-details--style-12"
            >
              + {t("Add Owner")}
            </div>
          </div>
        )}

        {/* Owner Search Modal */}
        {showModal && (
          <LayoutOwnerSearchModal
            closeModal={() => {
              setShowModal(false);
              setEditingOwner(null);
            }}
            onSelectUser={handleSelectUserFromModal}
            initialMobileNumber={editingOwner?.mobileNumber}
            editingOwner={editingOwner}
            isPrimaryOwner={
              editingOwner
                ? (editingOwner.isPrimaryOwner === true || editingOwner.isPrimaryOwner === "true")
                : (activeOwners.length === 0 || ownerType?.code === "INDIVIDUAL")
            }
            uploadModule="CLU"
            showOwnershipShare={isMultiple}
          />
        )}
      </div>

      {/* Toast Notification */}
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

export default CLUNewApplicantDetails;
