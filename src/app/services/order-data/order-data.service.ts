import {Injectable} from '@angular/core';
import {Events} from '../events/events.service';
import {Storage} from '@ionic/storage';
import {Address} from '../../models/address';
import {Payment} from '../../models/payment';
import {Order} from '../../models/order';
import {DatabaseService} from '../database/database.service';
@Injectable({
    providedIn: 'root'
})
export class OrderDataService {
    currentOrder: any;
    cartData: any;
    shippingAddress: Address;
    payerAddress: Address;
    buyerAddress: Address;
    payerInfo: any;
    paymentMethod: any;
    creditProduct: any;
    deliveryDate: any;
    payment: any;
    payers: any[];


    constructor(public storage: Storage,
        public events: Events,
        public database: DatabaseService) {
        this.currentOrder = null;
        this.cartData = null;
        this.shippingAddress = null;
        this.payerAddress = null;
        this.payerInfo = null;
        this.buyerAddress = null;
        this.paymentMethod = null;
        this.creditProduct = null;
        this.payment = null;
        this.payers = [];
    }
    getStep2(method: any) {
        if (method == "CC") {
            return "tabs/payu/credit/buyer";
        }
        if (method == "Cash") {
            return "tabs/payu/cash";
        }
        if (method == "Banks") {
            return "tabs/payu/banks";
        }
    }
    savePayer(order_id: any, user_id: any, email: any) {

        let query = "SELECT * FROM payers where order_id = ? and user_id = ? ";
        let params = [order_id, user_id];
        this.database.executeSql(query, params)
            .then((res: any) => {
                if (res.length == 0) {
                    let query = "INSERT INTO payers (order_id, user_id, email ) VALUES (?,?,?)";
                    let params = [order_id, user_id, email];
                    this.database.executeSql(query, params)
                        .then((res: any) => {
                            console.log("payer saved", res);
                        }, (err) => console.error(err));

                }

            }, (err) => console.error(err));
    }
    saveFriend(user_id: any, email: any) {
        let query = "SELECT * FROM friends where user_id = ? ";
        let params = [user_id]
        this.database.executeSql(query, params)
            .then((res: any) => {
                if (res.length == 0) {
                    let query = "INSERT INTO friends (user_id, email ) VALUES (?,?)";
                    let params = [user_id, email];
                    this.database.executeSql(query, params)
                        .then((res: any) => {
                            console.log("friend saved", res);
                        }, (err) => console.error(err));

                }

            }, (err) => console.error(err));
    }
    getRemember(): Promise<string> {
        return this.storage.get('remember').then((value) => {
            return value;
        });
    }
    loadSavedPayers(order_id: any) {
        return new Promise((resolve, reject) => {
            if (this.currentOrder) {
                this.clearOtherPayers(this.currentOrder.id);
            }
            let query = "SELECT DISTINCT(user_id),email FROM payers where order_id = ? OR order_id is null";
            //let query = "SELECT * FROM payers";
            let params = [order_id];
            //let params = [];
            this.payers = [];
            this.database.executeSql(query, params)
                .then((res: any) => {
                    console.log("Loading payers", res);
                    if (res) {
                        for (let i = 0; i < res.length; i++) {
                            console.log("Payer fetched", res[i]);
                            let container = {"user_id": res[i].user_id, "email": res[i].email};
                            this.payers.push(container);
                        }
                        let query = "UPDATE payers SET order_id = ? WHERE order_id is null ";
                        let params = [order_id]
                        this.database.executeSql(query, params);

                    }
                    resolve("done");
                    console.log("Saved payers", this.payers);

                }, (err) => console.error(err));
        });

    }
    loadSavedFriends() {
        return new Promise((resolve, reject) => {
            let query = "SELECT user_id,email FROM friends";
            //let query = "SELECT * FROM payers";
            let params = [];
            //let params = [];
            let payers: any[] = [];
            this.database.executeSql(query, params)
                .then((res: any) => {
                    console.log("Loading friends", res);
                    if (res) {
                        for (let i = 0; i < res.length; i++) {
                            console.log("Payer fetched", res[i]);
                            let container = {"user_id": res[i].user_id, "email": res[i].email};
                            payers.push(container);
                        }
                    }
                    resolve(payers);
                }, (err) => console.error(err));
        });
    }
    clearOrderPayers(order_id: any) {

        let query = "DELETE FROM payers where order_id = ?  ";
        let params = [order_id]
        this.database.executeSql(query, params)
            .then((res: any) => {


            }, (err) => console.error(err));
    }
    clearOrder() {
        this.currentOrder = null;
        this.cartData = null;
        this.shippingAddress = null;
        this.payerAddress = null;
        this.buyerAddress = null;
        this.payerInfo = null;
        this.paymentMethod = null;
        this.creditProduct = null;
        this.payment = null;
        this.payers = [];
        this.events.publish('cart:orderFinished',{});
    }
    clearOtherPayers(order_id: any) {

        let query = "DELETE FROM payers where order_id <> ? and order_id is not null  ";
        let params = [order_id]
        this.database.executeSql(query, params)
            .then((res: any) => {


            }, (err) => console.error(err));
    }
}
