const trimTrailingSlash = (value: string) => value.trim().replace(/\/+$/, '');

export const getSiteUrl = () => {
  const envSiteUrl = import.meta.env.VITE_SITE_URL;
  if (envSiteUrl && envSiteUrl.trim()) return trimTrailingSlash(envSiteUrl);

  if (typeof window !== 'undefined' && window.location.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return 'https://esmioficio.mx';
};

export const getPasswordRecoveryRedirectUrl = () => `${getSiteUrl()}/update-password`;
