import React from 'react';
import { genderLabels } from 'platform/static-data/labels';
import fullSchemaHca from 'vets-json-schema/dist/10-10EZ-schema.json';
import PrefillMessage from 'platform/forms/save-in-progress/PrefillMessage';
import AdditionalInfo from '@department-of-veterans-affairs/component-library/AdditionalInfo';

const { gender } = fullSchemaHca.properties;

const GenderStatusInfo = (
  <>
    <br />
    <AdditionalInfo triggerText="Why we ask for this information">
      <p>
        Population data shows that a person’s sex can affect things like their
        health risks and the way their body responds to medications. Knowing
        your sex assigned at birth, along with other factors, helps your health
        care care team use data to:
      </p>
      <ul>
        <li>Interpret your lab results</li>
        <li>Prescribe the right dose of medications</li>
        <li>Recommend health prevention screenings</li>
      </ul>
      <p>
        We also collect this information to better understand our Veteran
        community. This helps us make sure that we’re serving the needs of all
        Veterans.
      </p>
    </AdditionalInfo>
  </>
);

export default {
  uiSchema: {
    'ui:description': PrefillMessage,
    gender: {
      'ui:title': 'What sex were you assigned at birth?',
      'ui:widget': 'radio',
      'ui:options': {
        labels: genderLabels,
      },
      'ui:description': GenderStatusInfo,
    },
  },
  schema: {
    type: 'object',
    required: ['gender'],
    properties: {
      gender,
    },
  },
};