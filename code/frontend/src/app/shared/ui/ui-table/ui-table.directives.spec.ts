import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import {
  UiTableDirective,
  UiTableHeaderDirective,
  UiTableRowDirective,
  UiTableCellDirective,
} from './ui-table.directives';

@Component({
  standalone: true,
  imports: [UiTableDirective, UiTableHeaderDirective, UiTableRowDirective, UiTableCellDirective],
  template: `
    <table uiTable [class]="tableClass">
      <thead><tr><th uiTableHeader [class]="headerClass">H</th></tr></thead>
      <tbody><tr uiTableRow [class]="rowClass">
        <td uiTableCell [class]="cellClass">C</td>
      </tr></tbody>
    </table>
  `,
})
class TableHost {
  @Input() tableClass  = '';
  @Input() headerClass = '';
  @Input() rowClass    = '';
  @Input() cellClass   = '';
}

function create(inputs: Partial<{ tableClass: string; headerClass: string; rowClass: string; cellClass: string }> = {}): ComponentFixture<TableHost> {
  TestBed.configureTestingModule({ imports: [TableHost] });
  const f = TestBed.createComponent(TableHost);
  Object.assign(f.componentInstance, inputs);
  f.detectChanges();
  return f;
}

describe('UiTable directives', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('UiTableDirective', () => {
    it('applies base table classes', () => {
      const f = create();
      expect(f.nativeElement.querySelector('table').className).toContain('w-full');
    });

    it('merges extra class', () => {
      const f = create({ tableClass: 'extra-class' });
      expect(f.nativeElement.querySelector('table').className).toContain('extra-class');
    });
  });

  describe('UiTableHeaderDirective', () => {
    it('applies header classes', () => {
      const f = create();
      expect(f.nativeElement.querySelector('th').className).toContain('uppercase');
    });

    it('merges extra class on header', () => {
      const f = create({ headerClass: 'w-14' });
      expect(f.nativeElement.querySelector('th').className).toContain('w-14');
    });
  });

  describe('UiTableRowDirective', () => {
    it('applies row classes', () => {
      const f = create();
      expect(f.nativeElement.querySelector('tbody tr').className).toContain('border-b');
    });

    it('merges extra class on row', () => {
      const f = create({ rowClass: 'cursor-pointer' });
      expect(f.nativeElement.querySelector('tbody tr').className).toContain('cursor-pointer');
    });
  });

  describe('UiTableCellDirective', () => {
    it('applies cell classes', () => {
      const f = create();
      expect(f.nativeElement.querySelector('td').className).toContain('align-middle');
    });

    it('merges extra class on cell', () => {
      const f = create({ cellClass: 'text-right' });
      expect(f.nativeElement.querySelector('td').className).toContain('text-right');
    });
  });
});
