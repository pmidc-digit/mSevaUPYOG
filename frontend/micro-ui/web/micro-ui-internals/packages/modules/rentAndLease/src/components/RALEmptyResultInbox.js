import React from "react";
import { Card } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const RALEmptyResultInbox = (props) => {
  const { t } = useTranslation();
  return (
    <Card style={{ marginTop: 20 }}>
      {t("CS_MYAPPLICATIONS_NO_APPLICATION")
        .split("\\n")
        .map((text, index) => (
          <p key={index} style={{ textAlign: "center" }}>
            {text}
          </p>
        ))}
    </Card>
  );
};

export default RALEmptyResultInbox;
