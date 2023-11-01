import type { FC } from "react";

import { KnightRead } from "./KnightRead";

export interface PieceProps {
  isKnight: boolean;
  list: any[];
  info?: any;
}

export const PieceRead: FC<PieceProps> = ({ isKnight, list, info }) =>
  list.length > 0 ? isKnight ? <KnightRead info={info} /> : null : null;
