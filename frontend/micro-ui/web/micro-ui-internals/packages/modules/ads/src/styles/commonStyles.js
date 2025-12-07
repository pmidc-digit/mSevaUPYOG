// Common styles used across ADS module components
// These styles are extracted to avoid repetition and improve maintainability

// Button Styles
export const primaryButton = {
  padding: "8px",
  background: "#2947a3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

export const secondaryButton = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

export const successButton = {
  padding: "8px",
  borderRadius: "6px",
  background: "#28a745",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
};

export const disabledButton = {
  padding: "8px",
  borderRadius: "6px",
  border: "none",
  background: "#ccc",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "not-allowed",
};

export const lightButton = {
  padding: "10px 18px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#f5f5f5",
  cursor: "pointer",
};

// Input Styles
export const dateInput = {
  width: "100%",
  padding: "5px",
  fontSize: 13,
  borderRadius: 6,
  border: "1px solid #ccc",
};

export const checkboxInput = {
  width: "18px",
  height: "18px",
  accentColor: "#0b74de",
  cursor: "pointer",
};

export const disabledCheckbox = {
  width: "18px",
  height: "18px",
  accentColor: "#0b74de",
  cursor: "not-allowed",
};

// Card Styles
export const card = {
  width: 280,
  borderRadius: 8,
  padding: 9,
  background: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

export const cardLabel = {
  fontSize: 12,
  color: "#666",
  marginBottom: 4,
};

export const cardLabelTop = {
  fontSize: 12,
  color: "#666",
  marginTop: 6,
};

// Badge/Status Styles
export const statusBadgeAvailable = {
  display: "inline-block",
  padding: "5px 14px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#155724",
  backgroundColor: "#d4edda",
  border: "1px solid #c3e6cb",
  textTransform: "capitalize",
};

export const statusBadgeBooked = {
  display: "inline-block",
  padding: "5px 14px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#721c24",
  backgroundColor: "#f8d7da",
  border: "1px solid #f5c6cb",
  textTransform: "capitalize",
};

export const statusBadgeInCart = {
  display: "inline-block",
  padding: "5px 14px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#004085",
  backgroundColor: "#cce5ff",
  border: "1px solid #b8daff",
  textTransform: "uppercase",
};

// Modal Styles
export const modalOverlay = {
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
};

export const modalContent = {
  width: "90%",
  maxWidth: "1100px",
  height: "70vh",
  background: "#fff",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

export const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  borderBottom: "1px solid #eee",
  paddingBottom: "8px",
};

export const modalTitle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 700,
  color: "#333",
};

export const modalCloseButton = {
  border: "none",
  background: "transparent",
  fontSize: "22px",
  cursor: "pointer",
  color: "#666",
};

export const modalFooter = {
  marginTop: "12px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

// Layout Styles
export const flexRow = {
  display: "flex",
  gap: 8,
  marginTop: 6,
};

export const flexColumn = {
  flex: 1,
};

export const flexRowSpaceBetween = {
  display: "flex",
  justifyContent: "space-between",
};

export const flexRowEnd = {
  display: "flex",
  justifyContent: "end",
};

// Alert/Warning Styles
export const warningBanner = {
  background: "#fff3cd",
  border: "1px solid #ffeeba",
  color: "#856404",
  padding: "6px 10px",
  borderRadius: "6px",
  fontSize: "14px",
  marginBottom: "8px",
  width: "100%",
  maxWidth: "545px",
};

// Card Specific Styles
export const cardImageContainer = {
  width: "100%",
  height: 120,
  borderRadius: 8,
  overflow: "hidden",
  background: "#f5f5f5",
};

export const cardImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export const cardImagePlaceholder = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#aaa",
};

export const cardInfoSection = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "#444",
};

export const cardInfoRow = {
  display: "flex",
  justifyContent: "space-between",
};

export const cardInfoRowBold = {
  display: "flex",
  justifyContent: "space-between",
  fontWeight: 600,
};

