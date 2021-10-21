import React from "react";
import { FormAccordionProps } from "./FormAccordion";

// Component to show the magic links picker
export const FormMagicLinks = ({
  immersionApplication,
}: FormAccordionProps) => {
  const ml = "https://google.com";
  return (
    <>
      <a href={ml}>Admin link</a>
    </>
  );
};
