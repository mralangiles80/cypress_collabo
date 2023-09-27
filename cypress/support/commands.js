Cypress.Commands.add('dumpLog', (outputMessage, outputLog) => {
  cy.task("log", `\n${outputMessage}:\n\n${JSON.stringify(outputLog)}`);
 })