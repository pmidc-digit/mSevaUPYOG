const MarqueeBanner = ({
  text,
  background = "red", // 75% opacity
  color = "#fff",
  speed = 5,
  icon,
}) => {
  const maintenanceMessage = (
  <>
    ⚠️ <strong>Scheduled Maintenance Notice:</strong> Dear Citizens, The mSeva
    Portal will undergo scheduled maintenance and database optimization from{" "}
    <strong>7:00 PM on 07 August 2026</strong> to{" "}
    <strong>6:00 PM on 09 August 2026</strong>. During this period, services may
    be temporarily unavailable or experience intermittent interruptions as we
    undertake critical database optimization activities to improve system
    performance and ensure faster bill generation. We regret the inconvenience
    caused and appreciate your patience and cooperation.{" "}
    <strong>Team mSeva</strong> Punjab Municipal Infrastructure Development
    Company (PMIDC)
  </>
);
  return (
    <div
      style={{
        width: "100%",
        background,
        color,
        padding: "10px 10px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontWeight: 500,
        boxSizing: "border-box"
      }}
    >
      <marquee scrollAmount={speed}>
        {icon && <span style={{ marginRight: "8px" }}>{icon}</span>}
        {text || maintenanceMessage}
      </marquee>
    </div>
  );
};

export default MarqueeBanner;