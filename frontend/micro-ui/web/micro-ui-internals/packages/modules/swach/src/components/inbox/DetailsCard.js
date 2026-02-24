import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const Details = ({ label, name, onClick }) => {
  return (
    <div className="digit-table-mobile-card-row" onClick={onClick}>
      <span className="digit-table-mobile-card-label">{label}</span>
      <span className="digit-table-mobile-card-value" style={{overflowWrap:"break-word"}}>{name}</span>
    </div>
  );
};

const DetailsCard = ({ data, serviceRequestIdKey, linkPrefix, handleSelect, selectedItems, keyForSelected, handleDetailCardClick, isTwoDynamicPrefix=false,getRedirectionLink ,handleClickEnabled =true, tenantIdsList=[]}) => {
  if (linkPrefix && serviceRequestIdKey) {
    return (
      <div className="digit-table-mobile-wrapper">
        {data.map((object, itemIndex) => {
            console.log("ObjectInsideDetailsCard", object);
          return (
            <Link
              key={itemIndex}
              to={isTwoDynamicPrefix 
                ?
                  `${linkPrefix}${typeof serviceRequestIdKey === "function"
                    ?
                    serviceRequestIdKey(object)
                      :
                    `${getRedirectionLink(object["Application Type"]==="BPA_STAKEHOLDER_REGISTRATION"?"BPAREG":"BPA")}/${object[object["Application Type"]==="BPA_STAKEHOLDER_REGISTRATION"?"applicationNo":"Application Number"]}`}`
                :
                  `${linkPrefix}${typeof serviceRequestIdKey === "function"
                    ?
                    serviceRequestIdKey(object)
                      :
                    object[serviceRequestIdKey]}`+`/${tenantIdsList[itemIndex]}`
                }
            >
              <div className="digit-table-mobile-card">
                {Object.keys(object).map((name, index) => {
                  if (name === "applicationNo" || name === "Vehicle Log") return null;
                  return <Details label={name} name={object[name]} key={index} />;
                })}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="digit-table-mobile-wrapper">
      {data.map((object, itemIndex) => {
        return (
          <div
            key={itemIndex}
            style={{ border: selectedItems?.includes(object[keyForSelected]) ? "2px solid #a82227" : "2px solid #fff" }}
            className="digit-table-mobile-card"
            onClick={() =>handleClickEnabled && handleSelect(object)}
          >
            {Object.keys(object).filter(rowEle => !(typeof object[rowEle] == "object" && object[rowEle]?.hidden == true)).map((name, index) => {
              return <Details label={name} name={object[name]} key={index} onClick={() =>handleClickEnabled && handleDetailCardClick(object)} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

DetailsCard.propTypes = {
  data: PropTypes.array,
};

DetailsCard.defaultProps = {
  data: [],
};

export default DetailsCard;