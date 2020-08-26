import {Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import {IonList} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {BookingService} from '../../services/booking/booking.service';
import {NavController, LoadingController, AlertController, ToastController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {Booking} from '../../models/booking';
import {ApiService} from '../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {ParamsService} from '../../services/params/params.service';
import {CartService} from '../../services/cart/cart.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
@Component({
    selector: 'app-booking-list',
    templateUrl: './booking-list.page.html',
    styleUrls: ['./booking-list.page.scss'],
})
export class BookingListPage implements OnInit {
    @ViewChild(IonList, {read: ElementRef}) list: ElementRef;
    public bookings: Booking[] = [];
    public loadMore: boolean = false;
    public loadingAll: boolean = false;
    public viewFilters: boolean = false;
    public bookingObjects: any[] = [];
    public objectId: any;
    public indexList: any = 1;
    public selectedObject: any;
    public typeObj: any;
    public page: any = 0;
    public updateError: string = "";
    public query: string = "";
    public queryMod: string = "";
    public target: string = "";
    public urlSearch: string = "";
    public queries: any[] = [];
    scrollTo = null;
    constructor(public booking: BookingService,
        public activatedRoute: ActivatedRoute,
        public params: ParamsService,
        public api: ApiService,
        public alertsCtrl: AlertController,
        public orderData: OrderDataService,
        public toastCtrl: ToastController,
        public cart: CartService,
        public translateService: TranslateService,
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog
    ) {
        let paramsObj: any = this.params.getParams();
        this.typeObj = paramsObj.type;
        this.target = paramsObj.target;
        this.objectId = paramsObj.objectId;
        this.urlSearch = "tabs/settings/merchants/" + paramsObj.objectId;
        this.selectedObject = {"id": paramsObj.objectId, "name": paramsObj.name};
        this.bookingObjects.push(this.selectedObject);
        this.query = this.target + "_all";
        this.queries = [];
        let vm = this;
        this.translateService.get('BOOKING.UNPAID').subscribe(function (value) {
            let container = {"name": value, "value": "unpaid"};
            vm.queries.push(container);
        });
        this.translateService.get('BOOKING.UPCOMING').subscribe(function (value) {
            let container = {"name": value, "value": "upcoming"};
            vm.queries.push(container);
        });
        this.translateService.get('BOOKING.UNAPPROVED').subscribe(function (value) {
            let container = {"name": value, "value": "unapproved"};
            vm.queries.push(container);
        });
        this.translateService.get('BOOKING.PAST').subscribe(function (value) {
            let container = {"name": value, "value": "past"};
            vm.queries.push(container);
        });
        this.translateService.get('BOOKING.ALL').subscribe(function (value) {
            let container = {"name": value, "value": "all"};
            vm.queries.push(container);
        });
        this.translateService.get('BOOKING.UPDATE_ERROR').subscribe(function (value) {
            vm.updateError = value;
        });
        this.queryMod = "all";
    }

    scrollListVisible(index) {
        console.log("Index", index);
        let arr = this.list.nativeElement.children;
        let item = arr[index - 1];
        if (item) {
            item.scrollIntoView({behavior: "smooth", block: "center"});
        }
    }
    scrollToday() {
        let today = new Date();
        let smallestDifference = 99999999;
        let scrollIndex = 1;
        for (let item in this.bookings) {
            let bookDate = new Date(this.bookings[item].starts_at);
            let difference = Math.abs(bookDate.getTime() - today.getTime());
            if (difference < smallestDifference) {
                smallestDifference = difference;
                scrollIndex = this.bookings[item].position;
            }
        }
        this.scrollListVisible(scrollIndex);
    }

    toggleFilters() {
        if (this.viewFilters) {
            this.viewFilters = false;
        } else {
            this.viewFilters = true;
        }
    }

    ngOnInit() {
        this.getObjectsWithBookingUser();
    }

    selectQuery() {
        this.page = 0;
        this.bookings = [];
        this.query = this.target + "_" + this.queryMod;
        this.getBookings();
    }

    selectObject() {
        console.log("Selecting Object");
        this.page = 0;
        this.bookings = [];
        if (this.objectId == -1) {
            this.target = "customer";
        } else {
            this.target = "bookable";
        }
        this.query = this.target + "_" + this.queryMod;
        this.getBookings();
        this.selectObj();
    }

    getBookings() {
        this.showLoader();
        this.page++;
        let selectedDate = new Date();
        let strDate = selectedDate.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate();
        let container = {
            "query": this.query,
            "type": this.typeObj,
            "object_id": this.objectId,
            "from": strDate,
            "page": this.page
        };
        this.booking.getBookingsObject(container).subscribe((data: any) => {
            console.log("Get bookings result", data);
            let results = data.data;
            if (data.page == data.last_page) {
                this.loadMore = false;
            } else {
                this.loadMore = true;
            }
            for (let item in results) {
                results[item].position = this.indexList;
                this.indexList++;
                //results[item].options = results[item].options;
                let newBooking = new Booking(results[item]);
                this.bookings.push(newBooking);
            }
            if (this.queryMod == "all") {
                this.loadingAll = true;
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error getBookings");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    ionViewDidEnter() {
        this.bookings = [];
        this.getBookings();
        if (this.loadingAll) {
            this.scrollToday();
            let vm = this;
            setTimeout(function () {vm.scrollToday();}, 800);
        }
    }
    showAlertTranslation(alert, booking) {
        this.translateService.get(alert).subscribe(
            value => {
                this.presentAlertConfirm(value, booking);
            }
        )
    }

    async presentAlertConfirm(message, booking) {
        console.log("Present alert", message);
        let button = {
            text: 'Ok',
            handler: () => {
                console.log('Confirm Okay');
                this.editBooking(booking);
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
    getObjectsWithBookingUser() {
        this.booking.getObjectsWithBookingUser().subscribe((data: any) => {
            this.bookingObjects = data.data;
            let user = {"id": -1, "name": "Personal"};
            this.bookingObjects.unshift(user);
            this.selectObj();
        }, (err) => {
            console.log("Error getBookings");
            this.api.handleError(err);
        });
    }
    openBooking(booking: Booking) {
        console.log("Open booking", booking);
        let param = {"booking": booking};
        this.params.setParams(param);
        this.navCtrl.navigateForward('tabs/settings/bookings/' + booking.id);
    }
    selectObj() {
        for (let item in this.bookingObjects) {
            if (this.bookingObjects[item].id == this.objectId) {
                this.selectedObject = this.bookingObjects[item];
                //this.objectId = this.bookingObjects[item].id;
                break;
            }
        }
    }

    changeStatusBooking(item, status) {
        this.showLoader();
        let container = {"booking_id": item.id, "status": status};
        this.booking.changeStatusBookingObject(container).subscribe((data: any) => {
            if (data.status == 'success') {
                item = new Booking(data.booking);
            } else {
                this.toastCtrl.create({
                    message: this.updateError,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

            this.dismissLoader();
        }, (err) => {
            console.log("Error cancelBooking");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    addToCartServer(booking: any) {
        this.cart.clearCart().subscribe((data: any) => {
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
                "merchant_id": booking.bookable.id,
                "cost": 0,
                "extras": extras
            };
            this.cart.addCustomCartItem(item).subscribe((data: any) => {
                this.orderData.cartData = data.cart;
                this.params.setParams({"merchant_id": booking.bookable.id});
                this.navCtrl.navigateForward('tabs/home/checkout/prepare');
            }, (err) => {
                console.log("Error addCustomCartItem");
                this.api.handleError(err);
            });
        }, (err) => {
            console.log("Error addCustomCartItem");
            this.api.handleError(err);
        });
    }
    editBooking(booking: any) {
        let params = {
            "availabilities": null,
            "type": "Merchant",
            "objectId": booking.bookable_id,
            "objectName": "",
            "objectDescription": "",
            "objectIcon": "",
            "settings": true,
            "booking": booking,
            "expectedPrice": booking.price
        }
        if (booking.bookable) {
            params = {
                "availabilities": null,
                "type": "Merchant",
                "objectId": booking.bookable.id,
                "objectName": booking.bookable.name,
                "objectDescription": booking.bookable.description,
                "objectIcon": booking.bookable.icon,
                "settings": true,
                "booking": booking,
                "expectedPrice": booking.bookable.unit_cost
            }
        }
        console.log(params);
        this.params.setParams(params);
        this.navCtrl.navigateForward('tabs/settings/bookings/' + booking.id + "/edit");
    }

    addToCart(booking: any) {
        console.log("addToCart", this.orderData.cartData.items);
        if (this.orderData.cartData.items) {
            let items = this.orderData.cartData.items;
            for (let i in items) {
                let container = items[i].attributes;
                if (container.type == "Booking") {
                    if (container.id == booking.id) {
                        this.params.setParams({"merchant_id": booking.bookable_id});
                        this.navCtrl.navigateForward('tabs/home/checkout/prepare');
                        return;
                    }
                }
            }
        }
        this.addToCartServer(booking);
    }
    payBooking(booking: any) {
        this.booking.checkExistingBooking(booking.id).subscribe((data: any) => {
            if (data.status == "success") {
                this.addToCart(booking);
            } else {
                this.showAlertTranslation("BOOKING." + data.message, booking);
            }
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
    doInfinite(infiniteScroll) {
        console.log('Begin async operation');
        if (this.loadMore) {
            this.loadMore = false;
            setTimeout(() => {
                this.getBookings();
                console.log('Async operation has ended');
                infiniteScroll.target.complete();
            }, 500);
        } else {
            infiniteScroll.target.complete();
        }
    }

}
