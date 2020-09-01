import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup } from '@angular/forms';
import {NavController,ModalController } from '@ionic/angular';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
import {UserService} from '../../services/user/user.service';
@Component({
  selector: 'app-buyer-select',
  templateUrl: './buyer-select.page.html',
  styleUrls: ['./buyer-select.page.scss'],
})
export class BuyerSelectPage implements OnInit {

  payers: any[];
    item: any;
    candidate: any;
    merchant: any;
    totalNecessary: any;
    limitActive: boolean;
    candidateFound: boolean;
    submitted: boolean;
    allPlayers: any[];
    form: FormGroup;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public user: UserService,
        public fb: FormBuilder,
        public api: ApiService,
        public orderData: OrderDataService,
        public params: ParamsService) {
        this.candidateFound = false;
        this.payers = [];
        let paramsSent = this.params.getParams();
        this.totalNecessary = paramsSent.necessary;
        this.merchant = paramsSent.merchant;
        if (this.totalNecessary > 0) {
            this.limitActive = true;
        } else {
            this.limitActive = false;
        }
        this.form = fb.group({
            docNum: ['']
        });
        this.submitted = false;
        this.orderData.clearOrderPayers(-1);

    }
    updateForm() {
        let fbargs = {};
        this.payers.forEach(player => fbargs[player.user_id] = []);
        console.log("Updating form", fbargs);
        this.form = this.fb.group(fbargs);
    }

    ionViewDidEnter() {
        this.loadFriends();
    }
    loadFriends() {
        this.orderData.loadSavedFriends().then((value: any) => {
            if (value.length > 0) {
                this.payers = value;
            }
            this.updateForm();
            console.log("payers", this.payers);
        });
    }
    makeTeam(): void {
        this.orderData.clearOrderPayers(-1);
        this.orderData.payers = [];
        for (let item in this.payers) {
            let payer = this.payers[item];
            console.log("payer", payer);
            let formGet = this.form.get(payer.user_id + "");
            console.log("formGet", formGet);
            if (formGet.value) {
                this.totalNecessary--;
                this.orderData.payers.push(payer);
            }
        }
        console.log(this.orderData.payers);
    }
    /**
           * Send a POST request to our signup endpoint with the data
           * the user entered on the form.
           */
    checkPayer() {
        this.submitted = true;
        this.candidateFound = false;
        console.log("checkPayer", this.candidate);
        this.api.loader();
        let container = {
            "email": this.candidate,
            "platform": "Food"
        }
        this.user.checkCredits(container).subscribe((resp: any) => {
            this.api.dismissLoader();
            console.log("checkCredits result", resp);
            if (resp.status == "success") {
                this.candidateFound = true;
                let selected = [];
                for (let item in this.payers) {
                    let payer = this.payers[item];
                    console.log("payer", payer);
                    let formGet = this.form.get(payer.user_id + "");
                    console.log("formGet", formGet);
                    if (formGet.value) {
                        selected.push(payer.user_id)
                    }
                }
                selected.push(resp.user_id)
                let accepted = {"user_id": resp.user_id, "email": this.candidate, "credits": resp.credits};
                this.payers.push(accepted);
                this.orderData.saveFriend(resp.user_id, this.candidate);
                this.updateForm();
                for (let item in selected) {
                    let payer = selected[item];
                    console.log("payer", payer);
                    let formGet = this.form.get(payer + "");
                    console.log("formGet", formGet);
                    formGet.setValue(true);
                }
                this.api.toast('BUYER_SELECT.CHECK_SUCCESS');
                this.candidate = "";
            } else {
                // Unable to log in
                this.api.toast('BUYER_SELECT.CHECK_ERROR');
            }
        }, (err) => {
            this.api.dismissLoader();
            this.api.handleError(err);
        });

    }


    /**
     * The user cancelled, so we dismiss without sending data back.
     */
    cancel() {
        this.modalCtrl.dismiss("cancel");
    }

    /**
     * Delete an item from the list of items.
     */
    deletePayer(item) {
        this.payers.splice(this.payers.indexOf(item), 1);
        this.orderData.payers.splice(this.orderData.payers.indexOf(item.user_id), 1);
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        this.orderData.clearOrderPayers(-1);
        this.orderData.payers = [];
        for (let item in this.payers) {
            let payer = this.payers[item];
            console.log("payer", payer);
            let formGet = this.form.get(payer.user_id + "");
            console.log("formGet", formGet);
            if (formGet.value) {
                this.totalNecessary--;
                this.orderData.payers.push(payer);
            }
        }
        console.log(this.orderData.payers);
        if (this.totalNecessary < 1) {
            this.modalCtrl.dismiss("done");
        } else {
            this.api.toast('BUYER_SELECT.MISSING_PAYERS');
        }


    }

  ngOnInit() {
  }

}
