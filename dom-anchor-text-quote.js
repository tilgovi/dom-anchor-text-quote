import DiffMatchPatch from 'diff-match-patch';
import TextPositionAnchor from 'dom-anchor-text-position'

// The DiffMatchPatch bitap has a hard 32-character pattern length limit.
const CONTEXT_LENGTH = 32;


export default class TextQuoteAnchor {
  constructor(root, exact, context = {}) {
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

  static fromRange(root, range) {
    if (range === undefined) {
      throw new Error('missing required parameter "range"');
    }

    let position = TextPositionAnchor.fromRange(root, range);
    return this.fromPositionAnchor(position);
  }

  static fromSelector(root, selector = {}) {
    return new TextQuoteAnchor(root, selector.exact, selector);
  }

  static fromPositionAnchor(anchor) {
    let root = anchor.root;

    let {start, end} = anchor;
    let exact = root.textContent.substr(start, end - start);

    let prefixStart = Math.max(0, start - CONTEXT_LENGTH);
    let prefix = root.textContent.substr(prefixStart, start - prefixStart);

    let suffixEnd = Math.min(root.textContent.length, end + CONTEXT_LENGTH);
    let suffix = root.textContent.substr(end, suffixEnd - end);

    return new TextQuoteAnchor(root, exact, {prefix, suffix});
  }

  toRange(options) {
    return this.toPositionAnchor(options).toRange();
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

  toPositionAnchor(options = {}) {
    let {hint} = options;
    let root = this.root;
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
    let loc = (hint === undefined) ? ((root.textContent.length / 2) | 0) : hint;
    let start = -1;
    let end = -1;

    if (this.prefix !== undefined) {
      let result = dmp.match_main(root.textContent, this.prefix, loc);
      if (result > -1) loc = end = start = result + this.prefix.length;
    }

    if (start === -1) {
      let firstSlice = slices.shift();
      let result = dmp.match_main(root.textContent, firstSlice, loc);
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

    return new TextPositionAnchor(root, acc.start, acc.end);
  }
}
