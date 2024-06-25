declare namespace Cypress {
    interface Chainable<Subject = any> {
        myCommand(): Chainable<any>;
    }
}

Cypress.Commands.add('dumpLog' as any, (outputMessage, outputLog) => {
  cy.task("log", `\n${outputMessage}:\n\n${JSON.stringify(outputLog)}`);
 })