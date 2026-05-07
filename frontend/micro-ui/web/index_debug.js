import __vite__cjsImport0_react_jsxDevRuntime from "/digit-ui/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=53adc1a4"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
console.log("INDEX JS STARTING");
import { initLibraries } from "/digit-ui/micro-ui-internals/packages/libraries/src/index.js";
initLibraries();
import __vite__cjsImport2_react from "/digit-ui/node_modules/.vite/deps/react.js?v=53adc1a4"; const React = __vite__cjsImport2_react.__esModule ? __vite__cjsImport2_react.default : __vite__cjsImport2_react;
import __vite__cjsImport3_reactDom from "/digit-ui/node_modules/.vite/deps/react-dom.js?v=53adc1a4"; const ReactDOM = __vite__cjsImport3_reactDom.__esModule ? __vite__cjsImport3_reactDom.default : __vite__cjsImport3_reactDom;
import "/digit-ui/src/index.css";
import App from "/digit-ui/src/App.js?t=1777935694239";
import { TLCustomisations } from "/digit-ui/src/Customisations/tl/TLCustomisation.js";
window.Digit.Customizations = { PGR: {}, TL: TLCustomisations };
const user = window.Digit.SessionStorage.get("User");
if (!user || !user.access_token || !user.info) {
  const parseValue = (value) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };
  const getFromStorage = (key) => {
    const value = window.localStorage.getItem(key);
    return value && value !== "undefined" ? parseValue(value) : null;
  };
  const token = getFromStorage("token");
  const citizenToken = getFromStorage("Citizen.token");
  const citizenInfo = getFromStorage("Citizen.user-info");
  const citizenTenantId = getFromStorage("Citizen.tenant-id");
  const employeeToken = getFromStorage("Employee.token");
  const employeeInfo = getFromStorage("Employee.user-info");
  const employeeTenantId = getFromStorage("Employee.tenant-id");
  const userType = token === citizenToken ? "citizen" : "employee";
  window.Digit.SessionStorage.set("user_type", userType);
  window.Digit.SessionStorage.set("userType", userType);
  const getUserDetails = (access_token, info) => ({
    token: access_token,
    access_token,
    info
  });
  const userDetails = userType === "citizen" ? getUserDetails(citizenToken, citizenInfo) : getUserDetails(employeeToken, employeeInfo);
  window.Digit.SessionStorage.set("User", userDetails);
  window.Digit.SessionStorage.set("Citizen.tenantId", citizenTenantId);
  window.Digit.SessionStorage.set("Employee.tenantId", employeeTenantId);
}
ReactDOM.render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/src/index.js",
    lineNumber: 64,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/src/index.js",
    lineNumber: 63,
    columnNumber: 3
  }, this),
  document.getElementById("root")
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUubG9nKFwiSU5ERVggSlMgU1RBUlRJTkdcIik7XHJcbmltcG9ydCB7IGluaXRMaWJyYXJpZXMgfSBmcm9tIFwiQG1zZXZhL2RpZ2l0LXVpLWxpYnJhcmllc1wiO1xyXG5pbml0TGlicmFyaWVzKCk7XHJcblxyXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XHJcbmltcG9ydCBcIi4vaW5kZXguY3NzXCI7XHJcbmltcG9ydCBBcHAgZnJvbSBcIi4vQXBwXCI7XHJcbmltcG9ydCB7IFRMQ3VzdG9taXNhdGlvbnMgfSBmcm9tIFwiLi9DdXN0b21pc2F0aW9ucy90bC9UTEN1c3RvbWlzYXRpb25cIjtcclxuXHJcbndpbmRvdy5EaWdpdC5DdXN0b21pemF0aW9ucyA9IHsgUEdSOiB7fSwgVEw6IFRMQ3VzdG9taXNhdGlvbnMgfTtcclxuXHJcbmNvbnN0IHVzZXIgPSB3aW5kb3cuRGlnaXQuU2Vzc2lvblN0b3JhZ2UuZ2V0KFwiVXNlclwiKTtcclxuXHJcbmlmICghdXNlciB8fCAhdXNlci5hY2Nlc3NfdG9rZW4gfHwgIXVzZXIuaW5mbykge1xyXG4gIC8vIGxvZ2luIGRldGVjdGlvblxyXG5cclxuICBjb25zdCBwYXJzZVZhbHVlID0gKHZhbHVlKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBnZXRGcm9tU3RvcmFnZSA9IChrZXkpID0+IHtcclxuICAgIGNvbnN0IHZhbHVlID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcbiAgICByZXR1cm4gdmFsdWUgJiYgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgPyBwYXJzZVZhbHVlKHZhbHVlKSA6IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdG9rZW4gPSBnZXRGcm9tU3RvcmFnZShcInRva2VuXCIpO1xyXG5cclxuICBjb25zdCBjaXRpemVuVG9rZW4gPSBnZXRGcm9tU3RvcmFnZShcIkNpdGl6ZW4udG9rZW5cIik7XHJcbiAgY29uc3QgY2l0aXplbkluZm8gPSBnZXRGcm9tU3RvcmFnZShcIkNpdGl6ZW4udXNlci1pbmZvXCIpO1xyXG4gIGNvbnN0IGNpdGl6ZW5UZW5hbnRJZCA9IGdldEZyb21TdG9yYWdlKFwiQ2l0aXplbi50ZW5hbnQtaWRcIik7XHJcblxyXG4gIGNvbnN0IGVtcGxveWVlVG9rZW4gPSBnZXRGcm9tU3RvcmFnZShcIkVtcGxveWVlLnRva2VuXCIpO1xyXG4gIGNvbnN0IGVtcGxveWVlSW5mbyA9IGdldEZyb21TdG9yYWdlKFwiRW1wbG95ZWUudXNlci1pbmZvXCIpO1xyXG4gIGNvbnN0IGVtcGxveWVlVGVuYW50SWQgPSBnZXRGcm9tU3RvcmFnZShcIkVtcGxveWVlLnRlbmFudC1pZFwiKTtcclxuXHJcbiAgY29uc3QgdXNlclR5cGUgPSB0b2tlbiA9PT0gY2l0aXplblRva2VuID8gXCJjaXRpemVuXCIgOiBcImVtcGxveWVlXCI7XHJcbiAgd2luZG93LkRpZ2l0LlNlc3Npb25TdG9yYWdlLnNldChcInVzZXJfdHlwZVwiLCB1c2VyVHlwZSk7XHJcbiAgd2luZG93LkRpZ2l0LlNlc3Npb25TdG9yYWdlLnNldChcInVzZXJUeXBlXCIsIHVzZXJUeXBlKTtcclxuXHJcbiAgY29uc3QgZ2V0VXNlckRldGFpbHMgPSAoYWNjZXNzX3Rva2VuLCBpbmZvKSA9PiAoe1xyXG4gICAgdG9rZW46IGFjY2Vzc190b2tlbixcclxuICAgIGFjY2Vzc190b2tlbixcclxuICAgIGluZm8sXHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IHVzZXJEZXRhaWxzID1cclxuICAgIHVzZXJUeXBlID09PSBcImNpdGl6ZW5cIlxyXG4gICAgICA/IGdldFVzZXJEZXRhaWxzKGNpdGl6ZW5Ub2tlbiwgY2l0aXplbkluZm8pXHJcbiAgICAgIDogZ2V0VXNlckRldGFpbHMoZW1wbG95ZWVUb2tlbiwgZW1wbG95ZWVJbmZvKTtcclxuXHJcbiAgd2luZG93LkRpZ2l0LlNlc3Npb25TdG9yYWdlLnNldChcIlVzZXJcIiwgdXNlckRldGFpbHMpO1xyXG4gIHdpbmRvdy5EaWdpdC5TZXNzaW9uU3RvcmFnZS5zZXQoXCJDaXRpemVuLnRlbmFudElkXCIsIGNpdGl6ZW5UZW5hbnRJZCk7XHJcbiAgd2luZG93LkRpZ2l0LlNlc3Npb25TdG9yYWdlLnNldChcIkVtcGxveWVlLnRlbmFudElkXCIsIGVtcGxveWVlVGVuYW50SWQpO1xyXG4gIC8vIGVuZFxyXG59XHJcblxyXG5SZWFjdERPTS5yZW5kZXIoXHJcbiAgPFJlYWN0LlN0cmljdE1vZGU+XHJcbiAgICA8QXBwIC8+XHJcbiAgPC9SZWFjdC5TdHJpY3RNb2RlPixcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIilcclxuKTtcclxuIl0sIm1hcHBpbmdzIjoiQUErREk7QUEvREosUUFBUSxJQUFJLG1CQUFtQjtBQUMvQixTQUFTLHFCQUFxQjtBQUM5QixjQUFjO0FBRWQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sY0FBYztBQUNyQixPQUFPO0FBQ1AsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsd0JBQXdCO0FBRWpDLE9BQU8sTUFBTSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLGlCQUFpQjtBQUU5RCxNQUFNLE9BQU8sT0FBTyxNQUFNLGVBQWUsSUFBSSxNQUFNO0FBRW5ELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxLQUFLLE1BQU07QUFHN0MsUUFBTSxhQUFhLENBQUMsVUFBVTtBQUM1QixRQUFJO0FBQ0YsYUFBTyxLQUFLLE1BQU0sS0FBSztBQUFBLElBQ3pCLFNBQVMsR0FBRztBQUNWLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVBLFFBQU0saUJBQWlCLENBQUMsUUFBUTtBQUM5QixVQUFNLFFBQVEsT0FBTyxhQUFhLFFBQVEsR0FBRztBQUM3QyxXQUFPLFNBQVMsVUFBVSxjQUFjLFdBQVcsS0FBSyxJQUFJO0FBQUEsRUFDOUQ7QUFFQSxRQUFNLFFBQVEsZUFBZSxPQUFPO0FBRXBDLFFBQU0sZUFBZSxlQUFlLGVBQWU7QUFDbkQsUUFBTSxjQUFjLGVBQWUsbUJBQW1CO0FBQ3RELFFBQU0sa0JBQWtCLGVBQWUsbUJBQW1CO0FBRTFELFFBQU0sZ0JBQWdCLGVBQWUsZ0JBQWdCO0FBQ3JELFFBQU0sZUFBZSxlQUFlLG9CQUFvQjtBQUN4RCxRQUFNLG1CQUFtQixlQUFlLG9CQUFvQjtBQUU1RCxRQUFNLFdBQVcsVUFBVSxlQUFlLFlBQVk7QUFDdEQsU0FBTyxNQUFNLGVBQWUsSUFBSSxhQUFhLFFBQVE7QUFDckQsU0FBTyxNQUFNLGVBQWUsSUFBSSxZQUFZLFFBQVE7QUFFcEQsUUFBTSxpQkFBaUIsQ0FBQyxjQUFjLFVBQVU7QUFBQSxJQUM5QyxPQUFPO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsUUFBTSxjQUNKLGFBQWEsWUFDVCxlQUFlLGNBQWMsV0FBVyxJQUN4QyxlQUFlLGVBQWUsWUFBWTtBQUVoRCxTQUFPLE1BQU0sZUFBZSxJQUFJLFFBQVEsV0FBVztBQUNuRCxTQUFPLE1BQU0sZUFBZSxJQUFJLG9CQUFvQixlQUFlO0FBQ25FLFNBQU8sTUFBTSxlQUFlLElBQUkscUJBQXFCLGdCQUFnQjtBQUV2RTtBQUVBLFNBQVM7QUFBQSxFQUNQLHVCQUFDLE1BQU0sWUFBTixFQUNDLGlDQUFDLFNBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUFLLEtBRFA7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUVBO0FBQUEsRUFDQSxTQUFTLGVBQWUsTUFBTTtBQUNoQzsiLCJuYW1lcyI6W119