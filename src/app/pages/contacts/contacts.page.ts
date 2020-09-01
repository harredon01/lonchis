import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {IonInfiniteScroll} from '@ionic/angular';
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
    queryMod: string = "";
    queries:any[]=[];
    itemsErrorBlock: string = "";
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public contactsServ: ContactsService,
        public modalCtrl: ModalController,
        public api: ApiService) {}

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
        this.api.loader();
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
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error getContacts");
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_GET');
            this.api.handleError(err);
        });
    }
    deleteContact(contact:Contact) {
        this.api.loader();
        this.contactsServ.deleteContact(contact).subscribe((data: any) => {
            for (let one=0;one< this.contacts.length;one++) {
                if(this.contacts[one].id == contact.id){
                    this.contacts.splice(one,1);
                }
            }
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error deleteContact");
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
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
    ionViewDidEnter(){
        this.getContacts(null);
    }
    
    ngOnInit() {

        
    }

}
