const { mkdtempSync, readdirSync, rmSync, cpSync, readFileSync, writeFileSync } = require("fs");
const { tmpdir } = require("os");
const { join, resolve } = require("path");
const { spawnSync } = require("child_process");

const root = resolve(__dirname, "..");
const tempRoot = mkdtempSync(join(tmpdir(), "coai-pack-"));
const packageRoot = join(tempRoot, "package");

function copyIntoPackage(relativePath) {
  cpSync(join(root, relativePath), join(packageRoot, relativePath), { recursive: true });
}

for (const entry of readdirSync(root)) {
  if (entry.endsWith(".tgz")) {
    rmSync(join(root, entry), { force: true });
  }
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const npmPackageJson = {
  ...packageJson,
  name: "@5dc/coai"
};

try {
  copyIntoPackage("out");
  copyIntoPackage("template");
  copyIntoPackage("skills/coai");
  copyIntoPackage("assets/c5dc.png");
  copyIntoPackage("README.md");
  copyIntoPackage("README_zh.md");
  copyIntoPackage("CHANGELOG.md");
  copyIntoPackage("LICENSE");
  writeFileSync(join(packageRoot, "package.json"), `${JSON.stringify(npmPackageJson, null, 2)}\n`, "utf8");

  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["pack", packageRoot, "--pack-destination", root],
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
  rmSync(tempRoot, { recursive: true, force: true });
}
