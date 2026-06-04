import { Injectable } from "@angular/core";
import { base_url } from "../../Environment/Environment.variable";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {


    constructor(private http: HttpClient) { }
    getAccessToken(): Observable<any> {
        return this.http.get<string>(`${base_url}/api/auth/authorization`);
    }

    getUserProfile(spotifyId: string): Observable<any> {
        return this.http.get<any>(`${base_url}/api/auth/user/${spotifyId}`);
    }

    saveSpotifyId(spotifyId: string): void {
        localStorage.setItem('spotifyId', spotifyId);
    }

    getSpotifyId(): string | null {
        return localStorage.getItem('spotifyId');
    }

    clearSpotifyId(): void {
        localStorage.removeItem('spotifyId');
    }
}
