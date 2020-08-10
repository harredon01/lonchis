import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {SearchFilteringPage} from '../search-filtering/search-filtering.page';
import {GroupsService} from '../../services/groups/groups.service';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
import {Group} from '../../models/group'
@Component({
    selector: 'app-groups',
    templateUrl: './groups.page.html',
    styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit {
    groups: Group[] = []
    page: any = 0;
    loadMore: boolean = false;
    itemsErrorGet: string = "";
    itemsErrorDelete: string = "";
    itemsErrorBlock: string = "";
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public groupsServ: GroupsService,
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
            this.getGroups();
        }
    }
    getGroups() {
        this.showLoader();
        this.page++;
        let query = "page=" + this.page;
        this.groupsServ.getGroups(query).subscribe((data: any) => {
            let results = data.data;
            if (data.page == data.last_page) {
                this.loadMore = false;
            }
            for (let one in results) {
                results[one].id = results[one].contact_id;
                let container = new Group(results[one]);
                this.groups.push(container);
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error getGroups");
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
    leaveGroup(group: Group) {
        this.showLoader();
        this.groupsServ.leaveGroup(group).subscribe((data: any) => {
            for (let one = 0; one < this.groups.length; one++) {
                if (this.groups[one].id == group.id) {
                    this.groups.splice(one, 1);
                }
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error leaveGroup");
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
    openItem(item: Group) {
        this.params.setParams({"item": item});
        console.log("Entering Contact", item.id);
        this.navCtrl.navigateForward('tabs/groups/' + item.id);
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

        this.getGroups();
    }

}
