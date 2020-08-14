import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ActivatedRoute} from '@angular/router';
import {BillingService} from '../../services/billing/billing.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {OrderService} from '../../services/order/order.service';
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {Payment} from '../../models/payment';
import {Order} from '../../models/order';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-payment-detail',
    templateUrl: './payment-detail.page.html',
    styleUrls: ['./payment-detail.page.scss'],
})
export class PaymentDetailPage implements OnInit {

    item: Payment;
    private paymentsErrorString: string;
    private paymentsErrorPayString: string;
    private paymentsGetStartString: string;
    private paymentsErrorChangeString: string;
    private paymentsChangeStartString: string;
    hasSavedCard: boolean;
    backButton: boolean;
    recurring: boolean;
    newPayment: boolean;
    loading: any;

    constructor(public navCtrl: NavController,
        public orderData: OrderDataService,
        public userData: UserDataService,
        public params: ParamsService,
        public api: ApiService,
        public orderProvider: OrderService,
        private activatedRoute: ActivatedRoute,
        public toastCtrl: ToastController,
        private spinnerDialog: SpinnerDialog,
        public loadingCtrl: LoadingController,
        public modalCtrl: ModalController,
        public translateService: TranslateService,
        public billing: BillingService) {
        this.backButton = true;
        let order = new Order({"items": []});
        this.item = new Payment({
            "status": "",
            "id": "",
            "total": 0,
            "referenceCode": "",
            "transactionId": "",
            "order_id": "",
            "attributes": "",
            "order": order
        });
        this.translateService.get('PAYMENTS.ERROR_GET').subscribe(function (value) {
            this.paymentsErrorString = value;
        });
        this.translateService.get('PAYMENTS.ERROR_PAY').subscribe(function (value) {
            this.paymentsErrorPayString = value;
        });
        this.translateService.get('PAYMENTS.ERROR_CHANGE').subscribe(function (value) {
            this.paymentsErrorChangeString = value;
        });
        this.translateService.get('PAYMENTS.GET_START').subscribe(function (value) {
            this.paymentsGetStartString = value;
        });
        this.translateService.get('PAYMENTS.CHANGE_START').subscribe(function (value) {
            this.paymentsChangeStartString = value;
        });
        console.log("backButton", this.backButton);
        let paramSent = this.params.getParams();
        console.log("newPayment", paramSent.newPayment);
        if (paramSent.newPayment) {
            this.backButton = false;
        }
        this.hasSavedCard = false;
        this.newPayment = false;
        this.recurring = false;
        if (this.userData._user) {
            if (this.userData._user.savedCard) {
                this.hasSavedCard = true;
            }
        }
        this.loadPayment();

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
    loadPayment() {
        let paramSent = this.params.getParams();
        var result = paramSent.item;
        if (result) {
            this.item = result;
            if (this.item.order.recurring) {
                this.recurring = true;
            }

        } else {
            let paymentId = this.activatedRoute.snapshot.paramMap.get('objectId');
            if (paymentId) {
                if (paramSent.newPayment) {
                    this.newPayment = paramSent.newPayment;
                }
                this.showLoader();
                let query = "id=" + paymentId + "&includes=order.items,order.orderConditions";
                this.billing.getPayments(query).subscribe((data: any) => {
                    this.dismissLoader();
                    console.log("after get Deliveries");
                    let results = data.data;
                    for (let one in results) {
                        this.item = new Payment(results[one]);
                    }
                    if (this.item.order.recurring) {
                        this.recurring = true;
                    }
                    console.log(JSON.stringify(data));
                }, (err) => {
                    this.dismissLoader();
                    // Unable to log in
                    let toast = this.toastCtrl.create({
                        message: this.paymentsErrorString,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present());
                    this.api.handleError(err);
                });
            }

        }

    }
    setOrderRecurringType() {
        let recurring_type = "limit";
        let recurring_value = 3;
        if (this.item.order.merchant_id != 1299) {
            recurring_type = "calendar";
            recurring_value = 1;
        }
        let container = {
            recurring: this.recurring,
            recurring_type: recurring_type,
            recurring_value: recurring_value
        }
        this.showLoader2()
        this.orderProvider.setOrderRecurringType(this.item.order.id, container).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after setOrderRecurringType");
            let result = data.order;
            this.item.order = <Order> result;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.paymentsErrorChangeString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    addTransactionCosts(paymentId) {
        this.showLoader2()
        this.billing.addTransactionCosts(paymentId).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                console.log("after addTransactionCosts");
                this.item = new Payment(data.payment);
            } else {
                let toast = this.toastCtrl.create({
                    message: this.paymentsErrorChangeString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.paymentsErrorChangeString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    retryPaymentRedirect() {
        let container = {"payment": this.item};
        this.params.setParams(container);
        this.navCtrl.navigateForward("tabs/settings/payments/"+this.item.id+"/payu/options");
    }
    retryPayment(item: Payment) {
        this.showLoader();
        this.billing.retryPayment(item.id).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                this.orderData.payment = data.payment;
                this.retryPaymentRedirect();
                console.log(JSON.stringify(data));
            }
            else {
                this.dismissLoader();
                // Unable to log in
                var toast = this.toastCtrl.create({
                    message: this.paymentsErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            var toast = this.toastCtrl.create({
                message: this.paymentsErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    };
    /**
     * Navigate to the detail page for this item.
     */
    transactionResponse(transaction) {
        this.dismissLoader();
        console.log("after payCreditCard");
        this.orderData.clearOrder();
        this.params.setParams({
            transaction: transaction
        });
        this.navCtrl.navigateForward('tabs/payu/complete');
    }
    quickPay() {
        this.showLoader();

        let container = {
            quick: true,
            payment_id: this.orderData.payment.id,
            platform: "Food"
        };
        console.log("before payCreditCard token", container);
        this.billing.payCreditCard(container, "PayU").subscribe((data: any) => {
            let transaction = data.response.transactionResponse;
            this.transactionResponse(transaction);
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.paymentsErrorPayString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    };
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.paymentsGetStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.paymentsGetStartString);
        }
    };
    payInBank() {
        this.showLoader();
        let container = {
            "payment_id": this.orderData.payment.id
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
                // Unable to log in
                let toast = this.toastCtrl.create({
                    message: this.paymentsErrorPayString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.paymentsErrorPayString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    showLoader2() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.paymentsChangeStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.paymentsChangeStartString);
        }
    };
    /**
       * The view loaded, let's query our items for the list
       */
    returnHome() {
        this.navCtrl.navigateRoot('tabs');
    }

    ngOnInit() {
    }

}
