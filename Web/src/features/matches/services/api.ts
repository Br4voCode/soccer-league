import type { Match, CreateMatchRequest, UpdateMatchRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";

class MatchesApiService {
  async getMatches(): Promise<Match[]> {
    const res = await apiRequest<PaginatedResponse<Match>>(API_ROUTES.matches.collection({ limit: 100 }));
    return res.data;
  }

  async getMatchesPage(page: number, pageSize: number, seasonId?: number): Promise<PaginatedResponse<Match>> {
    const offset = (page - 1) * pageSize;
    return apiRequest<PaginatedResponse<Match>>(API_ROUTES.matches.collection({ limit: pageSize, offset, season_id: seasonId }));
  }

  async getMatch(id: number): Promise<Match> {
    return apiRequest<Match>(API_ROUTES.matches.detail(id));
  }

  async createMatch(match: CreateMatchRequest): Promise<Match> {
    return apiRequest<Match>(API_ROUTES.matches.collection(), {
      method: "POST",
      body: JSON.stringify(match),
    });
  }

  async updateMatch(id: number, match: UpdateMatchRequest): Promise<Match> {
    return apiRequest<Match>(API_ROUTES.matches.detail(id), {
      method: "PUT",
      body: JSON.stringify(match),
    });
  }

  async deleteMatch(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.matches.detail(id), {
      method: "DELETE",
    });
  }
}

export const matchesApiService = new MatchesApiService();
