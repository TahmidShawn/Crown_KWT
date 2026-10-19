import BottomBar from "@/components/shared/bottomBar/BottomBar";
import Footer from "@/components/shared/footer/Footer";
import Navbar from "@/components/shared/navbar/Navbar";
import { Outlet } from "react-router";

const RootLayout = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            
            <div
                className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden"
                aria-hidden="true"
            />
            <BottomBar />
        </div>
    );
};

export default RootLayout;
