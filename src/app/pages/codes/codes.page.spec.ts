import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodesPage } from './codes.page';

describe('CodesPage', () => {
  let component: CodesPage;
  let fixture: ComponentFixture<CodesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
