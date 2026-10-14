import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import api from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";

const useAddToCart = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const canAddToCart = isAuthenticated && user?.role === "user";

    const mutation = useMutation({
        mutationFn: async ({ cakeId, quantity }) => {
            const response = await api.post("/cart/items", {
                cakeId,
                quantity,
            });

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });

            toast.success(
                isArabic ? "تمت إضافة الكعكة إلى السلة" : "Cake added to cart",
            );
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                    (isArabic
                        ? "تعذر إضافة الكعكة إلى السلة"
                        : "Failed to add cake to cart"),
            );
        },
    });

    const addToCart = (cakeId, quantity = 1) => {
        if (!isAuthenticated) {
            toast.error(
                isArabic
                    ? "يرجى تسجيل الدخول لإضافة الكعكة إلى السلة"
                    : "Please log in to add cakes to your cart",
            );

            navigate("/auth/login", {
                replace: true,
                state: { from: location },
            });
            return;
        }

        if (!canAddToCart) {
            toast.error(
                isArabic
                    ? "التسوق متاح لحسابات العملاء فقط"
                    : "Shopping is available for customer accounts only",
            );

            return;
        }

        mutation.mutate({ cakeId, quantity });
    };

    return {
        addToCart,
        isPending: mutation.isPending,
        pendingCakeId: mutation.variables?.cakeId,
    };
};

export default useAddToCart;
