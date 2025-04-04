import React, { useState, useEffect } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast, Dropdown } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const SearchReceipt = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const { data: EmployeeStatusData = [], isLoading: callMDMS } = Digit.Hooks.useCustomMDMS(
    tenantId,
    "BillingService",
    [{ name: "BusinessService", filter: "[?(@.type=='Adhoc')]" }],
    {
      select: (data) => {
        const formattedData = data?.["BillingService"]?.["BusinessService"];
        return formattedData;
      },
    }
  );

  console.log("EmployeeStatusData,", EmployeeStatusData);

  const methods = useForm({
    defaultValues: {
      categoryName: "",
    },
  });

  // console.log("props====", props);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    console.log("data is here==========", data);
    // const { isLoading, isError, error, data, ...rest } = Digit.Hooks.mcollect.useMCollectSearch({
    //   tenantId,
    //   filters: { challanNo: challanno },
    //   isMcollectAppChanged,
    // });
    data["businessServices"] = data?.businessServices?.code;
    try {
      const response = await Digit.MCollectService.recieptSearch(tenantId, data?.businessServices?.code, data);
      // let collectionres = await Digit.PaymentService.recieptSearch(BPA?.tenantId, appBusinessService[i], { consumerCodes: BPA?.applicationNo, isEmployee: true });
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const closeToast = () => {
    setShowToast(null);
  };
  return (
    <React.Fragment>
      <style>
        {`
          .formWrapperNDC {
            // padding: 20px;
            // background: #fff;
            // border-radius: 10px;
            max-width: 1200px;
            // margin: auto;
            // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .ndcFormCard {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .surveydetailsform-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
          }
          .surveydetailsform-wrapper p {
            color: red;
            font-size: 14px;
          }

         .citizen-card-input{
            margin-bottom: 0 !important;
         }

          @media (max-width: 1024px) {
            .ndcFormCard {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .ndcFormCard {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
        <Header>Search Receipts</Header>
      </div>

      <div className="pageCard">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="ndcFormCard">
              <div className="surveydetailsform-wrapper">
                <label>Receipt No</label>
                <TextInput
                  name="receiptNumbers"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 200,
                    },
                  })}
                />
                {errors.receiptNo && <p style={{ color: "red" }}>{errors.receiptNo.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>
                  Service Type <span style={{ color: "red" }}>*</span>
                </label>
                <Controller
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  name="businessServices"
                  render={(props) => (
                    <Dropdown
                      option={EmployeeStatusData}
                      select={(e) => {
                        props.onChange(e);
                      }}
                      optionKey="code"
                      onBlur={props.onBlur}
                      t={t}
                      selected={props.value}
                    />
                  )}
                />

                {/* <TextInput
                  name="serviceCategory"
                  type="text"
                  inputRef={register({
                    required: "This field is required",
                    maxLength: {
                      value: 500,
                    },
                  })}
                /> */}
                {errors.serviceCategory && <p style={{ color: "red" }}>{errors.serviceCategory.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Consumer code</label>
                <TextInput
                  name="consumerCodes"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 500,
                    },
                  })}
                />
                {errors.consumerCode && <p style={{ color: "red" }}>{errors.consumerCode.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Mobile No</label>
                <div className="field-container">
                  <span className="citizen-card-input citizen-card-input--front" style={{ flex: "none" }}>
                    +91
                  </span>
                  <TextInput
                    name="mobileNumber"
                    type="text"
                    inputRef={register({
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers are allowed",
                      },
                      minLength: {
                        value: 10,
                        message: "Mobile number must be at least 10 digits",
                      },
                      maxLength: {
                        value: 15,
                        message: "Mobile number cannot exceed 15 digits",
                      },
                    })}
                  />
                  {errors.mobileNo && <p style={{ color: "red" }}>{errors.mobileNo.message}</p>}
                </div>
              </div>
            </div>
            <SubmitBar label="Next" submit="submit" />
          </form>
        </FormProvider>
        {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
        {isLoading && <Loader />}
      </div>
    </React.Fragment>
  );
};

export default SearchReceipt;
