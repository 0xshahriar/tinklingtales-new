import { APP_CONFIG, FALLBACK_IMAGE } from "./constants.js";

function upsertMeta(attribute, key, value) {
  if (!value) return;
  let meta = document.querySelector(`meta[${attribute}='${key}']`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", value);
}

function upsertLink(rel, href) {
  if (!href) return;
  let link = document.querySelector(`link[rel='${rel}']`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export function applySeoMetadata() {
  const { dataset } = document.body;
  const existingTitle = document.title?.trim();
  const pageTitle = dataset.seoTitle || existingTitle || APP_CONFIG.siteName;
  if (pageTitle !== existingTitle) {
    document.title = pageTitle;
  }

  const descriptionMeta = document.querySelector("meta[name='description']");
  const description =
    dataset.seoDescription || descriptionMeta?.getAttribute("content") ||
    "Discover handcrafted premade and custom bangles from Tinkling Tales in Dhaka.";

  if (descriptionMeta) {
    descriptionMeta.setAttribute("content", description);
  } else {
    upsertMeta("name", "description", description);
  }

  const defaultKeywords = "tinkling tales, bangles bangladesh, custom jewellery dhaka, handcrafted bangles";
  const keywords = dataset.seoKeywords || document.querySelector("meta[name='keywords']")?.getAttribute("content") || defaultKeywords;
  upsertMeta("name", "keywords", keywords);

  const robots = dataset.seoRobots || "index, follow";
  upsertMeta("name", "robots", robots);

  const cleanBaseUrl = APP_CONFIG.siteUrl.replace(/\/$/, "");
  const pagePath = window.location.pathname
    .replace(/^\//, "")
    .replace(/index\.html$/, "");
  const canonicalUrl = pagePath ? `${cleanBaseUrl}/${pagePath}` : `${cleanBaseUrl}/`;
  upsertLink("canonical", canonicalUrl);

  const image =
    dataset.seoImage ||
    document.querySelector("meta[property='og:image']")?.getAttribute("content") ||
    FALLBACK_IMAGE;

  upsertMeta("property", "og:title", pageTitle);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:url", canonicalUrl);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:site_name", APP_CONFIG.siteName);

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", pageTitle);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);
}
