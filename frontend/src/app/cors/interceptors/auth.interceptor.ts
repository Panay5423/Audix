import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let modifiedReq = req.clone({
        withCredentials: true
    });

    if (token) {
        modifiedReq = modifiedReq.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
                token: token
            }
        });
    }

    return next(modifiedReq);
};
