

(function (exports) {


    exports.app = new Vue({

        // the root element that will be compiled
        el: '#couriercosts',

        // app initial state
        data: {
            config: config,
            staticData: staticData,
            evepraisals: [],
            nonShips: {},
            ships: {},
            newValue: '',
        },

        // computed properties
        computed: {

            shipsRepr: function() {
                return JSON.stringify(this.ships);
            },

            nonShipsRepr: function() {
                return JSON.stringify(this.nonShips);
            },

            /**
             * @TODO: none of the loops seem to be executing and the result array is always empty. FIXME
             * @returns {Array} An array including all items (ship and nonship) drawn from every evepraisal.
             */
            allItems: function() {
                var result = [];    // initialize empty result array
                // loop over all evepraisal groups in this.nonShips
                for (var nonShipImportTime in this.nonShips) {
                    // loop over all items in evepraisal group
                    for (var nonShip of this.nonShips[nonShipImportTime]) {
                        result.push(nonShip);  // add item to result array
                    }
                }
                // loop over all evepraisal groups in this.ships
                for (var shipImportTime in this.ships) {
                    // loop over all items in evepraisal group
                    for (var ship of this.ships[shipImportTime]) {
                        result.push(ship);  // add item to result array
                    }
                }
                return result;
            },

            /**
             * @returns {Number} Sum of the buy values of all evepraisals.
             */
            totalEvepraisalsBuy: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.buy;
                }
                return sum;
            },

            /**
             * @returns {Number} Sum of the sell values of all evepraisals.
             */
            totalEvepraisalsSell: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.sell;
                }
                return sum;
            },

            /**
             * @returns {Number} Average of the total sell and total buy values.
             */
            totalEvepraisalsAvg: function() {
                return (this.totalEvepraisalsBuy + this.totalEvepraisalsSell) / 2;
            },

            /**
             * @returns {Number} Sum of the volumes of all items.
             */
            totalVolume: function() {
                return this.itemsVolume(this.allItems);
            },

            /**
             * @returns {Number} Sum of the collaterals of all items.
             */
            totalCollateral: function() {
                return this.itemsCollateral(this.allItems);
            },

            /**
             * @returns {Number} Sum of the rewards of all items.
             */
            totalReward: function() {
                return this.itemsReward(this.allItems);
            },

            /**
             * @returns {String} Specifying what level of Transport Ships is needed to carry the contract
             */
            dstSkillRequired: function() {
                var volume = this.totalVolume;
                if (volume < staticData.dstCargo[1]) {
                    return 'Requires DST with Transport Ships I.';
                } else if (this.staticData.dstCargo[1] < volume && volume < this.staticData.dstCargo[2]) {
                    return 'Requires DST with Transport Ships II';
                } else if (this.staticData.dstCargo[2] < volume && volume < this.staticData.dstCargo[3]) {
                    return 'Requires DST with Transport Ships III';
                } else if (this.staticData.dstCargo[3] < volume && volume < this.staticData.dstCargo[4]) {
                    return 'Requires DST with Transport Ships IV';
                } else if (this.staticData.dstCargo[4] < volume && volume < this.staticData.dstCargo[5]) {
                    return 'Requires DST with Transport Ships V';
                } else if (this.staticData.dstCargo[5] < volume) {
                    return 'WARNING: Too large for a DST';
                } else {
                    console.log("This should not happen.");
                }
            },

            /**
             * @returns {Float} The difference between the contract volume and a maxed DST
             */
            excessVolume: function() {
                return this.totalVolume - this.staticData.dstCargo[5];
            },
        },

        // methods that implement data logic
        methods: {

            /**
             * Provides a way to call addValue() having to use the frontend's form
             * @param {String} value Valid Evepraisal URL
             */
            demoAddValue: function(value) {
                this.newValue = value;
                this.addValue();
            },

            /**
             * Splits up form input and calls addEvepraisal() on each valid Evepraisal URL
             */
            addValue: function() {
                var value = this.newValue && this.newValue.trim();
                if (!value) {
                    return;
                }
                var lines = value.split(/\r\n|\r|\n/g);
                for (var line of lines) {
                    if (/https?:\/\/evepraisal\.com\/e\/\d+/.test(line)) {
                        this.addEvepraisal(line);
                    } else {
                        console.log('Invalid value input.');
                    }
                }
                this.newValue = '';
            },

            /**
             * Gets data from Evepraisal and stores it locally
             * @param {String} url Valid Evepraisal URL
             */
            addEvepraisal: function(url) {

                /**
                 * @param {String} url Valid Evepraisal URL
                 * @param {Function} callbackFunction Function to be executed after the Evepraisal AJAX request succeeds
                 */
                function addEvepraisalAJAX(url, callbackFunction) {
                    $.ajax({
                        dataType: 'json',
                        url: 'https://crossorigin.me/' + url + '.json',
                        success: function(data) {
                            callbackFunction(data);
                        }
                    });
                }

                addEvepraisalAJAX(url, $.proxy(function(data) {
                    // as long as the evepraisal was taken in the permitted market
                    if (data.market_name === this.config.permittedMarket) {
                        // make a local copy of the incoming evepraisal and add a timestamp to it
                        var evepraisal = data;
                        evepraisal.importTime = Date.now();
                        // initialize arrays corresponding to that importTime in the this.ships and this.nonShips objects
                        this.ships = Object.assign({}, this.ships, {[evepraisal.importTime]: []});
                        this.nonShips = Object.assign({}, this.nonShips, {[evepraisal.importTime]: []});
                        // for each item in the new evepraisal
                        for (var item of evepraisal.items) {

                            // if the item is a ship
                            if (item.groupID in this.staticData.shipGroupIDs) {
                                var ship = item; // make a local copy to assign some new properties
                                ship.importTime = evepraisal.importTime;
                                ship.evepraisalID = evepraisal.id;
                                ship.packagedVolume = this.staticData.shipGroupIDs[ship.groupID][0];
                                ship.condition = 'packaged';
                                // add the the ship object to this.ships
                                this.ships[evepraisal.importTime].push(ship);
                            }

                            // if the item is not a ship
                            else {
                                var nonShip = item; // make a local copy to assign some new properties
                                nonShip.importTime = evepraisal.importTime;
                                nonShip.evepraisalID = evepraisal.id;
                                nonShip.mutableVolume = NaN;
                                nonShip.condition = 'unpackaged';
                                // add the nonShip object to this.nonShips
                                this.nonShips[evepraisal.importTime].push(nonShip);
                            }
                        }
                        // add the modified evepraisal to this.evepraisals
                        this.evepraisals.push(evepraisal);
                    }
                }, this));

            },

            /**
             * Removes all objects associated with a passed Evepraisal from this.ships, this.nonShips and this.evepraisals
             * @param {Object} evepraisal
             * @param {Integer} evepraisal.importTime
             */
            removeEvepraisal: function(evepraisal) {
                // set up local objects to store the objects we DON'T want to delete
                var remainingShips = {};
                var remainingNonShips = {};

                // loop through the timestamp keys in this.ship
                for (var shipImportTime in this.ships) {
                    shipImportTime = parseInt(shipImportTime); // convert string to number
                    // if the loop timestamp doesn't match the timestamp of the passed evepraisal
                    if (shipImportTime !== evepraisal.importTime) {
                        // stick the loop timestamp's object into the local object to keep
                        remainingShips[shipImportTime] = this.ships[shipImportTime];
                    }
                }
                // loop through the timestamp keys in this.nonShip
                for (var nonShipImportTime in this.nonShips) {
                    nonShipImportTime = parseInt(nonShipImportTime); // convert string to number
                    // if the loop timestamp doesn't match the timestamp of the passed evepraisal
                    if (nonShipImportTime !== evepraisal.importTime) {
                        // stick the loop timestamp's object into the local object to keep
                        remainingNonShips[nonShipImportTime] = this.nonShips[nonShipImportTime];
                    }
                }

                // overwrite the storage objects with our local objects
                this.ships = Object.assign(remainingShips);
                this.nonShips = Object.assign(remainingNonShips);

                // remove the evepraisal from storage as well
                this.evepraisals.$remove(evepraisal);
            },

            /**
             * @param {Object} item
             * @param {Object} item.prices
             * @param {Float} item.prices.buy.min
             * @param {Float} item.prices.sell.min
             * @param {Integer} item.quantity
             * @returns {Float} Collateral needed for the item, based on its price
             */
            itemCollateral: function(item) {
                // if the item has prices (handles Evepraisal's stubs from parsing errors)
                if (item.prices) {

                    // save basic properties as local variables
                    var buy = parseFloat(item.prices.buy.min);
                    var sell = parseFloat(item.prices.sell.min);
                    var qty = parseFloat(item.quantity);

                    // calculate the collateral based on the settings in the config file
                    if (this.config.collateral === 'buy') {
                        return buy * qty;
                    } else if (this.config.collateral === 'sell') {
                        return sell * qty;
                    } else if (this.config.collateral === 'avg') {
                        return ((buy + sell) / 2.0) * qty;
                    } else {
                        console.log('config.collateral contains a bad value');
                    }
                }

                // if the item doesn't have prices, assume zero collateral
                else {
                    return 0;
                }
            },

            /**
             * @param {Array} items
             * @returns {Float} Total collateral needed for the array of items, based on their prices
             */
            itemsCollateral: function(items) {
                collaterals = [];
                for (var item of items) {
                    collaterals.push(this.itemCollateral(item));
                }
                var totalCollateral = collaterals.reduce((a, b) => a + b);
                return totalCollateral || 0;
            },

            /**
             * @param {Object} item
             * @param {String} item.condition
             * @param {Float} item.packagedVolume
             * @param {Float} item.volume
             * @returns {Float} Volume of the item, based on its condition (packaged/unpackaged)
             */
            itemVolume: function(item) {
                if (item.condition === 'packaged') {
                    return item.packagedVolume || 0;
                }
                else if (item.condition === 'unpackaged') {
                    return item.volume || 0;
                }
                else {
                    console.log('bad item.condition found: ' + JSON.stringify(item.condition));
                    return 0;
                }
            },

            /**
             * @param {Array} items
             * @returns {Float} Total volume of the array of items, based on their conditions (packaged/unpackaged)
             */
            itemsVolume: function(items) {
                var volumes = [];
                for (var item of items) {
                    volumes.push(this.itemVolume(item));
                }
                var totalVolume = volumes.reduce((a, b) => a + b);
                return totalVolume || 0;
            },

            /**
             * @param {Object} item
             * @return {Float} Reward needed for the item, based on its collateral and volume
             */
            itemReward: function(item) {
                var volumeComponent = this.itemVolume(item) * (this.config.reward.fullDstPrice / 60000);
                var collateralComponent = this.itemCollateral(item) * this.config.reward.percentOfCollateral;
                return volumeComponent + collateralComponent;
            },

            /**
             * @param {Array} items
             * @return {Float} Total reward needed for the array of items, based on their collaterals and volumes
             */
            itemsReward: function(items) {
                var rewards = [];
                for (var item of items) {
                    rewards.push(this.itemReward(item));
                }
                var totalReward = rewards.reduce((a, b) => a + b);
                return totalReward || 0;
            },

        },


    }); // end of app definition

})(window);
