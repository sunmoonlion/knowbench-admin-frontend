import { describe, expect, it } from 'vitest'

import { marketLabel } from '@/features/demand/model/demand'

describe('缺数据的需求', () => {
  it('市场只在认出来时显示', () => {
    expect(marketLabel('sh')).toBe('SH')
    expect(marketLabel(null)).toBe('')
  })
})
