import {Component, OnInit} from '@angular/core';
import {FoodService} from '../../services/food/food.service';
import {NavController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-program-complete',
    templateUrl: './program-complete.page.html',
    styleUrls: ['./program-complete.page.scss'],
})
export class ProgramCompletePage implements OnInit {
    delivery: any
    constructor(public food: FoodService,
        public navCtrl: NavController,
        public api: ApiService,
        public params: ParamsService) {
        let container = this.params.getParams();
        this.delivery = container.delivery;
    }

    ngOnInit() {
    }
    returnHome() {
        this.navCtrl.navigateRoot('tabs/home');
    }
    programAnother() {
        console.log("Program another")
        let theDate = new Date(this.delivery.delivery);
        let strDate = theDate.getFullYear() + '-' + (theDate.getMonth() + 1) + "-" + theDate.getDate() + " 12:00:00"
        let container = {
            "delivery": strDate
        }
        this.food.updateDeliveryDate(container).subscribe((resp: any) => {
            if (resp.status == "success") {
                resp.delivery.delivery = resp.delivery.delivery.replace(/-/g, '/');
                this.params.setParams({item: resp.delivery});
                this.navCtrl.navigateForward('tabs/home/programar');
            } else {
                this.api.toast(resp.message);
            }
        }, (err) => {

        });
    }
}
