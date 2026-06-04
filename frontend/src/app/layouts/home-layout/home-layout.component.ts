import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from '../../shard/components/side-bar/side-bar.component';
import { TopBarComponent } from '../../shard/components/top-bar/top-bar.component';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideBarComponent, TopBarComponent],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.css'
})
export class HomeLayoutComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  private themeSub = new Subscription();

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSub = this.themeService.activeTheme$.subscribe(theme => {
      this.activeTheme = theme;
    });
  }

  ngOnDestroy() {
    this.themeSub.unsubscribe();
  }
}
