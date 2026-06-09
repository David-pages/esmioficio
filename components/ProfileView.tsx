
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Professional, Review, User } from '../types';
import { MEXICO_LOCATIONS, TRADES } from '../constants';
import { supabase } from '../lib/supabaseClient';
import ImageLightbox from './ImageLightbox'; // Importar Lightbox
import StarRating from './StarRating';
import TrustSignal from './TrustSignal';
import RecentWorks from './RecentWorks';
import { compressImageToWebP, getLastActiveText, getVerificationCopy } from '../lib/trust';

interface ProfileViewProps {
  professional: Professional;
  onBack: () => void;
  onContact: (pro: Professional) => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>, professionalId: string) => Promise<boolean>;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  currentUser: User | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
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

const PROFILE_IMAGES_BUCKET = 'professional-images';

const getUniqueUploadId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getStorageUploadErrorMessage = (error: any, label: string) => {
  const message = String(error?.message || '');
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('bucket') || lowerMessage.includes('not found')) {
    return `No existe el bucket "${PROFILE_IMAGES_BUCKET}" para subir ${label}. Aplica el SQL de Storage.`;
  }

  if (lowerMessage.includes('row-level security') || error?.statusCode === '403' || error?.code === '42501') {
    return `Supabase bloqueo la subida de ${label}. Revisa la politica RLS del bucket "${PROFILE_IMAGES_BUCKET}".`;
  }

  return message || `No pudimos subir ${label}. Intenta de nuevo.`;
};

