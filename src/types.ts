export type EmployeeRole = 'ADMIN' | 'COLLABORATOR';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  department: string;
  avatar: string;
  email: string;
  color: string; // color tag for calendar/avatars
  team?: 'A' | 'B' | 'C' | 'D' | 'N/A';
  position?: string;
}

export interface ShiftType {
  id: string;
  name: string;
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "15:00"
  color: string; // primary Tailwind color class name, e.g., "blue-500"
  bgColor: string; // Tailwind background color class, e.g., "bg-blue-50"
  borderColor: string; // border style, e.g., "border-blue-200"
  textColor: string; // text color, e.g., "text-blue-700"
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftTypeId: string;
  notes?: string;
}

export type SwapStatus = 
  | 'PENDING_RECEIVER'  // Waiting for the other employee to accept
  | 'REJECTED_RECEIVER' // The other employee declined the swap
  | 'PENDING_ADMIN'     // Both employees agreed, waiting for manager's approval
  | 'APPROVED'          // Approved by manager, shift swapped in system
  | 'REJECTED_ADMIN';   // Declined by manager

export interface SwapRequest {
  id: string;
  requesterId: string;
  requestedShiftId: string; // The shift the requester wants to get rid of
  targetShiftId: string | null; // The shift the requester wants to receive (null if open request)
  receiverId: string | null; // The specific colleague offered (null if open to anyone)
  status: SwapStatus;
  createdAt: string;
  message?: string;
}


