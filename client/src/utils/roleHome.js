export const getRoleHome = (role) => {
    if (role === "admin") {
        return "/admin";
    }

    return "/dashboard";
};

export default getRoleHome;
