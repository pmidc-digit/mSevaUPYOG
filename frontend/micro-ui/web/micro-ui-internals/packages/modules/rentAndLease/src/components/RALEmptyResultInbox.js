import React from "react";
import { Card } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const RALEmptyResultInbox = (props) => {
  const { t } = useTranslation();
  return (
    <Card className="ral-style-5c357d95f7">
      {t("CS_MYAPPLICATIONS_NO_APPLICATION").
      split("\\n").
      map((text, index) =>
      <p key={index} className="ral-style-dac4fe6c9b">
            {text}
          </p>
      )}
    </Card>);

};

export default RALEmptyResultInbox;
