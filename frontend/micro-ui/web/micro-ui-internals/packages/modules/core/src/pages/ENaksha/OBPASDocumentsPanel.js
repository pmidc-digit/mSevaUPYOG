import React, { useState } from "react";

const categories = [
  ["Municipal Building Byelaws", "Building byelaws", "Building standards and development requirements"],
  ["UserManual", "User manuals", "Guidance for using the application portal"],
  ["Fees", "Fees", "Published fee documents and schedules"],
  ["Approved Colonies", "Approved colonies", "Browse colony records by location"],
];

export default function OBPASDocumentsPanel({ onSearch }) {
  const [query, setQuery] = useState("");
  return <aside className="obpas-documents-panel" aria-labelledby="obpas-documents-heading">
    <h2 id="obpas-documents-heading">Documents &amp; Guidelines</h2>
    <p>Find building rules, user manuals, fees and ULB records before you apply.</p>
    <form onSubmit={(event) => { event.preventDefault(); onSearch(query); }}>
      <label htmlFor="obpas-document-quick-search">Search documents</label>
      <div className="obpas-document-search"><input id="obpas-document-quick-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Document, district or ULB" /><button type="submit">Search</button></div>
    </form>
    <div className="obpas-document-categories">{categories.map(([query, title, description]) => <button key={query} type="button" onClick={() => onSearch(query)}><strong>{title}</strong><span>{description}</span></button>)}</div>
    <button className="obpas-browse-documents" type="button" onClick={() => onSearch("")}>Browse all documents →</button>
  </aside>;
}
