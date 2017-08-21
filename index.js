'use strict';

const path     = require('path');
const fs       = require('fs');
const _        = require('lodash');
const Sort     = require('topo-sort');
const defaults = require('defaults');

module.exports = function(config) {

    config = defaults(config, {
        fractal: false,
        components: false,
        tag: false,
        prependComponents: [],
        appendComponents: [],
        sortAssets: []
    });

    if (!config.fractal) {
        throw new Error('You must pass a Fractal instance as part of the configuration.');
    }

    /*
    Get all dependencies for a component list.
    If a component list is not specified, all components are returned.
    */
    var tag = config.tag;
    var objects = [];
    var dependencies = {
        components: config.components || []
    };

    return config.fractal.components.load().then(() => {

        // if components array has no length, all components must be exported
        if( !dependencies.components.length ) {
            for( var item of config.fractal.components.flatten() ) {
                if( (tag && item.hasTag(tag)) || !tag ) {
                    dependencies.components.push(item.handle);
                }
            }
        } else {
            dependencies.components = _.union(dependencies.components, config.prependComponents, config.appendComponents);
        }

        for( var i = 0; i < dependencies.components.length; i++ ) {
            var item = config.fractal.components.find('@' + dependencies.components[i]);

            if( item ) {
                var obj = {
                    name: item.handle,
                    deps: getComponentDependencies(item),
                    assets: getComponentAssets(item)
                }

                if( obj.deps ) {
                    for( var key in obj.deps ) {
                        if( obj.deps.hasOwnProperty(key) ) {
                            if( !dependencies.hasOwnProperty(key) ) dependencies[key] = [];

                            for( var j = 0; j < obj.deps[key].length; j++ ) {
                                if( dependencies[key].indexOf(obj.deps[key][j]) == -1 ) {
                                    dependencies[key].push(obj.deps[key][j]);
                                }
                            }
                        }
                    }
                }

                objects.push(obj);
            }
        }

        dependencies.components = getSortedComponents(objects);
        dependencies.paths = getSortedPaths(objects, dependencies.components);

        return dependencies;
    });

    /*
    Sort components by dependencies.
    */
    function getSortedComponents(components) {
        var tsort = new Sort();

        for( var i = 0; i < components.length; i++ ) {
            tsort.add(components[i].name, components[i].deps.components || []);
        }

        return _.union(config.prependComponents, _.difference(tsort.sort().reverse(), config.appendComponents), config.appendComponents);
    }

    function getSortedPaths(components, sortedComponents) {
        var sortedPaths = {};

        for( var i = 0; i < sortedComponents.length; i++ ) {
            var comp = components.find(x => x.name === sortedComponents[i]);
            if( comp && comp.assets ) {
                for( var key in comp.assets ) {
                    if( comp.assets.hasOwnProperty(key) ) {
                        if( !sortedPaths.hasOwnProperty(key) ) sortedPaths[key] = [];

                        sortedPaths[key].push(comp.assets[key]);
                    }
                }
            }
        }

        return sortedPaths;
    }

    /*
    Get the dependency object from a component config file.
    */
    function getComponentDependencies(item) {
        var config = item.configData;

        if( config && typeof config.dependencies !== "undefined" ) {
            return config.dependencies;
        } else {
            return false;
        }
    }

    /*
    Get a list of assets for a component.
    */
    function getComponentAssets(item) {
        var paths = {};

        if( item ) {
            for( var i = 0; i < config.sortAssets.length; i++ ) {
                var assetPath = path.join( item.viewDir, item.name + '.' + config.sortAssets[i]);
                if( fs.existsSync(assetPath) ) {
                    paths[config.sortAssets[i]] = assetPath;
                }
            }
            return paths;
        } else {
            return false;
        }
    }
}
