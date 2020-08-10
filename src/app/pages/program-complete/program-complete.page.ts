import {Component, OnInit} from '@angular/core';
import {FoodService} from '../../services/food/food.service';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
@Component({
    selector: 'app-program-complete',
    templateUrl: './program-complete.page.html',
    styleUrls: ['./program-complete.page.scss'],
})
export class ProgramCompletePage implements OnInit {
    delivery: any
    constructor(public food: FoodService,
        public translate: TranslateService,
        public navCtrl: NavController,
        public toastCtrl: ToastController,
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
                let toast = this.toastCtrl.create({
                    message: resp.message,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }, (err) => {

        });
    }
}
