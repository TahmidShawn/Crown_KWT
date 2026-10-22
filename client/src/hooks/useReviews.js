import { useQuery } from "@tanstack/react-query";

import api from "@/api/axios";

// Fetches the public review list for a cake together with its rating summary.
const useGetCakeReviews = ({ slug, enabled = true, ...options }) => {
    return useQuery({
        queryKey: ["reviews", slug],
        queryFn: async () => {
            const response = await api.get(`/cakes/${slug}/reviews`);

            return response.data;
        },
        enabled: enabled && Boolean(slug),
        retry: false,
        ...options,
    });
};

// Fetches the latest reviews across all cakes (home page testimonial carousel).
const useGetLatestReviews = ({ limit = 8, enabled = true, ...options } = {}) => {
    return useQuery({
        queryKey: ["reviews", "latest", limit],
        queryFn: async () => {
            const response = await api.get("/reviews/latest", {
                params: { limit },
            });

            return response.data;
        },
        enabled,
        retry: false,
        ...options,
    });
};

// Fetches the current user's own review for a cake (null when not reviewed yet).
const useGetMyCakeReview = ({ slug, enabled = true, ...options }) => {
    return useQuery({
        queryKey: ["myReview", slug],
        queryFn: async () => {
            const response = await api.get(`/cakes/${slug}/reviews/me`);

            return response.data;
        },
        enabled: enabled && Boolean(slug),
        retry: false,
        ...options,
    });
};

export {
    useGetCakeReviews,
    useGetLatestReviews,
    useGetMyCakeReview,
};
