import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api_url } from '../../Environment/Environment.variable';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
    private base = `${api_url}/spotify`;

    constructor(private http: HttpClient) {}

    getProfile(): Observable<any> {
        return this.http.get(`${this.base}/me`);
    }

    getTopTracks(timeRange = 'medium_term', limit = 20): Observable<any> {
        return this.http.get(`${this.base}/top-tracks`, {
            params: { time_range: timeRange, limit }
        });
    }

    getTopArtists(timeRange = 'medium_term', limit = 20): Observable<any> {
        return this.http.get(`${this.base}/top-artists`, {
            params: { time_range: timeRange, limit }
        });
    }

    getRecentlyPlayed(limit = 20): Observable<any> {
        return this.http.get(`${this.base}/recently-played`, { params: { limit } });
    }

    getSavedTracks(limit = 20, offset = 0): Observable<any> {
        return this.http.get(`${this.base}/saved-tracks`, { params: { limit, offset } });
    }

    checkSavedTracks(ids: string[]): Observable<boolean[]> {
        return this.http.get<boolean[]>(`${this.base}/saved-tracks/check`, {
            params: { ids: ids.join(',') }
        });
    }

    saveTrack(id: string): Observable<any> {
        return this.http.put(`${this.base}/saved-tracks`, { ids: [id] });
    }

    removeSavedTrack(id: string): Observable<any> {
        return this.http.delete(`${this.base}/saved-tracks`, { body: { ids: [id] } });
    }

    getUserPlaylists(limit = 30, offset = 0): Observable<any> {
        return this.http.get(`${this.base}/playlists`, { params: { limit, offset } });
    }

    getPlaylist(id: string): Observable<any> {
        return this.http.get(`${this.base}/playlists/${id}`);
    }

    getPlaylistTracks(id: string, limit = 50, offset = 0): Observable<any> {
        return this.http.get(`${this.base}/playlists/${id}/tracks`, { params: { limit, offset } });
    }

    createPlaylist(name: string, description = '', isPublic = false): Observable<any> {
        return this.http.post(`${this.base}/playlists`, { name, description, isPublic });
    }

    addTracksToPlaylist(playlistId: string, uris: string[]): Observable<any> {
        return this.http.post(`${this.base}/playlists/${playlistId}/tracks`, { uris });
    }

    removeTracksFromPlaylist(playlistId: string, uris: string[]): Observable<any> {
        return this.http.delete(`${this.base}/playlists/${playlistId}/tracks`, { body: { uris } });
    }

    updatePlaylist(id: string, data: { name?: string; description?: string; isPublic?: boolean }): Observable<any> {
        return this.http.put(`${this.base}/playlists/${id}`, data);
    }

    search(query: string, type = 'track,artist,album,playlist', limit = 15): Observable<any> {
        return this.http.get(`${this.base}/search`, {
            params: { q: query, type, limit }
        });
    }

    getArtist(id: string): Observable<any> {
        return this.http.get(`${this.base}/artists/${id}`);
    }

    getAlbum(id: string): Observable<any> {
        return this.http.get(`${this.base}/albums/${id}`);
    }

    getFeaturedPlaylists(limit = 15): Observable<any> {
        return this.http.get(`${this.base}/featured-playlists`, { params: { limit } });
    }

    getNewReleases(limit = 15): Observable<any> {
        return this.http.get(`${this.base}/new-releases`, { params: { limit } });
    }

    getCategories(limit = 20): Observable<any> {
        return this.http.get(`${this.base}/categories`, { params: { limit } });
    }

    getCategoryPlaylists(id: string, limit = 15): Observable<any> {
        return this.http.get(`${this.base}/categories/${id}/playlists`, { params: { limit } });
    }

    getRecommendations(params: { seed_artists?: string; seed_genres?: string; seed_tracks?: string; limit?: number }): Observable<any> {
        return this.http.get(`${this.base}/recommendations`, { params });
    }
}
