import { renderHook, act } from '@testing-library/react';
import { useForm } from '../../hooks/useForm';

describe('useForm', () => {
  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'regular' as const
  };

  it('should initialize with provided values', () => {
    const { result } = renderHook(() => useForm({
      initialValues,
      onSubmit: async () => {}
    }));

    expect(result.current.values).toEqual(initialValues);
  });

  it('should update values on change', () => {
    const { result } = renderHook(() => useForm({
      initialValues,
      onSubmit: async () => {}
    }));

    act(() => {
      result.current.handleChange({
        target: { name: 'first_name', value: 'John' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.first_name).toBe('John');
  });
});