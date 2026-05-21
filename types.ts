import React from 'react';

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

export interface TrainingType {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}

export interface PortalContentSection {
  section_key: 'offline_workout' | 'special_offers' | 'online_workout' | 'home_workout';
  title: string;
  description: string;
  features: string[];
}

export type MembershipCategory = 'offline' | 'online' | 'home_workout';
