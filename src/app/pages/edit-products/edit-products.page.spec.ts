import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductsPage } from './edit-products.page';

describe('EditProductsPage', () => {
  let component: EditProductsPage;
  let fixture: ComponentFixture<EditProductsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProductsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
