import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from "rollup-plugin-visualizer";
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

export default defineConfig({
	plugins: [
		sveltekit(),
		purgeCss(),
		chunkSplitPlugin(),
		visualizer({
			emitFile: true,
			filename: "stats.html",
		})
	]
});
