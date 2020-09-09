import {Component, OnInit} from '@angular/core';
import {GroupsService} from '../../services/groups/groups.service';
import {NavController, ModalController} from '@ionic/angular';
import {Group} from '../../models/group';
import {ApiService} from '../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {ParamsService} from '../../services/params/params.service';
import {SelectContactsPage} from '../select-contacts/select-contacts.page'
@Component({
    selector: 'app-group-detail',
    templateUrl: './group-detail.page.html',
    styleUrls: ['./group-detail.page.scss'],
})
export class GroupDetailPage implements OnInit {
    private mainGroup: Group;
    constructor(public groups: GroupsService,
        public activatedRoute: ActivatedRoute,
        public params: ParamsService,
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        public api: ApiService
    ) {}

    ngOnInit() {
        let params = this.params.getParams();
        this.mainGroup = params.item;
    }
    chat() {
        this.navCtrl.navigateForward('shop/groups/'+this.mainGroup.id+'/chat'); 
    }

    leaveGroup() {
        this.api.loader();
        this.groups.leaveGroup(this.mainGroup.id).subscribe((data: any) => {
            this.navCtrl.back();
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error leaveGroup");
            this.api.dismissLoader();
            this.api.handleError(err);
        });
    }
    async inviteContacts() {
        let addModal = await this.modalCtrl.create({
            component: SelectContactsPage
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            this.api.loader();
            this.groups.inviteUsers(data).subscribe((data: any) => {
                this.api.dismissLoader();
                this.navCtrl.back();
            }, (err) => {
                console.log("Error leaveGroup");
                this.api.dismissLoader();
                this.api.handleError(err);
            });
        }
    }
}