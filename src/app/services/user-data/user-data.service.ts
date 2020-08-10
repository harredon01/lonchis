import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {Events} from '../events/events.service';
import {SecureStorageEcho, SecureStorageEchoObject} from '@ionic-native/secure-storage-echo/ngx';

@Injectable({
    providedIn: 'root'
})
export class UserDataService {
    _user: any;
    _headers: any;
    storage: any;
    useSecure: boolean = false;
    storageLoaded: boolean = false;
    deviceSet: boolean = false;
    public isDevice: boolean = false;
    constructor(private secureStorageEcho: SecureStorageEcho, private events: Events, public storage2: Storage) {
        console.log("Building headers");
        this._headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'my-auth-token',
            'Accept': 'application/json'
        });
    }
    initSecureStorage() {
        console.log("Init secure storage");
        try {
            this.secureStorageEcho.create('my_store_name')
                .then((storage: SecureStorageEchoObject) => {
                    this.storage = storage;
                    this.useSecure = true;
                    this.storageLoaded = true;
                    this.events.publish('storageInitialized', {});
                    console.log("Secure storage initialized");

                }).catch((error) => {
                    this.storageLoaded = true;
                    this.events.publish('storageInitialized', {});
                    console.log("Secure storage failed");

                });
        }
        catch (err) {
            this.storageLoaded = true;
            this.events.publish('storageInitialized', {});
            console.log("Secure storage failed");
        }
    }
    getLanguage(): Promise<string> {
        if (this.useSecure) {
            return this.storage.get('language').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('language').then((value) => {
                return value;
            });
        }

    }
    setLanguage(lang: string) {
        if (this.useSecure) {
            this.storage.set('language', lang);
        } else {
            this.storage2.set('language', lang);
        }
    }

    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    setToken(token: string) {
        this._headers = this._headers.set('Authorization', 'Bearer ' + token);
        this._headers = this._headers.set('X-Auth-Token', token);
        if (this.useSecure) {
            this.storage.set('token', token);
        } else {
            this.storage2.set('token', token);
        }


    }
    setDevice(device_id: string) {
        this.deviceSet = true;
        this._headers = this._headers.set('X-device-id', device_id);
        this.events.publish('deviceSet', {});
        if (this.useSecure) {
            this.storage.set('device_id', device_id);
        } else {
            this.storage2.set('device_id', device_id);
        }

    }
    getDevice() {
        if (this.useSecure) {
            return this.storage.get('device_id').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('device_id').then((value) => {
                return value;
            });
        }

    }

    /**
     * get username from local storage.
     */
    getToken(): Promise<string> {
        if (this.useSecure) {
            return this.storage.get('token').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('token').then((value) => {
                return value;
            });
        }

    }
    deleteToken(): Promise<string> {
        if (this.useSecure) {
            return this.storage.remove('token').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.remove('token').then((value) => {
                return value;
            });
        }

    }
    deleteAllSession(): Promise<string> {
        if (this.useSecure) {
            return this.storage.remove('token').then((value) => {
                this.storage.remove('username');
                this.storage.remove('password');
                this.storage.remove('remember');

                this._headers = this._headers.set('Authorization', 'Bearer ');
                this._headers = this._headers.set('X-Auth-Token', '');
                this.storage.set('token', "");
                return value;
            });
        } else {
            return this.storage2.remove('token').then((value) => {
                this.storage2.remove('username');
                this.storage2.remove('password');
                this.storage2.remove('remember');

                this._headers = this._headers.set('Authorization', 'Bearer ');
                this._headers = this._headers.set('X-Auth-Token', '');
                this.storage2.set('token', null);
                return value;
            });
        }

    }

    /**
     * Saves username in local storage.
     */
    setUsername(username: string): Promise<any> {
        if (this.useSecure) {
            return this.storage.set('username', username);
        } else {
            return this.storage2.set('username', username);
        }
    }

    /**
   * get username from local storage.
   */
    getUsername(): Promise<string> {
        if (this.useSecure) {
            return this.storage.get('username').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('username').then((value) => {
                return value;
            });
        }

    }

    /**
     * Saves username in local storage.
     */
    setQuickPay(username: string): Promise<any> {
        if (this.useSecure) {
            return this.storage.set('username', username);
        } else {
            return this.storage2.set('username', username);
        }

    }

    /**
   * get username from local storage.
   */
    getQuickPay(): Promise<string> {
        if (this.useSecure) {
            return this.storage.get('username').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('username').then((value) => {
                return value;
            });
        }

    }
    /**
     * Saves username in local storage.
     */
    setPassword(password: string): Promise<any> {
        if (this.useSecure) {
            return this.storage.set('password', password);
        } else {
            return this.storage2.set('password', password);
        }

    }

    /**
   * get username from local storage.
   */
    getPassword(): Promise<string> {
        if (this.useSecure) {
            return this.storage.get('password').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('password').then((value) => {
                return value;
            });
        }

    }
    /**
     * Saves username in local storage.
     */
    setRemember(remember: string): Promise<any> {
        if (this.useSecure) {
            return this.storage.set('remember', remember);
        } else {
            return this.storage2.set('remember', remember);
        }

    }

    /**
   * get username from local storage.
   */
    getRemember(): Promise<string> {
        if (this.useSecure) {
            return this.storage.get('remember').then((value) => {
                return value;
            }, (error) => {
                return "";
            });
        } else {
            return this.storage2.get('remember').then((value) => {
                return value;
            });
        }

    }

    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    signup(accountInfo: any) {
        //    let seq = this.api.post('signup', accountInfo).share();
        //
        //    seq.subscribe((res: any) => {
        //      // If the API returned a successful response, mark the user as logged in
        //      if (res.status == 'success') {
        //        this._loggedIn(res);
        //      }
        //    }, err => {
        //      console.error('ERROR', err);
        //    });
        //
        //    return seq;
    }

    /**
     * Log the user out, which forgets the session
     */
    logout() {
        this._user = null;
        this._headers = this._headers.set('Authorization', 'Bearer ');
        this._headers = this._headers.set('X-Auth-Token', '');
        if (this.useSecure) {
            this.storage.remove('token');
            this.storage.set('token', "");
        } else {
            this.storage2.remove('token');
            this.storage2.set('token', "");
        }
    }

    /**
     * Process a login/signup response to store user data
     */
    _loggedIn(resp) {
        this._user = resp.user;
    }
}
