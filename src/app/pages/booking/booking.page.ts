import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, LoadingController, AlertController, ModalController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ParamsService} from '../../services/params/params.service';
import {CartService} from '../../services/cart/cart.service';
import {ApiService} from '../../services/api/api.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserDataService} from '../../services/user-data/user-data.service'
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
import {Booking} from '../../models/booking';
import {CartPage} from '../cart/cart.page';
import {BookingService} from '../../services/booking/booking.service';
@Component({
    selector: 'app-booking',
    templateUrl: './booking.page.html',
    styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
    availableDays: any[] = [];
    availableDates: any[] = [];
    selectedSpots: any[] = [];
    availabilities: any[] = [];
    months: any[] = [];
    newVisit: boolean = true;
    dateSelected: boolean = false;
    virtualMeeting: string = 'physical';
    timeSelected: boolean = false;
    availabilitiesDate: any[] = [];
    weekday: any[] = [];
    weekday2: any[] = [];
    typeObj: string;
    bookingObj: Booking = null;
    notAvailable: string;
    maxReached: string;
    requiresAuth: string;
    dayName: string;
    success: string;
    atributesCont: any;
    objectId: string;
    objectName: string;
    objectDescription: string;
    objectIcon: string;
    startDate: Date;
    endDate: Date;
    startDateS: any;
    expectedPrice: any;
    activeBooking: any;
    amount: any = "1";
    submitted: boolean = false;

    constructor(public params: ParamsService, public booking: BookingService,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public navCtrl: NavController,
        public api: ApiService,
        private drouter: DynamicRouterService,
        public orderData: OrderDataService,
        public modalCtrl: ModalController,
        public cart: CartService,
        public userData: UserDataService,
        public alertsCtrl: AlertController,
        public translateService: TranslateService,
        private spinnerDialog: SpinnerDialog) {
        this.atributesCont = {};
        this.weekday = new Array(7);
        this.weekday[0] = "sunday";
        this.weekday[1] = "monday";
        this.weekday[2] = "tuesday";
        this.weekday[3] = "wednesday";
        this.weekday[4] = "thursday";
        this.weekday[5] = "friday";
        this.weekday[6] = "saturday";
        this.weekday2 = new Array(7);
        this.weekday2[0] = "Domingo";
        this.weekday2[1] = "Lunes";
        this.weekday2[2] = "Martes";
        this.weekday2[3] = "Miercoles";
        this.weekday2[4] = "Jueves";
        this.weekday2[5] = "Viernes";
        this.weekday2[6] = "Sabado";

        let vm = this
        this.translateService.get('BOOKING.REQUIRES_AUTH').subscribe(function (value) {
            vm.requiresAuth = value;
        });
        this.translateService.get('BOOKING.NOT_AVAILABLE').subscribe(function (value) {
            vm.notAvailable = value;
        });
        this.translateService.get('BOOKING.MAX_REACHED').subscribe(function (value) {
            vm.maxReached = value;
        });
        this.translateService.get('BOOKING.SUCCESS').subscribe(function (value) {
            vm.success = value;
        });

        console.log("Get availableDates", this.availableDates);
    }

    ngOnInit() {
        this.loadData();
    }
    onError() {
        console.log("IMG ERROR");
        this.objectIcon = "/assets/avatar/Bentley.png";
    }
    loadData() {
        let paramsArrived = this.params.getParams();
        this.typeObj = paramsArrived.type;
        this.objectId = paramsArrived.objectId;
        this.objectName = paramsArrived.objectName;
        this.objectDescription = paramsArrived.objectDescription;
        this.objectIcon = paramsArrived.objectIcon;
        if (paramsArrived.expectedPrice) {
            this.expectedPrice = paramsArrived.expectedPrice;
        }
        if (paramsArrived.booking) {
            this.bookingObj = paramsArrived.booking;
            this.dateSelected = true;
            this.timeSelected = true;
            this.selectDate(this.bookingObj.starts_at);
            this.expectedPrice = this.bookingObj.price;
            this.atributesCont = this.bookingObj.options;
            console.log("Date", this.bookingObj.starts_at.toISOString());
            this.startDateS = this.bookingObj.starts_at.toISOString();
            this.selectStart();
        }
        if (paramsArrived.availabilities) {
            this.dateSelected = false;
            this.availabilities = paramsArrived.availabilities;
            console.log("Availabilities", this.availabilities);
            this.getAvailableDates(this.availabilities);
            this.getDates();
            console.log("Get availableDays", this.availableDays);
        } else {
            this.getItems();
        }
        console.log("Get availableDays", this.dateSelected);
    }
    setOrder(item) {
        if (item.range == 'sunday') {
            item.order = 0;
        }
        if (item.range == 'monday') {
            item.order = 1;
        }
        if (item.range == 'tuesday') {
            item.order = 2;
        }
        if (item.range == 'wednesday') {
            item.order = 3;
        }
        if (item.range == 'thursday') {
            item.order = 4;
        }
        if (item.range == 'friday') {
            item.order = 5;
        }
        if (item.range == 'saturday') {
            item.order = 6;
        }
        return item;
    }

    getItems() {
        let availabilities: any[] = [];
        //        this.showLoader();
        let where = {"type": "Merchant", "object_id": this.objectId};
        this.booking.getAvailabilitiesObject(where).subscribe((data: any) => {
            //            this.dismissLoader();
            console.log("after getItems", data);
            let results = data.data;
            for (let one in results) {
                results[one] = this.setOrder(results[one]);
                availabilities.push(results[one]);
            }
            availabilities.sort((a, b) => (a.order > b.order) ? 1 : -1);
            this.availabilities = availabilities;
            console.log("Availabilities", this.availabilities);
            this.getAvailableDates(this.availabilities);
            this.getDates();
            console.log("in get items", this.bookingObj);
            if (this.bookingObj) {
                this.selectDate(this.bookingObj.starts_at);
            }
            console.log("Get availableDays", this.availableDays);
            console.log(JSON.stringify(data));
        }, (err) => {
            //            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: "ERROR",
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    goBack() {
        console.log("goBack", this.dateSelected)
        if (this.dateSelected) {
            this.dateSelected = false;
        } else {
            this.navCtrl.back();
        }

    }
    addBookingToCart(booking: any) {
        if (this.orderData.cartData.items) {
            let items = this.orderData.cartData.items;
            for (let i in items) {
                let attrs = items[i].attributes;
                if (attrs.type == "Booking") {
                    if (attrs.id == booking.id) {
                        this.openCart();
                        return;
                    }
                }
            }
        }
        if (this.newVisit) {
            this.newVisit = false;
            if (this.orderData.cartData.items) {
                this.cart.clearCart().subscribe((data: any) => {
                    this.addBookingToCartServer(booking);
                }, (err) => {
                    console.log("Error addCustomCartItem");
                    this.api.handleError(err);
                });
            }
        } else {
            this.addBookingToCartServer(booking);
        }
    }
    addBookingToCartServer(booking: any) {
        let extras = {
            "type": "Booking",
            "id": booking.id,
            "name": "Booking appointment for: " + booking.bookable.name,
        }
        let item = {
            "name": "Booking appointment for: " + booking.bookable.name,
            "price": booking.price,
            "quantity": booking.quantity,
            "tax": 0,
            "merchant_id": this.objectId,
            "cost": 0,
            "extras": extras
        };
        this.cart.addCustomCartItem(item).subscribe((data: any) => {
            this.orderData.cartData = data.cart;
            this.openCart();
        }, (err) => {
            console.log("Error addCustomCartItem");
            this.api.handleError(err);
        });
    }
    selectRadio(event) {
        this.virtualMeeting = event.detail.value;
        console.log("Virtual meeting radio ", event);
        console.log("Virtual meeting radio ", this.virtualMeeting);
    }
    createBooking() {
        if (this.submitted) {
            return true;
        }
        this.submitted = true;
        this.showLoader();
        //        console.log("toLocaleString", this.startDate.toLocaleString());
        //        console.log("toString ", this.startDate.toString());
        //        console.log("toTimeString ", this.startDate.toTimeString());
        //        console.log("toLocaleDateString ", this.startDate.toLocaleDateString());
        //        console.log("toLocaleTimeString ", this.startDate.toLocaleTimeString());
        //        console.log("offset", this.startDate.getTimezoneOffset() * 60000);
        let startDate = new Date(this.startDate.getTime() - this.startDate.getTimezoneOffset() * 60000);
        //        console.log("start date",startDate);
        let strDate = startDate.toISOString();
        //        console.log("start date2",startDate.toISOString());
        let endDate = new Date(startDate.getTime() + parseInt(this.amount) * 3000 * 1000 /*4 hrs in ms*/);
        let ndDate = endDate.toISOString();
        let virtual = false;
        console.log("Virtual meeting", this.virtualMeeting);
        if (this.virtualMeeting == 'virtual') {
            virtual = true;
            this.atributesCont.virtual_provider = "zoom";
            this.atributesCont.virtual_meeting = true;
        }
        let data = {
            "type": this.typeObj,
            "object_id": this.objectId,
            "from": strDate,
            "to": ndDate,
            "attributes": this.atributesCont,
            "virtual_meeting": virtual
        };
        console.log("Start", this.startDate);
        console.log("data", data);
        this.booking.addBookingObject(data).subscribe((resp: any) => {
            this.dismissLoader();
            console.log("addBookingObject", resp);
            this.submitted = false;
            //this.presentAlertConfirm(data);
            if (resp.status == "success") {
                if (resp.requires_auth) {
                    this.presentAlertConfirm(this.requiresAuth);
                } else {
                    this.addBookingToCart(resp.booking);
                }
            } else {
                this.showAlertTranslation("BOOKING." + resp.message);
            }
        }, (err) => {
            this.submitted = false;
            console.log("Error addBookingObject");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    saveOrCreateBooking() {
        if (this.bookingObj) {
            this.editBooking()
        } else {
            this.createBooking();
        }
    }
    editBooking() {
        //        if (this.submitted) {
        //            return true;
        //        }
        //        this.submitted = true; 
        this.showLoader();
        console.log("offset", this.startDate.getTimezoneOffset() * 60000);
        let startDate = new Date(this.startDate.getTime() - this.startDate.getTimezoneOffset() * 60000);
        let strDate = startDate.toISOString();
        let endDate = new Date(startDate.getTime() + parseInt(this.amount) * 3000 * 1000 /*4 hrs in ms*/);
        let ndDate = endDate.toISOString();
        this.atributesCont.location = "zoom";
        let data = {
            "booking_id": this.bookingObj.id,
            "type": this.typeObj,
            "object_id": this.objectId,
            "from": strDate,
            "to": ndDate,
            "attributes": this.atributesCont
        };
        console.log("Start", this.startDate);
        console.log("data", data);
        this.booking.editBookingObject(data).subscribe((resp: any) => {
            this.dismissLoader();
            console.log("editBookingObject", resp);
            this.submitted = false;
            //this.presentAlertConfirm(data);
            if (resp.status == "success") {
                let container = this.params.getParams();
                container.booking = new Booking(resp.booking);
                this.params.setParams(container);
                this.navCtrl.back();
            } else {
                this.showAlertTranslation("BOOKING." + resp.message);
            }
        }, (err) => {
            console.log("Error editBookingObject");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }

    async openCart() {
        let container = {cart: this.orderData.cartData};
        console.log("Opening Cart", container);
        let addModal = await this.modalCtrl.create({
            component: CartPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data == "Shipping") {
            this.params.setParams({"merchant_id": this.objectId});
            this.navCtrl.navigateForward('tabs/home/checkout/shipping/' + this.objectId);
        } else if (data == "Prepare") {
            this.params.setParams({"merchant_id": this.objectId});
            this.navCtrl.navigateForward('tabs/home/checkout/prepare');
        }
    }
    showAlertTranslation(alert) {
        this.translateService.get(alert).subscribe(
            value => {
                this.presentAlertConfirm(value);
            }
        )
    }

    async presentAlertConfirm(message) {
        console.log("Present alert", message);
        let button = {
            text: 'Ok',
            handler: () => {
                console.log('Confirm Okay');
                if (message == this.requiresAuth) {
                    this.navCtrl.back();
                }
            }
        }
        const alert = await this.alertsCtrl.create({
            message: message,
            buttons: [
                button
            ]
        });
        await alert.present();
    }

    getAvailableDates(availabilities: any) {
        for (let item in availabilities) {
            let container = availabilities[item];
            if (!this.checkAvailableDays(container.range)) {
                this.availableDays.push(container.range);
            }
        }
    }

    checkAvailableDays(day: string) {
        for (let item in this.availableDays) {
            if (this.availableDays[item] == day) {
                return true;
            }
        }
        return false;
    }

    getDates() {
        console.log("Get dates");
        var myDate = new Date();
        let month = myDate.getMonth();
        let monthcont = {month: month, days: [], title: this.booking.getMonthName(month)};
        for (let i = 0; i < 61; i++) {
            let day = myDate.getDay();
            let container = {date: new Date(myDate.getTime()), status: "closed"};
            if (this.checkAvailableDays(this.weekday[day])) {
                container.status = "active"
            }

            if (myDate.getMonth() != monthcont.month) {
                this.months.push(monthcont);
                let month = myDate.getMonth();
                monthcont = {month: month, days: [], title: this.booking.getMonthName(month)};
            }
            monthcont.days.push(container);
            this.availableDates.push(container);
            myDate.setDate(myDate.getDate() + 1);
        }
        console.log("Get dates months", this.months);
    }
    returnDates() {
        this.dateSelected = false;
    }
    selectStart() {
        this.startDate = new Date(this.startDateS);
        this.endDate = new Date(this.startDate.getTime() + (parseInt(this.amount) * 50) * 60000);;
        this.timeSelected = true;
    }

    selectDate(item: any) {
        if (item.status == 'active') {
            let selectedDate = item.date;
            console.log("select date", selectedDate);
            this.showLoader();
            this.dayName = this.weekday2[selectedDate.getDay()];
            this.startDate = selectedDate;
            this.startDateS = selectedDate.toISOString();
            this.selectStart();
            this.dateSelected = true;
            let strDate = selectedDate.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate();
            let params = {
                "from": strDate,
                "query": "day",
                "type": this.typeObj,
                "object_id": this.objectId,
            };
            this.booking.getBookingsObject(params).subscribe((data: any) => {
                console.log("getBookingsObject", data);
                this.selectedSpots = data.data;
                this.dismissLoader();
            }, (err) => {
                console.log("Error getBookingsObject");
                this.api.handleError(err);
            });
            let day = selectedDate.getDay();
            this.availabilitiesDate = [];
            for (let item in this.availabilities) {
                if (this.availabilities[item].range == this.weekday[day]) {
                    this.availabilitiesDate.push((this.availabilities[item]));
                }
            }
            console.log("Availabilities", this.availabilitiesDate);
        } else {
            let toast = this.toastCtrl.create({
                message: this.notAvailable,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        }

    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
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
    changeDate() {
        this.dateSelected = false;
        this.timeSelected = false;
    }
}
