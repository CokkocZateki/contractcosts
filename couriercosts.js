

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

            volume: function() {
                var volumes = [];
                // var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    for (var item of evepraisal.items) {
                        if (item.groupID) {
                            if (item.groupID in this.config.shipGroupIDs) {
                                volumes.push(this.config.shipGroupIDs[item.groupID][0]);
                            } else {
                                volumes.push(parseFloat(item.volume));
                            }
                        }
                    }
                }
                console.log(volumes);
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
                        // for each item in the new evepraisal
                        for (var item of data.items) {
                            // if the item is a ship
                            if (item.groupID in this.config.shipGroupIDs) {
                                console.log('ship: ' + item.name);
                                var ship = item;
                                // set new property 'mutableVolume' on ship
                                // object to packaged volume
                                ship.mutableVolume = this.config.shipGroupIDs[ship.groupID][0];
                                // set new evepraisalId property
                                ship.evepraisalId = data.id;
                                // add the the ship object to the ships structure
                                this.ships.push(ship);
                            } else {
                                console.log('non ship: ' + item.name);
                                var nonShip = item;
                                // set new property 'mutableVolume' on nonShip
                                // object to unpackaged volume
                                nonShip.mutableVolume = parseFloat(item.volume);
                                // set new evepraisalId property
                                nonShip.evepraisalId = data.id;
                                // add the nonShip object to the nonShips structure
                                this.nonShips.push(nonShip);
                            }
                        }
                        this.evepraisals.push(data);
                    }
                }, this));

            },

            removeEvepraisal: function(evepraisal) {
                var id = evepraisal.id;
                var remainingShips = [];
                var remainingNonShips = [];
                for (var ship of this.ships) {
                    if (ship.evepraisalId !== evepraisal.id) {
                        remainingShips.push(ship);
                    }
                }
                for (var nonShip of this.nonShips) {
                    if (nonShip.evepraisalId !== evepraisal.id) {
                        remainingNonShips.push(nonShip);
                    }
                }
                // this.ships = Object.assign({}, remainingShips);
                // this.nonShips = Object.assign({}, remainingNonShips);
                this.ships = remainingShips;
                this.nonShips = remainingNonShips;
                this.evepraisals.$remove(evepraisal);
            },

            // package: function(item) {
            //     if (!(item.groupID in this.config.shipGroupIDs)) {
            //         return;
            //     }
            // }

        },


    }); // end of app definition

})(window);
