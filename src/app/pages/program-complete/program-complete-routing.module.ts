import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProgramCompletePage } from './program-complete.page';

const routes: Routes = [
  {
    path: '',
    component: ProgramCompletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramCompletePageRoutingModule {}
