const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const packageJsonPath = path.join(root, "package.json");
const originalText = fs.readFileSync(packageJsonPath, "utf8");
const packageJson = JSON.parse(originalText);
const version = packageJson.version || "0.0.0";

try {
  const vsixPackageJson = {
    ...packageJson,
    name: "coai"
  };
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(vsixPackageJson, null, 2)}\n`, "utf8");

  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vsce", "package", "--out", `coai-${version}.vsix`],
    {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32"
    }
  );

  if (result.status !== 0) {
    process.exitCode = result.status || 1;
  }
} finally {
  fs.writeFileSync(packageJsonPath, originalText, "utf8");
}
