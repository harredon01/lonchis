import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { ProgramarPageRoutingModule } from './programar-routing.module';

import { ProgramarPage } from './programar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicModule,
    ProgramarPageRoutingModule
  ],
  declarations: [ProgramarPage]
})
export class ProgramarPageModule {}
