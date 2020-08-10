import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ContactsService} from '../../services/contacts/contacts.service';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
import {Contact} from '../../models/contact'
@Component({
    selector: 'app-select-contacts',
    templateUrl: './select-contacts.page.html',
    styleUrls: ['./select-contacts.page.scss'],
})
export class SelectContactsPage implements OnInit {
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    contacts: Contact[] = [];
    contacts2: Contact[] = [];
    invites: any[] = [];
    page: any = 0;
    loadMore: boolean = false;
    itemsErrorGet = "";
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public contactsServ: ContactsService,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public api: ApiService,
        private spinnerDialog: SpinnerDialog) {}

    getContacts(event) {
        this.showLoader();
        this.page++;
        let query = "page=" + this.page;
        this.contactsServ.getContacts(query).subscribe((data: any) => {
            let results = data.data;
            if (data.page == data.last_page) {
                this.infiniteScroll.disabled = true;
            }
            for (let one in results) {
                results[one].id = results[one].contact_id;
                let container = new Contact(results[one]);
                this.contacts.push(container);
            }
            if (event) {
                event.target.complete();
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error getContacts");
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.itemsErrorGet,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    checkSelection(contact: any) {
        let add = true;
        if (contact.selected) {
            contact.selected = false;
            add = false;
        } else {
            contact.selected = true;
        }
        if (add) {
            this.invites.push(contact.id);
        } else {
            for (let i = 0; i < this.invites.length; i++) {
                if (this.invites[i] == contact.id) {
                    this.invites.splice(i, 1);
                }
            }
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

    ngOnInit() {
        this.translateService.get('CATEGORIES.ERROR_GET').subscribe((value) => {
            this.itemsErrorGet = value;
        });
        this.getContacts(null);
    }
    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        this.modalCtrl.dismiss(this.invites);
    }
}
