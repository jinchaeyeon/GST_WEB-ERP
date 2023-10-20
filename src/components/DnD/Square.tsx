import type { FC, ReactNode } from 'react'

export interface SquareProps {
  children?: ReactNode
}

const squareStyle = {
  width: '100%',
  height: '100%',
}

export const Square: FC<SquareProps> = ({ children }) => {
  const backgroundColor = 'white';
  const color = 'black'
  return (
    <div
      style={{
        ...squareStyle,
        color,
        backgroundColor,
        border: "1px solid grey"
      }}
    >
      {children}
    </div>
  )
}
