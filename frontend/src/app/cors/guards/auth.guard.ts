import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. If token is present in route query params (fresh from Spotify OAuth callback)
    const tokenFromQuery = route.queryParamMap.get('token');
    if (tokenFromQuery) {
        authService.setToken(tokenFromQuery);
        return true;
    }

    // 2. If token is already saved in localStorage
    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/home'], { queryParams: { redirect: state.url } });
    return false;
};
