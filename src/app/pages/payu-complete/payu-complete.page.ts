import {Component, OnInit} from '@angular/core';
import {NavController } from '@ionic/angular';
import {Events} from '../../services/events/events.service';
import {TranslateService} from '@ngx-translate/core';
import {ParamsService} from '../../services/params/params.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
@Component({
    selector: 'app-payu-complete',
    templateUrl: './payu-complete.page.html',
    styleUrls: ['./payu-complete.page.scss'],
})
export class PayuCompletePage implements OnInit {

    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type
    transaction: any;
    is_paid: boolean = false;
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public orderData: OrderDataService,
        public events: Events,
        public translateService: TranslateService) {
        let paramsSent = this.params.getParams();
        this.is_paid = paramsSent.is_paid;
        if (!this.is_paid) {
            this.transaction = paramsSent.transaction;
            let total = paramsSent.total;
            if (this.transaction.operationDate) {
                this.transaction.operationDate = new Date(this.transaction.operationDate);
            }
            if (this.transaction.state == 'APPROVED') {
                //this.fb.logPurchase(total, "COP");
                let vm = this;
                setTimeout(function () {vm.events.publish("home:loadDeliveries",{});}, 1500);
            }
        } else {
            //this.fb.logPurchase(0, "COP");
            let vm = this;
            setTimeout(function () {vm.events.publish("home:loadDeliveries",{});}, 1500);
        }

    }

    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {

    }
    /**
       * The view loaded, let's query our items for the list
       */
    returnHome() {
        this.navCtrl.navigateRoot("tabs/home"); 
        this.orderData.currentOrder = null;
    }

    ngOnInit() {
    }

}
