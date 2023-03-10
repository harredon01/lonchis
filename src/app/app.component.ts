import {Component} from '@angular/core';
import {Router, RouterEvent, NavigationEnd} from '@angular/router';
import {Platform,  MenuController, NavController, AlertController, ToastController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {OneSignal} from '@ionic-native/onesignal/ngx';
import {TranslateService} from '@ngx-translate/core';
import {StatusBar} from '@ionic-native/status-bar/ngx';
//import { Zoom } from '@ionic-native/zoom';
import {LanguageService} from './services/language/language.service';
import {AlertsService} from './services/alerts/alerts.service';
import {ParamsService} from './services/params/params.service';
import {Events} from './services/events/events.service';
import {UserDataService} from './services/user-data/user-data.service';
import {DynamicRouterService} from './services/dynamic-router/dynamic-router.service';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';
import {Friend} from './models/friend';
import {Notification} from './models/notification';
declare var Mercadopago: any;
declare var window: any;
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    items: any[] = [];
    page = 0;
    last_notif = 0;
    alertsmore = false;
    isFocused = true;
    alertLoaded = false;
    activeLanguage = "es";
    constructor(
        //        private zoomService: Zoom,
        private platform: Platform,
        private splashScreen: SplashScreen,
        private translate: TranslateService,
        private drouter: DynamicRouterService,
        private oneSignal: OneSignal,
        private events: Events,
        private alertsCtrl: AlertController,
        private params: ParamsService,
        private toastCtrl: ToastController,
        private nav: NavController,
        private statusBar: StatusBar,
        private menuCtrl: MenuController,
        private alerts: AlertsService,
        private userData: UserDataService,
        private uniqueDeviceID: UniqueDeviceID,
        private languageService: LanguageService,
        private router: Router
    ) {
        this.initializeApp();
    }
    ngOnInit() {
        this.router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationEnd && event.url === '/login') {
                this.menuCtrl.enable(false);
            }
        });
    }
    askTrackingPermission() {
    if (this.platform.is('cordova') && this.platform.is('ios')) {

      if (window.cordova) {
        console.log('trying to request permission ');
        window.cordova.exec(win, fail, 'idfa', "requestPermission", []);
      }
    }

    function win(res) {
      console.log('success ' + JSON.stringify(res));
    }
    function fail(res) {
      console.log('fail ' + JSON.stringify(res));
    }
  }

