import DiffMatchPatch from 'diff-match-patch';
import TextPositionAnchor from 'dom-anchor-text-position'
import seek from 'dom-seek'


export default class TextQuoteAnchor {
  constructor(exact, context = {}) {
    if (exact === undefined) {
      throw new Error('missing required parameter "exact"');
    }
    this.exact = exact;
    this.prefix = context.prefix;
    this.suffix = context.suffix;
  }

  static fromRange(range) {
    if (range === undefined) {
      throw new Error('missing required parameter "range"');
    }

    let position = TextPositionAnchor.fromRange(range);
    return this.fromPositionAnchor(position);
  }

  static fromSelector(selector) {
    if (selector === undefined) {
      throw new Error('missing required parameter "selector"');
    }
    let {exact, prefix, suffix} = selector;
    return new TextQuoteSelector(exact, {prefix, suffix});
  }

  static fromPositionAnchor(anchor) {
    let root = global.document.body;

    let {start, end} = anchor;
    let exact = root.textContent.substr(start, end - start);

    let prefixStart = Math.max(0, start - 32);
    let prefix = root.textContent.substr(prefixStart, start - prefixStart);

    let suffixEnd = Math.min(root.textContent.length, end + 32);
    let suffix = root.textContent.substr(end, suffixEnd - end);

    return new TextQuoteAnchor(exact, {prefix, suffix});
  }

  toRange() {
    return this.toPositionAnchor().toRange();
  }

  toSelector() {
    let selector = {
      type: 'TextQuoteSelector',
      exact: this.exact,
    };
    if (this.prefix !== undefined) selector.prefix = this.prefix;
    if (this.suffix !== undefined) selector.suffix = this.suffix;
    return selector;
  }

  toPositionAnchor() {
    let root = global.document.body;
    let dmp = new DiffMatchPatch();

    dmp.Match_Distance = root.textContent.length * 2;

    let foldSlices = (acc, slice) => {
      let result = dmp.match_main(root.textContent, slice, acc.loc);
      if (result === -1) {
        throw new Error('no match found');
      }
      acc.loc = result + slice.length;
      acc.start = Math.min(acc.start, result);
      acc.end = Math.max(acc.end, result + slice.length);
      return acc;
    };

    let slices = this.exact.match(/(.|[\r\n]){1,32}/g);
    let loc = root.textContent.length / 2;
    let start = -1;
    let end = -1;

    if (this.prefix !== undefined) {
      let result = dmp.match_main(root.textContent, this.prefix, loc);
      if (result > -1) loc = end = start = result + this.prefix.length;
    }

    if (start === -1) {
      let firstSlice = slices.shift();
      result = dmp.match_main(root.textContent, firstSlice, loc);
      if (result > -1) {
        start = result;
        loc = end = start + firstSlice.length;
      } else {
        throw new Error('no match found');
      }
    }

    dmp.Match_Distance = 64;
    let acc = slices.reduce(foldSlices, {
      start: start,
      end: end,
      loc: loc,
    });

    return new TextPositionAnchor(acc.start, acc.end);
  }
}
