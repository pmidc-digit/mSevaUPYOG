import React, { useState, useEffect } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Toast, Label, MobileNumber, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Loader } from "../../components/Loader";

const defaultValues = {
  applicationNumber: "",
};

const BillGenerate = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [loader, setLoader] = useState(false);
  const [getBills, setBills] = useState([]);
  const [showToast, setShowToast] = useState(null);

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    register,
  } = useForm({
    defaultValues,
  });

  const onSubmit = async (data) => {
    const hasAtLeastOneField = data?.applicationNumber?.trim();
    if (!hasAtLeastOneField) {
      setShowToast({ error: true, label: t("ES_COMMON_ENTER_AT_LEAST_ONE_CRITERIA") });
      return;
    }

    setLoader(true);
    const filters = {
      ...(data?.applicationNumber && { consumerCodes: data.applicationNumber }),
    };

    console.log("filters", filters);
    console.log("tenantId", tenantId);

    try {
      const response = await Digit.RentAndLeaseService.billGenerate({ tenantId, filters });
      setLoader(false);
      reset(defaultValues);
      setShowToast({ error: false, label: t("Bill Generated Successfully") });
    } catch (error) {
      setLoader(false);
      setShowToast({ error: true, label: t("Error while generating the bill!") });
    }
  };

  return (
    <React.Fragment>
      <div className="ral-bill-generate">
      <div className="ral-bill-generate__header">
        <Header>{t("Bill Generate")}</Header>
      </div>
      <Card className="ral-bill-generate__card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="search-complaint-container ral-bill-generate__form">
            <div className="complaint-input-container for-pt ral-bill-generate__fields">
              <div className="input-fields">
                <span className="complaint-input">
                  <Label>{t("APPLICATION_NUMBER")}</Label>
                  <TextInput name="applicationNumber" inputRef={register} />
                </span>
              </div>
            </div>
            <div className="ral-bill-generate__actions">
              <SubmitBar
                onSubmit={() => {
                  reset(defaultValues);
                }}
                label={t("CS_COMMON_RESET")}
                className="submit-bar ral-back-btn"
              />
              <SubmitBar label={t("ES_COMMON_SEARCH")} submit="submit" />
            </div>
          </div>
        </form>
      </Card>
      </div>

      {showToast && <Toast error={showToast.error} label={showToast.label} isDleteBtn={true} onClose={closeToast} />}

      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default BillGenerate;
