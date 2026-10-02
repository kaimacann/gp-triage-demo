# GP Triage Demo

A standalone static triage demo, moved out of Terra Symposium Docs. It includes the GP assessment, nurse intake, and ambulance dispatch workflows and can be run locally or hosted independently on Netlify.

Live demo: <https://gp-triage-demo.netlify.app>

## Run locally

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Astro. Run `pnpm check` for type and Astro diagnostics, and `pnpm build` to create the static site in `dist/`.

## Netlify

The site is configured for Netlify in `netlify.toml`. Connect this repository to Netlify and use the included build command (`pnpm build`) and publish directory (`dist`). No runtime secrets or server functions are required.

## Demo behavior

This is a simulation, not a clinical service. The forms do not send information to a server or dispatch service. Nurse intake adds a limited mock patient record to the browser's `terra-patients` local storage key, which is also read by the ambulance dispatch queue. Other entered fields remain in page memory.

The original general triage workflow is available at `/wireframes`, with a dedicated nurse intake at `/nurse` and the shared queue at `/ambulance`.

Do not enter real patient information.

## License

MIT. See [LICENSE](LICENSE).
