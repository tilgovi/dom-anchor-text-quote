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
  });

  describe('fromSelector', () => {
    it('requires a selector argument', () => {
      let construct = () => TextQuoteAnchor.fromSelector();
      assert.throws(construct, 'required parameter');
    });
  });

  describe('toRange', () => {
  });

  describe('toSelector', () => {
  });
});
