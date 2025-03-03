import type * as Preset from "@docusaurus/preset-classic"
import type { Config } from "@docusaurus/types"
import { themes as prismThemes } from "prism-react-renderer"

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const title = "FS Prober"
const siteUrl = "https://stacknide.github.io/fs-prober"
const repoUrl = "https://github.com/stacknide/fs-prober"
const meta = {
  description:
    "FS Prober extends react-dropzone by enabling detection of empty folders, including deeply nested ones. Fully compatible with react-dropzone, it leverages standard file system APIs for recursive directory traversals. Supports modern browsers.",
  siteUrl,
  socialCardUrl: `${siteUrl}/img/social-card.png`,
}
const config: Config = {
  title,
  tagline:
    "FS Prober helps you extract file and folder structures from user inputs or drag-and-drop events in browsers.",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://stacknide.github.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/fs-prober/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "stacknide", // Usually your GitHub org/user name.
  projectName: "fs-prober", // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: ["docusaurus-plugin-sass"],
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `${repoUrl}/tree/main/docs`,
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   feedOptions: {
        //     type: ["rss", "atom"],
        //     xslt: true,
        //   },
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl: `${repoUrl}/tree/main/docs`,
        //   // Useful options to enforce blogging best practices
        //   onInlineTags: "warn",
        //   onInlineAuthors: "warn",
        //   onUntruncatedBlogPosts: "warn",
        // },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.png",
    metadata: [
      { name: "robots", content: "max-image-preview:large" },
      { name: "description", content: meta.description },

      // Google / Search Engine Tags
      { itemprop: "name", content: title },
      { itemprop: "description", content: meta.description },
      { itemprop: "image", content: meta.socialCardUrl },

      // Open Graph / Facebook Meta Tags
      { property: "og:url", content: meta.siteUrl },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: meta.description },
      { property: "og:image", content: meta.socialCardUrl },

      // Twitter Meta Tags
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: meta.description },
      { name: "twitter:image", content: meta.socialCardUrl },
      { name: "twitter:image:alt", content: `${title} logo` },
    ],
    navbar: {
      title,
      logo: { alt: `${title} logo`, src: "img/logo.svg" },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Tutorial",
        },
        // { to: "/blog", label: "Blog", position: "left" },
        { href: repoUrl, label: "GitHub", position: "right" },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Introduction", to: "/docs/intro" },
            { label: "Usage Guide", to: "/docs/usage" },
          ],
        },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/stacknide',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'X',
        //       href: 'https://x.com/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: "More",
        //   items: [
        //     {
        //       label: "Blog",
        //       to: "/blog",
        //     },
        //   ],
        // },
        {
          title: "Links",
          items: [
            { label: "GitHub", href: repoUrl },
            { label: "@ashuvssut (Author)", href: "https://github.com/ashuvssut" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Stacknide.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
