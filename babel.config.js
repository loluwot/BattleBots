module.exports = function(api) {
    api.cache(true);

    const presets = ['@babel/preset-env'];
    const plugins = [["@babel/plugin-proposal-class-properties",
    {
      "loose": true
    }], "@babel/plugin-proposal-nullish-coalescing-operator", "@babel/plugin-syntax-optional-chaining"];

    return { presets, plugins };
};
