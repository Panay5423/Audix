import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../../cors/services/spotify.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.css'
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  playlistId: string | null = null;
  playlist: any = null;
  tracks: any[] = [];
  loading = true;
  error: string | null = null;

  // Add track search
  searchSongQuery = '';
  searchResults: any[] = [];
  searchingSongs = false;
  showAddTrackSection = false;

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );

    this.subs.add(
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.playlistId = id;
          this.loadPlaylist(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPlaylist(id: string): void {
    this.loading = true;
    this.error = null;

    this.spotifyService.getPlaylist(id).subscribe({
      next: (res) => {
        this.playlist = res;
        this.tracks = (res.tracks?.items || []).filter((item: any) => item.track);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load playlist', err);
        this.error = 'Failed to load playlist details from Spotify.';
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
      albumArt: track.album?.images?.[0]?.url || this.playlist?.images?.[0]?.url || '',
      durationMs: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url
    };
    this.playerService.playTrack(playerTrack);
  }

  playAll(): void {
    if (this.tracks.length > 0 && this.tracks[0]?.track) {
      this.playTrack(this.tracks[0].track);
    }
  }

  searchSongsToAdd(): void {
    if (!this.searchSongQuery.trim()) return;
    this.searchingSongs = true;
    this.spotifyService.search(this.searchSongQuery.trim(), 'track', 5).subscribe({
      next: (res) => {
        this.searchResults = res.tracks?.items || [];
        this.searchingSongs = false;
      },
      error: () => this.searchingSongs = false
    });
  }

  addTrack(track: any): void {
    if (!this.playlistId || !track.uri) return;
    this.spotifyService.addTracksToPlaylist(this.playlistId, [track.uri]).subscribe({
      next: () => {
        this.tracks.push({ track, added_at: new Date().toISOString() });
        this.searchResults = this.searchResults.filter(s => s.id !== track.id);
      },
      error: (err) => console.error('Failed to add track', err)
    });
  }

  removeTrack(track: any, index: number): void {
    if (!this.playlistId || !track.uri) return;
    this.spotifyService.removeTracksFromPlaylist(this.playlistId, [track.uri]).subscribe({
      next: () => {
        this.tracks.splice(index, 1);
      },
      error: (err) => console.error('Failed to remove track', err)
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
