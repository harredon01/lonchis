import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConversionPage } from './conversion.page';

const routes: Routes = [
  {
    path: '',
    component: ConversionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConversionPageRoutingModule {}
