define([
    'kb_common/html',
], function (
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        style = t('style');

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function (key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }   

    function koSwitch(value, cases) {
        return [
            '<!-- ko switch: ' + value + ' -->',
            cases.map(function (caseSpec) {
                var caseValue;
                if (typeof caseSpec[0] === 'string') {
                    caseValue = '"' + caseSpec[0] + '"';
                }
                return [
                    '<!-- ko case: ' + caseValue + ' -->',
                    caseSpec[1],
                    '<!-- /ko -->'
                ];
            }),
            '<!-- /ko -->'
        ];
    }


    function StagingBrowserError(code, message, detail, info) {
        this.code = code;
        this.message = message;
        this.detail = detail;
        this.info = info;
    }
    StagingBrowserError.prototype = Object.create(Error.prototype);
    StagingBrowserError.prototype.constructor = StagingBrowserError;
    StagingBrowserError.prototype.name = 'StagingBrowserError';

    return {
        komponent: komponent,
        koSwitch: koSwitch,
        StagingBrowserError: StagingBrowserError
    };
});
