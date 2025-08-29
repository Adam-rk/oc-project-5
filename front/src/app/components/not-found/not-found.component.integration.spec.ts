import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent Integration Tests', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotFoundComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should display the not found message', () => {
      const h1Element = fixture.debugElement.query(By.css('h1')).nativeElement;
      expect(h1Element.textContent).toBe('Page not found !');
    });

    it('should have the correct layout structure', () => {
      const divElement = fixture.debugElement.query(By.css('div'));
      expect(divElement).toBeTruthy();
      expect(divElement.nativeElement.className).toContain('flex');
      expect(divElement.nativeElement.className).toContain('justify-center');
      expect(divElement.nativeElement.className).toContain('mt3');
    });

    it('should have proper heading hierarchy with h1', () => {
      const h1Elements = fixture.debugElement.queryAll(By.css('h1'));
      expect(h1Elements.length).toBe(1);
    });
  });

  describe('DOM Structure and Styling', () => {
    it('should have div as the root element', () => {
      const rootElement = fixture.debugElement.children[0];
      expect(rootElement.name).toBe('div');
    });

    it('should have proper nesting of elements', () => {
      const divElement = fixture.debugElement.query(By.css('div'));
      const h1Element = divElement.query(By.css('h1'));
      expect(h1Element).toBeTruthy();
    });

    it('should apply proper CSS classes for responsive layout', () => {
      const divElement = fixture.debugElement.query(By.css('div')).nativeElement;
      
      // Check for flex layout classes
      expect(divElement.className).toContain('flex');
      expect(divElement.className).toContain('justify-center');
      
      // Check for margin top class
      expect(divElement.className).toContain('mt3');
    });
  });

  describe('Accessibility', () => {
    it('should use proper heading level for main content', () => {
      // 404 page should use h1 as its main heading
      const h1Element = fixture.debugElement.query(By.css('h1'));
      expect(h1Element).toBeTruthy();
    });

    it('should have clear and descriptive error message', () => {
      const h1Text = fixture.debugElement.query(By.css('h1')).nativeElement.textContent;
      expect(h1Text).toBe('Page not found !');
      expect(h1Text.length).toBeGreaterThan(0);
    });
  });
});
