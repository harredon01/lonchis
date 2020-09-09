import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
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
    hasSavedCard: boolean;
    backButton: boolean;
    recurring: boolean;
    newPayment: boolean;

    constructor(public navCtrl: NavController,
        public orderData: OrderDataService,
        public userData: UserDataService,
        public params: ParamsService,
        public api: ApiService,
        public orderProvider: OrderService,
        private activatedRoute: ActivatedRoute,
        public modalCtrl: ModalController,
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
    }
    ionViewDidEnter() {
        this.loadPayment();
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
                this.api.loader('PAYMENTS.GET_START');
                let query = "id=" + paymentId + "&includes=order.items,order.orderConditions";
                this.billing.getPayments(query).subscribe((data: any) => {
                    this.api.dismissLoader();
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
                    this.api.dismissLoader();
                    // Unable to log in
                    this.api.toast('PAYMENTS.ERROR_GET');
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
        this.api.loader('PAYMENTS.CHANGE_START');
        this.orderProvider.setOrderRecurringType(this.item.order.id, container).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after setOrderRecurringType");
            let result = data.order;
            this.item.order = <Order> result;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('PAYMENTS.ERROR_CHANGE');
            this.api.handleError(err);
        });
    }
    addTransactionCosts(paymentId) {
        this.api.loader('PAYMENTS.CHANGE_START');
        this.billing.addTransactionCosts(paymentId).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {
                console.log("after addTransactionCosts");
                this.item = new Payment(data.payment);
            } else {
                this.api.toast('PAYMENTS.ERROR_CHANGE');
            }

            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('PAYMENTS.ERROR_CHANGE');
            this.api.handleError(err);
        });
    }
    retryPaymentRedirect() {
        let container = {"payment": this.item};
        this.params.setParams(container);
        this.navCtrl.navigateForward("shop/settings/payments/"+this.item.id+"/payu/options");
    }
    retryPayment(item: Payment) {
        this.api.loader('PAYMENTS.GET_START');
        this.billing.retryPayment(item.id).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {
                this.orderData.payment = data.payment;
                this.retryPaymentRedirect();
                console.log(JSON.stringify(data));
            }
            else {
                this.api.dismissLoader();
                // Unable to log in
                this.api.toast('PAYMENTS.ERROR_GET');
            }
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('PAYMENTS.ERROR_GET');
            this.api.handleError(err);
        });
    };
    /**
     * Navigate to the detail page for this item.
     */
    transactionResponse(transaction) {
        this.api.dismissLoader();
        console.log("after payCreditCard");
        this.orderData.clearOrder();
        this.params.setParams({
            transaction: transaction
        });
        this.navCtrl.navigateForward('shop/payu/complete');
    }
    quickPay() {
        this.api.loader('PAYMENTS.GET_START');

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
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('PAYMENTS.ERROR_PAY');
            this.api.handleError(err);
        });
    };
    payInBank() {
        this.api.loader('PAYMENTS.GET_START');
        let container = {
            "payment_id": this.orderData.payment.id
        };
        console.log("before payCreditCard token", container);
        this.billing.payInBank(container).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {

                console.log("after payInBank");
                this.orderData.clearOrder();
                this.params.setParams({
                    objectId: data.payment.id,
                    newPayment: true
                });
                this.navCtrl.navigateForward('shop/settings/payments/' + data.payment.id);
            } else {
                // Unable to log in
                this.api.toast('PAYMENTS.ERROR_PAY');
            }

        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('PAYMENTS.ERROR_PAY');
            this.api.handleError(err);
        });
    }
    /**
       * The view loaded, let's query our items for the list
       */
    returnHome() {
        this.navCtrl.navigateRoot('shop/settings');
        this.navCtrl.navigateRoot('shop');
    }

    ngOnInit() {
    }

}
