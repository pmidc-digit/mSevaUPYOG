import React, { useEffect, useMemo, useState } from "react";

const SEARCH_THRESHOLD = 5;

const styles = `
.psp-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(7, 32, 64, 0.55);
  backdrop-filter: blur(2px);
  animation: psp-fade 0.18s ease-out;
}
.psp-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - 32px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(7, 32, 64, 0.28);
  overflow: hidden;
  animation: psp-rise 0.22s ease-out;
}
.psp-header {
  position: relative;
  padding: 24px 24px 16px;
  background: linear-gradient(135deg, var(--mseva-blue-100, #e9f2fc) 0%, #ffffff 100%);
  border-bottom: 1px solid var(--mseva-border, #cbd5e1);
}
.psp-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 12px;
  border-radius: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--mseva-blue-900, #074b98) 0%, var(--mseva-blue-600, #1675d1) 100%);
}
.psp-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--mseva-blue-900, #074b98);
}
.psp-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--mseva-text-muted, #3d709f);
}
.psp-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
  color: var(--mseva-text-muted, #3d709f);
  background: transparent;
  cursor: pointer;
}
.psp-close:hover,
.psp-close:focus-visible {
  background: rgba(7, 75, 152, 0.08);
  outline: none;
}
.psp-search {
  padding: 12px 24px 0;
}
.psp-search input {
  width: 100%;
  height: 42px;
  padding: 0 14px 0 38px;
  border: 1px solid var(--mseva-border, #cbd5e1);
  border-radius: 10px;
  font-size: 14px;
  color: var(--mseva-text, #074b98);
  background: #f8fbff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%233d709f' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-3.5-3.5'/%3E%3C/svg%3E") no-repeat 12px center;
}
.psp-search input:focus {
  border-color: var(--mseva-blue-600, #1675d1);
  outline: none;
  box-shadow: 0 0 0 3px rgba(22, 117, 209, 0.15);
}
.psp-count {
  padding: 12px 24px 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--mseva-text-muted, #3d709f);
}
.psp-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  align-content: start;
  gap: 14px;
  padding: 8px 24px 20px;
  overflow-y: auto;
}
.psp-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 14px 16px;
  border: 1.5px solid var(--mseva-border, #cbd5e1);
  border-radius: 14px;
  text-align: center;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s, transform 0.15s;
}
.psp-card:hover {
  border-color: var(--mseva-blue-600, #1675d1);
  box-shadow: 0 8px 20px rgba(7, 75, 152, 0.12);
  transform: translateY(-2px);
}
.psp-card.is-selected {
  border-color: var(--mseva-green-700, #287f1d);
  background: var(--mseva-green-100, #eef8eb);
  box-shadow: 0 4px 14px rgba(40, 127, 29, 0.14);
}
.psp-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.psp-card:focus-within {
  outline: 2px solid var(--mseva-blue-600, #1675d1);
  outline-offset: 2px;
}
.psp-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  border-radius: 50%;
  font-size: 19px;
  font-weight: 700;
  color: var(--mseva-blue-900, #074b98);
  background: var(--mseva-blue-100, #e9f2fc);
}
.psp-card.is-selected .psp-avatar {
  color: #ffffff;
  background: var(--mseva-green-700, #287f1d);
}
.psp-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.psp-name {
  display: block;
  max-width: 100%;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--mseva-text, #074b98);
  text-transform: capitalize;
}
.psp-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--mseva-text-muted, #3d709f);
}
.psp-chip {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--mseva-purple-700, #6530b8);
  background: var(--mseva-purple-100, #f2eaff);
}
.psp-guardian {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.psp-radio {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--mseva-border-strong, #94a3b8);
  border-radius: 50%;
  transition: all 0.15s;
}
.psp-card.is-selected .psp-radio {
  border-color: var(--mseva-green-700, #287f1d);
  background: var(--mseva-green-700, #287f1d);
}
.psp-empty {
  grid-column: 1 / -1;
  padding: 32px 0;
  text-align: center;
  font-size: 14px;
  color: var(--mseva-text-muted, #3d709f);
}
.psp-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--mseva-border, #cbd5e1);
  background: #f8fbff;
}
.psp-btn {
  flex: 1;
  height: 46px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, box-shadow 0.15s;
}
.psp-btn-secondary {
  border: 1.5px solid var(--mseva-blue-900, #074b98);
  color: var(--mseva-blue-900, #074b98);
  background: #ffffff;
}
.psp-btn-primary {
  border: none;
  color: #ffffff;
  background: linear-gradient(135deg, #087339 0%, #169a48 100%);
  box-shadow: 0 8px 18px rgba(16, 128, 57, 0.22);
}
.psp-btn-primary:disabled {
  opacity: 0.45;
  box-shadow: none;
  cursor: not-allowed;
}
@keyframes psp-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes psp-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 640px) {
  .psp-overlay {
    align-items: flex-end;
    padding: 0;
  }
  .psp-dialog {
    max-width: none;
    max-height: 88vh;
    border-radius: 18px 18px 0 0;
  }
  .psp-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .psp-header,
  .psp-search,
  .psp-count,
  .psp-list,
  .psp-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
`;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const ProfileSelectPopup = ({ profiles = [], mobileNumber, selectedProfile, onSelect, onContinue, onClose, onCancel, isLoading = false }) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflowY = "auto";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) =>
      [profile.name, profile.fatherOrHusbandName].some((value) => value?.toLowerCase().includes(query))
    );
  }, [profiles, search]);

  const maskedMobile = mobileNumber ? `+91 ${mobileNumber.substring(0, 2)}******${mobileNumber.substring(mobileNumber.length - 2)}` : "";

  return (
    <div className="psp-overlay" onClick={onClose}>
      <style>{styles}</style>
      <div className="psp-dialog" role="dialog" aria-modal="true" aria-labelledby="psp-title" onClick={(event) => event.stopPropagation()}>
        <div className="psp-header">
          <div className="psp-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
            </svg>
          </div>
          <h2 id="psp-title" className="psp-title">
            Choose your profile
          </h2>
          <p className="psp-subtitle">
            {maskedMobile ? `${maskedMobile} is` : "This mobile number is"} linked to {profiles.length} profiles. Select the one you want to
            continue with.
          </p>
          <button type="button" className="psp-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {profiles.length > SEARCH_THRESHOLD && (
          <div className="psp-search">
            <input
              type="search"
              placeholder="Search by name or guardian"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search profiles"
            />
          </div>
        )}

        <div className="psp-count">
          {filteredProfiles.length} of {profiles.length} profiles
        </div>

        <div className="psp-list" role="radiogroup" aria-labelledby="psp-title">
          {filteredProfiles.length === 0 && <div className="psp-empty">No profiles match “{search}”.</div>}
          {filteredProfiles.map((profile) => {
            const isSelected = selectedProfile?.uuid === profile.uuid;
            return (
              <label key={profile.uuid} className={`psp-card ${isSelected ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="citizen-profile"
                  value={profile.uuid}
                  checked={isSelected}
                  onChange={() => onSelect(profile)}
                />
                <span className="psp-avatar" aria-hidden="true">
                  {getInitials(profile.name)}
                </span>
                <span className="psp-info">
                  <span className="psp-name" title={profile.name}>
                    {profile.name?.toLowerCase()}
                  </span>
                  <span className="psp-meta">
                    {profile.fatherOrHusbandName && (
                      <span className="psp-guardian" title={profile.fatherOrHusbandName}>
                        {profile.relationship || "Guardian"}: {profile.fatherOrHusbandName}
                      </span>
                    )}
                    {profile.gender && <span className="psp-chip">{profile.gender.toLowerCase()}</span>}
                  </span>
                </span>
                <span className="psp-radio" aria-hidden="true">
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </span>
              </label>
            );
          })}
        </div>

        <div className="psp-footer">
          <button type="button" className="psp-btn psp-btn-secondary" onClick={onCancel || onClose}>
            Cancel
          </button>
          <button type="button" className="psp-btn psp-btn-primary" disabled={!selectedProfile || isLoading} onClick={onContinue}>
            {isLoading ? "Signing in..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelectPopup;
