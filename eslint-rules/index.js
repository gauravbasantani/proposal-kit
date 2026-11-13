// proposal-kit ESLint plugin. One rule per costly mistake. Each rule maps to exactly one
// mistake type in the eval (see evals/README.md):
//   no-raw-currency         -> type 1  price typed as a string instead of <Money>
//   payment-needs-terms     -> type 2  monthly payment shown without <PaymentLine> (APR and term)
//   tokens-only             -> type 3  hex, rgb, px or a non-token color instead of a token
//   savings-needs-estimate  -> type 4  savings shown without <SavingsEstimate> ("Estimated" + assumptions)
//   no-color-only-status    -> type 5  a status dot with no words (color alone)

// ---------- helpers ----------

function isInImport(node) {
  let n = node.parent;
  while (n) {
    if (n.type === "ImportDeclaration" || n.type === "ExportAllDeclaration" || n.type === "ExportNamedDeclaration" && n.source) return true;
    n = n.parent;
  }
  return false;
}

function isInsideJsx(node) {
  let n = node.parent;
  while (n) {
    if (n.type === "JSXElement" || n.type === "JSXFragment") return true;
    n = n.parent;
  }
  return false;
}

/** True for strings that are attribute values such as className or data-slot (not visible text). */
function isNonTextAttribute(node) {
  let n = node.parent;
  while (n && n.type !== "JSXElement") {
    if (n.type === "JSXAttribute") {
      const name = n.name && n.name.name;
      return !(name === "aria-label" || name === "title" || name === "label" || name === "alt");
    }
    n = n.parent;
  }
  return false;
}

function jsxName(nameNode) {
  if (!nameNode) return "";
  if (nameNode.type === "JSXIdentifier") return nameNode.name;
  if (nameNode.type === "JSXMemberExpression") return `${jsxName(nameNode.object)}.${jsxName(nameNode.property)}`;
  return "";
}

/** True if the file renders <Name ...> anywhere. */
function fileRenders(sourceCode, name) {
  let found = false;
  const visit = (node) => {
    if (found || !node || typeof node.type !== "string") return;
    if (node.type === "JSXOpeningElement" && jsxName(node.name).split(".").pop() === name) {
      found = true;
      return;
    }
    for (const key of sourceCode.visitorKeys[node.type] || []) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    }
  };
  visit(sourceCode.ast);
  return found;
}

function stringValue(node) {
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateElement") return node.value.cooked ?? node.value.raw;
  if (node.type === "JSXText") return node.value;
  return null;
}

// ---------- type 1: no-raw-currency ----------

const MONEY_TEXT = /\$\s?\d/;

const noRawCurrency = {
  meta: {
    type: "problem",
    docs: { description: "Prices, payments and savings must render through <Money cents={...} />, never as typed currency strings." },
    messages: {
      text: "Raw currency \"{{text}}\". Render amounts with <Money cents={...} /> so formatting and rounding match the rest of the proposal.",
      dollarBeforeValue: "A \"$\" typed next to a value. Use <Money cents={...} /> instead of building currency text by hand.",
      intl: "Currency formatting outside Money. Use <Money cents={...} /> (or formatMoney from @/components/Money).",
    },
    schema: [],
  },
  create(context) {
    const report = (node, messageId, text) =>
      context.report({ node, messageId, data: { text: (text || "").trim().slice(0, 40) } });

    return {
      JSXText(node) {
        if (MONEY_TEXT.test(node.value)) return report(node, "text", node.value);
        // "$" at the end of a text node followed by {value}:  <p>${price}</p>
        if (/\$\s*$/.test(node.value)) {
          const siblings = node.parent && node.parent.children ? node.parent.children : [];
          const next = siblings[siblings.indexOf(node) + 1];
          if (next && next.type === "JSXExpressionContainer") report(node, "dollarBeforeValue");
        }
      },
      Literal(node) {
        if (typeof node.value !== "string" || isInImport(node)) return;
        if (MONEY_TEXT.test(node.value)) return report(node, "text", node.value);
        if (/^\s*\$\s*$/.test(node.value) && isInsideJsx(node)) report(node, "dollarBeforeValue");
      },
      TemplateLiteral(node) {
        node.quasis.forEach((q, i) => {
          const text = q.value.cooked ?? q.value.raw;
          if (MONEY_TEXT.test(text)) report(q, "text", text);
          else if (/\$\s*$/.test(text) && i < node.expressions.length) report(q, "dollarBeforeValue");
        });
      },
      NewExpression(node) {
        const callee = node.callee;
        const isIntl =
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "Intl" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "NumberFormat";
        if (isIntl && hasCurrencyOption(node.arguments)) report(node, "intl");
      },
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
          const name = callee.property.name;
          if (name === "toLocaleString" && hasCurrencyOption(node.arguments)) report(node, "intl");
          // Intl.NumberFormat(...) without new
          if (name === "NumberFormat" && callee.object.type === "Identifier" && callee.object.name === "Intl" && hasCurrencyOption(node.arguments)) {
            report(node, "intl");
          }
        }
      },
    };
  },
};

