// 缺数据的需求：状态与算法，不取数、不渲染。

// 列表里显示的市场：没认出市场的（专家交回说没入库）不猜
export function marketLabel(market: string | null) {
  return market ? market.toUpperCase() : ''
}
