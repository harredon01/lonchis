import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectContactsPage } from './select-contacts.page';

describe('SelectContactsPage', () => {
  let component: SelectContactsPage;
  let fixture: ComponentFixture<SelectContactsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectContactsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectContactsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
