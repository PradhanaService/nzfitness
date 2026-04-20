
export interface Program {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
  gallery?: string[];
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  durationText: string;
  features: string[];
  popular?: boolean;
}

export interface Transformation {
  id: string;
  name: string;
  beforeImg: string;
  afterImg: string;
  description: string;
  duration: string;
}

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
}
