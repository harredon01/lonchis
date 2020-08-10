import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantProductsPage } from './merchant-products.page';

describe('MerchantProductsPage', () => {
  let component: MerchantProductsPage;
  let fixture: ComponentFixture<MerchantProductsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantProductsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
