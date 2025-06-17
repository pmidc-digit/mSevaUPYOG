import React, { useState, useEffect } from "react";
import { ActionBar, SubmitBar, Toast, UploadFile } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../../utils/Loader";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";

const PropertyDetailsFormUser = ({ onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const formStateValues = useSelector((state) => state.ndc.NDCForm);

  const methods = useForm({
    defaultValues: {
      propertyType: "",
      propertyUsageType: "",
      propertyLocationType: "",
      numberOfFloors: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // State for each file
  const [files, setFiles] = useState({
    registry: null,
    sanctionedPlan: null,
    waterReceipt: null,
    propertyReceipt: null,
    identityProof: null,
    addressProof: null,
    authorityLetter: null,
  });

  const [fileStoreIds, setFileStoreIds] = useState({
    registry: null,
    sanctionedPlan: null,
    waterReceipt: null,
    propertyReceipt: null,
    identityProof: null,
    addressProof: null,
    authorityLetter: null,
  });

  const closeToast = () => setShowToast(null);

  const uploadFile = async (key, fileObj) => {
    if (fileObj.size >= 5242880) {
      setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
      return;
    }
    setIsLoading(true);
    try {
      const res = await Digit.UploadServices.Filestorage("property-upload", fileObj, cityDetails.code);
      const storeId = res?.data?.files?.[0]?.fileStoreId;
      setIsLoading(false);
      if (storeId) {
        setFileStoreIds((prev) => ({ ...prev, [key]: storeId }));
        setError(null);
      } else {
        setError(t("CS_FILE_UPLOAD_ERROR"));
      }
    } catch (err) {
      setIsLoading(false);
      setError(t("CS_FILE_UPLOAD_ERROR"));
    }
  };

  const handleFileChange = (e, key) => {
    const selectedFile = e.target.files[0];
    setFiles((prev) => ({ ...prev, [key]: selectedFile }));
    uploadFile(key, selectedFile);
  };

  const handleDelete = (key) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setFileStoreIds((prev) => ({ ...prev, [key]: null }));
  };

  const renderUploadField = (label, key) => (
    <div className="surveydetailsform-wrapper">
      <label>
        {label} <span style={{ color: "red" }}>*</span>
      </label>
      <UploadFile
        id={`upload-${key}`}
        accept=".jpg"
        onUpload={(e) => handleFileChange(e, key)}
        onDelete={() => handleDelete(key)}
        message={fileStoreIds[key] ? `1 ${t("CS_ACTION_FILEUPLOADED")}` : t("CS_ACTION_NO_FILEUPLOADED")}
      />
    </div>
  );

  const onSubmit = async (data) => {
    console.log("Form Submitted:", data);
    const fullData = {
      ...data,
      documents: fileStoreIds,
    };
    console.log("fullData", fullData);
    dispatch(updateNDCForm("PropertyDetailsStep2", fullData));
    onGoNext();
  };

  useEffect(() => {
    console.log("here", formStateValues?.formData?.PropertyDetailsStep2);
    // if (formStateValues?.formData?.PropertyDetailsStep2) {
    //   console.log("here", formStateValues);
    //   const data = formStateValues?.formData?.PropertyDetailsStep2;
    //   Object?.entries(data)?.forEach(([key, value]) => {
    //     setValue(key, value);
    //   });
    // }
  }, [formStateValues]);

  return (
    <div className="pageCard">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>Upload Files</div>

          {renderUploadField("Copy of Property Registry", "registry")}
          {renderUploadField("Copy of Sanctioned building plan / site plan / sanction letter / any other relevant document", "sanctionedPlan")}
          {renderUploadField("Last water tax receipt", "waterReceipt")}
          {renderUploadField("Last property tax receipt", "propertyReceipt")}
          {renderUploadField("Identity Proof", "identityProof")}
          {renderUploadField("Address Proof", "addressProof")}
          {renderUploadField(
            "Authority letter / Power of Attorney - application in case of joint ownership or if applicant is not the owner",
            "authorityLetter"
          )}

          <ActionBar>
            <SubmitBar label="Back" onSubmit={() => onBackClick()} />
            <SubmitBar style={{ marginLeft: "20px" }} label="Next" submit="submit" />
          </ActionBar>
        </form>
        {isLoading && <Loader />}
      </FormProvider>

      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}

      {error && <Toast error={true} label={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default PropertyDetailsFormUser;
