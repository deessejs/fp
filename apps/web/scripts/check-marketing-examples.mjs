import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = path.join(appRoot, 'src/components/marketing/examples.ts');
const source = await readFile(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { HERO_CODE, COMPARISON_EXAMPLES } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);
const snippets = [
  { id: 'hero', code: HERO_CODE },
  ...COMPARISON_EXAMPLES.flatMap((example) => [
    { id: `${example.id}-before`, code: example.before },
    { id: `${example.id}-after`, code: example.after },
  ]),
];
assert.equal(snippets.length, 7);
const files = new Map(
  snippets.map((snippet) => [
    path.join(appRoot, '.marketing-check', `${snippet.id}.ts`),
    `${snippet.code}\nexport {};\n`,
  ])
);
const options = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  paths: { '@deessejs/fp': [path.resolve(appRoot, '../../packages/fp/src/index.ts')] },
};

// Materialize the snippet files on disk so the TS program can
// resolve them. The host below still overrides `getSourceFile`
// to feed the in-memory code; the physical files are just
// placeholders that satisfy tsc's "file exists" check.
const { writeFile, mkdir } = await import('node:fs/promises');
await mkdir(path.join(appRoot, '.marketing-check'), { recursive: true });
await Promise.all(
  [...files.entries()].map(async ([filePath, code]) => {
    await writeFile(filePath, code);
  })
);
const host = ts.createCompilerHost(options);
const originalGetSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => {
  const code = files.get(filename);
  return code === undefined
    ? originalGetSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile)
    : ts.createSourceFile(filename, code, languageVersion, true);
};
const program = ts.createProgram([...files.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => appRoot,
      getCanonicalFileName: (name) => name,
      getNewLine: () => '\n',
    })
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Checked ${snippets.length} marketing snippets against the public FP API.\n`
  );
}
