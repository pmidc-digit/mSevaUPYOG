// import React, { useState } from "react";
// import { Table } from "@mseva/digit-ui-react-components";

// const CartModal = ({ cartSlots, onClose, onRemoveSlot, t }) => {
//   // Track which ads are expanded
//   const [expanded, setExpanded] = useState(
//     () => cartSlots?.map((item) => item?.ad?.id) // default: all open
//   );

//   const toggleExpand = (adId) => {
//     setExpanded((prev) => (prev?.includes(adId) ? prev?.filter((id) => id !== adId) : [...prev, adId]));
//   };

//   const makeColumns = (ad) => [
//     { Header: t("ADS_DATE"), accessor: "bookingDate" },
//     { Header: t("ADS_LOCATION"), accessor: "location" },
//     { Header: t("ADS_FACE_AREA"), accessor: "faceArea" },
//     { Header: t("ADS_TYPE"), accessor: "addType" },
//     {
//       Header: t("ADS_NIGHT_LIGHT"),
//       accessor: (row) => (row?.nightLight ? t("ADS_YES") : t("ADS_NO")),
//     },
//     {
//       Header: t("ADS_STATUS"),
//       accessor: "slotStaus",
//       Cell: ({ row }) => {
//         const status = row?.original?.slotStaus;
//         const isAvailable = status === "AVAILABLE";
//         return (
//           <span
//             style={{
//               display: "inline-block",
//               padding: "5px 14px",
//               borderRadius: "20px",
//               fontSize: "12px",
//               fontWeight: 600,
//               color: isAvailable ? "#155724" : "#721c24",
//               backgroundColor: isAvailable ? "#d4edda" : "#f8d7da",
//               border: `1px solid ${isAvailable ? "#c3e6cb" : "#f5c6cb"}`,
//               textTransform: "capitalize",
//             }}
//           >
//             {status}
//           </span>
//         );
//       },
//     },
//     {
//       Header: t("ADS_REMOVE"),
//       accessor: "remove",
//       Cell: ({ row }) => {
//         const slot = row?.original;
//         return (
//           <button
//             onClick={() => onRemoveSlot(ad, slot)}
//             style={{
//               padding: "4px 10px",
//               borderRadius: "6px",
//               border: "none",
//               background: "#dc3545",
//               color: "#fff",
//               cursor: "pointer",
//               fontSize: "12px",
//             }}
//           >
//             {t("ADS_DELETE")}
//           </button>
//         );
//       },
//     },
//   ];

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: "70px",
//         left: 0,
//         width: "100vw",
//         height: "calc(100vh - 70px)",
//         background: "rgba(0,0,0,0.5)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         zIndex: 2000,
//       }}
//     >
//       <div
//         style={{
//           width: "90%",
//           maxWidth: "1100px",
//           height: "70vh",
//           background: "#fff",
//           borderRadius: "12px",
//           padding: "20px",
//           display: "flex",
//           flexDirection: "column",
//           boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "16px",
//             borderBottom: "1px solid #eee",
//             paddingBottom: "8px",
//           }}
//         >
//           <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#333" }}>{t("ADS_YOUR_CART")}</h2>
//           <button
//             onClick={onClose}
//             style={{
//               border: "none",
//               background: "transparent",
//               fontSize: "22px",
//               cursor: "pointer",
//               color: "#666",
//             }}
//           >
//             ✖
//           </button>
//         </div>

//         {/* Cart grouped by Ad */}
//         <div style={{ flex: 1, overflowY: "auto" }}>
//           {cartSlots?.length === 0 ? (
//             <p style={{ padding: "12px", color: "#666" }}>{t("ADS_NO_ITEMS_IN_CART")}</p>
//           ) : (
//             cartSlots.map((item, idx) => {
//               const isOpen = expanded?.includes(item.ad.id);
//               return (
//                 <div
//                   key={idx}
//                   style={{
//                     marginBottom: "16px",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     overflow: "hidden",
//                   }}
//                 >
//                   {/* Ad Header (clickable) */}
//                   <div
//                     onClick={() => toggleExpand(item?.ad?.id)}
//                     style={{
//                       background: "#f9f9f9",
//                       padding: "10px 14px",
//                       fontWeight: 600,
//                       fontSize: "14px",
//                       borderBottom: "1px solid #ddd",
//                       cursor: "pointer",
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     <span>
//                       {item?.ad?.name} — ₹{item?.ad?.amount * item?.slots?.length}
//                     </span>
//                     <span style={{ fontSize: "18px" }}>{isOpen ? "▾" : "▸"}</span>
//                   </div>

