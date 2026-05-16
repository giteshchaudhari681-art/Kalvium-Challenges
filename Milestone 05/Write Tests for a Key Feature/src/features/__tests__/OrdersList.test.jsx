import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrdersList from '../OrdersList';
import { fetchOrders } from '../../api/orders';

jest.mock('../../api/orders', () => ({
  fetchOrders: jest.fn()
}));

describe('OrdersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('happy path', () => {
    // Protects against list rendering regressions where successful data stops appearing to users.
    it('should render each returned order name', async () => {
      fetchOrders.mockResolvedValue([
        { id: 1, name: 'Starter Pack', date: '2026-05-01', status: 'Delivered' },
        { id: 2, name: 'Refill Box', date: '2026-05-03', status: 'Processing' }
      ]);

      render(<OrdersList />);

      expect(await screen.findByText('Starter Pack')).toBeVisible();
      expect(await screen.findByText('Refill Box')).toBeVisible();
    });

    // Protects against accidental removal of secondary order details from the list item UI.
    it('should render the order status and date for returned orders', async () => {
      fetchOrders.mockResolvedValue([
        { id: 1, name: 'Starter Pack', date: '2026-05-01', status: 'Delivered' }
      ]);

      render(<OrdersList />);

      expect(await screen.findByText('Delivered')).toBeVisible();
      expect(screen.getByText('2026-05-01')).toBeVisible();
    });
  });

  describe('failure cases', () => {
    // Protects against silent fetch failures by keeping the error state visible in the main flow.
    it('should render the error message when the API rejects', async () => {
      fetchOrders.mockRejectedValue(new Error('Network down'));

      render(<OrdersList />);

      expect(await screen.findByText('Something went wrong loading your orders.')).toBeVisible();
    });

    // Protects the retry path so users can recover without reloading the entire page.
    it('should refetch orders when the retry button is clicked after an error', async () => {
      const user = userEvent.setup();
      fetchOrders
        .mockRejectedValueOnce(new Error('Network down'))
        .mockResolvedValueOnce([
          { id: 1, name: 'Starter Pack', date: '2026-05-01', status: 'Delivered' }
        ]);

      render(<OrdersList />);

      await user.click(await screen.findByRole('button', { name: 'Try again' }));

      await waitFor(() => {
        expect(fetchOrders).toHaveBeenCalledTimes(2);
      });
      expect(await screen.findByText('Starter Pack')).toBeVisible();
    });
  });

  describe('edge cases', () => {
    // Protects against empty successful responses rendering a blank screen instead of guidance.
    it('should show the empty state when the API returns no orders', async () => {
      fetchOrders.mockResolvedValue([]);

      render(<OrdersList />);

      expect(await screen.findByText('No orders yet')).toBeVisible();
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
  });
});
