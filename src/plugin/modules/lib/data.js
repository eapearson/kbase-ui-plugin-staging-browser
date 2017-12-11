define([
    'bluebird',
    'kb_common_ts/HttpClient',
    './schema'
], function (
    Promise,
    HttpClient,
    schema
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;

        var fileCache, sortedCache;

        function getListFiles() {
            var http = new HttpClient.HttpClient();
            var url = runtime.config('services.staging_service.url') + '/list';
            var token = runtime.service('session').getAuthToken();
            return http.request({
                method: 'GET',
                header: new HttpClient.HttpHeader({
                    'accept': 'application/json',
                    'authorization': token
                }),
                url: url
            })
                .then(function (result) {
                    switch (result.status) {
                    case 200:
                        fileCache = JSON.parse(result.response);
                        return [fileCache, null];                       
                    default: 
                        return [null, {
                            error: result
                        }];
                    }
                });
        }

        function sortResults(data, sortSpecs) {
            var comp, aval, bval, sortSpec, i;
            return data.sort(function (a, b) {
                for (i = 0; i < sortSpecs.length; i += 1) {
                    sortSpec = sortSpecs[i];
                    aval = a[sortSpec.name];
                    bval = b[sortSpec.name];
                    var col = schema.columnsMap[sortSpec.name];
                    if (col.sort.fun) {
                        comp = col.sort.fun(aval, bval);
                    } else {
                        comp = (aval < bval) ? -1 : ( (bval < aval) ? 1 : 0);
                    }
                    if (comp) {
                        comp = comp * (sortSpec.descending ? -1 : 1);
                        break;
                    }
                }
                return comp;
            });

        }

        function listFiles(page, pageSize) {
            page = page || 1;
            if (!pageSize) {
                throw new Error('no page size!');
            }
            var start = (page - 1) * pageSize;
            var end = start + pageSize;

            var sortSpec = [
                {
                    name: 'isFolder',
                    descending: false
                },
                {
                    name: 'mtime',
                    descending: true
                }
            ];

            return Promise.try(function() {
                if (fileCache) {
                    return [fileCache, null];
                }
                return getListFiles(start, end);
            })
                .spread(function (result, error) {
                    if (error) {
                        throw new Error(error);
                    }
                    var allData = result;

                    // do real sorting...
                    var sortedData = sortResults(allData, sortSpec);

                    var filteredData = sortedData
                        .filter(function (row, index) {
                            if (index >= start && index < end) {
                                return true;
                            }
                            return false;
                        })
                        .map(function (row) {
                            return Object.keys(row).reduce(function (acc, key) {
                                if (schema.columnsMap[key]) {
                                    acc[key] = {
                                        value: row[key]
                                    };
                                }
                                return acc;
                            }, {});
                        });
                    return {
                        total: allData.length,
                        rows: filteredData
                    };                    
                });
        }

        function listFilesx() {
            return Promise.try(function () {
                return {
                    total: 1,                    
                    rows: [{
                        name: {
                            value: 'test'
                        },
                        path: {
                            value: 'path/to/file'
                        },
                        mtime: {
                            value: 1512928561041
                        },
                        size: {
                            value: 4000
                        },
                        isFolder: {
                            value: false
                        }
                    }]};
            });
        }

        return Object.freeze({
            listFiles: listFiles
        });
    }

    return Object.freeze({
        make: factory
    });
});