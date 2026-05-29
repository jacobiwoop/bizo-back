export type ApiUser = {
  id: string;
  email: string;
  display_name: string;
  username: string | null;
  photo_url: string | null;
  bio: string | null;
  country_code: string | null;
  rating: number;
  review_count: number;
  total_sales: number;
  is_verified: boolean;
  has_seen_onboarding: boolean;
  created_at: string;
};

export type AuthResponse = {
  token: string;
  user: ApiUser;
};

export type ApiMessageResponse = {
  message: string;
};

export type ApiResourceResponse<T> = {
  data: T;
};

export type PaginatedApiResponse<T> = {
  data: T[];
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type ListingType = "VENTE" | "TROC" | "TROC_CASH";
export type ListingAttributes = Record<string, string | number | boolean | string[] | null>;

export type ListingResource = {
  id: string;
  title: string;
  description: string;
  type: ListingType;
  price: number | null;
  cash_complement: number | null;
  exchange_for: string | null;
  category: string;
  attributes: ListingAttributes;
  condition: string;
  delivery_mode: string;
  photos: string[];
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  tags: string[];
  view_count: number;
  favorite_count: number;
  status: string;
  is_boosted: boolean;
  price_history: unknown[];
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  owner: ApiUser | null;
};

export type LaravelValidationErrors = Record<string, string[]>;

export type LaravelErrorResponse = {
  message?: string;
  errors?: LaravelValidationErrors;
};
