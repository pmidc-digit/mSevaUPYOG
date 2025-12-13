import React from "react";

const CustomCard = ({ children, style, className, onClick }) => {
  const baseStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(6px)",
    borderRadius: "18px",
    border: "1px solid rgba(229, 231, 235, 0.8)",
    padding: "0", // table will handle spacing
    marginBottom: "24px",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
    transition: "all 0.25s ease",
    cursor: onClick ? "pointer" : "default",
    overflow: "hidden",
    ...style,
  };

  const hoverStyle = {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "24px 20px",
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...(isHovered ? hoverStyle : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => onClick && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ width: "100%", padding: 0, justifyContent:"space-between", alignItems:"center" }}>
              {children}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CustomCard;
