import React from "react";
import ErrorComponent from "./ErrorComponent";

const Redircter = () => {
  const path = Digit.UserService.getType() === "employee" ? "/digit-ui/employee/user/error" : "/digit-ui/citizen/error";
  if (
    window.location.href.includes("employee/user/error") ||
    window.location.href.includes("citizen/error") ||
    process.env.NODE_ENV === "development"
  ) {
    //do nothing
  } else {
    window.location.href = path;
  }
  return <span></span>;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorStack: null, hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { error: error?.message, hasError: true, errorStack: error?.stack };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ error: error?.message, hasError: true, errorStack: error?.stack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <Redircter />
          <details style={{ whiteSpace: "pre-wrap", margin: "16px auto", maxWidth: "800px", background: "#fef2f2", border: "1px solid #f87171", borderRadius: 8, padding: 16, color: "#991b1b" }}>
            <summary style={{ fontWeight: "bold", cursor: "pointer" }}>View Technical Error Details</summary>
            <div style={{ marginTop: 8, fontSize: 13, fontFamily: "monospace" }}>
              <strong>Error:</strong> {this.state?.error}
              <br /><br />
              <strong>Stack Trace:</strong>
              <br />
              {this.state?.errorStack}
            </div>
          </details>
          <ErrorComponent initData={this.props.initData} />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
