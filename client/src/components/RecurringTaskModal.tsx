import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { RecurringTask } from '../types';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { ColorPicker } from './ColorPicker';
import { PRIORITIES } from '../constants';
import { recurringTaskService } from '../services/recurringTaskService';

interface RecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: RecurringTask | null;
  onSaveSuccess: () => void;
}

const recurringTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(300, 'Description cannot exceed 300 characters').default(''),
  category: z.string().min(1, 'Category is required'),
  color: z.string().min(1, 'Color is required'),
  priority: z.enum(['low', 'medium', 'high'] as const),
  targetHours: z.coerce
    .number()
    .min(0, 'Target hours cannot be negative')
    .max(24, 'Target hours cannot exceed 24'),
  targetMinutes: z.coerce
    .number()
    .min(0, 'Target minutes must be between 0 and 59')
    .max(59, 'Target minutes must be between 0 and 59'),
  repeatRule: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom'] as const),
  customRepeatDays: z.array(z.number()).optional(),
  notes: z.string().default(''),
  tagsInput: z.string().optional().default('')
});

type RecurringTaskFormValues = z.infer<typeof recurringTaskSchema>;

const WEEKDAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 }
];

export const RecurringTaskModal: React.FC<RecurringTaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSaveSuccess
}) => {
  const { categories } = useApp();

  const defaultValues: RecurringTaskFormValues = {
    title: '',
    description: '',
    category: categories[0]?.id || 'study',
    color: 'blue',
    priority: 'medium',
    targetHours: 1,
    targetMinutes: 0,
    repeatRule: 'daily',
    customRepeatDays: [],
    notes: '',
    tagsInput: ''
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<any>({
    resolver: zodResolver(recurringTaskSchema),
    defaultValues
  });

  const selectedRepeatRule = watch('repeatRule');
  const selectedCustomRepeatDays = watch('customRepeatDays') || [];

  // Reset form values on taskToEdit transitions
  useEffect(() => {
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        category: taskToEdit.category,
        color: taskToEdit.color,
        priority: taskToEdit.priority,
        targetHours: taskToEdit.targetHours,
        targetMinutes: taskToEdit.targetMinutes,
        repeatRule: taskToEdit.repeatRule,
        customRepeatDays: taskToEdit.customRepeatDays || [],
        notes: taskToEdit.notes || '',
        tagsInput: (taskToEdit.tags || []).join(', ')
      });
    } else {
      reset(defaultValues);
    }
  }, [taskToEdit, isOpen]);

  const onSubmit = async (data: RecurringTaskFormValues) => {
    const tags = data.tagsInput
      ? data.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const submitData = {
      title: data.title,
      description: data.description,
      category: data.category,
      color: data.color,
      priority: data.priority,
      targetHours: data.targetHours,
      targetMinutes: data.targetMinutes,
      repeatRule: data.repeatRule,
      customRepeatDays:
        data.repeatRule === 'custom' || data.repeatRule === 'weekly' || data.repeatRule === 'monthly'
          ? (data.customRepeatDays || [])
          : [],
      notes: data.notes,
      tags
    };

    try {
      if (taskToEdit) {
        await recurringTaskService.updateRecurringTask(taskToEdit.id, submitData);
      } else {
        await recurringTaskService.createRecurringTask(submitData);
      }
      onSaveSuccess();
      onClose();
    } catch (e) {
      console.error('Failed to save recurring task template:', e);
    }
  };

  const toggleCustomDay = (dayValue: number) => {
    let updated: number[];
    if (selectedCustomRepeatDays.includes(dayValue)) {
      updated = selectedCustomRepeatDays.filter((d: number) => d !== dayValue);
    } else {
      updated = [...selectedCustomRepeatDays, dayValue].sort();
    }
    setValue('customRepeatDays', updated);
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-zinc-100 outline-none transition-all";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Recurring Rule' : 'Create Recurring Task'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">TASK TEMPLATE TITLE</label>
          <input
            type="text"
            placeholder="e.g. Daily DSA Practice"
            className={inputClass}
            {...register('title')}
          />
          {errors.title?.message && (
            <p className="text-red-500 text-[10px] mt-1">{String(errors.title.message)}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">DESCRIPTION</label>
          <textarea
            placeholder="What needs to be done every time this generates..."
            className={`${inputClass} h-16 resize-none`}
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="text-red-500 text-[10px] mt-1">{String(errors.description.message)}</p>
          )}
        </div>

        {/* Category & Priority in a grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">CATEGORY</label>
            <select
              className={`${inputClass} capitalize cursor-pointer`}
              {...register('category')}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className="text-red-500 text-[10px] mt-1">{String(errors.category.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">PRIORITY</label>
            <select
              className={`${inputClass} capitalize cursor-pointer`}
              {...register('priority')}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value} className="bg-zinc-900">
                  {p.label}
                </option>
              ))}
            </select>
            {errors.priority?.message && (
              <p className="text-red-500 text-[10px] mt-1">{String(errors.priority.message)}</p>
            )}
          </div>
        </div>

        {/* Color Preset */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">CARD ACCENT COLOR</label>
          <Controller
            control={control}
            name="color"
            render={({ field: { value, onChange } }) => (
              <ColorPicker selectedColorId={value} onChange={onChange} />
            )}
          />
          {errors.color?.message && (
            <p className="text-red-500 text-[10px] mt-1">{String(errors.color.message)}</p>
          )}
        </div>

        {/* Target Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">TARGET HOURS</label>
            <input
              type="number"
              placeholder="e.g. 1"
              min="0"
              className={inputClass}
              {...register('targetHours')}
            />
            {errors.targetHours?.message && (
              <p className="text-red-500 text-[10px] mt-1">{String(errors.targetHours.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">TARGET MINUTES</label>
            <input
              type="number"
              placeholder="e.g. 30"
              min="0"
              max="59"
              className={inputClass}
              {...register('targetMinutes')}
            />
            {errors.targetMinutes?.message && (
              <p className="text-red-500 text-[10px] mt-1">{String(errors.targetMinutes.message)}</p>
            )}
          </div>
        </div>

        {/* Recurrence Rule Selection */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">RECURRENCE RULE</label>
          <select
            className={`${inputClass} capitalize cursor-pointer`}
            {...register('repeatRule')}
          >
            <option value="daily" className="bg-zinc-900">Daily</option>
            <option value="weekdays" className="bg-zinc-900">Weekdays (Mon-Fri)</option>
            <option value="weekends" className="bg-zinc-900">Weekends (Sat-Sun)</option>
            <option value="weekly" className="bg-zinc-900">Weekly</option>
            <option value="monthly" className="bg-zinc-900">Monthly</option>
            <option value="custom" className="bg-zinc-900">Custom Weekdays</option>
          </select>
          {errors.repeatRule?.message && (
            <p className="text-red-500 text-[10px] mt-1">{String(errors.repeatRule.message)}</p>
          )}
        </div>

        {/* Day selection UI for Custom Weekdays or Weekly repeat rules */}
        {(selectedRepeatRule === 'custom' || selectedRepeatRule === 'weekly') && (
          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
            <label className="block text-[10px] font-semibold text-zinc-500 mb-2">
              {selectedRepeatRule === 'custom' ? 'CHOOSE RECURRING DAYS' : 'CHOOSE WEEKLY DAY'}
            </label>
            <div className="flex gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedCustomRepeatDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      if (selectedRepeatRule === 'weekly') {
                        setValue('customRepeatDays', [day.value]);
                      } else {
                        toggleCustomDay(day.value);
                      }
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Day select input for Monthly rule */}
        {selectedRepeatRule === 'monthly' && (
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">
              CHOOSE DAY OF THE MONTH (1-31)
            </label>
            <input
              type="number"
              placeholder="e.g. 15"
              min="1"
              max="31"
              className={inputClass}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= 31) {
                  setValue('customRepeatDays', [val]);
                }
              }}
              defaultValue={selectedCustomRepeatDays[0] || 1}
            />
          </div>
        )}

        {/* Tags input */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">TAGS (COMMA SEPARATED)</label>
          <input
            type="text"
            placeholder="e.g. revision, dsa, morning"
            className={inputClass}
            {...register('tagsInput')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">NOTES</label>
          <input
            type="text"
            placeholder="Any extra checklists or note links..."
            className={inputClass}
            {...register('notes')}
          />
        </div>

        {/* Submission Actions */}
        <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default RecurringTaskModal;
