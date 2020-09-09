import {Component, OnInit} from '@angular/core';
import {ContactsService} from '../../services/contacts/contacts.service';
import {NavController, ModalController} from '@ionic/angular';
import {Contact} from '../../models/contact';
import {ApiService} from '../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {ParamsService} from '../../services/params/params.service';
@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.page.html',
  styleUrls: ['./contact-detail.page.scss'],
})
export class ContactDetailPage implements OnInit {
public mainContact: Contact;
    constructor(public contacts: ContactsService,
        public activatedRoute: ActivatedRoute,
        public params: ParamsService,
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        public api: ApiService,
    ) {}

    ngOnInit() {
        let params = this.params.getParams();
        if(params.item){
            this.mainContact = params.item;
        } else {
            this.getContact();
        }
        
    }
    chat() {
        let friend = {"friend":{"id":this.mainContact.id,"name":this.mainContact.firstName}};
        this.params.setParams(friend);
        this.navCtrl.navigateForward('shop/contacts/'+this.mainContact.id+'/chat'); 
    }
    updateblockStatus(status:any) {
        let data = {
            "status":status,
            "contact_id": this.mainContact.id
        };
        this.api.loader();
        this.contacts.updateBlockStatus(data).subscribe((data: any) => {
            this.mainContact.status = status;
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error updateblockStatus");
            this.api.dismissLoader();
            this.api.handleError(err);
        });
    }
    deleteContact() {
        this.api.loader();
        this.contacts.deleteContact(this.mainContact.id).subscribe((data: any) => {
            this.navCtrl.back();
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error deleteContact");
            this.api.dismissLoader();
            this.api.handleError(err);
        });
    }
    getContact() {
        this.api.loader();
        let contactId = this.activatedRoute.snapshot.paramMap.get('objectId');
        this.contacts.getContact(contactId).subscribe((data: any) => {
            this.mainContact = data;
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error getContact");
            this.api.dismissLoader();
            this.api.handleError(err);
        });
    }
}