import { useMutation } from "@tanstack/react-query";

import api from "@/api/axios";

const useDelete = ({ url, params, ...options }) => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.delete(url, {
                params,
                data,
            });

            return response.data;
        },
        ...options,
    });
};

export default useDelete;
