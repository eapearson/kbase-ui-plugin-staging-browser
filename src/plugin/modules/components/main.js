define([
    'knockout-plus',
    'kb_common/html',
    '../lib/utils',
    '../lib/data',
    '../lib/schema'
], function(
    ko,
    html,
    utils,
    Data,
    schema
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function viewModel(params) {
        var runtime = params.runtime;
        var data = Data.make({runtime: runtime});

        // OVERLAY

        // The overlayComponent is passed directly to the overlay panel.
        // Updating this overvable will cause the overlay panel to show the 
        // specified component.
        var overlayComponent = ko.observable();
        var showOverlay = ko.observable();
        showOverlay.subscribe(function (newValue) {
            // if a good component...
            overlayComponent(newValue);
        });

        // SEARCH
        var searchInput = ko.observable();
        var searchResults = ko.observableArray();
        var searchTotal = ko.observable();
        var actualSearchTotal = ko.observable();
        var searchElapsed = ko.observable();
        var searching = ko.observable();
        var page = ko.observable();
        var pageSize = ko.observable();

        // columns are copied and observables added.
        var columns = schema.columns.map(function (column) {
            var col = JSON.parse(JSON.stringify(column));
            if (!col.sort) {
                col.sort = {
                    enabled: false
                };
            }
            col.sort.active = ko.observable(false);
            return col;
        });

        // ditch?
        var userSearch = ko.observable();
        var availableRowHeight = ko.observable();

        // Computeds
        var searchQuery = ko.pureComputed(function () {
            return searchInput();
        });

        var searchParams = ko.pureComputed(function () {
            return {
                query: searchQuery(),
                page: page(),
                pageSize: pageSize()
            };
        });

        var searchState = ko.pureComputed(function () {
            // console.log('search state calc...', searching());
            if (searching()) {
                return 'inprogress';
            }

            // In the staging browser, we use filter logic.
            // I.e., always showing something, filtered, 
            // so 'none' state does not exist.
            if (!pageSize()) {
                return 'pending';
            }
            if (searchResults().length === 0) {
                return 'notfound';
            } else {
                return 'success';
            }
        });

        // Data fetch
        function fetchData() {
            if (!pageSize()) {
                return;
            }
            searching(true);
            searchResults.removeAll();
            data.listFiles(page(), pageSize())
                .then(function (result) {
                    if (result.rows.length === 0) {
                        searchTotal(0);
                        actualSearchTotal(0);
                    }
                    searchTotal(result.total);
                    actualSearchTotal(result.total);
                    result.rows.forEach(function (file) {
                        searchResults.push(file);
                    });
                })
                .catch(function (err) {
                    console.error('ERROR', err);
                })
                .finally(function () {
                    searching(false);
                });
        }

        // Subscriptions

        searchParams.subscribe(function () {
            fetchData();
        });

        searchQuery.subscribe(function () {
            // reset the page back to 1 because we do not konw if the
            // new search will extend this far.
            if (!page()) {
                page(1);
            } else if (page() > 1) {
                page(1);
            }
        });

        // The job here is to reset the page, if necessary, due to 
        // a change in page size.
        pageSize.subscribeChanged(function (newValue, oldValue) {
            // console.log('page size changed', page(), newValue, oldValue);
            var currentPage = page();

            if (!currentPage) {
                return;
            }

            var newPage = Math.floor((currentPage - 1) * oldValue / newValue) + 1;
            page(newPage);
        });

        function sortBy(data) {
            console.log('will sort...');
        }

        // INIT

        function init() {
            fetchData();
        }
        try {
            init();
        } catch (ex) {
            console.error('EXCEPTION', ex);
        }

        return {
            overlayComponent: overlayComponent,
            search: {
                // INPUTS
                searchInput: searchInput,

                // SYNTHESIZED INPUTS
                searchQuery: searchQuery,
                searchState: searchState,

                // RESULTS
                searchResults: searchResults,
                searchTotal: searchTotal,
                actualSearchTotal: actualSearchTotal,
                searchElapsed: searchElapsed,
                searching: searching,
                userSearch: userSearch,

                // Sorting
                sortBy: sortBy,

                // computed
                availableRowHeight: availableRowHeight,
                pageSize: pageSize,

                // Note, starts with 1.
                page: page,

                // refreshSearch: refreshSearch,
                showOverlay: showOverlay,
                // error: error,

                columns: columns
            }
        };
    }

    var styles = html.makeStyles({
        component: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column'
        },
        searchArea: {
            flex: '0 0 50px',
            // border: '1px red solid'
        },
        filterArea: {
            flex: '0 0 50px',
            textAlign: 'left'
            // border: '1px blue dashed'
        },
        resultArea: {
            flex: '1 1 0px',
            // border: '1px green dotted',
            display: 'flex',
            flexDirection: 'column'
        },
        activeFilterInput: {
            // fontFamily: 'monospace',
            backgroundColor: 'rgba(209, 226, 255, 1)',
            color: '#000'
        },
        modifiedFilterInput: {
            // fontFamily: 'monospace',
            backgroundColor: 'rgba(255, 245, 158, 1)',
            color: '#000'
        },
        checkboxControl: {
            borderColor: 'transparent',
            boxShadow: 'none',
            margin: '0 2px'
        }
    });

    function buildInputArea() {
        return utils.komponent({
            name: 'staging-browser/search-bar',
            params: {
                search: 'search'
            }
        });
    }
    
    function buildFilterArea() {
        return utils.komponent({
            name: 'staging-browser/filter-bar',
            params: {
                search: 'search'
            }
        });
    }

    function buildResultsArea() {
        return utils.komponent({
            name: 'staging-browser/browser',
            params: {
                search: 'search'
            }
        });
    }

    function template() {
        return div({
            class: styles.classes.component
        }, [
            styles.sheet,
            // The search input area
            div({
                class: styles.classes.searchArea
            }, buildInputArea()),
            // The search filter area
            div({
                class: styles.classes.filterArea
            }, buildFilterArea()),
            // The search results / error / message area
            div({
                class: styles.classes.resultArea
            }, [
                buildResultsArea(),
            ]),
            utils.komponent({
                name: 'generic/overlay-panel',
                params: {
                    component: 'overlayComponent'
                }
            })
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return component;
});