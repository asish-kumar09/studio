
import data from './placeholder-images.json';

export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

// Robust export to prevent "undefined" errors
export const PlaceHolderImages: ImagePlaceholder[] = Array.isArray(data?.placeholderImages) 
  ? data.placeholderImages 
  : [];
