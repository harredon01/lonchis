import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParamsService {

  private params: any;
  constructor() {}

  public setParams(params) {
    this.params = params;
  }

  getParams() {
    return this.params;
  }
}
