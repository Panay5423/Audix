import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api_url } from '../../Environment/Environment.variable';

export interface ChatMessageItem {
    _id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    recommendedTracks?: Array<{
        id: string;
        name: string;
        artists: string[];
        album: string;
        albumCover: string;
        duration_ms: number;
        spotifyUrl: string;
        uri: string;
    }>;
    createdAt?: string;
}

export interface GeneratedPlaylistData {
    _id: string;
    title: string;
    description: string;
    prompt: string;
    genreTags: string[];
    mood: string;
    isSavedToSpotify: boolean;
    spotifyPlaylistId?: string;
    spotifyPlaylistUrl?: string;
    tracks: Array<{
        spotifyId: string;
        name: string;
        artist: string;
        album: string;
        albumCover: string;
        durationMs: number;
        uri: string;
        previewUrl?: string;
    }>;
}

export interface TasteAnalysisData {
    archetype: string;
    summary: string;
    dominantMoods: string[];
    aesthetic: string;
    recommendedExploration: string;
    topGenres: Array<{ genre: string; count: number }>;
    avgPopularity: number;
    obscurityScore: number;
    favoriteArtists: Array<{ id: string; name: string; image?: string; genres: string[] }>;
    favoriteTracks: Array<{ id: string; name: string; artist: string; image?: string; durationMs: number }>;
}

@Injectable({ providedIn: 'root' })
export class AiService {
    private base = `${api_url}/ai`;

    constructor(private http: HttpClient) {}

    chat(message: string): Observable<{ reply: string; recommendedTracks: any[]; messageId: string }> {
        return this.http.post<{ reply: string; recommendedTracks: any[]; messageId: string }>(`${this.base}/chat`, { message });
    }

    getChatHistory(): Observable<ChatMessageItem[]> {
        return this.http.get<ChatMessageItem[]>(`${this.base}/chat/history`);
    }

    generatePlaylist(prompt: string): Observable<GeneratedPlaylistData> {
        return this.http.post<GeneratedPlaylistData>(`${this.base}/generate-playlist`, { prompt });
    }

    savePlaylistToSpotify(playlistId: string): Observable<{ success: boolean; spotifyPlaylistId: string; spotifyPlaylistUrl: string }> {
        return this.http.post<{ success: boolean; spotifyPlaylistId: string; spotifyPlaylistUrl: string }>(`${this.base}/save-playlist`, { playlistId });
    }

    getTasteAnalysis(): Observable<TasteAnalysisData> {
        return this.http.get<TasteAnalysisData>(`${this.base}/taste-analysis`);
    }
}
