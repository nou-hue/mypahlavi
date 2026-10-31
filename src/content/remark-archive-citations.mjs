import { CITE_TOKEN, idsOfToken } from "./citations.mjs";

/**
 * remark plugin: turns `[@id]` / `[@id; @id2]` tokens in a markdown tree into
 * `archiveCitation` nodes ({ ids: string[] }), and records every use.
 *
 *   unified().use(remarkParse).use(remarkArchiveCitations, { sourceIds, onError })
 *
 * An unknown source id is an error. The default `onError` throws, so an
 * import (and therefore the build) fails; pass your own to collect problems.
 * Tokens inside code are left alone.
 */
export function remarkArchiveCitations(options = {}) {
  const known = options.sourceIds instanceof Set ? options.sourceIds : new Set(options.sourceIds ?? []);
  const onError =
    options.onError ??
    ((msg) => {
      throw new Error(msg);
    });
  const uses = options.uses ?? [];

  const walk = (node, file) => {
    if (!node.children || node.type === "code" || node.type === "inlineCode") return;
    const next = [];
    for (const child of node.children) {
      if (child.type !== "text") {
        walk(child, file);
        next.push(child);
        continue;
      }
      let last = 0;
      const value = child.value;
      for (const m of value.matchAll(CITE_TOKEN)) {
        if (m.index > last) next.push({ type: "text", value: value.slice(last, m.index) });
        const ids = idsOfToken(m[1]);
        for (const id of ids) {
          if (!known.has(id)) {
            const line = child.position?.start?.line;
            onError(`unknown citation [@${id}]${line ? ` at line ${line}` : ""}`);
          } else {
            uses.push(id);
          }
        }
        next.push({ type: "archiveCitation", ids });
        last = m.index + m[0].length;
      }
      if (last === 0) next.push(child);
      else if (last < value.length) next.push({ type: "text", value: value.slice(last) });
    }
    node.children = next;
  };

  return (tree, file) => {
    walk(tree, file);
  };
}
