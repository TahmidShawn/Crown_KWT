export const cookieOptions = (days) => ({
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
});

const sendToken = async (user, statusCode, res, message = "Success") => {
    const accessToken = user.getJwtToken();
    const refreshToken = user.getRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const accessExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;
    const refreshExpireDays = Number(process.env.REFRESH_COOKIE_EXPIRE) || 7;

    res.cookie("token", accessToken, cookieOptions(accessExpireDays));
    res.cookie("refreshToken", refreshToken, cookieOptions(refreshExpireDays));

    res.status(statusCode).json({
        success: true,
        message,
        user,
    });
};

export default sendToken;
