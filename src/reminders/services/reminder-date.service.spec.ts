import { ReminderDateService } from './reminder-date.service';

describe('ReminderDateService', () => {
  let service: ReminderDateService;

  beforeEach(() => {
    service = new ReminderDateService();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('buildVaccineReminderPlans', () => {
    it('deve retornar plano DEFAULT para categoria VACCINE', () => {
      const nextDoseDate = new Date('2026-04-20T15:30:00.000Z');

      const result = service.buildVaccineReminderPlans(
        'VACCINE',
        nextDoseDate,
        7,
      );

      expect(result).toHaveLength(1);
      expect(result[0].kind).toBe('DEFAULT');
      expect(result[0].date).toEqual(new Date('2026-04-13T00:00:00.000Z'));
    });

    it('deve retornar plano BUY e APPLY para categoria ANTIPARASITIC', () => {
      const nextDoseDate = new Date('2026-04-20T15:30:00.000Z');

      const result = service.buildVaccineReminderPlans(
        'ANTIPARASITIC',
        nextDoseDate,
        7,
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { kind: 'BUY', date: new Date('2026-04-15T00:00:00.000Z') },
        { kind: 'APPLY', date: new Date('2026-04-20T00:00:00.000Z') },
      ]);
    });

    it('deve retornar plano BUY e APPLY para categoria DEWORMER', () => {
      const nextDoseDate = new Date('2026-04-10T08:00:00.000Z');

      const result = service.buildVaccineReminderPlans(
        'DEWORMER',
        nextDoseDate,
        3,
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { kind: 'BUY', date: new Date('2026-04-05T00:00:00.000Z') },
        { kind: 'APPLY', date: new Date('2026-04-10T00:00:00.000Z') },
      ]);
    });
  });

  describe('getUtcDayRange', () => {
    it('deve retornar o início e fim do dia em UTC', () => {
      const reference = new Date('2026-04-12T14:35:20.123Z');

      const result = service.getUtcDayRange(reference);

      expect(result.start).toEqual(new Date('2026-04-12T00:00:00.000Z'));
      expect(result.end).toEqual(new Date('2026-04-12T23:59:59.999Z'));
    });
  });

  describe('getMedicationReminderDateTime', () => {
    it('deve retornar a data/hora do lembrete subtraindo os minutos do horário do medicamento', () => {
      const now = new Date('2026-04-12T00:00:00.000Z');

      const result = service.getMedicationReminderDateTime(now, '08:30', 60);

      const expected = new Date(now);
      expected.setHours(7, 30, 0, 0);

      expect(result).toEqual(expected);
    });

    it('deve funcionar quando o lembrete cair na hora anterior', () => {
      const now = new Date('2026-04-12T00:00:00.000Z');

      const result = service.getMedicationReminderDateTime(now, '00:30', 60);

      const expected = new Date(now);
      expected.setHours(-1, 30, 0, 0);

      expect(result).toEqual(expected);
    });
  });

  describe('isSameMinute', () => {
    it('deve retornar true quando as datas estiverem no mesmo minuto', () => {
      const dateA = new Date('2026-04-12T10:30:15.123Z');
      const dateB = new Date('2026-04-12T10:30:59.999Z');

      const result = service.isSameMinute(dateA, dateB);

      expect(result).toBe(true);
    });

    it('deve retornar false quando as datas estiverem em minutos diferentes', () => {
      const dateA = new Date('2026-04-12T10:30:59.999Z');
      const dateB = new Date('2026-04-12T10:31:00.000Z');

      const result = service.isSameMinute(dateA, dateB);

      expect(result).toBe(false);
    });
  });

  describe('getUtcStartOfDay', () => {
    it('deve retornar o início do dia em UTC', () => {
      const reference = new Date('2026-04-12T14:35:20.123Z');

      const result = service.getUtcStartOfDay(reference);

      expect(result).toEqual(new Date('2026-04-12T00:00:00.000Z'));
    });
  });

  describe('getUtcEndOfDay', () => {
    it('deve retornar o fim do dia em UTC', () => {
      const reference = new Date('2026-04-12T14:35:20.123Z');

      const result = service.getUtcEndOfDay(reference);

      expect(result).toEqual(new Date('2026-04-12T23:59:59.999Z'));
    });
  });

  describe('getLocalStartOfDay', () => {
    it('deve retornar o início do dia local', () => {
      const reference = new Date('2026-04-12T14:35:20.123Z');

      const result = service.getLocalStartOfDay(reference);

      const expected = new Date(reference);
      expected.setHours(0, 0, 0, 0);

      expect(result).toEqual(expected);
    });
  });

  describe('getLocalEndOfDay', () => {
    it('deve retornar o fim do dia local', () => {
      const reference = new Date('2026-04-12T14:35:20.123Z');

      const result = service.getLocalEndOfDay(reference);

      const expected = new Date(reference);
      expected.setHours(23, 59, 59, 999);

      expect(result).toEqual(expected);
    });
  });

  describe('formatLocalDateTime', () => {
    it('deve formatar a data no padrão local pt-BR', () => {
      const date = new Date('2026-04-12T14:35:20.123Z');

      const result = service.formatLocalDateTime(date);

      expect(result).toBe(date.toLocaleString('pt-BR'));
    });
  });

  describe('formatUtcDateTime', () => {
    it('deve formatar a data no padrão ISO UTC', () => {
      const date = new Date('2026-04-12T14:35:20.123Z');

      const result = service.formatUtcDateTime(date);

      expect(result).toBe('2026-04-12T14:35:20.123Z');
    });
  });
});
