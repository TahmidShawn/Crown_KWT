import { useMutation } from "@tanstack/react-query";

import api from "@/api/axios";

const usePost = ({ url, params, ...options }) => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post(url, data, {
                params,
            });

            return response.data;
        },
        ...options,
    });
};

export default usePost;
