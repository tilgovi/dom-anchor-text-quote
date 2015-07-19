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
    global.domAnchorTextQuote = mod.exports;
  }
})(this, function (exports, module, _diffMatchPatch, _domAnchorTextPosition) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _DiffMatchPatch = _interopRequireDefault(_diffMatchPatch);

  var _TextPositionAnchor = _interopRequireDefault(_domAnchorTextPosition);

  // The DiffMatchPatch bitap has a hard 32-character pattern length limit.
  var CONTEXT_LENGTH = 32;

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
        // The search pattern must be no more than 32 characters.
        var slices = this.exact.match(/(.|[\r\n]){1,32}/g);
        var loc = hint === undefined ? root.textContent.length / 2 | 0 : hint;
        var start = Number.POSITIVE_INFINITY;
        var end = Number.NEGATIVE_INFINITY;
        var result = -1;

        // If the prefix is known then search for that first.
        if (this.prefix !== undefined) {
          var _result = dmp.match_main(root.textContent, this.prefix, loc);
          if (_result > -1) loc = _result + this.prefix.length;
        }

        // If the prefix was not found, search for the first slice.
        if (result === -1) {
          var firstSlice = slices.shift();
          result = dmp.match_main(root.textContent, firstSlice, loc);
          if (result > -1) {
            start = result;
            loc = end = start + firstSlice.length;
          } else {
            throw new Error('no match found');
          }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1hbmNob3ItdGV4dC1xdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7TUFHTCxlQUFlO0FBQ3ZCLGFBRFEsZUFBZSxDQUN0QixJQUFJLEVBQUUsS0FBSyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7NEJBRGxCLGVBQWU7O0FBRWhDLFVBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixjQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7T0FDdEQ7QUFDRCxVQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDdkIsY0FBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO09BQ3ZEO0FBQ0QsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsVUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsVUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUM5Qjs7aUJBWmtCLGVBQWU7O2FBMEMzQixpQkFBQyxPQUFPLEVBQUU7QUFDZixlQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNqRDs7O2FBRVMsc0JBQUc7QUFDWCxZQUFJLFFBQVEsR0FBRztBQUNiLGNBQUksRUFBRSxtQkFBbUI7QUFDekIsZUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2xCLENBQUM7QUFDRixZQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUM3RCxZQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFD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QUFjLENBQUMsQ0FBQztBQUN4RSxZQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUUzRCxlQUFPLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBQyxNQUFNLEVBQU4sTUFBTSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDO09BQzNEOzs7V0F4Q2tCLGVBQWU7OzttQkFBZixlQUFlIiwiZmlsZSI6ImRvbS1hbmNob3ItdGV4dC1xdW90ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEaWZmTWF0Y2hQYXRjaCBmcm9tICdkaWZmLW1hdGNoLXBhdGNoJztcbmltcG9ydCBUZXh0UG9zaXRpb25BbmNob3IgZnJvbSAnZG9tLWFuY2hvci10ZXh0LXBvc2l0aW9uJztcblxuLy8gVGhlIERpZmZNYXRjaFBhdGNoIGJpdGFwIGhhcyBhIGhhcmQgMzItY2hhcmFjdGVyIHBhdHRlcm4gbGVuZ3RoIGxpbWl0LlxuY29uc3QgQ09OVEVYVF9MRU5HVEggPSAzMjtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0UXVvdGVBbmNob3Ige1xuICBjb25zdHJ1Y3Rvcihyb290LCBleGFjdCwgY29udGV4dCA9IHt9KSB7XG4gICAgaWYgKHJvb3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJvb3RcIicpO1xuICAgIH1cbiAgICBpZiAoZXhhY3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcImV4YWN0XCInKTtcbiAgICB9XG4gICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICB0aGlzLmV4YWN0ID0gZXhhY3Q7XG4gICAgdGhpcy5wcmVmaXggPSBjb250ZXh0LnByZWZpeDtcbiAgICB0aGlzLnN1ZmZpeCA9IGNvbnRleHQuc3VmZml4O1xuICB9XG5cbiAgc3RhdGljIGZyb21SYW5nZShyb290LCByYW5nZSkge1xuICAgIGlmIChyYW5nZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicmFuZ2VcIicpO1xuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IFRleHRQb3NpdGlvbkFuY2hvci5mcm9tUmFuZ2Uocm9vdCwgcmFuZ2UpO1xuICAgIHJldHVybiB0aGlzLmZyb21Qb3NpdGlvbkFuY2hvcihwb3NpdGlvbik7XG4gIH1cblxuICBzdGF0aWMgZnJvbVNlbGVjdG9yKHJvb3QsIHNlbGVjdG9yID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFRleHRRdW90ZUFuY2hvcihyb290LCBzZWxlY3Rvci5leGFjdCwgc2VsZWN0b3IpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Qb3NpdGlvbkFuY2hvcihhbmNob3IpIHtcbiAgICBsZXQgcm9vdCA9IGFuY2hvci5yb290O1xuXG4gICAgbGV0IHtzdGFydCwgZW5kfSA9IGFuY2hvcjtcbiAgICBsZXQgZXhhY3QgPSByb290LnRleHRDb250ZW50LnN1YnN0cihzdGFydCwgZW5kIC0gc3RhcnQpO1xuXG4gICAgbGV0IHByZWZpeFN0YXJ0ID0gTWF0aC5tYXgoMCwgc3RhcnQgLSBDT05URVhUX0xFTkdUSCk7XG4gICAgbGV0IHByZWZpeCA9IHJvb3QudGV4dENvbnRlbnQuc3Vic3RyKHByZWZpeFN0YXJ0LCBzdGFydCAtIHByZWZpeFN0YXJ0KTtcblxuICAgIGxldCBzdWZmaXhFbmQgPSBNYXRoLm1pbihyb290LnRleHRDb250ZW50Lmxlbmd0aCwgZW5kICsgQ09OVEVYVF9MRU5HVEgpO1xuICAgIGxldCBzdWZmaXggPSByb290LnRleHRDb250ZW50LnN1YnN0cihlbmQsIHN1ZmZpeEVuZCAtIGVuZCk7XG5cbiAgICByZXR1cm4gbmV3IFRleHRRdW90ZUFuY2hvcihyb290LCBleGFjdCwge3ByZWZpeCwgc3VmZml4fSk7XG4gIH1cblxuICB0b1JhbmdlKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50b1Bvc2l0aW9uQW5jaG9yKG9wdGlvbnMpLnRvUmFuZ2UoKTtcbiAgfVxuXG4gIHRvU2VsZWN0b3IoKSB7XG4gICAgbGV0IHNlbGVjdG9yID0ge1xuICAgICAgdHlwZTogJ1RleHRRdW90ZVNlbGVjdG9yJyxcbiAgICAgIGV4YWN0OiB0aGlzLmV4YWN0LFxuICAgIH07XG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHNlbGVjdG9yLnByZWZpeCA9IHRoaXMucHJlZml4O1xuICAgIGlmICh0aGlzLnN1ZmZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5zdWZmaXggPSB0aGlzLnN1ZmZpeDtcbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cblxuICB0b1Bvc2l0aW9uQW5jaG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCB7aGludH0gPSBvcHRpb25zO1xuICAgIGxldCByb290ID0gdGhpcy5yb290O1xuICAgIGxldCBkbXAgPSBuZXcgRGlmZk1hdGNoUGF0Y2goKTtcblxuICAgIGRtcC5NYXRjaF9EaXN0YW5jZSA9IHJvb3QudGV4dENvbnRlbnQubGVuZ3RoICogMjtcblxuICAgIC8vIFdvcmsgYXJvdW5kIGEgaGFyZCBsaW1pdCBvZiB0aGUgRGlmZk1hdGNoUGF0Y2ggYml0YXAgaW1wbGVtZW50YXRpb24uXG4gICAgLy8gVGhlIHNlYXJjaCBwYXR0ZXJuIG11c3QgYmUgbm8gbW9yZSB0aGFuIDMyIGNoYXJhY3RlcnMuXG4gICAgbGV0IHNsaWNlcyA9IHRoaXMuZXhhY3QubWF0Y2goLygufFtcXHJcXG5dKXsxLDMyfS9nKTtcbiAgICBsZXQgbG9jID0gKGhpbnQgPT09IHVuZGVmaW5lZCkgPyAoKHJvb3QudGV4dENvbnRlbnQubGVuZ3RoIC8gMikgfCAwKSA6IGhpbnQ7XG4gICAgbGV0IHN0YXJ0ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIGxldCBlbmQgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IHJlc3VsdCA9IC0xO1xuXG4gICAgLy8gSWYgdGhlIHByZWZpeCBpcyBrbm93biB0aGVuIHNlYXJjaCBmb3IgdGhhdCBmaXJzdC5cbiAgICBpZiAodGhpcy5wcmVmaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGV0IHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHRoaXMucHJlZml4LCBsb2MpO1xuICAgICAgaWYgKHJlc3VsdCA+IC0xKSBsb2MgPSByZXN1bHQgKyB0aGlzLnByZWZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHByZWZpeCB3YXMgbm90IGZvdW5kLCBzZWFyY2ggZm9yIHRoZSBmaXJzdCBzbGljZS5cbiAgICBpZiAocmVzdWx0ID09PSAtMSkge1xuICAgICAgbGV0IGZpcnN0U2xpY2UgPSBzbGljZXMuc2hpZnQoKTtcbiAgICAgIHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIGZpcnN0U2xpY2UsIGxvYyk7XG4gICAgICBpZiAocmVzdWx0ID4gLTEpIHtcbiAgICAgICAgc3RhcnQgPSByZXN1bHQ7XG4gICAgICAgIGxvYyA9IGVuZCA9IHN0YXJ0ICsgZmlyc3RTbGljZS5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgZm9sZCBmdW5jdGlvbiB0aGF0IHdpbGwgcmVkdWNlIHNsaWNlcyB0byBwb3NpdGlvbmFsIGV4dGVudHMuXG4gICAgbGV0IGZvbGRTbGljZXMgPSAoYWNjLCBzbGljZSkgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHNsaWNlLCBhY2MubG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gbWF0Y2ggZm91bmQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIG5leHQgc2xpY2Ugc2hvdWxkIGZvbGxvdyB0aGlzIG9uZSBjbG9zZWx5LlxuICAgICAgYWNjLmxvYyA9IHJlc3VsdCArIHNsaWNlLmxlbmd0aDtcblxuICAgICAgLy8gRXhwYW5kIHRoZSBzdGFydCBhbmQgZW5kIHRvIGEgcXVvdGUgdGhhdCBpbmNsdWRlcyBhbGwgdGhlIHNsaWNlcy5cbiAgICAgIGFjYy5zdGFydCA9IE1hdGgubWluKGFjYy5zdGFydCwgcmVzdWx0KTtcbiAgICAgIGFjYy5lbmQgPSBNYXRoLm1heChhY2MuZW5kLCByZXN1bHQgKyBzbGljZS5sZW5ndGgpO1xuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH07XG5cbiAgICAvLyBVc2UgdGhlIGZvbGQgZnVuY3Rpb24gdG8gZXN0YWJsaXNoIHRoZSBmdWxsIHF1b3RlIGV4dGVudHMuXG4gICAgLy8gRXhwZWN0IHRoZSBzbGljZXMgdG8gYmUgY2xvc2UgdG8gb25lIGFub3RoZXIuXG4gICAgLy8gVGhpcyBkaXN0YW5jZSBpcyBkZWxpYmVyYXRlbHkgZ2VuZXJvdXMgZm9yIG5vdy5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSA2NDtcbiAgICBsZXQgYWNjID0gc2xpY2VzLnJlZHVjZShmb2xkU2xpY2VzLCB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICBlbmQ6IGVuZCxcbiAgICAgIGxvYzogbG9jLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UG9zaXRpb25BbmNob3Iocm9vdCwgYWNjLnN0YXJ0LCBhY2MuZW5kKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIuLyJ9