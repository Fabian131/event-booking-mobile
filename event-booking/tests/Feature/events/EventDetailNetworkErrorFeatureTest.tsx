import { act, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import EventDetailScreen from '@/app/(customer)/events/[id]';
import { useAuth } from '@/src/context/AuthContext';
import { ERRORS } from '@/src/constants/ui';

jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: '1' })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

async function renderDetailScreen() {
  const view = render(<EventDetailScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('event detail network error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it('should display error state when server is unreachable', async () => {
    (eventsService.getById as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText(ERRORS.NETWORK)).toBeTruthy();
    });
  });
});
