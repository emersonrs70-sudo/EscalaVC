import { Employee, Shift, SwapRequest, ShiftType } from '../types';

/**
 * Calculates the difference in days between two YYYY-MM-DD date strings.
 */
export function getDaysDiff(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str + 'T00:00:00');
  const d2 = new Date(date2Str + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns the scheduled shift for a given team on a specific date.
 * Uses a continuous 6x2 rotation.
 * 
 * Rotation Cycle of 8 days:
 * Day 0, 1: Noite (Night) [22:30 - 06:00]
 * Day 2, 3: Tarde (Afternoon) [14:15 - 22:30]
 * Day 4, 5: Manhã (Morning) [06:00 - 14:18]
 * Day 6, 7: Folga (Rest/Off)
 */
export function getTeamShiftForDate(team: 'A' | 'B' | 'C' | 'D', dateStr: string): string {
  const refDateStr = '2026-07-21'; // Reference date: July 21, 2026
  const diff = getDaysDiff(dateStr, refDateStr);
  const cycleDay = ((diff % 8) + 8) % 8;
  
  const CYCLE = ['sh-noite', 'sh-noite', 'sh-tarde', 'sh-tarde', 'sh-manha', 'sh-manha', 'sh-folga', 'sh-folga'];
  
  let offset = 0;
  if (team === 'A') offset = 2; // Team A is Tarde (index 2) on 2026-07-21
  else if (team === 'B') offset = 4; // Team B is Manhã (index 4) on 2026-07-21
  else if (team === 'C') offset = 6; // Team C is Folga (index 6) on 2026-07-21
  else if (team === 'D') offset = 0; // Team D is Noite (index 0) on 2026-07-21
  
  const index = (cycleDay + offset) % 8;
  return CYCLE[index];
}

/**
 * Generates all scheduled shifts (including Folgas) for all active collaborators
 * for a specific range of years and months (inclusive).
 */
export function generateBaseShiftsForRange(
  employees: Employee[],
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): Shift[] {
  const shifts: Shift[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      employees.forEach(emp => {
        if (emp.role !== 'ADMIN' && emp.team && emp.team !== 'N/A') {
          const shiftTypeId = getTeamShiftForDate(emp.team, dateStr);
          shifts.push({
            id: `shift-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftTypeId: shiftTypeId,
            notes: emp.position || ''
          });
        }
      });
    }

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return shifts;
}

/**
 * Generates all scheduled shifts (including Folgas) for all active collaborators
 * for a specific year and month (0-indexed).
 */
export function generateBaseShifts(employees: Employee[], year: number, month: number): Shift[] {
  return generateBaseShiftsForRange(employees, year, month, year, month);
}

/**
 * Applies approved shift swaps to a list of base shifts.
 */
export function applySwapsToShifts(shifts: Shift[], swapRequests: SwapRequest[]): Shift[] {
  const updatedShifts = [...shifts];
  const approvedSwaps = swapRequests.filter(s => s.status === 'APPROVED');
  
  approvedSwaps.forEach(swap => {
    const reqShiftIndex = updatedShifts.findIndex(s => s.id === swap.requestedShiftId);
    
    if (swap.targetShiftId) {
      const targetShiftIndex = updatedShifts.findIndex(s => s.id === swap.targetShiftId);
      if (reqShiftIndex !== -1 && targetShiftIndex !== -1) {
        // Swap employeeIds
        const temp = updatedShifts[reqShiftIndex].employeeId;
        updatedShifts[reqShiftIndex].employeeId = updatedShifts[targetShiftIndex].employeeId;
        updatedShifts[targetShiftIndex].employeeId = temp;
      }
    } else if (swap.receiverId) {
      if (reqShiftIndex !== -1) {
        updatedShifts[reqShiftIndex].employeeId = swap.receiverId;
      }
    }
  });
  
  return updatedShifts;
}
