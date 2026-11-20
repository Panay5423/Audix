import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { api_url } from '../../Environment/Environment.variable';
import { AuthService } from './auth.service';

export interface PlayerTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    durationMs: number;
    uri: string;
    previewUrl?: string;
    isLiked?: boolean;
}

export interface PlaybackDevice {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    volume_percent: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
    private base = `${api_url}/spotify/player`;

    public currentTrack$ = new BehaviorSubject<PlayerTrack | null>(null);
    public isPlaying$ = new BehaviorSubject<boolean>(false);
    public progressMs$ = new BehaviorSubject<number>(0);
    public durationMs$ = new BehaviorSubject<number>(0);
    public volume$ = new BehaviorSubject<number>(80);
    public devices$ = new BehaviorSubject<PlaybackDevice[]>([]);
    public activeDevice$ = new BehaviorSubject<PlaybackDevice | null>(null);
    public playbackStatusMessage$ = new BehaviorSubject<string | null>(null);

    private previewAudio: HTMLAudioElement | null = null;
    private progressIntervalSub: Subscription | null = null;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private zone: NgZone
    ) {
        if (typeof window !== 'undefined') {
            this.previewAudio = new Audio();
            this.previewAudio.volume = 0.8;

            this.previewAudio.addEventListener('timeupdate', () => {
                this.zone.run(() => {
                    if (this.previewAudio) {
                        this.progressMs$.next(Math.floor(this.previewAudio.currentTime * 1000));
                        this.durationMs$.next(Math.floor((this.previewAudio.duration || 30) * 1000));
                    }
                });
            });

            this.previewAudio.addEventListener('ended', () => {
                this.zone.run(() => {
                    this.isPlaying$.next(false);
                    this.progressMs$.next(0);
                });
            });

            this.pollPlayerState();
        }
    }

    pollPlayerState(): void {
        this.fetchPlayerState();
        this.fetchDevices();
        // Periodic sync with active Spotify device
        interval(15000).subscribe(() => {
            if (this.authService.isAuthenticated()) {
                this.fetchPlayerState();
            }
        });
    }

    fetchPlayerState(): void {
        this.http.get<any>(`${this.base}/state`).subscribe({
            next: (state) => {
                if (state && state.item) {
                    const track: PlayerTrack = {
                        id: state.item.id,
                        name: state.item.name,
                        artist: state.item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
                        album: state.item.album?.name || '',
                        albumArt: state.item.album?.images?.[0]?.url || '',
                        durationMs: state.item.duration_ms,
                        uri: state.item.uri,
                        previewUrl: state.item.preview_url
                    };
                    this.currentTrack$.next(track);
                    this.isPlaying$.next(state.is_playing);
                    this.progressMs$.next(state.progress_ms || 0);
                    this.durationMs$.next(state.item.duration_ms || 0);
                    if (state.device) {
                        this.activeDevice$.next(state.device);
                        this.volume$.next(state.device.volume_percent ?? 80);
                    }
                }
            },
            error: () => {}
        });
    }

    fetchDevices(): void {
        this.http.get<any>(`${this.base}/devices`).subscribe({
            next: (res) => {
                const list: PlaybackDevice[] = res?.devices || [];
                this.devices$.next(list);
                const active = list.find(d => d.is_active);
                if (active) this.activeDevice$.next(active);
            },
            error: () => {}
        });
    }

    /**
     * Plays a track. Attempts Spotify Web API player first.
     * If no active device or free tier, falls back seamlessly to HTML5 preview audio.
     */
    playTrack(track: PlayerTrack): void {
        this.currentTrack$.next(track);
        this.playbackStatusMessage$.next(null);

        // Try Spotify API playback first
        this.http.put(`${this.base}/play`, { uris: [track.uri] }).subscribe({
            next: () => {
                this.isPlaying$.next(true);
                this.stopPreview();
                this.startProgressTracking(track.durationMs);
            },
            error: (err) => {
                // If Spotify API playback fails (e.g., no active device or Spotify Free), use preview audio
                console.warn('Spotify Connect play failed, falling back to 30-second preview:', err.message);
                if (track.previewUrl) {
                    this.playPreview(track.previewUrl);
                    this.playbackStatusMessage$.next('Playing 30s audio preview (Spotify device not active)');
                } else {
                    this.playbackStatusMessage$.next('To stream full tracks, open Spotify on any device or Spotify Desktop.');
                }
            }
        });
    }

    togglePlay(): void {
        const isCurrentlyPlaying = this.isPlaying$.value;
        const currentTrack = this.currentTrack$.value;

        if (!currentTrack) return;

        if (isCurrentlyPlaying) {
            // Pause
            this.isPlaying$.next(false);
            if (this.previewAudio && !this.previewAudio.paused) {
                this.previewAudio.pause();
            }
            this.http.put(`${this.base}/pause`, {}).subscribe({ error: () => {} });
        } else {
            // Resume
            if (this.previewAudio && this.previewAudio.src && this.previewAudio.paused) {
                this.previewAudio.play();
                this.isPlaying$.next(true);
            } else {
                this.http.put(`${this.base}/play`, {}).subscribe({
                    next: () => this.isPlaying$.next(true),
                    error: () => {
                        if (currentTrack.previewUrl) {
                            this.playPreview(currentTrack.previewUrl);
                        }
                    }
                });
            }
        }
    }

    next(): void {
        this.http.post(`${this.base}/next`, {}).subscribe({
            next: () => setTimeout(() => this.fetchPlayerState(), 500),
            error: () => {}
        });
    }

    previous(): void {
        this.http.post(`${this.base}/previous`, {}).subscribe({
            next: () => setTimeout(() => this.fetchPlayerState(), 500),
            error: () => {}
        });
    }

    seek(positionMs: number): void {
        this.progressMs$.next(positionMs);
        if (this.previewAudio && this.previewAudio.src) {
            this.previewAudio.currentTime = positionMs / 1000;
        } else {
            this.http.put(`${this.base}/seek`, { position_ms: positionMs }).subscribe({ error: () => {} });
        }
    }

    setVolume(percent: number): void {
        this.volume$.next(percent);
        if (this.previewAudio) {
            this.previewAudio.volume = percent / 100;
        }
        this.http.put(`${this.base}/volume`, { volume_percent: percent }).subscribe({ error: () => {} });
    }

    transferDevice(deviceId: string): void {
        this.http.put(`${this.base}/transfer`, { device_id: deviceId }).subscribe({
            next: () => {
                setTimeout(() => {
                    this.fetchDevices();
                    this.fetchPlayerState();
                }, 1000);
            },
            error: (err) => console.error('Failed to transfer playback', err)
        });
    }

    private playPreview(url: string): void {
        if (!this.previewAudio) return;
        this.previewAudio.src = url;
        this.previewAudio.play().then(() => {
            this.isPlaying$.next(true);
        }).catch(e => console.error('Preview audio play error', e));
    }

    private stopPreview(): void {
        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio.currentTime = 0;
        }
    }

    private startProgressTracking(totalMs: number): void {
        if (this.progressIntervalSub) this.progressIntervalSub.unsubscribe();
        this.durationMs$.next(totalMs);
        this.progressIntervalSub = interval(1000).subscribe(() => {
            if (this.isPlaying$.value) {
                const cur = this.progressMs$.value;
                if (cur + 1000 <= totalMs) {
                    this.progressMs$.next(cur + 1000);
                }
            }
        });
    }
}
