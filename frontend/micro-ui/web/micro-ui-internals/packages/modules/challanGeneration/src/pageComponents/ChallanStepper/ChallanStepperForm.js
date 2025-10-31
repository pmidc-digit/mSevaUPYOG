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
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_ChallanApplication_STEP, RESET_ChallanAPPLICATION_FORM } from "../../../redux/action/ChallanApplicationActions";
import SelectNDCDocuments from "../ChallanDocuments";

//Config for steps
const createEmployeeConfig = [
  {
    head: "OWNER DETAILS",
    stepLabel: "CHALLAN_OFFENDER_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "ChallanStepFormOne",
    key: "offenderDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "Venue Details",
    stepLabel: "CHALLAN_OFFENCE_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "ChallanStepFormTwo",
    key: "offenceDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "ChallanStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "ChallanStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },

  // NewPTRStepFormTwo
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: citizenConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

// console.log("updatedCreateEmployeeconfig: ", updatedCreateEmployeeconfig);

const ChallanStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.challan.ChallanApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const [loader, setLoader] = useState(false);
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

  console.log("OffenceRates", OffenceRates);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      shouldUnregister: false,
    },
  });

  // console.log("formStatePTR: ", formState);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_ChallanApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_ChallanAPPLICATION_FORM());
  }, []);

  // const handleSubmit = (dataGet) => {
  //   //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
  //   // let data = {};
  //   // createEmployeeConfig.forEach((config) => {
  //   //   if (config.isStepEnabled) {
  //   //     data = { ...data, ...formData[config.key] };
  //   //   }
  //   // });
  //   // onSubmit(data, tenantId, setShowToast, history);
  // };

  const onSubmit = async (data) => {
    setLoader(true);
    console.log("dat==??a", data);
    console.log("documentsData", documentsData?.documents);

    const Challan = {
      tenantId: tenantId,
      citizen: {
        name: data?.name,
        mobileNumber: data?.mobileNumber,
        tenantId: tenantId,
        active: true,
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
      address: {},
      documents: documentsData?.documents,
      workflow: {
        action: "SUBMIT",
      },
    };
    try {
      const response = await Digit.ChallanGenerationService.create({ Challan: Challan });
      console.log("response", response);
      setLoader(false);
      const id = response?.challans?.[0]?.challanNo;
      history.push("/digit-ui/employee/challangeneration/response/" + `${id}`);
      // return;
      // if (isCitizen) history.push("/digit-ui/citizen/challangeneration/response/" + "123123");
      // else history.push("/digit-ui/employee/challangeneration/response/" + "123123");
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleMobileChange = async (value) => {
    setLoader(true);
    console.log("User stopped typing. Final mobile number:", value);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      console.log("userData", userData?.user[0]);
      setValue("name", userData?.user[0]?.name);
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  const debouncedHandleMobileChange = React.useMemo(
    () => debounce(handleMobileChange, 500), // 500ms delay after user stops typing
    []
  );

  const handleRates = (val) => {
    console.log("val", val);
    console.log("OffenceRates", OffenceRates?.Challan?.Rates);
    const filterRates = OffenceRates?.Challan?.Rates?.filter((item) => item?.subCategoryId == val?.id);
    console.log("filterRates", filterRates);
    setValue("amount", filterRates?.[0]?.amount);
  };

  return (
    <div
      className="pageCard"
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
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: "20px" }}>
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
                    style={{ marginBottom: 0 }}
                    value={props.value}
                    maxlength={10}
                    onChange={(e) => {
                      props.onChange(e); // ✅ updates react-hook-form
                      debouncedHandleMobileChange(e);
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

            {/* offence type */}
            <LabelFieldPair>
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
                    select={props.onChange}
                    selected={props.value}
                    option={OffenceTypeData?.Challan?.OffenceType}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors.offenceType && <p style={{ color: "red" }}>{errors.offenceType.message}</p>}
            </LabelFieldPair>

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
                      handleRates(e);
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
            <LabelFieldPair style={{ marginTop: "20px" }}>
              <CardLabel>{`${t("CHALLAN_AMOUNT")}`}</CardLabel>
              <Controller
                control={control}
                name="challanAmount"
                render={(props) => (
                  <TextInput
                    type="number"
                    style={{ marginBottom: 0, width: "100%" }}
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
            </LabelFieldPair>
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
              setError={() => {}}
              clearErrors={() => {}}
              formState={{}}
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
