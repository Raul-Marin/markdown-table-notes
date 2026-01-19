import esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/widget.tsx'],
  bundle: true,
  outfile: 'dist/widget.js',
  target: ['es2015'],
  format: 'cjs',
  jsx: 'transform',
  jsxFactory: 'figma.widget.h',
  jsxFragment: 'figma.widget.Fragment',
  minify: false,
  sourcemap: false,
  logLevel: 'info',
};

if (isWatch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete!');
}
