import React, { useEffect, useRef, useState } from "react";
import { Dropdown, SubmitBar, CardLabelError } from "@mseva/digit-ui-react-components";
import "./EmployeeTenantSelection.scss";
import { useTranslation } from "react-i18next";
import { getEmployeeTenantOptions, switchEmployeeTenant } from "./employeeTenant";

const EmployeeTenantSelection = () => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const selectionConfirmed = useRef(false);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const user = Digit.SessionStorage.get("citizen.userRequestObject") || Digit.UserService.getUser();
  const roles = user?.info?.roles || [];
  const tenants = getEmployeeTenantOptions(roles);

  const options = tenants.map((code) => ({ code, name: `TENANT_TENANTS_${code.replace(/\./g, "_").toUpperCase()}` }));

  useEffect(() => {
    if (completed || selectionConfirmed.current) return;
    // Only the Punjab landing flow automatically chooses a sole assigned ULB.
    if (Digit.UserService.getUser()?.info?.tenantId === "pb.punjab" && tenants.length === 1 && switchEmployeeTenant(tenants[0])) {
      selectionConfirmed.current = true;
      // Reload even for Punjab so cards pick up the scoped roles and tenant caches.
      window.location.reload();
      return;
    }
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const blockEscape = (event) => {
      if (event.key === "Escape" && !selectionConfirmed.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const blockCancel = (event) => {
      if (!selectionConfirmed.current) event.preventDefault();
    };
    const keepOpen = () => {
      if (!selectionConfirmed.current && dialog.isConnected && !dialog.open) dialog.showModal();
    };

    // Native listeners also handle browser dismissal outside React's event system.
    dialog.setAttribute("closedby", "none");
    document.addEventListener("keydown", blockEscape, true);
    dialog.addEventListener("cancel", blockCancel);
    dialog.addEventListener("close", keepOpen);
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", blockEscape, true);
      dialog.removeEventListener("cancel", blockCancel);
      dialog.removeEventListener("close", keepOpen);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [completed]);

  const submit = (event) => {
    event.preventDefault();
    if (!tenants.includes(selectedTenant) || !switchEmployeeTenant(selectedTenant)) {
      setError(t("Please select a ULB assigned to your roles."));
      return;
    }
    selectionConfirmed.current = true;
    if (selectedTenant === user?.info?.tenantId) {
      setCompleted(true);
    } else {
      window.location.reload();
    }
  };

  if (completed) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="employee-tenant-title"
      onCancel={(event) => event.preventDefault()}
      className="employee-tenant-dialog"
      aria-describedby="employee-tenant-description"
    >
      <form onSubmit={submit} noValidate>
        <header className="employee-tenant-dialog__header">
          <h2 id="employee-tenant-title">{t("Select ULB")}</h2>
          <p id="employee-tenant-description">{t("Select your assigned ULB to access employee services.")}</p>
        </header>
        <div className="employee-tenant-dialog__body">
          {tenants.length ? (
            <>
              <div className="employee-tenant-dialog__label" role="group" aria-labelledby="employee-tenant-field-label">
                <span id="employee-tenant-field-label">{t("ULB")} <span className="employee-tenant-dialog__required">*</span></span>
                <Dropdown
                  option={options}
                  optionKey="name"
                  selected={options.find((option) => option.code === selectedTenant) || null}
                  select={(option) => {
                    setSelectedTenant(option?.code || "");
                    setError("");
                  }}
                  t={t}
                  optionCardStyles={{ maxHeight: 180, overflowY: "auto" }}
                  placeholder={t("Select ULB")}
                  errorStyle={!!error}
                />
              </div>
              {error && <div role="alert"><CardLabelError>{error}</CardLabelError></div>}
              {selectedTenant && (
                <section className="employee-tenant-dialog__roles">
                  <h3>{t("Assigned roles")}</h3>
                  <ul>{roles.filter((role) => role.tenantId === selectedTenant && role.code).map((role, index) => (
                    <li key={`${role.code}-${index}`}>{t(role.name || role.code)}</li>
                  ))}</ul>
                </section>
              )}
            </>
          ) : <p role="alert">{t("No ULB is assigned to your roles. Please contact your administrator.")}</p>}
        </div>
        {!!tenants.length && (
          <footer className="employee-tenant-dialog__footer">
            <SubmitBar submit label={t("Continue")} />
          </footer>
        )}
      </form>
    </dialog>
  );
};

export default EmployeeTenantSelection;
