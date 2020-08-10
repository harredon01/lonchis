import {Component, OnInit} from '@angular/core';
import {ContactsService} from '../../services/contacts/contacts.service';
import {NavController, LoadingController, ModalController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
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
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog
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
        this.navCtrl.navigateForward('tabs/contacts/'+this.mainContact.id+'/chat'); 
    }
    updateblockStatus(status:any) {
        let data = {
            "status":status,
            "contact_id": this.mainContact.id
        };
        this.showLoader();
        this.contacts.updateBlockStatus(data).subscribe((data: any) => {
            this.mainContact.status = status;
            this.dismissLoader();
        }, (err) => {
            console.log("Error updateblockStatus");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    deleteContact() {
        this.showLoader();
        this.contacts.deleteContact(this.mainContact.id).subscribe((data: any) => {
            this.navCtrl.back();
            this.dismissLoader();
        }, (err) => {
            console.log("Error deleteContact");
            this.dismissLoader();
            this.api.handleError(err);
        });
    }
    getContact() {
        this.showLoader();
        let contactId = this.activatedRoute.snapshot.paramMap.get('objectId');
        this.contacts.getContact(contactId).subscribe((data: any) => {
            this.mainContact = data;
            this.dismissLoader();
        }, (err) => {
            console.log("Error getContact");
            this.dismissLoader();
            this.api.handleError(err);
        });
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
}