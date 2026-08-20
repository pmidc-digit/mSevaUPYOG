import React, { useState, useEffect } from 'react';
import { Modal, CardLabel, CardLabelDesc, CardSubHeader } from '@mseva/digit-ui-react-components';

// Close button component
const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

const ChbCommunityHallDetails = ({ hallId, setShowDetails }) => {
  const [selectedHall, setSelectedHall] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();

  const { data: communityHalls } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "CommunityHalls" }], {
    select: (data) => {
      const formattedData = data?.["CHB"]?.["CommunityHalls"];
      return formattedData;
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (hallId && communityHalls) {
      const hall = communityHalls.find(hall => hall.communityHallId === hallId);
      if (isMounted) {
        setSelectedHall(hall);
        setShowPopup(true);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [hallId, communityHalls]);

  const handleClosePopup = () => {
    setShowPopup(!showPopup);
    setShowDetails(false);
  };

  const renderList = (text) => {
    return text
      .split('\n')
      .filter(line => line.trim() !== '')
      .map((line, index) => <li key={index} className="chb-community-hall-details__list-item">{line.trim()}</li>);
  };

  return (
    <div>
      {showPopup && selectedHall && (
        <Modal
          headerBarMain={<CardSubHeader className="chb-community-hall-details__title">Community Hall Details</CardSubHeader>}
          headerBarEnd={<CloseBtn onClick={handleClosePopup} />}
          popupClassName="chb-community-hall-modal"
          headerBarClassName="chb-community-hall-modal__header"
          popupModuleMainClassName="chb-community-hall-modal__main"
          popupModuleActionBarClassName="chb-community-hall-modal__actions"
          children={
            <div className="chb-community-hall-details">
              <div className="chb-community-hall-details__grid">
                <div className="chb-community-hall-details__item">
                  <CardLabel className="chb-community-hall-details__label">Name</CardLabel>
                  <CardLabelDesc>{selectedHall.name}</CardLabelDesc>
                </div>
                <div className="chb-community-hall-details__item">
                  <CardLabel className="chb-community-hall-details__label">Geo Location</CardLabel>
                  <CardLabelDesc>{selectedHall.geoLocation}</CardLabelDesc>
                </div>
                <div className="chb-community-hall-details__item">
                  <CardLabel className="chb-community-hall-details__label">Address</CardLabel>
                  <CardLabelDesc>{selectedHall.address}</CardLabelDesc>
                </div>
                <div className="chb-community-hall-details__item">
                  <CardLabel className="chb-community-hall-details__label">Contact Details</CardLabel>
                  <CardLabelDesc>{selectedHall.contactDetails}</CardLabelDesc>
                </div>
                <div className="chb-community-hall-details__item">
                  <CardLabel className="chb-community-hall-details__label">Description</CardLabel>
                  <CardLabelDesc>{selectedHall.hallDescription}</CardLabelDesc>
                </div>
                <div className="chb-community-hall-details__item">
                  <CardLabel className="chb-community-hall-details__label">Type</CardLabel>
                  <CardLabelDesc>{selectedHall.type}</CardLabelDesc>
                </div>
              </div>
              <CardLabel className="chb-community-hall-details__label chb-community-hall-details__terms-label">Terms and Conditions</CardLabel>
              <CardLabelDesc>
                <ul>{renderList(selectedHall.termsAndCondition)}</ul>
              </CardLabelDesc>
              {/* <CardLabel style={{ fontSize: '20px', marginTop: '15px' }}>Disclaimer</CardLabel>
              <CardLabelDesc>{selectedHall.disclaimer}</CardLabelDesc>
              <CardLabel style={{ fontSize: '20px', marginTop: '15px' }}>Cancellation Policy</CardLabel>
              <CardLabelDesc>
                <ul>{renderList(selectedHall.cancellationPolicy)}</ul>
              </CardLabelDesc>
              <CardLabel style={{ fontSize: '20px', marginTop: '15px' }}>Remarks</CardLabel>
              <CardLabelDesc>{selectedHall.remarks}</CardLabelDesc> */}
            </div>
          }
          actionCancelLabel={null}  // Hide Cancel button
          actionCancelOnSubmit={null}  // No action for Cancel
          actionSaveLabel={null}  // Hide Save button
          actionSaveOnSubmit={null}  // No action for Save
          actionSingleLabel={null}  // Hide Submit button
          actionSingleSubmit={null}  // No action for Submit
          error={null}
          setError={() => {}}
          formId="modalForm"
          isDisabled={false}
          hideSubmit={true}  // Ensure submit is hidden
          isOBPSFlow={false}
          isOpen={showPopup}  // Pass isOpen prop
          onClose={handleClosePopup}  // Pass onClose prop
        />
      )}
    </div>
  );
};

export default ChbCommunityHallDetails;
