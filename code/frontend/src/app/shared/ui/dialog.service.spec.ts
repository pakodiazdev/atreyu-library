import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('starts closed with null values', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.mode()).toBeNull();
    expect(service.bookCode()).toBeNull();
    expect(service.bookUlid()).toBeNull();
    expect(service.bookDeleted()).toBe(0);
  });

  describe('openBookDelete()', () => {
    it('sets mode to book-delete and stores code and ulid', () => {
      service.openBookDelete('A01', 'ulid-123');
      expect(service.isOpen()).toBe(true);
      expect(service.mode()).toBe('book-delete');
      expect(service.bookCode()).toBe('A01');
      expect(service.bookUlid()).toBe('ulid-123');
    });
  });

  describe('close()', () => {
    it('resets mode and clears book identifiers', () => {
      service.openBookDelete('A01', 'ulid-123');
      service.close();
      expect(service.isOpen()).toBe(false);
      expect(service.mode()).toBeNull();
      expect(service.bookCode()).toBeNull();
      expect(service.bookUlid()).toBeNull();
    });
  });

  describe('notifyBookDeleted()', () => {
    it('increments bookDeleted counter', () => {
      service.notifyBookDeleted();
      expect(service.bookDeleted()).toBe(1);
      service.notifyBookDeleted();
      expect(service.bookDeleted()).toBe(2);
    });

    it('also closes the dialog', () => {
      service.openBookDelete('A01', 'ulid-123');
      service.notifyBookDeleted();
      expect(service.isOpen()).toBe(false);
      expect(service.mode()).toBeNull();
    });
  });
});
