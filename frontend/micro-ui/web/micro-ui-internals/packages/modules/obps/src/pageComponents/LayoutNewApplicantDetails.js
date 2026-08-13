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
import { UPDATE_LayoutNewApplication_FORM } from "../redux/actions/LayoutNewApplicationActions";
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

const LayoutNewApplicantDetails = (_props) => {
  const dispatch = useDispatch();
  const { t, currentStepData, Controller, control, setValue, errors, errorStyle, clearErrors } = _props;

  const [ownerType, setOwnerType] = useState(ownerTypeOptions[0]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [editingOwner, setEditingOwner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const closeToast = () => setShowToast(null);

  // Restore initial data strictly from currentStepData.applicants when updated (e.g. late API data arrival)
  useEffect(() => {
    const reduxApplicants = currentStepData?.applicants || [];

    // If Redux applicants data matches selectedOwners, skip re-restoring to avoid infinite loop
    if (isInitialized && areApplicantsEqual(reduxApplicants, selectedOwners)) {
      return;
    }

    let restoredOwners = [];
    if (reduxApplicants.length > 0) {
      restoredOwners = reduxApplicants.map((a) => ({
        ...a,
        name: a.name || "",
        mobileNumber: a.mobileNumber || "",
        emailId: a.emailId || "",
        fatherOrHusbandName: a.fatherOrHusbandName || "",
        permanentAddress: a.address || a.permanentAddress || "",
        dob: a.dob || "",
        gender: a.gender || "",
        panNumber: a.panNumber || a.pan || "",
        aplicantType: a.aplicantType || a.additionalDetails?.aplicantType || null,
        authorisedPerson: a.authorisedPerson || a.additionalDetails?.authorisedPerson || null,
        isPrimaryOwner: a.isPrimaryOwner,
        uuid: a.uuid !== undefined ? a.uuid : null,
        status: a.status !== undefined ? a.status : true,
      }));

      setSelectedOwners(restoredOwners);
    }

    // Fallback logic for aplicantType if null or undefined
    const formattedData = currentStepData?.applicationDetails;
    const rawType = formattedData?.aplicantType || currentStepData?.applicants?.[0]?.aplicantType;
    let inferredType = null;

    if (rawType) {
      inferredType = findOwnerTypeOption(rawType);
    }

    if (!inferredType) {
      // If aplicantType is null or undefined:
      // if length of active owners is more than 1, it should be Multiple, else Individual
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

  // Sync selected owners and owner type strictly to currentStepData.applicants array in Redux
  useEffect(() => {
    if (!isInitialized) return;

    // Update applicationDetails with ownerType only
    const updatedDetails = {
      ...currentStepData?.applicationDetails,
      aplicantType: ownerType,
    };
    dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedDetails));

    // Map all owners into applicants array
    // console.log("selectedOwners",selectedOwners)
    // Sort active owners so that primary owner (isPrimaryOwner: true) is placed at top
    const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
    const inactive = selectedOwners.filter((o) => o?.status === false || o?.status === "false");

    let primaryIdx = active.findIndex((o) => o?.isPrimaryOwner === true || o?.isPrimaryOwner === "true");
    if (primaryIdx === -1 && active.length > 0) {
      primaryIdx = 0;
    }

    const updatedActive = active.map((owner, idx) => {
      const isPrimary = idx === primaryIdx;
      const rawAppType = owner.aplicantType || owner.additionalDetails?.aplicantType;
      const appType = isPrimary ? findApplicantTypeOrIndividual(rawAppType) : null;
      const authPerson = isPrimary && appType?.code === "FIRM" ? owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null : null;

      return {
        ...owner,
        isPrimaryOwner: isPrimary ? true : null,
        aplicantType: appType,
        authorisedPerson: authPerson,
        additionalDetails: {
          ...owner.additionalDetails,
          aplicantType: appType,
          authorisedPerson: authPerson,
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

    const applicantsArray = orderedSelectedOwners.map((owner, idx) => ({
      ...owner,
      actualIndex: idx,
      name: owner.name || "",
      mobileNumber: owner.mobileNumber || "",
      emailId: owner.emailId || "",
      fatherOrHusbandName: owner.fatherOrHusbandName || "",
      address: owner.permanentAddress || owner.address || "",
      dob: owner.dob || "",
      gender: owner.gender || "",
      panNumber: owner.panNumber || owner.pan || "",
      isPrimaryOwner: owner.isPrimaryOwner,
      photoUploadedFiles: owner.photoUploadedFiles || owner.additionalDetails?.ownerPhoto || null,
      documentUploadedFiles: owner.documentUploadedFiles || owner.additionalDetails?.documentFile || null,
      panDocumentUploadedFiles: owner.panDocumentUploadedFiles || owner.additionalDetails?.panDocument || null,
      aplicantType: owner.aplicantType || owner.additionalDetails?.aplicantType || null,
      authorisedPerson: owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null,
      additionalDetails: {
        ...owner.additionalDetails,
        ownerPhoto: owner.photoUploadedFiles || owner.additionalDetails?.ownerPhoto || null,
        documentFile: owner.documentUploadedFiles || owner.additionalDetails?.documentFile || null,
        panDocument: owner.panDocumentUploadedFiles || owner.additionalDetails?.panDocument || null,
        aplicantType: owner.aplicantType || owner.additionalDetails?.aplicantType || null,
        authorisedPerson: owner.authorisedPerson || owner.additionalDetails?.authorisedPerson || null,
      },
      uuid: owner.uuid !== undefined ? owner.uuid : null,
      status: owner.status !== undefined ? owner.status : true,
    }));

    dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicantsArray));
  }, [selectedOwners, ownerType, isInitialized, dispatch]);

  const handleOwnerTypeChange = (selectedType) => {
    setOwnerType(selectedType);
    setValue("aplicantType", selectedType);
    clearErrors("aplicantType");

    if (selectedType?.code === "INDIVIDUAL") {
      const active = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
      if (active.length > 1) {
        // Keep only the first active owner, mark others as status false
        const firstActive = active[0];
        const updated = selectedOwners.map((o) => (o === firstActive ? { ...o, isPrimaryOwner: true } : { ...o, status: false, isPrimaryOwner: null }));
        setSelectedOwners(updated);
        setShowToast({
          warning: true,
          message: t("INDIVIDUAL_OWNER_TYPE_SELECTED_ONLY_ONE_OWNER_KEPT"),
        });
      }
    }
  };

  const handleEditOwner = (targetOwner) => {
    setEditingOwner(targetOwner);
    setShowModal(true);
  };

  const handleSelectUserFromModal = (userObj) => {
    const newUser = {
      ...userObj,
      name: userObj.name || "",
      mobileNumber: userObj.mobileNumber || "",
      emailId: userObj.emailId || "",
      fatherOrHusbandName: userObj.fatherOrHusbandName || "",
      permanentAddress: userObj.permanentAddress || userObj.address || "",
      dob: userObj.dob || "",
      gender: userObj.gender || "",
      panNumber: userObj.panNumber || userObj.pan || "",
      photoUploadedFiles: userObj.photoUploadedFiles || userObj.additionalDetails?.ownerPhoto || null,
      documentUploadedFiles: userObj.documentUploadedFiles || userObj.additionalDetails?.documentFile || null,
      panDocumentUploadedFiles: userObj.panDocumentUploadedFiles || userObj.additionalDetails?.panDocument || null,
      additionalDetails: {
        ...userObj.additionalDetails,
        ownerPhoto: userObj.photoUploadedFiles || userObj.additionalDetails?.ownerPhoto || null,
        documentFile: userObj.documentUploadedFiles || userObj.additionalDetails?.documentFile || null,
        panDocument: userObj.panDocumentUploadedFiles || userObj.additionalDetails?.panDocument || null,
        aplicantType: userObj.aplicantType || userObj.additionalDetails?.aplicantType || null,
        authorisedPerson: userObj.authorisedPerson || userObj.additionalDetails?.authorisedPerson || null,
      },
      uuid: userObj.uuid !== undefined ? userObj.uuid : null,
      status: true,
    };

    if (editingOwner) {
      // EDIT MODE: Check if userObj is the exact same person as editingOwner
      const isSameUser =
        userObj === editingOwner ||
        (Boolean(editingOwner?.uuid) && Boolean(userObj?.uuid) && editingOwner.uuid === userObj.uuid) ||
        (!editingOwner?.uuid && !userObj?.uuid && editingOwner?.mobileNumber === userObj?.mobileNumber && editingOwner?.name === userObj?.name);

      const isDifferentUser = !isSameUser;

      const targetIndex = selectedOwners.findIndex(
        (o) =>
          o === editingOwner ||
          (editingOwner?.uuid && o?.uuid === editingOwner.uuid) ||
          (!editingOwner?.uuid && o?.mobileNumber === editingOwner?.mobileNumber && o?.name === editingOwner?.name)
      );

      if (targetIndex !== -1) {
        const updated = [...selectedOwners];
        if (isDifferentUser) {
          // Mark previous owner object status as false
          updated[targetIndex] = { ...editingOwner, status: false, isPrimaryOwner: null };
          // New owner object takes its place
          updated.push({ ...newUser, isPrimaryOwner: editingOwner.isPrimaryOwner, status: true });
        } else {
          // Same user updated
          updated[targetIndex] = { ...newUser, isPrimaryOwner: editingOwner.isPrimaryOwner, status: true };
        }
        setSelectedOwners(updated);
      } else {
        setSelectedOwners([...selectedOwners, newUser]);
      }

      setEditingOwner(null);
      setShowToast({
        key: "true",
        message: t("OWNER_UPDATED_SUCCESSFULLY"),
      });
      return;
    }

    // ADD MODE
    const existingActiveIndex = selectedOwners.findIndex(
      (o) => o?.status !== false && o?.status !== "false" && o.mobileNumber === userObj.mobileNumber
    );
    if (existingActiveIndex !== -1) {
      setShowToast({
        error: true,
        message: t("OWNER_ALREADY_ADDED"),
      });
      return;
    }

    const activeCount = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false").length;
    if (ownerType?.code === "INDIVIDUAL" && activeCount >= 1) {
      // For individual mode, set existing active owner status to false and add new primary owner
      const updated = selectedOwners.map((o) =>
        o?.status !== false && o?.status !== "false" ? { ...o, status: false, isPrimaryOwner: null } : o
      );
      setSelectedOwners([...updated, { ...newUser, isPrimaryOwner: true }]);
    } else {
      const isFirstActive = activeCount === 0;
      setSelectedOwners([...selectedOwners, { ...newUser, isPrimaryOwner: isFirstActive ? true : null }]);
    }

    setShowToast({
      key: "true",
      message: t("OWNER_ADDED_SUCCESSFULLY"),
    });
  };

  const handleRemoveOwner = (targetOwner) => {
    // Instead of deleting, set status to false
    const updated = selectedOwners.map((o) => {
      if (o === targetOwner || (o.mobileNumber === targetOwner.mobileNumber && (o.uuid === targetOwner.uuid || !o.uuid))) {
        return { ...o, status: false, isPrimaryOwner: null };
      }
      return o;
    });
    setSelectedOwners(updated);
  };

  const isIndividual = ownerType?.code === "INDIVIDUAL";
  const isMultiple = ownerType?.code === "MULTIPLE";

  const activeOwners = selectedOwners.filter((o) => o?.status !== false && o?.status !== "false");
  const hideAddOwnerButton = (isIndividual && activeOwners.length >= 1) || showModal;

  const tableColumns = [
    {
      Header: t("SNO"),
      accessor: "sno",
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: t("NAME"),
      accessor: "name",
      Cell: ({ value, row }) => (
        <span>
          {value || t("CS_NA")}
          {row.original?.isPrimaryOwner === true ? ` (${t("PRIMARY_OWNER") || "Primary Owner"})` : ""}
        </span>
      ),
    },
    {
      Header: t("IS FIRM"),
      id: "isFirm",
      Cell: ({ row }) => {
        const appType = row.original?.aplicantType || row.original?.additionalDetails?.aplicantType;
        const code = typeof appType === "string" ? appType : appType?.code || "";
        return code.toUpperCase() === "FIRM" ? t("YES") : t("NO");
      },
    },
    {
      Header: t("FIRM NAME"),
      id: "authorisedPerson",
      Cell: ({ row }) => {
        const appType = row.original?.aplicantType || row.original?.additionalDetails?.aplicantType;
        const code = typeof appType === "string" ? appType : appType?.code || "";
        return code.toUpperCase() === "FIRM" ? row.original?.additionalDetails?.authorisedPerson : "-";
      },
    },
    {
      Header: t("MOBILE NO"),
      accessor: "mobileNumber",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("EMAIL ID"),
      accessor: "emailId",
      Cell: ({ value }) => value ? <span style={{ wordBreak: "break-all" }}>{value}</span> : t("CS_NA"),
    },
    {
      Header: t("DOB"),
      accessor: "dob",
      Cell: ({ value }) => value ? formatDate(value) : t("CS_NA"),
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
      Header: t(""),
      accessor: "actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center" }}>
          <span
            onClick={() => handleEditOwner(row.original)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            title={t("Edit Owner")}
          >
            <EditIcon />
          </span>
          <span
            onClick={() => handleRemoveOwner(row.original)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
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
        <CardSectionHeader className="card-section-header" style={{ marginBottom: "15px" }}>
          {t("BPA_APPLICANT_DETAILS")}
        </CardSectionHeader>

        {/* Owner Type Dropdown */}
        <LabelFieldPair style={{ marginBottom: "15px" }}>
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
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <CardSectionHeader className="card-section-header" style={{ marginBottom: "10px", fontSize: "16px" }}>
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
          <CardLabelError style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>
            {t("AT LEAST ONE OWNER REQUIRED")}
          </CardLabelError>
        )}

        {isMultiple && activeOwners.length === 1 && (
          <CardLabelError style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>
            {t("MULTIPLE OWNER TYPE REQUIRES MORE THAN ONE OWNER")}
          </CardLabelError>
        )}

        {/* Add Owner Button */}
        {!hideAddOwnerButton && (
          <div style={{ marginTop: "20px" }}>
            <div
              onClick={() => {
                setEditingOwner(null);
                setShowModal(true);
              }}
              style={{
                color: "#a82227",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              + {t("Add Owner")}
            </div>
          </div>
        )}

        {/* Owner Search Form */}
        {showModal && (
          <LayoutOwnerSearchModal
            closeModal={() => {
              setShowModal(false);
              setEditingOwner(null);
            }}
            onSelectUser={handleSelectUserFromModal}
            initialMobileNumber={editingOwner?.mobileNumber}
            editingOwner={editingOwner}
            isPrimaryOwner={editingOwner ? (editingOwner.isPrimaryOwner === true || editingOwner.isPrimaryOwner === "true") : (activeOwners.length === 0 || ownerType?.code === "INDIVIDUAL")}
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

export default LayoutNewApplicantDetails;
