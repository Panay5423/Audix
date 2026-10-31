import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-audix-scroll-intro',
  standalone: true,
  templateUrl: './audix-scroll-intro.component.html',
  styleUrl: './audix-scroll-intro.component.css'
})
export class AudixScrollIntroComponent {
  stage = 0;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const section = document.querySelector<HTMLElement>('.audix-scroll-story');
    if (!section) return;

    const distance = section.offsetHeight - window.innerHeight;
    if (distance <= 0) {
      this.stage = 0;
      return;
    }

    const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance));
    this.stage = Math.min(3, Math.floor(progress * 4));
  }

  skipIntro(): void {
    document.querySelector('#audix-home-content')?.scrollIntoView({ behavior: 'smooth' });
  }
}
