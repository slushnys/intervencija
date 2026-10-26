# GitHub Pages deployment

The website is static, but its Tailwind stylesheet is compiled before publishing. GitHub Actions builds a clean `dist/` directory and deploys only public website files.

## One-time publishing-source change

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Leave **Custom domain** set to `intervencija.eu`.
5. Enable **Enforce HTTPS** so HTTP visitors are redirected to `https://intervencija.eu/`.

This change has not been made yet. On 27 October 2026 every push to `main` still triggered two deployments: GitHub's built-in "pages build and deployment" from the branch, and this repository's workflow. The branch build was the one serving the site, so files such as `README.md` and `package.json` were publicly reachable and the verification gates did not protect production. `_config.yml` now limits the branch build to the same public files as `dist/`; switching the source to **GitHub Actions** makes the verified artifact the only deployment path, after which `_config.yml` can be deleted.

`intervencija.eu` is already the active custom domain. The workflow does not replace or reconfigure it. With a custom GitHub Actions workflow, GitHub uses the domain stored in the repository's Pages settings and ignores the artifact's `CNAME` file.

GitHub Pages manages the TLS certificate for the correctly configured custom domain. The existing HTTPS configuration remains in place when the publishing source changes. If **Enforce HTTPS** is enabled, GitHub also redirects HTTP requests to HTTPS.

Public checks on 9 September and 26 October 2026 found that both HTTP and HTTPS returned `200 OK`, with no HTTP-to-HTTPS redirect. HTTPS is available, but enforcement still needs to be enabled in the repository's Pages settings. The deployment workflow and `CNAME` file do not enable that setting. [GitHub's HTTPS instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

All canonical URLs, sitemap entries, and social-preview URLs use `https://intervencija.eu`. Source verification rejects an incorrect canonical URL before publication.

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
