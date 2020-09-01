import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {IonInfiniteScroll} from '@ionic/angular';
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
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public contactsServ: ContactsService,
        public modalCtrl: ModalController,
        public api: ApiService) {}

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

    ngOnInit() {
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
