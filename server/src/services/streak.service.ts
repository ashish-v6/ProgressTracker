import { taskRepository } from '../repositories/task.repository';
import { userRepository } from '../repositories/user.repository';

class StreakService {
  /**
   * Recalculates current and longest streaks for a user based on completed tasks
   */
  public async recalculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    // Fetch all completed tasks for this user sorted by completion date
    const completedTasks = await taskRepository.find(
      { createdBy: userId, completed: true, completedAt: { $ne: null } },
      'completedAt',
      { sort: { completedAt: 1 } }
    );

    if (completedTasks.length === 0) {
      await userRepository.update(userId, { streak: 0, lastActiveDate: null });
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Format completedAt values to YYYY-MM-DD strings based on Local Time
    // to map user experience accurately.
    const uniqueLocalDates = Array.from(
      new Set(
        completedTasks.map((task) => {
          const date = new Date(task.completedAt!);
          // Extract year, month, day in local system terms
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        })
      )
    ).sort();

    // Calculate current streak (consecutive days leading up to today/yesterday)
    let currentStreak = 0;
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const completedToday = uniqueLocalDates.includes(todayStr);
    const completedYesterday = uniqueLocalDates.includes(yesterdayStr);

    if (completedToday || completedYesterday) {
      // Start iterating backward from the most recent valid active date
      const startBase = completedToday ? today : yesterday;
      const checker = new Date(startBase.getTime());
      
      while (true) {
        const checkerStr = `${checker.getFullYear()}-${String(checker.getMonth() + 1).padStart(2, '0')}-${String(checker.getDate()).padStart(2, '0')}`;
        if (uniqueLocalDates.includes(checkerStr)) {
          currentStreak++;
          checker.setDate(checker.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate historical longest streak
    let longestStreak = 0;
    if (uniqueLocalDates.length > 0) {
      let runningStreak = 1;
      longestStreak = 1;

      // Map YYYY-MM-DD string array back to local midnight dates for date calculations
      const dates = uniqueLocalDates.map((dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
      });

      for (let i = 1; i < dates.length; i++) {
        const prev = dates[i - 1];
        const curr = dates[i];

        // Difference in days (taking DST and daylight shifts into account safely)
        const diffTime = Math.abs(curr.getTime() - prev.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }

        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      }
    }

    // Load current stats to prevent decrementing the all-time record
    const user = await userRepository.findById(userId);
    const finalLongest = Math.max(longestStreak, user?.longestStreak || 0, currentStreak);
    const lastActiveDate = completedTasks[completedTasks.length - 1].completedAt;

    await userRepository.update(userId, {
      streak: currentStreak,
      longestStreak: finalLongest,
      lastActiveDate
    });

    return { currentStreak, longestStreak: finalLongest };
  }
}

export const streakService = new StreakService();
export default streakService;
