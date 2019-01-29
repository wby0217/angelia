const React = require('react');
const _ = require('lodash');
const ReactNativePropRegistry = require('ReactNativePropRegistry');

module.exports = function (incomingProps, defaultProps) {
    let computedProps = {};

    incomingProps = _.clone(incomingProps);
    delete incomingProps.children;

    const incomingPropsStyle = incomingProps.style;
    delete incomingProps.style;
    

    if (incomingProps) { _.merge(computedProps, defaultProps, incomingProps); } else { computedProps = defaultProps; }
    
    if (incomingPropsStyle) {
        let computedPropsStyle = {};
        computedProps.style = {};
        if (Array.isArray(incomingPropsStyle)) {
            _.forEach(incomingPropsStyle, (style) => {
                if (typeof style === 'number') {
                    _.merge(computedPropsStyle, ReactNativePropRegistry.getByID(style));
                } else {
                    _.merge(computedPropsStyle, style);
                }
            });
        } else if (typeof incomingPropsStyle === 'number') {
            computedPropsStyle = ReactNativePropRegistry.getByID(incomingPropsStyle);
        } else {
            computedPropsStyle = incomingPropsStyle;
        }

        _.merge(computedProps.style, defaultProps.style, computedPropsStyle);
    }

    return computedProps;
};
