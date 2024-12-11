import { newConfig } from "../../../components/config/config";
import { FormComposer } from "@upyog/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";

const Create = () => {
  const { t } = useTranslation();
  const configs = newConfig ? newConfig : newConfig;

  return (
    <FormComposer
      heading={t("Create Birth Registration")}
      label={t("ES_COMMON_APPLICATION_SUBMIT")}
      config={configs.map((config) => {
        return {
          ...config,
          body: config.body.filter((a) => !a.hideInEmployee),
        };
      })}
      fieldStyle={{ marginRight: 0 }}
    />
  );
};

export default Create;
