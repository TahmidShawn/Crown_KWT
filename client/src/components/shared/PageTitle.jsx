import { Helmet } from "react-helmet-async";

const siteName = "Crown Kwt";

export const PageTitle = ({ title, description }) => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
        </Helmet>
    );
};

export default PageTitle;
