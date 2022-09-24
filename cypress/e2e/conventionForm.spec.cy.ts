describe("Form filling only with required informations", () => {
  it("can submit form with basic infos", () => {
    cy.visit("/demande-immersion");
    cy.contains("Ouvrir le formulaire").click();
    cy.get("#postalCode").clear().type("86000");
    cy.wait(200);
    fillSelectRandomly({ element: "#agencyId" });
    cy.get("#signatories_beneficiary_firstName").clear().type("Archibald");
    cy.get("#signatories_beneficiary_lastName").clear().type("Haddock");
    cy.get("#signatories_beneficiary_email")
      .clear()
      .type("ahaddock@moulinsart.be");
    cy.get("#siret").clear().type("01234567890123");
    cy.get("body").then(($body) => {
      if ($body.find("#businessName:not([disabled])").length) {
        cy.get("#businessName:not([disabled])").type("Entreprise de test");
      }
    });
    cy.get("#signatories_mentor_firstName").clear().type("Jean");
    cy.get("#signatories_mentor_lastName").clear().type("Bono");
    cy.get("#signatories_mentor_job").clear().type("Développeur web");
    cy.get("#signatories_mentor_phone").clear().type("0836656565");
    cy.get("#signatories_mentor_email").clear().type("mentor@example.com");
    cy.get("[name='dateStart']").clear().type("2022-09-22");
    cy.get("[name='dateEnd']").clear().type("2022-10-22");
    cy.get("#mui-5").clear().type("71 Bd Saint-Michel 75005 Paris").blur(); // AddressAutocomplete
    cy.get("[value='Confirmer un projet professionnel']").check();
    cy.get("#mui-6").type("Boulangerie").blur(); // AddressAutocomplete
    cy.get("#immersionActivities").clear().type("Regarder le pain");
  });
  // it("can't submit form if immersion duration exceeds 1 month", () => {});
  // it("can submit form with a complex schedule", () => {});
  // it("can edit multiple jobs dropdown", () => {});
  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const fillSelectRandomly = ({ element }: { element: string }) => {
    const selector = element;
    const selectorOptions = `${selector} > option`;
    cy.get(selectorOptions).then(($options) => {
      cy.get(selectorOptions)
        .eq(randomNumber(1, $options.length - 1))
        .then(($select) => {
          const label = $select.text();
          cy.get(selector).select(label);
        });
    });
  };
});
