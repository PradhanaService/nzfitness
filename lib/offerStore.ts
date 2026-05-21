'use client';

const CONTACT_KEY = 'offerContact';
const VERIFIED_KEY = 'offerVerified';
const INDEX_KEY = 'offerIndex';

const canUseStorage = () => typeof window !== 'undefined';

export const offerStore = {
  keys: {
    contact: CONTACT_KEY,
    verified: VERIFIED_KEY,
    index: INDEX_KEY,
  },

  getContact() {
    if (!canUseStorage()) return '';
    return window.localStorage.getItem(CONTACT_KEY) ?? '';
  },

  setContact(contact: string) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(CONTACT_KEY, contact);
  },

  isVerified() {
    if (!canUseStorage()) return false;
    return window.localStorage.getItem(VERIFIED_KEY) === 'true';
  },

  setVerified(value: boolean) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(VERIFIED_KEY, String(value));
  },

  getOfferIndex() {
    if (!canUseStorage()) return 0;
    const raw = window.localStorage.getItem(INDEX_KEY);
    const parsed = Number(raw ?? '0');
    return Number.isFinite(parsed) ? parsed : 0;
  },

  setOfferIndex(index: number) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(INDEX_KEY, String(index));
  },

  clear() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(CONTACT_KEY);
    window.localStorage.removeItem(VERIFIED_KEY);
    window.localStorage.removeItem(INDEX_KEY);
  },
};
