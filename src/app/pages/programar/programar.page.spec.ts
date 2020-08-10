import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProgramarPage } from './programar.page';

describe('ProgramarPage', () => {
  let component: ProgramarPage;
  let fixture: ComponentFixture<ProgramarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
