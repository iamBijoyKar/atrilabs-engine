import React, { forwardRef, useCallback, useMemo } from "react";
import AlertStyles from "./AlertStyles";
import closeIcon from "./close.svg";
import SuccessIcon from "./success.svg";
import InfoIcon from "./info.svg";
import WarningIcon from "./warning.svg";
import ErrorIcon from "./error.svg";

const Alert = forwardRef<
  HTMLDivElement,
  {
    styles: React.CSSProperties;
    custom: {
      alertType: string;
      title: string;
      description?: string;
      successIcon?: string;
      infoIcon?: string;
      warningIcon?: string;
      errorIcon?: string;
      isClosable: boolean;
    };
    onClick: (event: { pageX: number; pageY: number }) => void;
    className?: string;
  }
>((props, ref) => {
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      props.onClick({ pageX: e.pageX, pageY: e.pageY });
    },
    [props]
  );

  const alertStyle = useMemo(() => {
    const alertType = AlertStyles[props.custom.alertType];
    if (alertType === undefined)
      return {
        backgroundColor: AlertStyles["success"].backgroundColor,
        border: `1px solid ${AlertStyles["success"].borderColor}`,
        color: "#000000d9",
      };
    return {
      backgroundColor: alertType.backgroundColor,
      border: `1px solid ${alertType.borderColor}`,
      color: "#000000d9",
    };
  }, [props.custom.alertType]);

  const alertStatusIcon = useMemo(() => {
    const alertType = props.custom.alertType;
    if (alertType === "error") {
      return props.custom.errorIcon || ErrorIcon;
    } else if (alertType === "warning") {
      return props.custom.warningIcon || WarningIcon;
    } else if (alertType === "info") {
      return props.custom.infoIcon || InfoIcon;
    } else {
      return props.custom.successIcon || SuccessIcon;
    }
  }, [
    props.custom.alertType,
    props.custom.errorIcon,
    props.custom.warningIcon,
    props.custom.infoIcon,
    props.custom.successIcon,
  ]);

  return (
    <>
      <style>
        {`#icon {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
          }

          #icon-logo {
            max-width: 1rem;
          }

          #information {
            row-gap: 1rem;
          }

          #information {
            font-size: 1rem;
            font-weight: 700;
          }

          #description {
            font-size: 0.8rem;
            font-weight: 300;
          }

          #close-button {
            border: none;
            background-color: #00000000;
          }
        `}
      </style>
      <div
        ref={ref}
        className={props.className}
        style={{ ...alertStyle, ...props.styles }}
        onClick={onClick}
      >
        <div id="icon">
          <img id="icon-logo" src={alertStatusIcon} alt="Icon for alert" />
        </div>
        <div id="information">
          <div>{props.custom.title}</div>
          <div id="description">{props.custom.description}</div>
        </div>
        {props.custom.isClosable && (
          <button id="close-button">
            <img
              id="close-button"
              src={closeIcon}
              alt="Icon to close the alert"
            />
          </button>
        )}
      </div>
    </>
  );
});

export default Alert;
