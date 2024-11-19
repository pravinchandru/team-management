import { render, RenderResult } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { TeamMember, ResponseData, GetResponseData } from '../types';

export interface SetupConfig {
  component: React.ReactElement;
  apiMock: jest.Mock;
}

export interface SetupResult extends RenderResult {
  resolveApiCall: (data: ResponseData) => Promise<void>;
  rejectApiCall: (error: Error) => Promise<void>;
}

// Shared utility functions
export const waitForAsyncUpdates = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });
};

export const createTestSetup = async (
  config: SetupConfig
): Promise<SetupResult> => {
  let resolveApiCall: (value: ResponseData) => void = () => {};
  let rejectApiCall: (error: Error) => void = () => {};
  
  const apiPromise = new Promise<ResponseData>((resolve, reject) => {
    resolveApiCall = resolve;
    rejectApiCall = reject;
  });

  config.apiMock.mockImplementationOnce(() => apiPromise);
  
  const utils = render(config.component);
  
  await waitForAsyncUpdates();
  
  return {
    ...utils,
    resolveApiCall: async (data: ResponseData) => {
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

const mockMember = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '1234567890',
  role: 'regular'
} as TeamMember;

export const responseMemberData = {
  data: mockMember
} as GetResponseData;

const mockMembers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '1234567890',
    role: 'regular'
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    phone_number: '0987654321',
    role: 'admin'
  }
] as TeamMember[];

export const emptyMembersMock = {
  data: []
} as ResponseData;

export const responseData = {
  data: mockMembers
} as ResponseData;