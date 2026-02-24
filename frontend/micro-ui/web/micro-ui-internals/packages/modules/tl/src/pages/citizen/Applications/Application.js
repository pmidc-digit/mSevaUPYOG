import { Card, Header, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Loader } from "../../../components/Loader";

const MyApplications = ({ view }) => {
  const { t } = useTranslation();

  const { mobileNumber, tenantId } = Digit.UserService.getUser()?.info || {};

  const { isLoading, isError, data, error, ...rest } =
    view === "bills"
      ? Digit.Hooks.tl.useFetchBill({
          params: { businessService: "TL", tenantId, mobileNumber },
          config: { enabled: view === "bills" },
        })
      : Digit.Hooks.tl.useTLSearchApplication(
          {},
          {
            enabled: view !== "bills",
          },
          t
        );

  return (
    <React.Fragment>
      <Header>{`${t("TL_MY_APPLICATIONS_HEADER")}`}</Header>
      {data?.map((application) => {
        return (
          <div>
            <Card>
              {/* {Object.keys(application)
                .filter((e) => e !== "raw" && application[e] !== null)
                .map((item) => (
                  <KeyNote keyValue={t(item)} note={t(application[item])} />
                ))} */}
              <KeyNote keyValue={t("PTR_UNIQUE_APPLICATION_NUMBER")} note={application?.raw?.applicationNumber} />
              <KeyNote keyValue={t("TL_COMMON_TABLE_COL_OWN_NAME")} note={application?.TL_COMMON_TABLE_COL_OWN_NAME || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(application?.raw?.status)} />

              <div className="action-button-myapplication"
              >
                <Link to={`/digit-ui/citizen/tl/tradelicence/application/${application?.raw?.applicationNumber}/${application.raw?.tenantId}`}>
                  <SubmitBar label={t("CS_VIEW_DETAILS")} />
                </Link>
                {application?.raw?.status === "PENDINGPAYMENT" && (
                  <Link
                    to={{
                      pathname: `/digit-ui/citizen/payment/collect/${data?.[0]?.raw?.businessService}/${application?.raw?.applicationNumber}`,
                      state: { application, tenantId: tenantId },
                    }}
                  >
                   
                      <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                  
                  </Link>
                )}
              </div>
              {/* http://localhost:3000/digit-ui/citizen/payment/collect/TL/PB-TL-2025-12-29-310016 */}
              {/* http://localhost:3000/digit-ui/citizen/payment/collect/TL/PB-TL-2025-12-29-310016 */}
            </Card>
          </div>
        );
      })}
      {isLoading && <Loader />}
    </React.Fragment>
  );
};
export default MyApplications;
