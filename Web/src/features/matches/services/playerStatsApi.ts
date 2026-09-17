import type { PlayerStat, CreatePlayerStatRequest, UpdatePlayerStatRequest } from "../types/playerStats";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";

class PlayerStatsApiService {
  async getPlayerStats(): Promise<PlayerStat[]> {
    return apiRequest<PlayerStat[]>(API_ROUTES.playerStats.collection());
  }

  async getPlayerStatsByMatch(matchId: number): Promise<PlayerStat[]> {
    return apiRequest<PlayerStat[]>(API_ROUTES.playerStats.collection({ match_id: matchId }));
  }

  async getPlayerStat(id: number): Promise<PlayerStat> {
    return apiRequest<PlayerStat>(API_ROUTES.playerStats.detail(id));
  }

  async createPlayerStat(stat: CreatePlayerStatRequest): Promise<PlayerStat> {
    return apiRequest<PlayerStat>(API_ROUTES.playerStats.collection(), {
      method: "POST",
      body: JSON.stringify(stat),
    });
  }

  async updatePlayerStat(id: number, stat: UpdatePlayerStatRequest): Promise<void> {
    return apiRequest<void>(API_ROUTES.playerStats.detail(id), {
      method: "PUT",
      body: JSON.stringify(stat),
    });
  }

  async deletePlayerStat(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.playerStats.detail(id), {
      method: "DELETE",
    });
  }
}

export const playerStatsApiService = new PlayerStatsApiService();