readTrackingPermission() {

    if (this.platform.is('cordova') && this.platform.is('ios')) {

      if (window.cordova) {
        window.cordova.exec(win, fail, 'idfa', "getInfo", []);
      }
    }

    function win(res) {
      console.log('success  ' + JSON.stringify(res));
    }
    function fail(res) {
      console.log('fail ' + JSON.stringify(res));
    }
  }
    initTranslate(lang) {

        // Set the default language for translation strings, and the current language.
        console.log("Initializing language with: ", lang);
        this.translate.setDefaultLang(lang);
        const browserLang = this.translate.getBrowserLang();
        console.log("Browser lang", browserLang);
        this.translate.use(lang);

        this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
            //this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
        });
    }
    storeDeviceId() {
        console.log("Getting device id");
        this.uniqueDeviceID.get()
            .then((uuid: any) => {
                console.log("device id", uuid);
                this.userData.setDevice(uuid);
                this.userData.isDevice = true;
                this.handlerNotifications();
            })
            .catch((error: any) => {
                console.log(error);
                this.userData.getDevice().then((value) => {
                    console.log("getDevice");
                    console.log(value);
                    if (value) {
                        if (isNaN(value)) {
                            console.log("getToken2");
                            this.userData.setDevice(value);
                        } else {
                            console.log("getToken3");
                            this.userData.setDevice("token" + value + "");
                        }
                    } else {
                        let dateR = new Date();
                        console.log("random", dateR.getTime());
                        this.userData.setDevice("token" + dateR.getTime());
                    }
                });
            });
    }
    initializeApp() {
        this.platform.ready().then(() => {
            Mercadopago.setPublishableKey('TEST-558ee69b-8de3-4d2f-9466-2fedcb788d6d');
            this.userData.initSecureStorage();
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.languageService.setInitialAppLanguage();
            if (this.platform.is('ios')) {
                this.askTrackingPermission();
                this.readTrackingPermission();
            }
            
            //            this.zoomService.initialize("VNtFB87WSBW0yHl6rxHgTA", "air8HQbEbEEQZL5aZlNRwUMqPED2RH9zMx5B")
            //                .then((success: any) => console.log(success))
            //                .catch((error: any) => console.log(error));
            this.events.subscribe('authenticated', (data:any) => {
                this.page = 0;
                this.items = []
                this.getAlerts();
                // user and time are the same arguments passed in `events.publish(user, time)`
            });
            this.events.subscribe('storageInitialized', (data:any) => {
                console.log("Storage initialized");
                this.storeDeviceId();
                // user and time are the same arguments passed in `events.publish(user, time)`
            });
            this.events.subscribe('notifsOpen', (data:any) => {
                if (this.items.length == 0) {
                    this.page = 0;
                this.items = []
                this.getAlerts();
                }
            });
            this.events.subscribe('cart:orderFinished', (data:any) => {
                let vm = this;
                setTimeout(function () {vm.updateAlerts();}, 3000);
                // user and time are the same arguments passed in `events.publish(user, time)`
            });
            this.events.subscribe('app:updateNotifsWeb', (data:any) => {
                console.log("Update Notifs web triggered");
                this.isFocused = true;
                if (document.URL.startsWith('http')) {
                    this.fetchNotisWeb( data.counter, data.timer);
                }
            });
            this.events.subscribe('app:stopNotifsWeb', (data:any) => {
                this.isFocused = false;
                console.log("Update Notifs web OFF");
            });
            window.addEventListener('focus', (e: any) => {
                this.events.publish('app:updateNotifsWeb', {iterations:8, interval:30000});
            });
            window.addEventListener('blur', (e: any) => {
                this.events.publish('app:stopNotifsWeb',{});
            });
            if (this.userData.storageLoaded && !this.userData.isDevice){
                this.storeDeviceId();
            }
        });
        this.alerts.getLanguage().then((value) => {
            console.log("getLanguage");
            console.log(value);
            if (value) {
                this.initTranslate(value);
            } else {
                this.initTranslate("es");
                this.alerts.setLanguage("es");
            }
        }, (reason) => {
            this.initTranslate("es");
            this.alerts.setLanguage("es");
        });
        this.platform.resume.subscribe(() => {
            this.updateAlerts();
            console.log('****UserdashboardPage RESUMED****');
            if (!document.URL.startsWith('http')) {
                this.oneSignal.clearOneSignalNotifications();
            }
            
            //this.performManualUpdate();
        });
    }
    private handlerNotifications() {
        this.oneSignal.startInit('c418a5d1-0e20-4504-ba3f-7a521949be49', 'food-1535811427713');
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
        this.oneSignal.handleNotificationOpened()
            .subscribe(jsonData => {
                this.events.publish('notification:opened', {notification:jsonData, time:Date.now()});
                console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
                this.sortNotificationType(jsonData, false);
            });
        this.oneSignal.handleNotificationReceived()
            .subscribe(jsonData => {
                let message = jsonData.payload.additionalData;
                console.log("Notification received", message);
                message.language = "es";
                if (message.created_at.date) {
                    message.created_at = message.created_at.date;
                }
                if (message.type == "user_message") {
                    message.id = message.payload.message_id;
                    message.to_id = message.user_id;
                    message.from_id = message.trigger_id;
                    message.target_id = message.user_id;
                    //this.chats.saveMessage(message);
                }
                let notif = new Notification(message);
                this.items.push(notif);
                this.cleanResults();
                console.log('notification received: ', notif);
                this.events.publish('notification:received', {notification: notif, time: Date.now()});
                this.toastCtrl.create({
                    message: notif.subject_es,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());

                console.log('notificationOpenedCallback: ' + JSON.stringify(notif));
            });
        this.oneSignal.endInit();
        this.oneSignal.clearOneSignalNotifications();
    }
    openPage(pageUrl) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.navigateRoot(pageUrl);
    }
    openNotification(notification) {
        let url = this.drouter.openNotification(notification);
        this.nav.navigateForward(url);
    }
    sortNotificationType(data, prompt) {
        console.log("sortnotificationType", data);
        let message = data.payload.additionalData;
        if (message.type == "payment_status"
            || message.type == "split_order_payment") {
            let typePage = '';
            let objectId = message.payload.payment_id;
            typePage = "PaymentDetailPage";
            if (prompt) {
                this.showPrompt("handlePage", typePage, objectId, message.subject_es);
            } else {
                this.handlePage(typePage, objectId);
            }
        }
        if (message.type == "order_status" || message.type == "user_message") {
            this.showSimplePrompt(message.subject_es, message.type);
        }
    }
    showSimplePrompt(messageData, alertType: any) {
        //        let activeView = this.navController.getActive();
        //        console.log("getActive",activeView.id );
        //        if (activeView.id == "ChatRoomPage" && alertType == "user_message") {
        //            return;
        //        }
        //        let title = ""
        //        let message = messageData;
        //        const prompt = this.alertCtrl.create({
        //            title: title,
        //            message: message,
        //            inputs: [],
        //            buttons: [
        //                {
        //                    text: 'OK',
        //                    handler: data => {
        //                    }
        //                }
        //            ]
        //        });
        //        prompt.present();
    }
    handlePage(urlPage, objectId) {
        let parms = {
            objectId: objectId
        };
        this.params.setParams(parms);
        this.nav.navigateForward(urlPage);
    }
    handleResults(results: any, triggerEvent, language) {
        console.log("getLanguage");
        console.log(language);
        if (!language) {
            language = "es";
        }
        let more = false;
        let data = results.data;
        let today = new Date();
        let midnnight = new Date(today.getFullYear() + "/" + (1 + today.getMonth()) + "/" + today.getDate() + " 00:00:00");
        for (let msg in data) {
            data[msg].midnight = midnnight;
            data[msg].language = language;
            let notif = new Notification(data[msg]);
            if (notif.id > this.last_notif) {
                this.last_notif = notif.id;
                console.log("Last notif increased3", this.last_notif);
            }
            if (triggerEvent) {
                this.events.publish('notification:received', {notification: notif, time: Date.now()});
                this.items.unshift(notif);
            } else {
                this.items.push(notif);
            }
        }
        if (results.page < results.last_page) {
            more = true;
        } else {
            more = false;
        }
        this.cleanResults();
        return more;

    }
    cleanResults() {
        this.items.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)
        this.items = this.items.filter(function (a) {
            var key = a.type + '|' + a.trigger_id;
            if (!this[key]) {
                this[key] = true;
                return true;
            }
        }, Object.create(null));
    }
    getAlerts() {
        this.page++;
        let where = "page=" + this.page + "&limit=30&order_by=id,desc";
        this.alerts.getLanguage().then((value) => {
            console.log("getToken");
            console.log(value);
            if (!value) {
                value = "es";
            }
            this.alerts.getAlerts(where).subscribe((results: any) => {
                this.alertLoaded = true;
                this.alertsmore = this.handleResults(results, false, value);
            }, (err) => {

            });
        }, (reason) => {
            let value = "es";
            this.alerts.getAlerts(where).subscribe((results: any) => {
                this.alertLoaded = true;
                this.alertsmore = this.handleResults(results, false, value);
            }, (err) => {

            });
        });
    }
    fetchNotisWeb(counter: any, timer: any) {
        this.updateAlerts().then((value) => {
            counter--;
            if (counter > 0 && this.isFocused) {
                let vm = this;
                setTimeout(function () {vm.fetchNotisWeb(counter, timer);}, timer);
            } else {
                this.isFocused = false;
            }
        }, (err) => {

        });
    }
    updateAlerts() {
        return new Promise((resolve, reject) => {
            console.log("Headers", this.userData._headers);
            this.alerts.getLanguage().then((value) => {
                if (!value) {
                    value = "es";
                }
                let where = "page=1&id>" + this.last_notif + "&limit=30&order_by=id,asc";
                this.alerts.getAlerts(where).subscribe((results: any) => {
                    if (results.total > 0) {
                        let more = this.handleResults(results, true, value);
                    }
                    resolve("Done");
                }, (err) => {
                    reject("updateAlerts error")
                });
            }, (err) => {
                reject("getLanguage error")
            });
        });
    }

    async showPrompt(funcname, alertType, objectId, messageData) {
        let activeUrl = this.router.url;
        console.log("getActive", activeUrl);
        if (activeUrl.includes("chat")) {
            return;
        }
        let title = ""
        let message = messageData;
        const alert = await this.alertsCtrl.create({
            header: title,
            message: message,
            inputs: [],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {
                    }
                }, {
                    text: 'OK',
                    handler: data => {
                        this[funcname](alertType, objectId);
                    }
                }
            ]
        });
        await alert.present();
    }
}
