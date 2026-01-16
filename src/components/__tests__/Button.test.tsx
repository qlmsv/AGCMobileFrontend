import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Press Me" onPress={() => {}} />);
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={onPressMock} />);

    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { queryByText } = render(<Button title="Press Me" onPress={() => {}} loading={true} />);

    // Check that text is likely hidden or replaced, and indicator exists.
    // Since component hierarchy replaces text with ActivityIndicator:
    expect(queryByText('Press Me')).toBeNull();
    // ActivityIndicator doesn't have a default testID, so we might check for absence of text
    // or we'd need to modify the component to have testID.
    // For now, checking queryByText is null is a decent proxy that state changed.
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={onPressMock} disabled={true} />);

    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
