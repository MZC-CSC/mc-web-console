const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');
const outputDir = path.join(__dirname, 'public/webconsole');
const manifestPath = path.join(__dirname, 'public/assets/manifest.json');

let manifest = {};
try {
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } else {
    console.log(`\x1b[41m\x1b[33mManifest file not found:${manifestPath}\x1b[0m`);
  }
} catch (error) {
  console.log(`\x1b[41m\x1b[33mFailed to load manifest::${error}\x1b[0m`);
}

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatesDir), {
  autoescape: true,
});

env.addExtension('JavascriptTag', {
  tags: ['javascriptTag'],
  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  },
  run(context, scriptPath) {
    if (!scriptPath) {
      throw new Error('javascriptTag requires a path argument');
    }
    let resolvedPath = manifest[scriptPath];
    if (!resolvedPath) {
      console.log(`\x1b[41m\x1b[33mManifest error: No mapping found for JavaScript file "${scriptPath}"\x1b[0m`);
      resolvedPath = scriptPath;
    }
    return new nunjucks.runtime.SafeString(
      `<script src="${resolvedPath}"></script>`
    );
  },
});


env.addExtension('StylesheetTag', {
  tags: ['stylesheetTag'],
  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  },
  run(context, stylesheetPath) {
    if (!stylesheetPath) {
      throw new Error('stylesheetTag requires a path argument');
    }

    let resolvedPath = manifest[stylesheetPath];
    if (!resolvedPath) {
      console.log(`\x1b[41m\x1b[33mManifest error: No mapping found for stylesheet file "${stylesheetPath}"\x1b[0m`);
      resolvedPath = stylesheetPath;
    }

    return new nunjucks.runtime.SafeString(
      `<link rel="stylesheet" href="${resolvedPath}">`
    );
  },
});



// 재사용 가능한 함수: 디렉토리를 순회하며 파일 목록 가져오기
const getAllTemplateFiles = (dir) => {
  let files = [];
  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getAllTemplateFiles(fullPath));
    } else if (fullPath.endsWith('.html')) {
      files.push(fullPath);
    }
  });
  return files;
};

const templateFiles = getAllTemplateFiles(templatesDir+"/pages");
const templates = templateFiles.map((filePath) => {
  const relativePath = path.relative(templatesDir, filePath);
  return {
    file: relativePath,
    output: relativePath.replace(new RegExp(`^pages/`), ""),
  };
});

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

templates.forEach(({ file, output }) => {
  try {
    const rendered = env.render(file);
    const outputPath = path.join(outputDir, output);
    const outputDirPath = path.dirname(outputPath);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }
    fs.writeFileSync(outputPath, rendered, 'utf8');
    console.log(`\x1b[42m\x1b[30mRendered: ${outputPath}\x1b[0m`);
  } catch (e) {
    console.log(`\x1b[41m\x1b[33mRender FAIL file: ${templatesDir}/${file}\x1b[0m`);
    console.log(`\x1b[41m\x1b[33m${e}\x1b[0m`);
  }
});
