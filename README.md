# cottonmouth

An asset dependency sorting system for Fractal.

## usage

1. Install the package: `npm install @gtap-dev/cottonmouth --save`.
2. Require the package: `const cottonmouth = require('@gtap-dev/cottonmouth');`
3. Use it:

```
cottonmouth({
    fractal: fractal, // reference your fractal instance
    components: ['icon', 'button'], // collect dependencies for a specified set of components
    tag: 'main', // collect dependencies for all components that have this tag
    prependComponents: ['reset', 'typography'], // required components that should be prepended
    appendComponents: ['helper'], // required components that should be appended
    sortAssets: ['scss', 'js'] // asset types (extensions) that should be searched for and sorted
}
).then((dependencies) => {
    // to stuff with returned dependencies object
}
);
```
