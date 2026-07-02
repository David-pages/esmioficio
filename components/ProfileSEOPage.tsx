import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SEOHelmet from './SEOHelmet';
import { Professional, User, Review } from '../types';
import ProfileView from './ProfileView';
import { getProfileSlug, getProfileUrl } from '../lib/profileUrl';

interface ProfileSEOPageProps {
  professionals: Professional[];
  isLoading?: boolean;
  onBack: () => void;
  onContact: (pro: Professional) => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>, professionalId: string) => Promise<boolean>;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  currentUser: User | null;
  favorites: string[];
  onToggleFavorite: (proId: string) => void;
  onShare: (message: string) => void;
  onUpdateProfile?: (updatedPro: Professional) => Promise<boolean> | boolean;
  onHire: (proId: string) => void;
  onRequestTracking?: (proId: string) => void;
  serviceRequest?: any; 
  onRequestQuote?: (proId: string, details?: string) => void;
  onAcceptQuote?: (requestId: string, amount: string) => void;
  onConfirmService?: (requestId: string) => void;
  onCompleteService?: (requestId: string) => void;
  incomingRequests?: any[];
}

const ProfileSEOPage: React.FC<ProfileSEOPageProps> = (props) => {
  const { slug } = useParams<{ slug: string }>(); // ej: juan-perez-plomeria-morelia
  // Encontrar al profesional basado en el slug. 
  // Asumimos que el slug se genera combinando: nombre-oficio-ciudad
  const professional = props.professionals.find(p => {
    return getProfileSlug(p) === slug;
  });

  if (!professional) {
    if (props.isLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-bold text-gray-400">Cargando perfil...</p>
          </div>
        </div>
      );
    }
    return <Navigate to="/buscar" />;
  }

  const title = `${professional.name} - ${professional.trade} en ${professional.municipality} | EsMiOficio`;
  const description = `${professional.description.substring(0, 150)}... Contacta a ${professional.name}, ${professional.trade} con ${professional.yearsExperience} años de experiencia en ${professional.municipality}, ${professional.state}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${getProfileUrl(professional)}#professional-service`,
    "url": getProfileUrl(professional),
    "name": professional.name,
    "image": [
      professional.imageUrl,
      ...(professional.portfolioImages || [])
    ],
    "description": professional.description,
    "serviceType": professional.services?.length ? professional.services : [professional.trade],
    "areaServed": professional.coverageZones?.length
      ? professional.coverageZones.map(name => ({ "@type": "AdministrativeArea", name }))
      : [{ "@type": "Country", "name": "México" }],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": professional.municipality,
      "addressRegion": professional.state,
      "addressCountry": "MX"
    },
    "aggregateRating": professional.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": professional.rating.toString(),
      "reviewCount": professional.reviews.toString()
    } : undefined
  };

  return (
    <>
      <SEOHelmet 
        title={title} 
        description={description}
        canonicalUrl={getProfileUrl(professional)}
        type="profile"
        jsonLd={jsonLd}
      />
      <ProfileView 
        {...props} 
        professional={professional} 
        serviceRequest={props.serviceRequest?.professional_id === professional.id ? props.serviceRequest : undefined}
        isFavorite={props.favorites.includes(professional.id)}
        onToggleFavorite={() => props.onToggleFavorite(professional.id)}
      />
    </>
  );
};

export default ProfileSEOPage;
