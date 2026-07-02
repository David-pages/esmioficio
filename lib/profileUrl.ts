import type { Professional } from '../types';
import { getAbsoluteUrl } from './siteUrl';

export const toProfileSlug = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const getProfileSlug = (professional: Pick<Professional, 'name' | 'trade' | 'municipality'>) => (
  `${toProfileSlug(professional.name)}-${toProfileSlug(professional.trade)}-${toProfileSlug(professional.municipality || 'mexico')}`
);

export const getProfilePath = (professional: Pick<Professional, 'name' | 'trade' | 'municipality'>) => (
  `/perfil/${getProfileSlug(professional)}`
);

export const getProfileUrl = (professional: Pick<Professional, 'name' | 'trade' | 'municipality'>) => (
  getAbsoluteUrl(getProfilePath(professional))
);
