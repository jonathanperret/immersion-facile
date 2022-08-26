import React from "react";
import classNames from "classnames";
import { HideCallback } from "./Modal";

type ModalCloseProperties = {
  hide: HideCallback;
  title: string;
  children?: JSX.Element;
  className?: string | object | [];
};

export const ModalClose = ({
  hide,
  title,
  children,
  className,
}: ModalCloseProperties) => (
  <button
    className={classNames("fr-link--close fr-link", className)}
    type="button"
    onClick={hide}
    title={title}
    aria-controls="fr-modal"
  >
    {children}
  </button>
);
ModalClose.defaultProps = {
  __TYPE: "ModalClose",
  children: "Fermer",
  title: "Fermer la fenêtre modale",
  className: "",
};