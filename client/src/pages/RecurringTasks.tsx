import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiPlay, FiPause, FiTrash2, FiEdit3, FiInbox, FiAlertCircle, FiClock } from 'react-icons/fi';
import { recurringTaskService } from '../services/recurringTaskService';
import type { RecurringTask } from '../types';
import { RecurringTaskModal } from '../components/RecurringTaskModal';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DEFAULT_COLORS, PRIORITIES } from '../constants';
import { useApp } from '../context/AppContext';

export const RecurringTasks: React.FC = () => {
  const { categories } = useApp();
  const [templates, setTemplates] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RecurringTask | null>(null);

  // Delete Confirmation state
  const [templateToDelete, setTemplateToDelete] = useState<RecurringTask | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await recurringTaskService.listRecurringTasks();
      setTemplates(list);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Failed to retrieve templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleToggleStatus = async (template: RecurringTask) => {
    try {
      const originalStatus = template.status;
      const updated = originalStatus === 'active'
        ? await recurringTaskService.pauseRecurringTask(template.id)
        : await recurringTaskService.resumeRecurringTask(template.id);
      
      setTemplates(prev => prev.map(t => t.id === template.id ? updated : t));
    } catch (e) {
      console.error('Failed to toggle template pause status:', e);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await recurringTaskService.deleteRecurringTask(templateToDelete.id);
      setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
      setTemplateToDelete(null);
    } catch (e) {
      console.error('Failed to delete template:', e);
    }
  };

  const formatRepeatRuleDetail = (rule: string, days: number[]) => {
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    switch (rule) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return 'Weekdays (Mon-Fri)';
      case 'weekends':
        return 'Weekends (Sat-Sun)';
      case 'weekly':
        return days && days.length > 0 ? `Weekly on ${weekdayNames[days[0]]}` : 'Weekly';
      case 'monthly':
        return days && days.length > 0 ? `Monthly on the ${days[0]}th` : 'Monthly';
      case 'custom':
        return days && days.length > 0 ? `Custom: ${days.map(d => weekdayNames[d]).join(', ')}` : 'Custom days';
      default:
        return rule;
    }
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Recurring Task Templates</h1>
          <p className="text-slate-400 text-xs mt-1">Configure templates to automatically generate daily study sessions.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedTemplate(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Add Recurring Task
        </Button>
      </div>

      {/* Main content panel */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 h-44 animate-pulse space-y-4">
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
              <div className="h-3 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-4/5"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-6 bg-white/10 rounded w-16"></div>
                <div className="h-6 bg-white/10 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        <Card variant="glass" className="border border-rose-500/20 bg-rose-500/5 p-6 flex items-center space-x-3 text-rose-400">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </Card>
      ) : templates.length === 0 ? (
        <Card variant="glass" className="border border-white/5 bg-slate-950/40 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
            <FiInbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No templates created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">Create a recurring template (e.g. LeetCode practice, morning reading) to automatically schedule tasks on designated days.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {templates.map((template) => {
              const colorPreset = DEFAULT_COLORS.find(c => c.id === template.color) || DEFAULT_COLORS[0];
              const categoryObj = categories.find(c => c.id === template.category);
              const priorityObj = PRIORITIES.find(p => p.value === template.priority);
              const isPaused = template.status === 'paused';

              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative ${isPaused ? 'opacity-60 saturate-50' : ''}`}
                >
                  <Card variant="glass" padding="md" className="border border-white/5 flex flex-col justify-between h-52 relative overflow-hidden group">
                    {/* Color Glow Accent */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${colorPreset.bgClass}`} />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-100 truncate w-3/4" title={template.title}>
                          {template.title}
                        </h3>
                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => handleToggleStatus(template)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isPaused
                              ? 'bg-slate-900 text-slate-500 border-white/5 hover:text-slate-300'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          title={isPaused ? 'Resume template generation' : 'Pause template generation'}
                        >
                          {isPaused ? <FiPlay className="w-3.5 h-3.5" /> : <FiPause className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 h-8">
                        {template.description || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="secondary" className="capitalize text-[10px] py-0.5 px-2 bg-slate-900 border border-white/5 text-slate-400">
                          {categoryObj ? categoryObj.name : template.category}
                        </Badge>
                        {priorityObj && (
                          <Badge variant={priorityObj.value === 'high' ? 'danger' : priorityObj.value === 'medium' ? 'warning' : 'info'} className="text-[10px] py-0.5 px-2">
                            {priorityObj.label}
                          </Badge>
                        )}
                        <Badge variant="success" className="text-[10px] py-0.5 px-2">
                          <FiRefreshCw className="w-2.5 h-2.5 inline mr-1 animate-spin-slow" />
                          {formatRepeatRuleDetail(template.repeatRule, template.customRepeatDays)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3.5 mt-3.5">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5" /> {template.targetHours}h {template.targetMinutes}m per session
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                          title="Edit Template"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTemplateToDelete(template)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete Template"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Recurrence Template Modal Form */}
      <RecurringTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={selectedTemplate}
        onSaveSuccess={fetchTemplates}
      />

      {/* Custom Delete Confirmation Modal Dialog */}
      <Modal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        title="Confirm Template Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-xs leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-200">"{templateToDelete?.title}"</span>? 
            This action will permanently delete the recurring template and stop future daily task generation.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-xl text-[10px] leading-normal">
            <strong>Note:</strong> Completed daily tasks generated previously will <strong>not</strong> be deleted, preserving your history.
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setTemplateToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default RecurringTasks;
