Text Quote Anchor
=================

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![NPM Package](https://img.shields.io/npm/v/dom-anchor-text-quote.svg)](https://www.npmjs.com/package/dom-anchor-text-quote)
[![Build Status](https://travis-ci.org/tilgovi/dom-anchor-text-quote.svg?branch=master)](https://travis-ci.org/tilgovi/dom-anchor-text-quote)
[![Coverage Status](https://img.shields.io/codecov/c/github/tilgovi/dom-anchor-text-quote/master.svg)](https://codecov.io/gh/tilgovi/dom-anchor-text-quote)

Convert between DOM `Range` instances and `TextQuoteSelector` instances;
or between `TextPositionSelector` instances and `TextQuoteSeletor` instances.

For more information on `Range` see
[the documentation](https://developer.mozilla.org/en-US/docs/Web/API/Range).

For more information on `TextPositionSelector` see
[the specification](http://www.w3.org/TR/annotation-model/#text-position-selector).

For more information on `TextQuoteSelector` see
[the specification](http://www.w3.org/TR/annotation-model/#text-quote-selector).

Installation
============

To `require('dom-anchor-text-quote')`:

    npm install dom-anchor-text-quote

Usage
=====

## API Documentation

### `fromRange(root, range)`

This function is a short-hand for the following equivalent code:

``` js
import * as textPosition from 'dom-anchor-text-position'
import * as textQuote from 'dom-anchor-text-quote'

let position = textPosition.fromRange(root, range)
let selector = textQuote.fromTextPosition(root, position)
```

The return value is an `Object` with `exact`, `prefix` and `suffix` keys.

### `fromTextPosition(root, selector)`

Given an `Object` containing `start` and `end` keys, returns an `Object`
containing the sub-string `[start, end)` of the text content of `root` `Node`
in the value of the `exact` key and surrounding context (up to thirty-two
characters in either direction) in the `prefix` and `suffix` keys.

The resulting `Object` is a text position selector suitable for use with the
`dom-anchor-text-position` library. See the documentation of
[dom-anchor-text-position](https://github.com/tilgovi/dom-anchor-text-position)
for details.

### `toRange(root, [options])`

This function is a short-hand for the following equivalent code:

``` js
import * as textPosition from 'dom-anchor-text-position'
import * as textQuote from 'dom-anchor-text-quote'

let position = textQuote.toTextPosition(root, selector)
let range = textPosition.toRange(position)
```

The return value is a `Range` instance.

### `toTextPosition(root, selector, options)`

Given an `Object` `selector` with an `exact` key, returns an `Object` with
keys `start` and `end`. The sub-string `[start, end)` of the text content of
the `root` `Node` is an approximate match for the value of the `exact` key.
Optional `selector` keys `prefix` and `suffix`, if provided, are used to
disambiguate between multiple matches.

If the `options` argument is an `Object` with an integer valued `hint` key
then the quote search will prioritize matches that are closer to this offset
over equivalent matches that are farther away.
