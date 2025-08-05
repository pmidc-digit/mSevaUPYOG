import React, { useEffect, useState } from "react";
import {
  CardLabel,
  Dropdown,
  UploadFile,
  Toast,
  Loader,
  FormStep,
  LabelFieldPair,
  Card,
  CardSubHeader,
  CardLabelDesc,
} from "@mseva/digit-ui-react-components";
import Timeline from "../components/ADSTimeline";
import ADSCartAndCancellationPolicyDetails from "../components/ADSCartAndCancellationPolicyDetails";
import { TimerValues } from "../components/TimerValues";
/**
 * ADSDocumentDetails component allows users to upload required documents
 * for the ADS application. It manages document state, validates uploads,
 * and integrates with a document selection dropdown.
 */

const ADSDocumentDetails = ({
  t,
  config,
  onSelect,
  userType,
  formData,
  setError: setFormError,
  clearErrors: clearFormErrors,
  formState,
  value = formData.adslist,
}) => {
  const [documents, setDocuments] = useState(formData?.documents?.documents || value?.existingDataSet?.documents?.documents || []);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);

  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const mutation = Digit.Hooks.ads.useADSCreateAPI();
  const stateId = Digit.ULBService.getStateId();

  const { isLoading, data } = Digit.Hooks.ads.useADSDocumentsMDMS(stateId, "Advertisement", "Documents");

  const handleSubmit = () => {
    let cartDetails = value?.cartDetails.map((slot) => {
      return {
        addType: slot.addTypeCode,
        faceArea: slot.faceAreaCode,
        location: slot.locationCode,
        nightLight: slot.nightLight === "Yes" ? true : false,
        bookingDate: slot.bookingDate,
        bookingFromTime: "06:00",
        bookingToTime: "05:59",
        status: "BOOKING_CREATED",
      };
    });
    // Create the formdata object
    const formdata = {
      bookingApplication: {
        tenantId: tenantId,
        draftId: formData?.applicant?.draftId,
        applicantDetail: {
          applicantName: formData?.applicant?.applicantName,
          applicantMobileNo: formData?.applicant?.mobileNumber,
          applicantAlternateMobileNo: formData?.applicant?.alternateNumber,
          applicantEmailId: formData?.applicant?.emailId,
        },
        addressdetails: {
          pincode: formData?.address?.pincode,
          city: formData?.address?.city?.city?.name,
          cityCode: formData?.address?.city?.city?.code,
          locality: formData?.address?.locality?.i18nKey,
          localityCode: formData?.address?.locality?.code,
          streetName: formData?.address?.streetName,
          addressLine1: formData?.address?.addressline1,
          addressLine2: formData?.address?.addressline2,
          houseNo: formData?.address?.houseNo,
          landmark: formData?.address?.landmark,
        },
        documents: documents,
        cartDetails: cartDetails,
        bookingStatus: "BOOKING_CREATED",
      },
      isDraftApplication: true,
    };
    // Trigger the mutation
    mutation.mutate(formdata);
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    data?.Advertisement?.Documents.map((doc) => {
      doc.hasDropdown = true;

      let isRequired = false;
      documents.map((data) => {
        if (doc.required && data?.documentType.includes(doc.code)) isRequired = true;
      });
      if (!isRequired && doc.required) count = count + 1;
    });
    if ((count == "0" || count == 0) && documents.length > 0) setEnableSubmit(false);
    else setEnableSubmit(true);
  }, [documents, checkRequiredFields]);

  return (
    <div>
      <Timeline currentStep={3} />
      <Card>
        <div style={{ position: "relative" }}>
          <CardSubHeader style={{ position: "absolute", right: 0 }}>
            <TimerValues
              timerValues={value?.existingDataSet?.timervalue?.timervalue}
              SlotSearchData={value?.cartDetails}
              draftId={value?.existingDataSet?.draftId}
            />
          </CardSubHeader>
          <ADSCartAndCancellationPolicyDetails />
        </div>
      </Card>
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          <CardSubHeader>{t(`ADS_PROOF_OF_DOCUMENTS`)}</CardSubHeader>
          <CardLabelDesc>{t(`ADS_UPLOAD_RESTRICTIONS_TYPES`)}</CardLabelDesc>
          <CardLabelDesc>{t(`ADS_UPLOAD_RESTRICTIONS_SIZE`)}</CardLabelDesc>
          {data?.Advertisement?.Documents?.map((document, index) => {
            return (
              <ADSSelectDocument
                key={index}
                document={document}
                t={t}
                error={error}
                setError={setError}
                setDocuments={setDocuments}
                documents={documents}
                setCheckRequiredFields={setCheckRequiredFields}
              />
            );
          })}
          {error && <Toast label={error} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function ADSSelectDocument({
  t,
  document: doc,
  setDocuments,
  setError,
  documents,
  action,
  formData,

  id,
}) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];

  const user = Digit.UserService.getUser().info;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? {
          ...filteredDocument,
          active: true,
          code: filteredDocument?.documentType,
          i18nKey: "ADS_" + filteredDocument?.documentType.replaceAll(".", "_"),
        }
      : doc?.dropdownData?.length > 0
      ? doc?.dropdownData[0]
      : {}
  );

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);
  const [isUploading, setIsUploading] = useState(false);
  const handleADSSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  const { dropdownData } = doc;

  var dropDownData = dropdownData;

  const [isHidden, setHidden] = useState(false);

  const LoadingSpinner = () => <div className="loading-spinner" />;

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
  }, [uploadedFile, selectedDocument]);

  useEffect(() => {
    if (action === "update") {
      const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
      const docType = dropDownData
        .filter((e) => e.code === originalDoc?.documentType)
        .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
      if (!docType) setHidden(true);
      else {
        setSelectedDocument(docType);
        setUploadedFile(originalDoc?.fileStoreId);
      }
    } else if (action === "create") {
    }
  }, []);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          // if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          try {
            setUploadedFile(null);
            setIsUploading(true);
            const response = await Digit.UploadServices.Filestorage("ADS", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"));
          } finally {
            setIsUploading(false);
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
          <CardLabel className="card-label-smaller">
            {t("ADS_" + doc?.code.replaceAll(".", "_"))} <span className="check-page-link-button">*</span>
          </CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            style={{ width: user.type === "EMPLOYEE" ? "50%" : "100%" }}
            placeholder={"Select " + t("ADS_" + doc?.code.replaceAll(".", "_"))}
            option={dropDownData.map((e) => ({ ...e, i18nKey: "ADS_" + e.code?.replaceAll(".", "_") }))}
            select={handleADSSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      ) : null}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller"></CardLabel>
        <div className="field">
          <UploadFile
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            id={id}
            message={
              isUploading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <LoadingSpinner />
                  <span>Uploading...</span>
                </div>
              ) : uploadedFile ? (
                "1 File Uploaded"
              ) : (
                "No File Uploaded"
              )
            }
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept=".pdf, .jpeg, .jpg, .png" //  to accept document of all kind
            buttonType="button"
            error={!uploadedFile}
          />
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default ADSDocumentDetails;
