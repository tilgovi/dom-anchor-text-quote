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
      it('requires a range argument', () => {
        let construct = () => new TextQuoteAnchor();
        assert.throws(construct, 'required parameter');
      });
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

    it('constructs an anchor with context', () => {
      let range = global.document.createRange();
      let node = global.document.getElementsByTagName('code')[0];
      range.selectNodeContents(node);
      let anchor = TextQuoteAnchor.fromRange(range);
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
  });

  describe('toSelector', () => {
  });
});
