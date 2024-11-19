import { render, screen, act, RenderResult} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '../../components/MemberForm/MemberForm';
import { teamMemberApi } from '../../services/api';
import { GetResponseData } from '../../types';
import { responseMemberData, waitForAsyncUpdates } from '../../utils/testUtil.tsx'

// Mock the API
jest.mock('../../services/api', () => ({
  teamMemberApi: {
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    getById: jest.fn().mockResolvedValue({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '1234567890',
      role: 'regular'
    })
  }
}));

describe('MemberForm', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const assertFields = async (
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string
    ) => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue(first_name);
      expect(screen.getByLabelText(/last name/i)).toHaveValue(last_name);
      expect(screen.getByLabelText(/email/i)).toHaveValue(email);
      expect(screen.getByLabelText(/phone number/i)).toHaveValue(phone_number);
  }

  const fillFields = async (
    user: any,
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string
    ) => {
      await user.type(screen.getByLabelText(/first name/i), first_name);
      await user.type(screen.getByLabelText(/last name/i), last_name);
      await user.type(screen.getByLabelText(/email/i), email);
      await user.type(screen.getByLabelText(/phone number/i), phone_number);
  }

  const renderSetup = async (props: { mode: 'add' | 'edit'; id?: number }) => {
    await act(async () => {
      render(<MemberForm {...props} onNavigate={mockNavigate} />);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  };
  interface SetupResult extends RenderResult {
    resolveApiCall: (data: GetResponseData) => Promise<void>;
    rejectApiCall: (error: Error) => Promise<void>;
  }

  const setup = async (
    props: { mode: 'add' | 'edit'; id?: number }
  ): Promise<SetupResult> => {
    let resolveApiCall: (value: GetResponseData) => void = () => {};
    let rejectApiCall: (error: Error) => void = () => {};
    
    const apiPromise = new Promise<GetResponseData>((resolve, reject) => {
      resolveApiCall = resolve;
      rejectApiCall = reject;
    });

    (teamMemberApi.getById as jest.Mock).mockImplementationOnce(() => apiPromise);
    
    const utils = render(<MemberForm {...props} onNavigate={mockNavigate} />);
    
    await waitForAsyncUpdates();
    
    return {
      ...utils,
      resolveApiCall: async (data: GetResponseData) => {
        await act(async () => {
          resolveApiCall(data);
          await waitForAsyncUpdates();
        });
      },
      rejectApiCall: async (error: Error) => {
        await act(async () => {
          rejectApiCall(error);
          await waitForAsyncUpdates();
        });
      }
    };
  };

  it('loads existing data in edit mode', async () => {
    
    const { resolveApiCall } = await setup({ mode: 'edit', id: 1 });
    await resolveApiCall(responseMemberData);

    expect(teamMemberApi.getById).toHaveBeenCalledWith(1);
    
    assertFields('John', 'Doe', 'john@example.com', '1234567890')
  });

  it('shows loading state while fetching data', async () => {
    let resolvePromise: (value: any) => void;
    const loadingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (teamMemberApi.getById as jest.Mock).mockImplementationOnce(() => loadingPromise);

    await act(async () => {
      render(<MemberForm mode="edit" id={1} onNavigate={mockNavigate} />);
    });

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();

    await act(async () => {
      resolvePromise!({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        role: 'regular'
      });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  it('handles form submission in add mode', async () => {
    await setup({ mode: 'add' });
    const user = userEvent.setup();

    await act(async () => {
      await fillFields(user, 'John', 'Doe', 'john@example.com', '1234567890')
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });

    expect(teamMemberApi.create).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '1234567890',
      role: 'regular'
    });
    expect(mockNavigate).toHaveBeenCalledWith('list');
  });

  it('handles delete in edit mode', async () => {
    window.confirm = jest.fn(() => true);
    const user = userEvent.setup();

    await renderSetup({ mode: 'edit', id: 1 });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /delete/i }));
    });

    expect(teamMemberApi.delete).toHaveBeenCalledWith(1);
    expect(mockNavigate).toHaveBeenCalledWith('list');
  });

  it('handles API errors in edit mode', async () => {
    (teamMemberApi.getById as jest.Mock).mockRejectedValueOnce({
      messages: { general: ['Failed to load member data'] }
    });

    await renderSetup({ mode: 'edit', id: 1 });

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load member data');
  });

  it('handles field-specific API errors and clears them on input change', async () => {
    const user = userEvent.setup();
    
    (teamMemberApi.create as jest.Mock).mockRejectedValueOnce({
      messages: {
        phone_number: ['Phone number must contain only digits.'],
        general: ['Failed to save member data']
      }
    });

    await renderSetup({ mode: 'add' });

    // Fill form
    await act(async () => {
      await fillFields(user, 'John', 'Doe', 'john@example.com', 'abc123')
    });


    // Submit form to trigger error
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);
    });

    // Check error message is displayed
    expect(screen.getByText('Phone number must contain only digits.')).toBeInTheDocument();

    // Change input to clear error
    await act(async () => {
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '1234567890');
    });

    // Verify error is cleared
    expect(screen.queryByText('Phone number must contain only digits.')).not.toBeInTheDocument();
  });

  it('cancels editing when back button is clicked', async () => {
    const user = userEvent.setup();
    await renderSetup({ mode: 'edit', id: 1 });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /go back/i }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('list');
  });

  it('handles multiple field errors', async () => {
    const user = userEvent.setup();
    
    (teamMemberApi.create as jest.Mock).mockRejectedValueOnce({
      messages: {
        email: ['This email is already in use'],
        phone_number: ['Phone number must contain only digits'],
        general: ['Failed to save member data']
      }
    });

    await renderSetup({ mode: 'add' });

    // Fill form with invalid data
    await act(async () => {
      // existing email
      await fillFields(user, 'John', 'Doe', 'john@example.com', 'abc123');
    });

    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);
    });

    expect(screen.getByText('Phone number must contain only digits')).toBeInTheDocument();
    expect(screen.getByText('This email is already in use')).toBeInTheDocument();
  });
});