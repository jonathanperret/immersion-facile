import React from "react";
import "./MainWrapper.scss";

type MainWrapperProps = {
  vSpacing?: number;
  hSpacing?: number;
  children: React.ReactNode;
  className?: string;
  layout: "default" | "boxed" | "fullscreen";
  useBackground?: boolean;
};

export const MainWrapper = ({
  vSpacing = 8,
  hSpacing = 0,
  className,
  children,
  layout,
  useBackground,
}: MainWrapperProps) => {
  const spacing = `${vSpacing ? `fr-py-${vSpacing}w` : ""} ${
    hSpacing ? `fr-px-${hSpacing}w` : ""
  }`;
  let classNameValue = `im-main-wrapper ${className} ${spacing}`;
  if (layout !== "fullscreen") {
    classNameValue += "fr-container fr-grid--center";
  }
  return (
    <main className={classNameValue} id="main-content">
      {layout === "boxed" && (
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-lg-7 fr-px-2w">{children}</div>
        </div>
      )}
      {layout !== "boxed" && children}
      {useBackground && (
        <div className={"im-main-wrapper__custom-background"}></div>
      )}
    </main>
  );
};
