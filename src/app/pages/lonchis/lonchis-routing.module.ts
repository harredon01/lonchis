import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LonchisPage } from './lonchis.page';

const routes: Routes = [
  {
    path: '',
    component: LonchisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LonchisPageRoutingModule {}
