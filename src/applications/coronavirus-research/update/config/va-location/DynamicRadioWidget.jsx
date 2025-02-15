import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import environment from 'platform/utilities/environment';
import RadioButtons from '@department-of-veterans-affairs/component-library/RadioButtons';

import { apiRequest } from 'platform/utilities/api';

const apiUrl = `${environment.API_URL}/covid_vaccine/v0/facilities/`;

export function DynamicRadioWidget(props) {
  const { onChange } = props;
  let locationsList = null;
  let upperContent = null;
  const [locations, setLocations] = useState([]);
  const [loading, isLoading] = useState(false); // app starts in a not loading state
  const [error, setError] = useState(false); // app starts with no error
  const [selected, setSelected] = useState(null); // app starts with no selection

  const alertContent = (
    <>
      We’re sorry. We’re having trouble finding medical centers for you to
      choose from right now.
    </>
  );

  useEffect(
    () => {
      // how sure are we that people will always enter 5 digits for their zipcode?
      if (props.zipcode && props.zipcode.length === 5) {
        isLoading(true);
        setSelected(null);
        onChange();
        apiRequest(`${apiUrl}${props.zipcode}`, {})
          .then(resp => {
            setLocations(resp.data);
            isLoading(false);
          })
          .catch(err => {
            isLoading(false);
            setSelected('');
            onChange('');
            setError(true);
            return err;
          });
      }
    },
    [props.zipcode],
  );

  if (props.zipcode === undefined) return null;

  if (loading === true) {
    locationsList = (
      <va-loading-indicator message="Loading VA medical centers" />
    );
  } else if (locations.length > 0 && loading === false) {
    upperContent = (
      <>
        These are the VA medical centers closest to the zipcode you provided.
        Select the medical center you primarly receive care at.
      </>
    );
    const optionsList = locations.map(location => ({
      label: (
        <>
          <p className="vads-u-padding-left--4 vads-u-margin-top--neg3">
            {location.attributes.name}
          </p>
          <p className="vads-u-padding-left--4 vads-u-margin-top--neg2">{`${
            location.attributes.city
          } ${location.attributes.state}`}</p>
        </>
      ),
      value: `${location.attributes.name}|${location.id}`,
    }));

    locationsList = (
      <RadioButtons
        options={optionsList}
        label="Select your medical center"
        required
        value={selected}
        onValueChange={value => {
          onChange(value.value);
          setSelected(value);
        }}
      />
    );
  } else if (
    (locations.length === 0 && loading === false && error === false) ||
    error === true
  ) {
    // there are no locations returned or there is an error
    locationsList = (
      <va-alert status="info">
        <h3 slot="headline">We can't share your closest medical centers</h3>
        <p className="vads-u-font-size--base">{alertContent}</p>
      </va-alert>
    );
  }
  return (
    <>
      {upperContent}
      {locationsList}
    </>
  );
}

function mapStateToProps(state) {
  return {
    zipcode: state.form.data.zipCode,
  };
}

export default connect(
  mapStateToProps,
  null,
)(DynamicRadioWidget);
