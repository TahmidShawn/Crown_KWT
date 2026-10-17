import { Route, Routes } from "react-router";

import RootLayout from "../layout/RootLayout";
import DashboardLayout from "../layout/DashboardLayout";

import Home from "../pages/home/Home";
import Products from "@/pages/products/Products";
import Cart from "@/pages/cart/Cart";
import Checkout from "@/pages/checkout/Checkout";
import OrderTracking from "@/pages/orderTracking/OrderTracking";

import Register from "@/pages/auth/register/Register";
import Login from "@/pages/auth/login/Login";
import VerifyEmail from "@/pages/auth/verifyEmail/VerifyEmail";

import Dashboard from "@/pages/dashboard/Dashboard";
import Orders from "@/pages/dashboard/orders/Orders";
import OrderDetails from "@/pages/dashboard/orders/OrderDetails";
import Settings from "@/pages/dashboard/settings/Settings";
import ProductDetails from "@/pages/productDetails/ProductDetails";

import AdminDashboardLayout from "@/layout/AdminDashboardLayout";
import AdminDashboard from "@/pages/adminDashboard/AdminDashboard";
import Categories from "@/pages/adminDashboard/categories/Categories";
import AddCategory from "@/pages/adminDashboard/categories/AddCategory";
import EditCategory from "@/pages/adminDashboard/categories/EditCategory";
import AddCakes from "@/pages/adminDashboard/cakes/AddCakes";
import Cakes from "@/pages/adminDashboard/cakes/Cakes";
import UpdateCake from "@/pages/adminDashboard/cakes/UpdateCake";
import AddAddOn from "@/pages/adminDashboard/addOns/AddAddOn";
import AddOns from "@/pages/adminDashboard/addOns/AddOns";
import EditAddOn from "@/pages/adminDashboard/addOns/EditAddOn";
import AdminOrders from "@/pages/adminDashboard/orders/Orders";
import AdminOrderDetails from "@/pages/adminDashboard/orders/OrderDetails";
import Customers from "@/pages/adminDashboard/customers/Customers";
import PaymentSuccess from "@/pages/paymentResult/PaymentSuccess";
import PaymentFailed from "@/pages/paymentResult/PaymentFailed";
import Policy from "@/pages/legal/Policy";
import TermsConditions from "@/pages/legal/TermsConditions";

import RequireAuth from "@/components/guards/RequireAuth";
import RedirectIfAuthenticated from "@/components/guards/RedirectIfAuthenticated";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/shared/whatsApp/WhatsAppButton";
import NotFound from "@/pages/notFound/NotFound";

const Router = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
            <Route element={<RootLayout />}>
                <Route index element={<Home />} />

                {/* Category → specific category page (no generic /products browse) */}
                <Route path="/category/:slug" element={<Products />} />

                {/* Cake details — reached by clicking any cake card */}
                <Route path="/cake/:slug" element={<ProductDetails />} />

                {/* Search results (category-wise product view) */}
                <Route path="/search" element={<Products />} />

                <Route
                    path="/cart"
                    element={
                        <RequireAuth roles={["user"]}>
                            <Cart />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <RequireAuth roles={["user"]}>
                            <Checkout />
                        </RequireAuth>
                    }
                />

                <Route path="/order-tracking" element={<OrderTracking />} />

                <Route path="/privacy" element={<Policy />} />

                <Route path="/terms" element={<TermsConditions />} />

                {/* Direct /404 — for programmatic navigate("/404") calls */}
                <Route path="/404" element={<NotFound />} />

                {/* Unknown public URL — still inside navbar/footer layout */}
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Guest-only auth pages — signed-in users are bounced away */}
            <Route
                path="/auth/register"
                element={
                    <RedirectIfAuthenticated>
                        <Register />
                    </RedirectIfAuthenticated>
                }
            />
            <Route
                path="/auth/login"
                element={
                    <RedirectIfAuthenticated>
                        <Login />
                    </RedirectIfAuthenticated>
                }
            />
            <Route
                path="/auth/verify-email"
                element={
                    <RedirectIfAuthenticated>
                        <VerifyEmail />
                    </RedirectIfAuthenticated>
                }
            />

            {/* Customer dashboard — users only */}
            <Route element={<RequireAuth roles={["user"]} />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />

                    <Route path="orders" element={<Orders />} />

                    <Route path="orders/:orderId" element={<OrderDetails />} />

                    <Route path="settings" element={<Settings />} />

                    {/* Unknown /dashboard/* URL — stays inside the user layout */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>

            {/* Admin panel — admins only */}
            <Route element={<RequireAuth roles={["admin"]} />}>
                <Route path="/admin" element={<AdminDashboardLayout />}>
                    <Route index element={<AdminDashboard />} />

                    <Route path="categories">
                        <Route index element={<Categories />} />
                        <Route path="add" element={<AddCategory />} />
                        <Route path=":id" element={<EditCategory />} />
                    </Route>
                    <Route path="cakes">
                        <Route index element={<Cakes />} />
                        <Route path="add" element={<AddCakes />} />
                        <Route path=":id" element={<UpdateCake />} />
                    </Route>
                    <Route path="add-ons">
                        <Route index element={<AddOns />} />
                        <Route path="add" element={<AddAddOn />} />
                        <Route path=":id" element={<EditAddOn />} />
                    </Route>
                    <Route path="orders">
                        <Route index element={<AdminOrders />} />
                        <Route path="pending" element={<AdminOrders />} />
                        <Route path="confirmed" element={<AdminOrders />} />
                        <Route
                            path="out-for-delivery"
                            element={<AdminOrders />}
                        />
                        <Route path="delivered" element={<AdminOrders />} />
                        <Route path="cancelled" element={<AdminOrders />} />
                        <Route
                            path=":orderId"
                            element={<AdminOrderDetails />}
                        />
                    </Route>

                    <Route path="customers" element={<Customers />} />

                    {/* Unknown /admin/* URL — stays inside the admin layout */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />

            {/* Absolute fallback — auth pages, payments, anything else */}
            <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Floating WhatsApp support — floats on every page except /admin */}
            <WhatsAppButton />
        </>
    );
};

export default Router;
