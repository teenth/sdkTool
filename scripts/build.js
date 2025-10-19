const { execSync } = require("child_process");
const fs = require("fs");

console.log("🚀 Building SDK...");

const outputDir = "dist";

// 清理输出目录
if (fs.existsSync(outputDir)) {
  try {
    fs.rmSync(outputDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(
      `⚠️  Unable to remove existing ${outputDir} directory, continuing...`
    );
  }
}

try {
  // 编译TypeScript到dist目录
  console.log("📦 Compiling TypeScript...");
  execSync(`npx tsc --outDir ${outputDir}`, { stdio: "inherit" });

  // 复制package.json到输出目录
  console.log("📋 Copying package.json...");
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  // 创建发布用的package.json
  const distPackageJson = {
    ...packageJson,
    main: "index.js",
    types: "index.d.ts",
    // 保留exports字段，但更新路径
    exports: {
      ".": {
        browser: "./browser.js",
        node: "./index.js",
        default: "./index.js",
      },
      "./browser": "./browser.js",
      "./node": "./index.js",
      "./react": "./react.js",
    },
    scripts: undefined,
    devDependencies: undefined,
  };

  fs.writeFileSync(
    `${outputDir}/package.json`,
    JSON.stringify(distPackageJson, null, 2)
  );

  // 复制README.md
  console.log("📄 Copying README.md...");
  if (fs.existsSync("README.md")) {
    fs.copyFileSync("README.md", `${outputDir}/README.md`);
  }

  console.log("✅ Build completed successfully!");
  console.log(`📁 Files generated in ./${outputDir} directory`);
  console.log("🌐 Browser version: browser.js");
  console.log("🖥️  Node.js version: index.js");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
