function isEnabledFlag(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function hasSafeGraphicsArgument(argv) {
  return Array.isArray(argv) && argv.includes("--libai-safe-graphics");
}

function configureGraphicsCompatibility(appInstance, options = {}) {
  const platform = options.platform || process.platform;
  const env = options.env || process.env;
  const argv = options.argv || process.argv;

  if (platform !== "win32") {
    return { enabled: false, reason: "non-windows" };
  }

  if (isEnabledFlag(env.LIBAI_DISABLE_SAFE_GRAPHICS)) {
    return { enabled: false, reason: "disabled-by-env" };
  }

  if (!isEnabledFlag(env.LIBAI_SAFE_GRAPHICS) && !hasSafeGraphicsArgument(argv)) {
    return { enabled: false, reason: "not-requested" };
  }

  appInstance?.commandLine?.appendSwitch?.("disable-features", "DirectComposition");
  appInstance?.disableHardwareAcceleration?.();
  return { enabled: true, reason: "windows-safe-graphics" };
}

module.exports = {
  configureGraphicsCompatibility,
};
