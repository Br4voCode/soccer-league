import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type {
  StandingRow,
  HeadToHeadMatch,
  MatchByDateRow,
  CoachExperience,
  StadiumAttendance,
  TeamStatusReport,
  AllStarPlayer
} from "../types";

class ReportsApiService {
  async getStandings(seasonId: number): Promise<StandingRow[]> {
    return apiRequest<StandingRow[]>(API_ROUTES.reports.standings(seasonId));
  }

  async getHeadToHead(team1: number, team2: number, seasonId?: number): Promise<HeadToHeadMatch[]> {
    return apiRequest<HeadToHeadMatch[]>(API_ROUTES.reports.matchesBetweenTeams(team1, team2, seasonId));
  }

  async getSchedule(date: string, stadiumId?: number): Promise<MatchByDateRow[]> {
    return apiRequest<MatchByDateRow[]>(API_ROUTES.reports.matchesByDate(date, stadiumId));
  }

  async getCoachExperience(): Promise<CoachExperience[]> {
    return apiRequest<CoachExperience[]>(API_ROUTES.reports.coachesByExperience());
  }

  async getStadiumAttendance(seasonId: number): Promise<StadiumAttendance[]> {
    return apiRequest<StadiumAttendance[]>(API_ROUTES.reports.stadiumsByAttendance(seasonId));
  }

  async getTeamStatus(teamId: number, seasonId: number): Promise<TeamStatusReport> {
    return apiRequest<TeamStatusReport>(API_ROUTES.reports.teamStatus(teamId, seasonId));
  }

  async getAllStarTeam(seasonId: number): Promise<AllStarPlayer[]> {
    return apiRequest<AllStarPlayer[]>(API_ROUTES.reports.allStarTeam(seasonId));
  }
}

export const reportsApiService = new ReportsApiService();
