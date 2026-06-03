import exifr from "exifr";

/**
 * Converts decimal coordinates to DMS format with numerator/denominator
 * Example:
 * 28.6139 -> [{numerator: 28, denominator: 1}, {numerator: 36, denominator: 1}, {numerator: 5004, denominator: 100}]
 */
function decimalToDMS(decimal) {
  const abs = Math.abs(decimal);

  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const secondsFloat = (minutesFloat - minutes) * 60;

  return [
    { numerator: degrees, denominator: 1 },
    { numerator: minutes, denominator: 1 },
    { numerator: Math.round(secondsFloat * 100), denominator: 100 }
  ];
}

const EXIF = {
  async getData(target, callback) {
    try {
      let source = target;

      // Handle HTMLImageElement
      if (target instanceof HTMLImageElement) {
        const response = await fetch(target.src);
        source = await response.blob();
      }

      const exifData = await exifr.parse(source, {
        gps: true,
      });

      console.log("EXIF Data extracted:", exifData);

      const latitude = exifData?.latitude;
      const longitude = exifData?.longitude;

      target.exifdata = {
        ...(exifData || {}),

        // exif-js compatible GPS tags
        GPSLatitude:
          latitude != null ? decimalToDMS(latitude) : undefined,

        GPSLongitude:
          longitude != null ? decimalToDMS(longitude) : undefined,

        GPSLatitudeRef:
          latitude != null ? (latitude >= 0 ? "N" : "S") : undefined,

        GPSLongitudeRef:
          longitude != null ? (longitude >= 0 ? "E" : "W") : undefined,
      };

      console.log("EXIF data set on target:", target.exifdata);
    } catch (error) {
      console.error("EXIF parse error:", error);
      target.exifdata = {};
    }

    if (typeof callback === "function") {
      callback.call(target);
    }
  },

  getTag(target, tag) {
    return target?.exifdata?.[tag];
  },

  getAllTags(target) {
    return target?.exifdata || {};
  },

  pretty(target) {
    return JSON.stringify(target?.exifdata || {}, null, 2);
  },
};

export default EXIF;