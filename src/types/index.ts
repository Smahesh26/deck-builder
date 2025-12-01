export interface BusinessData {
  companyName: string;
  website?: string;
  tagline?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  colorPalette?: string[];
  primaryFont?: string;
  fonts?: string[];
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  skuCode?: string;
  imageUrl: string;
  category?: string;
  price?: number;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  thumbnail: string;
  slides: SlideConfig[];
}

export interface SlideConfig {
  type: 'title' | 'products-grid' | 'product-detail' | 'about' | 'contact';
  layout: Record<string, any>;
  styling: Record<string, any>;
}

export interface ProjectData {
  id?: string;
  businessData: BusinessData;
  products: Product[];
  templateId?: string;
}
