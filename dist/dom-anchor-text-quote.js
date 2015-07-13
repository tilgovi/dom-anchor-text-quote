(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'diff-match-patch', 'dom-anchor-text-position', 'dom-seek'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('diff-match-patch'), require('dom-anchor-text-position'), require('dom-seek'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.DiffMatchPatch, global.TextPositionAnchor, global.seek);
    global.domAnchorTextQuote = mod.exports;
  }
})(this, function (exports, module, _diffMatchPatch, _domAnchorTextPosition, _domSeek) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _DiffMatchPatch = _interopRequireDefault(_diffMatchPatch);

  var _TextPositionAnchor = _interopRequireDefault(_domAnchorTextPosition);

  var _seek = _interopRequireDefault(_domSeek);

  var TextQuoteAnchor = (function () {
    function TextQuoteAnchor(exact) {
      var context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, TextQuoteAnchor);

      if (exact === undefined) {
        throw new Error('missing required parameter "exact"');
      }
      this.exact = exact;
      this.prefix = context.prefix;
      this.suffix = context.suffix;
    }

    _createClass(TextQuoteAnchor, [{
      key: 'toRange',
      value: function toRange() {
        return this.toPositionAnchor().toRange();
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
        var root = global.document.body;
        var dmp = new _DiffMatchPatch['default']();

        dmp.Match_Distance = root.textContent.length * 2;

        var foldSlices = function foldSlices(acc, slice) {
          var result = dmp.match_main(root.textContent, slice, acc.loc);
          if (result === -1) {
            throw new Error('no match found');
          }
          acc.loc = result + slice.length;
          acc.start = Math.min(acc.start, result);
          acc.end = Math.max(acc.end, result + slice.length);
          return acc;
        };

        var slices = this.exact.match(/(.|[\r\n]){1,32}/g);
        var loc = root.textContent.length / 2;
        var start = -1;
        var end = -1;

        if (this.prefix !== undefined) {
          var _result = dmp.match_main(root.textContent, this.prefix, loc);
          if (_result > -1) loc = end = start = _result + this.prefix.length;
        }

        if (start === -1) {
          var firstSlice = slices.shift();
          result = dmp.match_main(root.textContent, firstSlice, loc);
          if (result > -1) {
            start = result;
            loc = end = start + firstSlice.length;
          } else {
            throw new Error('no match found');
          }
        }

        dmp.Match_Distance = 64;
        var acc = slices.reduce(foldSlices, {
          start: start,
          end: end,
          loc: loc
        });

        return new _TextPositionAnchor['default'](acc.start, acc.end);
      }
    }], [{
      key: 'fromRange',
      value: function fromRange(range) {
        if (range === undefined) {
          throw new Error('missing required parameter "range"');
        }

        var position = _TextPositionAnchor['default'].fromRange(range);
        return this.fromPositionAnchor(position);
      }
    }, {
      key: 'fromSelector',
      value: function fromSelector(selector) {
        if (selector === undefined) {
          throw new Error('missing required parameter "selector"');
        }
        var exact = selector.exact;
        var prefix = selector.prefix;
        var suffix = selector.suffix;

        return new TextQuoteAnchor(exact, { prefix: prefix, suffix: suffix });
      }
    }, {
      key: 'fromPositionAnchor',
      value: function fromPositionAnchor(anchor) {
        var root = global.document.body;

        var start = anchor.start;
        var end = anchor.end;

        var exact = root.textContent.substr(start, end - start);

        var prefixStart = Math.max(0, start - 32);
        var prefix = root.textContent.substr(prefixStart, start - prefixStart);

        var suffixEnd = Math.min(root.textContent.length, end + 32);
        var suffix = root.textContent.substr(end, suffixEnd - end);

        return new TextQuoteAnchor(exact, { prefix: prefix, suffix: suffix });
      }
    }]);

    return TextQuoteAnchor;
  })();

  module.exports = TextQuoteAnchor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1hbmNob3ItdGV4dC1xdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFLcUIsZUFBZTtBQUN2QixhQURRLGVBQWUsQ0FDdEIsS0FBSyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7NEJBRFosZUFBZTs7QUFFaEMsVUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQ3ZCLGNBQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztPQUN2RDtBQUNELFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM3QixVQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDOUI7O2lCQVJrQixlQUFlOzthQTBDM0IsbUJBQUc7QUFDUixlQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzFDOzs7YUFFUyxzQkFBRztBQUNYLFlBQUksUUFBUSxHQUFHO0FBQ2IsY0FBSSxFQUFFLG1CQUFtQjtBQUN6QixlQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDbEIsQ0FBQztBQUNGLFlBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdELFlBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdELGVBQU8sUUFBUSxDQUFDO09BQ2pCOzs7YUFFZSw0QkFBRztBQUNqQixZQUFJLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUNoQyxZQUFJLEdBQUcsR0FBRyxnQ0FBb0IsQ0FBQzs7QUFFL0IsV0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FB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QUUsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUM7T0FDckQ7OztXQXhDa0IsZUFBZTs7O21CQUFmLGVBQWUiLCJmaWxlIjoiZG9tLWFuY2hvci10ZXh0LXF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmZNYXRjaFBhdGNoIGZyb20gJ2RpZmYtbWF0Y2gtcGF0Y2gnO1xuaW1wb3J0IFRleHRQb3NpdGlvbkFuY2hvciBmcm9tICdkb20tYW5jaG9yLXRleHQtcG9zaXRpb24nXG5pbXBvcnQgc2VlayBmcm9tICdkb20tc2VlaydcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0UXVvdGVBbmNob3Ige1xuICBjb25zdHJ1Y3RvcihleGFjdCwgY29udGV4dCA9IHt9KSB7XG4gICAgaWYgKGV4YWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJleGFjdFwiJyk7XG4gICAgfVxuICAgIHRoaXMuZXhhY3QgPSBleGFjdDtcbiAgICB0aGlzLnByZWZpeCA9IGNvbnRleHQucHJlZml4O1xuICAgIHRoaXMuc3VmZml4ID0gY29udGV4dC5zdWZmaXg7XG4gIH1cblxuICBzdGF0aWMgZnJvbVJhbmdlKHJhbmdlKSB7XG4gICAgaWYgKHJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyYW5nZVwiJyk7XG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gVGV4dFBvc2l0aW9uQW5jaG9yLmZyb21SYW5nZShyYW5nZSk7XG4gICAgcmV0dXJuIHRoaXMuZnJvbVBvc2l0aW9uQW5jaG9yKHBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICBpZiAoc2VsZWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInNlbGVjdG9yXCInKTtcbiAgICB9XG4gICAgbGV0IHtleGFjdCwgcHJlZml4LCBzdWZmaXh9ID0gc2VsZWN0b3I7XG4gICAgcmV0dXJuIG5ldyBUZXh0UXVvdGVBbmNob3IoZXhhY3QsIHtwcmVmaXgsIHN1ZmZpeH0pO1xuICB9XG5cbiAgc3RhdGljIGZyb21Qb3NpdGlvbkFuY2hvcihhbmNob3IpIHtcbiAgICBsZXQgcm9vdCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xuXG4gICAgbGV0IHtzdGFydCwgZW5kfSA9IGFuY2hvcjtcbiAgICBsZXQgZXhhY3QgPSByb290LnRleHRDb250ZW50LnN1YnN0cihzdGFydCwgZW5kIC0gc3RhcnQpO1xuXG4gICAgbGV0IHByZWZpeFN0YXJ0ID0gTWF0aC5tYXgoMCwgc3RhcnQgLSAzMik7XG4gICAgbGV0IHByZWZpeCA9IHJvb3QudGV4dENvbnRlbnQuc3Vic3RyKHByZWZpeFN0YXJ0LCBzdGFydCAtIHByZWZpeFN0YXJ0KTtcblxuICAgIGxldCBzdWZmaXhFbmQgPSBNYXRoLm1pbihyb290LnRleHRDb250ZW50Lmxlbmd0aCwgZW5kICsgMzIpO1xuICAgIGxldCBzdWZmaXggPSByb290LnRleHRDb250ZW50LnN1YnN0cihlbmQsIHN1ZmZpeEVuZCAtIGVuZCk7XG5cbiAgICByZXR1cm4gbmV3IFRleHRRdW90ZUFuY2hvcihleGFjdCwge3ByZWZpeCwgc3VmZml4fSk7XG4gIH1cblxuICB0b1JhbmdlKCkge1xuICAgIHJldHVybiB0aGlzLnRvUG9zaXRpb25BbmNob3IoKS50b1JhbmdlKCk7XG4gIH1cblxuICB0b1NlbGVjdG9yKCkge1xuICAgIGxldCBzZWxlY3RvciA9IHtcbiAgICAgIHR5cGU6ICdUZXh0UXVvdGVTZWxlY3RvcicsXG4gICAgICBleGFjdDogdGhpcy5leGFjdCxcbiAgICB9O1xuICAgIGlmICh0aGlzLnByZWZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5wcmVmaXggPSB0aGlzLnByZWZpeDtcbiAgICBpZiAodGhpcy5zdWZmaXggIT09IHVuZGVmaW5lZCkgc2VsZWN0b3Iuc3VmZml4ID0gdGhpcy5zdWZmaXg7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgdG9Qb3NpdGlvbkFuY2hvcigpIHtcbiAgICBsZXQgcm9vdCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xuICAgIGxldCBkbXAgPSBuZXcgRGlmZk1hdGNoUGF0Y2goKTtcblxuICAgIGRtcC5NYXRjaF9EaXN0YW5jZSA9IHJvb3QudGV4dENvbnRlbnQubGVuZ3RoICogMjtcblxuICAgIGxldCBmb2xkU2xpY2VzID0gKGFjYywgc2xpY2UpID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCBzbGljZSwgYWNjLmxvYyk7XG4gICAgICBpZiAocmVzdWx0ID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgICB9XG4gICAgICBhY2MubG9jID0gcmVzdWx0ICsgc2xpY2UubGVuZ3RoO1xuICAgICAgYWNjLnN0YXJ0ID0gTWF0aC5taW4oYWNjLnN0YXJ0LCByZXN1bHQpO1xuICAgICAgYWNjLmVuZCA9IE1hdGgubWF4KGFjYy5lbmQsIHJlc3VsdCArIHNsaWNlLmxlbmd0aCk7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH07XG5cbiAgICBsZXQgc2xpY2VzID0gdGhpcy5leGFjdC5tYXRjaCgvKC58W1xcclxcbl0pezEsMzJ9L2cpO1xuICAgIGxldCBsb2MgPSByb290LnRleHRDb250ZW50Lmxlbmd0aCAvIDI7XG4gICAgbGV0IHN0YXJ0ID0gLTE7XG4gICAgbGV0IGVuZCA9IC0xO1xuXG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCB0aGlzLnByZWZpeCwgbG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPiAtMSkgbG9jID0gZW5kID0gc3RhcnQgPSByZXN1bHQgKyB0aGlzLnByZWZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID09PSAtMSkge1xuICAgICAgbGV0IGZpcnN0U2xpY2UgPSBzbGljZXMuc2hpZnQoKTtcbiAgICAgIHJlc3VsdCA9IGRtcC5tYXRjaF9tYWluKHJvb3QudGV4dENvbnRlbnQsIGZpcnN0U2xpY2UsIGxvYyk7XG4gICAgICBpZiAocmVzdWx0ID4gLTEpIHtcbiAgICAgICAgc3RhcnQgPSByZXN1bHQ7XG4gICAgICAgIGxvYyA9IGVuZCA9IHN0YXJ0ICsgZmlyc3RTbGljZS5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZG1wLk1hdGNoX0Rpc3RhbmNlID0gNjQ7XG4gICAgbGV0IGFjYyA9IHNsaWNlcy5yZWR1Y2UoZm9sZFNsaWNlcywge1xuICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgZW5kOiBlbmQsXG4gICAgICBsb2M6IGxvYyxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgVGV4dFBvc2l0aW9uQW5jaG9yKGFjYy5zdGFydCwgYWNjLmVuZCk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiLi8ifQ==