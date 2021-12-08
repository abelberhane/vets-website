import React from 'react';
import ConfirmablePage from '../ConfirmablePage';

export default function EmergencyContact({
  data = {},
  yesAction = () => {},
  noAction = () => {},
  isLoading,
  Footer,
}) {
  const dataFields = [
    { title: 'Name', key: 'name' },
    { title: 'Relationship', key: 'relationship' },
    { title: 'Address', key: 'address' },
    { title: 'Phone', key: 'phone' },
    { title: 'Work phone', key: 'workPhone' },
  ];
  return (
    <>
      <ConfirmablePage
        header="Is this your current emergency contact?"
        dataFields={dataFields}
        data={data}
        yesAction={yesAction}
        noAction={noAction}
        Footer={Footer}
        isLoading={isLoading}
      />
    </>
  );
}