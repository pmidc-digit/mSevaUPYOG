import { CardLabel, DatePicker, LabelFieldPair, TextInput } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { constants } from "../constants/constants";

const createActivationDetails = () => ({
  connectionExecutionDate: "",
  meterId: "",
  meterInstallationDate: "",
  meterInitialReading: "",
  meterMake: "",
  averageMeterReading: "",
});

const WSActivationDetails = ({ t, config, userType, formData, onSelect }) => {
  const [activationDetails, setActivationDetails] = useState(formData?.ActivationDetails || createActivationDetails());

  useEffect(() => {
    // const data = activationDetails.map((e) => {
    //   return e;
    // });
    const data=activationDetails;
    onSelect(config?.key, data);
  }, [activationDetails]);


  const connectionTypeCode = formData?.ConnectionDetails?.[0]?.connectionType?.code?.toUpperCase();
  const isMeteredConnection = (connectionTypeCode === constants.WS_CONNECTION_TYPE_METERED_CODE.toUpperCase());

  useEffect(() => {
    if (!isMeteredConnection) {
      setActivationDetails({
        ...activationDetails,
        meterId: "",
        meterInstallationDate: "",
        meterInitialReading: "",
        meterMake: "",
        averageMeterReading: "",
      });
    }
  }, [isMeteredConnection]);
  
  return (
    <React.Fragment>
      <LabelFieldPair>
        <CardLabel className="card-label-smaller" style={{ fontWeight: "700" }}>{`${t(`WS_SERV_DETAIL_CONN_EXECUTION_DATE`)}`}</CardLabel>
        <div className="field">
          <DatePicker
            date={activationDetails.connectionExecutionDate}
            onChange={(date) => {
              setActivationDetails({ ...activationDetails, connectionExecutionDate: date });
            }}
          />
        </div>
      </LabelFieldPair>
      {isMeteredConnection && (
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller" style={{ fontWeight: "700" }}>{`${t(`WS_SERV_DETAIL_METER_ID`)}`}</CardLabel>
            <div className="field">
              <TextInput
                t={t}
                type="text"
                optionKey="i18nKey"
                name="meterId"
                value={activationDetails.meterId}
                onChange={(ev) => {
                  setActivationDetails({ ...activationDetails, meterId: ev.target.value });
                }}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller" style={{ fontWeight: "700" }}>{`${t(`WS_ADDN_DETAIL_METER_INSTALL_DATE`)}`}</CardLabel>
            <div className="field">
              <DatePicker
                date={activationDetails.meterInstallationDate}
                onChange={(date) => {
                  setActivationDetails({ ...activationDetails, meterInstallationDate: date });
                }}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller" style={{ fontWeight: "700" }}>{`${t(`WS_ADDN_DETAILS_INITIAL_METER_READING`)}`}</CardLabel>
            <div className="field">
              <TextInput
                value={activationDetails.meterInitialReading}
                onChange={(ev) => {
                  setActivationDetails({ ...activationDetails, meterInitialReading: ev.target.value });
                }}
              />
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller" style={{ fontWeight: "700" }}>{`${t(`WS_ADDN_DETAILS_INITIAL_METER_MAKE`)}*`}</CardLabel>
            <div className="field">
              <TextInput
                value={activationDetails.meterMake}
                onChange={(ev) => {
                  setActivationDetails({ ...activationDetails, meterMake: ev.target.value });
                }}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller" style={{ fontWeight: "700" }}>{`${t(`WS_ADDN_DETAILS_INITIAL_AVERAGE_MAKE`)}`}</CardLabel>
            <div className="field">
              <TextInput
                value={activationDetails.averageMeterReading}
                onChange={(ev) => {
                  setActivationDetails({ ...activationDetails, averageMeterReading: ev.target.value });
                }}
              />
            </div>
          </LabelFieldPair>
        </div>
      )}
    </React.Fragment>
  );
};

export default WSActivationDetails;
