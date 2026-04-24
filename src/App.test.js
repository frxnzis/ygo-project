import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the card search interface', () => {
  render(<App />);
  expect(screen.getByAltText(/yu-gi-oh! logo/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/search cards/i)).toBeInTheDocument();
});
