import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
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
    constructor(public navCtrl: NavController,
        public params: ParamsService,
        public groupsServ: GroupsService,
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
            this.getGroups();
        }
    }
    getGroups() {
        this.api.loader();
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
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error getGroups");
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_GET');
            this.api.handleError(err);
        });
    }
    leaveGroup(group: Group) {
        this.api.loader();
        this.groupsServ.leaveGroup(group).subscribe((data: any) => {
            for (let one = 0; one < this.groups.length; one++) {
                if (this.groups[one].id == group.id) {
                    this.groups.splice(one, 1);
                }
            }
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error leaveGroup");
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
            this.api.handleError(err);
        });
    }
    openItem(item: Group) {
        this.params.setParams({"item": item});
        console.log("Entering Contact", item.id);
        this.navCtrl.navigateForward('shop/groups/' + item.id);
    }

    ngOnInit() {

        this.getGroups();
    }

}
