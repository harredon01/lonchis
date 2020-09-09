import {Component, OnInit} from '@angular/core';
import {Payment} from '../../models/payment'
import {ParamsService} from '../../services/params/params.service';
import {NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
@Component({
    selector: 'app-mercado-pago-thankyou',
    templateUrl: './mercado-pago-thankyou.page.html',
    styleUrls: ['./mercado-pago-thankyou.page.scss'],
})
export class MercadoPagoThankyouPage implements OnInit {
    paymentMethod: any;
    year: any;
    month: any;
    payment: Payment;
    status: any;
    response: any;


    constructor(
        private params: ParamsService,
        private translateService: TranslateService,
        private navCtrl: NavController) {
        let container = this.params.getParams();
        console.log("Params", container);
        this.paymentMethod = container.paymentMethodId;
        this.payment = new Payment(container.payment);
        this.translateService.get('MERCADOPAGO.' + container.response).subscribe((value) => {
            this.response = value;
        });
    }

    ngOnInit() {
    }
    done() {
        this.navCtrl.navigateRoot("shop/home");
    }

}
