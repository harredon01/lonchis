import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMerchantPage } from './create-merchant.page';

describe('CreateMerchantPage', () => {
  let component: CreateMerchantPage;
  let fixture: ComponentFixture<CreateMerchantPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMerchantPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMerchantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
