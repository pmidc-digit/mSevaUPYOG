import React, { Fragment, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { Dropdown, SearchField, Loader } from "@mseva/digit-ui-react-components";

// Port of the old rainmaker report "boundarylist" field (reports/components/boundary).
// Shows one dropdown per REVENUE boundary level under the City (e.g. Zone -> Block -> Locality)
// and keeps the form value as { selected: {level: {code, name}}, localityArray: [codes] }.
// With nothing selected, localityArray holds every locality of the city, exactly like the old picker.

const HIERARCHY_TYPE = "REVENUE";

export const getLevels = (city) => {
  const levels = [];
  let current = city?.children || [];
  while (current.length) {
    current.forEach((node) => {
      if (node?.label && !levels.includes(node.label)) levels.push(node.label);
    });
    current = current.flatMap((node) => node?.children || []);
  }
  return levels;
};

const collectCodes = (node, leafLabel) => {
  const codes = [];
  const walk = (n) => {
    (n?.children || []).forEach((child) => {
      if (child.label === leafLabel) codes.push(child.code);
      walk(child);
    });
  };
  walk(node);
  return codes;
};

const findChild = (parent, code) => (parent?.children || []).find((c) => c.code === code);

export const useCityBoundary = (tenantId) =>
  useQuery(
    ["reportBoundary", tenantId, HIERARCHY_TYPE],
    async () => {
      const res = await Digit.CustomService.getResponse({
        url: "/egov-location/location/v11/boundarys/_search",
        params: { tenantId, hierarchyTypeCode: HIERARCHY_TYPE },
        data: {},
      });
      const tenantBoundary = (res?.TenantBoundary || []).find(
        (tb) => tb?.hierarchyType?.name === HIERARCHY_TYPE || tb?.hierarchyType?.code === HIERARCHY_TYPE
      );
      const city = (tenantBoundary?.boundary || []).find((b) => b?.label === "City") || tenantBoundary?.boundary?.[0];
      return city || null;
    },
    { enabled: !!tenantId, staleTime: Infinity }
  );

export const computeValue = (city, levels, selected) => {
  const leafLabel = levels.includes("Locality") ? "Locality" : levels[levels.length - 1];
  let node = city;
  let deepest = null;
  for (const level of levels) {
    const sel = selected?.[level];
    if (!sel) break;
    const next = findChild(node, sel.code);
    if (!next) break;
    node = next;
    deepest = next;
  }
  let localityArray;
  if (!deepest) localityArray = collectCodes(city, leafLabel);
  else if (deepest.label === leafLabel) localityArray = [deepest.code];
  else localityArray = collectCodes(deepest, leafLabel);
  return { selected: selected || {}, localityArray };
};

const BoundaryField = ({ value, onChange, t, tenantId }) => {
  const { data: city, isLoading } = useCityBoundary(tenantId);
  const levels = useMemo(() => getLevels(city), [city]);

  // Fill in "all localities" on first load and after "Clear all" (value reset to "").
  useEffect(() => {
    if (city && (!value || !value.localityArray)) onChange(computeValue(city, levels, {}));
  }, [city, levels, value]);

  if (isLoading) return <Loader />;
  if (!city || !levels.length) return null;

  const selected = value?.selected || {};

  const getLabel = (level) => {
    const key = `reports.${level}.label`;
    const translated = t(key);
    return translated && translated !== key ? translated : level;
  };

  // Walk down the tree to find the options for each level.
  let parent = city;
  return (
    <Fragment>
      {levels.map((level, index) => {
        const options = parent ? (parent.children || []).filter((c) => c.label === level).map((c) => ({ code: c.code, name: c.name })) : [];
        const sel = selected[level];
        const disabled = index > 0 && !selected[levels[index - 1]];
        parent = sel ? findChild(parent, sel.code) : null;
        return (
          <SearchField key={level}>
            <label>{getLabel(level)}</label>
            <Dropdown
              option={options}
              optionKey="name"
              selected={sel || null}
              disable={disabled || options.length === 0}
              t={(s) => s}
              select={(opt) => {
                // keep levels above this one, set this one, clear everything below (old handler())
                const next = {};
                for (let i = 0; i < index; i++) if (selected[levels[i]]) next[levels[i]] = selected[levels[i]];
                next[level] = { code: opt.code, name: opt.name };
                onChange(computeValue(city, levels, next));
              }}
            />
          </SearchField>
        );
      })}
    </Fragment>
  );
};

export default BoundaryField;
