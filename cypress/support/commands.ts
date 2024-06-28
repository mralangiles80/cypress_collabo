declare namespace Cypress {
    interface Chainable<Subject = any> {
        dumpLog(outputMessage: string, outputLog: string): Chainable<Element>;
    }
}

Cypress.Commands.add('dumpLog' as any, (outputMessage, outputLog) => {
  cy.task("log", `\n${outputMessage}:\n\n${JSON.stringify(outputLog)}`);
 })