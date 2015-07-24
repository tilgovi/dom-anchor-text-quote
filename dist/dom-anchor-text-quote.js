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
          result = dmp.match_main(root.textContent, this.prefix, loc);
          if (result > -1) loc = result + this.prefix.length;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1hbmNob3ItdGV4dC1xdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7TUFHTCxlQUFlO0FBQ3ZCLGFBRFEsZUFBZSxDQUN0QixJQUFJLEVBQUUsS0FBSyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7NEJBRGxCLGVBQWU7O0FBRWhDLFVBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixjQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7T0FDdEQ7QUFDRCxVQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDdkIsY0FBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO09BQ3ZEO0FBQ0QsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsVUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsVUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUM5Qjs7aUJBWmtCLGVBQWU7O2FBMEMzQixpQkFBQyxPQUFPLEVBQUU7QUFDZixlQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNqRDs7O2FBRVMsc0JBQUc7QUFDWCxZQUFJLFFBQVEsR0FBRztBQUNiLGNBQUksRUFBRSxtQkFBbUI7QUFDekIsZUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2xCLENBQUM7QUFDRixZQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUM3RCxZQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFD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QVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFM0QsZUFBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFDLENBQUMsQ0FBQztPQUMzRDs7O1dBeENrQixlQUFlOzs7bUJBQWYsZUFBZSIsImZpbGUiOiJkb20tYW5jaG9yLXRleHQtcXVvdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGlmZk1hdGNoUGF0Y2ggZnJvbSAnZGlmZi1tYXRjaC1wYXRjaCc7XG5pbXBvcnQgVGV4dFBvc2l0aW9uQW5jaG9yIGZyb20gJ2RvbS1hbmNob3ItdGV4dC1wb3NpdGlvbic7XG5cbi8vIFRoZSBEaWZmTWF0Y2hQYXRjaCBiaXRhcCBoYXMgYSBoYXJkIDMyLWNoYXJhY3RlciBwYXR0ZXJuIGxlbmd0aCBsaW1pdC5cbmNvbnN0IENPTlRFWFRfTEVOR1RIID0gMzI7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dFF1b3RlQW5jaG9yIHtcbiAgY29uc3RydWN0b3Iocm9vdCwgZXhhY3QsIGNvbnRleHQgPSB7fSkge1xuICAgIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyb290XCInKTtcbiAgICB9XG4gICAgaWYgKGV4YWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJleGFjdFwiJyk7XG4gICAgfVxuICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgdGhpcy5leGFjdCA9IGV4YWN0O1xuICAgIHRoaXMucHJlZml4ID0gY29udGV4dC5wcmVmaXg7XG4gICAgdGhpcy5zdWZmaXggPSBjb250ZXh0LnN1ZmZpeDtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmFuZ2Uocm9vdCwgcmFuZ2UpIHtcbiAgICBpZiAocmFuZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJhbmdlXCInKTtcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBUZXh0UG9zaXRpb25BbmNob3IuZnJvbVJhbmdlKHJvb3QsIHJhbmdlKTtcbiAgICByZXR1cm4gdGhpcy5mcm9tUG9zaXRpb25BbmNob3IocG9zaXRpb24pO1xuICB9XG5cbiAgc3RhdGljIGZyb21TZWxlY3Rvcihyb290LCBzZWxlY3RvciA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3Iocm9vdCwgc2VsZWN0b3IuZXhhY3QsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9zaXRpb25BbmNob3IoYW5jaG9yKSB7XG4gICAgbGV0IHJvb3QgPSBhbmNob3Iucm9vdDtcblxuICAgIGxldCB7c3RhcnQsIGVuZH0gPSBhbmNob3I7XG4gICAgbGV0IGV4YWN0ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIoc3RhcnQsIGVuZCAtIHN0YXJ0KTtcblxuICAgIGxldCBwcmVmaXhTdGFydCA9IE1hdGgubWF4KDAsIHN0YXJ0IC0gQ09OVEVYVF9MRU5HVEgpO1xuICAgIGxldCBwcmVmaXggPSByb290LnRleHRDb250ZW50LnN1YnN0cihwcmVmaXhTdGFydCwgc3RhcnQgLSBwcmVmaXhTdGFydCk7XG5cbiAgICBsZXQgc3VmZml4RW5kID0gTWF0aC5taW4ocm9vdC50ZXh0Q29udGVudC5sZW5ndGgsIGVuZCArIENPTlRFWFRfTEVOR1RIKTtcbiAgICBsZXQgc3VmZml4ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIoZW5kLCBzdWZmaXhFbmQgLSBlbmQpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3Iocm9vdCwgZXhhY3QsIHtwcmVmaXgsIHN1ZmZpeH0pO1xuICB9XG5cbiAgdG9SYW5nZShvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9Qb3NpdGlvbkFuY2hvcihvcHRpb25zKS50b1JhbmdlKCk7XG4gIH1cblxuICB0b1NlbGVjdG9yKCkge1xuICAgIGxldCBzZWxlY3RvciA9IHtcbiAgICAgIHR5cGU6ICdUZXh0UXVvdGVTZWxlY3RvcicsXG4gICAgICBleGFjdDogdGhpcy5leGFjdCxcbiAgICB9O1xuICAgIGlmICh0aGlzLnByZWZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5wcmVmaXggPSB0aGlzLnByZWZpeDtcbiAgICBpZiAodGhpcy5zdWZmaXggIT09IHVuZGVmaW5lZCkgc2VsZWN0b3Iuc3VmZml4ID0gdGhpcy5zdWZmaXg7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgdG9Qb3NpdGlvbkFuY2hvcihvcHRpb25zID0ge30pIHtcbiAgICBsZXQge2hpbnR9ID0gb3B0aW9ucztcbiAgICBsZXQgcm9vdCA9IHRoaXMucm9vdDtcbiAgICBsZXQgZG1wID0gbmV3IERpZmZNYXRjaFBhdGNoKCk7XG5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSByb290LnRleHRDb250ZW50Lmxlbmd0aCAqIDI7XG5cbiAgICAvLyBXb3JrIGFyb3VuZCBhIGhhcmQgbGltaXQgb2YgdGhlIERpZmZNYXRjaFBhdGNoIGJpdGFwIGltcGxlbWVudGF0aW9uLlxuICAgIC8vIFRoZSBzZWFyY2ggcGF0dGVybiBtdXN0IGJlIG5vIG1vcmUgdGhhbiAzMiBjaGFyYWN0ZXJzLlxuICAgIGxldCBzbGljZXMgPSB0aGlzLmV4YWN0Lm1hdGNoKC8oLnxbXFxyXFxuXSl7MSwzMn0vZyk7XG4gICAgbGV0IGxvYyA9IChoaW50ID09PSB1bmRlZmluZWQpID8gKChyb290LnRleHRDb250ZW50Lmxlbmd0aCAvIDIpIHwgMCkgOiBoaW50O1xuICAgIGxldCBzdGFydCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBsZXQgZW5kID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICAgIGxldCByZXN1bHQgPSAtMTtcblxuICAgIC8vIElmIHRoZSBwcmVmaXggaXMga25vd24gdGhlbiBzZWFyY2ggZm9yIHRoYXQgZmlyc3QuXG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHRoaXMucHJlZml4LCBsb2MpO1xuICAgICAgaWYgKHJlc3VsdCA+IC0xKSBsb2MgPSByZXN1bHQgKyB0aGlzLnByZWZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoIGZvciB0aGUgZmlyc3Qgc2xpY2UuXG4gICAgbGV0IGZpcnN0U2xpY2UgPSBzbGljZXMuc2hpZnQoKTtcbiAgICByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCBmaXJzdFNsaWNlLCBsb2MpO1xuICAgIGlmIChyZXN1bHQgPiAtMSkge1xuICAgICAgc3RhcnQgPSByZXN1bHQ7XG4gICAgICBsb2MgPSBlbmQgPSBzdGFydCArIGZpcnN0U2xpY2UubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgZm9sZCBmdW5jdGlvbiB0aGF0IHdpbGwgcmVkdWNlIHNsaWNlcyB0byBwb3NpdGlvbmFsIGV4dGVudHMuXG4gICAgbGV0IGZvbGRTbGljZXMgPSAoYWNjLCBzbGljZSkgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHNsaWNlLCBhY2MubG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gbWF0Y2ggZm91bmQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIG5leHQgc2xpY2Ugc2hvdWxkIGZvbGxvdyB0aGlzIG9uZSBjbG9zZWx5LlxuICAgICAgYWNjLmxvYyA9IHJlc3VsdCArIHNsaWNlLmxlbmd0aDtcblxuICAgICAgLy8gRXhwYW5kIHRoZSBzdGFydCBhbmQgZW5kIHRvIGEgcXVvdGUgdGhhdCBpbmNsdWRlcyBhbGwgdGhlIHNsaWNlcy5cbiAgICAgIGFjYy5zdGFydCA9IE1hdGgubWluKGFjYy5zdGFydCwgcmVzdWx0KTtcbiAgICAgIGFjYy5lbmQgPSBNYXRoLm1heChhY2MuZW5kLCByZXN1bHQgKyBzbGljZS5sZW5ndGgpO1xuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH07XG5cbiAgICAvLyBVc2UgdGhlIGZvbGQgZnVuY3Rpb24gdG8gZXN0YWJsaXNoIHRoZSBmdWxsIHF1b3RlIGV4dGVudHMuXG4gICAgLy8gRXhwZWN0IHRoZSBzbGljZXMgdG8gYmUgY2xvc2UgdG8gb25lIGFub3RoZXIuXG4gICAgLy8gVGhpcyBkaXN0YW5jZSBpcyBkZWxpYmVyYXRlbHkgZ2VuZXJvdXMgZm9yIG5vdy5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSA2NDtcbiAgICBsZXQgYWNjID0gc2xpY2VzLnJlZHVjZShmb2xkU2xpY2VzLCB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICBlbmQ6IGVuZCxcbiAgICAgIGxvYzogbG9jLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UG9zaXRpb25BbmNob3Iocm9vdCwgYWNjLnN0YXJ0LCBhY2MuZW5kKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIuLyJ9