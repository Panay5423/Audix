import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent }
    ]
  },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
