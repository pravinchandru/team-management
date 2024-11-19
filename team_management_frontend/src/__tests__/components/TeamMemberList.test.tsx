// src/__tests__/components/TeamMemberList.test.tsx
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamMemberList } from '../../components/TeamMemberList/TeamMemberList';
import { teamMemberApi } from '../../services/api';
import { responseData, emptyMembersMock, SetupResult, createTestSetup } from '../../utils/testUtil.tsx'



jest.mock('../../services/api', () => ({
  teamMemberApi: {
    getAll: jest.fn()
  }
}));

describe('TeamMemberList', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = async (): Promise<SetupResult> => {
    return createTestSetup({
      component: <TeamMemberList onNavigate={mockNavigate} />,
      apiMock: teamMemberApi.getAll as jest.Mock
    });
  };

  it('renders loading state initially', async () => {
    const { resolveApiCall } = await setup();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    await resolveApiCall(responseData);
  });

  it('renders members after loading', async () => {
    const { resolveApiCall } = await setup();
    await resolveApiCall(responseData);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('2 team members')).toBeInTheDocument();
  });

  it('renders empty state when no members exist', async () => {
    const { resolveApiCall } = await setup();
    await resolveApiCall(emptyMembersMock);

    //expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
    expect(screen.getByText('0 team members')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    const { rejectApiCall } = await setup();
    await rejectApiCall(new Error('Failed to fetch'));

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load team members');
  });

  it('navigates to add form when plus button is clicked', async () => {
    const user = userEvent.setup();
    const { resolveApiCall } = await setup();
    await resolveApiCall(responseData);

    const addButton = screen.getByRole('button', { name: /add team member/i });
    await act(async () => {
      await user.click(addButton);
    });


    expect(mockNavigate).toHaveBeenCalledWith('add');
  });

  it('navigates to edit form when member is clicked', async () => {
    const user = userEvent.setup();
    const { resolveApiCall } = await setup();
    await resolveApiCall(responseData);

    const memberCard = screen.getByRole('button', { name: /edit john doe/i });
    await act(async () => {
      await user.click(memberCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('edit', 1);
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const { resolveApiCall } = await setup();
    await resolveApiCall(responseData);

    const memberCard = screen.getByRole('button', { name: /edit john doe/i });
    await act(async () => {
      memberCard.focus();
      await user.keyboard('{Enter}');
    });

    expect(mockNavigate).toHaveBeenCalledWith('edit', 1);
  });

  it('shows admin indicator for admin users', async () => {
    const { resolveApiCall } = await setup();
    await resolveApiCall(responseData);

    expect(screen.getByText('(Admin)')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const { rejectApiCall } = await setup();
    await rejectApiCall(new Error('API Error'));

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load team members');
    expect(screen.getByText('0 team members')).toBeInTheDocument();
  });

  it('sets loading state while fetching data', async () => {
    const { resolveApiCall } = await setup();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    await resolveApiCall(responseData);
    expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
  });
});