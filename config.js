// The 'config' object's properties store the basic configureable settings and
// constants of the app.  Change or add to them as desired.

var config = {

    // only evepraisals taken from the specified market will be accepted.
    // Possible values: 'Jita', 'Amarr', 'Dodixie', 'Rens', 'Hek', 'Universe'
    permittedMarket: 'Jita',

    // set to any of these three values: 'buy', 'sell', 'avg'
    collateral: 'sell',
    
    // hauler's reward, calculated as a percentage of the collateral
    rewardPercent: 0.05,

    shipGroupIDs: {
        25:   [2500,        'Frigate'],
        26:   [10000,       'Cruiser'],
        27:   [50000,       'Battleship'],
        28:   [10000,       'Industrial'],
        30:   [13000000,    'Titan'],
        31:   [500,         'Shuttle'],
        237:  [2500,        'Rookie Ship'],
        324:  [2500,        'Assault Frigate'],
        358:  [10000,       'Heavy Assault Cruiser'],
        380:  [10000,       'Deep Space Transport'],
        419:  [15000,       'Combat Battlecruiser'],
        420:  [5000,        'Destroyer'],
        463:  [3750,        'Mining Barge'],
        485:  [1300000,     'Dreadnought'],
        513:  [1300000,     'Freighter'],
        540:  [15000,       'Command Ship'],
        541:  [5000,        'Interdictor'],
        543:  [3750,        'Exhumer'],
        547:  [1300000,     'Carrier'],
        659:  [13000000,    'Supercarrier'],
        830:  [2500,        'Covert Ops'],
        831:  [2500,        'Interceptor'],
        832:  [10000,       'Logistics'],
        833:  [10000,       'Force Recon Ship'],
        834:  [2500,        'Stealth Bomber'],
        883:  [1300000,     'Capital Industrial Ship'],
        893:  [2500,        'Electronic Attack Ship'],
        894:  [10000,       'Heavy Interdiction Cruiser'],
        898:  [50000,       'Black Ops'],
        900:  [50000,       'Marauder'],
        902:  [1300000,     'Jump Freighter'],
        906:  [10000,       'Combat Recon Ship'],
        941:  [500000,      'Industrial Command Ship'],
        963:  [5000,        'Strategic Cruiser'],
        1022: [500,         'Prototype Exploration Ship'],
        1201: [15000,       'Attack Battlecruiser'],
        1202: [10000,       'Blockade Runner'],
        1283: [2500,        'Expedition Frigate'],
        1305: [5000,        'Tactical Destroyer'],
    }
};