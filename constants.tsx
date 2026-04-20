
import React from 'react';
import { Program, Plan, Transformation, Review } from './types';

export const PROGRAMS: Program[] = [
  {
    id: 'transformation',
    title: 'Transformation',
    description: 'Complete body transformation programs with personalized training and nutrition guidance.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    imageUrl: '/images/before-after-2.png',
    gallery: ['/images/before-after-2.png', '/images/before-after-1.png', '/images/gallery-1.jpg', '/images/gallery-2.jpg']
  },
  {
    id: 'crossfit',
    title: 'CrossFit',
    description: 'High-intensity functional movements designed to push your athletic limits.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    imageUrl: '/images/crossfit.jpg',
    gallery: ['/images/crossfit.jpg', '/images/gallery-3.jpg', '/images/gallery-4.jpg', '/images/bodybuilding.jpg']
  },
  {
    id: 'zumba',
    title: 'Zumba',
    description: 'Find your rhythm, burn calories, and move to the beat in our high-energy, fun Zumba classes.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    imageUrl: '/images/zumba-yog.jpg',
    gallery: ['/images/zumba-yog.jpg', '/images/gallery-5.jpg', '/images/functional-training.jpg', '/images/gallery-1.jpg']
  },
  {
    id: 'yoga',
    title: 'Yoga',
    description: 'Find your center, improve flexibility, and recover with our guided mindful Yoga sessions.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 0a4 4 0 100 8 4 4 0 000-8zm-4 4h8" /></svg>,
    imageUrl: '/images/gallery-5.jpg',
    gallery: ['/images/gallery-5.jpg', '/images/zumba-yog.jpg', '/images/gallery-1.jpg', '/images/functional-training.jpg']
  },
  {
    id: 'functional',
    title: 'Functional Training',
    description: 'Real-world strength training for longevity, mobility, and everyday power.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
    imageUrl: '/images/functional-training.jpg',
    gallery: ['/images/functional-training.jpg', '/images/gallery-2.jpg', '/images/bodybuilding.jpg', '/images/crossfit.jpg']
  }
];

export const PLANS: Plan[] = [
  {
    id: 'p1',
    name: 'Basic',
    price: '₹2,460',
    durationText: '1 Month Membership',
    features: ['Access to all equipment', 'General workout plan', 'Women-Friendly Access', 'Free Diet Guidance']
  },
  {
    id: 'p2',
    name: 'Standard',
    price: '₹4,990',
    durationText: 'Pay 3 Months • Train 6 Months',
    features: ['Access to all equipment', 'General workout plan', 'Women-Friendly Access', 'Free Diet Guidance', 'Save 50% Extra Time']
  },
  {
    id: 'p3',
    name: 'Pro Choice',
    price: '₹7,499',
    durationText: 'Pay 6 Months • Train 9 Months',
    features: ['Everything in Standard', 'Personal locker access', 'Advanced Training Guides', 'Priority Support'],
    popular: true
  },
  {
    id: 'p4',
    name: 'Elite Annual',
    price: '₹12,260',
    durationText: 'Pay 1 Year • Train 1.5 Years',
    features: ['All Programs Included', 'Personalized Online Coaching', 'Exclusive Weekend Outdoor Events', 'Premium Nutrition Planning']
  }
];

export const TRANSFORMATIONS: Transformation[] = [
  {
    id: 't1',
    name: 'Anjali R.',
    beforeImg: '/images/before-after-1.png',
    afterImg: '/images/before-after-1.png',
    description: 'Lost 15kg and found a whole new level of confidence in just 12 weeks.',
    duration: '90 Days'
  },
  {
    id: 't2',
    name: 'Vikram S.',
    beforeImg: '/images/before-after-2.png',
    afterImg: '/images/before-after-2.png',
    description: 'Transformed my physique and strength levels with the bodybuilding program.',
    duration: '6 Months'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Divya (Renu)',
    text: 'I had an excellent workout experience with the Noize Fitness team. The trainer, Raj, is highly professional and polite. He provides clear guidance on every workout posture and encourages us to give our best. His consistent motivation and follow-ups truly help in improving our fitness and confidence.',
    rating: 5
  },
  {
    id: 'r2',
    name: 'Swaminathan B',
    text: 'Noize Gym is a great place to work out with good facilities and a positive vibe. Trainer Raj is very friendly and maintains a really good relationship with clients. He motivates and guides well, making the workouts enjoyable and effective.',
    rating: 5
  },
  {
    id: 'r3',
    name: 'Karpakam K',
    text: 'Raj is such a friendly trainer. His diet plans are simple & easy to follow, nothing too fancy. Strength training sessions are really good and I can already see the difference in my stamina and inch loss. He motivates me every session. Totally recommend him if you want someone who actually cares about your progress!',
    rating: 5
  }
];
