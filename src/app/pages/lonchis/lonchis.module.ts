import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { LonchisPageRoutingModule } from './lonchis-routing.module';

import { LonchisPage } from './lonchis.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    LonchisPageRoutingModule
  ],
  declarations: [LonchisPage]
})
export class LonchisPageModule {}
