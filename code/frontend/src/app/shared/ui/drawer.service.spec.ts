import { TestBed } from '@angular/core/testing';
import { DrawerService } from './drawer.service';

describe('DrawerService', () => {
  let service: DrawerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawerService);
  });

  it('starts closed with null values', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.mode()).toBeNull();
    expect(service.bookCode()).toBeNull();
    expect(service.bookCreated()).toBe(0);
    expect(service.updateCount()).toBe(0);
  });

  describe('openDetail()', () => {
    it('sets mode to detail and stores book code', () => {
      service.openDetail('A01');
      expect(service.isOpen()).toBe(true);
      expect(service.mode()).toBe('detail');
      expect(service.bookCode()).toBe('A01');
    });
  });

  describe('openForm()', () => {
    it('sets mode to form and clears book code', () => {
      service.openDetail('A01');
      service.openForm();
      expect(service.mode()).toBe('form');
      expect(service.bookCode()).toBeNull();
    });
  });

  describe('openEdit()', () => {
    it('sets mode to edit and stores book code', () => {
      service.openEdit('B02');
      expect(service.mode()).toBe('edit');
      expect(service.bookCode()).toBe('B02');
    });
  });

  describe('close()', () => {
    it('resets mode and clears book code', () => {
      service.openDetail('A01');
      service.close();
      expect(service.isOpen()).toBe(false);
      expect(service.mode()).toBeNull();
      expect(service.bookCode()).toBeNull();
    });
  });

  describe('notifyBookCreated()', () => {
    it('increments bookCreated and closes drawer', () => {
      service.openForm();
      service.notifyBookCreated();
      expect(service.bookCreated()).toBe(1);
      expect(service.isOpen()).toBe(false);
    });
  });

  describe('notifyBookUpdated()', () => {
    it('increments updateCount and switches to detail mode', () => {
      service.openEdit('A01');
      service.notifyBookUpdated();
      expect(service.updateCount()).toBe(1);
      expect(service.mode()).toBe('detail');
    });
  });

  describe('returnUrl', () => {
    it('defaults to /catalogo', () => {
      expect(service.returnUrl()).toBe('/catalogo');
    });
  });

  describe('openDetailFrom()', () => {
    it('sets mode to detail and stores book code', () => {
      service.openDetailFrom('A01', '/inicio');
      expect(service.mode()).toBe('detail');
      expect(service.bookCode()).toBe('A01');
    });

    it('stores the provided returnUrl', () => {
      service.openDetailFrom('A01', '/inicio');
      expect(service.returnUrl()).toBe('/inicio');
    });

    it('overwrites a previous returnUrl', () => {
      service.openDetailFrom('A01', '/catalogo');
      service.openDetailFrom('B02', '/inicio');
      expect(service.returnUrl()).toBe('/inicio');
    });
  });
});
