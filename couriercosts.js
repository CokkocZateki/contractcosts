

(function (exports) {


    exports.app = new Vue({

        // the root element that will be compiled
        el: '#couriercosts',

        // app initial state
        data: {
            config: config,
            evepraisals: [],
            nonShips: [],
            ships: [],
            newValue: '',
        },

        // computed properties
        computed: {

            shipsRepr: function() {
                return JSON.stringify(this.ships);
            },

            totalEvepraisalsBuy: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.buy;
                }
                return sum;
            },

            totalEvepraisalsSell: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.sell;
                }
                return sum;
            },

            totalEvepraisalsAvg: function() {
                return (this.totalEvepraisalsBuy + this.totalEvepraisalsSell) / 2;
            },

            collateral: function() {
                if (this.config.collateral === 'buy') {
                    return this.totalEvepraisalsBuy;
                } else if (this.config.collateral === 'sell') {
                    return this.totalEvepraisalsSell;
                } else if (this.config.collateral === 'avg') {
                    return this.totalEvepraisalsAvg;
                } else {
                    console.log('config.collateral contains a bad value');
                }
            },

            reward: function() {
                return this.collateral * this.config.rewardPercent;
            },

            totalVolume: function() {
                var volumes = [];
                for (var ship of this.ships) {
                    if (ship.condition === 'packaged') {
                        volumes.push(ship.packagedVolume);
                    } else if (ship.condition === 'unpackaged') {
                        volumes.push(ship.volume);
                    } else {
                        console.log('bad value found in "ship.condition"');
                    }
                }
                for (var nonShip of this.nonShips) {
                    if (nonShip.condition === 'packaged') {
                        volumes.push(nonShip.packagedVolume || 0);
                    } else if (nonShip.condition === 'unpackaged') {
                        volumes.push(nonShip.volume || 0);
                    } else {
                        console.log('bad value found in "nonShip.condition"');
                    }
                }
                console.log(JSON.stringify(volumes));
                return volumes.reduce((a, b) => a + b, 0);
            },

        },

        // methods that implement data logic
        methods: {

            demoAddValue: function(value) {
                this.newValue = value;
                this.addValue();
            },

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

            addEvepraisal: function(url) {

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
                    // if the evepraisal was taken in the permitted market
                    if (data.market_name === this.config.permittedMarket) {
                        // Make a copy of the incoming evepraisal and add a
                        // timestamp to it
                        var evepraisal = data;
                        evepraisal.importTime = Date.now();
                        // for each item in the new evepraisal
                        for (var item of evepraisal.items) {
                            // if the item is a ship
                            if (item.groupID in this.config.shipGroupIDs) {
                                var ship = item;
                                // assign some new properties
                                ship.importTime = evepraisal.importTime;
                                ship.evepraisalID = evepraisal.id;
                                ship.packagedVolume = this.config.shipGroupIDs[ship.groupID][0];
                                ship.condition = 'packaged';
                                // add the the ship object to the ships structure
                                this.ships.push(ship);
                            } else {
                                var nonShip = item;
                                // assign some new properties
                                nonShip.importTime = evepraisal.importTime;
                                nonShip.evepraisalID = evepraisal.id;
                                nonShip.mutableVolume = NaN;
                                nonShip.condition = 'unpackaged';
                                // add the nonShip object to the nonShips structure
                                this.nonShips.push(nonShip);
                            }
                        }
                        this.evepraisals.push(data);
                    }
                }, this));

            },

            removeEvepraisal: function(evepraisal) {
                var remainingShips = [];
                var remainingNonShips = [];
                for (var ship of this.ships) {
                    if (ship.importTime !== evepraisal.importTime) {
                        remainingShips.push(ship);
                    }
                }
                for (var nonShip of this.nonShips) {
                    if (nonShip.importTime !== evepraisal.importTime) {
                        remainingNonShips.push(nonShip);
                    }
                }
                this.ships = remainingShips;
                this.nonShips = remainingNonShips;
                this.evepraisals.$remove(evepraisal);
            },

            shipVolume: function(ship) {
                if (ship.condition === 'packaged') {
                    return ship.packagedVolume;
                }
                else if (ship.condition === 'unpackaged') {
                    return ship.volume;
                }
                else {
                    console.log('bad ship.condition found');
                    return;
                }
            },
        },


    }); // end of app definition

})(window);
