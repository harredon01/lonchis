import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {SearchFilteringPage} from '../search-filtering/search-filtering.page';
import {ContactsService} from '../../services/contacts/contacts.service';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
import {Contact} from '../../models/contact'
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.page.html',
    styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    contacts: Contact[] = []
    page: any = 0;
    loadMore: boolean = false;
    itemsErrorGet: string = "";
    itemsErrorDelete: string = "";
    queryMod: string = "";
    queries:any[]=[];
    itemsErrorBlock: string = "";
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public contactsServ: ContactsService,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public api: ApiService,
        private spinnerDialog: SpinnerDialog) {}

    async filter() {
        let container;
        container = {
            lat: "",
            long: "",
            address: "",
            id: "",
            phone: "",
            name: "",
            postal: "",
            notes: "",
            type: "billing"
        }
        let addModal = await this.modalCtrl.create({
            component: SearchFilteringPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            this.getContacts(null);
        }
    }
    selectQuery(){
        
    }
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
    deleteContact(contact:Contact) {
        this.showLoader();
        this.contactsServ.deleteContact(contact).subscribe((data: any) => {
            for (let one=0;one< this.contacts.length;one++) {
                if(this.contacts[one].id == contact.id){
                    this.contacts.splice(one,1);
                }
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error deleteContact");
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.itemsErrorDelete,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    openItem(item: Contact) {
        this.params.setParams({"item":item });
        console.log("Entering Contact",item.id);
        this.navCtrl.navigateForward('tabs/contacts/'+item.id); 
    }
    importContacts() {
        this.navCtrl.navigateForward('tabs/contacts/import');
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
    ionViewDidEnter(){
        this.getContacts(null);
    }
    
    ngOnInit() {
        this.translateService.get('CATEGORIES.ERROR_GET').subscribe((value) => {
            this.itemsErrorGet = value;
        });

        
    }

}
