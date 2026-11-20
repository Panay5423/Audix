import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpotifyService } from '../../cors/services/spotify.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-liked-songs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './liked-songs.component.html',
  styleUrl: './liked-songs.component.css'
})
export class LikedSongsComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  savedTracks: any[] = [];
  loading = true;
  error: string | null = null;
  total = 0;

  private subs = new Subscription();

  constructor(
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.loadSavedTracks();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadSavedTracks(): void {
    this.loading = true;
    this.error = null;

    this.spotifyService.getSavedTracks(50).subscribe({
      next: (res) => {
        this.savedTracks = res.items || [];
        this.total = res.total || this.savedTracks.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load liked songs', err);
        this.error = 'Failed to load saved tracks from Spotify.';
        this.loading = false;
      }
    });
  }

  playTrack(track: any): void {
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artist: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      album: track.album?.name || '',
      albumArt: track.album?.images?.[0]?.url || '',
      durationMs: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url
    };
    this.playerService.playTrack(playerTrack);
  }

  playAll(): void {
    if (this.savedTracks.length > 0 && this.savedTracks[0]?.track) {
      this.playTrack(this.savedTracks[0].track);
    }
  }

  unlikeTrack(trackId: string, index: number): void {
    this.spotifyService.removeSavedTrack(trackId).subscribe({
      next: () => {
        this.savedTracks.splice(index, 1);
        this.total = Math.max(0, this.total - 1);
      },
      error: (err) => console.error('Failed to remove liked song', err)
    });
  }

  formatTime(ms: number): string {
    if (!ms) return '0:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  getThemeTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-400';
  }

  getThemeBgClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-500 hover:bg-emerald-400 text-black';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white';
    return 'bg-violet-600 hover:bg-violet-500 text-white';
  }
}
