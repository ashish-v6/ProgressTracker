import React, { useState } from 'react';
import type { Task } from '../types';
import { useApp } from '../context/AppContext';
import { useTimer } from '../context/TimerContext';
import { DEFAULT_COLORS, PRIORITIES } from '../constants';
import { Card } from './Card';
import { Badge } from './Badge';
import {
  FiPlay,
  FiPause,
  FiSquare,
  FiCheck,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiClock,
  FiMoreVertical,
  FiRefreshCw
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask, duplicateTask, categories } = useApp();
  const { activeTaskId, elapsedSeconds, isRunning, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrentTimer = activeTaskId === task.id;

  const colorPreset = DEFAULT_COLORS.find(c => c.id === task.color) || DEFAULT_COLORS[0];
  const categoryObj = categories.find(c => c.id === task.category);
  const priorityObj = PRIORITIES.find(p => p.value === task.priority);

  const handleStatusToggle = () => {
    if (isCurrentTimer) {
      stopTimer();
    }
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask({
      ...task,
      status: newStatus,
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  const handleTimerAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'completed') return;

    if (isCurrentTimer) {
      if (isRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    } else {
      startTimer(task.id);
    }
  };

  const handleStopTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTimer) {
      stopTimer();
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing mb-2.5"
    >
      <Card
        variant="interactive"
        padding="none"
        className="flex flex-col relative border-l-2 border-l-zinc-800"
        style={{ borderLeftColor: colorPreset.hex }}
      >
        <div className="p-3 flex flex-col justify-between h-full space-y-2">
          {/* Header Row */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center space-x-2.5 flex-1 min-w-0">
              {/* Checkbox button */}
              <button
                type="button"
                onClick={handleStatusToggle}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-zinc-700 hover:border-blue-500 text-transparent'
                }`}
              >
                <FiCheck className="w-3 h-3 stroke-[3]" />
              </button>

              <h4 className={`text-xs font-semibold text-zinc-200 truncate ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}>
                {task.title}
              </h4>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <FiMoreVertical className="w-3.5 h-3.5" />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-1 z-20">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="w-full text-left px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 rounded flex items-center space-x-2"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        duplicateTask(task.id);
                      }}
                      className="w-full text-left px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 rounded flex items-center space-x-2"
                    >
                      <FiCopy className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        deleteTask(task.id);
                      }}
                      className="w-full text-left px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/10 rounded flex items-center space-x-2"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-[11px] text-zinc-400 line-clamp-2 pl-6.5 ${task.status === 'completed' ? 'text-zinc-650' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Badge Indicators */}
          <div className="flex flex-wrap gap-1 pl-6.5">
            {categoryObj && (
              <Badge variant="custom" className={`${colorPreset.bgClass} capitalize text-[9px] py-0.5 px-2`}>
                {categoryObj.name}
              </Badge>
            )}
            {priorityObj && (
              <Badge variant="custom" className={`${priorityObj.color} text-[9px] py-0.5 px-2`}>
                {priorityObj.label.split(' ')[0]}
              </Badge>
            )}
            {task.repeatRule !== 'none' && (
              <Badge variant="secondary" className="capitalize text-[9px] py-0.5 px-2 flex items-center space-x-1">
                <FiRefreshCw className="w-2.5 h-2.5" />
                <span>{task.repeatRule}</span>
              </Badge>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800/60 my-1" />

          {/* Footer - Timer and Duration status */}
          <div className="flex justify-between items-center text-[11px] pl-6.5">
            <div className="flex items-center space-x-1 text-zinc-400">
              <FiClock className="w-3 h-3 text-zinc-500" />
              <span>
                {task.actualHours}h {task.actualMinutes}m
                <span className="text-zinc-600"> / {task.targetHours}h goal</span>
              </span>
            </div>

            {/* Task specific timer actions */}
            {task.status !== 'completed' && (
              <div className="flex items-center space-x-1">
                {isCurrentTimer && (
                  <span className="text-[10px] font-mono text-blue-400 mr-1 flex items-center space-x-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>{formatTime(elapsedSeconds)}</span>
                  </span>
                )}
                
                <button
                  onClick={handleTimerAction}
                  className={`p-1 rounded transition-all ${
                    isCurrentTimer
                      ? isRunning
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                      : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={isCurrentTimer && isRunning ? 'Pause timer' : 'Start tracking time'}
                >
                  {isCurrentTimer && isRunning ? (
                    <FiPause className="w-2.5 h-2.5" />
                  ) : (
                    <FiPlay className="w-2.5 h-2.5" />
                  )}
                </button>

                {isCurrentTimer && (
                  <button
                    onClick={handleStopTimer}
                    className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Stop and save time"
                  >
                    <FiSquare className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
export default TaskCard;
