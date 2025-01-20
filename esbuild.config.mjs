import builtins from 'builtin-modules';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import process from 'process';
import { sveltePreprocess } from 'svelte-preprocess';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
	plugins: [
		esbuildSvelte({
			compilerOptions: { css: 'injected' },
			preprocess: sveltePreprocess()
		})
	],
	entryPoints: ['src/main.ts'],
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins
	],
	format: 'cjs',
	target: 'es2018',
	logLevel: 'info',
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
	minify: prod
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
