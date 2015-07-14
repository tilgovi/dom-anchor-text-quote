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
        var root = this.root;
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
        var loc = root.textContent.length / 2 | 0;
        var start = -1;
        var end = -1;

        if (this.prefix !== undefined) {
          var result = dmp.match_main(root.textContent, this.prefix, loc);
          if (result > -1) loc = end = start = result + this.prefix.length;
        }

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

        var prefixStart = Math.max(0, start - 32);
        var prefix = root.textContent.substr(prefixStart, start - prefixStart);

        var suffixEnd = Math.min(root.textContent.length, end + 32);
        var suffix = root.textContent.substr(end, suffixEnd - end);

        return new TextQuoteAnchor(root, exact, { prefix: prefix, suffix: suffix });
      }
    }]);

    return TextQuoteAnchor;
  })();

  module.exports = TextQuoteAnchor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1hbmNob3ItdGV4dC1xdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFLcUIsZUFBZTtBQUN2QixhQURRLGVBQWUsQ0FDdEIsSUFBSSxFQUFFLEtBQUssRUFBZ0I7VUFBZCxPQUFPLHlEQUFHLEVBQUU7OzRCQURsQixlQUFlOztBQUVoQyxVQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDdEIsY0FBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO09BQ3REO0FBQ0QsVUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQ3ZCLGNBQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztPQUN2RDtBQUNELFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM3QixVQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDOUI7O2lCQVprQixlQUFlOzthQTBDM0IsbUJBQUc7QUFDUixlQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzFDOzs7YUFFUyxzQkFBRztBQUNYLFlBQUksUUFBUSxHQUFHO0FBQ2IsY0FBSSxFQUFFLG1CQUFtQjtBQUN6QixlQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDbEIsQ0FBQztBQUNGLFlBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdELFlBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdELGVBQU8sUUFBUSxDQUFDO09BQ2pCOzs7YUFFZSw0QkFB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TUFBTSxFQUFDLENBQUMsQ0FBQztPQUMzRDs7O1dBeENrQixlQUFlOzs7bUJBQWYsZUFBZSIsImZpbGUiOiJkb20tYW5jaG9yLXRleHQtcXVvdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGlmZk1hdGNoUGF0Y2ggZnJvbSAnZGlmZi1tYXRjaC1wYXRjaCc7XG5pbXBvcnQgVGV4dFBvc2l0aW9uQW5jaG9yIGZyb20gJ2RvbS1hbmNob3ItdGV4dC1wb3NpdGlvbidcbmltcG9ydCBzZWVrIGZyb20gJ2RvbS1zZWVrJ1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRRdW90ZUFuY2hvciB7XG4gIGNvbnN0cnVjdG9yKHJvb3QsIGV4YWN0LCBjb250ZXh0ID0ge30pIHtcbiAgICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicm9vdFwiJyk7XG4gICAgfVxuICAgIGlmIChleGFjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwiZXhhY3RcIicpO1xuICAgIH1cbiAgICB0aGlzLnJvb3QgPSByb290O1xuICAgIHRoaXMuZXhhY3QgPSBleGFjdDtcbiAgICB0aGlzLnByZWZpeCA9IGNvbnRleHQucHJlZml4O1xuICAgIHRoaXMuc3VmZml4ID0gY29udGV4dC5zdWZmaXg7XG4gIH1cblxuICBzdGF0aWMgZnJvbVJhbmdlKHJvb3QsIHJhbmdlKSB7XG4gICAgaWYgKHJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyYW5nZVwiJyk7XG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gVGV4dFBvc2l0aW9uQW5jaG9yLmZyb21SYW5nZShyb290LCByYW5nZSk7XG4gICAgcmV0dXJuIHRoaXMuZnJvbVBvc2l0aW9uQW5jaG9yKHBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tU2VsZWN0b3Iocm9vdCwgc2VsZWN0b3IgPSB7fSkge1xuICAgIHJldHVybiBuZXcgVGV4dFF1b3RlQW5jaG9yKHJvb3QsIHNlbGVjdG9yLmV4YWN0LCBzZWxlY3Rvcik7XG4gIH1cblxuICBzdGF0aWMgZnJvbVBvc2l0aW9uQW5jaG9yKGFuY2hvcikge1xuICAgIGxldCByb290ID0gYW5jaG9yLnJvb3Q7XG5cbiAgICBsZXQge3N0YXJ0LCBlbmR9ID0gYW5jaG9yO1xuICAgIGxldCBleGFjdCA9IHJvb3QudGV4dENvbnRlbnQuc3Vic3RyKHN0YXJ0LCBlbmQgLSBzdGFydCk7XG5cbiAgICBsZXQgcHJlZml4U3RhcnQgPSBNYXRoLm1heCgwLCBzdGFydCAtIDMyKTtcbiAgICBsZXQgcHJlZml4ID0gcm9vdC50ZXh0Q29udGVudC5zdWJzdHIocHJlZml4U3RhcnQsIHN0YXJ0IC0gcHJlZml4U3RhcnQpO1xuXG4gICAgbGV0IHN1ZmZpeEVuZCA9IE1hdGgubWluKHJvb3QudGV4dENvbnRlbnQubGVuZ3RoLCBlbmQgKyAzMik7XG4gICAgbGV0IHN1ZmZpeCA9IHJvb3QudGV4dENvbnRlbnQuc3Vic3RyKGVuZCwgc3VmZml4RW5kIC0gZW5kKTtcblxuICAgIHJldHVybiBuZXcgVGV4dFF1b3RlQW5jaG9yKHJvb3QsIGV4YWN0LCB7cHJlZml4LCBzdWZmaXh9KTtcbiAgfVxuXG4gIHRvUmFuZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9Qb3NpdGlvbkFuY2hvcigpLnRvUmFuZ2UoKTtcbiAgfVxuXG4gIHRvU2VsZWN0b3IoKSB7XG4gICAgbGV0IHNlbGVjdG9yID0ge1xuICAgICAgdHlwZTogJ1RleHRRdW90ZVNlbGVjdG9yJyxcbiAgICAgIGV4YWN0OiB0aGlzLmV4YWN0LFxuICAgIH07XG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHNlbGVjdG9yLnByZWZpeCA9IHRoaXMucHJlZml4O1xuICAgIGlmICh0aGlzLnN1ZmZpeCAhPT0gdW5kZWZpbmVkKSBzZWxlY3Rvci5zdWZmaXggPSB0aGlzLnN1ZmZpeDtcbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cblxuICB0b1Bvc2l0aW9uQW5jaG9yKCkge1xuICAgIGxldCByb290ID0gdGhpcy5yb290O1xuICAgIGxldCBkbXAgPSBuZXcgRGlmZk1hdGNoUGF0Y2goKTtcblxuICAgIGRtcC5NYXRjaF9EaXN0YW5jZSA9IHJvb3QudGV4dENvbnRlbnQubGVuZ3RoICogMjtcblxuICAgIGxldCBmb2xkU2xpY2VzID0gKGFjYywgc2xpY2UpID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCBzbGljZSwgYWNjLmxvYyk7XG4gICAgICBpZiAocmVzdWx0ID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hdGNoIGZvdW5kJyk7XG4gICAgICB9XG4gICAgICBhY2MubG9jID0gcmVzdWx0ICsgc2xpY2UubGVuZ3RoO1xuICAgICAgYWNjLnN0YXJ0ID0gTWF0aC5taW4oYWNjLnN0YXJ0LCByZXN1bHQpO1xuICAgICAgYWNjLmVuZCA9IE1hdGgubWF4KGFjYy5lbmQsIHJlc3VsdCArIHNsaWNlLmxlbmd0aCk7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH07XG5cbiAgICBsZXQgc2xpY2VzID0gdGhpcy5leGFjdC5tYXRjaCgvKC58W1xcclxcbl0pezEsMzJ9L2cpO1xuICAgIGxldCBsb2MgPSAocm9vdC50ZXh0Q29udGVudC5sZW5ndGggLyAyKSB8IDA7XG4gICAgbGV0IHN0YXJ0ID0gLTE7XG4gICAgbGV0IGVuZCA9IC0xO1xuXG4gICAgaWYgKHRoaXMucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCB0aGlzLnByZWZpeCwgbG9jKTtcbiAgICAgIGlmIChyZXN1bHQgPiAtMSkgbG9jID0gZW5kID0gc3RhcnQgPSByZXN1bHQgKyB0aGlzLnByZWZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID09PSAtMSkge1xuICAgICAgbGV0IGZpcnN0U2xpY2UgPSBzbGljZXMuc2hpZnQoKTtcbiAgICAgIGxldCByZXN1bHQgPSBkbXAubWF0Y2hfbWFpbihyb290LnRleHRDb250ZW50LCBmaXJzdFNsaWNlLCBsb2MpO1xuICAgICAgaWYgKHJlc3VsdCA+IC0xKSB7XG4gICAgICAgIHN0YXJ0ID0gcmVzdWx0O1xuICAgICAgICBsb2MgPSBlbmQgPSBzdGFydCArIGZpcnN0U2xpY2UubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyBtYXRjaCBmb3VuZCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRtcC5NYXRjaF9EaXN0YW5jZSA9IDY0O1xuICAgIGxldCBhY2MgPSBzbGljZXMucmVkdWNlKGZvbGRTbGljZXMsIHtcbiAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgIGVuZDogZW5kLFxuICAgICAgbG9jOiBsb2MsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFRleHRQb3NpdGlvbkFuY2hvcihyb290LCBhY2Muc3RhcnQsIGFjYy5lbmQpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii4vIn0=