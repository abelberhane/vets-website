import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'chai';

import DocumentUploader from '../../components/DocumentUploader';

describe('DocumentUploader', () => {
  it('should render with the expected fields', () => {
    const screen = render(<DocumentUploader />);
    expect(screen.getByRole('button', { name: /Upload your document/i })).to
      .exist;
    expect(screen.getAllByRole('combobox').length).to.equal(1);
  });

  it('should conditionally display a text field', () => {
    const screen = render(<DocumentUploader />);
    expect(screen.getAllByRole('combobox').length).to.equal(1);
    userEvent.selectOptions(screen.getByRole('combobox'), ['Other']);
    expect(screen.getByRole('option', { name: 'Other' }).selected).to.be.true;
    expect(screen.getByLabelText(/Document description/i)).to.exist;
  });

  it('should display an error message for invalid file type upload', () => {
    const file = new File(['hello'], 'hello.tif', { type: 'image/tif' });
    const screen = render(<DocumentUploader />);
    const input = screen.getByLabelText(/Upload your document/i);
    userEvent.upload(input, file);
    expect(screen.getByText(/accepted file types/i)).to.exist;
  });

  it('should not submit with no documents', () => {
    const screen = render(<DocumentUploader />);
    userEvent.selectOptions(screen.getByRole('combobox'), [
      'Discharge or separation papers (DD214)',
    ]);
    userEvent.click(screen.getByRole('button', { name: /Submit files/ }));
    expect(screen.getByText(/Please choose a file to upload/i)).to.exist;
  });

  it('should uploaded file', () => {
    const file = new File(['hello'], 'hello.png', {
      type: 'image/png',
    });
    const screen = render(<DocumentUploader />);
    const input = screen.getByLabelText(/Upload your document/i);
    expect(input).to.exist;
    userEvent.selectOptions(screen.getByRole('combobox'), [
      'Discharge or separation papers (DD214)',
    ]);
    userEvent.upload(input, file);
    expect(input.files[0]).to.equal(file);
    expect(input.files.item(0)).to.equal(file);
    expect(input.files).to.have.lengthOf(1);
  });

  it('should upload multiple files', () => {
    const file1 = new File(['hello'], 'hello.png', { type: 'image/png' });
    const file2 = new File(['there'], 'there.png', { type: 'image/png' });
    const screen = render(<DocumentUploader />);
    const input = screen.getByLabelText(/Upload your document/i);
    expect(input).to.exist;
    userEvent.selectOptions(screen.getByRole('combobox'), [
      'Discharge or separation papers (DD214)',
    ]);
    userEvent.upload(input, file1);
    userEvent.upload(input, file2);
    expect(input.files[0]).to.equal(file2);
    expect(input.files.item(0)).to.equal(file2);
    expect(input.files).to.have.lengthOf(1);
  });
  /* commenting out till next sprint
  it('should delete an uploaded file', () => {
    const file = [new File(['hello'], 'hello.png', { type: 'image/png' })];
    const screen = render(<DocumentUploader />);
    userEvent.selectOptions(screen.getByRole('combobox'), [
      'Discharge or separation papers (DD214)',
    ]);
    const input = screen.getByLabelText(/Upload your document/i);

    userEvent.upload(input, file);

    expect(input.files[0]).equal(file);
    expect(screen.getByText('hello.png')).to.exist;

    const deleteBtn = screen.getAllByText(/Delete file/i)[1];
    userEvent.click(deleteBtn);
    expect(screen.getAllByText(/Delete file/i)).to.have.lengthOf(0);
    expect(screen.getByText('hello.png')).to.exist;
    expect(screen.getByText('kenobi.png')).to.exist;
    expect(screen.queryByText('there.png')).to.not.exist;
  });
  */
});
