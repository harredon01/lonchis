import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ZoomMeetingPage } from './zoom-meeting.page';

const routes: Routes = [
  {
    path: '',
    component: ZoomMeetingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ZoomMeetingPage]
})
export class ZoomMeetingPageModule {}
