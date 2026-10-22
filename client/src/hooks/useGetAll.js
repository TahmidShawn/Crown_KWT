import { useInfiniteQuery } from "@tanstack/react-query";

import api from "@/api/axios";

const useGetAll = ({ url, params, queryKey, enabled = true, ...options }) => {
    return useInfiniteQuery({
        queryKey: queryKey || [url, params],
        queryFn: async ({ pageParam }) => {
            const response = await api.get(url, {
                params: {
                    ...params,
                    page: pageParam,
                },
            });

            return response.data;
        },
        initialPageParam: params?.page ?? 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            const totalPages = lastPage?.pagination?.pages ?? 1;

            if (allPages.length >= totalPages) {
                return undefined;
            }

            const currentPage = Number(lastPageParam) || allPages.length;

            return currentPage + 1;
        },
        enabled,
        retry: false,
        ...options,
    });
};

export default useGetAll;
