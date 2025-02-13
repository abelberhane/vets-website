import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SchemaForm from 'platform/forms-system/src/js/components/SchemaForm';
import FormButtons from '../../../components/FormButtons';
import RequestEligibilityMessage from './RequestEligibilityMessage';
import FacilityAddress from '../../../components/FacilityAddress';
import { scrollAndFocus } from '../../../utils/scrollAndFocus';
import {
  routeToNextAppointmentPage,
  routeToPreviousAppointmentPage,
} from '../../redux/actions';

import {
  selectTypeOfCare,
  selectPageChangeInProgress,
  selectChosenFacilityInfo,
  selectEligibility,
} from '../../redux/selectors';
import useClinicFormState from './useClinicFormState';
import { MENTAL_HEALTH, PRIMARY_CARE } from '../../../utils/constants';

function formatTypeOfCare(careLabel) {
  if (careLabel.startsWith('MOVE') || careLabel.startsWith('CPAP')) {
    return careLabel;
  }

  return careLabel.slice(0, 1).toLowerCase() + careLabel.slice(1);
}

function vowelCheck(givenString) {
  return /^[aeiou]$/i.test(givenString.charAt(0));
}

function getPageTitle(schema, typeOfCare, usingPastClinics) {
  const typeOfCareLabel = formatTypeOfCare(typeOfCare.name);
  let pageTitle = 'Choose a VA clinic';
  if (schema?.properties.clinicId.enum.length === 2 && usingPastClinics) {
    pageTitle = `Make ${
      vowelCheck(typeOfCareLabel) ? 'an' : 'a'
    } ${typeOfCareLabel} appointment at your last clinic`;
  }
  return pageTitle;
}

const pageKey = 'clinicChoice';
export default function ClinicChoicePage() {
  const dispatch = useDispatch();
  const history = useHistory();

  const facility = useSelector(selectChosenFacilityInfo);
  const typeOfCare = useSelector(selectTypeOfCare);
  const pageChangeInProgress = useSelector(selectPageChangeInProgress);
  const eligibility = useSelector(selectEligibility);

  const {
    data,
    schema,
    uiSchema,
    setData,
    firstMatchingClinic,
  } = useClinicFormState();

  const typeOfCareLabel = formatTypeOfCare(typeOfCare.name);
  const usingUnsupportedRequestFlow =
    data.clinicId === 'NONE' && !eligibility?.request;
  const usingPastClinics =
    typeOfCare.id !== PRIMARY_CARE && typeOfCare.id !== MENTAL_HEALTH;

  useEffect(() => {
    scrollAndFocus();
    document.title = `${getPageTitle(
      schema,
      typeOfCare,
      usingPastClinics,
    )} | Veterans Affairs`;
  }, []);

  return (
    <div>
      {schema.properties.clinicId.enum.length === 2 && (
        <>
          <h1 className="vads-u-font-size--h2">
            {getPageTitle(schema, typeOfCare)}
          </h1>
          {usingPastClinics && (
            <>Your last {typeOfCareLabel} appointment was at </>
          )}
          {!usingPastClinics && (
            <>{typeOfCare.name} appointments are available at </>
          )}
          {firstMatchingClinic.serviceName}:
          <p>
            <FacilityAddress
              name={facility.name}
              facility={facility}
              level={2}
            />
          </p>
        </>
      )}
      {schema.properties.clinicId.enum.length > 2 && (
        <>
          <h1 className="vads-u-font-size--h2">
            {getPageTitle(schema, typeOfCare)}
          </h1>
          {usingPastClinics && (
            <p>
              In the last 24 months you’ve had{' '}
              {vowelCheck(typeOfCareLabel) ? 'an' : 'a'} {typeOfCareLabel}{' '}
              appointment at the following {facility.name} clinics:
            </p>
          )}
          {!usingPastClinics && (
            <p>
              {typeOfCare.name} appointments are available at the following{' '}
              {facility.name} clinics:
            </p>
          )}
        </>
      )}
      <SchemaForm
        name="Clinic choice"
        title="Clinic choice"
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={() =>
          dispatch(routeToNextAppointmentPage(history, pageKey, data))
        }
        onChange={newData => setData(newData)}
        data={data}
      >
        {usingUnsupportedRequestFlow && (
          <div className="vads-u-margin-top--2">
            <RequestEligibilityMessage
              eligibility={eligibility}
              typeOfCare={typeOfCare}
              facilityDetails={facility}
              typeOfCareName={typeOfCareLabel}
            />
          </div>
        )}
        <FormButtons
          onBack={() =>
            dispatch(routeToPreviousAppointmentPage(history, pageKey, data))
          }
          disabled={usingUnsupportedRequestFlow}
          pageChangeInProgress={pageChangeInProgress}
          loadingText="Page change in progress"
        />
      </SchemaForm>
    </div>
  );
}
