/**
 * Post-install patch for react-native-confetti-cannon.
 * Fixes: "Cannot destructure property 'count' of 'this.props' as it is undefined"
 *
 * The library declares `props: Props;` as a Flow class field which overrides
 * `this.props` with `undefined` in newer React / bundler versions. This script
 * removes that declaration and adds `|| {}` guards on every `this.props` access.
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-native-confetti-cannon",
  "src",
  "index.js"
);

if (!fs.existsSync(filePath)) {
  console.log("[patch-confetti] Library not installed, skipping.");
  process.exit(0);
}

let src = fs.readFileSync(filePath, "utf8");

// 1. Remove the Flow `props: Props;` class field that shadows this.props
src = src.replace(/^  props: Props;\n/m, "");

// 2. Guard every `this.props` destructure (but not `this.props.` member access)
//    Replace `} = this.props;` with `} = this.props || {};`
src = src.replace(/\} = this\.props;/g, "} = this.props || {};");

// 3. Fix componentDidUpdate destructuring prevProps directly
src = src.replace(
  /componentDidUpdate = \(\{[^}]+\}: Props\) =>/,
  "componentDidUpdate = (prevProps) =>"
);

// If we changed componentDidUpdate, also need to fix the prevCount/prevColors references
// The original destructures { count: prevCount, colors: prevColors = DEFAULT_COLORS } from the param
// We need to do it from prevProps instead
if (src.includes("componentDidUpdate = (prevProps) =>")) {
  // Add destructuring from prevProps on the next line if not already present
  if (!src.includes("const { count: prevCount, colors: prevColors = DEFAULT_COLORS } = prevProps")) {
    src = src.replace(
      "componentDidUpdate = (prevProps) => {\n    const { count, colors = DEFAULT_COLORS } = this.props || {};",
      "componentDidUpdate = (prevProps) => {\n    const { count: prevCount, colors: prevColors = DEFAULT_COLORS } = prevProps || {};\n    const { count, colors = DEFAULT_COLORS } = this.props || {};"
    );
  }
}

fs.writeFileSync(filePath, src, "utf8");
console.log("[patch-confetti] Successfully patched react-native-confetti-cannon.");
