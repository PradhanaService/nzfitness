import React, { useState, useEffect } from 'react';
import { supabase, Offer, MembershipPlan, AppImage, PortalContent, MembershipCategory } from './supabaseClient';
import type { User } from './supabaseClient';

const MEMBERSHIP_CATEGORY_OPTIONS: { value: MembershipCategory; label: string }[] = [
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'home_workout', label: 'Home Workout' },
];

const getMembershipCategoryLabel = (category?: MembershipCategory | null) =>
  MEMBERSHIP_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || 'Offline';

const normalizeMembershipCategory = (category?: string | null): MembershipCategory => {
  if (category === 'online' || category === 'home_workout') {
    return category;
  }
  return 'offline';
};

const isPortalContentTableMissing = (message?: string) =>
  typeof message === 'string' && message.toLowerCase().includes("could not find the table 'public.portal_content'");

const getRlsFixMessage = (tableName: 'membership_plans' | 'section_images', message?: string) => {
  if (typeof message !== 'string') return message || 'Request failed.';
  if (!message.toLowerCase().includes('row-level security policy')) return message;

  return `Supabase blocked this ${tableName.replace('_', ' ')} write because the table RLS policy is incomplete. Run SUPABASE_RLS_FIX.sql in the Supabase SQL Editor, then try the admin update again.`;
};

