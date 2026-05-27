import { api, getApiErrorMessage } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';

export interface PlatformUserEmployeeProfile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  status: string;
  office: {
    id: number;
    name: string;
  } | null;
}

export interface PlatformUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  registeredAt: string;
  employee: PlatformUserEmployeeProfile | null;
  hasEmployeeProfile: boolean;
}

export interface UsersApiResponse {
  count: number;
  withEmployeeProfile: number;
  employees: PlatformUser[];
}

const MOCK_PLATFORM_USERS: PlatformUser[] = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@hrm.com',
    role: 'ADMIN',
    isActive: true,
    registeredAt: '2026-05-26T17:14:09.507Z',
    employee: null,
    hasEmployeeProfile: false,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'hr@quickboom.com',
    role: 'HR',
    isActive: true,
    registeredAt: '2026-05-26T17:14:09.514Z',
    employee: {
      id: 1,
      employeeCode: 'EMP-HR-001',
      firstName: 'Priya',
      lastName: 'Sharma',
      designation: 'HR Manager',
      status: 'active',
      office: {
        id: 1,
        name: 'Delhi HQ',
      },
    },
    hasEmployeeProfile: true,
  },
  {
    id: 3,
    name: 'Rahul Verma',
    email: 'employee@quickboom.com',
    role: 'EMPLOYEE',
    isActive: true,
    registeredAt: '2026-05-26T17:14:09.515Z',
    employee: {
      id: 2,
      employeeCode: 'EMP-ENG-001',
      firstName: 'Rahul',
      lastName: 'Verma',
      designation: 'Software Engineer',
      status: 'active',
      office: {
        id: 2,
        name: 'Mumbai Branch',
      },
    },
    hasEmployeeProfile: true,
  },
  {
    id: 4,
    name: 'newuser',
    email: 'newuser@quickboom.com',
    role: 'EMPLOYEE',
    isActive: true,
    registeredAt: '2026-05-27T15:28:17.241Z',
    employee: null,
    hasEmployeeProfile: false,
  },
];

export async function fetchPlatformUsers(): Promise<PlatformUser[]> {
  if (isDevAuthSession()) {
    return MOCK_PLATFORM_USERS;
  }

  try {
    const { data } = await api.get<UsersApiResponse>('/api/admin/users');
    return data.employees ?? [];
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch platform users. Please try again.')
    );
  }
}