//                   {/* Slots Table (collapsible) */}
//                   {isOpen && (
//                     <div style={{ overflowX: "auto" }}>
//                       <Table
//                         t={t}
//                         data={item.slots}
//                         columns={makeColumns(item?.ad)}
//                         disableSort={true}
//                         isPaginationRequired={false}
//                         getCellProps={(cell) => ({
//                           style: {
//                             padding: "12px 14px",
//                             fontSize: "14px",
//                             borderBottom: "1px solid #f0f0f0",
//                             textAlign: "left",
//                             whiteSpace: "nowrap", // prevent wrapping
//                           },
//                         })}
//                       />
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartModal;


import React, { useState } from "react";
import { Table } from "@mseva/digit-ui-react-components";

const CartModal = ({ cartSlots, onClose, onRemoveSlot, t }) => {
  // Track which ads are expanded
  const [expanded, setExpanded] = useState(
    () => cartSlots?.map((item) => item?.ad?.id) // default: all open
  );

  const toggleExpand = (adId) => {
    setExpanded((prev) =>
      prev?.includes(adId) ? prev?.filter((id) => id !== adId) : [...prev, adId]
    );
  };

  // Columns no longer include "Remove"
  const makeColumns = (ad) => [
    { Header: t("ADS_DATE"), accessor: "bookingDate" },
    { Header: t("ADS_LOCATION"), accessor: "location" },
    { Header: t("ADS_FACE_AREA"), accessor: "faceArea" },
    { Header: t("ADS_TYPE"), accessor: "addType" },
    {
      Header: t("ADS_NIGHT_LIGHT"),
      accessor: (row) => (row?.nightLight ? t("ADS_YES") : t("ADS_NO")),
    },
    {
      Header: t("ADS_STATUS"),
      accessor: "slotStaus",
      Cell: ({ row }) => {
        const status = row?.original?.slotStaus;
        const isAvailable = status === "AVAILABLE";
        return (
          <span
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              color: isAvailable ? "#155724" : "#721c24",
              backgroundColor: isAvailable ? "#d4edda" : "#f8d7da",
              border: `1px solid ${isAvailable ? "#c3e6cb" : "#f5c6cb"}`,
              textTransform: "capitalize",
            }}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: "70px",
        left: 0,
        width: "100vw",
        height: "calc(100vh - 70px)",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1100px",
          height: "70vh",
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom: "1px solid #eee",
            paddingBottom: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#333" }}>
            {t("ADS_YOUR_CART")}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "22px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ✖
          </button>
        </div>

        {/* Cart grouped by Ad */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cartSlots?.length === 0 ? (
            <p style={{ padding: "12px", color: "#666" }}>{t("ADS_NO_ITEMS_IN_CART")}</p>
          ) : (
            cartSlots.map((item, idx) => {
              const isOpen = expanded?.includes(item.ad.id);
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: "16px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {/* Ad Header (clickable + remove button) */}
                  <div
                    style={{
                      background: "#f9f9f9",
                      padding: "10px 14px",
                      fontWeight: 600,
                      fontSize: "14px",
                      borderBottom: "1px solid #ddd",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      onClick={() => toggleExpand(item?.ad?.id)}
                      style={{ cursor: "pointer", flex: 1 }}
                    >
                      {item?.ad?.name} — ₹{item?.ad?.amount * item?.slots?.length}
                      <span style={{ fontSize: "18px", marginLeft: "8px" }}>
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveSlot(item.ad)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#dc3545",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "12px",
                        marginLeft: "10px",
                      }}
                    >
                      {t("ADS_REMOVE")}
                    </button>
                  </div>

                  {/* Slots Table (collapsible) */}
                  {isOpen && (
                    <div style={{ overflowX: "auto" }}>
                      <Table
                        t={t}
                        data={item.slots}
                        columns={makeColumns(item?.ad)}
                        disableSort={true}
                        isPaginationRequired={false}
                        getCellProps={(cell) => ({
                          style: {
                            padding: "12px 14px",
                            fontSize: "14px",
                            borderBottom: "1px solid #f0f0f0",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                          },
                        })}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;

