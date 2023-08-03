import { ReactElement } from "react";

interface ButtonProps {
  className: string;
  onClick: () => void;
  children: string | ReactElement;
}

const Button = ({className, onClick, children} : ButtonProps) => {
  return (
    <div>
      <button className={className} onClick={onClick}>{children}</button>
    </div>
  );
};

export default Button;
