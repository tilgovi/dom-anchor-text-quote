Text Quote Anchor
=================

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![NPM Package](https://img.shields.io/npm/v/dom-anchor-text-quote.svg)](https://www.npmjs.com/package/dom-anchor-text-quote)
[![Build Status](https://travis-ci.org/hypothesis/dom-anchor-text-quote.svg?branch=master)](https://travis-ci.org/hypothesis/dom-anchor-text-quote)
[![Coverage Status](https://coveralls.io/repos/hypothesis/dom-anchor-text-quote/badge.svg?branch=master)](https://coveralls.io/r/hypothesis/dom-anchor-text-quote?branch=master)

This library offers conversion between a DOM `Range` instance and a text
quote selector as defined by the Web Annotation Data Model.

For more information on `Range` see
[the documentation](https://developer.mozilla.org/en-US/docs/Web/API/Range).

For more information on the fragment selector see
[the specification](http://www.w3.org/TR/annotation-model/#text-quote-selector).

Installation
============

There are a few different ways to include the library.

With a CommonJS bundler, to `require('dom-anchor-text-quote')`:

    npm install dom-anchor-text-quote

With a script tag, include one of the scripts from the `dist` directory.

With AMD loaders, these scripts should also work.

Usage
=====


## API Documentation

The module exposes a single constructor function, `TextQuoteAnchor`.

### `new TextQuoteAnchor(root, exact, [context])`

This constructor creates a new `TextQuoteAnchor`. The first argument is the
context for anchor, the `Element` that contains the quote. The second argument
is the `String` that the anchor selects. An optional argument, `context`, may
have one or both of the keys `prefix` and `suffix` that may help anchor and
disambiguate the quote.

### `TextQuoteAnchor.fromRange(root, range)`

Provided with an existing `Range` instance this will return a
`TextQuoteAnchor` that stores the exact text selected by the range and
surrounding context (up to thirty-two characters in either direction)
within the text content of the `root` `Element`.

### `TextQuoteAnchor.fromSelector(root, selector)`

Provided with an `Object` containing an `exact` key and, optionally, one or
both of the keys `prefix` and `suffix` this will return a `TextQuoteAnchor`
that corresponds to these strings within the text content of the `root`
`Element`.

### `TextQuoteAnchor.fromPositionAnchor(anchor)`

Provided with a `TextPositionAnchor` this will return a `TextQuoteAnchor` that
stores the exact text selected by the `TextPositionAnchor` and surrounding
context (up to thirty-two characters in either direction).

See the documentation for [dom-anchor-text-position](https://github.com/hypothesis/dom-anchor-text-position)
for details on `TextPositionAnchor`.

### `TextQuoteAnchor.prototype.toRange([options])`

This method returns a `Range` object that selects the text of the anchor. It
uses the context, if available, to disambiguate between multiple matches. This
method may return a close match rather than an exact match.

If the `options` argument is an `Object` with an integer valued `hint` key
then the quote search will prioritize matches that are closer this offset
over equivalent matches that are farther away.

### `TextQuoteAnchor.prototype.toSelector()`

This method returns an `Object` that has the key `exact` with a `String` value
that represents the selected text quote. It may one or both of the keys
`prefix` and `suffix` if that context is available.

### `TextQuoteAnchor.prototype.toPositionAnchor()`

This method returns a `TextPositionAnchor` that selects the text of the anchor
by text position. It uses the context, if available, to disambiguate between
multiple matches. This method may return a close match rather than an exact
match.

See the documentation for [dom-anchor-text-position](https://github.com/hypothesis/dom-anchor-text-position)
for details on `TextPositionAnchor`.
