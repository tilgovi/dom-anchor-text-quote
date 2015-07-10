Text Position Anchor
====================

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

With a CommonJS bundler to `require('dom-anchor-text-quote')`:

    npm install dom-anchor-text-quote

With a script tag, include one of the scripts from the `dist` directory.

With AMD loaders, these scripts should also work.

Usage
=====

The module exposes a single constructor function, `TextQuoteAnchor`.

## `new TextQuoteAnchor(exact, [prefix], [suffix])`

## `TextQuoteAnchor.fromRange(range)`

## `TextQuoteAnchor.fromSelector(selector)`

## `TextQuoteAnchor.prototype.toRange()`

## `TextQuoteAnchor.prototype.toSelector()`
