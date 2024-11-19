// src/__tests__/App.test.tsx
import { screen, act, cleanup } from '@testing-library/react';
import App from '../App';
import { teamMemberApi } from '../services/api';
import userEvent from '@testing-library/user-event';
import { responseData, emptyMembersMock, SetupResult, createTestSetup, waitForAsyncUpdates } from '../utils/testUtil.tsx'


jest.mock('../services/api', () => ({
  teamMemberApi: {
    getAll: jest.fn(),
    getById: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  }
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (teamMemberApi.getAll as jest.Mock).mockResolvedValue(responseData);
  });

  afterEach(() => {
    jest.resetAllMocks();
    (console.error as jest.Mock).mockRestore();
    cleanup();
  });

  const setup = async (): Promise<SetupResult> => {
    return createTestSetup({
      component: <App />,
      apiMock: teamMemberApi.getAll as jest.Mock
    });
  };
  

  describe('Initial Render', () => {

    it('shows loading state initially', async () => {
      const { resolveApiCall } = await setup();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      await resolveApiCall(responseData);
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
    });

    it('shows empty state when no members exist', async () => {
      const { resolveApiCall } = await setup();
      await resolveApiCall(emptyMembersMock);
      expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
      expect(screen.getByText('0 team members')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to add form when plus button is clicked', async () => {
      const { resolveApiCall } = await setup();
      const user = userEvent.setup();
      await resolveApiCall(responseData);

      const addButton = screen.getByRole('button', { name: /add team member/i });
      await act(async () => {
        await user.click(addButton);
        await waitForAsyncUpdates();
      });

      expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    });

    it('navigates to edit form when member is clicked', async () => {
      const { resolveApiCall } = await setup();
      const user = userEvent.setup();
      await resolveApiCall(responseData);

      const memberCard = screen.getByRole('button', { name: /edit john doe/i });
      await act(async () => {
        await user.click(memberCard);
        await waitForAsyncUpdates();
      });

      expect(screen.getByText('Edit Team Member')).toBeInTheDocument();
    });

    it('maintains state during navigation', async () => {
      const { resolveApiCall } = await setup();
      const user = userEvent.setup();
      await resolveApiCall(responseData);

      // Navigate to add form
      const addButton = screen.getByRole('button', { name: /add team member/i });
      await act(async () => {
        await user.click(addButton);
        await waitForAsyncUpdates();
      });

      expect(screen.getByText('Add Team Member')).toBeInTheDocument();

      // Mock the API call for when returning to list
      (teamMemberApi.getAll as jest.Mock).mockResolvedValueOnce(responseData);

      // Navigate back
      const backButton = screen.getByLabelText('Go back');
      await act(async () => {
        await user.click(backButton);
        await waitForAsyncUpdates();
      });

      expect(screen.queryByText('Add Team Member')).not.toBeInTheDocument();
      expect(screen.getByText('2 team members')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const { rejectApiCall } = await setup();
      await rejectApiCall(new Error('Failed to fetch'));

      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('0 team members')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load team members');
    });

    it('recovers from error state when data loads successfully', async () => {
      // First render with error
      const { rejectApiCall } = await setup();
      await rejectApiCall(new Error('Failed to fetch'));
      
      // Verify error state
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load team members');

      // Clean up the first render
      cleanup();

      // Setup successful data fetch for next render
      (teamMemberApi.getAll as jest.Mock).mockResolvedValueOnce(responseData);

      // Render again with success state
      const { resolveApiCall } = await setup();
      await resolveApiCall(responseData);

      // Verify success state
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('2 team members')).toBeInTheDocument();
    });
  });
});