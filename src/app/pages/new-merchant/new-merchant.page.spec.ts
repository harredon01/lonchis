import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMerchantPage } from './new-merchant.page';

describe('NewMerchantPage', () => {
  let component: NewMerchantPage;
  let fixture: ComponentFixture<NewMerchantPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewMerchantPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMerchantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
