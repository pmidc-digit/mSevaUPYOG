import React from "react";
import {
  BreakLine,
  Card,
  CardSectionHeader,
  CardSubHeader,
  CheckPoint,
  ConnectingCheckPoints,
  Loader,
  Row,
  StatusTable,
  LinkButton,
} from "@mseva/digit-ui-react-components";

const DcbTable = ({
  demandData,
  totalDemandTax,
  totalDemandInterest,
  totalDemandPenality,
  totalCollectionTax,
  totalCollectionInterest,
  totalCollectionPenality,
  totalBalanceTax,
  totalBalancePenality,
  totalBalanceInterest,
}) => {
  const tableStyles = {
    table: {
      border: "2px solid black",
      width: "100%",
      fontFamily: "sans-serif",
    },
    td: {
      padding: "10px",
      border: "1px solid black",
      textAlign: "center",
    },
    th: {
      padding: "10px",
      border: "1px solid black",
      textAlign: "center",
    },
  };

  return (
    <div>
      <CardSectionHeader style={{ marginBottom: "16px", marginTop: "16px", fontSize: "24px" }}>DCB Details</CardSectionHeader>
      <table border="1px" style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.th}>Installments</th>
            <th colSpan="3" style={tableStyles.th}>
              Demand
            </th>
            <th colSpan="3" style={tableStyles.th}>
              Collection
            </th>
            <th colSpan="3" style={tableStyles.th}>
              Balance
            </th>
            <th style={tableStyles.th}>Advance</th>
          </tr>
          <tr>
            <th style={tableStyles.th}></th>
            <th style={tableStyles.th}>Tax</th>
            <th style={tableStyles.th}>Interest</th>
            <th style={tableStyles.th}>Penalty</th>
            <th style={tableStyles.th}>Tax</th>
            <th style={tableStyles.th}>Interest</th>
            <th style={tableStyles.th}>Penalty</th>
            <th style={tableStyles.th}>Tax</th>
            <th style={tableStyles.th}>Interest</th>
            <th style={tableStyles.th}>Penalty</th>
            <th style={tableStyles.th}>Advance</th>
          </tr>
        </thead>
        <tbody>
          {demandData?.map((item) => {
            return (
              <tr>
                <td style={tableStyles.td}>
                  {item.taxPeriodFrom}-{item.taxPeriodTo}
                </td>
                <td style={tableStyles.td}>{item.demandTax}</td>
                <td style={tableStyles.td}>{item.demandInterest}</td>
                <td style={tableStyles.td}>{item.demandPenality}</td>
                <td style={tableStyles.td}>{item.collectionTax}</td>
                <td style={tableStyles.td}>{item.collectionInterest}</td>
                <td style={tableStyles.td}>{item.collectionPenality}</td>
                <td style={tableStyles.td}>{item.balanceTax}</td>
                <td style={tableStyles.td}>{item.balanceInterest}</td>
                <td style={tableStyles.td}>{item.balancePenality}</td>
                <td style={tableStyles.td}>{item.advance}</td>
              </tr>
            );
          })}

          <tr>
            <th style={tableStyles.th}>Total</th>
            <td style={tableStyles.td}>{totalDemandTax}</td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}>{totalDemandPenality}</td>
            <td style={tableStyles.td}>{totalCollectionTax}</td>
            <td style={tableStyles.td}>{totalCollectionInterest}</td>
            <td style={tableStyles.td}>{totalCollectionPenality}</td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
          </tr>
          <tr>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <th style={tableStyles.th}>Total</th>
            <td style={tableStyles.td}>{totalBalanceTax}</td>
            <td style={tableStyles.td}>0</td>
            <td style={tableStyles.td}>0</td>
            <td style={tableStyles.td}>0</td>
          </tr>
          <tr>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <th style={tableStyles.th}>Total Balance</th>
            <td style={tableStyles.td}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DcbTable;
