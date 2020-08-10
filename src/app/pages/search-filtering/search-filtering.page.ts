import { Component, OnInit } from '@angular/core';
import {NavController,ModalController} from '@ionic/angular';
@Component({
  selector: 'app-search-filtering',
  templateUrl: './search-filtering.page.html',
  styleUrls: ['./search-filtering.page.scss'],
})
export class SearchFilteringPage implements OnInit {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController) { }

  ngOnInit() {
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }

}
