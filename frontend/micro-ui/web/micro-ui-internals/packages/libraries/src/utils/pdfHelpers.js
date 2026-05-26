const getLabel = (text, type = "key") => ({
  text: text || "NA",
  style: type === "value" ? "pdf-card-value" : "pdf-card-key",
  border: [false, false, false, false],
});

export const buildRainmakerCard = (title, values, color = "grey") => {
  const rows = [];
  let keys = [];
  let vals = [];

  (values || []).forEach(({ title: key, value }) => {
    keys.push(getLabel(key, "key"));
    vals.push(getLabel(value, "value"));
    if (keys.length === 4) {
      rows.push([...keys], [...vals]);
      keys = [];
      vals = [];
    }
  });

  if (keys.length) {
    while (keys.length < 4) {
      keys.push(getLabel(" ", "key"));
      vals.push(getLabel(" ", "value"));
    }
    rows.push([...keys], [...vals]);
  }

  return [
    { text: title, style: "pdf-card-title" },
    {
      style: color === "grey" ? "pdf-table-card" : "pdf-table-card-white",
      table: { widths: [125, 125, 125, 125], body: rows },
      layout: {},
    },
  ];
};

export const buildAttachmentsSection = async (detail, buildAttachment) => {
  if (!detail?.values?.length || typeof buildAttachment !== "function") {
    return [];
  }

  const headerRow = [
    {
      text: detail?.title,
      color: "#454545",
      style: "header",
      fontSize: 14,
      // bold: true,
      colSpan: 2,
      alignment: "left",
      fillColor: "#ffffff",
      border: [true, true, true, false],
    },
    {},
  ];

  let valueRows = [];

  for (let i = 0; i < detail.values.length; i++) {
    const doc = detail.values[i];
    const isLast = i === detail.values.length - 1;
    const base64Image = await buildAttachment(doc);

    if (base64Image) {
      valueRows.push([
        {
          text: doc?.title || "Document",
          style: "header",
          fontSize: 9,
          margin: [10, 2, 0, 2],
          border: isLast ? [true, false, false, true] : [true, false, false, false],
        },
        {
          image: base64Image,
          width: 100,
          height: 100,
          margin: [0, 2, 0, 2],
          border: isLast ? [false, false, true, true] : [false, false, true, false],
          rotation:
            doc?.orientation === 6
              ? 90
              : doc?.orientation === 3
              ? 180
              : doc?.orientation === 8
              ? -90
              : 0,
        },
      ]);
    } else {
      valueRows.push([
        {
          text: doc?.title || "Document",
          style: "header",
          fontSize: 9,
          margin: [10, 2, 0, 2],
          border: isLast ? [true, false, false, true] : [true, false, false, false],
        },
        {
          text: doc?.link ? "View" : doc.value || "NA",
          link: doc?.link || undefined,
          color: doc?.link ? "blue" : "black",
          fontSize: 9,
          margin: [0, 2, 0, 2],
          border: isLast ? [false, false, true, true] : [false, false, true, false],
        },
      ]);
    }
  }

  if (detail.values.length === 1 && detail.values[0].value === "NA") {
    valueRows = [
      [
        {
          text: detail.values[0].title,
          colSpan: 2,
          alignment: "center",
          fontSize: 9,
          margin: [0, 4, 0, 4],
          border: [true, false, true, true],
        },
        {},
      ],
    ];
  }

  return [
    {
      table: {
        widths: [225, 250],
        body: [headerRow, ...valueRows],
      },
      layout: {
        fillColor: (rowIndex) =>
          rowIndex > 0 && rowIndex % 2 === 1 ? "#f5f5f5" : null,
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => "#cccccc",
        vLineColor: () => "#cccccc",
      },
      margin: [10, 2, 10, 2],
    },
  ];
};