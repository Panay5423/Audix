import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiService, GeneratedPlaylistData } from '../../cors/services/ai.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-playlist-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-playlist-generator.component.html',
  styleUrl: './ai-playlist-generator.component.css'
})
export class AiPlaylistGeneratorComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  prompt = '';
  generating = false;
  savingToSpotify = false;
  playlist: GeneratedPlaylistData | null = null;
  savedSuccessMessage: string | null = null;
  error: string | null = null;

  presets = [
    'Create a 15-song playlist for a rainy midnight in Tokyo',
    'High energy cyberpunk workout mix with driving basslines',
    'Acoustic coffeehouse indie folk for calm focus',
    'Dark synthwave and nocturnal dream pop',
    'Songs similar to The Weeknd, Arctic Monkeys, and Tame Impala',
    'Eclectic summer roadtrip anthems across eras'
  ];

  private subs = new Subscription();

  constructor(
    private aiService: AiService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  generate(presetPrompt?: string): void {
    const text = (presetPrompt || this.prompt).trim();
    if (!text || this.generating) return;

    this.prompt = text;
    this.generating = true;
    this.error = null;
    this.savedSuccessMessage = null;

    this.aiService.generatePlaylist(text).subscribe({
      next: (res) => {
        this.playlist = res;
        this.generating = false;
      },
      error: (err) => {
        console.error('Playlist generation error', err);
        this.error = 'Failed to generate playlist. Please try again.';
        this.generating = false;
      }
    });
  }

  saveToSpotify(): void {
    if (!this.playlist || this.savingToSpotify) return;

    this.savingToSpotify = true;
    this.error = null;

    this.aiService.savePlaylistToSpotify(this.playlist._id).subscribe({
      next: (res) => {
        this.savingToSpotify = false;
        if (this.playlist) {
          this.playlist.isSavedToSpotify = true;
          this.playlist.spotifyPlaylistUrl = res.spotifyPlaylistUrl;
        }
        this.savedSuccessMessage = 'Playlist successfully created and synced to your Spotify library!';
      },
      error: (err) => {
        console.error('Save to spotify error', err);
        this.savingToSpotify = false;
        this.error = 'Failed to save to Spotify. Please make sure Spotify permissions are granted.';
      }
    });
  }

  playTrack(track: any): void {
    const playerTrack: PlayerTrack = {
      id: track.spotifyId || track.id,
      name: track.name,
      artist: track.artist || track.artists?.join(', ') || 'Unknown Artist',
      album: track.album || '',
      albumArt: track.albumCover || '',
      durationMs: track.durationMs || 180000,
      uri: track.uri,
      previewUrl: track.previewUrl
    };
    this.playerService.playTrack(playerTrack);
  }

  playAll(): void {
    if (this.playlist?.tracks && this.playlist.tracks.length > 0) {
      this.playTrack(this.playlist.tracks[0]);
    }
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
    if (this.activeTheme === 'spotify') return 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
    return 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20';
  }
}
