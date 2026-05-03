# Kantor Uniwersalny

Static client-demo website prepared for GitHub Pages.

Recommended GitHub repository slug:

```text
Kantor-Uniwersalny
```

Expected GitHub Pages URL:

```text
https://Oskar-Urban.github.io/Kantor-Uniwersalny/
```

## Deployment

1. Create a GitHub repository named `Kantor-Uniwersalny` under `Oskar-Urban`.
2. Push this folder to the `main` branch.
3. In GitHub, open the repository settings.
4. Go to **Pages**.
5. Set **Source** to **Deploy from a branch**.
6. Set **Branch** to `main` and folder to `/ (root)`.
7. Save. GitHub Pages will publish `index.html` from the repository root.

## Structure

```text
.
├── index.html
├── assets/
│   └── images/
├── .gitignore
├── .nojekyll
└── README.md
```

All local image assets are referenced with relative paths, so the site works from a GitHub Pages project URL such as `/Kantor-Uniwersalny/`.
