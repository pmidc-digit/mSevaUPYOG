import React, { use, useEffect, useState } from "react";
import {
  CardLabel,
  Dropdown,
  UploadFile,
  Toast,
  Loader,
  FormStep,
  CitizenInfoLabel,
  OpenLinkContainer,
  BackButton,
  ActionBar,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import { LoaderNew } from "../components/LoaderNew";
import { useLocation } from "react-router-dom";
import CustomUploadFile from "../components/CustomUploadFile";

const StakeholderDocuments = ({ t, config, onSelect, userType, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const sessionData = JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT"))
  const formData = sessionData?.value || {};
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(
    formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments ||formData?.documents?.documents ||  []
  );
  console.log("check formData", formData, documents);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const [bpaTaxDocuments, setBpaTaxDocuments] = useState([]);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  let isopenlink = window.location.href.includes("/openlink/");
  const isMobile = window.Digit.Utils.browser.isMobile();
  const selectedTenantId = formData?.formData?.LicneseType?.LicenseType?.code === "Architect" ? stateId : tenantId;  

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  const { data, isLoading } = Digit.Hooks.obps.useMDMS(selectedTenantId, "StakeholderRegistraition", "TradeTypetoRoleMapping");
  console.log("data in StakeholderDocsRequired", documents);

  useEffect(() => {
    let filtredBpaDocs = [];
    if (data?.StakeholderRegistraition?.TradeTypetoRoleMapping) {
      filtredBpaDocs = data?.StakeholderRegistraition?.TradeTypetoRoleMapping?.filter(
        (ob) => (ob.tradeType === formData?.formData?.LicneseType?.LicenseType?.tradeType || ob.tradeType === formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType)
      );
    }

    let documentsList = [];
    filtredBpaDocs?.[0]?.docTypes?.forEach((doc) => {
      documentsList.push(doc);
    });
    console.log("documentsList here", documentsList, filtredBpaDocs);
    setBpaTaxDocuments(documentsList);
  }, [!isLoading]);

  useEffect(() => {
    if(JSON.stringify(sessionData?.value?.result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments) != JSON.stringify(formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments)){
      setDocuments(sessionData?.value?.result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments);
    }
  }, [formData]);

  const handleSubmit = async () => {
    let document = formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments ? {
      document: formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments
    } : formData.documents;
    let documentStep;
    let regularDocs = [];
    bpaTaxDocuments &&
      documents &&
      documents !== null &&
      bpaTaxDocuments.map((initialob, index) => {
        let docobject = documents.find((ob) => ob && ob !== null && ob.documentType === initialob.code);
        if (docobject) regularDocs.push(docobject);
      });
    documentStep = { ...document, documents: regularDocs };
    console.log("coming here");
    console.log("documentStep", documentStep);
    console.log("formData", formData);

    const licenseData = formData?.result?.Licenses[0];

    const payload = {
      Licenses: [
        {
          ...licenseData, // Spread ALL fields from original license data
          action: "SAVE_AS_DRAFT", // Override with workflow action
          // assignee: typeof selectedAction === "object" ? selectedAction.assignee : null,
          // comment: typeof selectedAction === "object" ? selectedAction.comment : null,
          tradeLicenseDetail: {
            ...licenseData.tradeLicenseDetail,
            applicationDocuments: documents,
          },
        },
      ],
    };
    console.log("payload", payload);
    setLoader(true);
    try {
      const response = await Digit.OBPSService.BPAREGupdate(payload, tenantId);
      let data = {
        ...sessionData,
        value: {
          ...sessionData?.value,
          result: {
            ...response
          }
        }
      };

      sessionStorage.setItem("Digit.BUILDING_PERMIT", JSON.stringify(data));
      setLoader(false);
      console.log("UPDATE response:", response);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }

    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    bpaTaxDocuments.map((doc) => {
      let isRequired = false;
      documents.map((data) => {
        if (doc.required && data !== null && data && doc.code == `${data.documentType.split(".")[0]}.${data.documentType.split(".")[1]}`) {
          isRequired = true;
        }
      });
      if (!isRequired && doc.required) {
        count = count + 1;
      }
    });
    if ((count == "0" || count == 0) && documents.length > 0) setEnableSubmit(false);
    else setEnableSubmit(true);
  }, [documents, checkRequiredFields]);

  return (
    <div>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        {isMobile && <Timeline currentStep={3} flow="STAKEHOLDER" />}
        {!formData?.initiationFlow && (
          <CitizenInfoLabel
            info={t("CS_FILE_APPLICATION_INFO_LABEL")}
            text={`${t("BPA_APPLICATION_NUMBER_LABEL")} ${formData?.result?.Licenses?.[0]?.applicationNumber} ${t("BPA_DOCS_INFORMATION")}`}
            className={"info-banner-wrap-citizen-override"}
          />
        )}
        <FormStep
          t={t}
          config={config}
          onSelect={handleSubmit}
          onSkip={onSkip}
          isDisabled={enableSubmit}
          onAdd={onAdd}
          cardStyle={{ paddingRight: "16px" }}
        >
          {bpaTaxDocuments?.map((document, index) => {
            return (
              <SelectDocument
                key={index}
                document={document}
                t={t}
                error={error}
                setError={setError}
                setDocuments={setDocuments}
                documents={documents}
                setCheckRequiredFields={setCheckRequiredFields}
                isCitizenUrl={isCitizenUrl}
                formData={formData}
              />
            );
          })}
          {error && <Toast label={error} isDleteBtn={true} onClose={() => setError(null)} error />}
        </FormStep>
      </div>
      <ActionBar>
        <SubmitBar label={t("CS_COMMON_NEXT")} onSubmit={handleSubmit} disabled={enableSubmit} />
      </ActionBar>
      {(loader || isLoading) && <LoaderNew page={true} />}
    </div>
    // </div>
  );
};

function SelectDocument({ t, document: doc, setDocuments, error, setError, documents, setCheckRequiredFields, isCitizenUrl, formData }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  const [loader, setLoader] = useState(false);
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: true, code: filteredDocument?.documentType, i18nKey: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);
  const { pathname } = useLocation();
  let currentPath = pathname.split("/").pop();
  console.log("currentPath", formData);
  let isEditable = !formData?.editableFields || formData?.editableFields?.[currentPath];
  // let isEditable = true;

  const handleSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }

  // useEffect(() => {
  //   setDocuments((prev) => {
  //     const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);

  //     if (uploadedFile?.length === 0 || uploadedFile === null) {
  //       return filteredDocumentsByDocumentType;
  //     }

  //     const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
  //     return [
  //       ...filteredDocumentsByFileStoreId,
  //       {
  //         documentType: doc?.code,
  //         fileStoreId: uploadedFile,
  //         documentUid: uploadedFile,
  //         fileName: file?.name || "",
  //         info: doc?.info || "",
  //       },
  //     ];
  //   });
  // }, [uploadedFile, file]);

  useEffect(() => {
    // GET existing doc entry (if any)
    const existing = documents?.find((d) => d.documentType === doc.code);
    console.log("existing doc", existing, documents);
    if (!uploadedFile) {
      // DELETE CASE
      setDocuments((prev) => prev.filter((item) => item.documentType !== doc.code));
      return;
    }


    // 🚫 No need to update if fileStoreId is the same → prevents re-running effect
    if (existing && existing.fileStoreId === uploadedFile) return;

    // ADD / UPDATE CASE
    setDocuments((prev) => {
      const filtered = prev.filter((item) => item.documentType !== doc.code);

      return [
        ...filtered,
        {
          id: existing?.id || null,
          documentType: doc.code,
          fileStoreId: uploadedFile,
          documentUid: null,
          // fileName: file?.name || existing?.fileName || "",
          // info: doc?.info || existing?.info || "",
          active: existing?.active || true,
        },
      ];
    });
  }, [uploadedFile]);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        const allowedFileTypesRegex = /(.*?)(jpg|jpeg|png|image|pdf)$/i;
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else if (file?.type && !allowedFileTypesRegex.test(file?.type)) {
          setError(t(`NOT_SUPPORTED_FILE_TYPE`));
        } else {
          setLoader(true);
          try {
            // setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setLoader(false);
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  return (
    <div style={{ marginBottom: "24px" }}>
      <CardLabel style={{ marginBottom: "10px" }}>
        {doc?.required ? `${t(`BPAREG_HEADER_${doc?.code?.replace(".", "_")}`)} *` : `${t(`BPAREG_HEADER_${doc?.code?.replace(".", "_")}`)}`}
      </CardLabel>
      {doc?.info ? (
        <div style={{ fontSize: "12px", color: "#505A5F", fontWeight: 400, lineHeight: "15px", marginBottom: "10px" }}>{`${t(doc?.info)}`}</div>
      ) : null}
      {(doc?.code === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO"|| doc?.code === "APPL.BPAREG_SCANNED_SIGNATURE")  ? (
        <CustomUploadFile
          extraStyleName={"OBPS"}
          accept=".png, .jpeg, .jpg"
          onUpload={selectfile}
          onDelete={() => {
            setUploadedFile(null);
            setCheckRequiredFields(true);
          }}
          uploadedFile={uploadedFile}
          message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
          disabled={!isEditable}
          // iserror={error}
        />
      ) : (
        <CustomUploadFile
          extraStyleName={"OBPS"}
          accept="image/*, .pdf, .png, .jpeg, .jpg"
          onUpload={selectfile}
          onDelete={() => {
            setUploadedFile(null);
            setCheckRequiredFields(true);
          }}
          uploadedFile={uploadedFile}
          message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
          disabled={!isEditable}
          // iserror={error}
        />
      )}
      {(doc?.code === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO" || doc?.code === "APPL.BPAREG_SCANNED_SIGNATURE") ? (<p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>) : (<p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>)}
      {loader && <LoaderNew page={true} />}
    </div>
  );
}

export default StakeholderDocuments;
