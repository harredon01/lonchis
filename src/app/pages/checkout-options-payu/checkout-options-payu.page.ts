import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, ModalController, AlertController, LoadingController, IonContent} from '@ionic/angular';
import {Item} from '../../models/item';
import {Payment} from '../../models/payment';
import {ParamsService} from '../../services/params/params.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {OrderService} from '../../services/order/order.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserService} from '../../services/user/user.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {CartService} from '../../services/cart/cart.service';
import {BillingService} from '../../services/billing/billing.service';
import {BuyerSelectPage} from '../buyer-select/buyer-select.page';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-checkout-options-payu',
    templateUrl: './checkout-options-payu.page.html',
    styleUrls: ['./checkout-options-payu.page.scss'],
})
export class CheckoutOptionsPayuPage implements OnInit {
    @ViewChild(IonContent) content: IonContent;
    showPayment: boolean;
    showPayers: boolean;
    showSplit: boolean;
    paymentMethod: any;
    merchant: any;
    hasSavedCard: boolean;
    requiresDelivery: boolean;
    currentItems: Item[] = [];
    conditions: any[] = [];
    payment: Payment;
    order: any;
    coupon: any;
    payers: any[] = [];
    // Our translated text strings
    private cartErrorString: string;
    private couponErrorString: string;
    private couponErrorString2: string;
    public totalItems: any;
    public delivery: any;
    public delivery2: any;
    public deliveryRule: any;
    public subtotal: any;
    public total: any;
    split: any;
    recurring: any;

    private prepareOrderErrorString: string;
    private prepareOrderStartingString: string;
    private prepareOrderCreateString: string;
    private cardErrorString: string;
    private banksErrorString: string;
    private couponSuccessString: string;
    private loginErrorString: string;
    private cartUpdate: string;
    private requiresDeliveryString: string;
    private requiresShippingString: string;
    private requiresItemString: string;
    loading: any;

    constructor(public navCtrl: NavController,
        public cartProvider: CartService,
        public orderData: OrderDataService,
        public userData: UserDataService,
        public api: ApiService,
        public user: UserService,
        public orderProvider: OrderService,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public billing: BillingService,
        public params: ParamsService,
        public alertCtrl: AlertController,
        public translateService: TranslateService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.coupon = "";
        this.showPayment = false;
        this.payment= new Payment({});
        this.hasSavedCard = false;
        this.requiresDelivery = false;
        console.log("User");
        console.log(JSON.stringify(this.userData._user));
        this.translateService.get('CHECKOUT_CARD.PAY_CC_ERROR').subscribe((value) => {
            this.cardErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.COUPON_ERROR').subscribe((value) => {
            this.couponErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.COUPON_UNUSABLE').subscribe((value) => {
            this.couponErrorString2 = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.REQUIRES_DELIVERY').subscribe((value) => {
            this.requiresDeliveryString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.REQUIRES_SHIPPING').subscribe((value) => {
            this.requiresShippingString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.REQUIRES_ITEM').subscribe((value) => {
            this.requiresItemString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PAY_IN_BANK_ERROR').subscribe((value) => {
            this.banksErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PREPARE_ORDER_CREATE').subscribe((value) => {
            this.prepareOrderCreateString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PREPARE_ORDER_ERROR').subscribe((value) => {
            this.prepareOrderErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PREPARE_ORDER_STARTING').subscribe((value) => {
            this.prepareOrderStartingString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.COUPON_SUCCESS').subscribe((value) => {
            this.couponSuccessString = value;
        });
        this.translateService.get('USER.GET_USER_ERROR').subscribe((value) => {
            this.loginErrorString = value;
        });
        this.translateService.get('CART.ITEM_UPDATED').subscribe((value) => {
            this.cartUpdate = value;
        })


    }

