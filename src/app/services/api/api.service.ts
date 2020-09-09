import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UserDataService} from '../user-data/user-data.service';
import {TranslateService} from '@ngx-translate/core';
import {NavController, LoadingController, ToastController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {Observable, of} from 'rxjs';
import {Router} from '@angular/router';
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    loading:any;
    url: string = 'https://www.lonchis.com.co/api';
    urlsite: string = 'https://www.lonchis.com.co';
    constructor(public http: HttpClient,
        private toastCtrl: ToastController,
        private router: Router,
        private translateService: TranslateService,
        private loadingCtrl: LoadingController,
        private navCtrl: NavController,
        private spinnerDialog: SpinnerDialog,
        public userData: UserDataService) {
    }
    toast(message: string) {
        this.translateService.get(message).subscribe((value) => {
            this.toastCtrl.create({
                message: value,
                duration: 1300,
                position: 'top'
            }).then(toast => toast.present());
        })
    }
    hideMenu() {
        console.log("Hiding menu")
        if (this.userData._user) {
            const tabBar = document.getElementById("tab-button-chat-room");
            tabBar.style.display = "block";
            const tabBar2 = document.getElementById("tab-button-settings");
            tabBar2.style.display = "block";
        } else {
            const tabBar = document.getElementById("tab-button-chat-room");
            tabBar.style.display = "none";
            const tabBar2 = document.getElementById("tab-button-settings");
            tabBar2.style.display = "none";
        }
    }
    async dismissLoader() {
        if (document.URL.startsWith('http')) {
            let topLoader = await this.loadingCtrl.getTop();
            while (topLoader) {
                if (!(await topLoader.dismiss())) {
                    console.log('Could not dismiss the topmost loader. Aborting...');
                    return;
                }
                topLoader = await this.loadingCtrl.getTop();
            }
        } else {
            this.spinnerDialog.hide();
        }
    }

    loader(message?: string) {
        if (message) {
            this.translateService.get(message).subscribe((value) => {
                if (document.URL.startsWith('http')) {
                    this.loadingCtrl.create({
                    spinner: 'crescent',
                    message:value,
                    backdropDismiss: true
                }).then(toast => toast.present());
                } else {
                    this.spinnerDialog.show(null, value);
                }
            });
        } else {
            if (document.URL.startsWith('http')) {
                this.loadingCtrl.create({
                    spinner: 'crescent',
                    backdropDismiss: true
                }).then(toast => toast.present());
            } else {
                this.spinnerDialog.show();
            }
        }

    }

    get(endpoint: string, params?: any, reqOpts?: any): Observable<any> {
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

    post(endpoint: string, body: any, reqOpts?: any): Observable<any> {
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

    delete(endpoint: string, params?: any, reqOpts?: any) {
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
