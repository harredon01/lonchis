import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UserDataService} from '../user-data/user-data.service';
import { NavController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import {Router} from '@angular/router';
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    url: string = 'https://www.lonchis.com.co/api';
    urlsite: string = 'https://www.lonchis.com.co';
    constructor(public http: HttpClient,
        private router: Router,
        private navCtrl:NavController,
        public userData: UserDataService) {
    }

    get(endpoint: string, params?: any, reqOpts?: any) : Observable<any>  {
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }

        // Support easy query params for GET requests
        if (params) {
            reqOpts.params = new HttpParams();
            for (let k in params) {
                reqOpts.params = reqOpts.params.set(k, params[k]);
            }
        }

        reqOpts = this.buildHeaders(reqOpts);
        return this.http.get(this.url + endpoint, reqOpts);
    }
    buildHeaders(reqOpts) {
        if (reqOpts) {
            reqOpts.headers = this.userData._headers;
        } else {
            reqOpts = {
                headers: this.userData._headers
            };
        }
        return reqOpts;
        //return this.http.post(this.url + '/' + endpoint, body, reqOpts);
    }

    post(endpoint: string, body: any, reqOpts?: any) : Observable<any> {
        console.log("body", body);

        console.log("Endopoint", endpoint);
        let urlF = this.url + endpoint;
        if (endpoint == "/oauth/token") {
            urlF = this.urlsite + endpoint;
        }
        reqOpts = this.buildHeaders(reqOpts);
        console.log("ReqOpts");
        console.log(JSON.stringify(reqOpts));
        return this.http.post(urlF, body, reqOpts);
    }

    put(endpoint: string, body: any, reqOpts?: any) {
        reqOpts = this.buildHeaders(reqOpts);
        return this.http.put(this.url + endpoint, body, reqOpts);
    }

    delete(endpoint: string, params?: any,  reqOpts?: any) {
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }

        // Support easy query params for GET requests
        if (params) {
            reqOpts.params = new HttpParams();
            for (let k in params) {
                reqOpts.params = reqOpts.params.set(k, params[k]);
            }
        }
        reqOpts = this.buildHeaders(reqOpts);
        return this.http.delete(this.url + endpoint, reqOpts);
    }

    patch(endpoint: string, body: any, reqOpts?: any) {
        reqOpts = this.buildHeaders(reqOpts);
        return this.http.patch(this.url + endpoint, body, reqOpts);
    }

    handleError(error: any) {
        if (error.status == 401) {
            this.navCtrl.navigateRoot('/login');
        }
    }
}
