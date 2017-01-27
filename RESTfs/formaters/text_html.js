'use strict';

/**
 * Formats Arrays into HTML List Elements
 *
 * @param {array} array
 * @returns {string} HTML List Elements
 */
function formatArray (array) {
    var html = '<ul>';

    array.forEach(value => {
        html += '<li>' + formatValue(value) + '</li>';
    });

    return html + '</ul>';
}

/**
 * Formats every Object into HTML Table Elements
 *
 * @param {object} object
 * @returns {string} HTML Table Elements
 */
function formatObject (object) {
    var properties = Object.getOwnPropertyNames(object);
    var html = '<table>';

    properties.forEach(property => {
        html += '<tr><td>'+property+'</td><td>' + formatValue(object[property]) + '</td></tr>';
    });

    return html + '</table>';
}

/**
 * Formats any value into an HTML representation:
 *   - Arrays into HTML List Elements
 *   - Objects into HTML Table Elements
 *   - other primitives into text values
 *     replaces
 *
 * @param value
 * @returns {string} HTML List/Table Elements or a simple text value
 */
function formatValue(value) {

    if (value) {
        if (value.constructor === Array) {
            return formatArray(value);
        } else if (typeof value === 'object' && value !== null) {
            return formatObject(value);
        }

        return value.toString().replace(/(\n\r|\r|\n)/g, '<br>').replace(/\t/g, '&nbsp&nbsp&nbsp&nbsp').replace(/\s/g, '&nbsp');
    } else {
        return value;
    }
}

module.exports = {
    mimetypes: ['text/html'],
    transform: function html(data) {
        if (data) {
            return '<!DOCTYPE html><head><meta charset="utf-8"></head><body>' +
                formatValue(data) +
                '</body></html>';
        }

        return null;
    }
};
