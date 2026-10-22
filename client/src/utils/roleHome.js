export const getRoleHome = (role) => {
    if (role === "admin") {
        return "/admin";
    }

    return "/";
};

export default getRoleHome;
