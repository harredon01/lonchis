import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressCreatePage } from './address-create.page';

describe('AddressCreatePage', () => {
  let component: AddressCreatePage;
  let fixture: ComponentFixture<AddressCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressCreatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
