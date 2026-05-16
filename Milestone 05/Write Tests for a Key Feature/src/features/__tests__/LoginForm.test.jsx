import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { loginUser } from '../../api/auth';

jest.mock('../../api/auth', () => ({
  loginUser: jest.fn()
}));

const renderLoginForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

const createDeferred = () => {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('happy path', () => {
    // Protects against input wiring regressions that make the form unusable.
    it('should render the email input, password input, and submit button', () => {
      renderLoginForm();

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    // Protects against refactors that submit stale or malformed credentials to the API.
    it('should call the API with the typed email and password on submit', async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({
        user: { email: 'alex@example.com' }
      });

      renderLoginForm();

      await user.type(screen.getByLabelText('Email'), 'alex@example.com');
      await user.type(screen.getByLabelText('Password'), 's3cret-pass');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith({
          email: 'alex@example.com',
          password: 's3cret-pass'
        });
      });
    });
  });

  describe('failure cases', () => {
    // Protects against silent authentication failures by surfacing backend error copy to the user.
    it('should show the error message when the API rejects', async () => {
      const user = userEvent.setup();
      loginUser.mockRejectedValue(new Error('Invalid credentials'));

      renderLoginForm();

      await user.type(screen.getByLabelText('Email'), 'alex@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong-pass');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeVisible();
      });
    });

    // Protects against duplicate submissions by verifying the pending UI state appears immediately.
    it('should disable the submit button and show a loading state while the API is pending', async () => {
      const user = userEvent.setup();
      const deferred = createDeferred();
      loginUser.mockReturnValue(deferred.promise);

      renderLoginForm();

      await user.type(screen.getByLabelText('Email'), 'alex@example.com');
      await user.type(screen.getByLabelText('Password'), 'slow-pass');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();

      deferred.resolve({ user: { email: 'alex@example.com' } });
      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('edge cases', () => {
    // Protects against empty form submissions reaching the API when client validation is bypassed.
    it('should not call the API when submit is clicked with empty fields', async () => {
      const user = userEvent.setup();

      renderLoginForm();

      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(loginUser).not.toHaveBeenCalled();
    });
  });
});
