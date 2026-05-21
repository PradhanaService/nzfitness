export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  badge: string;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  position: number;
}

export interface OfferClaim {
  phone: string;
  offer_id: string;
  claimed: boolean;
  skipped: boolean;
}
