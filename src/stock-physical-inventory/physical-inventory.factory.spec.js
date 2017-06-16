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

describe('physicalInventoryService', function() {

    var $q, $rootScope, physicalInventoryService, physicalInventoryFactory, SEARCH_OPTIONS,
        summaries, drafts;

    beforeEach(function() {
        module('stock-physical-inventory', function($provide) {
            physicalInventoryService = jasmine.createSpyObj('physicalInventoryService', ['getDraft']);
            $provide.factory('physicalInventoryService', function() {
                return physicalInventoryService;
            });

            stockCardSummariesService = jasmine.createSpyObj('stockCardSummariesService', ['getStockCardSummaries']);
            $provide.factory('stockCardSummariesService', function() {
                return stockCardSummariesService;
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            physicalInventoryFactory = $injector.get('physicalInventoryFactory');
            SEARCH_OPTIONS = $injector.get('SEARCH_OPTIONS');
        });

        summaries = [
            {
                stockOnHand: 1,
                lot: {
                    expirationDate: '2017-06-12'
                },
                orderable: {
                    code: 'orderable-code-1',
                    name: 'orderable-name-1'
                },
            },
            {
                stockOnHand: 2,
                lot: {
                    expirationDate: '2016-06-12'
                },
                orderable: {
                    code: 'orderable-code-2',
                    name: 'orderable-name-2'
                }
            }
        ];
        drafts = [
            {
                quantity: 3,
                extraData: {
                    vvmStatus: 'STAGE_1'
                },
                $status: 200
            },
            {
                quantity: 4,
                $status: 200
            },
        ];

        stockCardSummariesService.getStockCardSummaries.andReturn($q.when(summaries));
        physicalInventoryService.getDraft.andReturn($q.when(drafts[0]));
    });

    describe('init', function() {
        it('should expose getDraft method', function() {
            expect(angular.isFunction(physicalInventoryFactory.getDraft)).toBe(true);
        });

        it('should expose getDrafts method', function() {
            expect(angular.isFunction(physicalInventoryFactory.getDrafts)).toBe(true);
        });
    });

    describe('getDraft', function() {
        var programId,
            facilityId;

        beforeEach(function() {
            programId = 'program-id';
            facilityId = 'facility-id';
        });

        it('should return promise', function() {
            var result = physicalInventoryFactory.getDraft(programId, facilityId);
            expect(result.then).not.toBeUndefined();
            expect(angular.isFunction(result.then)).toBe(true);
        });

        it('should call stockCardSummariesService', function() {
            physicalInventoryFactory.getDraft(programId, facilityId);
            expect(stockCardSummariesService.getStockCardSummaries).toHaveBeenCalledWith(programId, facilityId, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);
        });

        it('should call physicalInventoryService', function() {
            physicalInventoryFactory.getDraft(programId, facilityId);
            expect(physicalInventoryService.getDraft).toHaveBeenCalledWith(programId, facilityId);
        });

        it('should get proper response when draft was saved', function() {
            var draft;

            physicalInventoryService.getDraft.andReturn($q.when(drafts[0]));

            physicalInventoryFactory.getDraft(programId, facilityId).then(function(response) {
                draft = response;
            });
            $rootScope.$apply();

            expect(draft.programId).toEqual(programId);
            expect(draft.facilityId).toEqual(facilityId);
            angular.forEach(draft.lineItems, function(lineItem, index) {
                expect(lineItem.stockOnHand).toEqual(summaries[index].stockOnHand);
                expect(lineItem.lot).toEqual(summaries[index].lot);
                expect(lineItem.orderable).toEqual(summaries[index].orderable);
                expect(lineItem.quantity).toEqual(summaries[index].quantity);
            });
        });

        it('should get proper response when draft was not saved', function() {
            var draft;

            physicalInventoryService.getDraft.andReturn($q.when({$status: 204}));

            physicalInventoryFactory.getDraft(programId, facilityId).then(function(response) {
                draft = response;
            });
            $rootScope.$apply();

            expect(draft.programId).toEqual(programId);
            expect(draft.facilityId).toEqual(facilityId);
            angular.forEach(draft.lineItems, function(lineItem, index) {
                expect(lineItem.stockOnHand).toEqual(summaries[index].stockOnHand);
                expect(lineItem.lot).toEqual(summaries[index].lot);
                expect(lineItem.orderable).toEqual(summaries[index].orderable);
                expect(lineItem.quantity).toEqual(summaries[index].quantity);
            });
        });
    });
});
