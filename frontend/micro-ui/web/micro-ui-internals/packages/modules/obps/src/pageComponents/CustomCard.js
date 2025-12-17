import React from "react";

const CustomCard = ({ children, style, className, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={`custom-card-container ${onClick ? "custom-card-clickable" : ""} ${isHovered ? "custom-card-hovered" : ""} ${className || ""}`}
      onClick={onClick}
      onMouseEnter={() => onClick && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <table className="custom-card-table">
        <tbody>
          <tr>
            <td className="custom-card-td">
              {children}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CustomCard;
