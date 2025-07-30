import React, { useEffect, useState } from "react";
import {
  CardLabel,
  LabelFieldPair,
  Dropdown,
  UploadFile,
  Toast,
  Loader,
} from "@mseva/digit-ui-react-components";
import { useParams } from "react-router-dom";


import { useLocation } from "react-router-dom";
const AssetDocuments = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);

  let action = "create";
  const { id:applicationNo } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: applicationDetails } = Digit.Hooks.asset.useAssetApplicationDetail(t,tenantId, applicationNo);
  let comingDataFromAPI = applicationDetails?.applicationData?.applicationData?.documents



  const { pathname } = useLocation();
  

  const { isLoading, data } = Digit.Hooks.asset.useAssetDocumentsMDMS(stateId, "ASSET", "Documents");   


  const AssetsDocument = data?.ASSET?.Documents.map(document => ({
  ...document,
  hasDropdown: true
}));


  const goNext = () => {
    onSelect(config.key, { documents, AssetsDocumentLength: AssetsDocument?.length });
  };

  
  useEffect(() => {
    goNext();
  }, [documents]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {AssetsDocument?.map((document, index) => {
        return (
          <AssetSelectDocument
            key={index}
            document={document}
            action={action}
            t={t}
            id={`document-${index}`}
            error={error}
            setError={setError}
            setDocuments={setDocuments}
            accept=".pdf, .jpeg, .jpg, .png"
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

function AssetSelectDocument({
  t,
  document: doc,
  setDocuments,
  setError,
  documents,
  setFormError,
  clearFormErrors,
  config,
  formState,
  comingDataFromAPI,
  id
}) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];

  
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: filteredDocument?.status === "ACTIVE", code: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );

 
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);

  const handleAssetSelectDocument = (value) => setSelectedDocument(value);
  

  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  const { dropdownData } = doc;
 
  var dropDownData = dropdownData;
  const [isHidden, setHidden] = useState(false);

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
    if (selectedDocument?.code) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: selectedDocument?.code,
            fileStoreId: uploadedFile,
            documentUid: uploadedFile,
          },
        ];
      });
    }
    if (!isHidden) {
      if (!uploadedFile || !selectedDocument?.code) {
        addError();
      } else if (uploadedFile && selectedDocument?.code) {
        removeError();
      }
    } else if (isHidden) {
      removeError();
    }
  }, [uploadedFile, selectedDocument, isHidden]);

 

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("ASSET", file, Digit.ULBService.getStateId());
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

  useEffect(() => {
    if (isHidden) setUploadedFile(null);
  }, [isHidden]);



  return (
    <div style={{ marginBottom: "24px" }}>
      {doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + "  *"}</CardLabel>
          {/* <Dropdown
            className="form-field"
            selected={selectedDocument}
            option={dropDownData.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
            select={handleAssetSelectDocument}
            optionKey="i18nKey"
            t={t}
          /> */}
        </LabelFieldPair>
      ) : null}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller"></CardLabel>
        <div className="field">
          <UploadFile
            onUpload={selectfile}
            selectedDocument={comingDataFromAPI?.[0]?.fileStoreId}
            onDelete={() => {
              setUploadedFile(null);
            }}
            id={id}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept=".pdf, .jpeg, .jpg, .png"   //  to accept document of all kind
            buttonType="button"
            error={!uploadedFile}
          />
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default AssetDocuments;
