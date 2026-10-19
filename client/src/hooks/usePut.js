import { useMutation } from "@tanstack/react-query";

import api from "@/api/axios";

const usePut = ({ url, params, config, ...options }) => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.put(url, data, {
                params,
                ...config,
            });

            return response.data;
        },
        ...options,
    });
};

export default usePut;
