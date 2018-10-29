// The 'config' object's properties store the basic configureable settings and
// constants of the app.  Change or add to them as desired.

var config = {
    // only evepraisals taken from the specified market will be accepted.
    // Possible values: 'Jita', 'Amarr', 'Dodixie', 'Rens', 'Hek', 'Universe'
    permittedMarket: "Jita",

    // set to any of these three values: 'buy', 'sell', 'avg'
    collateral: "sell",

    // settings having to do with reward balancing
    reward: {
        // base contract fee
        baseFee: 3000000,

        // volume contribution to the reward of a full all-V skilled DST (60k m3)
        fullDstPrice: 20000000,

        // Percent of the collateral contributed to the reward
        percentOfCollateral: 0.01
    }
};
