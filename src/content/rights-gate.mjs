import { DISPLAYABLE_RIGHTS } from "./schema.mjs";

/**
 * The rights gate. One place decides whether a picture may be shown.
 *
 * An image renders only when ALL of these hold:
 *  - the record has an image file (self-hosted path, never a remote URL);
 *  - its rights status allows display (public-domain, cc, licensed, owned);
 *  - the record is not a draft.
 * Anything else (rights pending or unknown, withdrawn, a hold) shows a labelled
 * frame instead, and keeps the credit, licence and source visible.
 */
export function canShowImage(plate) {
  if (!plate?.image) return false;
  if (plate.status === "draft") return false;
  if (/^[a-z]+:\/\//i.test(plate.image.src)) return false; // never hotlink
  return DISPLAYABLE_RIGHTS.includes(plate.rights?.status);
}

/** Why an image is withheld, for the frame and for tests. null when it may be shown. */
export function withheldReason(plate) {
  if (canShowImage(plate)) return null;
  if (!plate.image) return plate.status === "placeholder" ? "Image to come" : "Rights check pending";
  return "Rights not cleared";
}

/**
 * Product use is stricter than editorial use: the image must be listed for
 * product use, sit in rights tier A, and be UK-safe (true or likely).
 */
export function canUseOnProduct(plate) {
  return (
    canShowImage(plate) &&
    (plate.useFor ?? []).includes("product") &&
    plate.rights?.tier === "A" &&
    ["true", "likely"].includes(plate.rights?.ukSafe)
  );
}
