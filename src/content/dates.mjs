/**
 * Archive dates carry their own precision so we never imply more certainty
 * than the evidence supports.
 *
 *   precision  value format        example         displayed as
 *   day        YYYY-MM-DD          1946-03-02      2 March 1946
 *   month      YYYY-MM             1946-03         March 1946
 *   year       YYYY                1946            1946
 *   decade     YYYYs  (YYYY % 10 === 0)  1940s     1940s
 *   century    Nth                 20th            20th century
 *   unknown    (no value)                          Date to be confirmed
 *
 * `circa: true` prefixes "c." — use it when the source itself is approximate.
 * `end` (same precision rules, any precision) turns the date into a range.
 */

export const DATE_PRECISIONS = ["day", "month", "year", "decade", "century", "unknown"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const RX = {
  day: /^(\d{4})-(\d{2})-(\d{2})$/,
  month: /^(\d{4})-(\d{2})$/,
  year: /^(\d{4})$/,
  decade: /^(\d{3})0s$/,
  century: /^(\d{1,2})(st|nd|rd|th)$/,
};

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10]}`;
}

/** Returns an error string, or null when `value` is valid for `precision`. */
export function checkDateValue(value, precision) {
  if (precision === "unknown") return value == null || value === "" ? null : "an unknown date must not have a value";
  if (typeof value !== "string") return `a ${precision} date needs a value`;
  const m = RX[precision]?.exec(value);
  if (!m) return `"${value}" is not a valid ${precision} value`;
  if (precision === "day") {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
      return `"${value}" is not a real calendar day`;
    }
  }
  if (precision === "month" && (Number(m[2]) < 1 || Number(m[2]) > 12)) return `"${value}" has no such month`;
  if (precision === "century") {
    const n = Number(m[1]);
    if (n < 1 || n > 21 || ordinal(n) !== value) return `"${value}" is not a valid century (use 19th, 20th …)`;
  }
  if ((precision === "day" || precision === "month" || precision === "year") && Number(m[1]) < 1000) {
    return `"${value}" is out of range (years 1000–2100)`;
  }
  return null;
}

/** First year covered by a value — used for sorting and decade grouping. */
export function startYear(value, precision) {
  if (precision === "unknown" || !value) return null;
  const m = RX[precision].exec(value);
  if (precision === "decade") return Number(m[1]) * 10;
  if (precision === "century") return (Number(m[1]) - 1) * 100 + 1;
  return Number(m[1]);
}

/** Sortable number: year*10000 + month*100 + day (unknown → null). */
export function sortKey(date) {
  if (!date || date.precision === "unknown") return null;
  const y = startYear(date.value, date.precision);
  const m = RX[date.precision === "day" ? "day" : date.precision === "month" ? "month" : "year"]?.exec(date.value);
  if (date.precision === "day") return y * 10000 + Number(m[2]) * 100 + Number(m[3]);
  if (date.precision === "month") return y * 10000 + Number(m[2]) * 100;
  return y * 10000;
}

function formatOne(value, precision) {
  const m = RX[precision].exec(value);
  switch (precision) {
    case "day": return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
    case "month": return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
    case "year": return m[1];
    case "decade": return value;
    case "century": return `${ordinal(Number(m[1]))} century`;
    default: return value;
  }
}

export const UNKNOWN_DATE_LABEL = "Date to be confirmed";

/** Human label, honouring precision, `circa`, and ranges. */
export function formatDate(date) {
  if (!date || date.precision === "unknown") return UNKNOWN_DATE_LABEL;
  const start = formatOne(date.value, date.precision);
  const prefix = date.circa ? "c. " : "";
  if (date.end) {
    const endPrecision = date.endPrecision ?? date.precision;
    return `${prefix}${start} – ${formatOne(date.end, endPrecision)}`;
  }
  return `${prefix}${start}`;
}

/** Decade (e.g. 1940) a dated entry belongs to, or null. */
export function decadeOf(date) {
  const y = date && startYear(date.value, date.precision);
  return y == null ? null : Math.floor(y / 10) * 10;
}

/** Machine-readable ISO-ish string for <time dateTime>; null when not representable. */
export function isoOf(date) {
  if (!date) return null;
  if (["day", "month", "year"].includes(date.precision)) return date.value;
  return null;
}
