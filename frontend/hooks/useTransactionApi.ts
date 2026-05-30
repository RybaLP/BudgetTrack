import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useBudgetStore } from '../store/useBudgetStore';

const BASE = 'http://localhost:8080/api/transactions';

export const useTransactionsApi = () => {
  const queryClient = useQueryClient();

  const useGetAll = () => {
    const { filterCategory, filterFrom, filterTo } = useBudgetStore();

    return useQuery({
      queryKey: ['transactions', filterCategory, filterFrom, filterTo],
      queryFn: async () => {
        const { data } = await axios.get(BASE, {
          params: {
            category: filterCategory || undefined,
            from: filterFrom || undefined,
            to: filterTo || undefined,
          },
        });
        return data;
      },
    });
  };

  const useGetSummary = (from?: string, to?: string) =>
    useQuery({
      queryKey: ['transactions', 'summary', from, to],
      queryFn: async () => {
        const { data } = await axios.get(`${BASE}/summary`, {
          params: {
            from: from || undefined,
            to: to || undefined,
          },
        });
        return data;
      },
    });

  const useAdd = () =>
    useMutation({
      mutationFn: (newTransaction: {
        description: string;
        amount: number;
        category: string;
        accountId: number;
        date: string;
        type: 'INCOME' | 'EXPENSE';
      }) => axios.post(BASE, newTransaction),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: number) =>
        axios.delete(`${BASE}/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
    });

  return { useGetAll, useGetSummary, useAdd, useDelete };
};