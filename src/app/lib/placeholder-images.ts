
import data from './placeholder-images.json';

export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

/**
 * Standardized utility for placeholder images.
 * Ensures data is always an array and prevents hydration/null-pointer errors.
 */
export const PlaceHolderImages: ImagePlaceholder[] = 
  data && Array.isArray((data as any).placeholderImages) 
    ? (data as any).placeholderImages 
    : [];
