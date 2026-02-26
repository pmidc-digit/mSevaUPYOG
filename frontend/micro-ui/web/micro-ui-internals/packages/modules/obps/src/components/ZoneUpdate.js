import React, { useEffect, useMemo, useState } from "react";
import {
  LabelFieldPair,
  CardLabel,
  Dropdown,
  BreakLine,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  Loader,
  TextArea,
  CardLabelError
} from "@mseva/digit-ui-react-components";

const ZoneUpdate = ({ onSelect, onClose, defaultZoneCode }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [comments, setComments] = useState("");
  const [error, setError] = useState(null);
//console.log('defaultZoneCode', defaultZoneCode)
  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }

  const stateId = Digit.ULBService.getStateId();

  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [
    { name: "zoneMaster", filter: `$.[?(@.tanentId == '${tenantId}')]` },
  ]);

  //console.log('zoneList', zoneList);

  

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
  };

  
const zoneOptions = useMemo(
   () => zoneList?.tenant?.zoneMaster?.[0]?.zones || [],
  [zoneList]
 );
//console.log('zoneOptions', zoneOptions)
 useEffect(() => {
  if (!selectedZone && defaultZoneCode && zoneOptions?.length) {
    // Accept both object ({code, name}) and string ("Zone1")
    const defaultCode =
      typeof defaultZoneCode === "string" ? defaultZoneCode : defaultZoneCode?.code;

    if (!defaultCode) return;

    const match = zoneOptions.find(
      (z) => (z?.code || "").toString().toLowerCase() === defaultCode.toString().toLowerCase()
    );

    if (match) {
      setSelectedZone(match); // use the actual option object from dropdown options
    }
  }
}, [defaultZoneCode, zoneOptions]);

  const handleSubmit = () => {
    if(comments === ""){
      setError({error: true, message: "Comments are Mandatory"})
      return
    }
    if(!selectedZone){
      setError({error: true, message: "Zone is Mandatory"})
      return
    }
    if (selectedZone && onSelect) {
      onSelect(selectedZone);
    }
  };

  if (isZoneListLoading) return <Loader />;

  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">{"Update Zone"}</CardSectionHeader>
        <div>
          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {"Zone"}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              {!isZoneListLoading && (
                <Dropdown
                  className="form-field"
                  select={handleZoneSelect}
                  selected={selectedZone}
                  option={zoneOptions}
                  optionKey="code"
                />
              )}
            </div>
          </LabelFieldPair>
        </div>
        <div>
          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {"Comments"}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <TextArea
              value={comments}
              onChange={(e) =>
                setComments(e.target.value)
              }
              disabled={false}
              // className="custom-fee-table-textarea"
              placeholder="Enter Comments"
              />
            </div>
          </LabelFieldPair>
        </div>
        {error?.error && <CardLabelError>{error?.message}</CardLabelError>}
        <BreakLine />
      </div>
      <ActionBar>
        <SubmitBar label={"Save Zone"} onSubmit={handleSubmit} disabled={!selectedZone} />
      </ActionBar>
    </React.Fragment>
  );
};

export default ZoneUpdate;