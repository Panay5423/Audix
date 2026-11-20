import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../../cors/services/spotify.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  playlists: any[] = [];
  loading = true;
  error: string | null = null;
  showCreateModal = false;
  newPlaylistName = '';
  newPlaylistDesc = '';
  creating = false;

  private subs = new Subscription();

  constructor(
    private spotifyService: SpotifyService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.loadPlaylists();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPlaylists(): void {
    this.loading = true;
    this.error = null;

    this.spotifyService.getUserPlaylists(50).subscribe({
      next: (res) => {
        this.playlists = res.items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load playlists', err);
        this.error = 'Failed to load user playlists from Spotify.';
        this.loading = false;
      }
    });
  }

  createPlaylist(): void {
    if (!this.newPlaylistName.trim()) return;
    this.creating = true;

    this.spotifyService.createPlaylist(this.newPlaylistName.trim(), this.newPlaylistDesc.trim(), false).subscribe({
      next: (created) => {
        this.playlists.unshift(created);
        this.newPlaylistName = '';
        this.newPlaylistDesc = '';
        this.showCreateModal = false;
        this.creating = false;
      },
      error: (err) => {
        console.error('Failed to create playlist', err);
        this.creating = false;
      }
    });
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
