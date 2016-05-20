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
        var foundPrefix = false;

        // If the prefix is known then search for that first.
        if (havePrefix) {
          result = dmp.match_main(root.textContent, this.prefix, loc);
          if (result > -1) {
            loc = result + this.prefix.length;
            foundPrefix = true;
          }
        }

        // If we have a suffix, and the prefix wasn't found, then search for it.
        if (haveSuffix && !foundPrefix) {
          result = dmp.match_main(root.textContent, this.suffix, loc + this.exact.length);
          if (result > -1) {
            loc = result - this.exact.length;
          }
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
//# sourceMappingURL=data:application/json;base64,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LFFBQVEsQ0FBQyxDQUFDO09BQzVEOzs7YUFFd0IsNEJBQUMsTUFBTSxFQUFFO0FBQ2hDLFlBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O1lBRWxCLEtBQUssR0FBUyxNQUFNLENBQXBCLEtBQUs7WUFBRSxHQUFHLEdBQUksTUFBTSxDQUFiLEdBQUc7O0FBQ2YsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQzs7QUFFeEQsWUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFDO0FBQ3RELFlBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUM7O0FBRXZFLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLGNBQWMsQ0FBQyxDQUFDO0FBQ3hFLFlBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRTNELGVBQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUM7T0FDM0Q7OztXQXhDa0IsZUFBZTs7O21CQUFmLGVBQWUiLCJmaWxlIjoiVGV4dFF1b3RlQW5jaG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmZNYXRjaFBhdGNoIGZyb20gJ2RpZmYtbWF0Y2gtcGF0Y2gnO1xuaW1wb3J0IFRleHRQb3NpdGlvbkFuY2hvciBmcm9tICdkb20tYW5jaG9yLXRleHQtcG9zaXRpb24nO1xuXG4vLyBUaGUgRGlmZk1hdGNoUGF0Y2ggYml0YXAgaGFzIGEgaGFyZCAzMi1jaGFyYWN0ZXIgcGF0dGVybiBsZW5ndGggbGltaXQuXG5jb25zdCBTTElDRV9MRU5HVEggPSAzMjtcbmNvbnN0IFNMSUNFX1JFID0gbmV3IFJlZ0V4cCgnKC58W1xcclxcbl0pezEsJyArIFN0cmluZyhTTElDRV9MRU5HVEgpICsgJ30nLCAnZycpO1xuY29uc3QgQ09OVEVYVF9MRU5HVEggPSBTTElDRV9MRU5HVEg7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dFF1b3RlQW5jaG9yIHtcbiAgY29uc3RydWN0b3Iocm9vdCwgZXhhY3QsIGNvbnRleHQgPSB7fSkge1xuICAgIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyb290XCInKTtcbiAgICB9XG4gICAgaWYgKGV4YWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJleGFjdFwiJyk7XG4gICAgfVxuICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgdGhpcy5leGFjdCA9IGV4YWN0O1xuICAgIHRoaXMucHJlZml4ID0gY29udGV4dC5wcmVmaXg7XG4gICAgdGhpcy5zdWZmaXggPSBjb250ZXh0LnN1ZmZpeDtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmFuZ2Uocm9vdCwgcmFuZ2UpIHtcbiAgICBpZiAocmFuZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJhbmdlXCInKTtcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBUZXh0UG9zaXRpb25BbmNob3IuZnJvbVJhbmdlKHJvb3QsIHJhbmdlKTtcbiAgICByZXR1cm4gdGhpcy5mcm9tUG9zaXRpb25BbmNob3IocG9zaXRpb24pO1xuICB9XG5cbiAgc3RhdGljIGZyb21TZWxlY3Rvcihyb290LCBzZWxlY3RvciA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3Iocm9vdCwgc2VsZWN0b3IuZXhhY3QsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9zaXRpb25BbmNob3IoYW5jaG9yKSB7XG4gICAgbGV0IHJvb3QgPSBhbmNob3Iucm9vdDtcblxuICAgIGxldCB7c3RhcnQsIGVuZH0gPSBhbmNob3I7XG4gICAgbGV0IGV4YWN0ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIoc3RhcnQsIGVuZCAtIHN0YXJ0KTtcblxuICAgIGxldCBwcmVmaXhTdGFydCA9IE1hdGgubWF4KDAsIHN0YXJ0IC0gQ09OVEVYVF9MRU5HVEgpO1xuICAgIGxldCBwcmVmaXggPSByb290LnRleHRDb250ZW50LnN1YnN0cihwcmVmaXhTdGFydCwgc3RhcnQgLSBwcmVmaXhTdGFydCk7XG5cbiAgICBsZXQgc3VmZml4RW5kID0gTWF0aC5taW4ocm9vdC50ZXh0Q29udGVudC5sZW5ndGgsIGVuZCArIENPTlRFWFRfTEVOR1RIKTtcbiAgICBsZXQgc3VmZml4ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIoZW5kLCBzdWZmaXhFbmQgLSBlbmQpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3Iocm9vdCwgZXhhY3QsIHtwcmVmaXgsIHN1ZmZpeH0pO1xuICB9XG5cbiAgdG9SYW5nZShvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9Qb3NpdGlvbkFuY2hvcihvcHRpb25zKS50b1JhbmdlKCk7XG4gIH1cblxuICB0b1NlbGVjdG9yKCkge1xuICAgIGxldCBzZWxlY3RvciA9IHtcbiAgICAgIHR5cGU6ICdUZXh0UXVvdGVTZWxlY3RvcicsXG4gICAgICBleGFjdDogdGhpcy5leGFjdCxcbiAgICB9O1xuICAgIGlmICh0aGlzLnByZWZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5wcmVmaXggPSB0aGlzLnByZWZpeDtcbiAgICBpZiAodGhpcy5zdWZmaXggIT09IHVuZGVmaW5lZCkgc2VsZWN0b3Iuc3VmZml4ID0gdGhpcy5zdWZmaXg7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgdG9Qb3NpdGlvbkFuY2hvcihvcHRpb25zID0ge30pIHtcbiAgICBsZXQge2hpbnR9ID0gb3B0aW9ucztcbiAgICBsZXQgcm9vdCA9IHRoaXMucm9vdDtcbiAgICBsZXQgZG1wID0gbmV3IERpZmZNYXRjaFBhdGNoKCk7XG5cbiAgICBkbXAuTWF0Y2hfRGlzdGFuY2UgPSByb290LnRleHRDb250ZW50Lmxlbmd0aCAqIDI7XG5cbiAgICAvLyBXb3JrIGFyb3VuZCBhIGhhcmQgbGltaXQgb2YgdGhlIERpZmZNYXRjaFBhdGNoIGJpdGFwIGltcGxlbWVudGF0aW9uLlxuICAgIC8vIFRoZSBzZWFyY2ggcGF0dGVybiBtdXN0IGJlIG5vIG1vcmUgdGhhbiBTTElDRV9MRU5HVEggY2hhcmFjdGVycy5cbiAgICBsZXQgc2xpY2VzID0gdGhpcy5leGFjdC5tYXRjaChTTElDRV9SRSk7XG4gICAgbGV0IGxvYyA9IChoaW50ID09PSB1bmRlZmluZWQpID8gKChyb290LnRleHRDb250ZW50Lmxlbmd0aCAvIDIpIHwgMCkgOiBoaW50O1xuICAgIGxldCBzdGFydCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBsZXQgZW5kID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICAgIGxldCByZXN1bHQgPSAtMTtcbiAgICBsZXQgaGF2ZVByZWZpeCA9IHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQ7XG4gICAgbGV0IGhhdmVTdWZmaXggPSB0aGlzLnN1ZmZpeCAhPT0gdW5kZWZpbmVkO1xuICAgIGxldCBmb3VuZFByZWZpeCA9IGZhbHNlO1xuXG4gICAgLy8gSWYgdGhlIHByZWZpeCBpcyBrbm93biB0aGVuIHNlYXJjaCBmb3IgdGhhdCBmaXJzdC5cbiAgICBpZiAoaGF2ZVByZWZpeCkge1xuICAgICAgcmVzdWx0ID0gZG1wLm1hdGNoX21haW4ocm9vdC50ZXh0Q29udGVudCwgdGhpcy5wcmVmaXgsIGxvYyk7XG4gICAgICBpZiAocmVzdWx0ID4gLTEpIHtcbiAgICAgICAgbG9jID0gcmVzdWx0ICsgdGhpcy5wcmVmaXgubGVuZ3RoO1xuICAgICAgICBmb3VuZFByZWZpeCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHN1ZmZpeCwgYW5kIHRoZSBwcmVmaXggd2Fzbid0IGZvdW5kLCB0aGVuIHNlYXJjaCBmb3IgaXQuXG4gICAgaWYgKGhhdmVTdWZmaXggJiYgIWZvdW5kUHJlZml4KSB7XG4gICAgICByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCB0aGlzLnN1ZmZpeCwgbG9jICsgdGhpcy5leGFjdC5sZW5ndGgpO1xuICAgICAgaWYgKHJlc3VsdCA+IC0xKSB7XG4gICAgICAgIGxvYyA9IHJlc3VsdCAtIHRoaXMuZXhhY3QubGVuZ3RoO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNlYXJjaCBmb3IgdGhlIGZpcnN0IHNsaWNlLlxuICAgIGxldCBmaXJzdFNsaWNlID0gc2xpY2VzLnNoaWZ0KCk7XG4gICAgcmVzdWx0ID0gZG1wLm1hdGNoX21haW4ocm9vdC50ZXh0Q29udGVudCwgZmlyc3RTbGljZSwgbG9jKTtcbiAgICBpZiAocmVzdWx0ID4gLTEpIHtcbiAgICAgIHN0YXJ0ID0gcmVzdWx0O1xuICAgICAgbG9jID0gZW5kID0gc3RhcnQgKyBmaXJzdFNsaWNlLmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyBtYXRjaCBmb3VuZCcpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGZvbGQgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZHVjZSBzbGljZXMgdG8gcG9zaXRpb25hbCBleHRlbnRzLlxuICAgIGxldCBmb2xkU2xpY2VzID0gKGFjYywgc2xpY2UpID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCBzbGljZSwgYWNjLmxvYyk7XG4gICAgICBpZiAocmVzdWx0ID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBuZXh0IHNsaWNlIHNob3VsZCBmb2xsb3cgdGhpcyBvbmUgY2xvc2VseS5cbiAgICAgIGFjYy5sb2MgPSByZXN1bHQgKyBzbGljZS5sZW5ndGg7XG5cbiAgICAgIC8vIEV4cGFuZCB0aGUgc3RhcnQgYW5kIGVuZCB0byBhIHF1b3RlIHRoYXQgaW5jbHVkZXMgYWxsIHRoZSBzbGljZXMuXG4gICAgICBhY2Muc3RhcnQgPSBNYXRoLm1pbihhY2Muc3RhcnQsIHJlc3VsdCk7XG4gICAgICBhY2MuZW5kID0gTWF0aC5tYXgoYWNjLmVuZCwgcmVzdWx0ICsgc2xpY2UubGVuZ3RoKTtcblxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9O1xuXG4gICAgLy8gVXNlIHRoZSBmb2xkIGZ1bmN0aW9uIHRvIGVzdGFibGlzaCB0aGUgZnVsbCBxdW90ZSBleHRlbnRzLlxuICAgIC8vIEV4cGVjdCB0aGUgc2xpY2VzIHRvIGJlIGNsb3NlIHRvIG9uZSBhbm90aGVyLlxuICAgIC8vIFRoaXMgZGlzdGFuY2UgaXMgZGVsaWJlcmF0ZWx5IGdlbmVyb3VzIGZvciBub3cuXG4gICAgZG1wLk1hdGNoX0Rpc3RhbmNlID0gNjQ7XG4gICAgbGV0IGFjYyA9IHNsaWNlcy5yZWR1Y2UoZm9sZFNsaWNlcywge1xuICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgZW5kOiBlbmQsXG4gICAgICBsb2M6IGxvYyxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgVGV4dFBvc2l0aW9uQW5jaG9yKHJvb3QsIGFjYy5zdGFydCwgYWNjLmVuZCk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiLi8ifQ==
