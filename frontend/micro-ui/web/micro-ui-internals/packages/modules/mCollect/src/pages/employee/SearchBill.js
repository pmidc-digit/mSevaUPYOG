import React from "react";
import { Card, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const SearchBill = () => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
        <Header>Search Bill</Header>
      </div>

      <div>
        <Card>
          <div style={{ fontSize: "24px", padding: "10px 0px", fontWeight: "700" }}>{t("UC_SERVICE_DETAILS_LABEL")}</div>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default SearchBill;