const scrollToEditor = (element: HTMLFormElement | null) => {
  if (!element || typeof window === 'undefined') return;
  window.requestAnimationFrame(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

// Login Component
const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-gold/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">ADMIN LOGIN</h1>
          <p className="text-neutral-400">NOIZE Fitness Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-black font-black py-4 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Offers Management Component
const OffersManagement: React.FC = () => {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_text: '',
    valid_till: '2099-12-31',
    is_active: true,
  });

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOffers(data);
    if (error) setErrorMessage(error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (editingOffer) {
      // Update existing offer
      const { error } = await supabase
        .from('offers')
        .update(formData)
        .eq('id', editingOffer.id);

      if (error) {
        setErrorMessage(getRlsFixMessage('membership_plans', error.message));
        setSaving(false);
        return;
      }
    } else {
      // Create new offer
      const { error } = await supabase
        .from('offers')
        .insert([formData]);
      
      if (error) {
        setErrorMessage(error.message || 'Failed to create offer. You may have reached the 5 offers per year limit.');
        setSaving(false);
        return;
      }
    }

    setSuccessMessage(editingOffer ? 'Offer updated.' : 'Offer created.');
    setFormData({ title: '', description: '', price_text: '', valid_till: '2099-12-31', is_active: true });
    setEditingOffer(null);
    setShowForm(false);
    await fetchOffers();
    setSaving(false);
  };

  const handleEdit = (offer: Offer) => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      price_text: offer.price_text,
      valid_till: offer.valid_till,
      is_active: offer.is_active,
    });
    setShowForm(true);
    scrollToEditor(formRef.current);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      setErrorMessage('');
      setSuccessMessage('');
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setSuccessMessage('Offer deleted.');
      fetchOffers();
    }
  };

  const toggleActive = async (offer: Offer) => {
    setErrorMessage('');
    setSuccessMessage('');
    const { error } = await supabase
      .from('offers')
      .update({ is_active: !offer.is_active })
      .eq('id', offer.id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    fetchOffers();
  };

  if (loading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">Manage Specific Offers</h2>
          <p className="text-neutral-400 text-sm mt-2">
            These offers feed the verified offline specific-offers portal and can also be previewed from admin.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open('/offline-offers?preview=admin', '_blank')}
            className="px-5 py-2 rounded-full border border-gold/30 text-gold font-bold hover:bg-gold hover:text-black transition-all"
          >
            Open Specific Offers Portal
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingOffer(null);
              setErrorMessage('');
              setSuccessMessage('');
              setFormData({ title: '', description: '', price_text: '', valid_till: '2099-12-31', is_active: true });
              if (!showForm) {
                scrollToEditor(formRef.current);
              }
            }}
            className="gold-gradient text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-all"
          >
            {showForm ? 'Cancel' : '+ Add Offer'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm">
          {successMessage}
        </div>
      )}

      <MembershipPortalContentManagement />

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-gold/30 space-y-4">
          <h3 className="text-xl font-bold text-white">{editingOffer ? 'Edit Offer' : 'New Offer'}</h3>
          
          <div>
            <label className="block text-white font-bold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>

                    <div>
            <label className="block text-white font-bold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Price Text *</label>
            <input
              type="text"
              value={formData.price_text}
              onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5"
            />
            <label className="text-white font-bold">Active (visible to visitors)</label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full gold-gradient text-black font-black py-3 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'SAVING...' : editingOffer ? 'Update Offer' : 'Create Offer'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-neutral-400 mb-2">{offer.description}</p>
                <p className="text-gold font-bold">{offer.price_text}</p>
                <p className="text-sm text-neutral-500 mt-2">Valid till: {new Date(offer.valid_till).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${offer.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {offer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(offer)}
                className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-bold hover:bg-blue-500/30 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(offer)}
                className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg font-bold hover:bg-yellow-500/30 transition-all"
              >
                {offer.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(offer.id)}
                className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg font-bold hover:bg-red-500/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <div className="text-center text-neutral-400 py-12">
            No offers yet. Click "Add Offer" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

// Membership Plans Management Component
const PlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: '',
    tagline: '',
    features: [''],
    category: 'offline' as MembershipCategory,
    is_popular: false,
    is_active: true,
    display_order: 0,
  });

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setPlans(data);
    if (error) setErrorMessage(error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const planData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
    };

    if (editingPlan) {
      const { error } = await supabase
        .from('membership_plans')
        .update(planData)
        .eq('id', editingPlan.id);

      if (error) {
        setErrorMessage(getRlsFixMessage('membership_plans', error.message));
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('membership_plans')
        .insert([planData]);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }
    }

    setSuccessMessage(editingPlan ? 'Plan updated.' : 'Plan created.');
    setFormData({ name: '', price: 0, duration: '', tagline: '', features: [''], category: 'offline', is_popular: false, is_active: true, display_order: 0 });
    setEditingPlan(null);
    setShowForm(false);
    await fetchPlans();
    setSaving(false);
  };

  const handleEdit = (plan: MembershipPlan) => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      tagline: plan.tagline,
      features: Array.isArray(plan.features) ? plan.features : [''],
      category: plan.category || 'offline',
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      display_order: plan.display_order,
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setErrorMessage('');
      setSuccessMessage('');
      const { error } = await supabase.from('membership_plans').delete().eq('id', id);
      if (error) {
        setErrorMessage(getRlsFixMessage('membership_plans', error.message));
        return;
      }
      setSuccessMessage('Plan deleted.');
      fetchPlans();
    }
  };

  const toggleActive = async (plan: MembershipPlan) => {
    setErrorMessage('');
    setSuccessMessage('');
    const { error } = await supabase
      .from('membership_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id);
    if (error) {
      setErrorMessage(getRlsFixMessage('membership_plans', error.message));
      return;
    }
    fetchPlans();
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const openCreateForm = (category: MembershipCategory = 'offline') => {
    setShowForm(true);
    setEditingPlan(null);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({
      name: '',
      price: 0,
      duration: '',
      tagline: '',
      features: [''],
      category,
      is_popular: false,
      is_active: true,
      display_order: 0,
    });
  };

  const closeEditor = () => {
    setShowForm(false);
    setEditingPlan(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const renderPlanForm = () => (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-bold mb-2">Plan Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-white font-bold mb-2">Price (Rs.) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-bold mb-2">Duration *</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
            placeholder="e.g., 1 Month, Pay 3M Train 6M"
            required
          />
        </div>

        <div>
          <label className="block text-white font-bold mb-2">Membership Type *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as MembershipCategory })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
            required
          >
            {MEMBERSHIP_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0E0E0E] text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-bold mb-2">Display Order</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-bold mb-2">Tagline *</label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
          placeholder="e.g., Perfect for beginners"
          required
        />
      </div>

      <div>
        <label className="block text-white font-bold mb-2">Features</label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              placeholder="Feature description"
            />
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="px-4 py-2 bg-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/30 transition-all"
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addFeature}
          className="text-gold font-bold hover:underline"
        >
          + Add Feature
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.is_popular}
            onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
            className="w-5 h-5"
          />
          <label className="text-white font-bold">Mark as Popular</label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-5 h-5"
          />
          <label className="text-white font-bold">Active</label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 gold-gradient text-black font-black py-3 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'SAVING...' : editingPlan ? 'Update Plan' : 'Create Plan'}
        </button>
        <button
          type="button"
          onClick={closeEditor}
          className="px-6 py-3 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
      </div>
    </>
  );

  const groupedPlans = MEMBERSHIP_CATEGORY_OPTIONS.map((option) => ({
    ...option,
    plans: plans.filter((plan) => normalizeMembershipCategory(plan.category) === option.value),
  }));

  if (loading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Manage Membership Plans</h2>
        <button
          onClick={() => {
            if (showForm || editingPlan) {
              closeEditor();
            } else {
              openCreateForm('offline');
            }
          }}
          className="gold-gradient text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add Plan'}
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm">
          {successMessage}
        </div>
      )}

      {showForm && !editingPlan && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-gold/30 space-y-4">
          <h3 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'New Plan'}</h3>
          {renderPlanForm()}
        </form>
      )}

      <div className="grid gap-6">
        {groupedPlans.map((section) => (
          <div key={section.value} className="glass rounded-3xl p-6 border border-gold/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-2">Plan Portal</p>
                <h3 className="text-2xl md:text-3xl font-black text-white">{section.label}</h3>
                <p className="text-neutral-400 text-sm mt-2">
                  Manage all {section.label.toLowerCase()} membership plans from this section.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-widest">
                  {section.plans.length} Plan{section.plans.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => openCreateForm(section.value)}
                  className="gold-gradient text-black font-bold py-2.5 px-5 rounded-full hover:scale-105 transition-all"
                >
                  + Add {section.label} Plan
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {section.plans.length > 0 ? (
                section.plans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl p-6 border border-white/10 bg-black/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">{plan.name}</h4>
                        <p className="text-gold text-2xl font-black mb-2">Rs. {plan.price}</p>
                        <p className="text-neutral-400 text-sm mb-1">{plan.duration}</p>
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">
                          Type: {getMembershipCategoryLabel(plan.category)}
                        </p>
                        <p className="text-neutral-300 mb-3">Current Tagline: {plan.tagline}</p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="text-neutral-400 text-sm flex items-center gap-2">
                              <span className="text-gold">&#10003;</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-center ${plan.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {plan.is_popular && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold text-center">
                            Popular
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 text-center">
                          Order: {plan.display_order}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-bold hover:bg-blue-500/30 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(plan)}
                        className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg font-bold hover:bg-yellow-500/30 transition-all"
                      >
                        {plan.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg font-bold hover:bg-red-500/30 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                    {editingPlan?.id === plan.id && (
                      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-gold/30 bg-white/[0.03] p-6 space-y-4">
                        <h4 className="text-lg font-bold text-white">Edit {plan.name}</h4>
                        {renderPlanForm()}
                      </form>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-neutral-400">
                  No {section.label.toLowerCase()} plans yet. Use <span className="text-white font-bold">Add {section.label} Plan</span> to create one.
                </div>
              )}
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="text-center text-neutral-400 py-6">
            No plans yet. Start by adding an offline, online, or home workout plan.
          </div>
        )}
      </div>
    </div>
  );
};

// Gallery Management Component
const GalleryManagement: React.FC = () => {
  const [images, setImages] = useState<AppImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const PORTAL_CATEGORIES = [
    { prefix: 'hero_media', label: 'Home Hero Slider' },
    { prefix: 'gym_media', label: 'Dynamic Gym Feed (Grid & Slider)' },
    { prefix: 'program_transformation', label: 'Program Gallery: Transformation' },
    { prefix: 'program_crossfit', label: 'Program Gallery: CrossFit' },
    { prefix: 'program_zumba', label: 'Program Gallery: Zumba' },
    { prefix: 'program_yoga', label: 'Program Gallery: Yoga' },
    { prefix: 'program_functional', label: 'Program Gallery: Functional Training' },
    { prefix: 'transformation_1', label: 'Transformation Zone: Slide 1 Before/After' },
    { prefix: 'transformation_2', label: 'Transformation Zone: Slide 2 Before/After' },
    { prefix: 'bg_philosophy', label: 'The Noize Philosophy: Background' },
    { prefix: 'bg_programs', label: 'Training Universe: Background' },
    { prefix: 'highlight_1', label: 'Weekly Highlights: Frame 1' },
    { prefix: 'highlight_2', label: 'Weekly Highlights: Frame 2' },
    { prefix: 'highlight_3', label: 'Weekly Highlights: Frame 3' },
    { prefix: 'gallery_image', label: 'The Vibe: Photo Grid Image' },
    { prefix: 'gallery_video', label: 'Action Moments: Live Session Video' },
  ];

  const [formData, setFormData] = useState({
    prefix: 'hero_media',
    image_data: '',
  });

  const MAX_INLINE_IMAGE_DATA_URL_LENGTH = 850000;

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read the selected file.'));
      reader.readAsDataURL(file);
    });

  const loadImageElement = (dataUrl: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to process the selected image.'));
      image.src = dataUrl;
    });

  const prepareImageForDatabase = async (file: File) => {
    const originalDataUrl = await readFileAsDataUrl(file);
    if (originalDataUrl.length <= MAX_INLINE_IMAGE_DATA_URL_LENGTH) {
      return originalDataUrl;
    }

    const image = await loadImageElement(originalDataUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('This browser could not prepare the image for upload.');
    }

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let quality = 0.82;
    let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

    while (compressedDataUrl.length > MAX_INLINE_IMAGE_DATA_URL_LENGTH && quality > 0.4) {
      quality -= 0.08;
      compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    if (compressedDataUrl.length > MAX_INLINE_IMAGE_DATA_URL_LENGTH) {
      throw new Error('This image is still too large for free Firestore upload. Try a smaller image.');
    }

    return compressedDataUrl;
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('section_images')
        .select('*')
        .order('updated_at', { ascending: false });

      if (data) setImages(data);
      if (error) {
        setErrorMessage(getRlsFixMessage('section_images', error.message));
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to load site images.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be under 10MB for database-backed uploads.');
      e.target.value = '';
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (file.type.startsWith('video/')) {
        setErrorMessage('Video uploads are disabled in database-only mode. Use image uploads here, or host videos separately.');
        e.target.value = '';
        return;
      }

      const imageData = await prepareImageForDatabase(file);
      setFormData(prev => ({ ...prev, image_data: imageData }));
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to prepare the selected image.');
      e.target.value = '';
    }
  };

  const clearSelection = () => {
    setFormData(prev => ({ ...prev, image_data: '' }));
    const fileInput = document.getElementById('imageUploadInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_data) {
      setErrorMessage('Please capture or select an image file first.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Generate unique key using prefix and timestamp
    const uniqueKey = `${formData.prefix}_${Date.now()}`;

    const { error } = await supabase
      .from('section_images')
      .upsert({ 
        section_key: uniqueKey, 
        image_data: formData.image_data, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'section_key' });

    if (error) {
      setErrorMessage(getRlsFixMessage('section_images', error.message));
    } else {
      setSuccessMessage('Image successfully added to gallery. Live website updated!');
      setFormData(prev => ({ ...prev, image_data: '' }));
      const fileInput = document.getElementById('imageUploadInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchImages();
    }
    setSaving(false);
  };

  const handleDelete = async (section_key: string) => {
    if (confirm('Are you sure you want to completely delete this image?')) {
      const { error } = await supabase.from('section_images').delete().eq('section_key', section_key);
      if (error) setErrorMessage(getRlsFixMessage('section_images', error.message));
      else {
        setSuccessMessage('Image deleted from gallery.');
        fetchImages();
      }
    }
  };

  if (loading) return <div className="text-white text-center p-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6 border border-gold/30 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Upload Site Images & Slides</h2>
          <p className="text-neutral-400 text-sm">Select a portal category and upload a new image. You can upload multiple images to the same category to create dynamic galleries/sliders.</p>
        </div>

        {errorMessage && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-500 text-sm">{errorMessage}</div>}
        {successMessage && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-500 text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-bold mb-2">Portal Category / Display Section *</label>
            <select
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            >
              {PORTAL_CATEGORIES.map(c => <option key={c.prefix} value={c.prefix}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Media File (JPG, PNG, WEBP, MP4 - Max 10MB) *</label>
            <p className="text-xs text-neutral-500 mb-3">
              This setup stores compressed images directly in Supabase. Video uploads are disabled in this database-only mode.
            </p>
            
            {!formData.image_data && (
              <input
                id="imageUploadInput"
                type="file"
                accept="image/*,video/mp4"
                onChange={handleFileChange}
                className="w-full bg-black/40 border-2 border-dashed border-white/10 hover:border-gold/50 cursor-pointer rounded-2xl px-4 py-10 tracking-wide text-neutral-400 focus:outline-none file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gold file:text-black hover:file:bg-yellow-400 text-center transition-all"
                required={!formData.image_data}
              />
            )}

            {formData.image_data && (
               <div className="mt-4 relative rounded-2xl overflow-hidden border border-white/10 aspect-video md:w-3/4 max-h-[500px] bg-black group">
                 {formData.image_data.startsWith('data:video/') ? (
                   <video src={formData.image_data} className="w-full h-full object-contain" autoPlay muted loop playsInline />
                 ) : (
                   <img src={formData.image_data} className="w-full h-full object-contain" alt="Preview Upload" />
                 )}
                 <div className="absolute top-4 right-4 flex flex-col md:flex-row gap-2 z-10">
                    <button 
                      type="button" 
                      onClick={clearSelection}
                      className="px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white text-xs font-black tracking-widest uppercase rounded-full shadow-lg backdrop-blur-md transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      Remove
                    </button>
                    <div className="px-4 py-2 bg-green-500/90 text-black text-xs font-black tracking-widest uppercase rounded-full shadow-lg backdrop-blur-md flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      Ready To Deploy
                    </div>
                 </div>
               </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !formData.image_data}
            className="w-full gold-gradient text-black font-black py-4 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            {saving ? 'UPLOADING...' : 'ADD TO PORTAL GALLERY'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-white">Live Overrides Catalog</h3>
        <p className="text-neutral-400 text-sm">All uploaded images shown here override the default site assets. If multiple images are in the same category, they will form a dynamic slider/gallery.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(img => {
            const prefixMatch = PORTAL_CATEGORIES.find(c => img.section_key.startsWith(c.prefix));
            const displayName = prefixMatch ? prefixMatch.label : img.section_key;

            return (
              <div key={img.id} className="glass rounded-xl overflow-hidden border border-white/10 flex flex-col">
                <div className="h-40 w-full relative bg-neutral-900 border-b border-white/5">
                  {img.image_data.startsWith('data:video/') ? (
                    <video src={img.image_data} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={img.image_data} className="w-full h-full object-cover" alt={img.section_key} loading="lazy" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                   <span className="text-xs text-gold tracking-widest uppercase mb-1 font-bold">Category</span>
                   <p className="text-white font-bold text-sm mb-4 leading-tight">
                     {displayName}
                   </p>
                   {/* Show the actual key to admin so they can differentiate between slides */}
                   <p className="text-[10px] text-neutral-500 mb-4 truncate" title={img.section_key}>ID: {img.section_key}</p>
                   
                   <button onClick={() => handleDelete(img.section_key)} className="mt-auto px-4 py-2 w-full text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                     DELETE SLIDE
                   </button>
                </div>
              </div>
            );
          })}
          {images.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500 italic">No custom images found. Platform is running entirely on default local codebase assets.</div>
          )}
        </div>
      </div>
    </div>
  );
};
// Reviews Management Component
const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    rating: 5,
    is_active: true,
    display_order: 0,
  });

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setReviews(data);
    if (error) setErrorMessage(error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (editingReview) {
      const { error } = await supabase.from('reviews').update(formData).eq('id', editingReview.id);
      if (error) setErrorMessage(error.message);
      else setSuccessMessage('Review updated.');
    } else {
      const { error } = await supabase.from('reviews').insert([formData]);
      if (error) setErrorMessage(error.message);
      else setSuccessMessage('Review created.');
    }

    if (!errorMessage) {
      setFormData({ name: '', text: '', rating: 5, is_active: true, display_order: 0 });
      setEditingReview(null);
      setShowForm(false);
      await fetchReviews();
    }
    setSaving(false);
  };

  const handleEdit = (review: any) => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditingReview(review);
    setFormData({
      name: review.name,
      text: review.text,
      rating: review.rating,
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) setErrorMessage(error.message);
      else {
        setSuccessMessage('Review deleted.');
        fetchReviews();
      }
    }
  };

  const toggleActive = async (review: any) => {
    const { error } = await supabase.from('reviews').update({ is_active: !review.is_active }).eq('id', review.id);
    if (error) setErrorMessage(error.message);
    else fetchReviews();
  };

  if (loading) return <div className="text-white text-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Manage Reviews</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingReview(null); setErrorMessage(''); setSuccessMessage(''); setFormData({ name: '', text: '', rating: 5, is_active: true, display_order: 0 }); }} className="gold-gradient text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-all">
          {showForm ? 'Cancel' : '+ Add Review'}
        </button>
      </div>

      {errorMessage && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-500 text-sm">{errorMessage}</div>}
      {successMessage && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-500 text-sm">{successMessage}</div>}

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-gold/30 space-y-4">
          <h3 className="text-xl font-bold text-white">{editingReview ? 'Edit Review' : 'New Review'}</h3>
          <div>
            <label className="block text-white font-bold mb-2">Reviewer Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" />
          </div>
          <div>
            <label className="block text-white font-bold mb-2">Review Text *</label>
            <textarea value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} rows={4} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-bold mb-2">Rating (1-5) *</label>
              <input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-white font-bold mb-2">Display Order</label>
              <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5" />
            <label className="text-white font-bold">Active (Visible)</label>
          </div>
          <button type="submit" disabled={saving} className="w-full gold-gradient text-black font-black py-3 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50">
            {saving ? 'SAVING...' : editingReview ? 'Update Review' : 'Create Review'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{review.name}</h3>
                <div className="flex text-gold mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <p className="text-neutral-400 mb-2 italic">"{review.text}"</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${review.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {review.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 text-center">Order: {review.display_order}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(review)} className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-bold hover:bg-blue-500/30 transition-all">Edit</button>
              <button onClick={() => toggleActive(review)} className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg font-bold hover:bg-yellow-500/30 transition-all">{review.is_active ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => handleDelete(review.id)} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg font-bold hover:bg-red-500/30 transition-all">Delete</button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-center text-neutral-400 py-12">No reviews yet. Click "Add Review" to create one.</div>}
      </div>
    </div>
  );
};

const MEMBERSHIP_PORTAL_SECTIONS: Array<{
  section_key: PortalContent['section_key'];
  label: string;
}> = [
  { section_key: 'offline_workout', label: 'Offline Workout' },
  { section_key: 'online_workout', label: 'Online Workout' },
  { section_key: 'home_workout', label: 'Home Workout' },
];

const MembershipPortalContentManagement: React.FC = () => {
  const [sections, setSections] = useState<Record<string, PortalContent>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portal_content')
      .select('*')
      .order('section_key', { ascending: true });

    if (error) {
      if (isPortalContentTableMissing(error.message)) {
        const fallbackSections = MEMBERSHIP_PORTAL_SECTIONS.reduce<Record<string, PortalContent>>((acc, section) => {
          acc[section.section_key] = {
            section_key: section.section_key,
            title: section.label,
            description: '',
            features: [''],
          };
          return acc;
        }, {});
        setSections(fallbackSections);
        setErrorMessage('The `portal_content` table is missing in Supabase. Run `PORTAL_CONTENT_SCHEMA.sql` once, then refresh.');
      } else {
        setErrorMessage(error.message);
      }
      setLoading(false);
      return;
    }

    const nextSections = MEMBERSHIP_PORTAL_SECTIONS.reduce<Record<string, PortalContent>>((acc, section) => {
      acc[section.section_key] = {
        section_key: section.section_key,
        title: section.label,
        description: '',
        features: [''],
      };
      return acc;
    }, {});

    (data || []).forEach((section: PortalContent) => {
      nextSections[section.section_key] = {
        ...section,
        features: Array.isArray(section.features) && section.features.length > 0 ? section.features : [''],
      };
    });

    setSections(nextSections);
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();

    const channel = supabase
      .channel('public:portal_content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_content' }, () => {
        fetchSections();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSection = (sectionKey: PortalContent['section_key'], field: 'title' | 'description', value: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const updateFeature = (sectionKey: PortalContent['section_key'], featureIndex: number, value: string) => {
    setSections((prev) => {
      const currentFeatures = [...(prev[sectionKey]?.features || [''])];
      currentFeatures[featureIndex] = value;
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          features: currentFeatures,
        },
      };
    });
  };

  const addFeature = (sectionKey: PortalContent['section_key']) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        features: [...(prev[sectionKey]?.features || []), ''],
      },
    }));
  };

  const removeFeature = (sectionKey: PortalContent['section_key'], featureIndex: number) => {
    setSections((prev) => {
      const nextFeatures = (prev[sectionKey]?.features || []).filter((_, index) => index !== featureIndex);
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          features: nextFeatures.length > 0 ? nextFeatures : [''],
        },
      };
    });
  };

  const saveSection = async (sectionKey: PortalContent['section_key']) => {
    const section = sections[sectionKey];
    if (!section) return;

    setSavingKey(sectionKey);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      section_key: sectionKey,
      title: section.title.trim(),
      description: section.description.trim(),
      features: (section.features || []).map((feature) => feature.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('portal_content')
      .upsert(payload, { onConflict: 'section_key' });

    if (error) {
      if (isPortalContentTableMissing(error.message)) {
        setErrorMessage('The `portal_content` table is missing in Supabase. Run `PORTAL_CONTENT_SCHEMA.sql` once, then try saving again.');
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setSuccessMessage(`${MEMBERSHIP_PORTAL_SECTIONS.find((item) => item.section_key === sectionKey)?.label} updated in realtime.`);
      await fetchSections();
    }

    setSavingKey(null);
  };

  if (loading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Manage Membership Portals</h2>
        <p className="text-neutral-400 text-sm">Edit offline, online, and home workout section content here. Changes apply on the live site in realtime.</p>
      </div>

      {errorMessage && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{errorMessage}</div>}
      {successMessage && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm">{successMessage}</div>}

      <div className="grid gap-6">
        {MEMBERSHIP_PORTAL_SECTIONS.map(({ section_key, label }) => {
          const section = sections[section_key];
          if (!section) return null;

          return (
            <div key={section_key} className="glass rounded-2xl p-6 border border-gold/20 space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{label}</h3>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{section_key}</p>
                </div>
                <button
                  onClick={() => saveSection(section_key)}
                  disabled={savingKey === section_key}
                  className="gold-gradient text-black font-black py-3 px-6 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50"
                >
                  {savingKey === section_key ? 'SAVING...' : 'Save Section'}
                </button>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Title *</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section_key, 'title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Description *</label>
                <textarea
                  value={section.description}
                  onChange={(e) => updateSection(section_key, 'description', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-bold">Features</label>
                  <button
                    type="button"
                    onClick={() => addFeature(section_key)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-xs font-bold hover:border-gold/30 transition-all"
                  >
                    + Add Feature
                  </button>
                </div>

                {section.features.map((feature, index) => (
                  <div key={`${section_key}-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(section_key, index, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                      placeholder={`Feature ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(section_key, index)}
                      className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Admin Dashboard

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'plans' | 'images' | 'reviews'>('offers');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-white">NOIZE Admin</h1>
              <p className="text-sm text-neutral-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Portal Sync: Active</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500/20 text-red-500 rounded-full font-bold hover:bg-red-500/30 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab === 'offers'
                    ? 'gold-gradient text-black'
                    : 'glass text-white hover:border-gold border border-white/10'
                }`}
              >
                Specific Offers
              </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'plans'
                ? 'gold-gradient text-black'
                : 'glass text-white hover:border-gold border border-white/10'
            }`}
          >
            Membership Plans
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'images'
                ? 'gold-gradient text-black'
                : 'glass text-white hover:border-gold border border-white/10'
            }`}
          >
            Site Images
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'reviews'
                ? 'gold-gradient text-black'
                : 'glass text-white hover:border-gold border border-white/10'
            }`}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'offers' ? <OffersManagement /> : activeTab === 'plans' ? <PlansManagement /> : activeTab === 'images' ? <GalleryManagement /> : <ReviewsManagement />}
      </div>
    </div>
  );
};

// Main Admin Component
const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user?.email) {
    return <AdminLogin />;
  }

  return <AdminDashboard user={user} />;
};

export default Admin;
