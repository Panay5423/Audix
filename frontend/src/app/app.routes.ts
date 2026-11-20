import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DiscoverComponent } from './features/discover/discover.component';
import { SearchComponent } from './features/search/search.component';
import { ArtistDetailComponent } from './features/artist-detail/artist-detail.component';
import { AlbumDetailComponent } from './features/album-detail/album-detail.component';
import { PlaylistsComponent } from './features/playlists/playlists.component';
import { PlaylistDetailComponent } from './features/playlist-detail/playlist-detail.component';
import { LikedSongsComponent } from './features/liked-songs/liked-songs.component';
import { RecentlyPlayedComponent } from './features/recently-played/recently-played.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { AiAssistantComponent } from './features/ai-assistant/ai-assistant.component';
import { AiPlaylistGeneratorComponent } from './features/ai-playlist-generator/ai-playlist-generator.component';
import { ProfileComponent } from './features/profile/profile.component';
import { SettingsComponent } from './features/settings/settings.component';
import { authGuard } from './cors/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'discover', component: DiscoverComponent },
      { path: 'search', component: SearchComponent },
      { path: 'artist/:id', component: ArtistDetailComponent },
      { path: 'album/:id', component: AlbumDetailComponent },
      { path: 'playlists', component: PlaylistsComponent },
      { path: 'playlist/:id', component: PlaylistDetailComponent },
      { path: 'liked-songs', component: LikedSongsComponent },
      { path: 'recently-played', component: RecentlyPlayedComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'ai-assistant', component: AiAssistantComponent },
      { path: 'ai-playlist-generator', component: AiPlaylistGeneratorComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
