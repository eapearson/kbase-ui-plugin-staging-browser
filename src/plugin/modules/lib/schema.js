define([

], function () {

    var columns = [
        {
            name: 'name',
            label: 'Name',
            type: 'string',
            width: 50,
            sort: {
                enabled: true
            }
        },
        // {
        //     name: 'path',
        //     label: 'Path',
        //     type: 'string',
        //     width: 20
        // },
        {
            name: 'mtime',
            label: 'Date',
            type: 'date',
            format: 'elapsed',
            width: 20,
            sort: {
                enabled: true
            }
        },   
        {
            name: 'size',
            label: 'Size',
            type: 'number',
            format: '0b',
            width: 20,
            sort: {
                enabled: true
            }
        },
        {
            name: 'isFolder',
            label: 'Folder?',
            type: 'boolean',
            width: 20,
            sort: {
                enabled: true,
                fun: function (a, b) {
                    if (a && !b) {
                        return -1;
                    }
                    if (!a && b) {
                        return 1;
                    }
                    return 0;
                }
            }
        }           
    ];

    var columnsMap = columns.reduce(function (acc, col) {
        acc[col.name] = col;
        return acc;
    }, {});

    return {
        columns: columns,
        columnsMap: columnsMap
    };
});