    scrollToTop() {
        setTimeout(() => {
            this.content.scrollToTop(300);
        }, 400);

    }
    ionViewDidEnter() {
        this.coupon = "";
        this.showPayment = false;
        this.hasSavedCard = false;
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        this.user.getUser().subscribe((resp: any) => {
            if (resp) {
                console.log("getUser", resp);
                this.userData._user = resp.user;
                let savedCards = resp.savedCards;
                for (let key in savedCards) {
                    if (savedCards[key] == "PayU") {
                        this.userData._user.savedCard = true;
                        this.hasSavedCard = true;
                    }
                }
                console.log("getUser", this.userData._user);
            }

        }, (err) => {
            let toast = this.toastCtrl.create({
                message: this.loginErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
        this.deliveryRule = endDate.toISOString();
        console.log("deliveryRule", this.deliveryRule);
        console.log("Has saved card", this.hasSavedCard);
        this.showPayers = false;
        this.showSplit = false;
        this.currentItems = [];
        this.conditions = [];
        this.payers = [];
        let paramsSent = this.params.getParams();
        if(paramsSent){
            if(paramsSent.payment){
                this.payment = paramsSent.payment;
            }
        }
    }


    selectPaymentOption() {
        let option = this.paymentMethod;
        if (option == "QUICK") {
            this.quickPay();
        } else if (option == "IN_BANK") {
            this.payInBank();
        } else {
            this.orderData.paymentMethod = option;
            let nextPage = this.orderData.getStep2(option);
            console.log("Next page", nextPage);
            this.navCtrl.navigateForward(nextPage);
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

    quickPay() {
        this.showLoader();

        let container = {
            quick: true,
            payment_id: this.orderData.payment.id,
            platform: "Booking"
        };
        console.log("before payCreditCard token", container);
        this.billing.payCreditCard(container,"PayU").subscribe((data: any) => {
            let transaction = data.response.transactionResponse;
            this.transactionResponse(transaction, null);
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.cardErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    openSupport() {
        this.params.setParams({
            type: "platform",
            objectId: "booking"
        })
        this.navCtrl.navigateForward('tabs/settings/addresses/');
    }
    payInBank() {
        this.showLoader();
        let payers = [];
        let payersContainer = this.orderData.payers;
        for (let item in payersContainer) {
            payers.push(payersContainer[item].user_id);
        }
        let recurring_type = "limit";
        let recurring_value = 3;
        if (this.orderData.currentOrder.merchant_id == 1300) {
            recurring_type = "calendar";
            recurring_value = null;
        }
        let container = {
            "order_id": this.orderData.currentOrder.id,
            "payers": payers,
            "split_order": this.split,
            "platform": "Booking",
            "recurring": this.recurring,
            "recurring_type": recurring_type,
            "recurring_value": recurring_value,
            "merchant_id": this.orderData.currentOrder.merchant_id,
            "payment_id": this.payment.id
        };
        console.log("before payCreditCard token", container);
        this.billing.payInBank(container).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                console.log("after payInBank");
                this.orderData.clearOrder();
                this.params.setParams({
                    objectId: data.payment.id,
                    newPayment: true
                });
                this.navCtrl.navigateForward('tabs/settings/payments/' + data.payment.id);
            } else {
                // Unable to pay in bank
                let toast = this.toastCtrl.create({
                    message: this.banksErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.cardErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    transactionResponse(transaction, paid) {
        this.dismissLoader();
        console.log("after payCreditCard");
        let total = this.orderData.currentOrder.total;
        this.orderData.clearOrder();
        let vm = this;
        setTimeout(function () {vm.user.postLogin();}, 1000);
        let container = null;
        if (paid) {
            container = {
                transaction: transaction,
                total: total,
                is_paid: true
            };
        } else {
            container = {
                transaction: transaction,
                total: total
            };
        }
        this.params.setParams(container);
        this.navCtrl.navigateForward('tabs/payu/complete');
    }

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.prepareOrderStartingString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.prepareOrderStartingString);
        }
    }
    showLoaderEmpty() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
        }
    }
    showLoader2() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.prepareOrderCreateString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.prepareOrderCreateString);
        }
    }

    ngOnInit() {
    }

}
