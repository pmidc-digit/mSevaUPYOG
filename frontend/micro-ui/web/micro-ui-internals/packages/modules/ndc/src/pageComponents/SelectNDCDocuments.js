import React, { useEffect, useState } from "react";
import { CardLabel, LabelFieldPair, Dropdown, UploadFile, Toast, Loader } from "@mseva/digit-ui-react-components";

const SelectNDCDocuments = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);

  const { action = "create" } = Digit.Hooks.useQueryParams();

  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", [
    "Documents",
  ]);

  console.log("Documents data:", data);

  const ndcDocuments = data?.NDC?.Documents;

  const goNext = () => {
    onSelect(config.key, { documents, ndcDocumentsLength: ndcDocuments?.length });
  };

  useEffect(() => {
    goNext();
  }, [documents]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {ndcDocuments?.map((document, index) => {
        // if (document.code === "OWNER.SPECIALCATEGORYPROOF") {
        //   if (formData?.owners?.every((user) => user.ownerType.code === "NONE" || !user.ownerType?.code)) {
        //     return null;
        //   }
        // }
        return (
          <SelectDocument
            key={index}
            document={document}
            action={action}
            t={t}
            error={error}
            setError={setError}
            setDocuments={setDocuments}
            documents={documents}
            formData={formData}
            setFormError={setFormError}
            clearFormErrors={clearFormErrors}
            config={config}
            formState={formState}
          />
        );
      })}
      {error && <Toast label={error} onClose={() => setError(null)} error />}
    </div>
  );
};

function SelectDocument({
  t,
  document: doc,
  setDocuments,
  error,
  setError,
  documents,
  action,
  formData,
  setFormError,
  clearFormErrors,
  config,
  formState,
}) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);

  const handleSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  const { dropdownData } = doc;
  // const { dropdownFilter, enabledActions, filterCondition } = doc?.additionalDetails;
  var dropDownData = dropdownData;
  let hideInput = false;

  const [isHidden, setHidden] = useState(hideInput);

  const addError = () => {
    let type = formState.errors?.[config.key]?.type;
    if (!Array.isArray(type)) type = [];
    if (!type.includes(doc.code)) {
      type.push(doc.code);
      setFormError(config.key, { type });
    }
  };

  const removeError = () => {
    let type = formState.errors?.[config.key]?.type;
    if (!Array.isArray(type)) type = [];
    if (type.includes(doc?.code)) {
      type = type.filter((e) => e != doc?.code);
      if (!type.length) {
        clearFormErrors(config.key);
      } else {
        setFormError(config.key, { type });
      }
    }
  };

  useEffect(() => {
    // console.log("Selected Document Code:", uploadedFile, doc.code);
    if (uploadedFile) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: doc?.code,
            fileStoreId: uploadedFile,
            documentUid: uploadedFile,
          },
        ];
      });
    }
    if (!isHidden) {
      if (!uploadedFile || !doc?.code) {
        addError();
      } else if (uploadedFile && doc?.code) {
        removeError();
      }
    } else if (isHidden) {
      removeError();
    }
  }, [uploadedFile, isHidden]);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  // if (filterCondition) {
  //   const { filterValue, jsonPath, onArray, arrayAttribute, formDataPath, formArrayAttrPath } = filterCondition;
  //   if (action === "create") {
  //     const value = formDataPath?.reduce((acc, key) => {
  //       if (key.charAt(0).toUpperCase() + key.slice(1) === "PropertyType") return acc["PropertyType"];
  //       return acc?.[key];
  //     }, formData);
  //     if (value) {
  //       if (onArray) {
  //         const valueArr = value?.map((e) => formArrayAttrPath?.reduce((acc, f) => acc?.[f], e) || e);
  //         hideInput = valueArr?.some((e) => filterValue.includes(e));
  //       } else {
  //         hideInput = filterValue?.includes(value);
  //       }
  //       if (hideInput !== isHidden) setHidden(hideInput);
  //       if (hideInput) return null;
  //     }
  //   }
  // }

  // if (dropdownFilter) {
  //   const { formDataPath, formArrayAttrPath, onArray } = dropdownFilter;
  //   if (action === "create") {
  //     const arr = formDataPath;
  //     const value = arr?.reduce((acc, key) => acc?.[key], formData);
  //     const attrForFormArray = formArrayAttrPath;

  //     if (value) {
  //       if (!onArray) dropDownData = dropdownData.filter((e) => e.parentValue.includes(value));
  //       else {
  //         const valueMap = value.map((e) => attrForFormArray?.reduce((acc, key) => acc[key], e) || e);
  //         dropDownData = dropdownData.filter((e) => e.parentValue.some((val) => valueMap.includes(val)));
  //       }
  //     }
  //   }
  // }

  return (
    <div style={{ marginBottom: "24px" }}>
      <LabelFieldPair>
      <CardLabel className="card-label-smaller">{t(doc?.code)}</CardLabel>
        <div className="field">
          <UploadFile
            id={"tl-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            // disabled={enabledActions?.[action].disableUpload || !selectedDocument?.code}
          />
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default SelectNDCDocuments;
