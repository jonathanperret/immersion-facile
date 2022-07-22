describe("Check for broken links", () => {
  it(`Check for 404`, () => {
    cy.visit("/");
    const links = cy.get("#footer a, .fr-header a");
    links.each(($link) => {
      const href = $link.attr("href");
      cy.request($link.attr("href")).should((response) => {
        cy.log(`${href}: ${response.status}`);
        expect(response.status).to.not.eq(404);
      });
    });
  });
});
