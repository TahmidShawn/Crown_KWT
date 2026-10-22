export const calculateCartTotals = (cart) => {
    let subtotal = 0;
    let totalItems = 0;

    for (const item of cart.items ?? []) {
        const cake = item.cake;

        if (!cake) {
            continue;
        }

        const price =
            cake.discountedPrice !== undefined
                ? cake.discountedPrice
                : cake.price;

        subtotal += Number(price) * item.quantity;
        totalItems += item.quantity;
    }

    for (const item of cart.addOns ?? []) {
        const addOn = item.addOn;

        if (!addOn) {
            continue;
        }

        subtotal += Number(addOn.price) * item.quantity;
        totalItems += item.quantity;
    }

    return {
        subtotal: Number(subtotal.toFixed(3)),
        totalItems,
    };
};