# GP Triage Demo

A standalone static demo of the GP triage wireframe from Terra Symposium. It is built with Astro and React and can be run locally or hosted independently on Netlify.

## Run locally

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Astro. Run `pnpm check` for type and Astro diagnostics, and `pnpm build` to create the static site in `dist/`.

## Netlify

The site is configured for Netlify in `netlify.toml`. Connect this repository to Netlify and use the included build command (`pnpm build`) and publish directory (`dist`). No runtime secrets or server functions are required.

## Demo behavior

This is a wireframe demo, not a clinical service. The form does not send information to a server or dispatch service. On submission, the demo shows its existing confirmation alert and saves a limited mock patient record in the browser's `terra-patients` local storage key; the other entered fields remain in page memory.

Do not enter real patient information.

## License

MIT. See [LICENSE](LICENSE).
