const { withPodfile } = require("@expo/config-plugins");

const POD_LINE = "  pod 'simdjson', :path => '../node_modules/@nozbe/simdjson'";

function addSimdjsonPod(contents) {
  if (contents.includes("pod 'simdjson'") || contents.includes('pod "simdjson"')) {
    return contents;
  }

  if (contents.includes("use_expo_modules!")) {
    return contents.replace("  use_expo_modules!\n", `  use_expo_modules!\n${POD_LINE}\n`);
  }

  return contents.replace(/(target ['"].+['"] do\n)/, `$1${POD_LINE}\n`);
}

module.exports = function withWatermelonDBSimdjson(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = addSimdjsonPod(config.modResults.contents);
    return config;
  });
};
