const palette = Object.fromEntries(
	Array.from({ length: 12 }, (_, index) => {
		const step = index + 1;
		return [step, `rgb(var(--primary-${step}) / <alpha-value>)`];
	}),
);

export default {
	content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: palette,
			},
		},
	},
};
