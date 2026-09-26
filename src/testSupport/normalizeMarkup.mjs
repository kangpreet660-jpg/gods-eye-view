/** Collapse inter-attribute whitespace so pins written against single-line
 *  markup survive the formatter's multi-line reflow. Whitespace OUTSIDE quoted
 *  attribute values is squeezed to a single space; whitespace INSIDE quoted
 *  attribute values is also collapsed to a single space; text content is left
 *  untouched. Quotes only delimit attribute values while inside a tag, so an
 *  apostrophe in text content (GOD'S EYE) never swallows the rest of the page. */
export function normalizeMarkup(html) {
  let out = '';
  let i = 0;
  let inTag = false;
  let inQuote = null;
  while (i < html.length) {
    const ch = html[i];
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
        out += ch;
      } else if (/\s/.test(ch)) {
        if (out && !/\s$/.test(out)) out += ' ';
      } else {
        out += ch;
      }
    } else if (inTag && (ch === '"' || ch === "'")) {
      inQuote = ch;
      out += ch;
    } else if (ch === '<') {
      inTag = true;
      out += ch;
    } else if (ch === '>') {
      inTag = false;
      out = out.replace(/\s+$/, '');
      out += ch;
    } else if (inTag && /\s/.test(ch)) {
      if (out && !/\s$/.test(out)) out += ' ';
    } else {
      out += ch;
    }
    i += 1;
  }
  return out;
}
