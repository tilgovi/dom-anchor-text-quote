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
