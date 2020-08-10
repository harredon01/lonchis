import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class MercadoPagoService {
    tokenGenerateResponses:any = {
        "205":"Ingresa el número de tu tarjeta.",
        "208":"Elige un mes.",
        "209":"Elige un año.",
        "212":"Ingresa tu documento.",
        "213":"Ingresa tu documento.",
        "214":"Ingresa tu documento.",
        "220":"Ingresa tu banco emisor.",
        "221":"Ingresa el nombre y apellido.",
        "224":"Ingresa el código de seguridad.",
        "E301":"Hay algo mal en ese número. Vuelve a ingresarlo.",
        "E302":"Revisa el código de seguridad.",
        "316":"Ingresa un nombre válido.",
        "322":"Revisa tu documento.",
        "323":"Revisa tu documento.",
        "324":"Revisa tu documento.",
        "325":"Revisa la fecha.",
        "326":"Revisa la fecha.",
        "default":"Revisa los datos.",
    }

    constructor(private api:ApiService) {}
    payCreditCard(data: any) {
        let url = "/mercadopago/pay_cc";
        let seq = this.api.post(url, data);
        return seq;
    }

    payDebit(data: any) {
        let url = "/mercadopago/pay_debit";
        let seq = this.api.post(url, data);
        return seq;
    }

    payCash(data: any) {
        let url = "/mercadopago/pay_cash";
        let seq = this.api.post(url, data);
        return seq;
    }

    getPaymentMethods() {
        let url = "/mercadopago/payment_methods";
        let seq = this.api.get(url);
        return seq;
    }
    getBanks() {
        let url = "/mercadopago/banks";
        let seq = this.api.get(url);
        return seq;
    }
    getCards() {
        let url = "/mercadopago/cards";
        let seq = this.api.get(url);
        return seq;
    }
}
