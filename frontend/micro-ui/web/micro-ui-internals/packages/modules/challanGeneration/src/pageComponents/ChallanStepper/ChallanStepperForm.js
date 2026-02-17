import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Dropdown,
  LabelFieldPair,
  CardHeader,
  Toast,
  TextInput,
  CardLabel,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import { Loader } from "../../components/Loader";
import { SET_ChallanApplication_STEP } from "../../../redux/action/ChallanApplicationActions";
import SelectNDCDocuments from "../ChallanDocuments";

const ChallanStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);
  const [documentsData, setDocumentsData] = useState({});
  const isCitizen = window.location.href.includes("citizen");

  const handleDocumentsSelect = (key, data) => {
    setDocumentsData(data);
  };

  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const { data: categoryData, isLoading: categoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "Category" }]);
  const { data: subCategoryData, isLoading: subCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "SubCategory" }]);
  const { data: OffenceTypeData, isLoading: OffenceTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "OffenceType" }]);
  const { data: OffenceRates, isLoading: OffenceRatesLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "Rates" }]);
  const { data: docData, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "Documents" }]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: {
      shouldUnregister: false,
    },
  });

  const onSubmit = async (data) => {
    let missingDocs = [];

    docData?.Challan?.Documents?.forEach((doc) => {
      if (doc.required) {
        const hasFile = documentsData?.documents?.some((d) => d.documentType.includes(doc.code) && d.filestoreId);
        if (!hasFile) missingDocs.push(t(doc.code));
      }
    });
    if (missingDocs.length > 0) {
      setError(t("CHALLAN_MESSAGE_CHALLAN_" + missingDocs[0].replace(/\s+/g, "_").toUpperCase()));
      return;
    }
    setLoader(true);
    const Challan = {
      tenantId: tenantId,
      citizen: {
        name: data?.name,
        mobileNumber: data?.mobileNumber,
        tenantId: tenantId,
        active: true,
      },
      address: {
        addressLine1: data?.address,
      },
      businessService: "Challan_Generation",
      offenceTypeName: data?.offenceType?.name,
      offenceCategoryName: data?.offenceCategory?.name,
      offenceSubCategoryName: data?.offenceSubCategory?.name,
      challanAmount: data?.challanAmount,
      // amount: data?.amount,
      amount: [
        {
          // "taxHeadCode": "CH.CHALLAN_FINE",
          amount: data?.amount,
        },
      ],
      additionalDetail: {
        latitude: documentsData?.documents?.[1]?.latitude,
        longitude: documentsData?.documents?.[1]?.longitude,
      },
      // address: {},
      documents: documentsData?.documents,
      workflow: {
        action: "SUBMIT",
      },
    };
    try {
      const response = await Digit.ChallanGenerationService.create({ Challan: Challan });
      setLoader(false);
      const id = response?.challans?.[0]?.challanNo;
      history.push("/digit-ui/employee/challangeneration/response/" + `${id}`);
      // return;
      // if (isCitizen) history.push("/digit-ui/citizen/challangeneration/response/" + "123123");
      // else history.push("/digit-ui/employee/challangeneration/response/" + "123123");
    } catch (error) {
      setLoader(false);
    }
  };

  const handleMobileChange = async (value) => {
    setLoader(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      if (userData?.user?.[0]?.name) {
        setValue("name", userData.user[0].name); // ✅ populate name
        setValue("address", userData.user[0].permanentAddress); // ✅ populate name
        clearErrors("name"); // ✅ remove validation error if any
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  const handleRates = (val) => {
    const filterRates = OffenceRates?.Challan?.Rates?.filter((item) => item?.offenceTypeId == val?.id);
    setValue("amount", filterRates?.[0]?.amount);
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // full viewport height
        background: "#f9f9f9", // optional light background
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px", // limits form width
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
          {t("CREATE_CHALLAN")}
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardLabel style={{ fontWeight: "bold", paddingBottom: "30px", fontSize: "25px" }}>{t("CHALLAN_OFFENDER_DETAILS")}</CardLabel>
          <div style={{ width: "100%" }}>
            <div>
              <CardLabel>
                {`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Controller
                control={control}
                name="mobileNumber"
                rules={{
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit mobile number",
                  },
                }}
                render={(props) => (
                  <MobileNumber
                    value={props.value}
                    maxlength={10}
                    onChange={(e) => {
                      props.onChange(e);
                      setValue("name", "");
                      setValue("address", "");
                      // ✅ updates react-hook-form
                      if (e.length == 10) {
                        handleMobileChange(e); // 🔥 only then fire API
                      }
                    }}
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
              {errors?.mobileNumber && <p style={{ color: "red" }}>{errors.mobileNumber.message}</p>}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <CardLabel>
                {`${t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")}`} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                }}
                render={(props) => (
                  <TextInput
                    style={{ marginBottom: 0 }}
                    value={props.value}
                    error={errors?.name?.message}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
              {errors?.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
            </div>

            {/* address field yes */}
            <div style={{ marginBottom: "20px" }}>
              <CardLabel>
                {`${t("PT_COMMON_COL_ADDRESS")}`} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Controller
                control={control}
                name="address"
                rules={{
                  required: "Address is required",
                  minLength: { value: 5, message: "Address must be at least 5 characters" },
                }}
                render={(props) => (
                  <TextArea
                    style={{ marginBottom: 0 }}
                    name="address"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
              {errors?.address && <p style={{ color: "red" }}>{errors.address.message}</p>}
            </div>

            {/* Offence Category */}
            <LabelFieldPair style={{ marginTop: "20px" }}>
              <CardLabel>
                {t("CHALLAN_OFFENCE_CATEGORY")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Controller
                control={control}
                name={"offenceCategory"}
                defaultValue={null}
                rules={{ required: t("CHALLAN_OFFENCE_CATEGORY_REQUIRED") }}
                render={(props) => (
                  <Dropdown
                    style={{ marginBottom: 0, width: "100%" }}
                    className="form-field"
                    select={props.onChange}
                    selected={props.value}
                    option={categoryData?.Challan?.Category}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors.offenceCategory && <p style={{ color: "red" }}>{errors.offenceCategory.message}</p>}
            </LabelFieldPair>

            {/* Offence Subcategory */}
            <LabelFieldPair style={{ marginTop: "20px" }}>
              <CardLabel>
                {t("CHALLAN_OFFENCE_SUB_CATEGORY")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Controller
                control={control}
                name={"offenceSubCategory"}
                defaultValue={null}
                rules={{ required: t("CHALLAN_OFFENCE_SUB_CATEGORY_REQUIRED") }}
                render={(props) => (
                  <Dropdown
                    style={{ marginBottom: 0, width: "100%" }}
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={subCategoryData?.Challan?.SubCategory}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors.offenceSubCategory && <p style={{ color: "red" }}>{errors.offenceSubCategory.message}</p>}
            </LabelFieldPair>

            {/* offence type */}
            <LabelFieldPair style={{ marginTop: "20px" }}>
              <CardLabel>
                {t("CHALLAN_TYPE_OFFENCE")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Controller
                control={control}
                name={"offenceType"}
                defaultValue={null}
                rules={{ required: t("CHALLAN_TYPE_OFFENCE_REQUIRED") }}
                render={(props) => (
                  <Dropdown
                    style={{ marginBottom: 0, width: "100%" }}
                    className="form-field"
                    // select={props.onChange}
                    select={(e) => {
                      props.onChange(e);
                      handleRates(e);
                    }}
                    selected={props.value}
                    option={OffenceTypeData?.Challan?.OffenceType}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors.offenceType && <p style={{ color: "red" }}>{errors.offenceType.message}</p>}
            </LabelFieldPair>

            {/* Challan Amount Default */}
            <LabelFieldPair style={{ marginTop: "20px" }}>
              <CardLabel>{`${t("DEFAULT_CHALLAN_AMOUNT")}`}</CardLabel>
              <Controller
                control={control}
                name="amount"
                render={(props) => (
                  <TextInput
                    type="number"
                    style={{ marginBottom: 0, width: "100%" }}
                    value={props.value}
                    error={errors?.name?.message}
                    disable={true}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>

            {/* Challan Amount */}
            {/* <LabelFieldPair style={{ marginTop: "20px" }}>
              <CardLabel>{`${t("CHALLAN_AMOUNT")}`}</CardLabel>
              <Controller
                control={control}
                name="challanAmount"
                render={(props) => (
                  <input
                    className="employee-card-input focus-visible"
                    type="number"
                    style={{ marginBottom: 0, width: "100%" }}
                    value={props.value}
                    error={errors?.name?.message}
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    // onWheel={(e) => e.preventDefault()}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair> */}
          </div>

          <CardLabel style={{ fontWeight: "bold", paddingTop: "30px", fontSize: "25px" }}>
            {t("CHALLAN_DOCUMENTS")} <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <div style={{ marginTop: "20px" }}>
            <SelectNDCDocuments
              t={t}
              config={{ key: "documents" }}
              onSelect={handleDocumentsSelect}
              userType="CITIZEN"
              formData={{ documents: documentsData }}
              setError={setError}
              error={error}
              clearErrors={() => {}}
              formState={{}}
              data={docData}
              isLoading={isLoading}
            />
          </div>

          <ActionBar>
            <SubmitBar label="Submit" submit="submit" />
          </ActionBar>
        </form>
      </div>
      {/* <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} /> */}
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={"true"}
        />
      )}
      {(OffenceRatesLoading || loader || categoryLoading || subCategoryLoading || OffenceTypeLoading) && <Loader page={true} />}
    </div>
  );
};

export default ChallanStepperForm;