export const textDark = {
  color: "#222",
};

export const textSuccess = {
  color: "green",
  fontWeight: 600,
};

// Additional inline style helpers
export const spanMarginRight = (pixels) => ({
  marginRight: pixels,
});

export const spanColor = (color) => ({
  color,
});

// Utility styles
export const fullWidth = {
  width: "100%",
};

export const mandatoryIndicator = {
  color: "red",
};

export const errorStyle = {
  marginTop: "-18px",
  color: "red",
};

// Modal Table Styles
export const modalTableContainer = {
  flex: 1,
  overflowY: "auto",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

export const modalLoadingMessage = {
  fontSize: "24px",
  color: "#555",
  textAlign: "center",
};

export const tableCellStyle = (isEven) => ({
  padding: "12px 14px",
  fontSize: "14px",
  borderBottom: "1px solid #f0f0f0",
  textAlign: "left",
  backgroundColor: isEven ? "#fafafa" : "#fff",
});

// Inline style helpers for header text
export const headerTextWarning = {
  color: "#c62828",
  fontSize: "14px",
  marginLeft: "8px",
};

export const headerTextInfo = {
  color: "#0056b3",
  fontSize: "14px",
  marginLeft: "8px",
};

// Grid and Pagination Styles
export const cardsGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

export const showMoreContainer = {
  textAlign: "center",
  marginTop: "1rem",
};

export const showMoreButton = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

// Specific inline patterns
export const blackText = {
  color: "black",
};

export const cartListContainer = {
  flex: 1,
  overflowY: "auto",
};

export const cartAdTitle = {
  cursor: "pointer",
  flex: 1,
};

export const expandIcon = {
  fontSize: "18px",
  marginLeft: "8px",
};

// Cart Modal Styles
export const cartItemContainer = {
  marginBottom: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  overflow: "hidden",
};

export const cartAdHeader = {
  background: "#f9f9f9",
  padding: "10px 14px",
  fontWeight: 600,
  fontSize: "14px",
  borderBottom: "1px solid #ddd",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const removeButton = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#dc3545",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  marginLeft: "10px",
};

export const noItemsMessage = {
  padding: "12px",
  color: "#666",
};

export const tableContainer = {
  overflowX: "auto",
};

export const tableCellNowrap = {
  padding: "12px 14px",
  fontSize: "14px",
  borderBottom: "1px solid #f0f0f0",
  textAlign: "left",
  whiteSpace: "nowrap",
};

// Summary Component Styles
export const sectionStyle = {
  backgroundColor: "#ffffff",
  padding: "1rem 0",
  borderRadius: "8px",
  marginBottom: "1.5rem",
  boxShadow: "0 2px 6px rgba(18,38,63,0.04)",
};

export const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
  padding: "0 1.5rem",
};

export const headerRowNoPadding = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

export const headingStyle = {
  fontSize: "1.25rem",
  color: "#0d43a7",
  fontWeight: "600",
  margin: 0,
};

export const editLabelStyle = {
  cursor: "pointer",
  color: "#2e86de",
  fontWeight: 600,
  fontSize: "0.9rem",
};

export const labelFieldPairStyle = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "1px dashed #e9eef2",
  padding: "0.6rem 1.5rem",
  alignItems: "center",
};

export const documentsContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  marginTop: "0.5rem",
};

export const documentCardStyle = {
  flex: "1 1 220px",
  minWidth: "180px",
  maxWidth: "260px",
  backgroundColor: "#fbfcfe",
  padding: "0.6rem",
  border: "1px solid #eef3f7",
  borderRadius: "6px",
};

export const boldLabelStyle = {
  fontWeight: "500",
  color: "#333",
};

export const rowValueStyle = {
  textAlign: "right",
  minWidth: "120px",
};

export const rowLabelContainer = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
};

export const noDocumentsMsg = {
  padding: "0 1.5rem",
};

