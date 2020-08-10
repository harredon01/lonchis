import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LonchisPage } from './lonchis.page';

describe('LonchisPage', () => {
  let component: LonchisPage;
  let fixture: ComponentFixture<LonchisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LonchisPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LonchisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
