import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/api/axios";
import { useLanguage } from "@/context/LanguageContext";

const useCreateReview = () => {
    const queryClient = useQueryClient();
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const mutation = useMutation({
        mutationFn: async ({ slug, rating, comment }) => {
            const response = await api.post(`/cakes/${slug}/reviews`, {
                rating,
                comment,
            });

            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["reviews", variables.slug],
            });
            queryClient.invalidateQueries({
                queryKey: ["myReview", variables.slug],
            });
            queryClient.invalidateQueries({
                queryKey: ["cake", variables.slug],
            });

            toast.success(
                isArabic
                    ? "شكرًا لك! تم نشر تقييمك."
                    : "Thank you! Your review has been posted.",
            );
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                    (isArabic
                        ? "تعذر إرسال التقييم"
                        : "Failed to submit your review"),
            );
        },
    });

    return mutation;
};

export default useCreateReview;
