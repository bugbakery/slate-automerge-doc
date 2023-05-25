const chokidar = require("chokidar");
const esbuild = require("esbuild");
const glob = require("fast-glob");
const { Project } = require("ts-morph");

async function build(filePattern) {
  const outDir = "lib";
  const files = await glob(filePattern);

  const tsProject = new Project({
    compilerOptions: { outDir, emitDeclarationOnly: true },
    tsConfigFilePath: "./tsconfig.json",
    skipAddingFilesFromTsConfig: true,
  });
  tsProject.addSourceFilesAtPaths(files);
  await tsProject.emit();

  await esbuild.build({
    entryPoints: files,
    outdir: outDir,
    format: "esm",
    sourcemap: true,
  });
}

function watch(filePattern) {
  chokidar.watch(filePattern).on("change", async (file) => {
    try {
      console.log("file changed:", file);
      await build(filePattern);
    } catch {
      // nevermind, errors are logged by esbuild
    }
  });
}

async function run() {
  const watchMode = process.argv.includes("--watch");
  const filePattern = "src/**/*.ts";

  await build(filePattern).catch(() => {
    if (!watchMode) {
      process.exit(1);
    }
  });

  if (watchMode) {
    watch(filePattern);
  }
}

run();
