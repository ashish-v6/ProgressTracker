import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { FiUser, FiMail, FiZap, FiAward, FiClock, FiStar, FiCheck } from 'react-icons/fi';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [email, setEmail] = useState(user?.email || 'alex.mercer@devmail.com');
  const [avatar, setAvatar] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80');
  const [isEditing, setIsEditing] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      avatarUrl: avatar
    });
    setIsEditing(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Gamification Milestones
  const totalHours = user?.totalStudyHours || 0;
  const streak = user?.streak || 0;
  
  const achievements = [
    {
      id: 'bronze_hours',
      title: 'Initiate Track',
      desc: 'Log 10 focus hours lifetime.',
      icon: '🥉',
      unlocked: totalHours >= 10
    },
    {
      id: 'silver_hours',
      title: 'Focus Practitioner',
      desc: 'Log 50 focus hours lifetime.',
      icon: '🥈',
      unlocked: totalHours >= 50
    },
    {
      id: 'gold_hours',
      title: 'Deep Work Master',
      desc: 'Log 100 focus hours lifetime.',
      icon: '🥇',
      unlocked: totalHours >= 100
    },
    {
      id: 'week_streak',
      title: 'Weekly Consistent',
      desc: 'Achieve a 7-day activity streak.',
      icon: '🔥',
      unlocked: (user?.longestStreak || 0) >= 7
    },
    {
      id: 'super_streak',
      title: 'Streak Titan',
      desc: 'Achieve a 14-day activity streak.',
      icon: '👑',
      unlocked: (user?.longestStreak || 0) >= 14
    },
    {
      id: 'category_master',
      title: 'Well-Rounded',
      desc: 'Log focus time across 4 different categories.',
      icon: '🌟',
      unlocked: totalHours > 5 // Mock unlocked criteria for visual engagement
    }
  ];

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card & Info Edit Form */}
        <Card variant="glass" className="lg:col-span-1 text-center">
          <div className="relative inline-block mb-4">
            <img
              src={avatar}
              alt={user?.name || 'Profile Avatar'}
              className="w-28 h-28 rounded-3xl mx-auto object-cover border-2 border-zinc-800 shadow-xl"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
                <input
                  type="text"
                  placeholder="URL"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-[80%] bg-slate-900 border border-white/10 text-[9px] rounded px-1.5 py-0.5 text-center text-slate-100 outline-none"
                  title="Avatar Image URL"
                />
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-2.5">
              <h3 className="text-xl font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              
              <div className="flex justify-center space-x-1.5 py-2">
                <Badge variant="primary">Level 4 Scholar</Badge>
                <Badge variant="warning">🔥 {user?.streak}d Streak</Badge>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button onClick={() => setIsEditing(true)} variant="glass" size="sm" className="w-full">
                  Edit Profile Details
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Display Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="button" onClick={() => setIsEditing(false)} variant="ghost" size="sm" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          )}

          {profileSaved && (
            <div className="mt-3 text-xs text-emerald-400 flex items-center justify-center space-x-1 animate-pulse">
              <FiCheck className="w-4 h-4" />
              <span>Profile details updated!</span>
            </div>
          )}
        </Card>

        {/* Gamified Achievements Milestones (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productivity Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <FiClock className="w-5 h-5 mx-auto text-blue-400" />
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Tracked Hours</p>
              <h4 className="text-xl font-bold text-white">{totalHours}h</h4>
            </div>

            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <FiZap className="w-5 h-5 mx-auto text-amber-500" />
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Current Streak</p>
              <h4 className="text-xl font-bold text-white">{streak}d</h4>
            </div>

            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <FiStar className="w-5 h-5 mx-auto text-emerald-400" />
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Max Streak</p>
              <h4 className="text-xl font-bold text-white">{user?.longestStreak}d</h4>
            </div>
          </div>

          {/* Medals & Milestones Grid */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FiAward className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Milestone Achievements</h3>
              </div>
              <Badge variant="success">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
              </Badge>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center space-x-3.5 p-3 rounded-2xl border transition-all ${
                    ach.unlocked
                      ? 'bg-blue-500/5 border-blue-500/20 shadow shadow-blue-500/5'
                      : 'bg-white/[0.01] border-white/5 opacity-40'
                  }`}
                >
                  <span className="text-3xl shrink-0 p-1 bg-white/5 rounded-xl border border-white/5">
                    {ach.icon}
                  </span>
                  
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-200 truncate">{ach.title}</h4>
                      {ach.unlocked && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
