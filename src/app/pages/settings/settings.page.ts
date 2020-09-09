import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {UserService} from '../../services/user/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(public navCtrl: NavController,
        public user: UserService,
        public params: ParamsService) {
    }
ngOnInit() {
  }
    openItem(item: any) {
        if(item=="/shop/settings/bookings"){
            let params ={"type":"Merchant","objectId":-1,"target":"customer","name":"personal"};
            this.params.setParams(params);
        }
        if(item=="/shop/settings/chat"){
            let params ={"type":"platform","objectId":"food","target":"customer","name":"Support"};
            this.params.setParams(params);
        }
        if(item=="/shop/settings/merchants"){
            let params ={"owner":true};
            this.params.setParams(params);
        }
        this.navCtrl.navigateForward(item);
    }
    logout() {
        this.user.logout();
    }

  

}
