(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'diff-match-patch', 'dom-anchor-text-position'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('diff-match-patch'), require('dom-anchor-text-position'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.DiffMatchPatch, global.TextPositionAnchor);
    global.TextQuoteAnchor = mod.exports;
  }
})(this, function (exports, module, _diffMatchPatch, _domAnchorTextPosition) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _DiffMatchPatch = _interopRequireDefault(_diffMatchPatch);

  var _TextPositionAnchor = _interopRequireDefault(_domAnchorTextPosition);

  // The DiffMatchPatch bitap has a hard 32-character pattern length limit.
  var SLICE_LENGTH = 32;
  var SLICE_RE = new RegExp('(.|[\r\n]){1,' + String(SLICE_LENGTH) + '}', 'g');
  var CONTEXT_LENGTH = SLICE_LENGTH;

  var TextQuoteAnchor = (function () {
    function TextQuoteAnchor(root, exact) {
      var context = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      _classCallCheck(this, TextQuoteAnchor);

      if (root === undefined) {
        throw new Error('missing required parameter "root"');
      }
      if (exact === undefined) {
        throw new Error('missing required parameter "exact"');
      }
      this.root = root;
      this.exact = exact;
      this.prefix = context.prefix;
      this.suffix = context.suffix;
    }

    _createClass(TextQuoteAnchor, [{
      key: 'toRange',
      value: function toRange(options) {
        return this.toPositionAnchor(options).toRange();
      }
    }, {
      key: 'toSelector',
      value: function toSelector() {
        var selector = {
          type: 'TextQuoteSelector',
          exact: this.exact
        };
        if (this.prefix !== undefined) selector.prefix = this.prefix;
        if (this.suffix !== undefined) selector.suffix = this.suffix;
        return selector;
      }
    }, {
      key: 'toPositionAnchor',
      value: function toPositionAnchor() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var hint = options.hint;

        var root = this.root;
        var dmp = new _DiffMatchPatch['default']();

        dmp.Match_Distance = root.textContent.length * 2;

        // Work around a hard limit of the DiffMatchPatch bitap implementation.
        // The search pattern must be no more than SLICE_LENGTH characters.
        var slices = this.exact.match(SLICE_RE);
        var loc = hint === undefined ? root.textContent.length / 2 | 0 : hint;
        var start = Number.POSITIVE_INFINITY;
        var end = Number.NEGATIVE_INFINITY;
        var result = -1;
        var havePrefix = this.prefix !== undefined;
        var haveSuffix = this.suffix !== undefined;
        var contextMissing = false;

        // If the prefix is known then search for that first.
        if (havePrefix) {
          result = dmp.match_main(root.textContent, this.prefix, loc);
          if (result > -1) {
            loc = result + this.prefix.length;
          } else {
            contextMissing = true;
          }
        }

        // If we have a suffix, and either a) we have no prefix, or b) the prefix
        // wasn't found, then search for it.
        if (haveSuffix && (!havePrefix || contextMissing)) {
          result = dmp.match_main(root.textContent, this.suffix, loc);
          if (result > -1) {
            loc = result - this.suffix.length - this.exact.length;
            contextMissing = false;
          } else {
            contextMissing = true;
          }
        }

        // If we had a prefix or suffix, but didn't find them, we should now be
        // pretty skeptical that the exact string is in the document.
        //
        // For strings that are likely to appear in the document simply by chance
        // (i.e. short ones), we should make the match requirements stricter in this
        // case. A match threshold of 0.25 corresponds (very roughly) to a word
        // deletion/insertion in a string of length 32 (average English word length
        // of 8) and permits no errors for strings of length < 4.
        if (contextMissing && this.exact.length < SLICE_LENGTH) {
          dmp.Match_Threshold = 0.25;
        }

        // Search for the first slice.
        var firstSlice = slices.shift();
        result = dmp.match_main(root.textContent, firstSlice, loc);
        if (result > -1) {
          start = result;
          loc = end = start + firstSlice.length;
        } else {
          throw new Error('no match found');
        }

        // Create a fold function that will reduce slices to positional extents.
        var foldSlices = function foldSlices(acc, slice) {
          var result = dmp.match_main(root.textContent, slice, acc.loc);
          if (result === -1) {
            throw new Error('no match found');
          }

          // The next slice should follow this one closely.
          acc.loc = result + slice.length;

          // Expand the start and end to a quote that includes all the slices.
          acc.start = Math.min(acc.start, result);
          acc.end = Math.max(acc.end, result + slice.length);

          return acc;
        };

        // Use the fold function to establish the full quote extents.
        // Expect the slices to be close to one another.
        // This distance is deliberately generous for now.
        dmp.Match_Distance = 64;
        var acc = slices.reduce(foldSlices, {
          start: start,
          end: end,
          loc: loc
        });

        return new _TextPositionAnchor['default'](root, acc.start, acc.end);
      }
    }], [{
      key: 'fromRange',
      value: function fromRange(root, range) {
        if (range === undefined) {
          throw new Error('missing required parameter "range"');
        }

        var position = _TextPositionAnchor['default'].fromRange(root, range);
        return this.fromPositionAnchor(position);
      }
    }, {
      key: 'fromSelector',
      value: function fromSelector(root) {
        var selector = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return new TextQuoteAnchor(root, selector.exact, selector);
      }
    }, {
      key: 'fromPositionAnchor',
      value: function fromPositionAnchor(anchor) {
        var root = anchor.root;

        var start = anchor.start;
        var end = anchor.end;

        var exact = root.textContent.substr(start, end - start);

        var prefixStart = Math.max(0, start - CONTEXT_LENGTH);
        var prefix = root.textContent.substr(prefixStart, start - prefixStart);

        var suffixEnd = Math.min(root.textContent.length, end + CONTEXT_LENGTH);
        var suffix = root.textContent.substr(end, suffixEnd - end);

        return new TextQuoteAnchor(root, exact, { prefix: prefix, suffix: suffix });
      }
    }]);

    return TextQuoteAnchor;
  })();

  module.exports = TextQuoteAnchor;
});
//# sourceMappingURL=data:application/json;base64,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eENrQixlQUFlOzs7bUJBQWYsZUFBZSIsImZpbGUiOiJUZXh0UXVvdGVBbmNob3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGlmZk1hdGNoUGF0Y2ggZnJvbSAnZGlmZi1tYXRjaC1wYXRjaCc7XG5pbXBvcnQgVGV4dFBvc2l0aW9uQW5jaG9yIGZyb20gJ2RvbS1hbmNob3ItdGV4dC1wb3NpdGlvbic7XG5cbi8vIFRoZSBEaWZmTWF0Y2hQYXRjaCBiaXRhcCBoYXMgYSBoYXJkIDMyLWNoYXJhY3RlciBwYXR0ZXJuIGxlbmd0aCBsaW1pdC5cbmNvbnN0IFNMSUNFX0xFTkdUSCA9IDMyO1xuY29uc3QgU0xJQ0VfUkUgPSBuZXcgUmVnRXhwKCcoLnxbXFxyXFxuXSl7MSwnICsgU3RyaW5nKFNMSUNFX0xFTkdUSCkgKyAnfScsICdnJyk7XG5jb25zdCBDT05URVhUX0xFTkdUSCA9IFNMSUNFX0xFTkdUSDtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0UXVvdGVBbmNob3Ige1xuICBjb25zdHJ1Y3Rvcihyb290LCBleGFjdCwgY29udGV4dCA9IHt9KSB7XG4gICAgaWYgKHJvb3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJvb3RcIicpO1xuICAgIH1cbiAgICBpZiAoZXhhY3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcImV4YWN0XCInKTtcbiAgICB9XG4gICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICB0aGlzLmV4YWN0ID0gZXhhY3Q7XG4gICAgdGhpcy5wcmVmaXggPSBjb250ZXh0LnByZWZpeDtcbiAgICB0aGlzLnN1ZmZpeCA9IGNvbnRleHQuc3VmZml4O1xuICB9XG5cbiAgc3RhdGljIGZyb21SYW5nZShyb290LCByYW5nZSkge1xuICAgIGlmIChyYW5nZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicmFuZ2VcIicpO1xuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IFRleHRQb3NpdGlvbkFuY2hvci5mcm9tUmFuZ2Uocm9vdCwgcmFuZ2UpO1xuICAgIHJldHVybiB0aGlzLmZyb21Qb3NpdGlvbkFuY2hvcihwb3NpdGlvbik7XG4gIH1cblxuICBzdGF0aWMgZnJvbVNlbGVjdG9yKHJvb3QsIHNlbGVjdG9yID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFRleHRRdW90ZUFuY2hvcihyb290LCBzZWxlY3Rvci5leGFjdCwgc2VsZWN0b3IpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Qb3NpdGlvbkFuY2hvcihhbmNob3IpIHtcbiAgICBsZXQgcm9vdCA9IGFuY2hvci5yb290O1xuXG4gICAgbGV0IHtzdGFydCwgZW5kfSA9IGFuY2hvcjtcbiAgICBsZXQgZXhhY3QgPSByb290LnRleHRDb250ZW50LnN1YnN0cihzdGFydCwgZW5kIC0gc3RhcnQpO1xuXG4gICAgbGV0IHByZWZpeFN0YXJ0ID0gTWF0aC5tYXgoMCwgc3RhcnQgLSBDT05URVhUX0xFTkdUSCk7XG4gICAgbGV0IHByZWZpeCA9IHJvb3QudGV4dENvbnRlbnQuc3Vic3RyKHByZWZpeFN0YXJ0LCBzdGFydCAtIHByZWZpeFN0YXJ0KTtcblxuICAgIGxldCBzdWZmaXhFbmQgPSBNYXRoLm1pbihyb290LnRleHRDb250ZW50Lmxlbmd0aCwgZW5kICsgQ09OVEVYVF9MRU5HVEgpO1xuICAgIGxldCBzdWZmaXggPSByb290LnRleHRDb250ZW50LnN1YnN0cihlbmQsIHN1ZmZpeEVuZCAtIGVuZCk7XG5cbiAgICByZXR1cm4gbmV3IFRleHRRdW90ZUFuY2hvcihyb290LCBleGFjdCwge3ByZWZpeCwgc3VmZml4fSk7XG4gIH1cblxuICB0b1JhbmdlKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50b1Bvc2l0aW9uQW5jaG9yKG9wdGlvbnMpLnRvUmFuZ2UoKTtcbiAgfVxuXG4gIHRvU2VsZWN0b3IoKSB7XG4gICAgbGV0IHNlbGVjdG9yID0ge1xuICAgICAgdHlwZTogJ1RleHRRdW90ZVNlbGVjdG9yJyxcbiAgICAgIGV4YWN0OiB0aGlzLmV4YWN0LFxuICAgIH07XG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHNlbGVjdG9yLnByZWZpeCA9IHRoaXMucHJlZml4O1xuICAgIGlmICh0aGlzLnN1ZmZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5zdWZmaXggPSB0aGlzLnN1ZmZpeDtcbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cblxuICB0b1Bvc2l0aW9uQW5jaG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCB7aGludH0gPSBvcHRpb25zO1xuICAgIGxldCByb290ID0gdGhpcy5yb290O1xuICAgIGxldCBkbXAgPSBuZXcgRGlmZk1hdGNoUGF0Y2goKTtcblxuICAgIGRtcC5NYXRjaF9EaXN0YW5jZSA9IHJvb3QudGV4dENvbnRlbnQubGVuZ3RoICogMjtcblxuICAgIC8vIFdvcmsgYXJvdW5kIGEgaGFyZCBsaW1pdCBvZiB0aGUgRGlmZk1hdGNoUGF0Y2ggYml0YXAgaW1wbGVtZW50YXRpb24uXG4gICAgLy8gVGhlIHNlYXJjaCBwYXR0ZXJuIG11c3QgYmUgbm8gbW9yZSB0aGFuIFNMSUNFX0xFTkdUSCBjaGFyYWN0ZXJzLlxuICAgIGxldCBzbGljZXMgPSB0aGlzLmV4YWN0Lm1hdGNoKFNMSUNFX1JFKTtcbiAgICBsZXQgbG9jID0gKGhpbnQgPT09IHVuZGVmaW5lZCkgPyAoKHJvb3QudGV4dENvbnRlbnQubGVuZ3RoIC8gMikgfCAwKSA6IGhpbnQ7XG4gICAgbGV0IHN0YXJ0ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIGxldCBlbmQgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IHJlc3VsdCA9IC0xO1xuICAgIGxldCBoYXZlUHJlZml4ID0gdGhpcy5wcmVmaXggIT09IHVuZGVmaW5lZDtcbiAgICBsZXQgaGF2ZVN1ZmZpeCA9IHRoaXMuc3VmZml4ICE9PSB1bmRlZmluZWQ7XG4gICAgbGV0IGNvbnRleHRNaXNzaW5nID0gZmFsc2U7XG5cbiAgICAvLyBJZiB0aGUgcHJlZml4IGlzIGtub3duIHRoZW4gc2VhcmNoIGZvciB0aGF0IGZpcnN0LlxuICAgIGlmIChoYXZlUHJlZml4KSB7XG4gICAgICByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCB0aGlzLnByZWZpeCwgbG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPiAtMSkge1xuICAgICAgICBsb2MgPSByZXN1bHQgKyB0aGlzLnByZWZpeC5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0TWlzc2luZyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHN1ZmZpeCwgYW5kIGVpdGhlciBhKSB3ZSBoYXZlIG5vIHByZWZpeCwgb3IgYikgdGhlIHByZWZpeFxuICAgIC8vIHdhc24ndCBmb3VuZCwgdGhlbiBzZWFyY2ggZm9yIGl0LlxuICAgIGlmIChoYXZlU3VmZml4ICYmICghaGF2ZVByZWZpeCB8fCBjb250ZXh0TWlzc2luZykpIHtcbiAgICAgIHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHRoaXMuc3VmZml4LCBsb2MpO1xuICAgICAgaWYgKHJlc3VsdCA+IC0xKSB7XG4gICAgICAgIGxvYyA9IHJlc3VsdCAtIHRoaXMuc3VmZml4Lmxlbmd0aCAtIHRoaXMuZXhhY3QubGVuZ3RoO1xuICAgICAgICBjb250ZXh0TWlzc2luZyA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dE1pc3NpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIGhhZCBhIHByZWZpeCBvciBzdWZmaXgsIGJ1dCBkaWRuJ3QgZmluZCB0aGVtLCB3ZSBzaG91bGQgbm93IGJlXG4gICAgLy8gcHJldHR5IHNrZXB0aWNhbCB0aGF0IHRoZSBleGFjdCBzdHJpbmcgaXMgaW4gdGhlIGRvY3VtZW50LlxuICAgIC8vXG4gICAgLy8gRm9yIHN0cmluZ3MgdGhhdCBhcmUgbGlrZWx5IHRvIGFwcGVhciBpbiB0aGUgZG9jdW1lbnQgc2ltcGx5IGJ5IGNoYW5jZVxuICAgIC8vIChpLmUuIHNob3J0IG9uZXMpLCB3ZSBzaG91bGQgbWFrZSB0aGUgbWF0Y2ggcmVxdWlyZW1lbnRzIHN0cmljdGVyIGluIHRoaXNcbiAgICAvLyBjYXNlLiBBIG1hdGNoIHRocmVzaG9sZCBvZiAwLjI1IGNvcnJlc3BvbmRzICh2ZXJ5IHJvdWdobHkpIHRvIGEgd29yZFxuICAgIC8vIGRlbGV0aW9uL2luc2VydGlvbiBpbiBhIHN0cmluZyBvZiBsZW5ndGggMzIgKGF2ZXJhZ2UgRW5nbGlzaCB3b3JkIGxlbmd0aFxuICAgIC8vIG9mIDgpIGFuZCBwZXJtaXRzIG5vIGVycm9ycyBmb3Igc3RyaW5ncyBvZiBsZW5ndGggPCA0LlxuICAgIGlmIChjb250ZXh0TWlzc2luZyAmJiB0aGlzLmV4YWN0Lmxlbmd0aCA8IFNMSUNFX0xFTkdUSCkge1xuICAgICAgZG1wLk1hdGNoX1RocmVzaG9sZCA9IDAuMjU7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoIGZvciB0aGUgZmlyc3Qgc2xpY2UuXG4gICAgbGV0IGZpcnN0U2xpY2UgPSBzbGljZXMuc2hpZnQoKTtcbiAgICByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCBmaXJzdFNsaWNlLCBsb2MpO1xuICAgIGlmIChyZXN1bHQgPiAtMSkge1xuICAgICAgc3RhcnQgPSByZXN1bHQ7XG4gICAgICBsb2MgPSBlbmQgPSBzdGFydCArIGZpcnN0U2xpY2UubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgZm9sZCBmdW5jdGlvbiB0aGF0IHdpbGwgcmVkdWNlIHNsaWNlcyB0byBwb3NpdGlvbmFsIGV4dGVudHMuXG4gICAgbGV0IGZvbGRTbGljZXMgPSAoYWNjLCBzbGljZSkgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHNsaWNlLCBhY2MubG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gbWF0Y2ggZm91bmQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIG5leHQgc2xpY2Ugc2hvdWxkIGZvbGxvdyB0aGlzIG9uZSBjbG9zZWx5LlxuICAgICAgYWNjLmxvYyA9IHJlc3VsdCArIHNsaWNlLmxlbmd0aDtcblxuICAgICAgLy8gRXhwYW5kIHRoZSBzdGFydCBhbmQgZW5kIHRvIGEgcXVvdGUgdGhhdCBpbmNsdWRlcyBhbGwgdGhlIHNsaWNlcy5cbiAgICAgIGFjYy5zdGFydCA9IE1hdGgubWluKGFjYy5zdGFydCwgcmVzdWx0KTtcbiAgICAgIGFjYy5lbmQgPSBNYXRoLm1heChhY2MuZW5kLCByZXN1bHQgKyBzbGljZS5sZW5ndGgpO1xuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH07XG5cbiAgICAvLyBVc2UgdGhlIGZvbGQgZnVuY3Rpb24gdG8gZXN0YWJsaXNoIHRoZSBmdWxsIHF1b3RlIGV4dGVudHMuXG4gICAgLy8gRXhwZWN0IHRoZSBzbGljZXMgdG8gYmUgY2xvc2UgdG8gb25lIGFub3RoZXIuXG4gICAgLy8gVGhpcyBkaXN0YW5jZSBpcyBkZWxpYmVyYXRlbHkgZ2VuZXJvdXMgZm9yIG5vdy5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSA2NDtcbiAgICBsZXQgYWNjID0gc2xpY2VzLnJlZHVjZShmb2xkU2xpY2VzLCB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICBlbmQ6IGVuZCxcbiAgICAgIGxvYzogbG9jLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UG9zaXRpb25BbmNob3Iocm9vdCwgYWNjLnN0YXJ0LCBhY2MuZW5kKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIuLyJ9
