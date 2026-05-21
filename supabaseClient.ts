import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  User as FirebaseUser,
  getAuth,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  createClient,
  type RealtimeChannel,
  type Session as SupabaseSession,
} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const supabaseData = createClient(supabaseUrl, supabaseAnonKey);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCNnGN-CWG0oMxi5Ds2oJzvp5rStPCKGpQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'noizefitness-coimbatore.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'noizefitness-coimbatore',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'noizefitness-coimbatore.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '953365004594',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:953365004594:web:3013b2cdf3fe25d3e9972b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-R3P00XNB6Q',
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

let phoneConfirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
const EMAIL_OTP_SESSION_STORAGE_KEY = 'noize_email_otp_session';
const EMAIL_OTP_AUTH_EVENT = 'noize-email-otp-auth-change';

export interface Offer {
  id: string;
  title: string;
  description: string;
  price_text: string;
  valid_till: string;
  is_active: boolean;
  created_at: string;
}

export type MembershipCategory = 'offline' | 'online' | 'home_workout';

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  tagline: string;
  features: string[];
  category: MembershipCategory;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface AppImage {
  id: string;
  section_key: string;
  image_data: string;
  updated_at: string;
}

export interface DatabaseReview {
  id: string;
  name: string;
  text: string;
  rating: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface PortalContent {
  id?: string;
  section_key: 'offline_workout' | 'special_offers' | 'online_workout' | 'home_workout';
  title: string;
  description: string;
  features: string[];
  updated_at?: string;
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  user_metadata: {
    full_name?: string | null;
  };
}

type StoredEmailOtpSession = {
  email: string;
  verifiedAt: string;
};

const mapSupabaseUser = (session: SupabaseSession | null): { user: User } | null => {
  const user = session?.user;
  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      user_metadata: {
        full_name:
          (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
          (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
          null,
      },
    },
  };
};

const mapFirebaseUser = (user: FirebaseUser | null): { user: User } | null => {
  if (!user) return null;

  return {
    user: {
      id: user.uid,
      email: user.email,
      phone: user.phoneNumber,
      user_metadata: {
        full_name: user.displayName,
      },
    },
  };
};

const readStoredEmailOtpSession = (): StoredEmailOtpSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(EMAIL_OTP_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredEmailOtpSession>;
    if (typeof parsed.email !== 'string' || typeof parsed.verifiedAt !== 'string') {
      return null;
    }

    return {
      email: parsed.email.trim().toLowerCase(),
      verifiedAt: parsed.verifiedAt,
    };
  } catch {
    return null;
  }
};

const mapStoredEmailOtpSession = (session: StoredEmailOtpSession | null): { user: User } | null => {
  if (!session?.email) return null;

  return {
    user: {
      id: `email-otp:${session.email}`,
      email: session.email,
      phone: null,
      user_metadata: {
        full_name: null,
      },
    },
  };
};

const emitEmailOtpAuthChange = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EMAIL_OTP_AUTH_EVENT));
};

const storeEmailOtpSession = (session: StoredEmailOtpSession) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(EMAIL_OTP_SESSION_STORAGE_KEY, JSON.stringify(session));
  emitEmailOtpAuthChange();
};

const clearEmailOtpSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(EMAIL_OTP_SESSION_STORAGE_KEY);
  emitEmailOtpAuthChange();
};

const makeError = (message: string, code?: string) => ({ message, code });

const parseFunctionError = async (error: unknown, fallbackMessage: string) => {
  if (error instanceof FunctionsHttpError) {
    try {
      const response = await error.context.json();
      const message =
        typeof response?.error === 'string'
          ? response.error
          : typeof response?.message === 'string'
            ? response.message
            : fallbackMessage;
      const code = typeof response?.code === 'string' ? response.code : error.name;
      return makeError(message, code);
    } catch {
      return makeError(fallbackMessage, error.name);
    }
  }

  if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
    return makeError(error.message || fallbackMessage, error.name);
  }

  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: string }).message === 'string') {
    return makeError((error as { message: string; name?: string }).message, (error as { name?: string }).name);
  }

  return makeError(fallbackMessage);
};

