import {fromRange, toRange} from '../src'
import {fromTextPosition, toTextPosition} from '../src'

describe('bug', () => {
  before(() => {
    fixture.setBase('test/fixtures')
  })

  beforeEach(() => {
    fixture.load('bug.html')
  })

  afterEach(() => {
    fixture.cleanup()
  })

  it('should anchor this quote correctly', () => {
    let range = toRange(fixture.el, {"exact":"“A really important tree is about to hit the ground,” Mayor Bloomberg declared in St. Nicholas Park on Tuesday morning, before he lifted a shovel and planted an 11-year-old pin oak on a patch of lawn. He was helped by Representative Charles B. Rangel and other elected officials, as well as Carmelo Anthony, the Brooklyn-born basketball star with the Knicks.\n    ","prefix":"wn yards through tree giveaways.","suffix":"Photo\n    \n            \n\n\n      "})
    let text = range.toString()
    assert.equal(range.toString(), "“A really important tree is about to hit the ground,” Mayor Bloomberg declared in St. Nicholas Park on Tuesday morning, before he lifted a shovel and planted an 11-year-old pin oak on a patch of lawn. He was helped by Representative Charles B. Rangel and other elected officials, as well as Carmelo Anthony, the Brooklyn-born basketball star with the Knicks.\n\n")
  })
})
