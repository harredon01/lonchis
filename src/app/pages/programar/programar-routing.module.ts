import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProgramarPage } from './programar.page';

const routes: Routes = [
  {
    path: '',
    component: ProgramarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramarPageRoutingModule {}
