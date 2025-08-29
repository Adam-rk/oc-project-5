import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { By } from '@angular/platform-browser';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotFoundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the not found message', () => {
    const h1Element = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(h1Element.textContent).toBe('Page not found !');
  });

  it('should have the correct CSS class for layout', () => {
    const divElement = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(divElement.className).toContain('flex');
    expect(divElement.className).toContain('justify-center');
    expect(divElement.className).toContain('mt3');
  });

  it('should have a single h1 element', () => {
    const h1Elements = fixture.debugElement.queryAll(By.css('h1'));
    expect(h1Elements.length).toBe(1);
  });
});
