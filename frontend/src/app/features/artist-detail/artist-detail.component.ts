import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../../cors/services/spotify.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artist-detail.component.html',
  styleUrl: './artist-detail.component.css'
})
export class ArtistDetailComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  artistId: string | null = null;
  artist: any = null;
  topTracks: any[] = [];
  albums: any[] = [];
  relatedArtists: any[] = [];
  loading = true;
  error: string | null = null;

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
          this.artistId = id;
          this.loadArtist(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadArtist(id: string): void {
    this.loading = true;
    this.error = null;

    this.spotifyService.getArtist(id).subscribe({
      next: (res) => {
        this.artist = res.artist;
        this.topTracks = res.topTracks || [];
        this.albums = res.albums || [];
        this.relatedArtists = res.relatedArtists || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load artist', err);
        this.error = 'Failed to load artist details from Spotify.';
        this.loading = false;
      }
    });
  }

  playTrack(track: any): void {
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artist: track.artists?.map((a: any) => a.name).join(', ') || this.artist?.name || '',
      album: track.album?.name || '',
      albumArt: track.album?.images?.[0]?.url || this.artist?.images?.[0]?.url || '',
      durationMs: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url
    };
    this.playerService.playTrack(playerTrack);
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
