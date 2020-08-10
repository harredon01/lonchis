import {Component, OnInit} from '@angular/core';
import {BookingService} from '../../services/booking/booking.service';
import {NavController, LoadingController, ModalController, AlertController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {Booking} from '../../models/booking';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '../../services/api/api.service';
import {CartService} from '../../services/cart/cart.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {CartPage} from '../cart/cart.page';
import {ActivatedRoute} from '@angular/router';
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
@Component({
    selector: 'app-booking-detail',
    templateUrl: './booking-detail.page.html',
    styleUrls: ['./booking-detail.page.scss'],
})
export class BookingDetailPage implements OnInit {
    public mainBooking: Booking;
    public isModal: boolean = false;
    public deniedMsg: string = "";
    constructor(public booking: BookingService,
        public activatedRoute: ActivatedRoute,
        public orderData: OrderDataService,
        public alertsCtrl: AlertController,
        public translateService: TranslateService,
        public params: ParamsService,
        public userData: UserDataService,
        public cart: CartService,
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        public api: ApiService,
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog
    ) {
        this.mainBooking = new Booking({total_paid: 0, price: 0, options: {}});

        let vm = this
        this.translateService.get('BOOKING.DENIED_MSG').subscribe(function (value) {
            vm.deniedMsg = value;
        });
    }

    ngOnInit() {

    }   
    
    ionViewDidEnter() {
        let params = this.params.getParams();
        console.log("Params", params);
        if (params) {
            if (params.booking) {
                this.mainBooking = params.booking;
            }
            if (params.modal) {
                this.isModal = true;
            }
            if (params.booking_id) {
                this.getBooking(params.booking_id);
            }
        }
    }
    deleteBooking() {
        this.showLoader();
        this.booking.deleteBookingObject(this.mainBooking.id).subscribe((resp: any) => {
            this.dismissLoader();
            console.log("addBookingObject", resp);
            //this.presentAlertConfirm(data);
            if (resp.status == "success") {
                this.navCtrl.back();
            } else {
                if (resp.message == "Not Available") {

                }
            }
        }, (err) => {
            console.log("Error addBookingObject");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    changeStatusBooking(status) {
        if (status == "approved") {
            this.changeStatusServer(status, "");
        } else {
            this.presentAlertDeny();
        }
    }
    changeStatusServer(status, reason) {
        this.showLoader();
        let container = {"booking_id": this.mainBooking.id, "status": status, "reason": reason};
        this.booking.changeStatusBookingObject(container).subscribe((data: any) => {

            this.dismissLoader();
            this.navCtrl.back();
        }, (err) => {
            console.log("Error cancelBooking");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    buildBookingResult(data: any) {
        if (data.status == "success") {
            let result = data.booking;
            console.log("building booking");
            this.mainBooking = new Booking(result);
        } else if (data.status == "denied") {
            this.navCtrl.navigateBack("tabs/settings/bookings");
        }

    }
    getBooking(booking_id: any) {
        this.showLoader();
        this.booking.getBooking(booking_id).subscribe((data: any) => {
            this.buildBookingResult(data);
            this.dismissLoader();
        }, (err) => {
            console.log("Error cancelBooking");
            this.dismissLoader();
            this.api.handleError(err);
        });
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

    editBooking() {
        let params = {
            "availabilities": null,
            "type": "Merchant",
            "objectId": this.mainBooking.bookable_id,
            "objectName": "",
            "objectDescription": "",
            "objectIcon": "",
            "settings": true,
            "booking": this.mainBooking,
            "expectedPrice": 0
        }
        if (this.mainBooking.bookable) {
            params = {
                "availabilities": null,
                "type": "Merchant",
                "objectId": this.mainBooking.bookable.id,
                "objectName": this.mainBooking.bookable.name,
                "objectDescription": this.mainBooking.bookable.description,
                "objectIcon": this.mainBooking.bookable.icon,
                "settings": true,
                "booking": this.mainBooking,
                "expectedPrice": this.mainBooking.bookable.unit_cost
            }
        }
        console.log(params);
        this.params.setParams(params);
        this.navCtrl.navigateForward('tabs/settings/bookings/' + this.mainBooking.id + "/edit");
    }

    addToCart() {
        let booking = this.mainBooking;
        if (this.orderData.cartData.items) {
            let items = this.orderData.cartData.items;
            for (let i in items) {
                let cont = items[i].attributes;
                if (cont.type == "Booking") {
                    if (cont.id == booking.id) {
                        this.openCart();
                        return;
                    }
                }
            }
        }
        this.addToCartServer();
    }
    addToCartServer() {
        let extras = {
            "type": "Booking",
            "id": this.mainBooking.id,
            "name": "Booking appointment for: " + this.mainBooking.bookable.name,
        }
        let item = {
            "name": "Booking appointment for: " + this.mainBooking.bookable.name,
            "price": this.mainBooking.price,
            "quantity": this.mainBooking.quantity,
            "tax": 0,
            "merchant_id": this.mainBooking.bookable.id,
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
    async presentAlertDeny() {
        let button = {
            text: 'Ok',
            handler: (data) => {
                console.log('Confirm Okay', data);
                if (data == "no-spec") {
                    this.changeStatusServer("denied", "No es mi especialidad");
                } else {
                    this.changeStatusServer("denied", "No estoy disponible");
                }
            }
        }
        const alert = await this.alertsCtrl.create({
            message: this.deniedMsg,
            inputs: [
                {
                    name: 'radio1',
                    type: 'radio',
                    label: 'No es mi especialidad',
                    value: 'no-spec'
                },
                {
                    name: 'radio2',
                    type: 'radio',
                    label: 'No estoy disponible',
                    value: 'no-disp'
                }
            ],
            buttons: [
                button
            ]
        });
        await alert.present();
    }
    payBooking() {
        this.booking.checkExistingBooking(this.mainBooking.id).subscribe((data: any) => {
            if (data.status == "success") {
                this.addToCart();
            } else {
                this.showAlertTranslation("BOOKING." + data.message);
            }
        }, (err) => {
            console.log("Error cancelBooking");
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
        console.log("Cart closing", data);
        if (data == "Prepare") {
            this.params.setParams({"merchant_id": 1});
            this.navCtrl.navigateForward('tabs/home/checkout/prepare');
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
    done() {
        this.modalCtrl.dismiss("Close");
    }

}
