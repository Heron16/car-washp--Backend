export type UserRole = 'client' | 'admin';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'suv';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserUpdateData {
  name: string;
  password?: string;
  cpf?: string;
  phone?: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  role: UserRole;
}

export interface ApiError {
  message: string;
}
