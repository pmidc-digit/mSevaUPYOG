import React, { useState } from "react";
import { Link } from "react-router-dom";
import resources from "./resources.json";
import "./style.css";

const ExternalLink = ({ url, children, ...props }) => <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}<span aria-hidden="true"> ↗</span></a>;
const matches = (item, query) => item.title.toLowerCase().includes(query) || item.children.some((child) => matches(child, query));

function Resource({ item, query = "" }) {
  const children = query && !item.title.toLowerCase().includes(query) ? item.children.filter((child) => matches(child, query)) : item.children;
  if (children.length) return <details open={query ? true : undefined} className="enaksha-resource"><summary>{item.title}</summary><div>{children.map((child, index) => <Resource key={`${child.title}-${index}`} item={child} query={query && !item.title.toLowerCase().includes(query) ? query : ""} />)}</div></details>;
  return <div className="enaksha-resource-row"><span>{item.title}</span>{item.links.length ? item.links.map((link, index) => <ExternalLink key={index} url={link.url}>{link.title === item.title ? "Open" : link.title}</ExternalLink>) : <small>No document linked on source</small>}</div>;
}

export default function ENaksha() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const sections = resources.sections.filter((item) => matches(item, query));
  return <main className="enaksha-page">
    <header className="enaksha-top"><Link to="/digit-ui/citizen">mSeva <span>Punjab Local Government</span></Link><nav aria-label="Page sections"><a href="#enaksha-notices">Notices</a><a href="#enaksha-resources">Resources</a><a href="#enaksha-support">Helpdesk</a></nav></header>
    <section className="enaksha-hero"><p>DEPARTMENT OF LOCAL GOVERNMENT · PUNJAB</p><h1>eNaksha</h1><p>Building approvals, public records and guidance, in one place.</p><div className="enaksha-actions"><Link to="/digit-ui/citizen/obps-home">Open mSeva building services</Link><ExternalLink url={resources.source}>Visit original eNaksha portal</ExternalLink></div></section>
    <section id="enaksha-notices" className="enaksha-section"><h2>Portal notices</h2><p className="enaksha-muted">Source notices reviewed on 5 October 2026. Check the original portal for subsequent updates.</p><div className="enaksha-grid">
      <article className="enaksha-notice"><h3>Application migration</h3><p>New building-plan (including self-certification), plot NOC and CLU applications stopped on the legacy portal on 1 September 2026. Earlier applications continue there. Professionals should resubmit applications returned with objections to the ULB.</p><p>The source announces that ULB and professional access ends after 15 November 2026.</p><ExternalLink url="https://mseva.lgpunjab.gov.in/">Upgraded portal</ExternalLink></article>
      <article className="enaksha-notice"><h3>Industrial and institutional projects</h3><p>From 15 May 2025, applications for industry, hotels, hospitals/nursing homes and institutions are directed to PBIP.</p><ExternalLink url="https://fasttrack.punjab.gov.in/webportal/login">Open PBIP</ExternalLink></article>
      <article className="enaksha-notice"><h3>Browser and certificate guidance</h3><p>The source recommends Chrome 150.0.7871.46 or later. Use the browser’s update settings. Scan the QR code on a certificate to verify it.</p></article>
    </div></section>
    <section className="enaksha-section"><h2>Portal access</h2><div className="enaksha-grid">
      <article className="enaksha-card"><h3>Staff and professionals</h3><p>Use the original portal for legacy login, OTP verification, password recovery and professional registration.</p><ExternalLink url={resources.source}>Continue to eNaksha</ExternalLink></article>
      <article className="enaksha-card"><h3>Citizens</h3><div className="enaksha-actions"><ExternalLink url={resources.source}>Citizen login</ExternalLink><ExternalLink url="https://enaksha.lgpunjab.gov.in/owner_application.php">Citizen registration</ExternalLink></div></article>
      <article className="enaksha-card"><h3>Site reporting</h3><ExternalLink url="https://enaksha.lgpunjab.gov.in/apk/Punjab_Obpas.apk">Download Android app · v3.2</ExternalLink></article>
    </div></section>
    <section id="enaksha-resources" className="enaksha-section"><h2>Documents and public records</h2><label htmlFor="enaksha-search">Find a document, district or ULB</label><input id="enaksha-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources…" /><p className="enaksha-muted">Documents open on the original portal. Expand a category to browse its records.</p><div className="enaksha-resources">{sections.map((item) => <Resource key={item.title} item={item} query={query} />)}{!sections.length && <p role="status">No matching resources.</p>}</div></section>
    <section className="enaksha-section enaksha-grid"><article className="enaksha-card"><h2>Programme aims</h2><p>eNaksha supports online drawing and document submission across 165 ULBs and 27 Improvement Trusts, linked with e-governance services.</p><p>The programme aims for responsive, accountable and inclusive urban service delivery.</p></article><article id="enaksha-support" className="enaksha-card"><h2>Helpdesk</h2><p><a href="tel:01722619247">0172-2619247</a> · <a href="tel:01722619248">0172-2619248</a></p><p><a href="mailto:enakshahelpdesk@gmail.com">enakshahelpdesk@gmail.com</a></p><p>Monday–Friday · 10:00–18:00</p></article></section>
    <footer className="enaksha-footer">Resource directory and notice summaries adapted from <ExternalLink url={resources.source}>eNaksha, Punjab</ExternalLink>. Login and live records remain on their respective portals.</footer>
  </main>;
}
