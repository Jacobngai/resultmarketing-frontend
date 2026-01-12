import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  Phone,
  Check,
  X,
  Sparkles,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      pushEnabled: true,
      dailyDigest: true,
      followUpReminders: true,
      weeklyReport: false,
      marketingEmails: false,
    },
    appearance: {
      darkMode: false,
      language: 'en',
    },
    privacy: {
      shareAnalytics: true,
      showActivity: true,
    },
  });

  // User profile data
  const [profile, setProfile] = useState({
    name: 'Sales Pro',
    phone: user?.phone || '+60123456789',
    email: 'user@example.com',
    company: 'My Company Sdn Bhd',
  });

  // Subscription data
  const subscription = {
    plan: 'Free Trial',
    status: 'active',
    contactsUsed: 47,
    contactsLimit: 50,
    expiresAt: '2024-01-31',
    features: ['50 contacts', 'Basic AI chat', 'Namecard scanning', 'Spreadsheet import'],
  };

  const plans = [
    {
      name: 'Base',
      price: 'RM 299',
      period: '/year',
      features: ['250,000 contacts', 'Unlimited AI queries', 'Priority OCR', 'Email support'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'RM 498',
      period: '/year',
      features: ['1,000,000 contacts', 'Unlimited everything', 'API access', 'Dedicated support', 'Custom integrations'],
      popular: false,
    },
  ];

  // Handle settings toggle
  const handleToggle = (category, key) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoading(false);
  };

  // Settings menu items
  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'subscription', icon: CreditCard, label: 'Subscription' },
    { id: 'privacy', icon: Shield, label: 'Privacy' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  // Toggle component
  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  // Render profile tab
  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 avatar-lg text-2xl mx-auto mb-4">
          {profile.name.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
        <p className="text-gray-500">{profile.phone}</p>
      </div>

      {/* Profile fields */}
      <div className="card p-4 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="input"
          />
        </div>

        <div>
          <label className="label">Phone Number</label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={profile.phone}
              disabled
              className="input bg-gray-50 flex-1"
            />
            <span className="badge-success">Verified</span>
          </div>
        </div>

        <div>
          <label className="label">Email (Optional)</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            className="input"
            placeholder="Add email for backups"
          />
        </div>

        <div>
          <label className="label">Company</label>
          <input
            type="text"
            value={profile.company}
            onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
            className="input"
          />
        </div>

        <button className="btn-primary w-full py-3">
          Save Changes
        </button>
      </div>

      {/* Danger zone */}
      <div className="card p-4 border-red-200">
        <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back.
        </p>
        <button className="btn-danger py-2 px-4">
          Delete Account
        </button>
      </div>
    </div>
  );

  // Render notifications tab
  const renderNotifications = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card divide-y divide-gray-100">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Smartphone size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-500">Get alerts on your device</p>
            </div>
          </div>
          <Toggle
            enabled={settings.notifications.pushEnabled}
            onChange={() => handleToggle('notifications', 'pushEnabled')}
          />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Follow-up Reminders</p>
              <p className="text-sm text-gray-500">Remind me about scheduled calls</p>
            </div>
          </div>
          <Toggle
            enabled={settings.notifications.followUpReminders}
            onChange={() => handleToggle('notifications', 'followUpReminders')}
          />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Daily Digest</p>
              <p className="text-sm text-gray-500">Summary at 9 AM daily</p>
            </div>
          </div>
          <Toggle
            enabled={settings.notifications.dailyDigest}
            onChange={() => handleToggle('notifications', 'dailyDigest')}
          />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Weekly Report</p>
              <p className="text-sm text-gray-500">Performance insights every Monday</p>
            </div>
          </div>
          <Toggle
            enabled={settings.notifications.weeklyReport}
            onChange={() => handleToggle('notifications', 'weeklyReport')}
          />
        </div>
      </div>
    </div>
  );

  // Render subscription tab
  const renderSubscription = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Current plan */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-xl font-bold text-gray-900">{subscription.plan}</p>
          </div>
          <span className="badge-success capitalize">{subscription.status}</span>
        </div>

        {/* Usage bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Contacts Used</span>
            <span className="font-medium">
              {subscription.contactsUsed} / {subscription.contactsLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                (subscription.contactsUsed / subscription.contactsLimit) > 0.9
                  ? 'bg-red-500'
                  : 'bg-primary-600'
              }`}
              style={{
                width: `${(subscription.contactsUsed / subscription.contactsLimit) * 100}%`,
              }}
            />
          </div>
        </div>

        {subscription.contactsUsed / subscription.contactsLimit > 0.8 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              You're running low on contacts. Upgrade to continue adding more.
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Trial expires: {new Date(subscription.expiresAt).toLocaleDateString('en-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Upgrade options */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Upgrade Your Plan
        </h3>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-4 ${plan.popular ? 'border-2 border-primary-500 relative' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-4 badge-primary">Most Popular</span>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown size={20} className={plan.popular ? 'text-primary-600' : 'text-gray-400'} />
                  <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              >
                Upgrade to {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render privacy tab
  const renderPrivacy = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card divide-y divide-gray-100">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Share Analytics</p>
            <p className="text-sm text-gray-500">Help us improve with usage data</p>
          </div>
          <Toggle
            enabled={settings.privacy.shareAnalytics}
            onChange={() => handleToggle('privacy', 'shareAnalytics')}
          />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Show Activity Status</p>
            <p className="text-sm text-gray-500">Let others see when you're online</p>
          </div>
          <Toggle
            enabled={settings.privacy.showActivity}
            onChange={() => handleToggle('privacy', 'showActivity')}
          />
        </div>
      </div>

      <div className="card p-4">
        <h4 className="font-medium text-gray-900 mb-4">Data Management</h4>
        <div className="space-y-3">
          <button className="btn-secondary w-full py-3 justify-between">
            <span>Export My Data</span>
            <ChevronRight size={18} />
          </button>
          <button className="btn-secondary w-full py-3 justify-between">
            <span>Download Contacts</span>
            <ChevronRight size={18} />
          </button>
          <button className="btn-secondary w-full py-3 justify-between">
            <span>Privacy Policy</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Render help tab
  const renderHelp = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="card p-4">
        <h4 className="font-medium text-gray-900 mb-4">Get Help</h4>
        <div className="space-y-3">
          <button className="btn-secondary w-full py-3 justify-between">
            <span>FAQ</span>
            <ChevronRight size={18} />
          </button>
          <button className="btn-secondary w-full py-3 justify-between">
            <span>Video Tutorials</span>
            <ChevronRight size={18} />
          </button>
          <button className="btn-secondary w-full py-3 justify-between">
            <span>Contact Support</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h4 className="font-medium text-gray-900 mb-4">About</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>ResultMarketing v1.0.0</p>
          <p>AI-Powered CRM for Malaysian Sales Professionals</p>
          <div className="pt-2 flex gap-4">
            <a href="#" className="text-primary-600 hover:underline">Terms</a>
            <a href="#" className="text-primary-600 hover:underline">Privacy</a>
            <a href="#" className="text-primary-600 hover:underline">Licenses</a>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'notifications':
        return renderNotifications();
      case 'subscription':
        return renderSubscription();
      case 'privacy':
        return renderPrivacy();
      case 'help':
        return renderHelp();
      default:
        return renderProfile();
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {renderContent()}

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-8 w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Log out?
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to log out of ResultMarketing?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex-1 btn-danger py-3"
              >
                {isLoading ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
