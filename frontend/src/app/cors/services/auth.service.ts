import { Injectable } from "@angular/core";
import { base_url, api_url } from "../../Environment/Environment.variable";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, tap, catchError } from "rxjs";
import { Router } from "@angular/router";

export interface UserProfile {
    _id?: string;
    spotifyId: string;
    displayName: string;
    email?: string;
    country?: string;
    product?: string;
    followers?: { total: number; href: string };
    images?: Array<{ url: string; height: number; width: number }>;
    external_urls?: { spotify: string };
    explicit_content?: { filter_enabled: boolean; filter_locked: boolean };
    uri?: string;
    preferences?: {
        preferredTheme?: 'purple' | 'spotify' | 'light';
        autoPlayRecommendations?: boolean;
        discoveryDegree?: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
    private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        if (typeof window !== 'undefined' && this.getToken()) {
            this.fetchCurrentUser().subscribe();
        }
    }

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    clearToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }

    getAccessToken(): Observable<{ url: string }> {
        return this.http.get<{ url: string }>(`${api_url}/auth/authorization`);
    }

    getcurrentuser(token?: string): Observable<UserProfile> {
        return this.fetchCurrentUser();
    }

    fetchCurrentUser(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${api_url}/auth/me`).pipe(
            tap(user => {
                this.currentUserSubject.next(user);
            }),
            catchError(err => {
                if (err.status === 401 || err.status === 403) {
                    this.currentUserSubject.next(null);
                    this.clearToken();
                }
                throw err;
            })
        );
    }

    getSdkToken(): Observable<{ accessToken: string }> {
        return this.http.get<{ accessToken: string }>(`${api_url}/auth/sdk-token`);
    }

    updatePreferences(preferences: any): Observable<any> {
        return this.http.put(`${api_url}/auth/preferences`, preferences).pipe(
            tap(() => {
                const current = this.currentUserSubject.value;
                if (current) {
                    current.preferences = { ...current.preferences, ...preferences };
                    this.currentUserSubject.next({ ...current });
                }
            })
        );
    }

    logout(): void {
        this.http.post(`${api_url}/auth/logout`, {}).subscribe({
            next: () => {},
            error: () => {}
        });
        this.clearToken();
        this.currentUserSubject.next(null);
        this.router.navigate(['/home']);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
