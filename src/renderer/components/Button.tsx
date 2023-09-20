import { HTMLAttributes, MouseEventHandler, PropsWithChildren, ReactNode } from "react";

import classNames from "classnames";

const exclusiveProps = ["primary", "secondary", "success", "warning", "danger"] as const;

export type ButtonPurposeType = (typeof exclusiveProps)[number];

export type ButtonExclusiveProps = {
    [P in ButtonPurposeType]?: boolean;
};

export interface ButtonNonExclusiveProps {
    outline?: boolean;
    rounded?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export type ButtonPropsType = PropsWithChildren<
    ButtonNonExclusiveProps & ButtonExclusiveProps & HTMLAttributes<HTMLElement>
>;

function checkExclusivity(props: ButtonPropsType): void {
    const specifiedExclusiveProps = Object.keys(props).reduce((acc, propName) => {
        if ((exclusiveProps as readonly string[]).includes(propName)) {
            acc.push(propName);
        }
        return acc;
    }, new Array<string>());

    if (specifiedExclusiveProps.length > 1) {
        console.error(
            `More than one exclusive prop was specified: ${specifiedExclusiveProps.join(", ")} `
        );
    }
}

function Button(props: ButtonPropsType): ReactNode {
    const { children, primary, secondary, success, warning, danger, outline, rounded, ...rest } =
        props;

    checkExclusivity(props);

    const classes = classNames(rest.className, "flex items-center px-3 py-1.5 border", {
        "border-blue-500 bg-blue-500": primary,
        "border-gray-900 bg-gray-900": secondary,
        "border-green-500 bg-green-500": success,
        "border-yellow-400 bg-yellow-400": warning,
        "border-red-500 bg-red-500": danger,
        "rounded-full": rounded,
        "text-white": !outline && (primary || secondary || success || warning || danger),
        "bg-white": outline,
        "text-blue-500": outline && primary,
        "text-gray-900": outline && secondary,
        "text-green-500": outline && success,
        "text-yellow-400": outline && warning,
        "text-red-500": outline && danger,
    });

    return (
        <button {...rest} className={classes}>
            {children}
        </button>
    );
}

export default Button;
