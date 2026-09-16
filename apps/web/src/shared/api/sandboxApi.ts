import { baseApi } from './baseApi';

export type SandboxScenario = 'success' | 'decline';

export type SandboxCard = {
  id: string;
  title: string;
  maskedNumber: string;
  scenario: SandboxScenario;
};

export type SandboxData = {
  settlementDelayMs: number;
  cards: SandboxCard[];
};

type SandboxResponse = {
  data: SandboxData;
};

export type SimulationStatus = 'pending' | 'completed';

export type Simulation = {
  id: string;
  paymentId: string;
  scenario: SandboxScenario;
  status: SimulationStatus;
};

type SimulationResponse = {
  data: Simulation;
};

type CreateSimulationRequest = {
  paymentId: string;
  scenario: SandboxScenario;
};

export const sandboxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSandbox: builder.query<SandboxResponse, void>({
      query: () => '/api/sandbox',
    }),

    createSimulation: builder.mutation<SimulationResponse, CreateSimulationRequest>({
      query: ({ paymentId, scenario }) => ({
        url: `/api/payments/${paymentId}/simulations`,
        method: 'POST',
        body: {
          scenario,
        },
      }),
    }),
  }),
});

export const { useGetSandboxQuery, useCreateSimulationMutation } = sandboxApi;
