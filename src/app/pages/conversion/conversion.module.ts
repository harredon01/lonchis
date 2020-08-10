import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { ConversionPageRoutingModule } from './conversion-routing.module';

import { ConversionPage } from './conversion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ConversionPageRoutingModule
  ],
  declarations: [ConversionPage]
})
export class ConversionPageModule {}
