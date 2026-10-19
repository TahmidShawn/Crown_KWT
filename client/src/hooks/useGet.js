import { useQuery } from "@tanstack/react-query";

import api from "@/api/axios";

const useGet = ({ url, params, queryKey, enabled = true, ...options }) => {
    return useQuery({
        queryKey: queryKey || [url, params],
        queryFn: async () => {
            const response = await api.get(url, {
                params,
            });

            return response.data;
        },
        enabled,
        retry: false,
        ...options,
    });
};

export default useGet;
