import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ColorPicker } from '../components/ColorPicker';
import { DEFAULT_COLORS } from '../constants';
import {
  FiSettings,
  FiSliders,
  FiGrid,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';

export const Settings: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const { categories, addCategory, deleteCategory, exportDatabase, importDatabase } = useApp();

  // Settings form states
  const [workingGoal, setWorkingGoal] = useState(user?.preferences.workingHourGoal || 6);
  const [notifyEnabled, setNotifyEnabled] = useState(user?.preferences.notificationsEnabled || false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Category creator state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('violet');
  const [catError, setCatError] = useState<string | null>(null);

  // Import state
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      workingHourGoal: Number(workingGoal),
      notificationsEnabled: notifyEnabled
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    
    if (!newCatName.trim()) {
      setCatError('Category name is required.');
      return;
    }

    const catId = newCatName.toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.id === catId)) {
      setCatError('A category with this name already exists.');
      return;
    }

    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    setNewCatColor('violet');
  };

  const handleExportData = () => {
    const dataStr = exportDatabase();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `progresstracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const fileReader = new FileReader();
    
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const success = importDatabase(text);
          if (success) {
            setImportStatus({ type: 'success', msg: 'Database imported successfully! Page will refresh.' });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setImportStatus({ type: 'error', msg: 'Failed to import. Invalid JSON structure.' });
          }
        }
      };
    }
  };

  const getCategoryColorHex = (colorId: string) => {
    return DEFAULT_COLORS.find(c => c.id === colorId)?.hex || '#3b82f6';
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Settings forms (Goal preferences, Theme preferences) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Goal Preferences */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FiSliders className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Focus Configuration</h3>
              </div>
            </CardHeader>

            <form onSubmit={handleSavePreferences} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    WORKING HOUR GOAL (HOURS/DAY)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={workingGoal}
                    onChange={(e) => setWorkingGoal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-slate-100 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Set a benchmark targets for daily focus hours dashboard analytics.
                  </p>
                </div>

                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all">
                    <input
                      type="checkbox"
                      checked={notifyEnabled}
                      onChange={(e) => setNotifyEnabled(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-white/15 bg-slate-950 text-blue-600 focus:ring-blue-500/50"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Daily Notifications</p>
                      <p className="text-[10px] text-slate-500">Enable daily study reminders</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary">
                  Save Settings
                </Button>

                {settingsSaved && (
                  <span className="text-xs text-emerald-400 flex items-center space-x-1 animate-pulse">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Preferences updated successfully!</span>
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Theme preferences */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FiSettings className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Visual Interface Theme</h3>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600/10 border-blue-500 text-white shadow shadow-blue-500/10 font-bold'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] text-slate-400'
                }`}
              >
                🌌 Deep Dark Space (Default)
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === 'light'
                    ? 'bg-blue-600/10 border-blue-500 text-slate-900 shadow shadow-blue-500/10 font-bold'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] text-slate-400'
                }`}
              >
                ☀️ Solar Light
              </button>
            </div>
          </Card>

          {/* Database Import/Export */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FiDownload className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Database Backup & Recovery</h3>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-300">Backup your logs</p>
                <p className="text-[11px] text-slate-500">
                  Export all your historical logs, strengths, streaks, and preferences into a portable `.json` database file.
                </p>
                <Button onClick={handleExportData} variant="glass" leftIcon={<FiDownload className="w-4 h-4" />}>
                  Export JSON Backup
                </Button>
              </div>

              <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                <p className="text-xs font-semibold text-slate-300">Restore from backup</p>
                <p className="text-[11px] text-slate-500">
                  Upload a previously saved `.json` database backup. Warning: This action completely overwrites existing database state.
                </p>
                
                <label className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md px-4 py-2 text-sm cursor-pointer">
                  <FiUpload className="mr-2 w-4 h-4" />
                  <span>Choose File to Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {importStatus && (
              <div className={`mt-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                importStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/25 text-rose-400'
              }`}>
                {importStatus.type === 'success' ? <FiCheckCircle className="w-4 h-4 shrink-0" /> : <FiAlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{importStatus.msg}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side Categories manager (1 col wide) */}
        <Card variant="glass" className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiGrid className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Manage Categories</h3>
            </div>
          </CardHeader>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="space-y-4 mt-4 border-b border-white/5 pb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">CATEGORY NAME</label>
              <input
                type="text"
                placeholder="e.g. Finance, Sleep"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2 text-slate-100 outline-none transition-colors text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">COLOR ACCENT</label>
              <ColorPicker selectedColorId={newCatColor} onChange={setNewCatColor} />
            </div>

            {catError && <p className="text-rose-500 text-xs mt-1">{catError}</p>}

            <Button type="submit" variant="glass" size="sm" className="w-full">
              Add New Category
            </Button>
          </form>

          {/* Categories List */}
          <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1">ACTIVE CATEGORIES</label>
            
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner"
                    style={{ backgroundColor: getCategoryColorHex(cat.color) }}
                  />
                  <span className="font-semibold text-slate-200 capitalize">{cat.name}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 rounded bg-white/0 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete category"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
