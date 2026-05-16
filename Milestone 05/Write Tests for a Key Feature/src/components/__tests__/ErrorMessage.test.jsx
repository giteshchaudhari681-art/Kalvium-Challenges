import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  describe('happy path', () => {
    // Protects against error copy disappearing from the UI during styling refactors.
    it('should render the message text', () => {
      render(<ErrorMessage message="Login failed" />);

      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });

    // Protects against broken recovery flows when the retry action is available.
    it('should render a retry button and call onRetry when clicked', async () => {
      const user = userEvent.setup();
      const handleRetry = jest.fn();

      render(<ErrorMessage message="Orders failed to load" onRetry={handleRetry} />);

      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure cases', () => {
    // Protects against showing an unusable retry action when no recovery callback exists.
    it('should not render a retry button when onRetry is not provided', () => {
      render(<ErrorMessage message="Orders failed to load" />);

      expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    // Protects against user confusion by keeping the base error message visible even without retry support.
    it('should still render the message when retry is unavailable', () => {
      render(<ErrorMessage message="Try again later" />);

      expect(screen.getByText('Try again later')).toBeVisible();
    });
  });
});
