import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {UserDataService} from '../user-data/user-data.service';
import {OneSignal} from '@ionic-native/onesignal/ngx';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class UserService {

    _user: any;

    constructor(public api: ApiService,
        public userData: UserDataService,
        private oneSignal: OneSignal,
        private http: HttpClient) {

    }
    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    login(accountInfo: any) {
        let seq = this.api.post('/oauth/token', accountInfo);
        return seq;
    }
    postLogin() {
        return new Promise((resolve, reject) => {
            this.getUser().subscribe((resp: any) => {
                if (resp) {
                    console.log("getUser", resp);
                    this.userData._user = resp.user;
                    let savedCards = resp.savedCards;
                    for (let key in savedCards) {
                        if (savedCards[key] == "PayU") {
                            this.userData._user.savedCard = true;
                        }
                    }
                    console.log("getUser", this.userData._user);
                    resolve("User fetched");
                }
                this.saveTokenServer();
            }, (err) => {
                console.log("getTokenError", err);
                this.userData.deleteToken();
                reject("get user error")
                // Unable to log in
            });
        });
    }
    saveTokenServer() {
        if (!document.URL.startsWith('http')) {
            this.oneSignal.getIds().then((ids) => {
            console.log('platform: food  getIds: ' + JSON.stringify(ids));
            let token = {
                "platform": "food",
                "token": ids.userId
            }
            this.registerToken(token);
        });
        }
        
    }
    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */

    getUser() {
        let url = '/user';
        return this.http.get<any>(this.api.url + url, this.api.buildHeaders(null)).pipe(
            map(model => {
                return model;
            }, err => {
                console.error('ERROR', err);
                this.api.handleError(err);
            })
        );
    }

    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    checkCredits(credits: any) {

        let seq = this.api.post('/user/credits', credits);
        return seq;
    }
    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    setAddressType(address: any, typeAddres: any) {
        let cont = {};
        let seq = this.api.post('/user/address/' + address + "/" + typeAddres, cont);

        seq.subscribe((data: any) => {

            console.log("after checkcredits");
            console.log(JSON.stringify(data));
            return data;
        }, err => {
            console.error('ERROR', err);
            this.api.handleError(err);
        });

        return seq;
    }

    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    getUserByEmail(email: any) {
        let seq = this.api.get('/contact/email/' + email);
        return seq;
    }


    /**
         * Send a POST request to our signup endpoint with the data
         * the user entered on the form.
         */
    registerToken(token: any) {
        let seq = this.api.post('/user/token', token);

        seq.subscribe((res: any) => {
            // If the API returned a successful response, mark the user as logged in
            if (res.status == 'success') {
                console.log("Push notifications token successfully stored");
            }
        }, err => {
            console.error('ERROR', err);
            this.api.handleError(err);
        });

        return seq;
    }
    registerPhone(data: any) {
        let seq = this.api.post('/user/phone', data);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    signup(accountInfo: any) {
        console.log("Signup");
        console.log(JSON.stringify(accountInfo));
        let seq = this.api.post('/auth/register', accountInfo);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    myAccount(accountInfo: any) {
        let seq = this.api.post('/user', accountInfo);
        return seq;
    }

    /**
     * Log the user out, which forgets the session
     */
    logout() {

        let seq = this.api.get('/auth/logout');
        seq.subscribe((res: any) => {
            let container = {"status": 401};
            this.userData.logout();
            this.api.hideMenu();
            this.api.handleError(container);
            // If the API returned a successful response, mark the user as logged in
        }, err => {
            console.error('ERROR', err);
            this.api.handleError(err);
        });
        return seq;
    }

    /**
       * Process a login/signup response to store user data
       */
    _loggedIn(resp, accountInfo) {
        this._user = resp.user;
        console.log("accountInfo.remember", accountInfo.remember);
        console.log("token", resp.access_token);
        this.userData.setToken(resp.access_token);
        if (accountInfo.remember) {

            this.userData.setUsername(accountInfo.username);
            this.userData.setPassword(accountInfo.password);
            this.userData.setRemember("true");
        }
        this.saveTokenServer();

    }
}
