import FeaturedDeal from "./featuredDeal/FeaturedDeal";
import CakeBanner from "./banner/CakeBanner";
import Category from "./category/Category";
import HotDeals from "./hotDeals/HotDeals";
import PopularCategories from "./popularCategories/PopularCategories";
import HomeReviews from "./reviews/HomeReviews";
import { PageTitle } from "@/components/shared/PageTitle";

const Home = () => {
    return (
        <>
            <PageTitle title="Home" />
            <div>
                <CakeBanner />
                <Category />
                <HotDeals />
                <PopularCategories />
                <FeaturedDeal />
                <HomeReviews />
            </div>
        </>
    );
};

export default Home;
