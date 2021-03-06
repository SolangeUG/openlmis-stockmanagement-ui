/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function () {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-products.StockProductsRepositoryImpl
     *
     * @description
     * Implementation of the StockProductsRepository interface
     */
    angular
        .module('stock-products')
        .factory('StockProductsRepositoryImpl', StockProductsRepositoryImpl);

    StockProductsRepositoryImpl.$inject = ['LotRepositoryImpl', 'StockCardSummaryRepository',
        'StockCardSummaryRepositoryImpl', 'SEARCH_OPTIONS', 'Identifiable'];

    function StockProductsRepositoryImpl(LotRepositoryImpl, StockCardSummaryRepository,
        StockCardSummaryRepositoryImpl, SEARCH_OPTIONS, Identifiable) {

        StockProductsRepositoryImpl.prototype.findAvailableStockProducts = findAvailableStockProducts;

        return StockProductsRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-products.StockProductsRepositoryImpl
         * @name StockProductsRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the StockProductsRepositoryImpl class.
         */
        function StockProductsRepositoryImpl() {
            this.stockCardSummaryRepository = new StockCardSummaryRepository(
                new StockCardSummaryRepositoryImpl());
            this.lotRepositoryImpl = new LotRepositoryImpl();
        }

        /**
         * @ngdoc method
         * @methodOf stock-products.StockProductsRepositoryImpl
         * @name findAvailableStockProducts
         *
         * @description
         * Finds stock card summaries by facility and program and transform to Stock Products.
         *
         * @param {String}          programId        a program id of stock card.
         * @param {String}          facilityId       a facility id of stock card.
         * @param {String}          searchOption     a search option.
         * @returns {Promise} a promise of available stock products.
         */
        function findAvailableStockProducts(programId, facilityId, searchOption) {
            var lotRepository = this.lotRepositoryImpl;
            return this.stockCardSummaryRepository
            .query({
                programId: programId,
                facilityId: facilityId
            })
            .then(function (page) {
                return createStockProductsFromStockCardSummaries(page.content, searchOption, lotRepository);
            });
        }

        function createStockProductsFromStockCardSummaries(cards, searchOption, lotRepository) {
            var items = [];
            cards.forEach(function (card) {
                addItemsFromCanFulfillForMe(items, card.canFulfillForMe);
                if (searchOption === SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES) {
                    var item = getItemForApprovedProductWithoutLot(card);
                    addIfNotExistsAlready(items, item);
                }
            });

            if (searchOption === SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES) {
                var tradeItemIds = getTradeItemIds(cards);
                if (tradeItemIds.length) {
                    return lotRepository.query({
                        tradeItemId: tradeItemIds
                    }).then(function (lotPage) {
                        cards.forEach(function (card) {
                            addApprovedProcuctWithLot(items, card, lotPage);
                        });
                        return items;
                    });
                }
            }
            return items;
        }

        function addApprovedProcuctWithLot(items, card, lotPage) {
            if (card.orderable.identifiers.tradeItem) {
                var item = getItemForApprovedProductWithLot(card, lotPage.content);
                addIfNotExistsAlready(items, item);
            }
        }
        

        function addItemsFromCanFulfillForMe(items, canFulfillForMe) {
            canFulfillForMe.forEach(function (fulfill) {
                var item = angular.copy(fulfill);
                addIfNotExistsAlready(items, item);
            });
        }

        function addIfNotExistsAlready(list, item) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].orderable.id === item.orderable.id && lotsEqual(list[i].lot, item.lot)) {
                    return;
                }
            }
            list.push(item);
        }

        function lotsEqual(item1, item2) {
            if (!item1 && !item2) {
                return true;
            } else if (!item1) {
                return false;
            } else {
                return new Identifiable(item1).isEqual(item2);
            }
        }

        function getItemForApprovedProductWithoutLot(card) {
            var item = angular.copy(card);
            delete item.canFulfillForMe;
            return item;
        }

        function getItemForApprovedProductWithLot(card, lots) {
            var item = angular.copy(card);
            item.lot = getLotForTradeItem(lots, card.orderable.identifiers.tradeItem);
            return item;
        }

        function getTradeItemIds(cards) {
            var items = [];
            cards.forEach(function (card) {
                if (card.orderable.identifiers.tradeItem) {
                    items.push(card.orderable.identifiers.tradeItem);
                }
            });
            return items;
        }

        function getLotForTradeItem(lots, tradeItemId) {
            return lots.filter(function(lot) {
                return tradeItemId === lot.tradeItemId;
            })[0];
        }
    }

})();
