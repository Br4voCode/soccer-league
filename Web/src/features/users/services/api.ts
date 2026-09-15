import type {
  User,
  CreateUserRequest,
  UpdateUserRoleRequest,
} from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";

class UsersApiService {
  async getUsersPage(
    page: number,
    pageSize: number,
  ): Promise<PaginatedResponse<User>> {
    const offset = (page - 1) * pageSize;
    return apiRequest<PaginatedResponse<User>>(
      `/users?limit=${pageSize}&offset=${offset}`,
    );
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    return apiRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUserRole(id: number, data: UpdateUserRoleRequest): Promise<User> {
    return apiRequest<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return apiRequest<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }
}

export const usersApiService = new UsersApiService();