const mapFirebaseAuthError = (error: any, fallbackMessage: string) => {
  const code = error?.code as string | undefined;

  switch (code) {
    case 'auth/operation-not-allowed':
      return makeError(
        'This Firebase sign-in method is disabled. In Firebase Console, enable Authentication -> Sign-in method -> Phone.',
        code,
      );
    case 'auth/unauthorized-domain':
      return makeError(
        'This domain is not authorized for Firebase Authentication. Add the current site under Firebase Authentication -> Settings -> Authorized domains.',
        code,
      );
    case 'auth/invalid-app-credential':
    case 'auth/captcha-check-failed':
      return makeError(
        'Phone verification could not start. Confirm Phone sign-in is enabled in Firebase and the current domain is authorized for Firebase Authentication.',
        code,
      );
    default:
      return makeError(error?.message || fallbackMessage, code);
  }
};

const ensureRecaptchaContainer = () => {
  const containerId = 'firebase-phone-recaptcha';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.width = '1px';
    container.style.height = '1px';
    document.body.appendChild(container);
  }
  return container;
};

const ensurePhoneVerifier = () => {
  if (recaptchaVerifier) return recaptchaVerifier;

  const container = ensureRecaptchaContainer();
  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, container, {
    size: 'invisible',
  });
  return recaptchaVerifier;
};

const getMergedSession = async () => {
  const { data, error } = await supabaseData.auth.getSession();
  if (error) {
    return { data: { session: null }, error };
  }

  const supabaseSession = mapSupabaseUser(data.session);
  if (supabaseSession) {
    return { data: { session: supabaseSession }, error: null };
  }

  const emailOtpSession = mapStoredEmailOtpSession(readStoredEmailOtpSession());
  if (emailOtpSession) {
    return {
      data: {
        session: emailOtpSession,
      },
      error: null,
    };
  }

  return {
    data: {
      session: mapFirebaseUser(firebaseAuth.currentUser),
    },
    error: null,
  };
};

type AuthCallback = (_event: string, session: { user: User } | null) => void;

const emitMergedSession = async (callback: AuthCallback, event: string, preferredSession?: SupabaseSession | null) => {
  if (preferredSession) {
    callback(event, mapSupabaseUser(preferredSession));
    return;
  }

  const { data } = await supabaseData.auth.getSession();
  const currentSession =
    mapSupabaseUser(data.session) ||
    mapStoredEmailOtpSession(readStoredEmailOtpSession()) ||
    mapFirebaseUser(firebaseAuth.currentUser);
  callback(currentSession ? event : 'SIGNED_OUT', currentSession);
};

