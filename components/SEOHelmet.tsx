import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getAbsoluteUrl } from '../lib/siteUrl';

interface SEOHelmetProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  type?: string;
  imageUrl?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title,
  description = 'Encuentra y compara profesionales de oficio en Mexico por estado, municipio, resenas, experiencia y verificacion.',
  canonicalUrl,
  type = 'website',
  imageUrl = getAbsoluteUrl('/og-image.svg'),
  jsonLd,
  noindex = false
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#121212" />
      <meta name="color-scheme" content="dark" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:locale" content="es_MX" />
      <meta property="og:site_name" content="EsMiOficio Mexico" />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={`${title} - EsMiOficio`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta property="twitter:url" content={canonicalUrl} />}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}

      {/* JSON-LD Schema */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHelmet;
