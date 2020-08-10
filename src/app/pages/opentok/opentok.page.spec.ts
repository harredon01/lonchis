import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpentokPage } from './opentok.page';

describe('OpentokPage', () => {
  let component: OpentokPage;
  let fixture: ComponentFixture<OpentokPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpentokPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpentokPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
