import { Loader as DigitLoader } from "@mseva/digit-ui-react-components";

export const Loader = ({ page = false }) => {
  if (page) {
    return (
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999 }}>
        <DigitLoader />
      </div>
    );
  }
  return <DigitLoader />;
};

export default Loader;

