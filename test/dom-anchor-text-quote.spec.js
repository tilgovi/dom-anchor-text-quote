import TextQuoteAnchor from '../dom-anchor-text-quote'

describe('TextQuoteAnchor', () => {
  before(() => {
    fixture.setBase('test/fixtures');
  });

  beforeEach(() => {
    fixture.load('test.html');
  });

  afterEach(() => {
    fixture.cleanup();
  });

  describe('constructor', () => {
    it('is a function', () => {
      assert.isFunction(TextQuoteAnchor);
    });

    it('requires an exact argument', () => {
      let construct = () => new TextQuoteAnchor();
      assert.throws(construct, 'required parameter');
    });

    it('stores the exact quote', () => {
      let anchor = new TextQuoteAnchor('try heroic couplets');
      assert.equal(anchor.exact, 'try heroic couplets');
    });

    it('accepts an optional context argument with prefix and suffix', () => {
      let exact = 'They\'re, so to speak, semantic.';
      let prefix = 'The urgencies are not policital or racial or social. ';
      let suffix = ' Only the poetical enquiry can discovery what language ' +
          'really is';
      let context = {
        prefix: prefix,
        suffix: suffix,
      };
      let anchor = new TextQuoteAnchor(exact, context);
      assert.equal(anchor.exact, exact);
      assert.equal(anchor.prefix, prefix);
      assert.equal(anchor.suffix, suffix);
    });
  });

  describe('fromRange', () => {
    it('requires a range argument', () => {
      let construct = () => TextQuoteAnchor.fromRange();
      assert.throws(construct, 'required parameter');
    });

    it('returns a TextQuoteAnchor with context', () => {
      let range = global.document.createRange();
      let node = global.document.getElementsByTagName('code')[0];
      range.selectNodeContents(node);
      let anchor = TextQuoteAnchor.fromRange(range);
      assert.instanceOf(anchor, TextQuoteAnchor);
      assert.equal(anchor.exact, 'commodo vitae');
    });
  });

  describe('fromSelector', () => {
    it('requires a selector argument', () => {
      let construct = () => TextQuoteAnchor.fromSelector();
      assert.throws(construct, 'required parameter');
    });

    it('returns a TextQuoteAnchor from a selector with exact quote', () => {
      let selector = {
        exact: 'You can\'t split life into diachronic segments.',
      };
      let anchor = TextQuoteAnchor.fromSelector(selector);
      assert.instanceOf(anchor, TextQuoteAnchor);
      assert.equal(anchor.exact, selector.exact);
    });

    it('returns a TextQuoteAnchor from a selector with context', () => {
      let selector = {
        exact: 'Friday the twenty-sixth.',
        prefix: 'Today was what? ',
        suffix: 'There would be a salary cheque for him on Monday.',
      };
      let anchor = TextQuoteAnchor.fromSelector(selector);
      assert.instanceOf(anchor, TextQuoteAnchor);
      assert.equal(anchor.exact, selector.exact);
      assert.equal(anchor.prefix, selector.prefix);
      assert.equal(anchor.suffix, selector.suffix);
    });
  });

  describe('toRange', () => {
    it('finds an exact quote', () => {
      let anchor = new TextQuoteAnchor('commodo vitae');
      let range = anchor.toRange();
      let text = range.toString();
      assert.equal(text, 'commodo vitae');
    });

    it('finds an exact quote longer than 32 characters', () => {
      let expected = 'Quisque sit amet est et sapien ullamcorper pharetra';
      let anchor = new TextQuoteAnchor(expected);
      let range = anchor.toRange();
      let text = range.toString();
      assert.equal(text, expected);
    });

    it('finds a close exact quote', () => {
      let anchor = new TextQuoteAnchor('commodo cites');
      let range = anchor.toRange();
      let text = range.toString();
      assert.equal(text, 'commodo vitae');
    });

    it('finds a context quote', () => {
      let exact = 'commodo vitae';
      let prefix = 'condimentum sed, ';
      let suffix = ', ornare sit amet';
      let context = {prefix, suffix};
      let anchor = new TextQuoteAnchor(exact, context);
      let range = anchor.toRange();
      let text = range.toString();
      assert.equal(text, 'commodo vitae');
    });

    it('finds a close context quote', () => {
      let exact = 'commodo cites';
      let prefix = 'condimentum sed, ';
      let suffix = ', ornare sit amet';
      let context = {prefix, suffix};
      let anchor = new TextQuoteAnchor(exact, context);
      let range = anchor.toRange();
      let text = range.toString();
      assert.equal(text, 'commodo vitae');
    });

    it('disambiguates using the context', () => {
      let exact = 'on';
      let prefix = 'Donec n';
      let suffix = ' enim';
      let context = {prefix, suffix};
      let anchor = new TextQuoteAnchor(exact, context);
      let range = anchor.toRange();
      let text = range.toString();
      let textNode = range.commonAncestorContainer;
      let anchorNode = textNode.parentNode;
      assert.equal(text, 'on');
      assert.equal(anchorNode.tagName, 'A');
    });

    it('succeeds with the best match even if the context fails', () => {
      let exact = 'commodo vitae';
      let context = {
        prefix: 'bogomips',
        suffix: 'bogomips',
      };
      let anchor = new TextQuoteAnchor(exact, context);
      let range = anchor.toRange();
    });

    it('throws an error when the quote is not found', () => {
      let exact = 'bogus';
      let anchor = new TextQuoteAnchor(exact);
      let attempt = () => anchor.toRange();
      assert.throws(attempt, 'no match found');
    });

    it('throws an error when a long quote is not found', () => {
      let expected = 'Quisque sit amet est et sapien ullam triceracorn';
      let anchor = new TextQuoteAnchor(expected);
      let attempt = () => anchor.toRange();
      assert.throws(attempt, 'no match found');
    });
  });

  describe('toSelector', () => {
    it('returns a selector for the stored exact quote', () => {
      let anchor = new TextQuoteAnchor('a');
      let selector = anchor.toSelector();
      assert.equal(selector.type, 'TextQuoteSelector');
      assert.equal(selector.exact, 'a');
    });

    it('returns a selector for the stored context quote', () => {
      let anchor = new TextQuoteAnchor('a', {prefix: 'b', suffix: 'c'});
      let selector = anchor.toSelector();
      assert.equal(selector.type, 'TextQuoteSelector');
      assert.equal(selector.exact, 'a');
      assert.equal(selector.prefix, 'b');
      assert.equal(selector.suffix, 'c');
    });
  });
});
