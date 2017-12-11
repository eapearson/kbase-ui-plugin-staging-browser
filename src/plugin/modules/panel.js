define([
    'knockout-plus',
    'kb_common/html',
    './lib/utils'
], function (
    ko,
    html,
    utils
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;

        function attach(node) {
            hostNode = node;
            container= hostNode.appendChild(document.createElement('div'));
            container.style.flex = '1 1 0px';
            container.style.display = 'flex';
            container.style['flex-direction'] = 'column';
        }

        function start(params) {
            runtime.send('ui', 'setTitle', 'Staging Browser');
            container.innerHTML = utils.komponent({
                name: 'staging-browser/main',
                params: {
                    runtime: 'runtime'
                }
            });
            ko.applyBindings({
                runtime: runtime
            }, container);
        }

        function stop() {
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return Object.freeze({
            attach: attach, 
            start: start, 
            stop: stop,
            detach: detach
        }); 
    }

    return ({
        make: factory
    });
});