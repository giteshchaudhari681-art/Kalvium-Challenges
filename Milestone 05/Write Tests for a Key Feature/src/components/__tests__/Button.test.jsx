import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  describe('happy path', () => {
    // Protects against regressions where the button stops exposing the user-facing label.
    it('should render the label text from props', () => {
      render(<Button label="Place order" />);

      expect(screen.getByRole('button', { name: 'Place order' })).toBeInTheDocument();
    });

    // Protects against refactors that disconnect the visible button from its click handler.
    it('should call onClick exactly once when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button label="Place order" onClick={handleClick} />);

      await user.click(screen.getByRole('button', { name: 'Place order' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure cases', () => {
    // Protects against duplicate submissions by ensuring the loading state disables interaction.
    it('should show the loading label and stay disabled while loading', () => {
      render(<Button label="Place order" loading />);

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    // Protects against disabled controls still firing actions during UI state changes.
    it('should stay disabled and not call onClick when disabled is true', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button label="Place order" onClick={handleClick} disabled />);

      const button = screen.getByRole('button', { name: 'Place order' });
      await user.click(button);

      expect(button).toBeDisabled();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