const ProfileView: React.FC<ProfileViewProps> = ({ 
  professional, 
  onBack, 
  onContact, 
  onAddReview,
  isLoggedIn,
  onLoginRequest,
  currentUser,
  isFavorite,
  onToggleFavorite,
  onShare,
  onUpdateProfile,
  onHire,
  onRequestTracking,
  serviceRequest,
  onRequestQuote,
  onAcceptQuote,
  onConfirmService,
  onCompleteService,
  incomingRequests = []
}) => {
  const [reviewForm, setReviewForm] = useState<{ rating: number; text: string; images: string[] }>({ 
    rating: 5, 
    text: '', 
    images: [] 
  });
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [pendingImageFiles, setPendingImageFiles] = useState<Partial<Record<'imageUrl' | 'coverImageUrl', File>>>({});
  
  // Sorting State
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PHOTOS' | 'FIVE' | 'FOUR' | 'LOW'>('ALL');
  const [visibleReviewCount, setVisibleReviewCount] = useState(4);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Professional>(professional);
  const [stateIdForEdit, setStateIdForEdit] = useState('');

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [hasHired, setHasHired] = useState(false);
  const [availability, setAvailability] = useState<'Disponible hoy' | 'Esta semana' | 'Agenda llena'>(() => {
    return (localStorage.getItem(`esmiOficio_availability_${professional.id}`) as 'Disponible hoy' | 'Esta semana' | 'Agenda llena') || 'Esta semana';
  });
  const [serviceRadius, setServiceRadius] = useState(() => localStorage.getItem(`esmiOficio_radius_${professional.id}`) || '10');
  const [clientNote, setClientNote] = useState(() => localStorage.getItem(`esmiOficio_client_note_${professional.id}`) || '');
  const [clientChecklist, setClientChecklist] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`esmiOficio_client_checklist_${professional.id}`) || '{}');
    } catch {
      return {};
    }
  });
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(() => localStorage.getItem(`esmiOficio_quote_details_${professional.id}`) || '');
  const [quoteBudget, setQuoteBudget] = useState(() => localStorage.getItem(`esmiOficio_quote_budget_${professional.id}`) || '');
  const [quoteUrgency, setQuoteUrgency] = useState<'Hoy' | 'Esta semana' | 'Flexible'>(() => {
    return (localStorage.getItem(`esmiOficio_quote_urgency_${professional.id}`) as 'Hoy' | 'Esta semana' | 'Flexible') || 'Esta semana';
  });

  const isOwner = currentUser?.role === 'PRO' && currentUser?.proId === professional.id;
  const existingReview = currentUser
    ? professional.reviewsList.find(r => r.authorId === currentUser.id || r.author === currentUser.name)
    : undefined;
  const reviewTagsByRating: Record<number, string[]> = {
    1: ['Malo', 'Impuntual', 'No termino', 'Descuidadoso', 'No recomendable'],
    2: ['Impuntual', 'Trabaja mal', 'Mala comunicacion', 'Cobro confuso', 'Poco cuidadoso'],
    3: ['Regular', 'Puede mejorar', 'Tardo mas', 'Precio aceptable', 'Trabajo incompleto'],
    4: ['Bueno', 'Puntual', 'Amable', 'Limpio', 'Buen precio'],
    5: ['Excelente', 'Muy puntual', 'Profesional', 'Cuidadoso', 'Lo recomiendo']
  };
  const quickReviewTags = reviewTagsByRating[reviewForm.rating] || reviewTagsByRating[5];
  const reviewTextLength = reviewForm.text.trim().length;
  const missingReviewChars = Math.max(0, 20 - reviewTextLength);
  const reviewNeedsPhoto = reviewForm.rating < 3 && reviewForm.images.length === 0;
  const reviewIsReady = reviewTextLength >= 20 && !reviewNeedsPhoto && reviewForm.images.length <= 3;
  const servicesText = professional.services?.filter(Boolean).join(', ');
  const coverageText = professional.coverageZones?.filter(Boolean).join(', ');
  const lastActiveText = getLastActiveText(professional.lastActiveAt);
  const reviewUnlocked = hasHired || !!serviceRequest || (currentUser ? localStorage.getItem(`contacted_${currentUser.id}_${professional.id}`) === 'true' : false);

  const clientChecklistItems = [
    'Explique el problema con fotos',
    'Pregunte si cobra visita',
    'Confirme precio antes de iniciar',
    'Pida garantia del trabajo'
  ];
  const checkedChecklistItems = clientChecklistItems.filter(item => clientChecklist[item]);
  const quoteDetailsLength = quoteDetails.trim().length;
  const quoteDetailsMissingChars = Math.max(0, 25 - quoteDetailsLength);
  const quoteRequestReady = quoteDetailsLength >= 25;
  const quoteBrief = [
    `Solicitud para ${professional.name} (${professional.trade})`,
    `Urgencia: ${quoteUrgency}`,
    quoteBudget.trim() ? `Presupuesto estimado: ${quoteBudget.trim()}` : null,
    `Detalle: ${quoteDetails.trim() || clientNote.trim() || 'Pendiente de describir'}`,
    checkedChecklistItems.length > 0 ? `Checklist: ${checkedChecklistItems.join('; ')}` : null,
    clientNote.trim() ? `Nota privada: ${clientNote.trim()}` : null
  ].filter(Boolean).join('\n');

  const leadScore = useMemo(() => {
    let score = 0;
    if (professional.verified) score += 30;
    if (professional.rating >= 4.5) score += 25;
    if (professional.reviews >= 3) score += 15;
    if (professional.yearsExperience >= 3) score += 15;
    if ((professional.portfolioImages?.length || 0) > 0) score += 15;
    return Math.min(score, 100);
  }, [professional]);

  const toggleReviewTag = (tag: string) => {
    setSelectedReviewTags(prev => (
      prev.includes(tag)
        ? prev.filter(item => item !== tag)
        : [...prev, tag]
    ));
    setReviewError(null);
  };

  // 🟢 INICIO MEJORA 1
  const renderBadge = (years: number, verified: boolean) => {
    const level = years >= 10 ? 'Maestro' : years >= 6 ? 'Experto' : years >= 3 ? 'Experimentado' : 'Nuevo pero prometedor';

    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span className="badge-nivel">{level}</span>
        {verified && <span className="badge-verificado">✅ Verificado</span>}
      </span>
    );
  };
  // 🔴 FIN MEJORA 1

  const requestStats = useMemo(() => ({
    pending: incomingRequests.filter(req => req.status === 'PENDING').length,
    quoted: incomingRequests.filter(req => req.status === 'QUOTED').length,
    confirmed: incomingRequests.filter(req => req.status === 'CONFIRMED').length,
    completed: incomingRequests.filter(req => req.status === 'COMPLETED').length
  }), [incomingRequests]);

  const sortedIncomingRequests = useMemo(() => {
    const statusPriority: Record<string, number> = { CONFIRMED: 0, PENDING: 1, QUOTED: 2, COMPLETED: 3 };
    return [...incomingRequests].sort((a, b) => {
      const priorityDiff = (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [incomingRequests]);

  const profileCompleteness = useMemo(() => {
    const checks = [
      !!professional.imageUrl,
      !!professional.coverImageUrl,
      !!professional.phone && professional.phone.replace(/\D/g, '').length >= 10,
      professional.description.trim().length >= 80,
      professional.yearsExperience > 0,
      !!professional.state && !!professional.municipality,
      (professional.services?.length || 0) > 0,
      (professional.coverageZones?.length || 0) > 0,
      !!professional.responseTimeMinutes,
      (professional.portfolioImages?.length || 0) > 0
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [professional]);

  useEffect(() => {
    const checkHired = async () => {
      if (!currentUser || isOwner) {
        setHasHired(false);
        return;
      }

      const localContacted = localStorage.getItem(`contacted_${currentUser.id}_${professional.id}`) === 'true';
      if (localContacted) {
        setHasHired(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: bookings } = await supabase
          .from('service_requests')
          .select('id')
          .eq('professional_id', professional.id)
          .eq('client_id', user.id)
          .in('status', ['PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED'])
          .limit(1);
        setHasHired(localContacted || (!!bookings && bookings.length > 0));
      } else {
        setHasHired(localContacted);
      }
    };
    checkHired();

    // Listen to dashboard updates to refresh this state if the user manually hired
    const handleUpdate = () => checkHired();
    window.addEventListener('dashboardUpdated', handleUpdate);
    return () => window.removeEventListener('dashboardUpdated', handleUpdate);
  }, [professional.id, currentUser]);

  useEffect(() => {
    if (existingReview) {
      setReviewForm({
        rating: existingReview.rating,
        text: existingReview.text,
        images: existingReview.images || []
      });
      setSelectedReviewTags([]);
    } else {
      setReviewForm({ rating: 5, text: '', images: [] });
      setSelectedReviewTags([]);
    }
  }, [existingReview, professional.id]);

  useEffect(() => {
    setVisibleReviewCount(4);
  }, [professional.id, reviewFilter, sortOrder]);

  useEffect(() => {
    setAvailability((localStorage.getItem(`esmiOficio_availability_${professional.id}`) as 'Disponible hoy' | 'Esta semana' | 'Agenda llena') || 'Esta semana');
    setServiceRadius(localStorage.getItem(`esmiOficio_radius_${professional.id}`) || '10');
    setClientNote(localStorage.getItem(`esmiOficio_client_note_${professional.id}`) || '');
    setQuoteDetails(localStorage.getItem(`esmiOficio_quote_details_${professional.id}`) || '');
    setQuoteBudget(localStorage.getItem(`esmiOficio_quote_budget_${professional.id}`) || '');
    setQuoteUrgency((localStorage.getItem(`esmiOficio_quote_urgency_${professional.id}`) as 'Hoy' | 'Esta semana' | 'Flexible') || 'Esta semana');
    setQuoteFormOpen(false);
    try {
      setClientChecklist(JSON.parse(localStorage.getItem(`esmiOficio_client_checklist_${professional.id}`) || '{}'));
    } catch {
      setClientChecklist({});
    }
  }, [professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_availability_${professional.id}`, availability);
  }, [availability, professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_radius_${professional.id}`, serviceRadius);
  }, [serviceRadius, professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_client_note_${professional.id}`, clientNote);
  }, [clientNote, professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_quote_details_${professional.id}`, quoteDetails);
  }, [quoteDetails, professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_quote_budget_${professional.id}`, quoteBudget);
  }, [quoteBudget, professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_quote_urgency_${professional.id}`, quoteUrgency);
  }, [quoteUrgency, professional.id]);

  useEffect(() => {
    localStorage.setItem(`esmiOficio_client_checklist_${professional.id}`, JSON.stringify(clientChecklist));
  }, [clientChecklist, professional.id]);

  useEffect(() => {
    setEditForm(professional);
    const loc = MEXICO_LOCATIONS.find(l => l.name === professional.state);
    setStateIdForEdit(loc?.id || '');
    setPendingImageFiles({});
    setEditError(null);
  }, [professional]);

  // Logic to calculate days since last sensitive update
  const canEditSensitiveData = useMemo(() => {
    if (!professional.lastSensitiveUpdate) return true;
    const lastUpdate = new Date(professional.lastSensitiveUpdate).getTime();
    const now = Date.now();
    const diffTime = Math.abs(now - lastUpdate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 30;
  }, [professional.lastSensitiveUpdate]);

  const daysUntilNextEdit = useMemo(() => {
    if (canEditSensitiveData || !professional.lastSensitiveUpdate) return 0;
    const lastUpdate = new Date(professional.lastSensitiveUpdate).getTime();
    const nextEditDate = lastUpdate + (30 * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const diffTime = nextEditDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [canEditSensitiveData, professional.lastSensitiveUpdate]);

  const availableMunicipalitiesForEdit = useMemo(() => {
    if (!stateIdForEdit) return [];
    return MEXICO_LOCATIONS.find(l => l.id === stateIdForEdit)?.municipalities || [];
  }, [stateIdForEdit]);

  // Logic for Native Share
  const handleShareClick = async () => {
    const shareData = {
      title: `Contrata a ${professional.name} en EsMiOficio`,
      text: `Mira el perfil de ${professional.name}, ${professional.trade} en ${professional.municipality}.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        onShare('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleRequestVerification = () => {
    // Número de soporte proporcionado por el usuario
    const adminPhone = "524436214278"; 
    const message = `Hola administración de EsMiOficio, soy ${professional.name} (ID: ${professional.id}). Me gustaría solicitar la verificación de mi perfil de ${professional.trade}. Adjunto mis documentos de identidad para validación.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const copyProfessionalPromo = async () => {
    const text = `Hola, soy ${professional.name}, ${professional.trade} en ${professional.municipality}. Puedes revisar mi perfil, resenas y trabajos en EsMiOficio: ${window.location.href}`;
    await navigator.clipboard.writeText(text);
    onShare('Texto de promocion copiado');
  };

  const copyQuickReply = async (clientName?: string) => {
    const text = `Hola ${clientName || 'cliente'}, gracias por contactarme por EsMiOficio. Para cotizar mejor, por favor enviame fotos, ubicacion aproximada y horario disponible.`;
    await navigator.clipboard.writeText(text);
    onShare('Respuesta rapida copiada');
  };

  const toggleClientChecklist = (item: string) => {
    setClientChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const copyClientBrief = async () => {
    try {
      await navigator.clipboard.writeText(quoteBrief);
      onShare('Resumen copiado para WhatsApp');
    } catch {
      onShare('No se pudo copiar el resumen');
    }
  };

  const submitQuoteRequest = () => {
    if (!onRequestQuote || !quoteRequestReady) return;
    onRequestQuote(professional.id, quoteBrief);
    setQuoteFormOpen(false);
  };

  const handleReviewImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 3 - reviewForm.images.length;
      
      if (remainingSlots <= 0) {
        setReviewError("Máximo 3 fotos de evidencia permitidas.");
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const promises = filesToProcess.map((file: File) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file as Blob);
      }));

      Promise.all(promises).then(base64Images => {
        setReviewForm(prev => ({ 
          ...prev, 
          images: [...prev.images, ...base64Images] 
        }));
        setReviewError(null);
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'coverImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditError(null);
    try {
      const processedFile = await compressImageToWebP(file, field === 'coverImageUrl' ? 1800 : 900, 0.84);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, [field]: reader.result as string }));
        setPendingImageFiles(prev => ({ ...prev, [field]: processedFile }));
      };
      reader.readAsDataURL(processedFile);
    } catch (error: any) {
      setEditError(error.message || 'No pudimos preparar la imagen para subirla.');
    } finally {
      e.target.value = '';
    }
  };

  const uploadProfessionalImage = async (file: File, folder: 'profile' | 'cover') => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user || authData.user.id !== professional.id) {
      throw new Error('No pudimos validar que este perfil sea tuyo. Vuelve a iniciar sesion.');
    }

    const safeName = file.name.replace(/[^a-z0-9_.-]+/gi, '-').toLowerCase();
    const path = `${authData.user.id}/${folder}/${Date.now()}-${getUniqueUploadId()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .upload(path, file, {
        contentType: file.type || 'image/webp',
        upsert: false
      });

    if (uploadError) {
      throw new Error(getStorageUploadErrorMessage(uploadError, folder === 'profile' ? 'la foto de perfil' : 'la foto de portada'));
    }

    const { data } = supabase.storage.from(PROFILE_IMAGES_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      throw new Error(`La imagen se subio, pero no pudimos generar la URL publica de ${folder === 'profile' ? 'perfil' : 'portada'}.`);
    }

    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    setEditError(null);
    const cleanPhone = (editForm.phone || '').replace(/\D/g, '');
    const cleanName = editForm.name.trim();
    const cleanTrade = editForm.trade.trim();
    const cleanState = editForm.state.trim();
    const cleanMunicipality = editForm.municipality.trim();
    const cleanDescription = editForm.description.trim();

    if (!cleanName || !cleanTrade) {
      setEditError("Agrega nombre y oficio para guardar el perfil.");
      return;
    }

    if (!cleanState || !cleanMunicipality) {
      setEditError("Selecciona estado y municipio para que tu perfil aparezca en busquedas.");
      return;
    }

    if (cleanPhone && cleanPhone.length < 10) {
      setEditError("Agrega un telefono valido de al menos 10 digitos o deja el campo vacio.");
      return;
    }

    if (cleanDescription.length < 20) {
      setEditError("Describe tus servicios con al menos 20 caracteres.");
      return;
    }

    if (editForm.yearsExperience < 0 || editForm.yearsExperience > 60) {
      setEditError("Ingresa anos de experiencia entre 0 y 60.");
      return;
    }

    if (!onUpdateProfile) return;

    setIsSavingProfile(true);

    try {
      const nextProfile: Professional = {
        ...editForm,
        name: cleanName,
        trade: cleanTrade,
        state: cleanState,
        municipality: cleanMunicipality,
        phone: cleanPhone,
        description: cleanDescription
      };

      if (pendingImageFiles.imageUrl) {
        nextProfile.imageUrl = await uploadProfessionalImage(pendingImageFiles.imageUrl, 'profile');
      }

      if (pendingImageFiles.coverImageUrl) {
        nextProfile.coverImageUrl = await uploadProfessionalImage(pendingImageFiles.coverImageUrl, 'cover');
      }

      const saved = await onUpdateProfile(nextProfile);
      if (!saved) {
        setEditError("No pudimos actualizar el perfil. Revisa el aviso de la esquina e intenta de nuevo.");
        return;
      }

      setPendingImageFiles({});
      setIsEditing(false);
    } catch (error: any) {
      setEditError(error.message || 'No pudimos guardar los cambios del perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    const reviewText = reviewForm.text.trim();

    if (reviewText.length < 20) {
      setReviewError("Escribe al menos 20 caracteres para que la reseÃ±a sea util para otros clientes.");
      return;
    }

    if (reviewForm.rating < 3 && reviewForm.images.length === 0) {
      setReviewError("Para calificaciones bajas (1-2 estrellas) se requiere al menos 1 foto como evidencia.");
      return;
    }

    if (reviewForm.images.length > 3) {
      setReviewError("Solo puedes subir un máximo de 3 fotos.");
      return;
    }

    setIsSubmittingReview(true);
    const finalReviewText = selectedReviewTags.length > 0
      ? `${reviewText}\n\nEtiquetas: ${selectedReviewTags.join(', ')}`
      : reviewText;
    const saved = await onAddReview({
        author: currentUser?.name || 'Usuario', 
        rating: reviewForm.rating, 
        text: finalReviewText,
        images: reviewForm.images 
      }, professional.id);
    setIsSubmittingReview(false);
    if (!saved) {
      setReviewError("No pudimos guardar la reseña. Revisa el aviso de la esquina e intenta de nuevo.");
      return;
    }
    if (saved && !existingReview) {
      setReviewForm({ rating: 5, text: '', images: [] });
      setSelectedReviewTags([]);
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  // Sorting Logic
  const sortedReviews = useMemo(() => {
    const reviews = [...professional.reviewsList];
    if (sortOrder === 'NEWEST') {
      // Assuming date format DD/MM/YYYY
      return reviews.sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('');
        const dateB = b.date.split('/').reverse().join('');
        return dateB.localeCompare(dateA);
      });
    }
    if (sortOrder === 'HIGHEST') return reviews.sort((a, b) => b.rating - a.rating);
    if (sortOrder === 'LOWEST') return reviews.sort((a, b) => a.rating - b.rating);
    return reviews;
  }, [professional.reviewsList, sortOrder]);

  const ratingSummary = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    professional.reviewsList.forEach(review => {
      const rating = Math.max(1, Math.min(5, Math.round(review.rating)));
      counts[rating] += 1;
    });
    const total = professional.reviewsList.length;
    const average = total > 0
      ? professional.reviewsList.reduce((sum, review) => sum + review.rating, 0) / total
      : 0;

    return { counts, total, average };
  }, [professional.reviewsList]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'PHOTOS') return sortedReviews.filter(review => (review.images?.length || 0) > 0);
    if (reviewFilter === 'FIVE') return sortedReviews.filter(review => Math.round(review.rating) === 5);
    if (reviewFilter === 'FOUR') return sortedReviews.filter(review => Math.round(review.rating) === 4);
    if (reviewFilter === 'LOW') return sortedReviews.filter(review => review.rating <= 3);
    return sortedReviews;
  }, [sortedReviews, reviewFilter]);

  const visibleReviews = filteredReviews.slice(0, visibleReviewCount);
  const hiddenReviewCount = Math.max(0, filteredReviews.length - visibleReviews.length);

  // 🟢 INICIO MEJORA 3
  const performanceActivity = useMemo(() => {
    const parseReviewDate = (date: string) => {
      const parts = date.split('/');
      if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      return new Date(date);
    };

    const reviews = [...professional.reviewsList].filter(review => !Number.isNaN(parseReviewDate(review.date).getTime()));
    if (reviews.length === 0) {
      return {
        trend: '✅ Historial estable',
        activity: '🕒 Sin reseñas recientes'
      };
    }

    const ordered = [...reviews].sort((a, b) => parseReviewDate(b.date).getTime() - parseReviewDate(a.date).getTime());
    const latestTen = ordered.slice(0, 10);
    const latestAvg = latestTen.reduce((sum, review) => sum + review.rating, 0) / latestTen.length;
    const historicalAvg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const diff = latestAvg - historicalAvg;

    const latestDate = parseReviewDate(ordered[0].date);
    const daysAgo = Math.max(0, Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      trend: Math.abs(diff) > 0.15
        ? `${diff > 0 ? '📈 ↑' : '📉 ↓'}${Math.abs(diff).toFixed(1)} este mes`
        : '✅ Historial estable',
      activity: `🕒 Última reseña: hace ${daysAgo} días`
    };
  }, [professional.reviewsList]);
  // 🔴 FIN MEJORA 3

  return (
    <>
      <div className="py-12 min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white mb-6 group transition-colors">
            <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span> 
            Volver a resultados
          </button>

          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative">
            {isEditing && (
              <div className="absolute top-0 left-0 w-full bg-yellow-600/90 text-white text-center text-sm font-bold py-2 z-50">
                Modo Edición Activado
              </div>
            )}

            {isOwner && !isEditing && (
              <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-yellow-500">dashboard</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Mi Panel Profesional</h2>
                    <p className="text-gray-400 text-xs">Gestiona tu perfil público y visibilidad en EsMiOficio.</p>
                  </div>
                </div>
                <button
                  onClick={copyProfessionalPromo}
                  className="hidden sm:flex items-center gap-2 bg-surface-light border border-border px-3 py-2 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-primary">campaign</span>
                  Copiar promocion
                </button>
              </div>
            )}

            <div className="h-56 bg-gradient-to-r from-primary/20 to-blue-900/20 relative overflow-hidden group/cover">
              {isEditing ? (
                <div className="relative w-full h-full">
                  <img loading="lazy" src={editForm.coverImageUrl || professional.coverImageUrl} className="w-full h-full object-cover opacity-60" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center text-white">
                      <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                      <span className="text-sm font-bold">Cambiar Portada</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'coverImageUrl')} />
                  </label>
                </div>
              ) : (
                <>
                  {professional.coverImageUrl && <img loading="lazy" src={professional.coverImageUrl} className="w-full h-full object-cover opacity-60 cursor-pointer" onClick={() => openLightbox([professional.coverImageUrl!], 0)} />}
                  <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                </>
              )}
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                  {isOwner && !isEditing && (
                    <button 
                      onClick={() => {
                        setEditError(null);
                        setIsEditing(true);
                      }}
                      className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-black/60 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editar Perfil
                    </button>
                  )}
                  {isEditing && (
                    <div className="flex gap-2">
                      <button 
                        disabled={isSavingProfile}
                        onClick={() => {
                          setEditForm(professional);
                          setPendingImageFiles({});
                          setEditError(null);
                          setIsEditing(false);
                        }}
                        className="bg-red-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-red-600 transition-all text-sm font-bold"
                      >
                        Cancelar
                      </button>
                      <button 
                        disabled={isSavingProfile}
                        onClick={handleSaveProfile}
                        className="bg-green-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-green-500 transition-all text-sm font-bold shadow-lg disabled:opacity-60"
                      >
                        {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  )}
                  {!isEditing && (
                    <>
                      <button 
                        onClick={onToggleFavorite}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/60 transition-all active:scale-95"
                        title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                      >
                        <span className={`material-symbols-outlined ${isFavorite ? 'text-red-500 fill-1' : ''}`}>favorite</span>
                      </button>
                      <button 
                        onClick={handleShareClick}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/60 transition-all active:scale-95"
                        title="Compartir Perfil"
                      >
                        <span className="material-symbols-outlined">share</span>
                      </button>
                    </>
                  )}
              </div>
            </div>

            <div className="px-4 sm:px-8 pb-8">
              <div className="flex flex-row flex-wrap items-end -mt-20 mb-8 gap-4 sm:gap-6 relative z-10">
                <div className="relative group/profile shrink-0">
                  <img loading="lazy" 
                    src={isEditing ? editForm.imageUrl : professional.imageUrl} 
                    className="h-32 w-32 sm:h-44 sm:w-44 rounded-2xl object-cover border-4 border-surface shadow-2xl bg-surface-light cursor-pointer" 
                    onClick={() => !isEditing && openLightbox([professional.imageUrl], 0)}
                  />
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer opacity-0 group-hover/profile:opacity-100 transition-opacity border-4 border-transparent">
                      <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                    </label>
                  )}
                </div>
                
                <div className="flex-[1_1_220px] min-w-0 w-full bg-surface/85 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none border border-border/60 sm:border-0 rounded-2xl sm:rounded-none p-4 sm:p-0 shadow-xl sm:shadow-none">
                  {isEditing ? (
                    <div className="space-y-3 bg-surface-light/50 p-4 rounded-xl border border-border">
                      <div>
                        <label className="text-xs text-gray-500 font-bold uppercase">Nombre Completo</label>
                        <input 
                          disabled={!canEditSensitiveData}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white disabled:opacity-50"
                          value={editForm.name}
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                        {!canEditSensitiveData && <p className="text-[10px] text-red-400 mt-1">Podrás editar tu nombre en {daysUntilNextEdit} días.</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 font-bold uppercase">Oficio</label>
                            <select 
                              disabled={!canEditSensitiveData}
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white disabled:opacity-50"
                              value={editForm.trade}
                              onChange={e => setEditForm({...editForm, trade: e.target.value})}
                            >
                              {TRADES.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-bold uppercase">Años Exp.</label>
                            <input 
                              type="number"
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white"
                              value={editForm.yearsExperience}
                              onChange={e => setEditForm({...editForm, yearsExperience: parseInt(e.target.value) || 0})}
                            />
                          </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight break-words">{professional.name}</h1>
                        {/* 🟢 INICIO MEJORA 1 */}
                        {renderBadge(professional.yearsExperience, professional.verified)}
                        {/* 🔴 FIN MEJORA 1 */}
                      </div>
                      <p className="text-base sm:text-xl text-primary font-bold leading-snug break-words">{professional.trade}</p>
                      <div className="flex items-center gap-1 text-gray-400 mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <p className="text-xs sm:text-sm font-medium break-words">{professional.municipality}, {professional.state}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                        {lastActiveText && <span className="activity-badge">{lastActiveText}</span>}
                        {professional.responseTimeMinutes && <span className="activity-badge">Responde en {professional.responseTimeMinutes} min</span>}
                        <span className="activity-badge">{getVerificationCopy(professional.verificationLevel)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="w-full lg:w-auto flex flex-col gap-3">
                  {!isEditing && (
                    isLoggedIn ? (
                      currentUser?.role === 'PRO' && !isOwner ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center">
                          <span className="material-symbols-outlined text-red-500 mb-2">info</span>
                          <p className="text-xs text-red-400 font-bold leading-tight">
                            Como Profesional no puedes contratar otros servicios.<br/>
                            Por favor usa una cuenta de cliente.
                          </p>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => onContact(professional)}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-center shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">perm_phone_msg</span>
                            Contactar por WhatsApp
                          </button>
                          
                          {!isOwner && !serviceRequest && onRequestQuote && (
                            <div className="w-full max-w-md rounded-2xl border border-primary/30 bg-surface-light/80 p-4 shadow-2xl">
                              {!quoteFormOpen ? (
                                <button
                                  type="button"
                                  onClick={() => setQuoteFormOpen(true)}
                                  className="w-full bg-primary text-background px-6 py-4 rounded-xl font-black text-center transition-all active:scale-95 flex flex-col items-center justify-center leading-tight"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined font-black">request_quote</span>
                                    <span>SOLICITAR COTIZACION</span>
                                  </div>
                                  <span className="text-[10px] opacity-70 font-bold">Agrega detalles antes de enviarla</span>
                                </button>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-black text-white">Prepara tu cotizacion</p>
                                      <p className="text-[11px] text-gray-400">Entre mas claro sea el problema, mejor respuesta recibes.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setQuoteFormOpen(false)}
                                      className="text-gray-500 hover:text-white"
                                      aria-label="Cerrar solicitud de cotizacion"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                  </div>

                                  <textarea
                                    value={quoteDetails}
                                    onChange={(event) => setQuoteDetails(event.target.value)}
                                    rows={4}
                                    maxLength={500}
                                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary resize-none"
                                    placeholder="Describe el trabajo: problema, zona, medidas, fotos disponibles, horario..."
                                  />
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                                    <span className={quoteDetailsMissingChars > 0 ? 'text-yellow-400' : 'text-green-400'}>
                                      {quoteDetailsMissingChars > 0 ? `Faltan ${quoteDetailsMissingChars} caracteres` : 'Lista para enviar'}
                                    </span>
                                    <span className="text-gray-600">{quoteDetailsLength}/500</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      value={quoteBudget}
                                      onChange={(event) => setQuoteBudget(event.target.value)}
                                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-white outline-none focus:border-primary"
                                      placeholder="Presupuesto opcional"
                                    />
                                    <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-background p-1">
                                      {(['Hoy', 'Esta semana', 'Flexible'] as const).map(option => (
                                        <button
                                          key={option}
                                          type="button"
                                          onClick={() => setQuoteUrgency(option)}
                                          className={`rounded-md px-2 py-2 text-[10px] font-black transition-colors ${
                                            quoteUrgency === option
                                              ? 'bg-primary text-background'
                                              : 'text-gray-400 hover:text-white'
                                          }`}
                                        >
                                          {option}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!quoteRequestReady}
                                    onClick={submitQuoteRequest}
                                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-background transition-all hover:bg-primary-hover disabled:opacity-50"
                                  >
                                    Enviar solicitud detallada
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!isOwner && serviceRequest?.status === 'PENDING' && (
                            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                              <div className="mb-2 flex items-center gap-2 text-yellow-500 text-xs font-black">
                                <span className="material-symbols-outlined text-sm animate-pulse">hourglass_empty</span>
                                ESPERANDO RESPUESTA DEL PROFESIONAL
                              </div>
                              {serviceRequest.details && (
                                <p className="whitespace-pre-line text-xs leading-relaxed text-gray-300">{serviceRequest.details}</p>
                              )}
                            </div>
                          )}

                          {!isOwner && serviceRequest?.status === 'QUOTED' && onConfirmService && (
                            <div className="bg-surface-light p-4 rounded-2xl border border-primary/30 flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold">Cotización recibida:</span>
                                <span className="text-primary font-black text-lg">{serviceRequest.quote_amount || 'Sin costo'}</span>
                              </div>
                              <button 
                                onClick={() => onConfirmService(serviceRequest.id)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-xl font-bold text-sm text-center shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined">check_circle</span>
                                Aceptar y Comenzar Servicio
                              </button>
                            </div>
                          )}

                          {!isOwner && (hasHired || serviceRequest?.status === 'CONFIRMED') && (
                            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-xl text-primary text-xs font-black justify-center">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              SERVICIO ACTIVO / CONTRATADO
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <div className="bg-surface-light/80 backdrop-blur-sm p-5 rounded-2xl text-center border border-primary/20 shadow-xl">
                        <span className="material-symbols-outlined text-primary mb-2 text-3xl">lock_person</span>
                        <p className="text-xs text-gray-300 mb-4 font-medium px-2 leading-relaxed">Los datos de contacto son exclusivos para nuestra comunidad.</p>
                        <button 
                          onClick={() => onContact(professional)} 
                          className="w-full bg-primary hover:bg-primary-hover text-background px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                        >
                          Contactar por WhatsApp
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
                  <TrustSignal professional={professional} />
                  <div className="rounded-2xl bg-surface-light/30 border border-border p-4">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
                      Senales de confianza
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="rounded-xl bg-surface border border-border p-3">
                        <span className="block text-white font-black">{professional.jobsCount || 0}</span>
                        <span className="text-[10px] uppercase text-gray-500">trabajos</span>
                      </div>
                      <div className="rounded-xl bg-surface border border-border p-3">
                        <span className="block text-white font-black">{professional.recommendationsCount || professional.reviews || 0}</span>
                        <span className="text-[10px] uppercase text-gray-500">recom.</span>
                      </div>
                      <div className="rounded-xl bg-surface border border-border p-3">
                        <span className="block text-white font-black">{professional.startingPrice ? `$${professional.startingPrice.toLocaleString('es-MX')}` : 'Aprox.'}</span>
                        <span className="text-[10px] uppercase text-gray-500">desde</span>
                      </div>
                      <div className="rounded-xl bg-surface border border-border p-3">
                        <span className="block text-white font-black">{professional.responseTimeMinutes || '-'}</span>
                        <span className="text-[10px] uppercase text-gray-500">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-surface-light/30 border border-border rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">event_available</span>
                      Disponibilidad
                    </h3>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as 'Disponible hoy' | 'Esta semana' | 'Agenda llena')}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                    >
                      <option>Disponible hoy</option>
                      <option>Esta semana</option>
                      <option>Agenda llena</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-3">Se mostrara como referencia para clientes que revisen tu perfil en este dispositivo.</p>
                  </div>

                  <div className="bg-surface-light/30 border border-border rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">travel_explore</span>
                      Zona de atencion
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="80"
                        step="5"
                        value={serviceRadius}
                        onChange={(e) => setServiceRadius(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-white font-bold text-sm w-14 text-right">{serviceRadius} km</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Ayuda a comunicar hasta donde puedes desplazarte.</p>
                  </div>

                  <div className="bg-surface-light/30 border border-border rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">bolt</span>
                      Acciones rapidas
                    </h3>
                    <div className="space-y-2">
                      <button onClick={copyProfessionalPromo} className="w-full py-2 rounded-lg bg-surface border border-border text-sm font-bold text-gray-300 hover:text-white transition-colors">
                        Copiar texto para promocion
                      </button>
                      <button onClick={() => copyQuickReply()} className="w-full py-2 rounded-lg bg-surface border border-border text-sm font-bold text-gray-300 hover:text-white transition-colors">
                        Copiar respuesta inicial
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">notifications_active</span>
                    Solicitudes de Servicio
                  </h3>
                  {incomingRequests.length === 0 ? (
                    <div className="bg-surface-light/20 p-6 rounded-2xl border border-border text-center">
                      <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">inbox</span>
                      <p className="text-gray-400 text-sm">Aun no tienes solicitudes. Mantener tu perfil completo ayuda a recibir mas contactos.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedIncomingRequests.map(req => (
                        <div key={req.id} className="bg-surface-light border border-primary/20 p-5 rounded-2xl shadow-xl flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-white text-lg">{req.client_name}</span>
                            <span className="text-[10px] bg-background border border-border px-2 py-1 rounded text-gray-400 font-bold uppercase">
                              {new Date(req.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-4 flex-1">
                            Ha solicitado tus servicios. Responde rapido para aumentar tus oportunidades de contratacion.
                          </p>
                          {req.details && (
                            <div className="mb-4 rounded-xl border border-border bg-background/60 p-3">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Detalle del cliente</p>
                              <p className="whitespace-pre-line text-xs leading-relaxed text-gray-300">{req.details}</p>
                            </div>
                          )}
                          <button
                            onClick={() => copyQuickReply(req.client_name)}
                            className="mb-3 w-full bg-surface border border-border text-gray-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm text-primary">content_copy</span>
                            Copiar respuesta para WhatsApp
                          </button>
                          
                          {req.status === 'PENDING' && onAcceptQuote && (
                            <div className="flex flex-col gap-2">
                              <input 
                                type="number"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                id={`quote-${req.id}`}
                                placeholder="Monto MXN (Ej: 500)" 
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                              />
                              <button 
                                onClick={() => {
                                  const input = document.getElementById(`quote-${req.id}`) as HTMLInputElement;
                                  if(input) onAcceptQuote(req.id, input.value);
                                }}
                                className="w-full bg-primary hover:bg-primary-hover text-background font-bold px-3 py-2 rounded-lg text-sm transition-colors"
                              >
                                Enviar Cotizacion
                              </button>
                            </div>
                          )}
                          
                          {req.status === 'QUOTED' && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 rounded-lg text-yellow-500 text-xs font-bold text-center">
                              {`Cotizacion enviada: $${req.quote_amount} MXN. Esperando confirmacion del cliente.`}
                            </div>
                          )}
                          
                          {req.status === 'CONFIRMED' && onCompleteService && (
                            <button 
                              onClick={() => onCompleteService(req.id)}
                              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                              MARCAR COMO TERMINADO
                            </button>
                          )}
                          
                          {req.status === 'COMPLETED' && (
                            <div className="bg-blue-600/20 border border-blue-600/30 px-3 py-2 rounded-lg text-blue-400 text-xs font-bold text-center flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              SERVICIO FINALIZADO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-10">
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Sobre el profesional
                    </h3>
                    {isEditing ? (
                      <div className="bg-surface-light/30 rounded-2xl p-6 border border-border">
                        <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Descripción de tus servicios</label>
                        <textarea 
                          rows={5}
                          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white resize-none focus:border-primary outline-none"
                          value={editForm.description}
                          onChange={e => setEditForm({...editForm, description: e.target.value})}
                        />
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Teléfono (WhatsApp)</label>
                              <input 
                                type="tel"
                                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white"
                                placeholder="Ej: 4431234567"
                                value={editForm.phone || ''}
                                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Estado</label>
                              <select 
                                  disabled={!canEditSensitiveData}
                                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white disabled:opacity-50"
                                  value={stateIdForEdit}
                                  onChange={e => {
                                    setStateIdForEdit(e.target.value);
                                    const stateName = MEXICO_LOCATIONS.find(s => s.id === e.target.value)?.name || '';
                                    setEditForm({...editForm, state: stateName, municipality: ''});
                                  }}
                                >
                                  <option value="">Selecciona...</option>
                                  {MEXICO_LOCATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Municipio</label>
                              <select 
                                  disabled={!canEditSensitiveData}
                                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white disabled:opacity-50"
                                  value={editForm.municipality}
                                  onChange={e => {
                                    const muniName = availableMunicipalitiesForEdit.find(m => m.name === e.target.value)?.name || e.target.value;
                                    setEditForm({...editForm, municipality: muniName});
                                  }}
                                >
                                  <option value="">Selecciona...</option>
                                  {availableMunicipalitiesForEdit.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Servicios que ofreces</label>
                            <input
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white"
                              placeholder="Ej: fugas, boilers, instalaciones"
                              value={(editForm.services || []).join(', ')}
                              onChange={e => setEditForm({
                                ...editForm,
                                services: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Zonas de cobertura</label>
                            <input
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white"
                              placeholder="Ej: Centro, Altozano"
                              value={(editForm.coverageZones || []).join(', ')}
                              onChange={e => setEditForm({
                                ...editForm,
                                coverageZones: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Tiempo de respuesta (min)</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white"
                              value={editForm.responseTimeMinutes || ''}
                              onChange={e => setEditForm({ ...editForm, responseTimeMinutes: e.target.value ? Number(e.target.value) : null })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Precio inicial aprox.</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white"
                              value={editForm.startingPrice || ''}
                              onChange={e => setEditForm({ ...editForm, startingPrice: e.target.value ? Number(e.target.value) : null })}
                            />
                          </div>
                        </div>
                        {!canEditSensitiveData && <p className="text-[10px] text-red-400 mt-2">La ubicación solo puede cambiarse cada 30 días.</p>}
                        {editError && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-400 font-bold">{editError}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-surface-light/30 rounded-2xl p-6 border border-border leading-relaxed">
                        <p className="text-gray-300 text-lg">{professional.description || `Servicios profesionales de ${professional.trade} en ${professional.municipality || 'Morelia'}.`}</p>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {coverageText && (
                            <div className="rounded-xl bg-surface border border-border p-4">
                              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Zonas de cobertura</p>
                              <p className="text-sm text-white">{coverageText}</p>
                            </div>
                          )}
                          {servicesText && (
                            <div className="rounded-xl bg-surface border border-border p-4">
                              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Servicios</p>
                              <p className="text-sm text-white">{servicesText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">rate_review</span>
                          Opiniones ({professional.reviewsList.length})
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <StarRating rating={professional.rating} reviews={professional.reviewsList.length} sizeClass="text-sm" />
                          {/* 🟢 INICIO MEJORA 3 */}
                          <span id="trend-indicator" className="trend-badge">{performanceActivity.trend}</span>
                          <span id="recent-activity" className="activity-badge">{performanceActivity.activity}</span>
                          {/* 🔴 FIN MEJORA 3 */}
                        </div>
                      </div>
                      
                      {/* Sorting Controls */}
                      <div className="flex bg-surface-light rounded-lg p-1 border border-border">
                        <button 
                            onClick={() => setSortOrder('NEWEST')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortOrder === 'NEWEST' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                          >
                            Recientes
                        </button>
                        <button 
                            onClick={() => setSortOrder('HIGHEST')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortOrder === 'HIGHEST' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                          >
                            Mejores
                        </button>
                        <button 
                            onClick={() => setSortOrder('LOWEST')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sortOrder === 'LOWEST' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                          >
                            Peores
                        </button>
                      </div>
                    </div>

                    {professional.reviewsList.length > 0 && (
                      <div className="mb-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
                        <div className="rounded-2xl border border-border bg-surface-light/30 p-5">
                          <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Resumen</p>
                          <div className="mt-2 flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{ratingSummary.average.toFixed(1)}</span>
                            <span className="pb-1 text-xs font-bold text-gray-500">/ 5</span>
                          </div>
                          <StarRating rating={ratingSummary.average} reviews={ratingSummary.total} sizeClass="text-sm" />
                          <p className="mt-3 text-xs text-gray-400">Basado en {ratingSummary.total} opiniones verificadas.</p>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface-light/20 p-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map(star => {
                                const count = ratingSummary.counts[star] || 0;
                                const percent = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;

                                return (
                                  <div key={star} className="grid grid-cols-[42px_1fr_28px] items-center gap-2 text-xs">
                                    <span className="font-bold text-gray-400">{star} est.</span>
                                    <div className="h-2 rounded-full bg-background overflow-hidden">
                                      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <span className="text-right font-bold text-gray-500">{count}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div>
                              <p className="mb-3 text-[10px] uppercase font-black tracking-widest text-gray-500">Filtrar opiniones</p>
                              <div className="flex flex-wrap gap-2">
                                {([
                                  { id: 'ALL', label: 'Todas', count: ratingSummary.total },
                                  { id: 'PHOTOS', label: 'Con fotos', count: professional.reviewsList.filter(review => (review.images?.length || 0) > 0).length },
                                  { id: 'FIVE', label: '5 estrellas', count: ratingSummary.counts[5] },
                                  { id: 'FOUR', label: '4 estrellas', count: ratingSummary.counts[4] },
                                  { id: 'LOW', label: '1-3 estrellas', count: ratingSummary.counts[1] + ratingSummary.counts[2] + ratingSummary.counts[3] }
                                ] as const).map(filter => (
                                  <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => setReviewFilter(filter.id)}
                                    className={`rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                                      reviewFilter === filter.id
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-surface border-border text-gray-300 hover:border-primary/50 hover:text-white'
                                    }`}
                                  >
                                    {filter.label} ({filter.count})
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 mb-10">
                      {visibleReviews.length > 0 ? (
                        visibleReviews.map((review) => (
                          <div key={review.id} className="bg-surface-light/40 p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{review.author}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold">{review.date}</span>
                              </div>
                              <StarRating rating={review.rating} sizeClass="text-sm" showValue={false} showReviews={false} />
                            </div>
                            <p className="text-gray-300 italic mb-4">"{review.text}"</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-4">
                                {review.images.map((img, i) => (
                                  <img loading="lazy" 
                                    key={i} 
                                    src={img} 
                                    className="h-16 w-16 object-cover rounded-xl border border-border cursor-pointer hover:scale-105 transition-transform" 
                                    alt="Evidencia de trabajo"
                                    onClick={() => openLightbox(review.images!, i)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 border border-dashed border-gray-700 rounded-3xl">
                          <span className="material-symbols-outlined text-5xl text-gray-700 mb-2">reviews</span>
                          <p className="text-gray-500 font-medium italic">
                            {professional.reviewsList.length > 0 ? 'No hay opiniones con ese filtro.' : 'Aun no hay resenas para este profesional.'}
                          </p>
                        </div>
                      )}
                      {hiddenReviewCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setVisibleReviewCount(count => count + 4)}
                          className="mx-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-light px-5 py-3 text-sm font-bold text-gray-200 hover:border-primary/60 hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">expand_more</span>
                          Ver {Math.min(4, hiddenReviewCount)} mas
                        </button>
                      )}
                    </div>

                    {isLoggedIn && !isOwner && !isEditing && (
                      currentUser?.role === 'PRO' ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-3xl text-center">
                          <span className="material-symbols-outlined text-yellow-500 mb-2 text-3xl">group_off</span>
                          <h4 className="text-white font-bold mb-1">Función restringida</h4>
                          <p className="text-xs text-gray-400">
                            Las cuentas profesionales no pueden emitir reseñas para otros colegas.<br/>
                            Usa una cuenta de cliente para calificar servicios.
                          </p>
                        </div>
                      ) : (
                        reviewUnlocked ? (
                        <div className="bg-gradient-to-br from-surface-light/40 to-surface-light/10 p-8 rounded-3xl border border-border shadow-xl">
                          <div className="mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase text-primary">
                              <span className="material-symbols-outlined text-[14px]">lock_open</span>
                              Contacto verificado
                            </div>
                            <h4 className="text-xl font-bold text-white mt-3">
                              {existingReview ? 'Edita tu reseña' : 'Comparte tu experiencia'}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">Selecciona una calificacion, agrega tags y cuenta como fue el servicio.</p>
                          </div>
                          <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">¿Cómo calificarías el servicio?</label>
                              <div className="flex gap-4">
                                {[1,2,3,4,5].map(s => (
                                  <button 
                                    key={s} 
                                    type="button" 
                                    aria-label={`Calificar con ${s} estrellas`}
                                    onClick={() => {
                                      setReviewForm({...reviewForm, rating: s});
                                      setSelectedReviewTags([]);
                                      setReviewError(null);
                                    }} 
                                    className={`text-4xl transition-all hover:scale-125 active:scale-95 ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-700'}`}
                                  >
                                    {s <= reviewForm.rating ? '⭐' : '☆'}
                                  </button>
                                ))}
                              </div>
                              {reviewForm.rating < 3 && (
                                <div className="mt-3 flex items-center gap-2 text-red-400">
                                  <span className="material-symbols-outlined text-sm">info</span>
                                  <p className="text-[10px] font-bold uppercase tracking-tighter">Se requiere evidencia fotográfica (1-3 fotos)</p>
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Cuéntanos más</label>
                              <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Tags segun tu calificacion</label>
                                <div className="flex flex-wrap gap-2">
                                  {quickReviewTags.map(tag => {
                                    const isSelected = selectedReviewTags.includes(tag);

                                    return (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleReviewTag(tag)}
                                        className={`px-3 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                                          isSelected
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-surface-light border-border text-gray-300 hover:border-primary/50 hover:text-white'
                                        }`}
                                      >
                                        {tag}
                                      </button>
                                    );
                                  })}
                                </div>
                                <p className="text-[10px] text-gray-600 mt-2">Estos tags se seleccionan aparte y no se escriben dentro del texto mientras redactas.</p>
                              </div>

                              <textarea
                                required 
                                rows={4}
                                className="w-full bg-surface-light border border-border rounded-xl p-4 text-white focus:border-primary outline-none transition-all resize-none" 
                                placeholder="Describe detalladamente el trabajo realizado..." 
                                value={reviewForm.text} 
                                onChange={e => setReviewForm({...reviewForm, text: e.target.value})} 
                              />
                              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                                <span className={missingReviewChars > 0 ? 'text-yellow-400' : 'text-green-400'}>
                                  {missingReviewChars > 0 ? `Faltan ${missingReviewChars} caracteres` : 'Texto suficiente'}
                                </span>
                                <span className="text-gray-600">{reviewTextLength} caracteres</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Fotos de evidencia (opcional, maximo 3)</label>
                              <div className="flex flex-wrap gap-3">
                                {reviewForm.images.map((img, i) => (
                                  <div key={i} className="relative group">
                                    <img loading="lazy" src={img} className="h-20 w-20 object-cover rounded-xl border border-border shadow-md" />
                                    <button 
                                      type="button" 
                                      onClick={() => setReviewForm({...reviewForm, images: reviewForm.images.filter((_, idx) => idx !== i)})}
                                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </div>
                                ))}
                                {reviewForm.images.length < 3 && (
                                  <label className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-600 group">
                                    <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">add_a_photo</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleReviewImagesUpload} />
                                  </label>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-600 mt-2 italic">Para 1-2 estrellas se requiere al menos una foto; en los demas casos es opcional.</p>
                            </div>

                            {reviewError && (
                              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
                                <p className="text-xs text-red-400 font-bold">{reviewError}</p>
                              </div>
                            )}

                            <button 
                              disabled={isSubmittingReview || !reviewIsReady} 
                              type="submit" 
                              className="w-full bg-primary text-background font-black py-4 rounded-xl hover:bg-primary-hover active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                              {isSubmittingReview ? 'Publicando...' : (existingReview ? 'Actualizar Reseña' : 'Publicar Reseña')}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="bg-surface-light/20 p-8 rounded-3xl border border-dashed border-primary/20 text-center">
                          <span className="material-symbols-outlined text-4xl text-primary/40 mb-3">lock</span>
                          <h4 className="text-white font-bold mb-2">Reseñas Verificadas</h4>
                          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">Contacta por WhatsApp a este profesional para desbloquear los tags y la caja de comentarios.</p>
                          <button
                            type="button"
                            onClick={() => onContact(professional)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white hover:bg-green-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                            Contactar por WhatsApp
                          </button>
                        </div>
                      )
                    )
                  )}
                  </section>

                  <RecentWorks professional={professional} isOwner={isOwner} />
                </div>

                <div className="space-y-6">
                  <div className="bg-surface-light/50 p-6 rounded-3xl border border-border shadow-xl">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                      Verificación
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {professional.verified 
                        ? 'Este perfil cuenta con validacion de documentos oficiales por parte de EsMiOficio.'
                        : 'Este perfil está en proceso de validación o aún no ha enviado sus documentos.'}
                    </p>
                    {!professional.verified && isOwner && !isEditing && (
                      <button 
                        onClick={handleRequestVerification}
                        className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">badge</span>
                        Solicitar Verificación
                      </button>
                    )}
                  </div>

                  <div className="bg-surface-light/20 p-6 rounded-3xl border border-border/50">
                      <h4 className="text-white font-bold mb-3 text-sm">Estadísticas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Antigüedad</span>
                          <span className="text-gray-300 font-bold">{professional.yearsExperience} años</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Reseñas</span>
                          <span className="text-gray-300 font-bold">{professional.reviews} recibidas</span>
                        </div>
                        {isOwner && (
                          <>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Perfil completo</span>
                              <span className="text-gray-300 font-bold">{profileCompleteness}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Pendientes</span>
                              <span className="text-gray-300 font-bold">{requestStats.pending}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Confirmados</span>
                              <span className="text-gray-300 font-bold">{requestStats.confirmed}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Terminados</span>
                              <span className="text-gray-300 font-bold">{requestStats.completed}</span>
                            </div>
                          </>
                        )}
                      </div>
                  </div>
                  {!isOwner && (
                    <div className="bg-surface-light/20 p-6 rounded-3xl border border-border/50">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">fact_check</span>
                        Antes de contratar
                      </h4>
                      <div className="space-y-3 mb-5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Disponibilidad</span>
                          <span className="text-gray-300 font-bold">{availability}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Zona estimada</span>
                          <span className="text-gray-300 font-bold">{serviceRadius} km</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Confianza</span>
                          <span className="text-gray-300 font-bold">{leadScore}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {clientChecklistItems.map(item => (
                          <label key={item} className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!clientChecklist[item]}
                              onChange={() => toggleClientChecklist(item)}
                              className="mt-0.5"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isOwner && (
                    <div className="bg-surface-light/20 p-6 rounded-3xl border border-border/50">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">sticky_note_2</span>
                        Nota privada
                      </h4>
                      <textarea
                        value={clientNote}
                        onChange={(e) => setClientNote(e.target.value)}
                        rows={4}
                        maxLength={300}
                        className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-white resize-none focus:border-primary outline-none"
                        placeholder="Ej: cotizo $800, puede venir el viernes..."
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] text-gray-600">{clientNote.length}/300. Solo se guarda en este dispositivo.</p>
                        <button
                          type="button"
                          onClick={copyClientBrief}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:border-primary/50 hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          Copiar resumen
                        </button>
                      </div>
                    </div>
                  )}
                  {/* VIP Tracking Info */}
                  {!isOwner && (
                    <div className="mt-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-3xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary">support_agent</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-1">Mediacion EsMiOficio</h4>
                          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            En EsMiOficio no hacemos el trabajo, pero ayudamos a que nadie se esconda:
                          </p>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-[11px] text-gray-300">
                              <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                              Documentamos datos basicos del caso.
                            </li>
                            <li className="flex items-center gap-3 text-[11px] text-gray-300">
                              <span className="material-symbols-outlined text-primary text-sm">cycle</span>
                              Solicitamos respuesta con lenguaje neutral.
                            </li>
                            <li className="flex items-center gap-3 text-[11px] text-gray-300">
                              <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
                              No prometemos devoluciones, reparaciones obligatorias ni servicio legal.
                            </li>
                          </ul>
                          <Link
                            to={`/reportar/${professional.id}`}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-surface border border-primary/40 px-4 py-3 text-sm font-black text-primary hover:bg-primary/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">flag</span>
                            Reportar o pedir mediacion
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {lightboxImages && (
        <ImageLightbox 
          images={lightboxImages} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxImages(null)} 
        />
      )}
    </>
  );
};

export default ProfileView;


