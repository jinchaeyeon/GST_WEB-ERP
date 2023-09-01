import type { FC, ReactNode } from 'react'
import { useDrop } from 'react-dnd'

import type { Layout } from './Layout'
import { Overlay, OverlayType } from './Overlay'
import { Square } from './Square'

export const ItemTypes = {
    KNIGHT: 'knight',
}

export interface BoardSquareProps {
  x: number
  y: number
  children?: ReactNode
  layout: Layout
}

export const LayoutSquare: FC<BoardSquareProps> = ({
  x,
  y,
  children,
  layout,
}: BoardSquareProps) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.KNIGHT,
      drop: () => layout.moveKnight(x, y),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [layout],
  )

  return (
    <div
      ref={drop}
      role="Space"
      data-testid={`(${x},${y})`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <Square>{children}</Square>
      {isOver && <Overlay type={OverlayType.LegalMoveHover} />}
    </div>
  )
}
