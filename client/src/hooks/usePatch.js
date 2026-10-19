import { useMutation } from "@tanstack/react-query";

import api from "@/api/axios";

const usePatch = ({ url, params, ...options }) => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.patch(url, data, {
                params,
            });

            return response.data;
        },
        ...options,
    });
};

export default usePatch;
