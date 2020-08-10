import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MercadoPagoThankyouPage } from './mercado-pago-thankyou.page';

const routes: Routes = [
  {
    path: '',
    component: MercadoPagoThankyouPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MercadoPagoThankyouPage]
})
export class MercadoPagoThankyouPageModule {}
