import { useEffect } from "react";
import useTenant from "../../hooks/useTenant";

export default function SiteIdentityEffects() {
  const { activeTenant } = useTenant();
  useEffect(() => {
    const branding = (activeTenant as typeof activeTenant & { branding?: Record<string, string> } | null)?.branding;
    if (!branding) return;
    if (branding.seoTitle) document.title = branding.seoTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description && branding.seoDescription) description.setAttribute("content", branding.seoDescription);
    if (branding.faviconUrl) {
      let icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; document.head.appendChild(icon); }
      icon.href = branding.faviconUrl;
    }
    if (branding.primaryColor) document.documentElement.style.setProperty("--brand-primary", branding.primaryColor);
    if (branding.secondaryColor) document.documentElement.style.setProperty("--brand-secondary", branding.secondaryColor);
    if (branding.accentColor) document.documentElement.style.setProperty("--brand-accent", branding.accentColor);
  }, [activeTenant]);
  return null;
}
