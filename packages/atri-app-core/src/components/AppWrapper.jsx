import React from "react";

/**
 *
 * @param {{children: import("@types/react").ReactElement}} props
 * @returns {import("@types/react").ReactElement}
 */
export default function AppWrapper(props) {
  return <div>{props.children}</div>;
}