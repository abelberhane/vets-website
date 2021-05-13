import basicUser from './fixtures/users/user-basic.js';

import featureToggles from './fixtures/mocks/feature-toggles.enabled.json';

describe('health care questionnaire -- ', () => {
  beforeEach(() => {
    cy.login(basicUser);
    cy.intercept('GET', '/v0/feature_toggles*', featureToggles);
    cy.window().then(window => {
      const data =
        '{"appointment":{"id":"I2-3PYJBEU2DIBW5RZT2XI3PASYGM7YYRD5TFQCLHQXK6YBXREQK5VQ0005","status":"booked","description":"Scheduled Visit","start":"2020-11-23T08:00:00Z","end":"2021-11-23T08:30:00Z","minutesDuration":30,"created":"2020-11-02","comment":"LS: 8/17/20, PID: 11/18/20","participant":[{"actor":{"reference":"https://sandbox-api.va.gov/services/fhir/v0/r4/Location/I2-3JYDMXC6RXTU4H25KRVXATSEJQ000000","display":"LOM ACC TRAINING CLINIC"},"status":"accepted"},{"actor":{"reference":"https://sandbox-api.va.gov/services/fhir/v0/r4/Patient/1008882029V851792","display":"Mrs. Sheba703 Harris789"},"status":"accepted"}],"resourceType":"Appointment"},"organization":{"id":"I2-AKOTGEFSVKFJOPUKHIVJAH5VQU000000","identifier":[{"system":"http://hl7.org/fhir/sid/us-npi","value":"1205983228"},{"use":"usual","type":{"coding":[{"system":"http://terminology.hl7.org/CodeSystem/v2-0203","code":"FI","display":"Facility ID"}],"text":"Facility ID"},"system":"https://api.va.gov/services/fhir/v0/r4/NamingSystem/va-facility-identifier","value":"vha_442"}],"active":true,"name":"Loma Linda VA Clinic","telecom":[{"system":"phone","value":"800 555-7710"},{"system":"phone","value":"800 555-7720"},{"system":"phone","value":"800-555-7730"}],"address":[{"text":"10 MONROE AVE, SUITE 6B PO BOX 4160 NEW AMSTERDAM OH 44444-4160","line":["10 MONROE AVE, SUITE 6B","PO BOX 4160"],"city":"NEW AMSTERDAM","state":"OH","postalCode":"44444-4160"}],"resourceType":"Organization"},"location":{"id":"I2-3JYDMXC6RXTU4H25KRVXATSEJQ000000","identifier":[{"use":"usual","type":{"coding":[{"system":"http://terminology.hl7.org/CodeSystem/v2-0203","code":"FI","display":"Facility ID"}],"text":"Facility ID"},"system":"https://api.va.gov/services/fhir/v0/r4/NamingSystem/va-facility-identifier","value":"vha_442"},{"system":"https://api.va.gov/services/fhir/v0/r4/NamingSystem/va-clinic-identifier","value":"vha_442_3049"}],"status":"active","name":"LOM ACC TRAINING CLINIC","description":"BLDG 146, RM W02","mode":"instance","type":[{"coding":[{"display":"Primary Care"}],"text":"Primary Care"}],"telecom":[{"system":"phone","value":"254-743-2867 x0002"}],"address":{"text":"1901 VETERANS MEMORIAL DRIVE TEMPLE TEXAS 76504","line":["1901 VETERANS MEMORIAL DRIVE"],"city":"TEMPLE","state":"TEXAS","postalCode":"76504"},"physicalType":{"coding":[{"display":"BLDG 146, RM W02"}],"text":"BLDG 146, RM W02"},"managingOrganization":{"reference":"https://sandbox-api.va.gov/services/fhir/v0/r4/Organization/I2-AKOTGEFSVKFJOPUKHIVJAH5VQU000000","display":"CHEYENNE VA MEDICAL"},"resourceType":"Location"},"questionnaire":[{"id":"7d93011b-29de-492a-b802-f6dc863c5c6b","title":"VA GOV Pre-Visit Agenda Questionnaire","questionnaireResponse":[{"id":"46f3cd5d-4731-4c61-a89d-f5c77a4c6ca1","status":"in-progress","submittedOn":"2021-03-13T14:37:13+00:00"}]}]}';
      window.sessionStorage.setItem(
        'health.care.questionnaire.selectedAppointmentData.I2-3PYJBEU2DIBW5RZT2XI3PASYGM7YYRD5TFQCLHQXK6YBXREQK5VQ0005',
        data,
      );
    });
  });
  it('loads questionnaire but shows expired message', () => {
    cy.visit(
      '/health-care/health-questionnaires/questionnaires/answer-questions?id=I2-3PYJBEU2DIBW5RZT2XI3PASYGM7YYRD5TFQCLHQXK6YBXREQK5VQ0005',
    );
    cy.title().should('contain', 'Questionnaire');
    cy.get('.schemaform-sip-alert-title > strong').contains('has expired');
  });
});
