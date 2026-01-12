import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Enable auto-refresh of auth tokens
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL (for OAuth flows)
      detectSessionInUrl: true,
      // Storage key for session
      storageKey: 'resultmarketing-auth',
      // Flow type for phone auth
      flowType: 'pkce',
    },
    // Real-time configuration
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Auth helper functions
export const auth = {
  // Sign in with phone OTP
  signInWithOtp: async (phone) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          // Channel for OTP (sms or whatsapp)
          channel: 'sms',
        },
      });
      return { data, error };
    } catch (err) {
      console.error('OTP sign in error:', err);
      return { data: null, error: err };
    }
  },

  // Verify OTP
  verifyOtp: async (phone, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      return { data, error };
    } catch (err) {
      console.error('OTP verification error:', err);
      return { data: null, error: err };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: err };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data?.session, error };
    } catch (err) {
      console.error('Get session error:', err);
      return { session: null, error: err };
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { user: data?.user, error };
    } catch (err) {
      console.error('Get user error:', err);
      return { user: null, error: err };
    }
  },

  // Listen for auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// Database helper functions
export const db = {
  // Contacts
  contacts: {
    // Get all contacts for current user
    getAll: async (options = {}) => {
      const { limit = 50, offset = 0, search = '', category = null } = options;

      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;
      return { data, error, count };
    },

    // Get single contact
    getById: async (id) => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    // Create contact
    create: async (contact) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...contact, user_id: user.id }])
        .select()
        .single();
      return { data, error };
    },

    // Update contact
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    // Delete contact
    delete: async (id) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      return { error };
    },

    // Bulk import contacts
    bulkCreate: async (contacts) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contacts)
        .select();
      return { data, error };
    },
  },

  // Activities
  activities: {
    // Get recent activities
    getRecent: async (limit = 10) => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    },

    // Create activity
    create: async (activity) => {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
        .single();
      return { data, error };
    },
  },

  // User stats
  stats: {
    // Get dashboard stats
    getDashboard: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      return { data, error };
    },
  },
};

// Storage helper functions
export const storage = {
  // Upload file
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl;
  },

  // Delete file
  delete: async (bucket, paths) => {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    return { error };
  },
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to contacts changes
  subscribeToContacts: (callback) => {
    return supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => callback(payload)
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications: (userId, callback) => {
    return supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => callback(payload)
      )
      .subscribe();
  },

  // Unsubscribe from channel
  unsubscribe: async (channel) => {
    await supabase.removeChannel(channel);
  },
};

export default supabase;
