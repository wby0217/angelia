/**
 *BubbleView.js
 */
'use strict';
var React = require('react');
var {
} = React;
var {
 View,
 requireNativeComponent,
} = require('react-native');
const PropTypes = require('prop-types');
var BubbleTextView = requireNativeComponent('BubbleView', BubbleView);
const createReactClass = require('create-react-class');
var BubbleView = createReactClass({

  propTypes: {
    ...View.propTypes,
    text: PropTypes.string,
    type: PropTypes.bool,
  },

  render() {
    return (
      <BubbleTextView {...this.props}/>
    );
  },
});

module.exports = BubbleView;
