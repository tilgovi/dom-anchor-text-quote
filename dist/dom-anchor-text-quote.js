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
        var start = -1;
        var end = -1;

        // If the prefix is known then search for that first.
        if (this.prefix !== undefined) {
          var result = dmp.match_main(root.textContent, this.prefix, loc);
          if (result > -1) loc = end = start = result + this.prefix.length;
        }

        // If the prefix was not found, search for the first slice.
        if (start === -1) {
          var firstSlice = slices.shift();
          var result = dmp.match_main(root.textContent, firstSlice, loc);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1hbmNob3ItdGV4dC1xdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7TUFHTCxlQUFlO0FBQ3ZCLGFBRFEsZUFBZSxDQUN0QixJQUFJLEVBQUUsS0FBSyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7NEJBRGxCLGVBQWU7O0FBRWhDLFVBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixjQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7T0FDdEQ7QUFDRCxVQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDdkIsY0FBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO09BQ3ZEO0FBQ0QsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsVUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsVUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUM5Qjs7aUJBWmtCLGVBQWU7O2FBMEMzQixpQkFBQyxPQUFPLEVBQUU7QUFDZixlQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNqRDs7O2FBRVMsc0JBQUc7QUFDWCxZQUFJLFFBQVEsR0FBRztBQUNiLGNBQUksRUFBRSxtQkFBbUI7QUFDekIsZUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2xCLENBQUM7QUFDRixZQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUM3RCxZQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFD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TSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRTNELGVBQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUM7T0FDM0Q7OztXQXhDa0IsZUFBZTs7O21CQUFmLGVBQWUiLCJmaWxlIjoiZG9tLWFuY2hvci10ZXh0LXF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmZNYXRjaFBhdGNoIGZyb20gJ2RpZmYtbWF0Y2gtcGF0Y2gnO1xuaW1wb3J0IFRleHRQb3NpdGlvbkFuY2hvciBmcm9tICdkb20tYW5jaG9yLXRleHQtcG9zaXRpb24nXG5cbi8vIFRoZSBEaWZmTWF0Y2hQYXRjaCBiaXRhcCBoYXMgYSBoYXJkIDMyLWNoYXJhY3RlciBwYXR0ZXJuIGxlbmd0aCBsaW1pdC5cbmNvbnN0IENPTlRFWFRfTEVOR1RIID0gMzI7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dFF1b3RlQW5jaG9yIHtcbiAgY29uc3RydWN0b3Iocm9vdCwgZXhhY3QsIGNvbnRleHQgPSB7fSkge1xuICAgIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyb290XCInKTtcbiAgICB9XG4gICAgaWYgKGV4YWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJleGFjdFwiJyk7XG4gICAgfVxuICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgdGhpcy5leGFjdCA9IGV4YWN0O1xuICAgIHRoaXMucHJlZml4ID0gY29udGV4dC5wcmVmaXg7XG4gICAgdGhpcy5zdWZmaXggPSBjb250ZXh0LnN1ZmZpeDtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmFuZ2Uocm9vdCwgcmFuZ2UpIHtcbiAgICBpZiAocmFuZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJhbmdlXCInKTtcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBUZXh0UG9zaXRpb25BbmNob3IuZnJvbVJhbmdlKHJvb3QsIHJhbmdlKTtcbiAgICByZXR1cm4gdGhpcy5mcm9tUG9zaXRpb25BbmNob3IocG9zaXRpb24pO1xuICB9XG5cbiAgc3RhdGljIGZyb21TZWxlY3Rvcihyb290LCBzZWxlY3RvciA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3Iocm9vdCwgc2VsZWN0b3IuZXhhY3QsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9zaXRpb25BbmNob3IoYW5jaG9yKSB7XG4gICAgbGV0IHJvb3QgPSBhbmNob3Iucm9vdDtcblxuICAgIGxldCB7c3RhcnQsIGVuZH0gPSBhbmNob3I7XG4gICAgbGV0IGV4YWN0ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIoc3RhcnQsIGVuZCAtIHN0YXJ0KTtcblxuICAgIGxldCBwcmVmaXhTdGFydCA9IE1hdGgubWF4KDAsIHN0YXJ0IC0gQ09OVEVYVF9MRU5HVEgpO1xuICAgIGxldCBwcmVmaXggPSByb290LnRleHRDb250ZW50LnN1YnN0cihwcmVmaXhTdGFydCwgc3RhcnQgLSBwcmVmaXhTdGFydCk7XG5cbiAgICBsZXQgc3VmZml4RW5kID0gTWF0aC5taW4ocm9vdC50ZXh0Q29udGVudC5sZW5ndGgsIGVuZCArIENPTlRFWFRfTEVOR1RIKTtcbiAgICBsZXQgc3VmZml4ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIoZW5kLCBzdWZmaXhFbmQgLSBlbmQpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3Iocm9vdCwgZXhhY3QsIHtwcmVmaXgsIHN1ZmZpeH0pO1xuICB9XG5cbiAgdG9SYW5nZShvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9Qb3NpdGlvbkFuY2hvcihvcHRpb25zKS50b1JhbmdlKCk7XG4gIH1cblxuICB0b1NlbGVjdG9yKCkge1xuICAgIGxldCBzZWxlY3RvciA9IHtcbiAgICAgIHR5cGU6ICdUZXh0UXVvdGVTZWxlY3RvcicsXG4gICAgICBleGFjdDogdGhpcy5leGFjdCxcbiAgICB9O1xuICAgIGlmICh0aGlzLnByZWZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5wcmVmaXggPSB0aGlzLnByZWZpeDtcbiAgICBpZiAodGhpcy5zdWZmaXggIT09IHVuZGVmaW5lZCkgc2VsZWN0b3Iuc3VmZml4ID0gdGhpcy5zdWZmaXg7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgdG9Qb3NpdGlvbkFuY2hvcihvcHRpb25zID0ge30pIHtcbiAgICBsZXQge2hpbnR9ID0gb3B0aW9ucztcbiAgICBsZXQgcm9vdCA9IHRoaXMucm9vdDtcbiAgICBsZXQgZG1wID0gbmV3IERpZmZNYXRjaFBhdGNoKCk7XG5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSByb290LnRleHRDb250ZW50Lmxlbmd0aCAqIDI7XG5cbiAgICAvLyBXb3JrIGFyb3VuZCBhIGhhcmQgbGltaXQgb2YgdGhlIERpZmZNYXRjaFBhdGNoIGJpdGFwIGltcGxlbWVudGF0aW9uLlxuICAgIC8vIFRoZSBzZWFyY2ggcGF0dGVybiBtdXN0IGJlIG5vIG1vcmUgdGhhbiAzMiBjaGFyYWN0ZXJzLlxuICAgIGxldCBzbGljZXMgPSB0aGlzLmV4YWN0Lm1hdGNoKC8oLnxbXFxyXFxuXSl7MSwzMn0vZyk7XG4gICAgbGV0IGxvYyA9IChoaW50ID09PSB1bmRlZmluZWQpID8gKChyb290LnRleHRDb250ZW50Lmxlbmd0aCAvIDIpIHwgMCkgOiBoaW50O1xuICAgIGxldCBzdGFydCA9IC0xO1xuICAgIGxldCBlbmQgPSAtMTtcblxuICAgIC8vIElmIHRoZSBwcmVmaXggaXMga25vd24gdGhlbiBzZWFyY2ggZm9yIHRoYXQgZmlyc3QuXG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCB0aGlzLnByZWZpeCwgbG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPiAtMSkgbG9jID0gZW5kID0gc3RhcnQgPSByZXN1bHQgKyB0aGlzLnByZWZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHByZWZpeCB3YXMgbm90IGZvdW5kLCBzZWFyY2ggZm9yIHRoZSBmaXJzdCBzbGljZS5cbiAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICBsZXQgZmlyc3RTbGljZSA9IHNsaWNlcy5zaGlmdCgpO1xuICAgICAgbGV0IHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIGZpcnN0U2xpY2UsIGxvYyk7XG4gICAgICBpZiAocmVzdWx0ID4gLTEpIHtcbiAgICAgICAgc3RhcnQgPSByZXN1bHQ7XG4gICAgICAgIGxvYyA9IGVuZCA9IHN0YXJ0ICsgZmlyc3RTbGljZS5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgZm9sZCBmdW5jdGlvbiB0aGF0IHdpbGwgcmVkdWNlIHNsaWNlcyB0byBwb3NpdGlvbmFsIGV4dGVudHMuXG4gICAgbGV0IGZvbGRTbGljZXMgPSAoYWNjLCBzbGljZSkgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIHNsaWNlLCBhY2MubG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gbWF0Y2ggZm91bmQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIG5leHQgc2xpY2Ugc2hvdWxkIGZvbGxvdyB0aGlzIG9uZSBjbG9zZWx5LlxuICAgICAgYWNjLmxvYyA9IHJlc3VsdCArIHNsaWNlLmxlbmd0aDtcblxuICAgICAgLy8gRXhwYW5kIHRoZSBzdGFydCBhbmQgZW5kIHRvIGEgcXVvdGUgdGhhdCBpbmNsdWRlcyBhbGwgdGhlIHNsaWNlcy5cbiAgICAgIGFjYy5zdGFydCA9IE1hdGgubWluKGFjYy5zdGFydCwgcmVzdWx0KTtcbiAgICAgIGFjYy5lbmQgPSBNYXRoLm1heChhY2MuZW5kLCByZXN1bHQgKyBzbGljZS5sZW5ndGgpO1xuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH07XG5cbiAgICAvLyBVc2UgdGhlIGZvbGQgZnVuY3Rpb24gdG8gZXN0YWJsaXNoIHRoZSBmdWxsIHF1b3RlIGV4dGVudHMuXG4gICAgLy8gRXhwZWN0IHRoZSBzbGljZXMgdG8gYmUgY2xvc2UgdG8gb25lIGFub3RoZXIuXG4gICAgLy8gVGhpcyBkaXN0YW5jZSBpcyBkZWxpYmVyYXRlbHkgZ2VuZXJvdXMgZm9yIG5vdy5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSA2NDtcbiAgICBsZXQgYWNjID0gc2xpY2VzLnJlZHVjZShmb2xkU2xpY2VzLCB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICBlbmQ6IGVuZCxcbiAgICAgIGxvYzogbG9jLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UG9zaXRpb25BbmNob3Iocm9vdCwgYWNjLnN0YXJ0LCBhY2MuZW5kKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIuLyJ9