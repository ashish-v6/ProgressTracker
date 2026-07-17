import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Task } from '../types';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { ColorPicker } from './ColorPicker';
import { PRIORITIES } from '../constants';
import { formatDateKey } from '../services/mockData';

const REPEAT_RULES = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
  { value: 'weekends', label: 'Weekends (Sat-Sun)' },
  { value: 'custom', label: 'Custom Weekdays' }
];

const WEEKDAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 }
];

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(300, 'Description cannot exceed 300 characters').default(''),
  category: z.string().min(1, 'Category is required'),
  color: z.string().min(1, 'Color is required'),
  priority: z.enum(['low', 'medium', 'high'] as const),
  status: z.enum(['pending', 'in_progress', 'completed'] as const),
  targetHours: z.coerce.number().min(0, 'Goal hours must be positive'),
  repeatRule: z.enum(['none', 'daily', 'weekdays', 'weekends', 'custom'] as const),
  customRepeatDays: z.array(z.number()).optional(),
  notes: z.string().default(''),
  dueDate: z.string().min(1, 'Due date is required')
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultDate
}) => {
  const { addTask, updateTask, categories } = useApp();

  const defaultValues: TaskFormValues = {
    title: '',
    description: '',
    category: categories[0]?.id || 'study',
    color: 'blue',
    priority: 'medium',
    status: 'pending',
    targetHours: 1.0,
    repeatRule: 'none',
    customRepeatDays: [],
    notes: '',
    dueDate: defaultDate || formatDateKey(new Date())
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
    resolver: zodResolver(taskSchema),
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
        status: taskToEdit.status,
        targetHours: taskToEdit.targetHours,
        repeatRule: taskToEdit.repeatRule || 'none',
        customRepeatDays: taskToEdit.customRepeatDays || [],
        notes: taskToEdit.notes || '',
        dueDate: taskToEdit.dueDate
      });
    } else {
      reset({
        ...defaultValues,
        dueDate: defaultDate || formatDateKey(new Date())
      });
    }
  }, [taskToEdit, isOpen]);

  const onSubmit = async (data: TaskFormValues) => {
    if (taskToEdit) {
      await updateTask({
        ...taskToEdit,
        title: data.title,
        description: data.description,
        category: data.category,
        color: data.color,
        priority: data.priority,
        status: data.status,
        targetHours: data.targetHours,
        repeatRule: data.repeatRule,
        customRepeatDays: data.repeatRule === 'custom' ? data.customRepeatDays : undefined,
        notes: data.notes,
        dueDate: data.dueDate
      });
    } else {
      await addTask({
        title: data.title,
        description: data.description,
        category: data.category,
        color: data.color,
        priority: data.priority,
        targetHours: data.targetHours,
        actualHours: 0,
        actualMinutes: 0,
        status: data.status,
        repeatRule: data.repeatRule,
        customRepeatDays: data.repeatRule === 'custom' ? data.customRepeatDays : undefined,
        notes: data.notes,
        dueDate: data.dueDate
      });
    }
    onClose();
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
      title={taskToEdit ? 'Edit Task Details' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">TASK TITLE</label>
          <input
            type="text"
            placeholder="e.g. Read React 19 Docs"
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
            placeholder="Provide a brief summary of what you want to achieve..."
            className={`${inputClass} h-16 resize-none`}
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="text-red-500 text-[10px] mt-1">{String(errors.description.message)}</p>
          )}
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">CATEGORY</label>
            <select
              className={`${inputClass} capitalize cursor-pointer`}
              {...register('category')}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">PRIORITY</label>
            <select
              className={`${inputClass} cursor-pointer`}
              {...register('priority')}
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value} className="bg-zinc-900">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Hours & Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">DAILY HOUR GOAL</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 2.5"
              className={inputClass}
              {...register('targetHours')}
            />
            {errors.targetHours?.message && (
              <p className="text-red-500 text-[10px] mt-1">{String(errors.targetHours.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">DUE DATE</label>
            <input
              type="date"
              className={`${inputClass} cursor-pointer`}
              {...register('dueDate')}
            />
            {errors.dueDate?.message && (
              <p className="text-red-500 text-[10px] mt-1">{String(errors.dueDate.message)}</p>
            )}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">ACCENT COLOR</label>
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker selectedColorId={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Repeat Rule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">RECURRENCE RULE</label>
            <select
              className={`${inputClass} cursor-pointer`}
              {...register('repeatRule')}
            >
              {REPEAT_RULES.map(r => (
                <option key={r.value} value={r.value} className="bg-zinc-900">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Custom Days Select */}
          {selectedRepeatRule === 'custom' && (
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1">CHOOSE RECURRING DAYS</label>
              <div className="flex justify-between mt-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                {WEEKDAYS.map(day => {
                  const isChecked = selectedCustomRepeatDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleCustomDay(day.value)}
                      className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                        isChecked
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status (If Editing) */}
        {taskToEdit && (
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">TASK PROGRESS STATE</label>
            <select
              className={`${inputClass} cursor-pointer`}
              {...register('status')}
            >
              <option value="pending" className="bg-zinc-900">Pending</option>
              <option value="in_progress" className="bg-zinc-900">In Progress</option>
              <option value="completed" className="bg-zinc-900">Completed</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">NOTES</label>
          <input
            type="text"
            placeholder="Any extra reminders or checklist..."
            className={inputClass}
            {...register('notes')}
          />
        </div>

        {/* Actions Button */}
        <div className="flex space-x-3 pt-3 border-t border-zinc-800 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="primary">
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default TaskModal;
