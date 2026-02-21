
import data from './placeholder-images.json';

export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

// Ensure the export is always an array to prevent "find" errors on undefined
export const PlaceHolderImages: ImagePlaceholder[] = data?.placeholderImages || [];
