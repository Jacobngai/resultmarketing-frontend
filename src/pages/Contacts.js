import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Building2,
  MapPin,
  ChevronRight,
  X,
  User,
  Star,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';
import { db } from '../lib/supabase';

const categories = [
  'All',
  'Real Estate',
  'Technology',
  'Finance',
  'Healthcare',
  'Construction',
  'Manufacturing',
  'Retail',
];

const Contacts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef();
  const [isSaving, setIsSaving] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    category: '',
    location: '',
    notes: '',
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleAddContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const contactData = {
        name: newContact.name,
        phone: newContact.phone ? `+60${newContact.phone.replace(/\D/g, '')}` : null,
        email: newContact.email || null,
        company: newContact.company || null,
        category: newContact.category || 'Other',
        location: newContact.location || null,
        notes: newContact.notes || null,
      };

      const { data, error } = await db.contacts.create(contactData);

      if (error) {
        console.error('Error creating contact:', error);
        alert('Failed to save contact. Please try again.');
      } else {
        // Add new contact to local state
        const mappedContact = {
          id: data.id,
          name: data.name,
          company: data.company || '',
          phone: data.phone || '',
          email: data.email || '',
          location: data.location || '',
          category: data.category || 'Other',
          isFavorite: false,
          lastContact: null,
          followUpDate: null,
        };
        setContacts(prev => [mappedContact, ...prev]);
        setShowAddModal(false);
        setNewContact({ name: '', phone: '', email: '', company: '', category: '', location: '', notes: '' });
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Failed to save contact. Please try again.');
    }

    setIsSaving(false);
  };

  // Check URL params for add action
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Load initial contacts from Supabase
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);

      try {
        const { data, error, count } = await db.contacts.getAll({
          limit: 50,
          offset: 0,
          search: '',
          category: null,
        });

        if (error) {
          console.error('Error loading contacts:', error);
          setContacts([]);
        } else {
          // Map database fields to component format
          const mappedContacts = (data || []).map(contact => ({
            id: contact.id,
            name: contact.name || '',
            company: contact.company || '',
            phone: contact.phone || '',
            email: contact.email || '',
            location: contact.location || contact.city || '',
            category: contact.category || 'Other',
            isFavorite: contact.is_favorite || false,
            lastContact: contact.last_contact_date,
            followUpDate: contact.follow_up_date,
          }));
          setContacts(mappedContacts);
          setHasMore(count > mappedContacts.length);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
      }

      setIsLoading(false);
    };

    loadContacts();
  }, []);

  // Filter contacts based on search and category
  useEffect(() => {
    let filtered = contacts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, selectedCategory]);

  // Infinite scroll observer
  const lastContactRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Real Estate': 'bg-blue-100 text-blue-700',
      Technology: 'bg-purple-100 text-purple-700',
      Finance: 'bg-green-100 text-green-700',
      Healthcare: 'bg-red-100 text-red-700',
      Construction: 'bg-orange-100 text-orange-700',
      Manufacturing: 'bg-yellow-100 text-yellow-700',
      Retail: 'bg-pink-100 text-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary py-2 px-3"
            >
              <Plus size={18} className="mr-1" />
              Add
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <p className="text-sm text-gray-500">
          {filteredContacts.length} contacts found
        </p>
      </div>

      {/* Contact List */}
      <div className="px-4 py-2">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full"></div>
                <div className="flex-1">
                  <div className="skeleton h-5 w-32 mb-2"></div>
                  <div className="skeleton h-4 w-48"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No contacts found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Add your first contact to get started'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus size={18} className="mr-1" />
              Add Contact
            </button>
          </div>
        ) : (
          // Contact cards
          <div className="space-y-3">
            {filteredContacts.map((contact, index) => (
              <div
                key={contact.id}
                ref={index === filteredContacts.length - 1 ? lastContactRef : null}
                onClick={() => setSelectedContact(contact)}
                className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="avatar-lg flex-shrink-0">
                    {getInitials(contact.name)}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {contact.isFavorite && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Building2 size={14} className="flex-shrink-0" />
                      <span className="truncate">{contact.company}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge text-xs ${getCategoryColor(contact.category)}`}>
                        {contact.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        {contact.location}
                      </div>
                      {contact.followUpDate && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Clock size={12} />
                          Follow-up
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action indicator */}
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}

            {/* Loading more indicator */}
            {hasMore && !isLoading && (
              <div className="py-4 text-center">
                <Loader2 className="animate-spin text-primary-600 mx-auto" size={24} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-auto animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Contact Details</h2>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 avatar-lg text-2xl mx-auto mb-3">
                  {getInitials(selectedContact.name)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedContact.name}
                </h3>
                <p className="text-gray-600">{selectedContact.company}</p>
                <span className={`badge mt-2 ${getCategoryColor(selectedContact.category)}`}>
                  {selectedContact.category}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mb-6">
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="flex-1 btn-primary py-3 justify-center"
                >
                  <Phone size={18} className="mr-2" />
                  Call
                </a>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex-1 btn-outline py-3 justify-center"
                >
                  <Mail size={18} className="mr-2" />
                  Email
                </a>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedContact.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-medium">{selectedContact.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{selectedContact.location}</p>
                  </div>
                </div>

                {selectedContact.followUpDate && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Clock size={18} className="text-orange-600" />
                    <div>
                      <p className="text-xs text-orange-600">Follow-up Date</p>
                      <p className="font-medium text-orange-700">
                        {new Date(selectedContact.followUpDate).toLocaleDateString('en-MY', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                <button className="flex-1 btn-secondary py-3">
                  Edit Contact
                </button>
                <button className="flex-1 btn-primary py-3">
                  <Check size={18} className="mr-2" />
                  Log Interaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-auto animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form className="p-4 space-y-4" onSubmit={handleAddContact}>
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newContact.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Ahmad bin Hassan"
                  required
                />
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg">
                    <span className="text-gray-600">+60</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={newContact.phone}
                    onChange={handleInputChange}
                    className="input rounded-l-none flex-1"
                    placeholder="12-345 6789"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="label">Company</label>
                <input
                  type="text"
                  name="company"
                  value={newContact.company}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={newContact.category}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newContact.location}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  value={newContact.notes}
                  onChange={handleInputChange}
                  className="input min-h-[100px]"
                  placeholder="Add any notes about this contact..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 btn-primary py-3"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
