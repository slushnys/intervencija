# GitHub Pages deployment

The website is static, but its Tailwind stylesheet is compiled before publishing. GitHub Actions builds a clean `dist/` directory and deploys only public website files.

## One-time publishing-source change

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

`intervencija.eu` is already the active custom domain. The workflow does not replace or reconfigure it. With a custom GitHub Actions workflow, GitHub uses the domain stored in the repository's Pages settings and ignores the artifact's `CNAME` file.

GitHub Pages manages the TLS certificate for the correctly configured custom domain. The existing HTTPS configuration remains in place when the publishing source changes. If **Enforce HTTPS** is enabled, GitHub also redirects HTTP requests to HTTPS.

## Continuous deployment

Every push to `main` now runs the following sequence:

1. Install the exact dependencies from `package-lock.json`.
2. Compile Tailwind CSS.
3. Build a clean `dist/` artifact.
4. Verify the source site and deployment artifact.
5. Deploy the artifact to GitHub Pages.

The workflow can also be run manually from the repository's **Actions** tab.

## Local verification

Run:

```sh
npm ci
npm run ci:pages
```

The generated `dist/` directory is ignored by Git. It is recreated for every build and should not be committed.
