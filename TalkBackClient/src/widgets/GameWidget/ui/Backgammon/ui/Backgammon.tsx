import { Board } from "@/features/Backgammon";
import cls from "./Backgammon.module.scss";
import { cx } from "@/shared/lib/cx";

export const Backgammon = ({ className }: { className?: string }) => {
  return (
    <div className={cx(cls.Backgammon, {}, [className])}>
      <Board />
    </div>
  );
};
