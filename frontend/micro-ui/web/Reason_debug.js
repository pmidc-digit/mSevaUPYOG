import __vite__cjsImport0_react_jsxDevRuntime from "/digit-ui/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5b815848"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/digit-ui/node_modules/.vite/deps/react.js?v=5b815848"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"];
import { useTranslation } from "/digit-ui/node_modules/.vite/deps/react-i18next.js?v=5b815848";
import { Link, useHistory, useParams } from "/digit-ui/node_modules/.vite/deps/react-router-dom.js?v=5b815848";
import { BackButton, Card, CardHeader, CardLabelError, CardText, RadioButtons, SubmitBar } from "/digit-ui/micro-ui-internals/packages/react-components/src/index.js";
import { LOCALIZATION_KEY } from "/digit-ui/micro-ui-internals/packages/modules/swach/src/constants/Localization.js";
const ReasonPage = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { id } = useParams();
  const [selected, setSelected] = useState(null);
  const [valid, setValid] = useState(true);
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId();
  const complaintDetails = Digit.Hooks.swach.useComplaintDetails({ tenantId, id }).complaintDetails;
  const onRadioChange = (value) => {
    let reopenDetails = Digit.SessionStorage.get(`reopen.${id}`);
    Digit.SessionStorage.set(`reopen.${id}`, { ...reopenDetails, reason: value });
    setSelected(value);
  };
  function onSave() {
    if (selected === null) {
      setValid(false);
    } else {
      const basePath = window.location.pathname.split("/reopen/")[0];
      const complaintId = id;
      const newURL = `${basePath}/reopen/upload-photo/${complaintId}`;
      history.push({
        pathname: newURL,
        state: { complaintDetails }
      });
    }
  }
  return /* @__PURE__ */ jsxDEV(Card, { children: [
    /* @__PURE__ */ jsxDEV(CardHeader, { children: t(`${LOCALIZATION_KEY.CS_REOPEN}_COMPLAINT`) }, void 0, false, {
      fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js",
      lineNumber: 42,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(CardText, {}, void 0, false, {
      fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js",
      lineNumber: 43,
      columnNumber: 7
    }, this),
    valid ? null : /* @__PURE__ */ jsxDEV(CardLabelError, { children: t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_ERROR_REOPEN_REASON`) }, void 0, false, {
      fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js",
      lineNumber: 44,
      columnNumber: 23
    }, this),
    /* @__PURE__ */ jsxDEV(
      RadioButtons,
      {
        onSelect: onRadioChange,
        selectedOption: selected,
        options: [
          t(`${LOCALIZATION_KEY.CS_REOPEN}_NO_ACTION_TAKEN`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_ISSUE_NOT_RESOLVED`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_PARTIAL_RESOLUTION`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_PROBLEM_RECURRED`)
        ]
      },
      void 0,
      false,
      {
        fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js",
        lineNumber: 45,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(SubmitBar, { label: t(`CS_COMMON_NEXT`), onSubmit: onSave }, void 0, false, {
      fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js",
      lineNumber: 56,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Upyog-FrontEnd/mSevaUPYOG/frontend/micro-ui/web/micro-ui-internals/packages/modules/swach/src/pages/citizen/ReopenComplaint/Reason.js",
    lineNumber: 41,
    columnNumber: 5
  }, this);
};
export default ReasonPage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYXNvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tIFwicmVhY3QtaTE4bmV4dFwiO1xyXG5pbXBvcnQgeyBMaW5rLCB1c2VIaXN0b3J5LCB1c2VQYXJhbXMgfSBmcm9tIFwicmVhY3Qtcm91dGVyLWRvbVwiO1xyXG5pbXBvcnQgeyBCYWNrQnV0dG9uLCBDYXJkLCBDYXJkSGVhZGVyLCBDYXJkTGFiZWxFcnJvciwgQ2FyZFRleHQsIFJhZGlvQnV0dG9ucywgU3VibWl0QmFyIH0gZnJvbSBcIkBtc2V2YS9kaWdpdC11aS1yZWFjdC1jb21wb25lbnRzXCI7XHJcblxyXG5pbXBvcnQgeyBMT0NBTElaQVRJT05fS0VZIH0gZnJvbSBcIi4uLy4uLy4uL2NvbnN0YW50cy9Mb2NhbGl6YXRpb25cIjtcclxuXHJcblxyXG5jb25zdCBSZWFzb25QYWdlID0gKHByb3BzKSA9PiB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKTtcclxuICBjb25zdCB7IHQgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XHJcbiAgY29uc3QgeyBpZCB9ID0gdXNlUGFyYW1zKCk7XHJcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbdmFsaWQsIHNldFZhbGlkXSA9IHVzZVN0YXRlKHRydWUpO1xyXG5cclxuICBjb25zdCB0ZW5hbnRJZCA9IERpZ2l0LlNlc3Npb25TdG9yYWdlLmdldChcIkNJVElaRU4uQ09NTU9OLkhPTUUuQ0lUWVwiKT8uY29kZSB8fCBEaWdpdC5VTEJTZXJ2aWNlLmdldEN1cnJlbnRUZW5hbnRJZCgpO1xyXG4gIGNvbnN0IGNvbXBsYWludERldGFpbHMgPSBEaWdpdC5Ib29rcy5zd2FjaC51c2VDb21wbGFpbnREZXRhaWxzKHsgdGVuYW50SWQsIGlkIH0pLmNvbXBsYWludERldGFpbHM7XHJcblxyXG4gIGNvbnN0IG9uUmFkaW9DaGFuZ2UgPSAodmFsdWUpID0+IHtcclxuICAgIGxldCByZW9wZW5EZXRhaWxzID0gRGlnaXQuU2Vzc2lvblN0b3JhZ2UuZ2V0KGByZW9wZW4uJHtpZH1gKTtcclxuICAgIERpZ2l0LlNlc3Npb25TdG9yYWdlLnNldChgcmVvcGVuLiR7aWR9YCwgeyAuLi5yZW9wZW5EZXRhaWxzLCByZWFzb246IHZhbHVlIH0pO1xyXG4gICAgc2V0U2VsZWN0ZWQodmFsdWUpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIG9uU2F2ZSgpIHtcclxuICAgIGlmIChzZWxlY3RlZCA9PT0gbnVsbCkge1xyXG4gICAgICBzZXRWYWxpZChmYWxzZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9yZW9wZW4vXCIpWzBdO1xyXG4gICAgICBjb25zdCBjb21wbGFpbnRJZCA9IGlkO1xyXG4gICAgICBjb25zdCBuZXdVUkwgPSBgJHtiYXNlUGF0aH0vcmVvcGVuL3VwbG9hZC1waG90by8ke2NvbXBsYWludElkfWA7XHJcbiAgICAgIC8vIGhpc3RvcnkucHVzaChuZXdVUkwpO1xyXG4gICAgICBoaXN0b3J5LnB1c2goe1xyXG4gICAgICAgIHBhdGhuYW1lOiBuZXdVUkwsXHJcbiAgICAgICAgc3RhdGU6IHsgY29tcGxhaW50RGV0YWlscyB9LFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8Q2FyZD5cclxuICAgICAgPENhcmRIZWFkZXI+e3QoYCR7TE9DQUxJWkFUSU9OX0tFWS5DU19SRU9QRU59X0NPTVBMQUlOVGApfTwvQ2FyZEhlYWRlcj5cclxuICAgICAgPENhcmRUZXh0PjwvQ2FyZFRleHQ+XHJcbiAgICAgIHt2YWxpZCA/IG51bGwgOiA8Q2FyZExhYmVsRXJyb3I+e3QoYCR7TE9DQUxJWkFUSU9OX0tFWS5DU19BRERDT01QTEFJTlR9X0VSUk9SX1JFT1BFTl9SRUFTT05gKX08L0NhcmRMYWJlbEVycm9yPn1cclxuICAgICAgPFJhZGlvQnV0dG9uc1xyXG4gICAgICAgIG9uU2VsZWN0PXtvblJhZGlvQ2hhbmdlfVxyXG4gICAgICAgIHNlbGVjdGVkT3B0aW9uPXtzZWxlY3RlZH1cclxuICAgICAgICBvcHRpb25zPXtbXHJcbiAgICAgICAgICB0KGAke0xPQ0FMSVpBVElPTl9LRVkuQ1NfUkVPUEVOfV9OT19BQ1RJT05fVEFLRU5gKSxcclxuICAgICAgICAgIHQoYCR7TE9DQUxJWkFUSU9OX0tFWS5DU19SRU9QRU59X0lTU1VFX05PVF9SRVNPTFZFRGApLFxyXG4gICAgICAgICAgdChgJHtMT0NBTElaQVRJT05fS0VZLkNTX1JFT1BFTn1fUEFSVElBTF9SRVNPTFVUSU9OYCksXHJcbiAgICAgICAgICB0KGAke0xPQ0FMSVpBVElPTl9LRVkuQ1NfUkVPUEVOfV9QUk9CTEVNX1JFQ1VSUkVEYCksXHJcbiAgICAgICAgXX1cclxuICAgICAgLz5cclxuXHJcbiAgICAgIDxTdWJtaXRCYXIgbGFiZWw9e3QoYENTX0NPTU1PTl9ORVhUYCl9IG9uU3VibWl0PXtvblNhdmV9IC8+XHJcbiAgICA8L0NhcmQ+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlYXNvblBhZ2U7XHJcbiJdLCJtYXBwaW5ncyI6IkFBeUNNO0FBekNOLE9BQU8sU0FBUyxnQkFBZ0I7QUFDaEMsU0FBUyxzQkFBc0I7QUFDL0IsU0FBUyxNQUFNLFlBQVksaUJBQWlCO0FBQzVDLFNBQVMsWUFBWSxNQUFNLFlBQVksZ0JBQWdCLFVBQVUsY0FBYyxpQkFBaUI7QUFFaEcsU0FBUyx3QkFBd0I7QUFHakMsTUFBTSxhQUFhLENBQUMsVUFBVTtBQUM1QixRQUFNLFVBQVUsV0FBVztBQUMzQixRQUFNLEVBQUUsRUFBRSxJQUFJLGVBQWU7QUFDN0IsUUFBTSxFQUFFLEdBQUcsSUFBSSxVQUFVO0FBQ3pCLFFBQU0sQ0FBQyxVQUFVLFdBQVcsSUFBSSxTQUFTLElBQUk7QUFDN0MsUUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLFNBQVMsSUFBSTtBQUV2QyxRQUFNLFdBQVcsTUFBTSxlQUFlLElBQUksMEJBQTBCLEdBQUcsUUFBUSxNQUFNLFdBQVcsbUJBQW1CO0FBQ25ILFFBQU0sbUJBQW1CLE1BQU0sTUFBTSxNQUFNLG9CQUFvQixFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUU7QUFFakYsUUFBTSxnQkFBZ0IsQ0FBQyxVQUFVO0FBQy9CLFFBQUksZ0JBQWdCLE1BQU0sZUFBZSxJQUFJLFVBQVUsRUFBRSxFQUFFO0FBQzNELFVBQU0sZUFBZSxJQUFJLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxlQUFlLFFBQVEsTUFBTSxDQUFDO0FBQzVFLGdCQUFZLEtBQUs7QUFBQSxFQUNuQjtBQUVBLFdBQVMsU0FBUztBQUNoQixRQUFJLGFBQWEsTUFBTTtBQUNyQixlQUFTLEtBQUs7QUFBQSxJQUNoQixPQUFPO0FBQ0wsWUFBTSxXQUFXLE9BQU8sU0FBUyxTQUFTLE1BQU0sVUFBVSxFQUFFLENBQUM7QUFDN0QsWUFBTSxjQUFjO0FBQ3BCLFlBQU0sU0FBUyxHQUFHLFFBQVEsd0JBQXdCLFdBQVc7QUFFN0QsY0FBUSxLQUFLO0FBQUEsUUFDWCxVQUFVO0FBQUEsUUFDVixPQUFPLEVBQUUsaUJBQWlCO0FBQUEsTUFDNUIsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBRUEsU0FDRSx1QkFBQyxRQUNDO0FBQUEsMkJBQUMsY0FBWSxZQUFFLEdBQUcsaUJBQWlCLFNBQVMsWUFBWSxLQUF4RDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQTBEO0FBQUEsSUFDMUQsdUJBQUMsY0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQVU7QUFBQSxJQUNULFFBQVEsT0FBTyx1QkFBQyxrQkFBZ0IsWUFBRSxHQUFHLGlCQUFpQixlQUFlLHNCQUFzQixLQUE1RTtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQThFO0FBQUEsSUFDOUY7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLFVBQVU7QUFBQSxRQUNWLGdCQUFnQjtBQUFBLFFBQ2hCLFNBQVM7QUFBQSxVQUNQLEVBQUUsR0FBRyxpQkFBaUIsU0FBUyxrQkFBa0I7QUFBQSxVQUNqRCxFQUFFLEdBQUcsaUJBQWlCLFNBQVMscUJBQXFCO0FBQUEsVUFDcEQsRUFBRSxHQUFHLGlCQUFpQixTQUFTLHFCQUFxQjtBQUFBLFVBQ3BELEVBQUUsR0FBRyxpQkFBaUIsU0FBUyxtQkFBbUI7QUFBQSxRQUNwRDtBQUFBO0FBQUEsTUFSRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFTQTtBQUFBLElBRUEsdUJBQUMsYUFBVSxPQUFPLEVBQUUsZ0JBQWdCLEdBQUcsVUFBVSxVQUFqRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQXlEO0FBQUEsT0FmM0Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQWdCQTtBQUVKO0FBRUEsZUFBZTsiLCJuYW1lcyI6W119