function hasCurrencyOption(args) {
  return args.some(
    (a) =>
      a.type === "ObjectExpression" &&
      a.properties.some(
        (p) =>
          p.type === "Property" &&
          ((p.key.type === "Identifier" && p.key.name === "style") || (p.key.type === "Literal" && p.key.value === "style")) &&
          p.value.type === "Literal" &&
          p.value.value === "currency",
      ),
  );
}

// ---------- type 2: payment-needs-terms ----------

const PAYMENT_TEXT = /\/\s?mo\b|\/\s?month\b|\bper month\b|\ba month\b|\bmonthly\b|\bmo\.?\s*$/i;

const paymentNeedsTerms = {
  meta: {
    type: "problem",
    docs: { description: "A monthly payment is shown only through <PaymentLine>, which requires apr and termMonths." },
    messages: {
      bare: "Monthly payment text \"{{text}}\" without <PaymentLine>. A payment must show its APR and term; use <PaymentLine monthlyCents apr termMonths />.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const hits = [];
    const consider = (node) => {
      const text = stringValue(node);
      if (!text || !PAYMENT_TEXT.test(text) || /sav/i.test(text)) return;
      if (node.type !== "JSXText" && (!isInsideJsx(node) || isNonTextAttribute(node))) return;
      hits.push({ node, text });
    };
    return {
      JSXText: consider,
      Literal: consider,
      TemplateElement: consider,
      "Program:exit"() {
        if (hits.length === 0 || fileRenders(sourceCode, "PaymentLine")) return;
        for (const { node, text } of hits) {
          context.report({ node, messageId: "bare", data: { text: text.trim().slice(0, 40) } });
        }
      },
    };
  },
};

// ---------- type 3: tokens-only ----------

const PALETTE =
  /\b(?:bg|text|border(?:-[trblxy])?|ring|ring-offset|fill|stroke|from|via|to|outline|divide|decoration|shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const PLAIN_BW = /(?:^|\s|:)(?:bg|text|border|ring|fill|stroke)-(?:white|black)(?:\/\d+)?(?=\s|$)/;
const ARBITRARY = /-\[(?:[^\]]*(?:#|\d(?:\.\d+)?px|rgb|hsl|oklch))[^\]]*\]/i;
const HEX_ANY = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const HEX_WHOLE = /^\s*#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\s*$/i;
const PX = /\b\d+(?:\.\d+)?px\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/i;
const SIZE_KEYS =
  /^(?:width|height|min(?:Width|Height)|max(?:Width|Height)|padding\w*|margin\w*|gap|rowGap|columnGap|top|right|bottom|left|inset\w*|fontSize|letterSpacing|borderRadius|border\w*Width|borderWidth|outlineWidth|outlineOffset|flexBasis)$/;
const COLOR_KEYS = /color|background|border(?!.*(?:width|radius|style))|fill|stroke|shadow|outline(?!.*(?:width|offset|style))/i;

function inStyleOrClassContext(node) {
  let n = node.parent;
  while (n) {
    if (n.type === "JSXAttribute") {
      const name = n.name && n.name.name;
      return name === "className" || name === "class" || name === "style";
    }
    if (n.type === "Property" && n.key && (n.key.name || n.key.value)) {
      const key = String(n.key.name || n.key.value);
      if (COLOR_KEYS.test(key) || SIZE_KEYS.test(key)) return true;
    }
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && /^(?:cn|clsx|cva|twMerge|classNames)$/.test(n.callee.name)) return true;
    n = n.parent;
  }
  return false;
}

const tokensOnly = {
  meta: {
    type: "problem",
    docs: { description: "Colors and sizes come from tokens (src/styles/tokens.css) and the Tailwind classes mapped to them." },
    messages: {
      palette: "Tailwind palette class \"{{text}}\" is not a token. Use bg-card, text-foreground, text-muted-foreground, bg-success, bg-estimate and the other token classes.",
      arbitrary: "Arbitrary value \"{{text}}\" hardcodes a color or px size. Use a token class.",
      hex: "Hardcoded color \"{{text}}\". Use a token (they switch for dark mode).",
      px: "Hardcoded px value \"{{text}}\". Use the spacing, type and radius tokens.",
      styleNumber: "Inline style {{text}} is a px value. Use token classes instead.",
    },
    schema: [],
  },
  create(context) {
    const check = (node) => {
      if (isInImport(node)) return;
      const text = stringValue(node);
      if (text == null) return;
      if (node.type === "JSXText") return; // prose on screen is not styling
      const m1 = text.match(PALETTE);
      if (m1) return context.report({ node, messageId: "palette", data: { text: m1[0] } });
      const m1b = text.match(PLAIN_BW);
      if (m1b) return context.report({ node, messageId: "palette", data: { text: m1b[0].trim() } });
      const m2 = text.match(ARBITRARY);
      if (m2) return context.report({ node, messageId: "arbitrary", data: { text: m2[0] } });
      const styled = inStyleOrClassContext(node);
      if (HEX_WHOLE.test(text) || (styled && HEX_ANY.test(text))) {
        return context.report({ node, messageId: "hex", data: { text: text.match(HEX_ANY)[0] } });
      }
      if (styled && COLOR_FN.test(text)) return context.report({ node, messageId: "hex", data: { text: text.trim().slice(0, 30) } });
      const px = text.match(PX);
      if (px && (styled || /^\s*\d+(?:\.\d+)?px\s*$/.test(text))) {
        return context.report({ node, messageId: "px", data: { text: px[0] } });
      }
    };
    return {
      Literal: check,
      TemplateElement: check,
      // style={{ padding: 16 }} is 16px
      "JSXAttribute[name.name='style'] Property"(node) {
        const key = node.key && (node.key.name || node.key.value);
        if (key && SIZE_KEYS.test(String(key)) && node.value.type === "Literal" && typeof node.value.value === "number" && node.value.value !== 0) {
          context.report({ node: node.value, messageId: "styleNumber", data: { text: `${key}: ${node.value.value}` } });
        }
      },
    };
  },
};

// ---------- type 4: savings-needs-estimate ----------

const SAVINGS_TEXT = /\bsavings?\b|\byou(?:'ll| will)? save\b|\bsave (?:about|around|up to|an estimated|over|\$)/i;

const savingsNeedsEstimate = {
  meta: {
    type: "problem",
    docs: { description: "Savings are shown only through <SavingsEstimate>, which always says Estimated and prints its assumptions." },
    messages: {
      bare: "Savings text \"{{text}}\" without <SavingsEstimate>. Savings must say \"Estimated\" and print the rate, yearly increase and years; use <SavingsEstimate assumptions={...} />.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const hits = [];
    const consider = (node) => {
      const text = stringValue(node);
      if (!text || !SAVINGS_TEXT.test(text)) return;
      if (node.type !== "JSXText" && (!isInsideJsx(node) || isNonTextAttribute(node))) return;
      hits.push({ node, text });
    };
    return {
      JSXText: consider,
      Literal: consider,
      TemplateElement: consider,
      "Program:exit"() {
        if (hits.length === 0 || fileRenders(sourceCode, "SavingsEstimate")) return;
        for (const { node, text } of hits) {
          context.report({ node, messageId: "bare", data: { text: text.trim().slice(0, 40) } });
        }
      },
    };
  },
};

// ---------- type 5: no-color-only-status ----------

const noColorOnlyStatus = {
  meta: {
    type: "problem",
    docs: { description: "A status must be readable without color: no empty colored dots or chips without words." },
    messages: {
      dot: "This element shows a status by color alone (an empty colored shape). Add words, for example <Badge variant=\"success\"><CheckCircle2 aria-hidden />Ready to sign</Badge>.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXElement(node) {
        const meaningful = node.children.filter((c) => !(c.type === "JSXText" && c.value.trim() === ""));
        if (meaningful.length > 0) return;
        const attrs = node.openingElement.attributes.filter((a) => a.type === "JSXAttribute");
        const names = new Set(attrs.map((a) => a.name && a.name.name));
        if (names.has("aria-label") || names.has("aria-labelledby") || names.has("title") || names.has("alt")) return;
        const cls = attrs.find((a) => a.name && a.name.name === "className");
        if (!cls || !cls.value) return;
        let text = "";
        if (cls.value.type === "Literal") text = String(cls.value.value);
        else if (cls.value.type === "JSXExpressionContainer") text = context.sourceCode.getText(cls.value.expression);
        if (/\brounded-full\b/.test(text) && /\bbg-(?!transparent\b)[a-z]/.test(text) && /\b(?:size|h|w)-(?:1|1\.5|2|2\.5|3|3\.5|4)\b/.test(text)) {
          context.report({ node: node.openingElement, messageId: "dot" });
        }
      },
    };
  },
};

export default {
  meta: { name: "proposal-kit", version: "0.1.0" },
  rules: {
    "no-raw-currency": noRawCurrency,
    "payment-needs-terms": paymentNeedsTerms,
    "tokens-only": tokensOnly,
    "savings-needs-estimate": savingsNeedsEstimate,
    "no-color-only-status": noColorOnlyStatus,
  },
};
