import {Component, OnInit} from '@angular/core';
import {GroupsService} from '../../services/groups/groups.service';
import {NavController, LoadingController, ModalController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
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
        public api: ApiService,
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog
    ) {}

    ngOnInit() {
        let params = this.params.getParams();
        this.mainGroup = params.item;
    }
    chat() {
        this.navCtrl.navigateForward('tabs/groups/'+this.mainGroup.id+'/chat'); 
    }

    leaveGroup() {
        this.showLoader();
        this.groups.leaveGroup(this.mainGroup.id).subscribe((data: any) => {
            this.navCtrl.back();
            this.dismissLoader();
        }, (err) => {
            console.log("Error leaveGroup");
            this.dismissLoader();
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
            this.showLoader();
            this.groups.inviteUsers(data).subscribe((data: any) => {
                this.dismissLoader();
                this.navCtrl.back();
            }, (err) => {
                console.log("Error leaveGroup");
                this.dismissLoader();
                this.api.handleError(err);
            });
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
}