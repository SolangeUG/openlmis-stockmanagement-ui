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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-card-summaries.StockCardSummaryDeprecated
     *
     * @description
     * Represents a single stock card summary.
     */
    angular
        .module('stock-card-summaries')
        .factory('StockCardSummaryDeprecated', StockCardSummaryDeprecated);

    function StockCardSummaryDeprecated() {

        return StockCardSummaryDeprecated;

        /**
         * @ngdoc method
         * @methodOf stock-card-summaries.StockCardSummaryDeprecated
         * @name StockCardSummaryDeprecated
         *
         * @description
         * Creates a new instance of the StockCardSummaryDeprecated class.
         *
         * @param  {Orderable}  orderable       the orderable of the StockCardSummary
         * @param  {Number}     stockOnHand     the stockOnHand of the StockCardSummary
         * @param  {Object}     lot             the lot of the StockCardSummary
         * @param  {Object}     extraData       the extraData of the StockCardSummary
         * @return {StockCardSummary}           the StockCardSummary object
         */
        function StockCardSummaryDeprecated(orderable, stockOnHand, lot, extraData) {
            this.orderable = orderable;
            this.stockOnHand = stockOnHand;
            this.lot = lot;
            this.extraData = extraData;
        }

    }

})();
