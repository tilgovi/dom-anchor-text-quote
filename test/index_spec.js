import {fromRange, toRange} from '../src'
import {fromTextPosition, toTextPosition} from '../src'

describe('textQuote', () => {
  before(() => {
    fixture.setBase('test/fixtures')
  })

  beforeEach(() => {
    fixture.load('test.html')
  })

  afterEach(() => {
    fixture.cleanup()
  })

  describe('fromRange', () => {
    it('requires a root argument', () => {
      let construct = () => fromRange()
      assert.throws(construct, 'required parameter')
    })

    it('requires a range argument', () => {
      let construct = () => fromRange(fixture.el)
      assert.throws(construct, 'required parameter')
    })

    it('returns a text quote selector with context', () => {
      let root = fixture.el
      let range = document.createRange()
      let node = root.querySelector('code')
      range.selectNodeContents(node)
      let selector = fromRange(root, range)
      assert.equal(selector.exact, 'commodo vitae')
      assert.equal(selector.prefix, 'm erat\n  wisi, condimentum sed, ')
      assert.equal(selector.suffix, ', ornare sit amet,\n  wisi. Aenea')
    })
  })

  describe('fromTextPosition', () => {
    it('requires a root argument', () => {
      let construct = () => fromTextPosition()
      assert.throws(construct, 'required parameter')
    })

    it('requires a selector argument', () => {
      let construct = () => fromTextPosition(fixture.el)
      assert.throws(construct, 'required parameter')
    })

    it('requires a start position', () => {
      let construct = () => fromTextPosition(fixture.el, {start: 5})
      assert.throws(construct, 'required property')
    })

    it('requires a non-negative start position', () => {
      let construct = () => fromTextPosition(fixture.el, {start: -1})
      assert.throws(construct, 'non-negative')
    })

    it('requires an end position', () => {
      let construct = () => fromTextPosition(fixture.el, {end: 5})
      assert.throws(construct, 'required property')
    })

    it('requires a non-negative end position', () => {
      let construct = () => fromTextPosition(fixture.el, {start: 0, end: -1})
      assert.throws(construct, 'non-negative')
    })
  })

  describe('toRange', () => {
    it('requires a root argument', () => {
      let construct = () => toRange()
      assert.throws(construct, 'required parameter')
    })

    it('requires a selector argument', () => {
      let construct = () => toRange(fixture.el)
      assert.throws(construct, 'required parameter')
    })

    it('requires an exact argument', () => {
      let construct = () => toRange(fixture.el, {})
      assert.throws(construct, 'required property')
    })

    it('finds an exact quote', () => {
      let range = toRange(fixture.el, {exact: 'commodo vitae'})
      let text = range.toString()
      assert.equal(text, 'commodo vitae')
    })

    it('finds an exact quote longer than 32 characters', () => {
      let exact = 'Quisque sit amet est et sapien ullamcorper pharetra'
      let range = toRange(fixture.el, {exact})
      let text = range.toString()
      assert.equal(text, exact)
    })

    it('finds a close exact quote', () => {
      let exact = 'commodo cites'
      let range = toRange(fixture.el, {exact})
      let text = range.toString()
      assert.equal(text, 'commodo vitae')
    })

    it('finds a n exact quote using context', () => {
      let exact = 'commodo vitae'
      let prefix = 'condimentum sed, '
      let suffix = ', ornare sit amet'
      let range = toRange(fixture.el, {exact, prefix, suffix})
      let text = range.toString()
      assert.equal(text, exact)
    })

    it('finds a close quote using context', () => {
      let exact = 'commodo cites'
      let prefix = 'condimentum sed, '
      let suffix = ', ornare sit amet'
      let range = toRange(fixture.el, {exact, prefix, suffix})
      let text = range.toString()
      assert.equal(text, 'commodo vitae')
    })

    it('can disambiguate using the prefix', () => {
      let exact = 'on'
      let prefix = 'Donec n'
      let range = toRange(fixture.el, {exact, prefix})
      let text = range.toString()
      let textNode = range.commonAncestorContainer
      let anchorNode = textNode.parentNode
      assert.equal(text, 'on')
      assert.equal(anchorNode.tagName, 'A')
    })

    it('can disambiguate using the suffix', () => {
      let exact = 'on'
      let suffix = ' enim in'
      let range = toRange(fixture.el, {exact, suffix})
      let text = range.toString()
      let textNode = range.commonAncestorContainer
      let anchorNode = textNode.parentNode
      assert.equal(text, 'on')
      assert.equal(anchorNode.tagName, 'A')
    })

    it('succeeds with the best match even if the context fails', () => {
      let exact = 'commodo vitae'
      let prefix = 'bogomips'
      let suffix = 'bogomips'
      let range = toRange(fixture.el, {exact, prefix, suffix})
      let text = range.toString()
      assert.equal(text, 'commodo vitae')
    })

    it('returns null when the quote is not found', () => {
      let exact = 'bogus'
      let range = toRange(fixture.el, {exact})
      assert.isNull(range)
    })

    it('throws an error when a long quote is not found', () => {
      let exact = 'Quisque sit amet est et sapien ullam triceracorn'
      let range = toRange(fixture.el, {exact})
      assert.isNull(range)
    })

    it('uses a hint option to prioritize matches', () => {
      let exact = 'Aenean'
      let first = fixture.el.textContent.indexOf('Aenean')
      let last = fixture.el.textContent.lastIndexOf('Aenean')
      let rangeFirst = toRange(fixture.el, {exact}, {hint: first})
      let rangeLast = toRange(fixture.el, {exact}, {hint: last})
      assert.notEqual(rangeFirst.startContainer, rangeLast.startContainer)
    })
  })
})
