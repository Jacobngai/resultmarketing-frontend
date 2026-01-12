import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Upload,
  MessageCircle,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  Camera,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    totalContacts: 0,
    newThisWeek: 0,
    followUpsToday: 0,
    conversionRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simulated data - replace with actual API calls
      setTimeout(() => {
        setStats({
          totalContacts: 1247,
          newThisWeek: 23,
          followUpsToday: 8,
          conversionRate: 24,
        });

        setRecentActivities([
          {
            id: 1,
            type: 'contact_added',
            title: 'New contact added',
            description: 'Ahmad bin Hassan from XYZ Corp',
            time: '2 hours ago',
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            id: 2,
            type: 'follow_up',
            title: 'Follow-up completed',
            description: 'Call with Sarah Lee',
            time: '4 hours ago',
            icon: Calendar,
            color: 'bg-green-100 text-green-600',
          },
          {
            id: 3,
            type: 'import',
            title: 'Contacts imported',
            description: '15 contacts from Excel file',
            time: 'Yesterday',
            icon: FileSpreadsheet,
            color: 'bg-purple-100 text-purple-600',
          },
          {
            id: 4,
            type: 'namecard',
            title: 'Namecard scanned',
            description: 'David Wong - Tech Solutions',
            time: 'Yesterday',
            icon: Camera,
            color: 'bg-orange-100 text-orange-600',
          },
        ]);

        setIsLoading(false);
      }, 800);
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      to: '/contacts?action=add',
      icon: Plus,
      label: 'Add Contact',
      color: 'bg-primary-600',
    },
    {
      to: '/upload',
      icon: FileSpreadsheet,
      label: 'Import Excel',
      color: 'bg-green-600',
    },
    {
      to: '/upload?mode=camera',
      icon: Camera,
      label: 'Scan Namecard',
      color: 'bg-orange-500',
    },
    {
      to: '/chat',
      icon: Sparkles,
      label: 'Ask AI',
      color: 'bg-purple-600',
    },
  ];

  const statCards = [
    {
      label: 'Total Contacts',
      value: stats.totalContacts.toLocaleString(),
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      change: '+12%',
      changeType: 'increase',
    },
    {
      label: 'New This Week',
      value: stats.newThisWeek,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8',
      changeType: 'increase',
    },
    {
      label: "Today's Follow-ups",
      value: stats.followUpsToday,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '',
      changeType: 'neutral',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+3%',
      changeType: 'increase',
    },
  ];

  if (isLoading) {
    return (
      <div className="page-container px-4">
        {/* Skeleton Header */}
        <div className="pt-6 pb-4">
          <div className="skeleton h-6 w-32 mb-2"></div>
          <div className="skeleton h-8 w-48"></div>
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-10 w-10 rounded-lg mb-3"></div>
              <div className="skeleton h-6 w-16 mb-1"></div>
              <div className="skeleton h-4 w-20"></div>
            </div>
          ))}
        </div>

        {/* Skeleton Quick Actions */}
        <div className="skeleton h-24 rounded-xl mb-6"></div>

        {/* Skeleton Activities */}
        <div className="card p-4">
          <div className="skeleton h-5 w-32 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="skeleton h-10 w-10 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-32 mb-1"></div>
                <div className="skeleton h-3 w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container px-4">
      {/* Header */}
      <div className="pt-6 pb-4">
        <p className="text-gray-500 text-sm">{greeting}</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.phone ? `+60 ${user.phone.slice(3)}` : 'Sales Pro'}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="card p-4 hover:shadow-card-hover transition-shadow"
          >
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
              {stat.change && (
                <span className={`text-xs font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                <action.icon size={22} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Follow-up Reminder */}
      {stats.followUpsToday > 0 && (
        <Link
          to="/contacts?filter=followup"
          className="card p-4 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold">Follow-ups Today</p>
              <p className="text-sm text-orange-100">
                {stats.followUpsToday} contacts waiting for your call
              </p>
            </div>
          </div>
          <ChevronRight size={24} />
        </Link>
      )}

      {/* AI Assistant Prompt */}
      <Link
        to="/chat"
        className="card p-4 mb-6 bg-gradient-to-r from-primary-600 to-blue-500 text-white flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-semibold">Ask AI Assistant</p>
            <p className="text-sm text-blue-100">
              "Show me contacts from Kuala Lumpur"
            </p>
          </div>
        </div>
        <ChevronRight size={24} />
      </Link>

      {/* Recent Activity */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Recent Activity
          </h2>
          <Link to="/contacts" className="text-sm text-primary-600 font-medium">
            View All
          </Link>
        </div>

        <div className="space-y-1">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <activity.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="card p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
            <p className="text-sm text-gray-400 mb-3">
              Get 250K contacts, unlimited AI queries, and priority support
            </p>
            <Link
              to="/settings?tab=subscription"
              className="inline-flex items-center text-sm font-medium text-yellow-400 hover:text-yellow-300"
            >
              View Plans
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
