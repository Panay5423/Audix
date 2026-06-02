import { Injectable } from "@angular/core";
import { base_url } from "../../Environment/Environment.variable";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {


    constructor(private http: HttpClient) { }
    getAccessToken(): Observable<any> {
        return this.http.get<string>(`${base_url}/api/acess-token`);
    }
}
