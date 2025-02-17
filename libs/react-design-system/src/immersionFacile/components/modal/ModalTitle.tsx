import classNames, { ArgumentArray } from "classnames";
import React from "react";

type ModalTitleProperties = {
  children: React.ReactNode;
  className: ArgumentArray;
};

export const ModalTitle = ({ children, className }: ModalTitleProperties) => (
  <h1
    className={classNames("fr-modal__title", className)}
    id="fr-modal-title-modal"
  >
    {children}
  </h1>
);

ModalTitle.defaultProps = {
  __TYPE: "ModalTitle",
  icon: "",
  className: "",
};
