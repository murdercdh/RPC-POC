/**
 * Created by root on 16-2-25.
 */
var React = require('react');
var DefaultLayout = require('./layouts/default.jsx');

var HelloMessage = React.createClass({
    render: function() {
        return (
            <DefaultLayout title={this.props.title}>
                <div>Hello {this.props.name}</div>
            </DefaultLayout>
        );
    }
});

module.exports = HelloMessage;