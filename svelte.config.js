import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		prerender: {
			entries: ['*'],
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore missing static assets during prerender
				if (
					path.startsWith('/favicon') ||
					path.startsWith('/fontawesome') ||
					path.includes('-filings.json') ||
					path.includes('-history-5y.json') ||
					path.includes('-metrics.json') ||
					path.includes('-profile.json')
				) {
					console.warn(`Ignoring missing asset: ${path}`);
					return;
				}
				throw new Error(message);
			}
		}
	}
};

export default config;
