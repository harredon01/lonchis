import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup } from '@angular/forms';
import {NavController, ToastController, LoadingController,ModalController } from '@ionic/angular';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {TranslateService} from '@ngx-translate/core'; 
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {UserService} from '../../services/user/user.service';
@Component({
  selector: 'app-buyer-select',
  templateUrl: './buyer-select.page.html',
  styleUrls: ['./buyer-select.page.scss'],
})
export class BuyerSelectPage implements OnInit {

  payers: any[];
    item: any;
    loading: any;
    candidate: any;
    merchant: any;
    private checkError: string;
    private checkSuccess: string;
    private missingPayers: string;
    totalNecessary: any;
    limitActive: boolean;
    candidateFound: boolean;
    submitted: boolean;
    allPlayers: any[];
    form: FormGroup;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public user: UserService,
        public fb: FormBuilder,
        public api: ApiService,
        public orderData: OrderDataService,
        public translateService: TranslateService,
        public params: ParamsService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.candidateFound = false;
        this.payers = [];
        this.translateService.get('BUYER_SELECT.CHECK_ERROR').subscribe((value) => {
            this.checkError = value;
        });
        this.translateService.get('BUYER_SELECT.MISSING_PAYERS').subscribe((value) => {
            this.missingPayers = value;
        });
        this.translateService.get('BUYER_SELECT.CHECK_SUCCESS').subscribe((value) => {
            this.checkSuccess = value;
        });
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
    /**
           * Send a POST request to our signup endpoint with the data
           * the user entered on the form.
           */
    checkPayer() {
        this.submitted = true;
        this.candidateFound = false;
        console.log("checkPayer", this.candidate);
        this.showLoader();
        let container = {
            "email": this.candidate,
            "platform": "Food"
        }
        this.user.checkCredits(container).subscribe((resp: any) => {
            this.dismissLoader();
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
                let toast = this.toastCtrl.create({
                    message: this.checkSuccess,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.candidate = "";
            } else {
                // Unable to log in
                let toast = this.toastCtrl.create({
                    message: this.checkError,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }, (err) => {
            this.dismissLoader();
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
            let toast = this.toastCtrl.create({
                message: this.missingPayers,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        }


    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
        }
    }

  ngOnInit() {
  }

}
