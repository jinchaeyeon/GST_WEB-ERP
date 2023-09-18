import type { FC } from 'react'

import { Knight } from './Knight'
import type { Layout } from './Layout'

export interface PieceProps {
  isKnight: boolean
  layout: Layout;
  x: number;
  y: number;
  list: any[];
  info?: any;
}

export const Piece: FC<PieceProps> = ({ isKnight, x, y, layout, list, info }) =>
  list.length > 0 ? isKnight ? <Knight x={x} y={y} layout={layout} list={list} info={info}/> : null : null
