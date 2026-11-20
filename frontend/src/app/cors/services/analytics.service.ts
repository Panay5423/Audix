import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api_url } from '../../Environment/Environment.variable';

export interface AnalyticsSummary {
    timeRange: string;
    totalTracksAnalyzed: number;
    totalArtistsAnalyzed: number;
    totalSavedTracks: number;
    totalPlaylists: number;
    avgPopularity: number;
    obscurityScore: number;
    popularityTiers: {
        mainstream: number;
        midTier: number;
        underground: number;
    };
    repeatRatePercentage: number;
    topGenres: Array<{ name: string; count: number; percentage: number }>;
    decades: Array<{ decade: string; count: number; percentage: number }>;
    topArtistsPreview: Array<{ id: string; name: string; followers: number; image: string; popularity: number }>;
    topTracksPreview: Array<{ id: string; name: string; artist: string; album: string; image: string; durationMs: number; popularity: number }>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private base = `${api_url}/analytics`;

    constructor(private http: HttpClient) {}

    getAnalytics(timeRange = 'medium_term'): Observable<AnalyticsSummary> {
        return this.http.get<AnalyticsSummary>(this.base, { params: { time_range: timeRange } });
    }
}
