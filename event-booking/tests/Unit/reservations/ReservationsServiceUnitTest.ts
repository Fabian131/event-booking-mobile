import { reservationsService } from '@/src/services/reservations';
import type { CalendarDatesResponse } from '@/src/types/events';
import type {
  ReservationListParams,
} from '@/src/types/reservations';

jest.mock('@/src/services/reservations');

describe('reservationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCalendarDates', () => {
    it('should call GET /api/v1/reservations/calendar with year and month', async () => {
      const mockResponse: CalendarDatesResponse = {
        data: [{ date: '2026-07-15', count: 2 }],
        year: 2026,
        month: 7,
      };
      (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationsService.getCalendarDates(2026, 7);

      expect(reservationsService.getCalendarDates).toHaveBeenCalledWith(2026, 7);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('list', () => {
    it('should include date and default pagination in query', async () => {
      const mockRes: ReservationListParams = { date: '2026-07-15' };
      (reservationsService.list as jest.Mock).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 50, total: 0, total_pages: 0, has_next_page: false },
      });

      await reservationsService.list(mockRes);

      expect(reservationsService.list).toHaveBeenCalledWith({
        date: '2026-07-15',
      });
    });
  });
});
