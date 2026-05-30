import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE = 'http://localhost:8080/api/accounts';

export const useAccountsApi = () => {
  const queryClient = useQueryClient();

  const useGetAll = () =>
    useQuery({
      queryKey: ['accounts'],
      queryFn: async () => {
        const { data } = await axios.get(BASE);
        return data;
      },
    });

  const useGetById = (id: number) =>
    useQuery({
      queryKey: ['accounts', id],
      queryFn: async () => {
        const { data } = await axios.get(`${BASE}/${id}`);
        return data;
      },
      enabled: !!id,
    });

  const useAdd = () =>
    useMutation({
      mutationFn: (newAccount: { name: string }) =>
        axios.post(BASE, newAccount),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: number) =>
        axios.delete(`${BASE}/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
    });

  return { useGetAll, useGetById, useAdd, useDelete };
};