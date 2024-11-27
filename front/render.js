const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');
const outputDir = path.join(__dirname, 'public/webconsole');

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
    return new nunjucks.runtime.SafeString(
      `<script src="${scriptPath}"></script>`
    );
  },
});


// 렌더링할 템플릿
const templates = [
  {
    file: 'index.njk',
    context: { title: 'Custom JavaScript Tag Example' }, // 템플릿에 전달할 데이터
    output: 'index.html',
  },
];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

templates.forEach(({ file, context, output }) => {
  try {
    const rendered = env.render(file, context);
    const outputPath = path.join(outputDir, output);
    fs.writeFileSync(outputPath, rendered, 'utf8');
    console.log(`\x1b[42m\x1b[30mRendered: ${outputPath}\x1b[0m`);
  } catch(e) {
    console.log(`\x1b[41m\x1b[33mRender FAIL file: ${templatesDir}/${file}\x1b[0m`);
    console.log(`\x1b[41m\x1b[33m${e}\x1b[0m`);
  }
});