export const supabase = {
  from: supabaseData.from.bind(supabaseData),
  channel: supabaseData.channel.bind(supabaseData),
  removeChannel: (channel: RealtimeChannel) => supabaseData.removeChannel(channel),
  functions: {
    invoke: supabaseData.functions.invoke.bind(supabaseData.functions),
  },
  auth: {
    clearEmailOtpSession() {
      clearEmailOtpSession();
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const { data, error } = await supabaseData.auth.signInWithPassword({ email, password });
      return {
        data: { user: mapSupabaseUser(data.session)?.user ?? null },
        error: error ? makeError(error.message, error.code) : null,
      };
    },

    async signInWithOtp({
      phone,
      email,
      options,
    }: {
      phone?: string;
      email?: string;
      options?: {
        emailRedirectTo?: string;
        shouldCreateUser?: boolean;
      };
    }) {
      if (email) {
        try {
          const { data } = await supabaseData.functions.invoke('send-email-otp', {
            body: {
              email,
              redirectTo: options?.emailRedirectTo,
            },
          });

          return {
            data: { user: (data as any)?.user ?? null },
            error: null,
          };
        } catch (error) {
          return {
            data: { user: null },
            error: await parseFunctionError(error, 'Failed to send OTP. Try again.'),
          };
        }
      }

      if (!phone) {
        return { data: {}, error: makeError('Phone number is required to send OTP.') };
      }

      try {
        const verifier = ensurePhoneVerifier();
        phoneConfirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
        return { data: {}, error: null };
      } catch (error: any) {
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          recaptchaVerifier = null;
        }
        return { data: {}, error: mapFirebaseAuthError(error, 'Failed to send OTP.') };
      }
    },

    async verifyOtp({
      phone,
      email,
      token,
      token_hash,
      type,
    }: {
      phone?: string;
      email?: string;
      token: string;
      token_hash?: string;
      type: string;
    }) {
      if (type === 'email') {
        if (token_hash) {
          const { data, error } = await supabaseData.auth.verifyOtp({
            token_hash,
            type: 'email',
          } as any);

          return {
            data: { user: mapSupabaseUser(data.session)?.user ?? null },
            error: error ? makeError(error.message, error.code) : null,
          };
        }

        if (!email) {
          return {
            data: { user: null },
            error: makeError('Email address is required to verify email OTP.'),
          };
        }

        try {
         const { data, error: fnError } = await supabaseData.functions.invoke('verify-email-otp', {
  body: {
    email,
    token,
  },
});

// ✅ Check if backend explicitly returned success
// ✅ FIXED — passes error code from backend
if (fnError || !data?.success) {
  return {
    data: { user: null },
    error: makeError(
      data?.error || 'Invalid OTP. Please try again.',
      data?.code || 'otp_invalid'
    ),
  };
}

// ✅ Only reach here if OTP is genuinely correct
const verifiedEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';

if (!verifiedEmail) {
  return {
    data: { user: null },
    error: makeError('OTP verification failed. Please try again.'),
  };
}

storeEmailOtpSession({
  email: verifiedEmail,
  verifiedAt: new Date().toISOString(),
});

return {
  data: {
    user: {
      id: `email-otp:${verifiedEmail}`,
      email: verifiedEmail,
      phone: null,
      user_metadata: {
        full_name: null,
      },
    },
  },
  error: null,
};
        } catch (error) {
          return {
            data: { user: null },
            error: await parseFunctionError(error, 'OTP verification failed.'),
          };
        }
      }

      if (!phone) {
        return {
          data: { user: null },
          error: makeError('Phone number is required to verify SMS OTP.'),
        };
      }

      try {
        if (!phoneConfirmationResult) {
          throw new Error('OTP session expired. Please request a new code.');
        }

        const credential = await phoneConfirmationResult.confirm(token);
        phoneConfirmationResult = null;
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          recaptchaVerifier = null;
        }

        return {
          data: { user: mapFirebaseUser(credential.user)?.user ?? null },
          error: null,
        };
      } catch (error: any) {
        return {
          data: { user: null },
          error: mapFirebaseAuthError(error, 'OTP verification failed.'),
        };
      }
    },

    async signOut() {
      const supabaseResult = await supabaseData.auth.signOut();
      clearEmailOtpSession();
      try {
        await firebaseSignOut(firebaseAuth);
      } catch {
        // Ignore Firebase sign-out failures if no phone user is active.
      }

      return {
        error: supabaseResult.error ? makeError(supabaseResult.error.message, supabaseResult.error.code) : null,
      };
    },

    async getSession() {
      const { data } = await getMergedSession();
      return { data };
    },

    onAuthStateChange(callback: AuthCallback) {
      const {
        data: { subscription: supabaseSubscription },
      } = supabaseData.auth.onAuthStateChange((event, session) => {
        void emitMergedSession(callback, event, session);
      });

      const firebaseSubscription = onAuthStateChanged(firebaseAuth, () => {
        void emitMergedSession(callback, 'SIGNED_IN');
      });

      const handleEmailOtpSessionChange = () => {
        void emitMergedSession(callback, 'SIGNED_IN');
      };

      if (typeof window !== 'undefined') {
        window.addEventListener(EMAIL_OTP_AUTH_EVENT, handleEmailOtpSessionChange);
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              supabaseSubscription.unsubscribe();
              firebaseSubscription();
              if (typeof window !== 'undefined') {
                window.removeEventListener(EMAIL_OTP_AUTH_EVENT, handleEmailOtpSessionChange);
              }
            },
          },
        },
      };
    },
  },
};
