import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../cors/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
  constructor(private AuthService: AuthService) { }

  Spotify_auth_URl: string = "";
  ngOnInit() {
    this.AuthService.getAccessToken().subscribe({
      next: (res: any) => {
        this.Spotify_auth_URl = res.url;
        console.log(this.Spotify_auth_URl);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
}
